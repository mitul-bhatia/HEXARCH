# Starter tasks: one small, real contribution per member

**Easiest: open the [Team hub](https://mitul-bhatia.github.io/HEXARCH/team.html), click your name, and follow the steps there** (setup for your computer, copy buttons, your task and how to send it). This file has the same content.

Evaluators review **who did what** in the commit history. Each member does their own task from their own GitHub account. Nobody commits for anyone else. Roles are in [`TEAM_AND_PLAN.md`](TEAM_AND_PLAN.md).

## A pattern to use

For a straight-line program that ends in HALT, with `N` instructions (including HALT), of which `M` are LOAD or STORE:

- Harvard finishes in **N + 1** cycles.
- Shared finishes in **N + 1 + M** cycles.

All six scenarios and 2000 random programs (`make stress`) follow it. **Predict the counts on paper first**, then run the simulation.

## One-time setup

1. Install the tools:
   - **macOS:** `brew install icarus-verilog gh`
   - **Ubuntu/Debian:** `sudo apt-get install -y iverilog make python3 git gh`
   - **Windows:** use WSL. In PowerShell as administrator run `wsl --install -d Ubuntu`, restart, open *Ubuntu*, then run the Ubuntu command above and do every following step inside Ubuntu.
2. Sign in and get your own copy (no invitation needed; the repository is public): `gh auth login`, then `gh repo fork mitul-bhatia/HEXARCH --clone` and `cd HEXARCH`.
3. Set your own identity in this folder: `git config user.name "Your Full Name"` and `git config user.email "the email on your GitHub account"`. Use the email listed under GitHub → Settings → Emails, or the commits will not be linked to you.
4. `make demo` and `make test` must both pass before you change anything. They are tested with Icarus Verilog 12 and 13; if `make test` fails, send Mitul the last 20 lines of the output.

## How to submit your work

1. `git switch -c <yourname>-task`
2. Make your change **only inside your own marked slots** in `tb/tb_memory_compare.v` (search for your name in the `// ----` comments), in the files you own, and in any other file your task below names. The slots are spaced so four pull requests merge without conflicts (this was tested).
3. Run `make test` until it passes. **Do not commit `results/`**: Mitul regenerates it once after merging, so the pull requests do not collide.
4. `git add <your files>`, `git commit -m "Describe what you did"`, `git push -u origin <yourname>-task`
5. `gh pr create --fill --base main` (choose **mitul-bhatia/HEXARCH** if asked). The automatic check runs `make check`; wait for the green tick, ask another member to review, and tell Mitul.

## Tasks

### Akshat
**Instruction path.** Add mode 6: a full 16-byte program of fifteen NOPs (`8'h00`) followed by HALT (`8'hf0`) at address 15. Predict both cycle counts with the pattern, add `prepare(6); run_checked("full_program", ...)` in your run slot, and make it pass.
*Be ready to explain:* after fetching address 15 the 4-bit PC wraps to 0, and HALT stops any further fetch.

### Ajeesh
**Data path.** Add mode 7: seed `data[5] = 8'h3c`, program `LOAD 5; STORE 6; LOAD 6; STORE 7; HALT` (bytes `15 26 16 27 f0`), expected `data[5..7] = 3c`. Predict the counts, then run it.
*Be ready to explain:* when a value is read and when it is written relative to the clock edge (`rtl/data_memory.v` lines 13-15).

### Vaibhav
**Shared memory.** In your run slot, add checks for the demo program in shared mode: the physical address (`s.shared_path.physical_address`) is 16 while `LOAD 0` reads and 17 while `STORE 1` writes, and fetches use addresses 0, 1 and 2. Also check that the shared design makes exactly three fetches. Add a short worked example of this mapping to `docs/PROJECT_GUIDE.md`.
*Be ready to explain:* why data wins the single port (`rtl/simple_controller.v` line 28).

### Hardik
**Simulation.** Add modes 9, 10 and 11 with M = 1, 3 and 5 memory instructions (the existing scenarios already cover M = 0, 2, 4 and 6), run them in your run slot, and check that every count follows the pattern. Also add data[1] of both designs to the waveform: in your `$dumpvars` slot (it must run at time 0) add `$dumpvars(0, h.harvard_path.dmem.words[1], s.shared_path.mem.words[17]);`, so the VCD shows data[1] becoming 7.
*Be ready to explain:* what the waveform shows during the two blocked shared fetches.

### Mitul
**Integration.** Merge the four pull requests with **Create a merge commit** (it keeps each member as the author of their commits), then run `make check figures`. Update the places that say "six scenarios" (`grep -rn "six" README.md docs/`), add the new scenarios as rows of report Table I, and add one short clause per member to report Table II naming their merged work. Run `make report guide` and commit `results/`, figures and both PDFs. Record and upload the video, run `python3 scripts/set_video_link.py "LINK" DURATION`, merge, and submit the form.
*Be ready to explain:* how `memory_system.v` connects the same controller to both organizations.
