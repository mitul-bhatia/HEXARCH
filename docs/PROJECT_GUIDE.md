# Explain the project simply

For the full illustrated version, open the [study guide](https://mitul-bhatia.github.io/HEXARCH/).

**Instructions say what to do. Data is the value being used.** Our controller copies the value 7 from data address 0 to data address 1.

The brief asks us to compare **von Neumann** and **Harvard** organizations. In a von Neumann-style design, instructions and data share one memory and one port. In a Harvard design they have separate memories and ports. We build both from the same controller and compare them cycle by cycle.

## The whole demonstration

```text
LOAD 0 -> STORE 1 -> HALT
```

The accumulator (ACC) is one eight-bit register that temporarily holds the value. The program counter (PC) points to the next instruction. A separate instruction register holds the current instruction.

| Cycle | Harvard fetch | Harvard executes | Shared fetch | Shared executes |
| ---: | --- | --- | --- | --- |
| 1 | LOAD 0 | Empty | LOAD 0 | Empty |
| 2 | STORE 1 | LOAD 0 | Blocked | LOAD 0 |
| 3 | HALT | STORE 1 | STORE 1 | Empty |
| 4 | None | HALT | Blocked | STORE 1 |
| 5 | Stopped | Stopped | HALT | Empty |
| 6 | Stopped | Stopped | None | HALT |

**Why 4 versus 6 cycles?** Harvard fetches the next instruction while LOAD or STORE accesses data. Shared memory has only one port, so each of those two data accesses delays fetching by one cycle. Both designs produce `data[1] = 7`.

**The general rule.** For a straight-line program of `N` instructions (including HALT) with `M` LOAD/STORE instructions, Harvard takes `N + 1` cycles and shared takes `N + 1 + M`. The demo has N = 3 and M = 2. All six test scenarios and 2000 random programs (`make stress`) follow this rule.

This one-register fetch/execute overlap is the only pipelining needed. A valid bit prevents an old instruction from running again when no new instruction was fetched.

## What each module does

| File in `rtl/` | Purpose |
| --- | --- |
| `program_counter.v` | Advances the instruction address only when a fetch is accepted |
| `instruction_memory.v` | Holds 16 instruction bytes |
| `data_memory.v` | Holds 16 data bytes; reads within the cycle, writes on the rising edge |
| `read_write_control.v` | Decodes the instruction into LOAD (read), STORE (write), HALT and illegal; opcode 0 is NOP |
| `simple_controller.v` | Holds ACC and the current instruction; turns the decoded instruction into the read, write and fetch enables (lines 25-28) |
| `address_decoder.v` | Shared memory only: maps instruction offsets to addresses 0-15 and data offsets to 16-31 |
| `shared_memory.v` | Holds all 32 bytes behind one port |
| `memory_system.v` | Connects the same controller to either organization |

In `memory_system`, `SHARED_BUS=0` selects Harvard and `SHARED_BUS=1` selects shared memory. Two 16-byte memories and one 32-byte memory provide equal total capacity.

## Three timing rules to remember

1. Reads settle before the rising clock edge. LOAD captures the value at the edge; STORE writes at the edge.
2. A shared-memory data access blocks instruction fetch, so PC holds. The next cycle fetches the delayed instruction.
3. Reset clears controller state and suppresses requests, while retaining memory. HALT stops further requests.

Eight-bit instruction encoding: upper nibble `1` = LOAD, `2` = STORE, `F` = HALT, and `0` = NOP. The lower nibble is the data address for LOAD/STORE. Thus the demo's hex bytes are `10 21 F0`. Other opcodes stop with a fault flag.

## What to show in the interview

Run `make demo`. Explain cycle 2: Harvard's fetch and read signals are both 1, while shared memory's fetch signal is 0. Explain cycle 3: Harvard fetches HALT while writing 7. Then show that both memories finish with the same correct value.

Open `results/demo.vcd` in a waveform viewer such as GTKWave. Under `tb_memory_compare.h` and `.s`, inspect `clk`, `reset`, `pc`, `instruction_register`, `execute_valid`, `fetch_enable`, `data_read_enable`, `data_write_enable`, `data_address`, `accumulator` and `halted`. The shared physical address is under `s.shared_path.physical_address`.

Run `make test` to show the verification scenarios and `make stress` for the random programs. The no-data test takes four cycles in both designs: separate paths help only when accesses would otherwise compete. Do not present the demo's cycle difference as a universal processor speedup.

The 10-ns test clock is a simulation setting. Programs must fit in the 16-byte instruction image and terminate with HALT. Describe your own completed work and its commits when asked about contributions.
