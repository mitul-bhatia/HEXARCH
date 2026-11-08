# Check against the supplied project brief

The scope is a **small Verilog Harvard memory organization, a simple controller, and a shared single-port comparison**. The short program is `LOAD 0; STORE 1; HALT`. It copies one byte and exposes the required simultaneous access opportunity.

## Technical requirements

| Requested item | Evidence in this project |
| --- | --- |
| Separate instruction and data paths | `rtl/memory_system.v` instantiates independent instruction and data memories in Harvard mode |
| Simple processor or controller | `rtl/simple_controller.v`: PC, one instruction register, one accumulator, and memory controls |
| Program counter | `rtl/program_counter.v`; tests check advance on fetch and hold during a blocked fetch |
| Instruction memory | `rtl/instruction_memory.v`; 16 x 8 bits, loaded from the program hex file |
| Data memory and read/write control | `rtl/data_memory.v` and `rtl/read_write_control.v`; expected values and exact access counts checked |
| Address decoding and organization | `rtl/address_decoder.v`; shared addresses 0-15 contain instructions and 16-31 contain data |
| Execute programs with fetches and data accesses | `make demo` runs LOAD/STORE/HALT; `make test` exercises six scenarios |
| Analyze simultaneous access | Harvard overlaps fetch/data in cycles 2 and 3; shared memory permits one access per cycle |
| Harvard architecture RTL | All implementation modules in `rtl/` |
| Block diagram | `docs/figures/architecture.png` and editable SVG |
| Simulation waveforms | `results/demo.vcd`, sampled CSV, and `docs/figures/waveforms.png` |
| Shared-memory comparison | Same controller, program, data, capacity, and clock period; measured demo: 4 versus 6 cycles |
| Correct separation and control | Testbench checks all data words, unchanged instructions, exactly-once operations, and exclusive shared-port use |
| Timing behavior | Combinational reads, rising-edge writes, synchronous reset, PC hold, halt, and store-to-load checks |
| Optional shared lower-level memory | Omitted; explicitly optional in the supplied brief |

The one-register fetch/execute overlap demonstrates concurrent access. Caches, a full instruction set, a frontend, and board deployment are outside this implementation's scope.

## Phase I: 30%

| Requirement | Marks | Status |
| --- | ---: | --- |
| IEEE report: abstract, literature review, proposed solution, individual contributions, references | 10 | Draft PDF and LaTeX supplied; contribution section is clearly marked proposed |
| Video, maximum 5 minutes: idea, all five names, working/progress | 15 | A 3:30 script covers all items; recording and accessible link remain |
| GitHub: report, video link, source, artifacts, meaningful individual history | 5 | Private [HEXARCH repository](https://github.com/mitul-bhatia/HEXARCH) created; member contributions, video link, and evaluator access remain |

**Phase I is not fully ready to submit until the team completes those remaining items.** The deadline provided is **November 16, 2026, 11:59 PM IST**. The team confirmed **Section A** on November 8.

## Phase II: 70%

The report contains preliminary results/discussion and a conclusion. Continue developing the same repository, replace proposed contributions with actual work, and prepare each member to explain the implementation and their commits. Interview slots were not specified in the supplied notice.

## This simplification pass: November 8, 2026

The main demo was reduced from a seven-instruction copy chain to one LOAD, one STORE, and HALT. Its new measured counts are 4 and 6; the earlier 8 and 14 counts described the longer program, which is retained only for the reset verification scenario. `make demo` now prints a six-cycle table and creates a short VCD. All six verification scenarios still pass.
