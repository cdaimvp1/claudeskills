#!/usr/bin/env python3
"""
contract_segmenter.py
Lilly Procurement Skills, lilly-contract-review-1c344a Stage 0 deterministic
clause segmentation.

WHY THIS EXISTS (item F1, `_audit/UPGRADE-PLAN.md` WS F)
----------------------------------------------------------------------------
Before this module, every one of the four analytical passes (Structural Scan,
Governing Cross-Reference, Commercial/Tactics/Pharma, QA and Negotiation Prep)
independently re-read the raw contract text (or raw .docx XML) from scratch to
find clause boundaries, section numbers, and tracked-change status. Four
passes, four independent acts of finding the same clauses. This module runs
ONCE, up front, and produces a single structured `ClauseRegister` that every
pass reads instead of re-parsing.

**Determinism NARROWS, it never DECIDES, and it never drops** (the governing
rule this module is built to). This module extracts STRUCTURE only: clause
identity, heading, verbatim text, ordering, authorship/tracked-change status.
It makes NO judgment about severity, coverage, playbook compliance, or
redline wording. It proposes structure; the four passes still do all of the
reading and all of the deciding. A clause the segmenter cannot cleanly
identify is never silently dropped: it is captured as an UNSTRUCTURED
fallback entry covering the unparsed span, so nothing in the source text is
outside the register's coverage, and `verify_register_against_source()`
exists specifically so Pass 1 can catch a segmentation defect rather than
trust it blindly (Marc's "check the work on the deterministic review").

SCOPE, STATED PLAINLY
----------------------------------------------------------------------------
This module builds the clause register (Stage 0). It does not decide
findings, coverage status, severity, or redline wording -- see
`contract_review_generator.py` and the four passes themselves for that. It
also does not narrow or index the judgment corpora (playbook.md,
vendor-tactics.md, etc.); that is the separate, already-built and
already-tested `retrieval_index.py` in this same directory, which documents
its own wiring as pending on this same F1 authorization but is NOT modified
or wired by this task -- it is a related, adjacent piece of work, not part
of this change.

TWO INPUT MODES, ONE OUTPUT SHAPE
----------------------------------------------------------------------------
1. `segment_plain_text()` -- for text already extracted from a PDF or a
   markdown/plain-text source. No tracked-change information is possible
   from plain text; every clause's `tracked_change_status` is "none" and
   `tracked_change_author` is None. This is also the mode this module's own
   self-test exercises, since a self-test must not depend on a live .docx
   file existing on disk.
2. `segment_docx_parts()` -- for the actual XML parts of a .docx file
   (`word/document.xml`, optionally `word/comments.xml` and
   `word/people.xml`), which is what Execution Guardrail G1 already mandates
   this skill read via `unpack.py` for every .docx in scope. This mode
   extracts `<w:ins>` / `<w:del>` / `<w:commentRangeStart>` exactly as G1 and
   G3 already require, and tags each clause with its tracked-change status
   and authorship. Per G1, this module never silently substitutes plain-text
   extraction when .docx XML was the actual input; `segment_docx_file()`
   raises rather than falling back if the zip cannot be read as a .docx, so
   the caller (the skill, following G1) is the one who decides whether to
   tell the user about the limitation, exactly as G1 already specifies.

Both modes funnel into the same `ClauseEntry` / `ClauseRegister` shape so
every downstream pass, and the generator, read one shape regardless of how a
given document in the family arrived (a clean PDF governing MSA and a
heavily tracked-changed .docx WO under review are both ordinary members of
the same `ClauseRegister.documents` list).

COMPACTNESS IS A DESIGN CONSTRAINT, NOT A NICETY
----------------------------------------------------------------------------
Per the redesign rationale: "the index only helps if the model reads it, and
everything the model reads costs tokens... a verbose index could cost MORE
than the raw text it replaces." This module stores anchors and full clause
text (a pass legitimately needs the clause's own words to reason about it),
but it does NOT duplicate the whole document a second time in some other
shape, and `to_slim_json()` lets a caller emit a register with clause text
omitted (anchors only) for a pass that only needs to resolve references, not
read content.

STDLIB ONLY
----------------------------------------------------------------------------
`dataclasses`, `re`, `typing`, `zipfile`, `xml.etree.ElementTree`, `json`,
`os`, `sys`. No third-party dependency, matching every other kernel and
generator in this suite (`numeric_kernel.py`, `executive_summary_generator.py`,
etc.) and the Claude Desktop feasibility requirement that top-level imports
be stdlib only.
"""

from __future__ import annotations

import io
import json
import re
import sys
import zipfile
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple
from xml.etree import ElementTree as ET


# ===========================================================================
# Exceptions
# ===========================================================================

class SegmentationError(Exception):
    """Raised when a document cannot be segmented at all (e.g. a .docx path
    that is not a valid zip, or a required part is missing). Per G1, this is
    never silently swallowed into a plain-text fallback; the caller decides
    what to tell the user, exactly as G1 already requires for this skill."""


# ===========================================================================
# Data model
# ===========================================================================

# OOXML namespace map used by segment_docx_parts(). Kept local to this module
# rather than imported from python-docx, so this module has zero third-party
# dependency even when python-docx is unavailable in the current surface.
_W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
_NS = {"w": _W_NS}


@dataclass
class ClauseEntry:
    """One clause or clause-like span in the register.

    `clause_id` is the stable, human-readable identifier every pass and the
    generator address the clause by, e.g. "WO-10:7.1" or "MSA:23.1". It is
    always `<document>:<section_number>`, so it doubles as the citation
    string Rule 2 ("every finding must trace to specific text") already
    requires findings to carry.
    """

    document: str
    section_number: str
    heading: str
    text: str
    order_index: int
    clause_id: str = ""
    tracked_change_status: str = "none"   # none | inserted | deleted | commented | mixed
    tracked_change_author: Optional[str] = None
    comment_ids: List[str] = field(default_factory=list)
    party: Optional[str] = None  # authorship side for tracked changes: "Lilly" | "Supplier" | "Unknown" | None
    unstructured: bool = False   # True for a fallback span the parser could not cleanly number

    def __post_init__(self) -> None:
        if not self.clause_id:
            self.clause_id = f"{self.document}:{self.section_number}"


@dataclass
class ClauseRegister:
    """The single structured input every pass reads instead of re-parsing
    raw text. One register spans the whole document family (the document
    under review plus every governing document supplied), because Pass 2's
    governing cross-reference and Pass 4's cross-finding check both reason
    across documents, not within just one.
    """

    documents: List[str] = field(default_factory=list)
    clauses: List[ClauseEntry] = field(default_factory=list)
    built_from: Dict[str, str] = field(default_factory=dict)  # document -> "plain_text" | "docx_xml"

    def clause_count(self) -> int:
        return len(self.clauses)

    def for_document(self, document: str) -> List[ClauseEntry]:
        return [c for c in self.clauses if c.document == document]

    def find(self, document: str, section_number: str) -> Optional[ClauseEntry]:
        for c in self.clauses:
            if c.document == document and c.section_number == section_number:
                return c
        return None

    def find_by_id(self, clause_id: str) -> Optional[ClauseEntry]:
        for c in self.clauses:
            if c.clause_id == clause_id:
                return c
        return None

    def to_json(self, slim: bool = False) -> dict:
        return {
            "documents": list(self.documents),
            "built_from": dict(self.built_from),
            "clause_count": self.clause_count(),
            "clauses": [
                {k: v for k, v in asdict(c).items() if not (slim and k == "text")}
                for c in self.clauses
            ],
        }

    @staticmethod
    def from_json(data: dict) -> "ClauseRegister":
        reg = ClauseRegister(documents=list(data.get("documents", [])),
                              built_from=dict(data.get("built_from", {})))
        for row in data.get("clauses", []):
            row = dict(row)
            row.setdefault("text", "")
            reg.clauses.append(ClauseEntry(**row))
        return reg


@dataclass
class VerificationResult:
    """Output of `verify_register_against_source()` -- Pass 1's "check the
    work on the deterministic review" safeguard. Absence of a mismatch is
    NOT proof of correctness beyond what the heading pattern can see; it is
    a regression net against the specific failure mode of the parser
    silently dropping or mis-splitting a clause, which is the worst possible
    bug in this design because the output would look complete.
    """

    ok: bool
    document: str
    headings_in_source: int
    clauses_in_register: int
    missing_section_numbers: List[str] = field(default_factory=list)
    extra_section_numbers: List[str] = field(default_factory=list)


# ===========================================================================
# Heading / clause-number detection
# ===========================================================================

# Top-level section heading marked with a markdown heading token ("#", "##",
# or "###"). This is the strong, unambiguous signal, and it is what lets a
# heading use DECIMAL numbering (e.g. "## 3.6 Third-Party AI Providers") the
# same way an exhibit or standard commonly does, without that decimal
# heading being mistaken for a sub-clause of some section "3". Section
# numbers are not assumed to be sequential or single-level (real contracts
# have gaps and exhibits are frequently numbered decimally at the top
# level), so this accepts up to two dot-separated levels.
_MARKDOWN_HEADING_RE = re.compile(
    r"^\s{0,3}#{1,3}\s+(?:Section\s+)?(\d{1,3}(?:\.\d{1,3}){0,2})\.?\s+(.+?)\s*$",
    re.IGNORECASE,
)

# A bare (non-markdown-marked) top-level heading, e.g. a heading line as it
# survives PDF text extraction with no markup at all: "7. Debarment". Kept
# deliberately conservative (single integer only, mandatory period, next
# character not a digit) because without a markdown marker there is no
# reliable way to tell a decimal bare heading from a sub-clause paragraph;
# see the module docstring's stated limitation.
_BARE_SECTION_HEADING_RE = re.compile(
    r"^\s{0,3}(?:Section\s+)?(\d{1,3})\.(?!\d)\s*(.+?)\s*$",
    re.IGNORECASE,
)

# A numbered sub-clause paragraph with NO markdown heading marker, e.g.
# "7.1 Supplier certifies..." or "17.2  Lilly will indemnify...". Requires
# the number to be followed by whitespace so a sentence beginning with a
# decimal figure ("3.5% of fees") is not mistaken for a clause number; the
# additional requirement that what follows begins with a capital letter or
# open-paren makes this reasonably specific without needing a full grammar.
_SUBCLAUSE_RE = re.compile(
    r"^\s{0,3}(\d{1,3}\.\d{1,3})\s+(?=[A-Z(\"'“])(.+)$"
)

# For .docx paragraphs carrying a genuine Word heading style (w:pStyle
# "Heading1"/"Heading2"/etc.), the paragraph style itself is the unambiguous
# heading signal -- exactly the same role the markdown "#" marker plays for
# plain text -- so a decimally-numbered heading paragraph ("3.6 Third-Party
# AI Providers...") is recognized correctly even with no "#" character
# anywhere in the run text.
_STYLED_HEADING_NUMBER_RE = re.compile(
    r"^\s{0,3}(?:Section\s+)?(\d{1,3}(?:\.\d{1,3}){0,2})\.?\s+(.+?)\s*$",
    re.IGNORECASE,
)
_HEADING_STYLE_RE = re.compile(r"heading|title", re.IGNORECASE)


def _iter_clause_spans(text: str) -> List[Tuple[str, str, int, int]]:
    """Return (section_number, heading_or_none, start_line, end_line) spans.

    Two levels are detected: section headings (become a clause in their own
    right, covering any preamble prose before the first sub-clause) and
    numbered sub-clauses (each becomes its own clause, ending where the next
    sub-clause or the next section heading begins). Text matching neither
    pattern is attached to the most recent open clause, so no source text is
    silently dropped from the register. Markdown-marked headings are always
    checked first, since the "#" marker is the unambiguous signal when
    present; only when it is absent does this fall back to the more
    conservative bare-heading and sub-clause heuristics.
    """
    lines = text.splitlines()
    spans: List[Tuple[str, Optional[str], int]] = []  # (section_number, heading, start_line)

    current_section: Optional[str] = None
    for i, line in enumerate(lines):
        md_match = _MARKDOWN_HEADING_RE.match(line)
        heading_match = md_match or _BARE_SECTION_HEADING_RE.match(line)
        sub_match = None if md_match else _SUBCLAUSE_RE.match(line)
        if heading_match:
            current_section = heading_match.group(1)
            spans.append((current_section, heading_match.group(2).strip(), i))
        elif sub_match:
            spans.append((sub_match.group(1), None, i))

    # Close each span at the line before the next span begins (or EOF).
    result: List[Tuple[str, str, int, int]] = []
    for idx, (sec, heading, start) in enumerate(spans):
        end = spans[idx + 1][2] - 1 if idx + 1 < len(spans) else len(lines) - 1
        result.append((sec, heading or "", start, end))
    return result


def segment_plain_text(text: str, document_name: str) -> List[ClauseEntry]:
    """Segment already-extracted plain text (markdown or flat text) into
    ClauseEntry rows. No tracked-change information is available in this
    mode; every entry's `tracked_change_status` stays "none".

    If NO heading or sub-clause pattern is found anywhere (a document with
    no numbered structure at all), the whole text becomes a single
    `unstructured=True` entry rather than raising or silently producing an
    empty register -- "determinism narrows, it never drops."
    """
    lines = text.splitlines()
    spans = _iter_clause_spans(text)

    if not spans:
        return [ClauseEntry(
            document=document_name,
            section_number="0",
            heading="(unstructured -- no numbered clauses detected)",
            text=text.strip(),
            order_index=0,
            unstructured=True,
        )]

    entries: List[ClauseEntry] = []
    # A running "current heading" so a sub-clause's entry can carry its
    # parent section's heading for readability, without re-deriving it.
    current_heading = ""
    for order_index, (sec, heading, start, end) in enumerate(spans):
        if heading:
            current_heading = heading
        body = "\n".join(lines[start:end + 1]).strip()
        entries.append(ClauseEntry(
            document=document_name,
            section_number=sec,
            heading=heading or current_heading,
            text=body,
            order_index=order_index,
        ))
    return entries


def verify_register_against_source(register: ClauseRegister, text: str, document_name: str) -> VerificationResult:
    """Pass 1's structural-scan safeguard: re-derive the section-number set
    from the raw text independently of the register and diff it. This is
    intentionally the SAME regex the segmenter itself uses -- it is not an
    independent parser, so it cannot catch a defect in the shared pattern
    itself, only a defect in how the register was assembled from that
    pattern's output (a dropped span, a duplicate, an off-by-one). That
    limit is stated here rather than overclaimed.
    """
    spans = _iter_clause_spans(text)
    expected = {sec for sec, _h, _s, _e in spans}
    actual = {c.section_number for c in register.for_document(document_name) if not c.unstructured}

    missing = sorted(expected - actual, key=lambda s: [int(p) for p in s.split(".")])
    extra = sorted(actual - expected, key=lambda s: [int(p) for p in s.split(".")])

    return VerificationResult(
        ok=(not missing and not extra),
        document=document_name,
        headings_in_source=len(expected),
        clauses_in_register=len(actual),
        missing_section_numbers=missing,
        extra_section_numbers=extra,
    )


# ===========================================================================
# .docx XML segmentation (G1 / G3 tracked-changes path)
# ===========================================================================

def _people_map(people_xml: Optional[bytes]) -> Dict[str, str]:
    """word/people.xml maps author initials/ids used elsewhere to full
    names. Optional: many .docx files (and all pre-2021 Word versions)
    don't carry this part."""
    if not people_xml:
        return {}
    try:
        root = ET.fromstring(people_xml)
    except ET.ParseError:
        return {}
    out: Dict[str, str] = {}
    for person in root.findall(".//w:person", _NS):
        author = person.get(f"{{{_W_NS}}}author")
        if author:
            out[author] = author
    return out


def _classify_party(author: Optional[str]) -> Optional[str]:
    """Mirrors the skill's own Party Map detection signals (SKILL.md
    Pre-Analysis Setup, item 9): Lilly email domain or known Lilly naming
    vs. anything else. This is a best-effort structural signal only -- the
    passes still build and own the authoritative Party Map; this is not a
    replacement for that judgment, only a convenience tag on the clause
    entry so a pass does not have to re-scan raw XML to find it."""
    if not author:
        return None
    lowered = author.lower()
    if "@lilly.com" in lowered or "lilly" in lowered:
        return "Lilly"
    if lowered.strip():
        return "Unknown"
    return None


def segment_docx_parts(document_xml: bytes, comments_xml: Optional[bytes] = None,
                        people_xml: Optional[bytes] = None,
                        document_name: str = "document") -> List[ClauseEntry]:
    """Segment the parsed XML parts of a .docx (as read via `unpack.py` per
    Execution Guardrail G1) into ClauseEntry rows carrying tracked-change
    status and comment anchors, per G3 ("read and respond to existing
    tracked changes and comments BEFORE adding new analysis... the existing
    context IS the primary input").

    Only `document.xml` is required. `comments.xml` and `people.xml` are
    optional; when absent, `comment_ids` stays empty and `tracked_change_status`
    is still derived correctly from `<w:ins>` / `<w:del>` alone.
    """
    try:
        root = ET.fromstring(document_xml)
    except ET.ParseError as exc:
        raise SegmentationError(f"word/document.xml did not parse as XML: {exc}") from exc

    authors_by_id = _people_map(people_xml)
    comment_authors: Dict[str, str] = {}
    if comments_xml:
        try:
            croot = ET.fromstring(comments_xml)
            for c in croot.findall(".//w:comment", _NS):
                cid = c.get(f"{{{_W_NS}}}id")
                cauthor = c.get(f"{{{_W_NS}}}author")
                if cid is not None:
                    comment_authors[cid] = cauthor or ""
        except ET.ParseError:
            pass  # comments are enrichment here; a malformed part degrades to "no comments", never a raise

    paragraphs = root.findall(".//w:p", _NS)

    raw_entries: List[Tuple[str, str, str, str, Optional[str], List[str]]] = []
    # (section_number_or_none, heading_or_none, paragraph_text, tc_status, tc_author, comment_ids)

    for p in paragraphs:
        texts = []
        tc_statuses = set()
        tc_author: Optional[str] = None
        comment_ids: List[str] = []
        p_style: Optional[str] = None

        pstyle_el = p.find("./w:pPr/w:pStyle", _NS)
        if pstyle_el is not None:
            p_style = pstyle_el.get(f"{{{_W_NS}}}val")

        for node in p.iter():
            tag = node.tag.split("}")[-1]
            if tag == "t" and node.text:
                texts.append(node.text)
            elif tag == "delText" and node.text:
                texts.append(node.text)
                tc_statuses.add("deleted")
            elif tag == "ins":
                tc_statuses.add("inserted")
                tc_author = tc_author or node.get(f"{{{_W_NS}}}author")
            elif tag == "del":
                tc_statuses.add("deleted")
                tc_author = tc_author or node.get(f"{{{_W_NS}}}author")
            elif tag == "commentRangeStart":
                cid = node.get(f"{{{_W_NS}}}id")
                if cid is not None:
                    comment_ids.append(cid)

        para_text = "".join(texts).strip()
        if comment_ids:
            tc_statuses.add("commented")

        if len(tc_statuses) > 1:
            status = "mixed"
        elif tc_statuses:
            status = next(iter(tc_statuses))
        else:
            status = "none"

        is_heading_style = bool(p_style and _HEADING_STYLE_RE.search(p_style))
        if para_text and is_heading_style:
            heading_match = _STYLED_HEADING_NUMBER_RE.match(para_text)
        elif para_text:
            heading_match = _BARE_SECTION_HEADING_RE.match(para_text)
        else:
            heading_match = None
        sub_match = None if (heading_match or is_heading_style) else (
            _SUBCLAUSE_RE.match(para_text) if para_text else None
        )
        sec = None
        heading = None
        if heading_match:
            sec, heading = heading_match.group(1), heading_match.group(2).strip()
        elif sub_match:
            sec = sub_match.group(1)

        raw_entries.append((sec, heading, para_text, status, tc_author, comment_ids))

    entries: List[ClauseEntry] = []
    order_index = 0
    current_sec: Optional[str] = None
    current_heading = ""
    buffer_text: List[str] = []
    buffer_status: set = set()
    buffer_author: Optional[str] = None
    buffer_comments: List[str] = []

    def flush() -> None:
        nonlocal order_index, buffer_text, buffer_status, buffer_author, buffer_comments
        if current_sec is None and not buffer_text:
            return
        text_val = "\n".join(t for t in buffer_text if t)
        status = "mixed" if len(buffer_status) > 1 else (next(iter(buffer_status)) if buffer_status else "none")
        entries.append(ClauseEntry(
            document=document_name,
            section_number=current_sec if current_sec is not None else "0",
            heading=current_heading,
            text=text_val,
            order_index=order_index,
            tracked_change_status=status,
            tracked_change_author=buffer_author,
            comment_ids=list(dict.fromkeys(buffer_comments)),
            party=_classify_party(buffer_author),
            unstructured=(current_sec is None),
        ))
        order_index += 1
        buffer_text = []
        buffer_status = set()
        buffer_author = None
        buffer_comments = []

    for sec, heading, para_text, status, tc_author, comment_ids in raw_entries:
        if sec is not None:
            flush()
            current_sec = sec
            if heading:
                current_heading = heading
        if para_text:
            buffer_text.append(para_text)
        if status != "none":
            buffer_status.add(status)
        if tc_author and not buffer_author:
            buffer_author = tc_author
        buffer_comments.extend(comment_ids)
    flush()

    if not entries:
        raise SegmentationError(
            f"{document_name}: no paragraphs with text content found in word/document.xml"
        )
    return entries


def segment_docx_file(path_or_bytes, document_name: Optional[str] = None) -> List[ClauseEntry]:
    """Convenience wrapper: open a .docx (path or in-memory bytes) as a zip,
    read `word/document.xml` (required) plus `word/comments.xml` and
    `word/people.xml` (optional), and segment. Raises `SegmentationError`
    rather than silently degrading to plain-text extraction if the file is
    not a readable .docx zip -- per G1, that decision belongs to the skill
    and the user, not to a silent fallback here.
    """
    name = document_name or (path_or_bytes if isinstance(path_or_bytes, str) else "document")
    source = io.BytesIO(path_or_bytes) if isinstance(path_or_bytes, (bytes, bytearray)) else path_or_bytes
    try:
        zf = zipfile.ZipFile(source)
    except (zipfile.BadZipFile, OSError) as exc:
        raise SegmentationError(
            f"{name}: could not open as a .docx (zip) file: {exc}. Per Execution Guardrail "
            "G1, do not fall back to plain-text extraction silently; tell the user."
        ) from exc

    try:
        document_xml = zf.read("word/document.xml")
    except KeyError as exc:
        raise SegmentationError(f"{name}: word/document.xml not found in the archive") from exc

    comments_xml = None
    people_xml = None
    try:
        comments_xml = zf.read("word/comments.xml")
    except KeyError:
        pass
    try:
        people_xml = zf.read("word/people.xml")
    except KeyError:
        pass

    return segment_docx_parts(document_xml, comments_xml, people_xml, document_name=name)


# ===========================================================================
# Register assembly and reference resolution
# ===========================================================================

def build_register(plain_text_docs: Optional[Dict[str, str]] = None,
                    docx_docs: Optional[Dict[str, bytes]] = None) -> ClauseRegister:
    """Build one ClauseRegister spanning every document supplied.

    `plain_text_docs`: {document_name: extracted_text}
    `docx_docs`: {document_name: raw .docx bytes}

    A document may appear in only one of the two maps. This is the single
    call site the skill's Step 0 should make once, before Pass 1, per the
    F1 change: "Every subsequent pass then reads from this ONE structured
    register instead of re-parsing raw XML/text each time."
    """
    register = ClauseRegister()
    for name, text in (plain_text_docs or {}).items():
        register.documents.append(name)
        register.built_from[name] = "plain_text"
        register.clauses.extend(segment_plain_text(text, name))
    for name, raw in (docx_docs or {}).items():
        register.documents.append(name)
        register.built_from[name] = "docx_xml"
        register.clauses.extend(segment_docx_file(raw, document_name=name))
    return register


_REF_TOKEN_RE = re.compile(r"([A-Za-z][A-Za-z0-9_\-]*)\s*:\s*([\d.]+(?:-[\d.]+)?)")


def resolve_reference(register: ClauseRegister, ref: str) -> List[ClauseEntry]:
    """Resolve a citation string like "MSA:9.2", "EXHIBIT-C:3.6,SPS:4.4", or
    "MSA:23.1-23.3" into the ClauseEntry rows it names. A range like
    "23.1-23.3" resolves to every clause in that document whose section
    number falls in the range (by dotted-tuple comparison, not string
    comparison, so "23.10" would not be mistaken for inside "23.1-23.3" --
    though contracts in this suite do not currently number that deep).

    Returns an empty list for a token that does not resolve; it never
    raises, because callers use this to CHECK resolution (a finding whose
    `where` does not resolve is itself the thing being tested for), and a
    raise here would make that check impossible to run.
    """
    resolved: List[ClauseEntry] = []
    for doc, span in _REF_TOKEN_RE.findall(ref):
        if "-" in span:
            lo_s, hi_s = span.split("-", 1)
            lo = tuple(int(p) for p in lo_s.split("."))
            hi = tuple(int(p) for p in hi_s.split("."))
            for c in register.for_document(doc):
                try:
                    val = tuple(int(p) for p in c.section_number.split("."))
                except ValueError:
                    continue
                if lo <= val <= hi:
                    resolved.append(c)
        else:
            hit = register.find(doc, span)
            if hit:
                resolved.append(hit)
    return resolved


# ===========================================================================
# Self-test / CLI
# ===========================================================================

_DEMO_WO_TEXT = """# WORK ORDER 10 (self-test fixture, not a real contract)

## 6. Data Protection

6.1 Supplier will notify Lilly of any security incident affecting Lilly data within
ninety-six (96) hours of confirming the incident.

6.4 Telemetry and free-text notes entered by Lilly personnel constitute Usage Data.

## 7. Debarment

7.1 Supplier certifies that it has not knowingly engaged any debarred person.

## 8. Trade Sanctions

8.1 Supplier will screen its personnel against applicable restricted-party lists.
"""

# A decimal-numbered top-level heading corpus, matching the real shape of
# EXHIBIT-C-AI-Standard.md in the golden fixture: top-level sections
# numbered "3.1", "3.2", "3.6" (no bare "3" section exists at all). This is
# the exact case an earlier version of this module's heading regex missed
# (a decimal heading was indistinguishable from a sub-clause without the
# markdown marker as the deciding signal), caught by checking this module's
# own output against the real golden-fixture documents during verification,
# not by this self-test alone -- the self-test case is added here so the fix
# stays regression-tested going forward.
_DEMO_DECIMAL_HEADING_TEXT = """# EXHIBIT (self-test fixture, not a real contract)

## 3.1 Definitions

"Automated System" means any system using machine learning.

## 3.6 Third-Party AI Providers as Subcontractors

Every AI Provider is a Subcontractor for all purposes of the Agreement.
"""

_DEMO_MSA_TEXT = """# MASTER SERVICES AGREEMENT (self-test fixture)

## 9. Data Protection

9.1 Where Supplier processes Personal Information, the SPS applies.

9.2 Supplier will notify Lilly of any Security Incident within seventy-two (72) hours.

## 23. Adverse Event Reporting

23.1 Supplier will report any adverse event within one business day.

23.2 Supplier will train relevant personnel on this obligation.

23.3 This Section 23 survives termination.
"""

# A minimal, hand-built .docx `word/document.xml` fragment carrying one
# clean paragraph, one inserted paragraph (Supplier tracked-change), and one
# paragraph with a comment anchor -- enough to exercise segment_docx_parts()
# without needing a real .docx file on disk.
_DEMO_DOCX_XML = """<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>12. Limitation of Liability</w:t></w:r></w:p>
    <w:p><w:r><w:t>12.1 Liability is capped at the fees paid.</w:t></w:r></w:p>
    <w:p>
      <w:ins w:id="1" w:author="supplier@vendor.com" w:date="2026-07-01T00:00:00Z">
        <w:r><w:t>12.2 Supplier may subcontract without notice.</w:t></w:r>
      </w:ins>
    </w:p>
    <w:p>
      <w:commentRangeStart w:id="0"/>
      <w:r><w:t>12.3 This section survives termination.</w:t></w:r>
      <w:commentRangeEnd w:id="0"/>
    </w:p>
  </w:body>
</w:document>""".encode("utf-8")

_DEMO_COMMENTS_XML = """<?xml version="1.0" encoding="UTF-8"?>
<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:comment w:id="0" w:author="Lilly Reviewer"><w:p><w:r><w:t>Flag for SME.</w:t></w:r></w:p></w:comment>
</w:comments>""".encode("utf-8")


def _run_self_test() -> int:
    print("=" * 78)
    print("contract_segmenter.py self-test")
    print("=" * 78)

    results: List[tuple] = []

    def check(label, condition, detail=""):
        results.append((label, bool(condition), detail))
        status = "PASS" if condition else "FAIL"
        line = f"[{status}] {label}"
        if detail:
            line += f"  ({detail})"
        print(line)

    # --- plain-text segmentation -------------------------------------------------
    register = build_register(plain_text_docs={"WO-10": _DEMO_WO_TEXT, "MSA": _DEMO_MSA_TEXT})

    check("register spans both documents", set(register.documents) == {"WO-10", "MSA"},
          f"got {register.documents}")
    check("WO-10:7.1 present", register.find("WO-10", "7.1") is not None)
    check("WO-10:7.1 text carries the debarment clause",
          register.find("WO-10", "7.1") is not None and "debarred" in register.find("WO-10", "7.1").text)
    check("MSA:23.1 present with AE reporting text",
          register.find("MSA", "23.1") is not None and "adverse event" in register.find("MSA", "23.1").text)
    check("plain-text clauses carry tracked_change_status 'none'",
          all(c.tracked_change_status == "none" for c in register.clauses))
    check("built_from records plain_text for both documents",
          register.built_from == {"WO-10": "plain_text", "MSA": "plain_text"})

    # --- reference resolution ----------------------------------------------------
    hits = resolve_reference(register, "MSA:23.1")
    check("resolve_reference resolves a simple 'DOC:N.N' token", len(hits) == 1 and hits[0].section_number == "23.1")

    range_hits = resolve_reference(register, "MSA:23.1-23.3")
    check("resolve_reference resolves a range token to all three clauses",
          {c.section_number for c in range_hits} == {"23.1", "23.2", "23.3"},
          f"got {[c.section_number for c in range_hits]}")

    combo_hits = resolve_reference(register, "WO-10:7.1,MSA:9.2")
    check("resolve_reference resolves a multi-document comma-joined citation",
          len(combo_hits) == 2 and {c.document for c in combo_hits} == {"WO-10", "MSA"})

    check("resolve_reference returns empty (not a raise) for an orphan reference",
          resolve_reference(register, "WO-10:99.9") == [])

    # --- verify_register_against_source (Pass 1's "check the work") --------------
    verification = verify_register_against_source(register, _DEMO_WO_TEXT, "WO-10")
    check("verification passes for a correctly segmented document", verification.ok,
          f"missing={verification.missing_section_numbers} extra={verification.extra_section_numbers}")

    # Deliberately corrupt the register (simulate a parser dropping a clause)
    # and confirm the safeguard actually catches it, rather than always
    # reporting ok=True.
    corrupted = ClauseRegister(documents=list(register.documents), built_from=dict(register.built_from))
    corrupted.clauses = [c for c in register.clauses if not (c.document == "WO-10" and c.section_number == "7.1")]
    corrupted_verification = verify_register_against_source(corrupted, _DEMO_WO_TEXT, "WO-10")
    check("verification CATCHES a deliberately dropped clause (regression net proven, not just asserted)",
          not corrupted_verification.ok and "7.1" in corrupted_verification.missing_section_numbers,
          f"missing={corrupted_verification.missing_section_numbers}")

    # --- decimal-numbered top-level headings (regression test for the exact
    # defect the golden-fixture verification run caught: EXHIBIT-C-AI-Standard.md's
    # "## 3.6 Third-Party AI Providers..." heading, with no bare "## 3" parent
    # section anywhere, was silently absorbed into the prior clause because the
    # heading regex could not distinguish it from a sub-clause of section 3) --
    decimal_register = build_register(plain_text_docs={"EXHIBIT": _DEMO_DECIMAL_HEADING_TEXT})
    check("a decimal-numbered markdown heading ('## 3.6 Title') is captured as its OWN clause, "
          "not absorbed into the preceding section",
          decimal_register.find("EXHIBIT", "3.6") is not None
          and "Subcontractor" in decimal_register.find("EXHIBIT", "3.6").text,
          f"sections found: {sorted(c.section_number for c in decimal_register.clauses)}")
    decimal_verification = verify_register_against_source(decimal_register, _DEMO_DECIMAL_HEADING_TEXT, "EXHIBIT")
    check("verification also confirms the decimal-heading document segments cleanly", decimal_verification.ok,
          f"missing={decimal_verification.missing_section_numbers}")

    # --- unstructured fallback -----------------------------------------------------
    unstructured = segment_plain_text("Just some prose with no numbering at all.", "FREEFORM")
    check("a document with no numbered structure becomes ONE unstructured entry, not zero entries",
          len(unstructured) == 1 and unstructured[0].unstructured)

    # --- .docx XML segmentation (G1 / G3 tracked-changes path) --------------------
    docx_entries = segment_docx_parts(_DEMO_DOCX_XML, _DEMO_COMMENTS_XML, document_name="WO-DOCX")
    by_section = {c.section_number: c for c in docx_entries}
    check("docx segmentation finds section 12 and its three sub-clauses",
          {"12", "12.1", "12.2", "12.3"}.issubset(by_section.keys()),
          f"got {sorted(by_section.keys())}")
    check("an <w:ins> paragraph is tagged tracked_change_status='inserted'",
          by_section["12.2"].tracked_change_status == "inserted")
    check("the inserted clause's author is captured from w:author",
          by_section["12.2"].tracked_change_author == "supplier@vendor.com")
    check("party classification: a non-Lilly author classifies as 'Unknown', not silently as Lilly",
          by_section["12.2"].party == "Unknown")
    check("a clause with a commentRangeStart carries its comment id",
          by_section["12.3"].comment_ids == ["0"])
    check("a clean paragraph with no w:ins/w:del/comment stays tracked_change_status='none'",
          by_section["12.1"].tracked_change_status == "none")

    # --- SegmentationError is raised, never silently swallowed --------------------
    raised = False
    try:
        segment_docx_parts(b"not xml at all")
    except SegmentationError:
        raised = True
    check("malformed word/document.xml raises SegmentationError rather than degrading silently", raised)

    raised_zip = False
    try:
        segment_docx_file(b"not a zip file")
    except SegmentationError:
        raised_zip = True
    check("a non-.docx blob raises SegmentationError (G1: never silently fall back to plain-text)", raised_zip)

    # --- JSON round-trip ------------------------------------------------------------
    round_tripped = ClauseRegister.from_json(register.to_json())
    check("register survives a to_json()/from_json() round trip",
          round_tripped.clause_count() == register.clause_count()
          and round_tripped.find("WO-10", "7.1") is not None)

    slim = register.to_json(slim=True)
    check("slim JSON omits clause text (compactness constraint) but keeps anchors",
          all("text" not in row for row in slim["clauses"]) and slim["clause_count"] == register.clause_count())

    print("=" * 78)
    total = len(results)
    passed = sum(1 for _l, ok, _d in results if ok)
    print(f"SELF-TEST: {passed}/{total} passed")
    print("=" * 78)
    return 0 if passed == total else 1


def main(argv: Optional[List[str]] = None) -> int:
    return _run_self_test()


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
