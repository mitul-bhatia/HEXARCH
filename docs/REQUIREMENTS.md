# Check against the project brief and the Phase I rubric

## Project brief (Project 9)

| Brief item | Evidence in this repository | Status |
| --- | --- | --- |
| Von Neumann vs Harvard architecture | `rtl/memory_system.v`: `SHARED_BUS=0` builds the Harvard organization, `SHARED_BUS=1` a von Neumann-style single shared memory, with the same controller | Met |
| Program Counter | `rtl/program_counter.v`; tests check advance on fetch and hold during a blocked fetch | Met |
| Instruction Memory | `rtl/instruction_memory.v`, 16 x 8 bits, loaded from `programs/demo.hex` | Met |
| Data Memory | `rtl/data_memory.v`, 16 x 8 bits, loaded from `programs/data.hex`; combinational read, rising-edge write | Met |
| Address Decoder | `rtl/address_decoder.v`: in the shared memory, instructions at 0-15 and data at 16-31. In the Harvard memories each 4-bit address is used directly | Met |
| Read/Write Control | `rtl/read_write_control.v` decodes the instruction into LOAD (read), STORE (write), HALT and illegal; `rtl/simple_controller.v` lines 25-28 gate these into the read, write and fetch enables | Met |
| Optional Shared Lower-Level Memory | Not implemented (optional); named as a Phase II extension in the report | Optional |
| Independent instruction and data paths | `rtl/memory_system.v`, `harvard_path` block | Met |
| Connected to a simple processor or controller | `rtl/simple_controller.v`: PC, instruction register with valid bit, accumulator | Met |
| Execute programs with fetches and data accesses | `make demo` (LOAD/STORE/HALT), `make test` (six scenarios), `make stress` (2000 random programs) | Met |
| Analyze simultaneous access opportunities | Cycle-by-cycle demo table; overlap and stall counts per scenario; cycle model Harvard = N+1, shared = N+1+M, confirmed on all scenarios and 2000 random programs | Met |
| Deliverable: Harvard memory architecture RTL | `rtl/` | Met |
| Deliverable: block diagram | `docs/figures/architecture.png` (editable SVG beside it), report Fig. 1 | Met |
| Deliverable: simulation waveforms | `results/demo.vcd`, `results/memory_compare.vcd`, `docs/figures/waveforms.png`, report Fig. 2 | Met |
| Deliverable: comparison with shared memory | Same controller, program, data, 32-byte capacity and clock; demo 4 vs 6 cycles; report Table I and cycle model | Met |
| Evaluation: separation, memory control, timing, comparison | Testbench checks every data word, unchanged instructions, exact operation counts, PC advance/hold, exclusive shared-port use and halt behaviour | Met |

## Phase I rubric (30%)

| Requirement | Marks | Evidence | Status |
| --- | ---: | --- | --- |
| IEEE report with abstract, literature review, proposed solution, individual contributions, references | 10 | [`output/pdf/HEXARCH_Phase_I_Report.pdf`](../output/pdf/HEXARCH_Phase_I_Report.pdf), IEEEtran source in `docs/report/` | Ready; rebuild after the member pull requests are merged |
| Video at most 5 minutes: idea, all five names, working prototype | 15 | [Recording guide](VIDEO_SCRIPT.md) and title card | **To do:** record and upload |
| GitHub: report, video link, prototype files, artefacts | 5 | This repository; [`VIDEO.md`](../VIDEO.md) holds the video link | **To do:** add the video link |
| GitHub: every member's meaningful contribution in the commit history | (part of the 5) | [Starter tasks](MEMBER_TASKS.md) | **To do:** each member's own pull request |

Deadline: **16 November 2026, 11:59 PM IST**. The plan and checklist are in [`TEAM_AND_PLAN.md`](TEAM_AND_PLAN.md).
