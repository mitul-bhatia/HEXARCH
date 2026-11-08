# Prototype video: target 3 minutes 30 seconds

Team HEXARCH, Section A. Introduce all five names and show the actual simulation. This is a recording script; the video has not been recorded. Adjust speaking roles to match the work each member has completed.

| Time | Speaker | Show and explain |
| --- | --- | --- |
| 0:00-0:30 | All five | Project title; each person introduces their full name |
| 0:30-1:00 | Akshat | Instruction path and PC in the block diagram |
| 1:00-1:30 | Ajeesh | LOAD 0 / STORE 1 / HALT and data memory |
| 1:30-2:00 | Vaibhav | Shared memory, address decoder, and blocked fetch |
| 2:00-3:00 | Hardik | Run `make demo`; show waveform and correct result |
| 3:00-3:30 | Mitul | Run `make test`; show report and repository artifacts |

## Opening: everyone

“We are Team HEXARCH from Section A. Our project is Instruction and Data Memory Hierarchy.”

Each member introduces themselves: **Akshat Chauhan, Ajeesh Amreet, Vaibhav, Hardik Maheshwari, and Mitul Bhatia**. Keep all five names visible on screen.

## Akshat: the idea

Show `docs/figures/architecture.png`.

“We compare separate instruction and data memories with a shared single-port memory. The program counter selects the next instruction. One instruction register holds the current instruction, allowing its execution to overlap fetching the next one.”

## Ajeesh: the program

Show the three instructions in the README.

“Our program is LOAD zero, STORE one, then HALT. Data address zero starts with seven. LOAD puts seven in the accumulator, STORE writes it to data address one, and HALT stops execution. Both memory designs must produce the same result. Reads settle before the rising edge; writes occur at that edge.”

## Vaibhav: why shared memory waits

Point to the shared-memory diagram and `rtl/address_decoder.v`.

“Both designs have thirty-two bytes in total. Shared memory uses addresses zero to fifteen for instructions and sixteen to thirty-one for data. Its single port handles either a fetch or a data access. LOAD and STORE take priority, so the next fetch waits and PC holds.”

## Hardik: live demonstration

Run `make demo`. Explain that `F/R/W` means instruction fetch, data read, and data write. Show `docs/figures/waveforms.png`, or `results/demo.vcd` in a waveform viewer.

“In cycle two, Harvard fetch and read are both one. In cycle three, Harvard fetch and write are both one. Shared memory never performs these together. Both designs finish with seven at data address one. Harvard completes in four cycles and shared memory in six, including first fetch and HALT. The two extra cycles come from the two blocked fetches.”

## Mitul: verification and progress

Run `make test` and show the PASS lines, report PDF, and project files.

“All six verification scenarios pass, including boundary addresses and reset. A program without data accesses takes the same number of cycles in both designs. Our artifacts include Verilog RTL, a testbench, block diagrams, waveforms, measured results, and an IEEE-format report draft.”

Finish by stating the team's actual remaining work. Refer to the local project folder until the GitHub repository is published. Add the final recording link and duration to `VIDEO.md`, check access, and keep the video **at most five minutes**.
