#!/usr/bin/env python3
"""Copy a VCD file, replacing its $date block with a fixed text.

The simulator writes the current date into every VCD. Without this step each
`make demo` or `make test` would change the committed waveform files even when
the simulation itself is identical.

Usage: python3 scripts/normalize_vcd.py SOURCE.vcd DESTINATION.vcd
"""
import re
import sys

source, destination = sys.argv[1], sys.argv[2]
with open(source) as stream:
    text = stream.read()
text = re.sub(r"\$date.*?\$end", "$date\n\t(omitted so reruns do not change this file)\n$end",
              text, count=1, flags=re.S)
with open(destination, "w") as stream:
    stream.write(text)
