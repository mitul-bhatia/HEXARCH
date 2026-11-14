# Video recording guide

This is the only video script. Read it once from top to bottom before recording day.

**The video must:** stay at or under **5:00** · state the project idea · introduce all **five** members by full name · show the working prototype (Verilog, block diagram, simulation).
**This plan:** 7 scenes, about **3:40 of speech** and about **4:40 with screen actions**, leaving about 20 seconds spare.

## 1. Who does what

One laptop does all the screen work. Mitul is the **driver**: he types the commands and switches windows when a speaker reaches a cue word. Speakers do not touch the keyboard.

| Member | Owns in the project | Scene | Shows on screen |
| --- | --- | --- | --- |
| Mitul Bhatia | Integration: `memory_system.v`, `simple_controller.v`, build, report, repository, video | 1 and 7, and drives | Title card, test result, report, GitHub page |
| Akshat Chauhan | Instruction path: `program_counter.v`, `instruction_memory.v` | 2 | Block diagram (Harvard half), `program_counter.v` |
| Ajeesh Amreet | Data path: `data_memory.v`, `read_write_control.v` | 3 | Program in the README, `programs/demo.hex`, `data_memory.v` |
| Vaibhav | Shared memory: `shared_memory.v`, `address_decoder.v`, the fetch-stall rule | 4 | Block diagram (shared half), `address_decoder.v`, line 28 of `simple_controller.v` |
| Hardik Maheshwari | Simulation: testbenches, results, waveforms | 5 and 6 | Terminal running `make demo` and `make test`, waveform image |

## 2. Setup, 30 minutes before

**Recording, choose one:**
- **Same room (simplest).** On the Mac press `Cmd + Shift + 5`, choose *Record Entire Screen*, then *Options → Microphone → MacBook Microphone*. Everyone sits close to the laptop.
- **Online.** Start a Zoom or Google Meet call. Everyone sets their display name to their full name. Mitul shares his entire screen and starts the call's recording. Cameras on for the opening are a plus, not required.

**Prepare the laptop:**
1. Turn on *Do Not Disturb* and close chat apps, mail and unrelated tabs.
2. Set the editor and terminal font to 18 pt or larger, so code is readable in the video.
3. In the terminal: `cd` into the project folder, then run `make demo` and `make test` once, and check both pass. Then type `clear`.
4. Open these before recording (as editor tabs or browser tabs). Each scene below starts with a **Driver, before speaking** line saying which one to show:

| # | Open this | Used in scene |
| --- | --- | --- |
| 1 | `docs/video/title_card.png`, full screen | 1 |
| 2 | `docs/figures/architecture.png` | 2, 4 |
| 3 | `rtl/program_counter.v` | 2 |
| 4 | `README.md` (scroll to the three-line program) | 3 |
| 5 | `programs/demo.hex` | 3 |
| 6 | `rtl/data_memory.v` | 3 |
| 7 | `rtl/address_decoder.v` | 4 |
| 8 | `rtl/simple_controller.v`, scrolled to line 28 | 4 |
| 9 | Terminal, cleared | 5, 6, 7 |
| 10 | `docs/figures/waveforms.png` | 5 |
| 11 | `output/pdf/HEXARCH_Phase_I_Report.pdf`, page 1 | 7 |
| 12 | https://github.com/mitul-bhatia/HEXARCH in a browser | 7 |
| 13 | `docs/video/end_card.png` | end |

5. Give a phone stopwatch to someone who is not speaking in the current scene. Rehearse once without recording.

## 3. Shot list

| Scene | Time | Speaker | On screen |
| --- | --- | --- | --- |
| 1 | 0:00-0:25 | Mitul, then everyone | Title card with all five names |
| 2 | 0:25-1:10 | Akshat | Block diagram, Harvard half → `program_counter.v` |
| 3 | 1:10-1:55 | Ajeesh | README program → `demo.hex` → `data_memory.v` |
| 4 | 1:55-2:35 | Vaibhav | Block diagram, shared half → `address_decoder.v` → `simple_controller.v` line 28 |
| 5 | 2:35-3:40 | Hardik | Terminal: `make demo` → `waveforms.png` |
| 6 | 3:40-3:58 | Hardik | Terminal: `make test` |
| 7 | 3:58-4:35 | Mitul | `no_data_access` line on the terminal → report page 1 → GitHub page → end card |

## 4. Exact words

**Bold words in brackets** are the driver's cues: when the speaker reaches that word, the driver switches window. **Speakers do not read the bracketed words aloud.**

### Scene 1 · 0:00-0:25 · Mitul, then everyone
*Driver, before speaking: show the title card (#1) full screen, then start recording.*

- **Mitul:** "We are Team HEXARCH from Section A. Our project is Project 9, Instruction and Data Memory Hierarchy."
- **Akshat:** "I'm Akshat Chauhan."
- **Ajeesh:** "I'm Ajeesh Amreet."
- **Vaibhav:** "I'm Vaibhav."
- **Hardik:** "I'm Hardik Maheshwari."
- **Mitul:** "And I'm Mitul Bhatia."

### Scene 2 · 0:25-1:10 · Akshat
*Driver, before speaking: show `architecture.png` (#2), cursor on the Harvard half.*

"Our idea is simple. Instructions say what to do; data is the value being worked on. In a Harvard design they have separate memories and separate ports, so the controller can fetch the next instruction while the current one reads or writes data. In a von Neumann-style design, both live in one memory with one port, so they take turns. **[program counter]** This is our program counter. On each clock edge it adds one, but only when a fetch is accepted; otherwise it holds."

*Driver: at* **program counter**, *switch to `rtl/program_counter.v` and point at lines 7-9.*

### Scene 3 · 1:10-1:55 · Ajeesh
*Driver, before speaking: show `README.md` (#4), scrolled to the three-line program.*

"Our program has three instructions: LOAD 0, STORE 1, HALT. **[In memory]** In memory they are the bytes 10, 21 and F0. The first hex digit is the operation; the second is the data address. Data address 0 starts at 7. **[data memory]** This is our data memory, sixteen bytes. A read is ready within the same cycle; a write happens on the rising clock edge. LOAD copies 7 into the accumulator, STORE writes it to address 1, and HALT stops."

*Driver: at* **In memory**, *switch to `programs/demo.hex`. At* **data memory**, *switch to `rtl/data_memory.v` and point at lines 13-15.*

### Scene 4 · 1:55-2:35 · Vaibhav
*Driver, before speaking: show `architecture.png` (#2) again, cursor on the shared half.*

"Both designs hold thirty-two bytes in total. In the shared design, one memory has one port. **[address decoder]** Our address decoder puts instructions at addresses 0 to 15 and data at 16 to 31. **[This line]** This line in the controller is the key rule: in shared mode, fetch is switched off during a LOAD or STORE. So the program counter holds, and the next instruction is fetched one cycle later."

*Driver: at* **address decoder**, *switch to `rtl/address_decoder.v` (lines 8-9). At* **This line**, *switch to `rtl/simple_controller.v` and highlight line 28.*

### Scene 5 · 2:35-3:40 · Hardik
*Driver, before speaking: show the terminal (#9), type `make demo` and press Enter.*

"I'll run make demo. Each row is one clock cycle. F, R and W mean instruction fetch, data read and data write. In cycle 2, Harvard fetches STORE while LOAD reads data, so fetch and read are both 1. Shared fetch is 0, because its one port is busy. In cycle 3, Harvard fetches HALT while STORE writes the 7. Harvard executes HALT in cycle 4, so it finishes in four cycles. Shared needs six; the two extra cycles are the two blocked fetches. Both end with 7 at data address 1. **[waveform]** The waveform shows the same: Harvard fetch overlaps the read and the write; shared fetch never does."

*Driver: point at rows 2, 3, 4 and 6 as Hardik mentions them. At* **waveform**, *switch to `docs/figures/waveforms.png`.*

### Scene 6 · 3:40-3:58 · Hardik
*Driver, before speaking: go back to the terminal (#9), type `clear; make test` and press Enter.*

"Our testbench checks all of this automatically. make test runs every scenario, including boundary addresses, an invalid opcode and a mid-program reset. All of them pass."

### Scene 7 · 3:58-4:35 · Mitul
*Driver, before speaking: stay on the `make test` output and point at the `no_data_access` line (Harvard=4, shared=4).*

"With no data accesses, both designs take four cycles. So separate paths help only when a fetch and a data access would compete; in our model the shared design needs exactly one extra cycle per LOAD or STORE. This is a small simulation model, not a general speed-up claim. **[report]** Our IEEE-format report **[repository]** and our repository have the Verilog, the testbenches, block diagrams, waveforms and results."

Then say **one** of these, whichever is true on recording day:
- If every member's own pull request is merged: "Each of us also added our own test or improvement, which you can see in our commit history. Thank you."
- Otherwise: "Next, each of us is adding our own improvement from our own GitHub account. Thank you."

*Driver: at* **report**, *switch to the report PDF. At* **repository**, *switch to the GitHub page and scroll once. After "Thank you", show the end card for two seconds, then stop recording.*

## 5. If something goes wrong

- **`make demo` fails or the tools are missing:** type `cat results/demo_output.txt` and say "This is the saved output of the same command." Keep going.
- **`make test` fails:** type `clear; cat results/test_output.txt` and say the same sentence. Scene 7 can still point at its `no_data_access` line.
- **Someone stumbles:** keep going. Restart only if two things go wrong or a name is missed.
- **Running long:** if the stopwatch passes 4:40 during scene 7, skip straight to "Thank you".
- **Scenario count changed:** if new tests were merged, the terminal shows a number other than 6. The words above deliberately say "every scenario", so nothing needs changing.

## 6. After recording

1. Watch the whole video once. Check that it is **at most 5:00**, all five names are heard and the code is readable. If it is too long, trim pauses at the start and end (QuickTime: *Edit → Trim*).
2. Upload it either to **YouTube as Unlisted** (not Private) or to **Google Drive**, with *Share → General access → Anyone with the link → Viewer*.
3. Open the link in a private/incognito window while logged out. It must play.
4. Put the link and the exact duration in [`VIDEO.md`](../VIDEO.md), commit and push.
5. Submit the repository link in the form (see [`TEAM_AND_PLAN.md`](TEAM_AND_PLAN.md)).
