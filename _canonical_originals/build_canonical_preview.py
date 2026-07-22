#!/usr/bin/env python3
# Wrap a canonical React/JSX dashboard (the pristine ORIGINAL designs, v10.0) into a
# browser-openable preview harness. React + ReactDOM + Recharts + Babel are pulled
# from a CDN, so these previews need internet to render. They are VIEW-ONLY (not the
# shippable self-contained dashboards) -- purely so Marc can eyeball the originals.
import re, os

SRC = r"C:\Users\marcs\OneDrive\Desktop\claude skills\updated\build\src"
OUT = os.path.dirname(os.path.abspath(__file__))

LIB_GLOBAL = {"react": "React", "recharts": "Recharts", "react-dom": "ReactDOM"}

CDN = (
    '  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>\n'
    '  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>\n'
    '  <script crossorigin src="https://unpkg.com/prop-types/prop-types.min.js"></script>\n'
    '  <script crossorigin src="https://unpkg.com/recharts@2.12.7/umd/Recharts.min.js"></script>\n'
    '  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>'
)

def transform(jsx):
    comp = "App"
    out = []
    for ln in jsx.split("\n"):
        m = re.match(r'\s*import\s+\{([^}]*)\}\s+from\s+["\']([^"\']+)["\'];?\s*$', ln)
        if m:
            names, lib = m.group(1).strip(), m.group(2).strip()
            g = LIB_GLOBAL.get(lib)
            out.append("const {" + names + "} = " + g + ";" if g else "// skipped import from " + lib)
            continue
        if re.match(r'\s*import\s+.*from\s+["\'][^"\']+["\'];?\s*$', ln):
            out.append("// " + ln.strip())
            continue
        m3 = re.match(r'\s*export\s+default\s+function\s+(\w+)', ln)
        if m3:
            comp = m3.group(1)
            out.append(ln.replace("export default function", "function", 1))
            continue
        m4 = re.match(r'\s*export\s+default\s+(\w+)\s*;?\s*$', ln)
        if m4:
            comp = m4.group(1)
            out.append("// export default " + comp)
            continue
        out.append(ln)
    body = "\n".join(out)
    body += "\n\nReactDOM.createRoot(document.getElementById('root')).render(React.createElement(" + comp + "));\n"
    return body

def build(name, jsx_rel, title):
    jsx_path = os.path.join(SRC, jsx_rel)
    body = transform(open(jsx_path, encoding="utf-8").read())
    html = (
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>' + title + ' - ORIGINAL canonical</title>\n' + CDN +
        '\n<style>body{margin:0;font-family:Arial,Helvetica,sans-serif}'
        '#loaderr{padding:24px;color:#b00;font-family:monospace;white-space:pre-wrap}</style></head><body>'
        '<div id="root"><div id="loaderr">Loading the original canonical dashboard '
        '(needs internet for React/Recharts CDN). If this message stays, the CDN was blocked.</div></div>\n'
        '<script type="text/babel" data-presets="react">\n' + body + '\n</script></body></html>'
    )
    outp = os.path.join(OUT, name + "-ORIGINAL.html")
    with open(outp, "w", encoding="utf-8", newline="") as f:
        f.write(html)
    print("built", os.path.basename(outp), str(len(html) // 1024) + "KB")

build("supplier-landscape", r"supplier-landscape-1c344a\examples\supplier_landscape_canonical_dashboard.jsx", "Supplier Landscape")
build("category-strategy", r"category-strategy-1c344a\examples\category_strategy_canonical_dashboard.jsx", "Category Strategy")
build("lilly-contract-review", r"lilly-contract-review-1c344a\examples\contract_review_canonical_dashboard.jsx", "Contract Review")
build("rfp-response-analysis", r"rfp-response-analysis-1c344a\examples\response_analysis_canonical_dashboard.jsx", "RFP Response Analysis")
