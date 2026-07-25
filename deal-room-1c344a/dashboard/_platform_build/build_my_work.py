#!/usr/bin/env python3
"""Inline the platform's my-work.html into a single self-contained file (offline,
no CDN). The page already carries its logo as a data URI and its main CSS inline;
this only inlines the 15 assets/*.js scripts + tasks-drawer.css and swaps the
Google-Fonts <link> for the platform's own inline @font-face bundle. Source stays
READ-ONLY; output lands in the Desktop dashboards folder."""
import os
import re

PLATFORM = r"C:\Users\marcs\OneDrive\Desktop\lilly IT intake and orchestration tool"
FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'fonts-inline.css')
OUT = os.path.join(os.environ.get('DESKTOP_DASH',
      r"C:\Users\marcs\OneDrive\Desktop\Lilly Procurement Dashboards"), 'My-Work.html')


def read(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()


def main():
    src = read(os.path.join(PLATFORM, 'my-work.html'))
    fonts_css = read(FONTS)

    # 1. Drop the two font preconnects; swap the Google-Fonts stylesheet for inline fonts.
    src = re.sub(r'<link rel="preconnect"[^>]*>', '', src)
    src = re.sub(r'<link href="https://fonts\.googleapis\.com[^"]*"[^>]*>',
                 lambda m: '<style>' + fonts_css + '</style>', src, count=1)

    # 2. Inline any assets/*.css <link>.
    def css_repl(m):
        return '<style>' + read(os.path.join(PLATFORM, m.group(1))) + '</style>'
    src = re.sub(r'<link rel="stylesheet" href="(assets/[^"]+)">', css_repl, src)

    # 3. Inline every assets/*.js <script src>.
    def js_repl(m):
        js = read(os.path.join(PLATFORM, m.group(1)))
        return '<script>' + js.replace('</script>', '<\\/script>') + '</script>'
    src = re.sub(r'<script src="(assets/[^"]+)"[^>]*>\s*</script>', js_repl, src)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(src)
    size = os.path.getsize(OUT)
    print('wrote {} ({} bytes, {:.2f} MB)'.format(OUT, size, size / (1024 * 1024)))
    # report any surviving external refs
    leftover = re.findall(r'(?:src|href)="(?:https?:)?//[^"]*"|(?:src|href)="assets/[^"]*"', src)
    print('surviving external refs:', len(leftover))
    for r in leftover[:8]:
        print('  ', r)


if __name__ == '__main__':
    main()
