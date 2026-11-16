#!/usr/bin/env python3
"""Check the Team hub against docs/VIDEO_SCRIPT.md, and every markdown link.

The words on the website (docs/site/hub-data.js) and the written video guide
must not drift apart. Every spoken line, every cue word and every scene time on
the website must appear in VIDEO_SCRIPT.md. Exits with an error otherwise.

Usage: python3 scripts/check_site.py
"""
import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
script = (root / "docs/VIDEO_SCRIPT.md").read_text()
source = (root / "docs/site/hub-data.js").read_text()
data = json.loads(source[source.index("{"):source.rindex("}") + 1])


def as_markdown(text):
    """[[cue]] on the website is written **[cue]** in the markdown guide."""
    return re.sub(r"\[\[(.+?)\]\]", r"**[\1]**", text)


def clock(seconds):
    return f"{seconds // 60}:{seconds % 60:02d}"


problems = []
for scene in data["scenes"]:
    heading = f"### Scene {scene['n']} · {clock(scene['start'])}-{clock(scene['end'])}"
    if heading not in script:
        problems.append(f"scene {scene['n']}: heading/time '{heading}' not in VIDEO_SCRIPT.md")
    spoken = [line["say"] for line in scene["lines"]] + [c["say"] for c in scene.get("choose", [])]
    for text in spoken:
        if as_markdown(text) not in script:
            problems.append(f"scene {scene['n']}: line not in VIDEO_SCRIPT.md: {text[:70]}...")
    for cue in scene["cues"]:
        if f"**[{cue['word']}]**" not in script:
            problems.append(f"scene {scene['n']}: cue '{cue['word']}' not in VIDEO_SCRIPT.md")
        if not any(f"[[{cue['word']}]]" in t for t in spoken):
            problems.append(f"scene {scene['n']}: cue '{cue['word']}' is not marked in the spoken words")

ids = {m["id"] for m in data["members"]}
for scene in data["scenes"]:
    for who in [scene["speaker"], *scene["speakers"], *(l["who"] for l in scene["lines"])]:
        if who not in ids:
            problems.append(f"scene {scene['n']}: unknown member id '{who}'")
for a, b in zip(data["scenes"], data["scenes"][1:]):
    if a["end"] != b["start"]:
        problems.append(f"scene {a['n']} ends at {a['end']} but scene {b['n']} starts at {b['start']}")
if data["scenes"][-1]["end"] > 300:
    problems.append("the plan is longer than 5:00")

# Every relative link in the markdown files must point to an existing file.
link = re.compile(r"\]\(([^)\s]+)\)|href=\"([^\"]+)\"")
for md_file in [root / "README.md", root / "VIDEO.md", *sorted((root / "docs").glob("*.md"))]:
    for found in link.finditer(md_file.read_text()):
        target = (found[1] or found[2]).split("#")[0]
        if not target or re.match(r"[a-z]+:", target):
            continue
        if not (md_file.parent / target).exists():
            problems.append(f"{md_file.relative_to(root)}: broken link to {target}")

if problems:
    print("Problems found:")
    for p in problems:
        print("  -", p)
    sys.exit(1)
print(f"Team hub matches docs/VIDEO_SCRIPT.md: {len(data['scenes'])} scenes, "
      f"{len(data['members'])} members, ends at {clock(data['scenes'][-1]['end'])}; all markdown links resolve.")
