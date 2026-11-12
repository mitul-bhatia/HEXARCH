# Starter tasks: one small, real contribution per member

The evaluators look at **who actually did what** in the commit history. Each member does their own task below, from their own GitHub account, and writes in the report (Section VI) what they really did. Nobody commits for someone else.

## A pattern worth knowing before you start

For a straight-line program that ends in HALT, with `N` instructions (including HALT) and `M` of them LOAD or STORE:

- Harvard completes in **N + 1** cycles.
- Shared completes in **N + 1 + M** cycles.

This matches all six existing scenarios (for example the demo: N = 3, M = 2 gives 4 and 6). So the shared-memory penalty is exactly the number of memory instructions. Use it to predict a result **on paper first**, then run the simulation to see whether you were right. If you are wrong, that is the interesting part to explain.

## One-time setup for every member

1. Mitul adds you as a collaborator on `mitul-bhatia/HEXARCH` (needs your GitHub username). Accept the invitation.
2. `git clone https://github.com/mitul-bhatia/HEXARCH.git && cd HEXARCH`
3. Install Icarus Verilog, then run `make demo` and `make test`. Both must pass before you change anything.
4. Set your own identity: `git config user.name "Your Name"` and `git config user.email "<the email on your GitHub account>"`.
5. Work on a branch named after your task, commit, push, and open a pull request for someone else to review. Do not push to `main`.

## Tasks

| Member | Part you own | Your task | Done when |
| --- | --- | --- | --- |
| **Akshat** | Instruction memory, PC | Add a test scenario for a **full 16-byte program**: fifteen NOPs (`00`) then HALT (`F0`) at address 15. Predict both cycle counts with the pattern above before running. | `make test` passes with your new scenario, and you can explain what the 4-bit PC does after fetching address 15 (it wraps to 0) and why HALT stops it from fetching again. |
| **Ajeesh** | Data memory, read/write control | Add a scenario with a **new data pattern**: seed `data[5] = 0x3C`, program `LOAD 5; STORE 6; LOAD 6; STORE 7; HALT` (bytes `15 26 16 27 F0`). Expected final `data[5..7]` are all `3C`. | `make test` passes. You can explain when the value is read versus written relative to the clock edge. |
| **Vaibhav** | Shared memory, address decoder | Add checks that in shared mode the physical address is **16** while `LOAD 0` reads and **17** while `STORE 1` writes, and that instruction fetches use addresses 0, 1, 2. Add a short annotated example to the docs. | The new checks pass, and you can explain why data wins the port. |
| **Hardik** | Testbench, waveforms | Add scenarios with **0, 1, 2 and 3 memory instructions**, and confirm the cycle counts follow the pattern above. Add a short waveform note describing what you saw. | Results appear in `results/summary.csv`, and your note says what the waveform shows for the blocked fetches. |
| **Mitul** | Integration, report, video | Replace the "proposed" contributions in the report with real ones, remove the draft notice, add the video link to `VIDEO.md`, and check that evaluators can open the repository. Rebuild with `make report`. | The report PDF is rebuilt and the repository opens from a different account. |

## Schedule (revised on 12 November)

| Date (IST) | Goal |
| --- | --- |
| 12-13 Nov | Everyone: setup, run the project, finish your task, open your pull request |
| 13 Nov | Review each other's pull requests and merge them; update the report's contributions section |
| 14 Nov | Record the video (script: `docs/MEMBER_SCRIPTS.md`); everyone runs the demo once beforehand |
| 15 Nov | Check access for evaluators; rebuild the report; rehearse interview questions |
| 16 Nov | Submit well before 11:59 PM IST |
