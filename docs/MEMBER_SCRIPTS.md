# Word-for-word video scripts (target 3:30)

Speak at a relaxed pace (about 130 words per minute; the five scripts total about 470 words, roughly 3:35, well under the 5-minute cap). Every number below was checked against `results/demo_output.txt`. Change the last line of Mitul's script to match the team's real status on the day of recording. Keep all five names visible on screen.

## 0:00-0:20 | All five | Opening
Show: title slide or README, with all five names.

- **Akshat:** "Hi, I'm Akshat Chauhan."
- **Ajeesh:** "I'm Ajeesh Amreet."
- **Vaibhav:** "I'm Vaibhav."
- **Hardik:** "I'm Hardik Maheshwari."
- **Mitul:** "And I'm Mitul Bhatia. We are Team HEXARCH, Section A. Our project is Instruction and Data Memory Hierarchy."

## 0:20-0:55 | Akshat | The idea and the instruction path
Show: `docs/figures/architecture.png`, pointing at the Harvard half.

"Instructions say what to do. Data is the value being worked on. We compare two ways of storing them. In a Harvard design, instructions and data have separate memories and ports, so the processor can fetch the next instruction while the current one uses data. In a shared design, both sit in one memory with one port, so they take turns. The program counter, or PC, picks the next instruction, and one instruction register holds the instruction that is running now."

## 0:55-1:30 | Ajeesh | The program and data memory
Show: the three-line program in the README, then `programs/demo.hex`.

"Our program is LOAD 0, STORE 1, and HALT. In memory these are the bytes 10, 21 and F0: the first digit is the operation, the second is the data address. Data address 0 starts with the value 7. LOAD copies the 7 into the accumulator, a single eight-bit register. STORE writes it into data address 1. HALT stops. Reads are immediate; the writes happen on the rising clock edge. Both designs must end with 7 at data address 1."

## 1:30-2:00 | Vaibhav | Why shared memory has to wait
Show: the Shared half of the diagram, then `rtl/address_decoder.v` and the `fetch_enable` line in `rtl/simple_controller.v`.

"Both designs hold 32 bytes in total. In the shared one, the address decoder maps instructions to addresses 0 to 15 and data to 16 to 31, behind one port. When LOAD or STORE needs that port, data wins: the next fetch is blocked, the program counter holds, and the instruction is fetched a cycle later. In the code this is one rule: fetch is switched off whenever shared mode has a data access."

## 2:00-3:00 | Hardik | Live demo
Run: `make demo`. Then show `docs/figures/waveforms.png` or open `results/demo.vcd`.

"Let's run make demo. Each row is one clock cycle; F, R and W mean fetch, data read and data write. In cycle 2, Harvard fetches STORE while LOAD reads data, so fetch and read are both 1. Shared memory cannot: its fetch is 0, because the single port is busy. In cycle 3, Harvard fetches HALT while STORE writes the 7. Harvard executes HALT in cycle 4, so it finishes in four cycles. Shared memory fetches STORE in cycle 3, writes in cycle 4, fetches HALT in cycle 5 and executes it in cycle 6. Six cycles; the extra two are the two blocked fetches. Both designs end with 7 at data address 1."

## 3:00-3:30 | Mitul | Verification and wrap-up
Run: `make test`. Show the six PASS lines, the report PDF and the repository.

"Finally, make test runs six scenarios, including boundary addresses, HALT only, an invalid opcode and a mid-program reset. All six pass. The program with no data accesses takes four cycles in both designs, so separate paths only help when a fetch and a data access would otherwise compete. This is a simulation of one small model, not a universal speedup claim. Our repository has the Verilog, testbench, diagrams, waveforms, results and an IEEE-format report. [Say the team's real remaining work here.] Thank you."
