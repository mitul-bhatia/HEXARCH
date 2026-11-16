#!/usr/bin/env python3
"""Put the recorded video's link into VIDEO.md and the README in one step.

Usage: python3 scripts/set_video_link.py URL DURATION
Example: python3 scripts/set_video_link.py "https://youtu.be/abc123XYZ00" 4:35

Updates the marked places (<!-- VIDEO-... --> comments) in VIDEO.md and
README.md: the link, the duration, the README badge, row and status.
"""
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

if len(sys.argv) != 3:
    sys.exit(__doc__)
url, duration = sys.argv[1].strip(), sys.argv[2].strip()

parsed = urlparse(url)
if parsed.scheme != "https" or not parsed.netloc:
    sys.exit(f"Not an https link: {url}")
if not any(h in parsed.netloc for h in ("youtube.com", "youtu.be", "drive.google.com")):
    print(f"Note: {parsed.netloc} is not YouTube or Google Drive; check that it plays when logged out.")
match = re.fullmatch(r"(\d{1,2}):([0-5]\d)", duration)
if not match:
    sys.exit(f"Duration must look like 4:35, got {duration!r}")
seconds = int(match[1]) * 60 + int(match[2])
if seconds > 300:
    sys.exit(f"The video is {duration}, longer than the 5:00 limit. Trim it first.")

root = Path(__file__).resolve().parent.parent
host = "YouTube" if "youtu" in parsed.netloc else "Google Drive" if "drive.google" in parsed.netloc else parsed.netloc
badge = (f'<a href="{url}"><img alt="Watch the prototype video ({duration})" '
         f'src="https://img.shields.io/badge/Prototype_video-watch_{duration.replace(":", "%3A")}-a54c13'
         f'?style=for-the-badge&logo=youtube&logoColor=white"></a>')
changes = {
    "VIDEO.md": {
        "VIDEO-LINK": f"**Video link:** [{url}]({url}) ({host})",
        "VIDEO-DURATION": f"**Duration:** {duration} (limit 5:00)",
    },
    "README.md": {
        "VIDEO-BADGE": badge,
        "VIDEO-ROW": f"[Watch on {host}]({url}) ({duration}) · [`VIDEO.md`](VIDEO.md)",
        "VIDEO-STATUS": "✅",
    },
}
for name, marks in changes.items():
    path = root / name
    text = path.read_text()
    for mark, value in marks.items():
        pattern = re.compile(rf"(<!-- {mark} -->).*?(<!-- /{mark} -->)", re.S)
        if not pattern.search(text):
            sys.exit(f"{name}: marker <!-- {mark} --> not found")
        text = pattern.sub(lambda m: m[1] + value + m[2], text, count=1)
    path.write_text(text)
    print(f"updated {name}")
print("Now commit on a branch, open a pull request and merge it.")
