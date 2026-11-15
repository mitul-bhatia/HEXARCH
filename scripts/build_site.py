#!/usr/bin/env python3
"""Build the GitHub Pages website into one folder.

Usage: python3 scripts/build_site.py SITE_DIR      (for example: _site)

The website has two pages:
  index.html  the study guide (docs/study_guide/study_guide.html) with web styles
  team.html   the Team hub: setup, tasks and the clickable video script (docs/site/)
plus the figures, the video cards and both PDFs. GitHub Actions runs this on
every push to main (.github/workflows/pages.yml), so merging updates the site.
"""
import hashlib
import re
import shutil
import sys
from pathlib import Path

repo = Path(__file__).resolve().parent.parent
site = Path(sys.argv[1]).resolve()
previous_build = (site / "team.html").exists() and (site / "hub-data.js").exists()
if site.exists() and any(site.iterdir()) and not previous_build:
    sys.exit(f"refusing to overwrite {site}: give a new folder, an empty one, or an earlier site build")


def web_paths(html):
    return html.replace("../figures/", "figures/").replace("../video/", "video/")


nav = ('<nav class="topbar" aria-label="Site"><b>HEXARCH &middot; Project 9</b>'
       '<a href="index.html">Study guide</a>'
       '<a href="team.html">Team hub: tasks &amp; video script</a>'
       '<a href="HEXARCH_Phase_I_Report.pdf">Report (PDF)</a>'
       '<a href="https://github.com/mitul-bhatia/HEXARCH">GitHub</a></nav>\n')

# The same small icon as team.html, so the browser does not request /favicon.ico.
favicon = re.search(r'<link rel="icon"[^>]*>', (repo / "docs/site/team.html").read_text()).group(0)

# ---- Study guide -> index.html ----
html = web_paths((repo / "docs/study_guide/study_guide.html").read_text())
html = html.replace(
    '<meta charset="utf-8">',
    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    '<meta name="description" content="Illustrated study guide for Project 9: Instruction and Data '
    'Memory Hierarchy (Harvard vs von Neumann-style memory).">\n' + favicon, 1)
web_css = '''
  @media screen {
    body { max-width: 860px; margin: 0 auto; padding: 20px 16px 60px; background: #fff; }
    .page { padding-bottom: 28px; margin-bottom: 30px; border-bottom: 2px solid var(--line); }
    .topbar { display:flex; gap:8px 16px; align-items:center; flex-wrap:wrap; background: var(--bg);
              border:1px solid var(--line); border-radius:8px; padding:8px 14px; margin-bottom:10px; font-size:10pt; }
    .topbar b { margin-right:auto; }
    .topbar a { color: var(--blue); font-weight:700; }
    .cover { padding-top: 24px; }
  }
  @media print { .topbar { display:none; } }
  @media (max-width: 640px) {
    .cols { flex-direction: column; }
    .chart { font-size: 7.5pt; grid-template-columns: 64px repeat(6, 1fr); gap: 3px; }
    .cell { padding: 6px 1px; }
    .cover h1 { font-size: 26pt; }
    table { font-size: 9pt; display: block; overflow-x: auto; }
    pre { overflow-x: auto; }
    img { width: 100% !important; }
  }
</style>'''
assert html.count("</style>") == 1 and html.count("<body>\n") == 1
html = html.replace("</style>", web_css, 1).replace("<body>\n", "<body>\n" + nav, 1)

# ---- Team hub -> team.html ----
team = web_paths((repo / "docs/site/team.html").read_text())
assert "<!--NAV-->" in team
team = team.replace("<!--NAV-->", nav, 1)

# ---- Write the site ----
if site.exists():
    shutil.rmtree(site)
site.mkdir(parents=True)
(site / ".nojekyll").write_text("")
(site / "index.html").write_text(html)
hub_data = web_paths((repo / "docs/site/hub-data.js").read_text())
# Browsers cache files from GitHub Pages for up to 10 minutes. A version tag
# that changes with the content makes every update load immediately.
version = hashlib.sha256(hub_data.encode()).hexdigest()[:10]
assert team.count('src="hub-data.js"') == 1
team = team.replace('src="hub-data.js"', f'src="hub-data.js?v={version}"')
(site / "team.html").write_text(team)
(site / "hub-data.js").write_text(hub_data)
(site / "figures").mkdir()
for name in ["architecture.png", "waveforms.png"]:
    shutil.copy(repo / "docs/figures" / name, site / "figures" / name)
(site / "video").mkdir()
for name in ["title_card.png", "end_card.png"]:
    shutil.copy(repo / "docs/video" / name, site / "video" / name)
for name in ["HEXARCH_Study_Guide.pdf", "HEXARCH_Phase_I_Report.pdf"]:
    shutil.copy(repo / "output/pdf" / name, site / name)
# Every image the pages or the hub data point at must exist in the site.
for page in ["index.html", "team.html", "hub-data.js"]:
    for ref in re.findall(r'(?:src="|"(?:image|endImage)": ")([^"]+\.png)', (site / page).read_text()):
        if not (site / ref).is_file():
            sys.exit(f"{page} refers to {ref}, which is not in the site")
print("site built in", site, ":", sorted(p.name for p in site.iterdir()))
