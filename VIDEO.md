# 🎬 Prototype demonstration video

<!-- VIDEO-LINK -->**Video link:** _not recorded yet_<!-- /VIDEO-LINK -->

<!-- VIDEO-DURATION -->**Duration:** _-_<!-- /VIDEO-DURATION -->

**What it shows (≤ 5 minutes):** the project idea, all five members by name (Akshat Chauhan, Ajeesh Amreet, Vaibhav, Hardik Maheshwari, Mitul Bhatia), and the working prototype: the Verilog modules, the block diagram, `make demo`, the waveforms and `make test`.

| Scene | Time | Speaker | On screen |
| :---: | --- | --- | --- |
| 1 | 0:00-0:25 | Mitul, then everyone | Title card with all five names |
| 2 | 0:25-1:10 | Akshat | Block diagram → program counter |
| 3 | 1:10-1:55 | Ajeesh | The program → data memory |
| 4 | 1:55-2:35 | Vaibhav | Shared memory → address decoder → fetch-stall rule |
| 5 | 2:35-3:40 | Hardik | `make demo` → waveforms |
| 6 | 3:40-3:58 | Hardik | `make test` |
| 7 | 3:58-4:35 | Mitul | Results → report → repository |

Script, word for word: [docs/VIDEO_SCRIPT.md](docs/VIDEO_SCRIPT.md), or the clickable version with a prompter: [Team hub → Video script](https://mitul-bhatia.github.io/HEXARCH/team.html#video).

## Adding the link after recording

1. Upload to **YouTube as Unlisted** (not Private), or to **Google Drive** with *Share → General access → Anyone with the link → Viewer*.
2. Open the link in a private window while logged out. It must play.
3. Run one command. It updates this file and the video badge and row in the README:

   ```sh
   python3 scripts/set_video_link.py "https://youtu.be/XXXXXXXXXXX" 4:35
   ```

4. Commit on a branch, open a pull request, and merge it.
