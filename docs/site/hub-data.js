// Content for the Team hub page (team.html). Edit the text here; the page renders it.
// The video words must stay identical to docs/VIDEO_SCRIPT.md:
// `python3 scripts/check_site.py` fails if they differ. [[word]] marks a driver cue.
window.HUB = {
 "repo": "https://github.com/mitul-bhatia/HEXARCH",
 "deadline": "16 November 2026, 11:59 PM IST",
 "install": {
  "macos": {
   "label": "macOS",
   "note": "Open the **Terminal** app. If `brew` is not found, first install Homebrew from [brew.sh](https://brew.sh) (one command, then follow what it prints).",
   "code": "brew install icarus-verilog gh\niverilog -V | head -1"
  },
  "ubuntu": {
   "label": "Ubuntu / Debian",
   "note": "Open a terminal. It asks for your computer password once.",
   "code": "sudo apt-get update\nsudo apt-get install -y iverilog make python3 git gh\niverilog -V | head -1"
  },
  "windows": {
   "label": "Windows",
   "note": "Windows uses Ubuntu inside WSL. Open **PowerShell as administrator**, run the first line, and restart the computer. Then open the **Ubuntu** app from the Start menu, create a username and password, and run the other lines there. Do every later step inside Ubuntu.",
   "code": "wsl --install -d Ubuntu\n\n# after restarting, inside the Ubuntu app:\nsudo apt-get update\nsudo apt-get install -y iverilog make python3 git gh\niverilog -V | head -1"
  }
 },
 "setup": [
  {
   "title": "Install the tools",
   "text": "You need Icarus Verilog (the simulator), Make, Python 3, Git and the GitHub command line `gh`. Pick your computer:",
   "install": true,
   "after": "The last line should print **Icarus Verilog version 12** or newer."
  },
  {
   "title": "Sign in to GitHub and get your own copy",
   "text": "`gh auth login` asks a few questions: choose **GitHub.com**, **HTTPS**, **Yes** to authenticate Git, and **Login with a web browser**. Then `gh repo fork` makes your own copy of the project on GitHub and downloads it.",
   "code": "gh auth login\ngh repo fork mitul-bhatia/HEXARCH --clone\ncd HEXARCH",
   "after": "You do not need an invitation for this: the project is public, and your pull request comes from your own copy."
  },
  {
   "title": "Put your name on your commits",
   "text": "Use the email that is on your GitHub account (GitHub → Settings → Emails), otherwise your commits are not linked to you and do not count as your contribution.",
   "code": "git config user.name \"{fullname}\"\ngit config user.email \"you@example.com\""
  },
  {
   "title": "Check that everything runs",
   "text": "Run both before changing anything.",
   "code": "make demo\nmake test",
   "after": "`make demo` ends with **DEMO PASSED** and `make test` ends with **ALL TESTS PASSED (6 scenarios)**. If either fails, send Mitul the last 20 lines of the output."
  },
  {
   "title": "Make a branch for your work",
   "code": "git switch -c {id}-task"
  }
 ],
 "members": [
  {
   "id": "akshat",
   "name": "Akshat Chauhan",
   "short": "Akshat",
   "color": "#145f9b",
   "role": "Instruction path",
   "owns": [
    "rtl/program_counter.v",
    "rtl/instruction_memory.v",
    "programs/demo.hex"
   ],
   "scenes": [
    1,
    2
   ],
   "task": {
    "title": "Add a full 16-byte program test (mode 6)",
    "why": "It checks the instruction path at its limit: all sixteen instruction addresses are used, and the 4-bit program counter wraps from 15 back to 0.",
    "steps": [
     {
      "title": "Add the program (mode 6)",
      "text": "Open `tb/tb_memory_compare.v` and search for `Mode 6 (Akshat)`. On the empty line under that comment, add case 6. Every address starts as HALT (`8'hf0`), so put NOP (`8'h00`) at addresses 0 to 14 and leave the HALT at address 15.",
      "code": "6: begin\n    // put 8'h00 (NOP) into image[0] .. image[14]\nend"
     },
     {
      "title": "Predict the cycle counts on paper",
      "text": "Use the rule: **Harvard = N + 1**, **shared = N + 1 + M**, where N = instructions including HALT and M = LOAD/STORE instructions. Here N = 16 and M = 0.",
      "question": "What are the Harvard and shared cycle counts?"
     },
     {
      "title": "Run it",
      "text": "Search for `Akshat: run mode 6` and add one line under it, with your two predictions in place of `H` and `S`. The arguments are: name, Harvard cycles, shared cycles, number of LOAD/STORE operations, final ACC, fault expected, record trace.",
      "code": "prepare(6); run_checked(\"full_program\", H, S, 0, 0, 0, 0);"
     },
     {
      "title": "Test",
      "code": "make test",
      "after": "You should see a new line `PASS full_program ...` and **ALL TESTS PASSED (7 scenarios)**. A `FAIL` line names the check that failed."
     },
     {
      "title": "Send your work as a pull request",
      "text": "Add **only your own files**. `make test` also rewrites `results/`; do not add it, because Mitul regenerates it once after merging.",
      "code": "git add tb/tb_memory_compare.v\ngit commit -m \"Add full 16-byte program test (mode 6)\"\ngit push -u origin {id}-task\ngh pr create --fill --base main",
      "after": "If `gh pr create` asks where to open the pull request, choose **mitul-bhatia/HEXARCH**. Then ask one other member to review it and tell Mitul it is ready. The automatic check on the pull request runs `make check`; a green tick means it passed."
     }
    ],
    "answer": "// in the Mode 6 slot\n6: begin for (i = 0; i < 15; i = i + 1) image[i] = 8'h00; end\n\n// in the run slot\nprepare(6); run_checked(\"full_program\",17,17,0,0,0,0);",
    "answerNote": "16 instructions and no data access, so both designs take 16 + 1 = 17 cycles.",
    "files": "tb/tb_memory_compare.v",
    "message": "Add full 16-byte program test (mode 6)",
    "explain": [
     "After fetching address 15, the 4-bit PC wraps to 0. HALT stops any further fetch, so the program does not run again.",
     "Why both designs take the same time here: with no LOAD or STORE, nothing competes with the fetch.",
     "Your video lines: scene 2, the idea and the program counter (`rtl/program_counter.v` lines 7-9)."
    ]
   }
  },
  {
   "id": "ajeesh",
   "name": "Ajeesh Amreet",
   "short": "Ajeesh",
   "color": "#17745c",
   "role": "Data path",
   "owns": [
    "rtl/data_memory.v",
    "rtl/read_write_control.v",
    "programs/data.hex"
   ],
   "scenes": [
    1,
    3
   ],
   "task": {
    "title": "Add a data copy-chain test (mode 7)",
    "why": "It checks that a value written by STORE can be read back by the next LOAD, through three data addresses.",
    "steps": [
     {
      "title": "Add the program and data (mode 7)",
      "text": "Open `tb/tb_memory_compare.v` and search for `Mode 7 (Ajeesh)`. Add case 7 under it. The program is `LOAD 5; STORE 6; LOAD 6; STORE 7; HALT`. Work out its bytes (first hex digit = operation: 1 LOAD, 2 STORE, F HALT; second = address). HALT is already everywhere else. Start `data[5]` at `8'h3c`, and say which data words must hold `3c` at the end.",
      "code": "7: begin\n    image[0]=8'h__; image[1]=8'h__; image[2]=8'h__; image[3]=8'h__;\n    seed[5]=8'h3c;\n    expected[5]=8'h3c; expected[_]=8'h3c; expected[_]=8'h3c;\nend"
     },
     {
      "title": "Predict the cycle counts on paper",
      "text": "Rule: **Harvard = N + 1**, **shared = N + 1 + M**. Count N (all instructions including HALT) and M (LOAD/STORE only).",
      "question": "What are N, M, and the two cycle counts?"
     },
     {
      "title": "Run it",
      "text": "Search for `Ajeesh: run mode 7` and add one line. Arguments: name, Harvard cycles, shared cycles, number of LOAD/STORE operations, final ACC, fault expected, record trace.",
      "code": "prepare(7); run_checked(\"data_copy_chain\", H, S, M, 8'h3c, 0, 0);"
     },
     {
      "title": "Test",
      "code": "make test",
      "after": "You should see `PASS data_copy_chain ...` and **ALL TESTS PASSED (7 scenarios)**."
     },
     {
      "title": "Send your work as a pull request",
      "text": "Add **only your own files**. `make test` also rewrites `results/`; do not add it, because Mitul regenerates it once after merging.",
      "code": "git add tb/tb_memory_compare.v\ngit commit -m \"Add data copy-chain test (mode 7)\"\ngit push -u origin {id}-task\ngh pr create --fill --base main",
      "after": "If `gh pr create` asks where to open the pull request, choose **mitul-bhatia/HEXARCH**. Then ask one other member to review it and tell Mitul it is ready. The automatic check on the pull request runs `make check`; a green tick means it passed."
     }
    ],
    "answer": "// in the Mode 7 slot\n7: begin\n    image[0]=8'h15; image[1]=8'h26; image[2]=8'h16; image[3]=8'h27;\n    seed[5]=8'h3c; expected[5]=8'h3c; expected[6]=8'h3c; expected[7]=8'h3c;\nend\n\n// in the run slot\nprepare(7); run_checked(\"data_copy_chain\",6,10,4,8'h3c,0,0);",
    "answerNote": "N = 5 and M = 4, so Harvard takes 6 cycles and shared takes 10.",
    "files": "tb/tb_memory_compare.v",
    "message": "Add data copy-chain test (mode 7)",
    "explain": [
     "When a value is read and when it is written: a read is ready within the same cycle, and a write happens on the rising clock edge (`rtl/data_memory.v` lines 13-15).",
     "Why the LOAD 6 right after STORE 6 sees the new value: the write happened at the clock edge before the LOAD reads.",
     "Your video lines: scene 3, the program bytes and data-memory timing."
    ]
   }
  },
  {
   "id": "vaibhav",
   "name": "Vaibhav",
   "short": "Vaibhav",
   "color": "#a54c13",
   "role": "Shared memory",
   "owns": [
    "rtl/shared_memory.v",
    "rtl/address_decoder.v",
    "the fetch-stall rule"
   ],
   "scenes": [
    1,
    4
   ],
   "task": {
    "title": "Check the shared physical addresses",
    "why": "It proves the address decoder works: in the shared memory, instructions sit at 0-15 and data at 16-31.",
    "steps": [
     {
      "title": "Work out the addresses on paper",
      "text": "Run the demo program `LOAD 0, STORE 1, HALT` in the shared design. The decoder adds 16 to every data address.",
      "question": "Which physical address does LOAD 0 read, which does STORE 1 write, and which addresses do the three fetches use?"
     },
     {
      "title": "Add the checks",
      "text": "Open `tb/tb_memory_compare.v`, search for `Vaibhav: add the shared` and add this block under it. It runs the demo again while two watchers check the address. Fill in the blanks with your answers.",
      "code": "prepare(0);\nfork\n    run_checked(\"shared_addresses\",4,6,2,7,0,0);\n    begin\n        @(posedge s_read);  #1 check(s.shared_path.physical_address == __, \"LOAD 0 reads physical address __\");\n        @(posedge s_write); #1 check(s.shared_path.physical_address == __, \"STORE 1 writes physical address __\");\n    end\n    begin : watch_fetches\n        integer fetch_count;\n        fetch_count = 0; #1;\n        while (!s_halted) begin\n            if (s_fetch) begin\n                // the n-th fetch (counting from 0) should use address n\n                check(s.shared_path.physical_address == fetch_count, \"fetches use addresses 0, 1, 2\");\n                fetch_count = fetch_count + 1;\n            end\n            @(negedge clk); #1;\n        end\n        check(fetch_count == __, \"number of shared fetches\");\n    end\njoin"
     },
     {
      "title": "Test",
      "code": "make test",
      "after": "You should see `PASS shared_addresses ...` and **ALL TESTS PASSED (7 scenarios)**. Try changing one number to a wrong value: the test must fail. Then change it back."
     },
     {
      "title": "Write a worked example",
      "text": "In `docs/PROJECT_GUIDE.md`, add a short section (in your own words) that walks through the six shared-memory cycles of the demo and the physical address used in each."
     },
     {
      "title": "Send your work as a pull request",
      "text": "Add **only your own files**. `make test` also rewrites `results/`; do not add it, because Mitul regenerates it once after merging.",
      "code": "git add tb/tb_memory_compare.v docs/PROJECT_GUIDE.md\ngit commit -m \"Check shared physical addresses and add a worked example\"\ngit push -u origin {id}-task\ngh pr create --fill --base main",
      "after": "If `gh pr create` asks where to open the pull request, choose **mitul-bhatia/HEXARCH**. Then ask one other member to review it and tell Mitul it is ready. The automatic check on the pull request runs `make check`; a green tick means it passed."
     }
    ],
    "answer": "@(posedge s_read);  #1 check(s.shared_path.physical_address == 16, \"LOAD 0 reads physical address 16\");\n@(posedge s_write); #1 check(s.shared_path.physical_address == 17, \"STORE 1 writes physical address 17\");\n...\ncheck(fetch_count == 3, \"exactly three shared fetches\");\n\n// Example for PROJECT_GUIDE.md:\n// Cycle 1 fetches LOAD 0 from address 0. Cycle 2: LOAD reads data[0]\n// at physical address 16, so the fetch waits. Cycle 3 fetches STORE 1\n// from address 1. Cycle 4: STORE writes data[1] at 17. Cycle 5 fetches\n// HALT from address 2. Cycle 6 executes HALT.",
    "answerNote": "Data address 0 is physical 16 and data address 1 is physical 17. Fetches use 0, 1, 2: three fetches.",
    "files": "tb/tb_memory_compare.v docs/PROJECT_GUIDE.md",
    "message": "Check shared physical addresses and add a worked example",
    "explain": [
     "Why data wins the single port: `rtl/simple_controller.v` line 28 switches the fetch off whenever a LOAD or STORE needs the port.",
     "What the address decoder does: `rtl/address_decoder.v` lines 8-9 put a 1 in front of a data address (adding 16).",
     "Your video lines: scene 4, why the shared design waits."
    ]
   }
  },
  {
   "id": "hardik",
   "name": "Hardik Maheshwari",
   "short": "Hardik",
   "color": "#7a3e8f",
   "role": "Simulation",
   "owns": [
    "tb/",
    "results/",
    "waveforms"
   ],
   "scenes": [
    1,
    5,
    6
   ],
   "task": {
    "title": "Add a memory-instruction sweep and show data[1] in the waveform",
    "why": "The existing tests cover 0, 2, 4 and 6 memory instructions. Adding 1, 3 and 5 shows the cycle rule holds for every count in between.",
    "steps": [
     {
      "title": "Design three programs",
      "text": "In `tb/tb_memory_compare.v`, search for `Modes 9-11 (Hardik)` and add cases 9, 10 and 11. Each program ends in HALT and has exactly **M = 1, 3 and 5** LOAD/STORE instructions. Put a non-zero seed in `data[0]` (for example `8'h09`) and set `expected[...]` for every data word your program changes or reads.",
      "code": "9:  begin /* M = 1 */ end\n10: begin /* M = 3 */ end\n11: begin /* M = 5 */ end"
     },
     {
      "title": "Predict and run",
      "text": "For each program write N and M, then **Harvard = N + 1** and **shared = N + 1 + M**. Search for `Hardik: run the modes 9-11` and add three `run_checked` lines. Arguments: name, Harvard cycles, shared cycles, M, final ACC, fault expected (0), record trace (0).",
      "code": "prepare(9);  run_checked(\"one_memory_op\",    H, S, 1, ACC, 0, 0);\nprepare(10); run_checked(\"three_memory_ops\", H, S, 3, ACC, 0, 0);\nprepare(11); run_checked(\"five_memory_ops\",  H, S, 5, ACC, 0, 0);"
     },
     {
      "title": "Add data[1] to the waveform",
      "text": "Search for `Hardik: extra $dumpvars` and add this line under it. It must stay there, because `$dumpvars` only works at time 0.",
      "code": "$dumpvars(0, h.harvard_path.dmem.words[1], s.shared_path.mem.words[17]);"
     },
     {
      "title": "Test",
      "code": "make test",
      "after": "Three new `PASS` lines and **ALL TESTS PASSED (9 scenarios)**. Two `VCD warning` lines about array words are normal. Open `build/memory_compare.vcd` in GTKWave (optional) to see data[1] become 7."
     },
     {
      "title": "Send your work as a pull request",
      "text": "Add **only your own files**. `make test` also rewrites `results/`; do not add it, because Mitul regenerates it once after merging.",
      "code": "git add tb/tb_memory_compare.v\ngit commit -m \"Add M = 1, 3, 5 sweep and dump data[1] in the waveform\"\ngit push -u origin {id}-task\ngh pr create --fill --base main",
      "after": "If `gh pr create` asks where to open the pull request, choose **mitul-bhatia/HEXARCH**. Then ask one other member to review it and tell Mitul it is ready. The automatic check on the pull request runs `make check`; a green tick means it passed."
     }
    ],
    "answer": "// in the Modes 9-11 slot\n9:  begin image[0]=8'h10; image[1]=8'h00; seed[0]=8'h09; expected[0]=8'h09; end\n10: begin image[0]=8'h10; image[1]=8'h21; image[2]=8'h11;\n          seed[0]=8'h09; expected[0]=8'h09; expected[1]=8'h09; end\n11: begin image[0]=8'h10; image[1]=8'h21; image[2]=8'h22; image[3]=8'h23; image[4]=8'h13;\n          seed[0]=8'h09; for (i = 0; i < 4; i = i + 1) expected[i]=8'h09; end\n\n// in the run slot\nprepare(9);  run_checked(\"one_memory_op\",4,5,1,8'h09,0,0);\nprepare(10); run_checked(\"three_memory_ops\",5,8,3,8'h09,0,0);\nprepare(11); run_checked(\"five_memory_ops\",7,12,5,8'h09,0,0);",
    "answerNote": "Programs: LOAD 0, NOP, HALT (N 3, M 1) · LOAD 0, STORE 1, LOAD 1, HALT (N 4, M 3) · LOAD 0, STORE 1-3, LOAD 3, HALT (N 6, M 5).",
    "files": "tb/tb_memory_compare.v",
    "message": "Add M = 1, 3, 5 sweep and dump data[1] in the waveform",
    "explain": [
     "What the waveform shows during the two blocked shared fetches: shared `fetch_enable` is 0 while `data_read_enable` or `data_write_enable` is 1, and the shared PC holds.",
     "Why the difference grows by exactly one cycle per LOAD or STORE.",
     "Your video lines: scenes 5 and 6, `make demo`, the waveform and `make test`."
    ]
   }
  },
  {
   "id": "mitul",
   "name": "Mitul Bhatia",
   "short": "Mitul",
   "color": "#172638",
   "role": "Integration and video driver",
   "owns": [
    "rtl/memory_system.v",
    "rtl/simple_controller.v",
    "Makefile",
    "scripts/",
    "report",
    "repository",
    "video"
   ],
   "scenes": [
    1,
    7
   ],
   "integration": [
    {
     "title": "Send each member their link",
     "text": "Each member opens `team.html#their-name` on the site. Nobody needs an invitation: they fork the public repository and open a pull request from their own copy."
    },
    {
     "title": "Merge the four pull requests",
     "text": "On each pull request, wait for the green tick, then **Merge pull request → Create a merge commit**. A merge commit keeps the member as the author of their commits. Every merge to `main` also republishes this website automatically."
    },
    {
     "title": "Regenerate results and figures",
     "code": "git switch main && git pull\ngit switch -c integrate-member-work\nmake check figures"
    },
    {
     "title": "Update the text and the report",
     "text": "Change the places that say six scenarios to the new number, add the new scenarios as rows of report Table I, and add one short clause per member to report Table II naming their merged work.",
     "code": "grep -rn \"six\" README.md docs/\nmake report guide"
    },
    {
     "title": "Merge your own pull request",
     "code": "git add -A\ngit commit -m \"Regenerate results and report after member contributions\"\ngit push -u origin integrate-member-work\ngh pr create --fill --base main"
    },
    {
     "title": "Record the video",
     "text": "Follow the [video script](#video) on this page. Use **Prompter** mode on a second screen or phone."
    },
    {
     "title": "Add the link and submit",
     "text": "Put the video link and duration in `VIDEO.md`, merge, check everything from a logged-out browser, then submit the [evaluation form](https://docs.google.com/forms/d/e/1FAIpQLSc6Cx8OrOQLGj_X2ZMkyG5jc8mokq36mGRq2x8jGRNV1sbegA/viewform) before **16 November, 11:59 PM IST**."
    }
   ],
   "explain": [
    "How `rtl/memory_system.v` connects the same controller to both organizations with one parameter, `SHARED_BUS`.",
    "Your video lines: scene 1 (opening) and scene 7 (no-data result, report, repository). You also drive the laptop in every scene."
   ]
  }
 ],
 "scenes": [
  {
   "n": 1,
   "start": 0,
   "end": 25,
   "speaker": "mitul",
   "speakers": [
    "mitul",
    "akshat",
    "ajeesh",
    "vaibhav",
    "hardik"
   ],
   "label": "Mitul, then everyone",
   "screen": "Title card with all five names",
   "before": "Show the title card (#1) full screen, then start recording.",
   "lines": [
    {
     "who": "mitul",
     "say": "We are Team HEXARCH from Section A. Our project is Project 9, Instruction and Data Memory Hierarchy."
    },
    {
     "who": "akshat",
     "say": "I'm Akshat Chauhan."
    },
    {
     "who": "ajeesh",
     "say": "I'm Ajeesh Amreet."
    },
    {
     "who": "vaibhav",
     "say": "I'm Vaibhav."
    },
    {
     "who": "hardik",
     "say": "I'm Hardik Maheshwari."
    },
    {
     "who": "mitul",
     "say": "And I'm Mitul Bhatia."
    }
   ],
   "cues": [],
   "image": "../video/title_card.png"
  },
  {
   "n": 2,
   "start": 25,
   "end": 70,
   "speaker": "akshat",
   "speakers": [
    "akshat"
   ],
   "label": "Akshat",
   "screen": "Block diagram, Harvard half → program_counter.v",
   "before": "Show architecture.png (#2), cursor on the Harvard half.",
   "lines": [
    {
     "who": "akshat",
     "say": "Our idea is simple. Instructions say what to do; data is the value being worked on. In a Harvard design they have separate memories and separate ports, so the controller can fetch the next instruction while the current one reads or writes data. In a von Neumann-style design, both live in one memory with one port, so they take turns. [[program counter]] This is our program counter. On each clock edge it adds one, but only when a fetch is accepted; otherwise it holds."
    }
   ],
   "cues": [
    {
     "word": "program counter",
     "do": "Switch to rtl/program_counter.v and point at lines 7-9."
    }
   ],
   "image": "../figures/architecture.png"
  },
  {
   "n": 3,
   "start": 70,
   "end": 115,
   "speaker": "ajeesh",
   "speakers": [
    "ajeesh"
   ],
   "label": "Ajeesh",
   "screen": "README program → demo.hex → data_memory.v",
   "before": "Show README.md (#4), scrolled to the three-line program.",
   "lines": [
    {
     "who": "ajeesh",
     "say": "Our program has three instructions: LOAD 0, STORE 1, HALT. [[In memory]] In memory they are the bytes 10, 21 and F0. The first hex digit is the operation; the second is the data address. Data address 0 starts at 7. [[data memory]] This is our data memory, sixteen bytes. A read is ready within the same cycle; a write happens on the rising clock edge. LOAD copies 7 into the accumulator, STORE writes it to address 1, and HALT stops."
    }
   ],
   "cues": [
    {
     "word": "In memory",
     "do": "Switch to programs/demo.hex."
    },
    {
     "word": "data memory",
     "do": "Switch to rtl/data_memory.v and point at lines 13-15."
    }
   ]
  },
  {
   "n": 4,
   "start": 115,
   "end": 155,
   "speaker": "vaibhav",
   "speakers": [
    "vaibhav"
   ],
   "label": "Vaibhav",
   "screen": "Block diagram, shared half → address_decoder.v → simple_controller.v line 28",
   "before": "Show architecture.png (#2) again, cursor on the shared half.",
   "lines": [
    {
     "who": "vaibhav",
     "say": "Both designs hold thirty-two bytes in total. In the shared design, one memory has one port. [[address decoder]] Our address decoder puts instructions at addresses 0 to 15 and data at 16 to 31. [[This line]] This line in the controller is the key rule: in shared mode, fetch is switched off during a LOAD or STORE. So the program counter holds, and the next instruction is fetched one cycle later."
    }
   ],
   "cues": [
    {
     "word": "address decoder",
     "do": "Switch to rtl/address_decoder.v (lines 8-9)."
    },
    {
     "word": "This line",
     "do": "Switch to rtl/simple_controller.v and highlight line 28."
    }
   ],
   "image": "../figures/architecture.png"
  },
  {
   "n": 5,
   "start": 155,
   "end": 220,
   "speaker": "hardik",
   "speakers": [
    "hardik"
   ],
   "label": "Hardik",
   "screen": "Terminal: make demo → waveforms.png",
   "before": "Show the terminal (#9), type make demo and press Enter.",
   "lines": [
    {
     "who": "hardik",
     "say": "I'll run make demo. Each row is one clock cycle. F, R and W mean instruction fetch, data read and data write. In cycle 2, Harvard fetches STORE while LOAD reads data, so fetch and read are both 1. Shared fetch is 0, because its one port is busy. In cycle 3, Harvard fetches HALT while STORE writes the 7. Harvard executes HALT in cycle 4, so it finishes in four cycles. Shared needs six; the two extra cycles are the two blocked fetches. Both end with 7 at data address 1. [[waveform]] The waveform shows the same: Harvard fetch overlaps the read and the write; shared fetch never does."
    }
   ],
   "cues": [
    {
     "word": "waveform",
     "do": "Switch to docs/figures/waveforms.png."
    }
   ],
   "during": "Point at rows 2, 3, 4 and 6 of the output as Hardik mentions them.",
   "image": "../figures/waveforms.png"
  },
  {
   "n": 6,
   "start": 220,
   "end": 238,
   "speaker": "hardik",
   "speakers": [
    "hardik"
   ],
   "label": "Hardik",
   "screen": "Terminal: make test",
   "before": "Go back to the terminal (#9), type clear; make test and press Enter.",
   "lines": [
    {
     "who": "hardik",
     "say": "Our testbench checks all of this automatically. make test runs every scenario, including boundary addresses, an invalid opcode and a mid-program reset. All of them pass."
    }
   ],
   "cues": []
  },
  {
   "n": 7,
   "start": 238,
   "end": 275,
   "speaker": "mitul",
   "speakers": [
    "mitul"
   ],
   "label": "Mitul",
   "screen": "no_data_access line → report page 1 → GitHub page → end card",
   "before": "Stay on the make test output and point at the no_data_access line (Harvard=4, shared=4).",
   "lines": [
    {
     "who": "mitul",
     "say": "With no data accesses, both designs take four cycles. So separate paths help only when a fetch and a data access would compete; in our model the shared design needs exactly one extra cycle per LOAD or STORE. This is a small simulation model, not a general speed-up claim. [[report]] Our IEEE-format report [[repository]] and our repository have the Verilog, the testbenches, block diagrams, waveforms and results."
    }
   ],
   "choose": [
    {
     "when": "If every member's own pull request is merged",
     "say": "Each of us also added our own test or improvement, which you can see in our commit history. Thank you."
    },
    {
     "when": "Otherwise",
     "say": "Next, each of us is adding our own improvement from our own GitHub account. Thank you."
    }
   ],
   "cues": [
    {
     "word": "report",
     "do": "Switch to the report PDF, page 1."
    },
    {
     "word": "repository",
     "do": "Switch to the GitHub page and scroll once."
    }
   ],
   "after": "After \"Thank you\", show the end card for two seconds, then stop recording.",
   "endImage": "../video/end_card.png"
  }
 ],
 "prep": {
  "recording": [
   "**Same room (simplest).** On the Mac press `Cmd + Shift + 5`, choose *Record Entire Screen*, then *Options → Microphone → MacBook Microphone*. Everyone sits close to the laptop.",
   "**Online.** Start a Zoom or Google Meet call. Everyone sets their display name to their full name. Mitul shares his entire screen and starts the call's recording."
  ],
  "laptop": [
   "Turn on *Do Not Disturb* and close chat apps, mail and unrelated tabs.",
   "Set the editor and terminal font to 18 pt or larger.",
   "In the terminal, `cd` into the project, run `make demo` and `make test` once, check both pass, then type `clear`.",
   "Open the 13 windows below, in order.",
   "Give a phone stopwatch to someone not speaking. Rehearse once without recording."
  ],
  "windows": [
   [
    "docs/video/title_card.png, full screen",
    "1"
   ],
   [
    "docs/figures/architecture.png",
    "2, 4"
   ],
   [
    "rtl/program_counter.v",
    "2"
   ],
   [
    "README.md (scroll to the three-line program)",
    "3"
   ],
   [
    "programs/demo.hex",
    "3"
   ],
   [
    "rtl/data_memory.v",
    "3"
   ],
   [
    "rtl/address_decoder.v",
    "4"
   ],
   [
    "rtl/simple_controller.v, scrolled to line 28",
    "4"
   ],
   [
    "Terminal, cleared",
    "5, 6, 7"
   ],
   [
    "docs/figures/waveforms.png",
    "5"
   ],
   [
    "output/pdf/HEXARCH_Phase_I_Report.pdf, page 1",
    "7"
   ],
   [
    "https://github.com/mitul-bhatia/HEXARCH in a browser",
    "7"
   ],
   [
    "docs/video/end_card.png",
    "end"
   ]
  ],
  "fallbacks": [
   "**`make demo` fails:** type `cat results/demo_output.txt` and say \"This is the saved output of the same command.\" Keep going.",
   "**`make test` fails:** type `clear; cat results/test_output.txt` and say the same sentence.",
   "**Someone stumbles:** keep going. Restart only if two things go wrong or a name is missed.",
   "**Running long:** if the stopwatch passes 4:40 during scene 7, skip straight to \"Thank you\"."
  ],
  "after": [
   "Watch it once: **at most 5:00**, all five names heard, code readable. Trim pauses with QuickTime *Edit → Trim* if needed.",
   "Upload to **YouTube as Unlisted** (not Private), or to **Google Drive** with *Share → Anyone with the link → Viewer*.",
   "Open the link in a private window while logged out. It must play.",
   "Put the link and exact duration in `VIDEO.md`, commit, and merge to `main`.",
   "Submit the repository link in the form."
  ]
 }
};
