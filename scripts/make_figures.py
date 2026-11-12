#!/usr/bin/env python3
"""Create vector diagrams using only Python's standard library.

Waveform values come from the Verilog simulation's pre-edge CSV samples.
Run `make test` first. This script does not simulate or invent measurements.
"""
import csv
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/figures"
OUT.mkdir(parents=True, exist_ok=True)
INK = "#172638"
BLUE = "#145f9b"
GREEN = "#17745c"
ORANGE = "#a54c13"


def text(x, y, value, size=22, color=INK, anchor="start", weight="normal"):
    return (f'<text x="{x}" y="{y}" font-family="Arial, Helvetica, sans-serif" '
            f'font-size="{size}" fill="{color}" text-anchor="{anchor}" '
            f'font-weight="{weight}">{escape(str(value))}</text>')


def line(x1, y1, x2, y2, color=INK, width=2, arrow=False):
    marker = ' marker-end="url(#arrow)"' if arrow else ""
    return (f'<path d="M {x1},{y1} L {x2},{y2}" fill="none" '
            f'stroke="{color}" stroke-width="{width}"{marker}/>')


def box(x, y, w, h, title, subtitle, color=BLUE):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" '
            f'fill="#ffffff" stroke="{color}" stroke-width="2"/>'
            + text(x+w/2, y+39, title, 23, color, "middle", "bold")
            + text(x+w/2, y+70, subtitle, 18, INK, "middle"))


def save(name, w, h, parts):
    preamble = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
                f'viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="white"/>'
                '<defs><marker id="arrow" markerWidth="9" markerHeight="9" '
                'refX="8" refY="4" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8" '
                f'fill="{INK}"/></marker></defs>')
    (OUT / name).write_text(preamble + "".join(parts) + "</svg>\n")


parts = [text(45, 43, "One controller. Two memory organizations.", 29, weight="bold"),
         text(45, 77, "Both store 16 instruction bytes and 16 data bytes.", 21)]
parts += [text(45, 126, "HARVARD: independent instruction and data ports", 24, BLUE, weight="bold"),
          box(45, 183, 300, 120, "Tiny controller", "PC + instruction register + ACC"),
          box(765, 150, 390, 95, "Instruction memory", "16 x 8 bits | read only"),
          box(765, 285, 390, 95, "Data memory", "16 x 8 bits | read / write", GREEN),
          line(345, 215, 765, 195, arrow=True),
          text(520, 184, "PC / fetch", 20, BLUE, "middle"),
          line(765, 227, 345, 240, arrow=True),
          text(555, 258, "instruction", 18, BLUE, "middle"),
          line(345, 279, 765, 320, arrow=True),
          text(550, 285, "address / write data / control", 18, GREEN, "middle"),
          line(765, 349, 345, 302, arrow=True),
          text(552, 371, "read data", 18, GREEN, "middle"),
          text(45, 414, "Fetch the next instruction while the current LOAD / STORE accesses data.", 21)]
parts += [line(45, 444, 1155, 444, "#ccd4dc", 1),
          text(45, 489, "SHARED: one port must take turns", 24, ORANGE, weight="bold"),
          box(45, 533, 300, 100, "Same controller", "same program and data"),
          box(440, 533, 260, 100, "Address decoder", "instruction / data region", ORANGE),
          box(795, 533, 360, 100, "Shared memory", "32 x 8 bits | one port", ORANGE),
          line(345, 563, 440, 563, arrow=True),
          line(700, 563, 795, 563, arrow=True),
          '<path d="M795,611 L750,611 L750,655 L195,655 L195,633" '
          f'fill="none" stroke="{INK}" stroke-width="2" marker-end="url(#arrow)"/>',
          text(392, 647, "read data", 18, anchor="middle"),
          text(45, 683, "Addresses 0-15: instructions. Addresses 16-31: data. LOAD / STORE pauses fetch.", 21)]
save("architecture.svg", 1200, 720, parts)

with (ROOT / "results/demo_trace.csv").open() as stream:
    rows = list(csv.DictReader(stream))
assert rows and [int(r["cycle"]) for r in rows] == list(range(1, len(rows)+1))
h_cycles = next(int(r["cycle"]) for r in rows if r["h_halted_after"] == "1")
s_cycles = next(int(r["cycle"]) for r in rows if r["s_halted_after"] == "1")
left, cell = 230, 952 / len(rows)
parts = [text(35, 40, "Simulation waveforms: LOAD 0 / STORE 1 / HALT", 26, weight="bold"),
         text(35, 75, "Control signals sampled immediately before each rising clock edge.", 20),
         text(35, 114, "Cycle", 19)]
for j, row in enumerate(rows):
    x = left + j*cell
    parts += [line(x, 129, x, 660, "#e1e7ec", 1),
              text(x+cell/2, 114, row["cycle"], 19, anchor="middle")]
parts += [text(35, 157, "HARVARD", 22, BLUE, weight="bold")]
signals = [("h_fetch", "instruction fetch", BLUE, 190),
           ("h_read", "data read", BLUE, 250),
           ("h_write", "data write", BLUE, 310),
           ("s_fetch", "instruction fetch", ORANGE, 430),
           ("s_read", "data read", ORANGE, 490),
           ("s_write", "data write", ORANGE, 550)]
for key, label, color, y in signals:
    parts.append(text(35, y+10, label, 19))
    values = [int(row[key]) for row in rows]
    coords = [f"M {left},{y + (0 if values[0] else 26)}"]
    for j, val in enumerate(values):
        yy = y + (0 if val else 26)
        if j:
            coords.append(f"L {left+j*cell},{yy}")
        coords.append(f"L {left+(j+1)*cell},{yy}")
    parts.append(f'<path d="{" ".join(coords)}" fill="none" stroke="{color}" stroke-width="3"/>')
parts.append(text(35, 396, "SHARED", 22, ORANGE, weight="bold"))
parts += [text(35, 622, "ACC after edge", 19)]
for j, row in enumerate(rows):
    parts.append(text(left+j*cell+cell/2, 622, f'{row["h_acc_after"]} / {row["s_acc_after"]}',
                      17, anchor="middle"))
parts += [text(35, 682, f"Harvard halts after cycle {h_cycles}. Shared halts after cycle {s_cycles}. ACC row: Harvard / shared.", 19),
          text(35, 718, "Cycles 2-3: Harvard fetch overlaps data access. Shared fetch and data never overlap.", 19)]
save("waveforms.svg", 1230, 750, parts)

# Compact versions keep labels legible inside a single IEEE report column.
parts = [text(15, 22, "Harvard: independent ports", 19, BLUE, weight="bold"),
         box(15, 58, 155, 92, "Controller", "PC | IR | ACC"),
         box(320, 38, 165, 65, "Instructions", "16 x 8 bits"),
         box(320, 133, 165, 65, "Data", "16 x 8 bits", GREEN),
         line(170, 77, 320, 62, arrow=True),
         line(320, 88, 170, 101, arrow=True),
         text(244, 51, "fetch", 16, BLUE, "middle"),
         line(170, 122, 320, 153, arrow=True),
         line(320, 178, 170, 145, arrow=True),
         text(243, 184, "data", 16, GREEN, "middle"),
         text(15, 232, "Shared: one port, data access pauses fetch", 19, ORANGE, weight="bold"),
         box(15, 252, 155, 65, "Controller", "same program"),
         box(320, 252, 165, 65, "Shared", "32 x 8 bits", ORANGE),
         line(170, 268, 320, 268, arrow=True),
         text(245, 261, "decoder", 16, ORANGE, "middle"),
         line(320, 298, 170, 298, arrow=True)]
# Override the large-diagram box text positions and fonts for these shorter boxes.
compact = "".join(parts).replace('font-size="23"', 'font-size="18"').replace('font-size="18"', 'font-size="16"')
# The main box helper's baselines are +39/+70; compact boxes need +27/+49.
for y in [38, 133, 252]:
    compact = compact.replace(f'y="{y+39}"', f'y="{y+27}"').replace(f'y="{y+70}"', f'y="{y+49}"')
save("architecture_report.svg", 500, 330, [compact])

parts = [text(10, 21, "Cycle", 15)]
left, cell = 82, 392 / len(rows)
for j in range(len(rows)):
    x = left+j*cell
    parts += [text(x+cell/2, 21, j+1, 14, anchor="middle"),
              line(x, 30, x, 284, "#e1e7ec", 1)]
parts += [text(10, 48, "Harvard", 16, BLUE, weight="bold"),
          text(10, 179, "Shared", 16, ORANGE, weight="bold")]
for key, label, color, y in [("h_fetch","fetch",BLUE,63), ("h_read","read",BLUE,96),
                             ("h_write","write",BLUE,129), ("s_fetch","fetch",ORANGE,194),
                             ("s_read","read",ORANGE,227), ("s_write","write",ORANGE,260)]:
    parts.append(text(10, y+12, label, 15))
    values = [int(row[key]) for row in rows]
    coords = [f"M {left},{y + (0 if values[0] else 18)}"]
    for j, val in enumerate(values):
        yy=y+(0 if val else 18)
        if j: coords.append(f"L {left+j*cell},{yy}")
        coords.append(f"L {left+(j+1)*cell},{yy}")
    parts.append(f'<path d="{" ".join(coords)}" fill="none" stroke="{color}" stroke-width="2"/>')
save("waveforms_report.svg", 490, 295, parts)
print("Created block diagrams and waveform figures from simulation samples.")
