# Team HEXARCH: roles and submission plan

Section **A** · Project 9 · Phase I deadline **16 November 2026, 11:59 PM IST**.

## Roles

This table is the single source of truth. The report (Table II), the video guide and the starter tasks use the same split.

| Member | Owns | Presents in the video | Starter task |
| --- | --- | --- | --- |
| Akshat Chauhan | Instruction path: `rtl/program_counter.v`, `rtl/instruction_memory.v`, `programs/demo.hex` | Scene 2: the idea, Harvard half of the diagram, program counter | [Full 16-byte program test](MEMBER_TASKS.md#akshat) |
| Ajeesh Amreet | Data path: `rtl/data_memory.v`, `rtl/read_write_control.v`, `programs/data.hex` | Scene 3: the program and data-memory timing | [New data-pattern test](MEMBER_TASKS.md#ajeesh) |
| Vaibhav | Shared memory: `rtl/shared_memory.v`, `rtl/address_decoder.v`, the fetch-stall rule | Scene 4: why shared memory waits | [Physical-address checks](MEMBER_TASKS.md#vaibhav) |
| Hardik Maheshwari | Simulation: `tb/`, `results/`, waveforms | Scenes 5-6: `make demo`, waveform, `make test` | [Memory-instruction sweep and waveform memory](MEMBER_TASKS.md#hardik) |
| Mitul Bhatia | Integration: `rtl/memory_system.v`, `rtl/simple_controller.v`, `Makefile`, `scripts/`, report, repository, video | Scenes 1 and 7, and drives the recording | [Merge, report, video link, submission](MEMBER_TASKS.md#mitul) |

Every member should be able to explain the whole project, not only their own part. The [study guide](https://mitul-bhatia.github.io/HEXARCH/) explains it from zero.

## Schedule (from 14 November)

| Date (IST) | Goal |
| --- | --- |
| 14 Nov | Mitul invites the four members to the repository. Everyone runs `make demo` and `make test` on their own machine. |
| 14-15 Nov | Each member finishes their starter task and opens a pull request from their own GitHub account. Someone else reviews it; Mitul merges and regenerates `results/`. |
| 15 Nov | Record the video ([recording guide](VIDEO_SCRIPT.md)), upload it, put the link in [`VIDEO.md`](../VIDEO.md). |
| 15 Nov | Final report check, `make report`, commit the PDF. |
| 16 Nov | Check everything from a logged-out browser, then submit the form, well before 11:59 PM IST. |

## Phase I checklist

| Rubric item | Marks | Where it is | Still to do |
| --- | ---: | --- | --- |
| IEEE report: abstract, literature review, proposed solution, individual contributions, references | 10 | [`output/pdf/HEXARCH_Phase_I_Report.pdf`](../output/pdf/HEXARCH_Phase_I_Report.pdf), source in `docs/report/` | Rebuild after the member pull requests are merged |
| Prototype video, at most 5 minutes, idea, all five names, working prototype | 15 | [Recording guide](VIDEO_SCRIPT.md), title card in `docs/video/` | Record, upload, add the link to `VIDEO.md` |
| GitHub: report, video link, prototype files, artefacts, individual history | 5 | This repository | Every member's own commits; the video link |

- [x] Section confirmed: A.
- [x] Repository: https://github.com/mitul-bhatia/HEXARCH (public, so evaluators can open it).
- [ ] All four members invited as collaborators and have accepted.
- [ ] Each member's starter-task pull request merged from their own account.
- [ ] Video recorded, at most 5:00, uploaded with link access for anyone; link and duration in `VIDEO.md`.
- [ ] After the merges: scenario count and report Tables I and II updated, then `make report guide`.
- [ ] Repository link submitted through the form: https://docs.google.com/forms/d/e/1FAIpQLSc6Cx8OrOQLGj_X2ZMkyG5jc8mokq36mGRq2x8jGRNV1sbegA/viewform

## Phase II (70%)

Keep developing the same repository with the same individual history. Each member should be ready to explain the design and their own commits in the interview; the [study guide](https://mitul-bhatia.github.io/HEXARCH/) has likely questions. Possible extensions: the optional shared lower-level memory, a synchronous-read memory model, and synthesis results.
