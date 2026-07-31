import json, collections, os

files = {
    "Category Strategy": "category-strategy-1c344a/panel_sources.json",
    "Deal": "deal-tab-1c344a/panel_sources.json",
    "RFx": "rfx-hub-1c344a/panel_sources.json",
    "Landscape": "supplier-landscape-1c344a/panel_sources.json",
}

by_access = collections.defaultdict(lambda: collections.defaultdict(set))  # access -> source_name -> set of (dashboard, panel, field)
requires_input = collections.defaultdict(set)  # dashboard -> set of (panel, field)
no_sources_no_flag = collections.defaultdict(set)
source_detail = {}  # source_name -> dict(access,type,how,confirmed_by_owner) first seen
panel_count = collections.Counter()
field_count = collections.Counter()

for dash, path in files.items():
    data = json.load(open(path, encoding="utf-8"))
    panels = data.get("panels", [])
    panel_count[dash] = len(panels)
    for p in panels:
        pid = p.get("id")
        ptitle = p.get("title")
        for f in p.get("fields", []):
            field_count[dash] += 1
            fname = f.get("name")
            if f.get("requires_input"):
                requires_input[dash].add((pid, fname))
                continue
            srcs = f.get("sources")
            if not srcs:
                no_sources_no_flag[dash].add((pid, fname))
                continue
            for s in srcs:
                sname = s.get("name")
                access = s.get("access", "?")
                by_access[access][sname].add((dash, pid, fname))
                if sname not in source_detail:
                    source_detail[sname] = {
                        "access": access,
                        "type": s.get("type"),
                        "how": s.get("how"),
                        "confirmed_by_owner": s.get("confirmed_by_owner", False),
                    }

print("=== PANEL / FIELD COUNTS ===")
for d in files:
    print(f"{d}: {panel_count[d]} panels, {field_count[d]} fields")
print(f"TOTAL: {sum(panel_count.values())} panels, {sum(field_count.values())} fields")

print()
print("=== ACCESS TYPE BREAKDOWN (distinct source names) ===")
for access, srcs in sorted(by_access.items()):
    print(f"\n--- access={access} ({len(srcs)} distinct source names) ---")
    for sname, refs in sorted(srcs.items(), key=lambda kv: -len(kv[1])):
        det = source_detail[sname]
        conf = "CONFIRMED" if det["confirmed_by_owner"] else "unconfirmed"
        print(f"  [{len(refs)} refs] ({conf}) {sname!r} | type={det['type']} | how={det['how']}")

print()
print("=== requires_input (human judgment, no source needed) ===")
for d, items in requires_input.items():
    print(f"{d}: {len(items)} fields")

print()
print("=== fields with NO sources and NOT flagged requires_input (potential gap) ===")
for d, items in no_sources_no_flag.items():
    if items:
        print(f"{d}: {len(items)}")
        for pid, fname in sorted(items):
            print(f"    {pid} / {fname}")
