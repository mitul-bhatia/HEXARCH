# HEXARCH | Instruction and Data Memory Hierarchy

**Project 9 - MCA Projects 2026 - Section A**

| | |
| --- | --- |
| **Report** | [IEEE-format Phase I report (PDF)](output/pdf/HEXARCH_Phase_I_Report.pdf) |
| **Video** | [VIDEO.md](VIDEO.md) (link added after recording) |
| **New here?** | [Illustrated study guide](https://mitul-bhatia.github.io/HEXARCH/) ([PDF](output/pdf/HEXARCH_Study_Guide.pdf)) |

We demonstrate one idea: **separate instruction and data paths (Harvard) let an instruction fetch and a data access happen in the same cycle, while a von Neumann-style shared single-port memory must take turns.**

Both designs run the same small program with the same controller and the same total memory:

| Harvard | Von Neumann-style shared memory |
| --- | --- |
| 16 instruction bytes + 16 data bytes | One 32-byte memory |
| Independent instruction and data ports | Instructions and data take turns on one port |

![Block diagram](docs/figures/architecture.png)

## Team

| Member | Role |
| --- | --- |
| Akshat Chauhan | Instruction path: program counter, instruction memory |
| Ajeesh Amreet | Data path: data memory, read/write control |
| Vaibhav | Shared memory, address decoder, fetch-stall rule |
| Hardik Maheshwari | Simulation: testbenches, results, waveforms |
| Mitul Bhatia | Integration: top level, controller, build, report, repository, video |

Details and the submission plan: [docs/TEAM_AND_PLAN.md](docs/TEAM_AND_PLAN.md).

## Run the demonstration

Install the tools once:

- **macOS:** `brew install icarus-verilog` (Make and Python 3 are usually already installed)
- **Ubuntu/Debian:** `sudo apt-get install iverilog make python3`
- **Windows:** install WSL (`wsl --install -d Ubuntu` in an administrator PowerShell, then restart), open *Ubuntu*, and use the Ubuntu command above. Run everything inside Ubuntu.

Tested with Icarus Verilog 13.0. Then, from this folder:

```sh
make demo
```

The program contains only three instructions:

```text
LOAD 0     Read data[0] = 7 into the accumulator
STORE 1    Write the accumulator to data[1]
HALT       Stop
```

The terminal shows six cycles and checks the result automatically:

| Result | Harvard | Shared |
| --- | ---: | ---: |
| Final data[1] | 7 | 7 |
| Completion cycles | 4 | 6 |
| Fetch/data overlap cycles | 2 | 0 |
| Fetch cycles blocked by data access | 0 | 2 |

Counts include the first fetch and HALT execution; reset is excluded. In general, a straight-line program of `N` instructions with `M` LOAD/STORE instructions takes `N + 1` cycles on Harvard and `N + 1 + M` on shared memory. These results apply to our combinational-read, rising-edge-write memory model, with the same clock period for both designs.

![Simulation waveforms](docs/figures/waveforms.png)

## Verify

```sh
make test     # all verification scenarios
make stress   # 2000 random programs against a software model
make check    # demo + test + stress
```

The six scenarios are the demo, address boundaries, no data accesses, HALT only, invalid opcode, and reset/restart. Checks include every final data location, instruction preservation, PC hold behaviour and memory-port ownership. Output is written to `build/` first and copied to `results/` only when the run passes.

| File | Contents |
| --- | --- |
| `results/demo_output.txt` | Readable cycle table (`F/R/W` = fetch/read/write) |
| `results/demo.vcd`, `results/memory_compare.vcd` | Waveforms; open in a VCD viewer such as GTKWave |
| `results/demo_trace.csv` | Sampled signals used to draw the waveform figure |
| `results/test_output.txt`, `results/summary.csv` | All scenario results |
| `results/stress_output.txt` | Random-program result |

## What is where

| Path | Contents |
| --- | --- |
| `rtl/` | The Verilog design (8 modules) |
| `tb/` | Testbenches: scenarios and random stress test |
| `programs/` | Demo program and starting data (hex) |
| `docs/` | [Simple explanation](docs/PROJECT_GUIDE.md), [requirements check](docs/REQUIREMENTS.md), [video recording guide](docs/VIDEO_SCRIPT.md), [member tasks](docs/MEMBER_TASKS.md), figures, report source, study guide source |
| `output/pdf/` | Report and study guide PDFs |

Optional regeneration: `make figures` (needs `librsvg`), `make report` (needs LaTeX), `make guide` (needs Google Chrome). The included IEEEtran class is credited in [THIRD_PARTY.md](THIRD_PARTY.md).

The optional shared lower-level memory from the brief is not part of Phase I. This is a simulation prototype; hardware frequency and FPGA resources have not been measured.

**Phase I deadline: 16 November 2026, 11:59 PM IST.**
