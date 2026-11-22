# Phase II: the memory hierarchy (simple version)

Phase I compared two designs: **Harvard** (separate instruction and data memories) and **shared** (one memory, one port).
Phase II adds the third piece from the brief, the **shared lower-level memory**, so the project is a real *hierarchy*:

```
controller ──► instruction cache ──┐
           └─► data cache ─────────┴──► ONE shared lower memory (32 bytes, one port)
```

## The whole idea in five lines
1. Each cache is tiny: **2 lines × 4 bytes**. Address bit 3 = tag, bit 2 = which line, bits 1:0 = byte in the line.
2. **Hit** (the byte is in the cache): no delay, exactly like Phase I Harvard.
3. **Miss**: the controller **waits 1 cycle** while the 4-byte block is copied from the lower memory.
4. The lower memory has **one port**: if both caches miss together, the **data cache goes first**, the instruction cache one cycle later.
5. **STORE** writes through to the lower memory (and to the data cache if the byte is cached). A store never runs while the controller is waiting, so it never fights a miss for the port.

## The formula (like N+1 and N+1+M in Phase I)

`Hierarchy cycles = N + 1 + I + D`  (N instructions, I = instruction misses, D = data LOAD misses)

Every miss costs exactly one cycle. `make hierarchy` checks this on 7 directed programs and 3000 random ones against an independent software model of the caches.

## Files
| File | What it is |
| --- | --- |
| `rtl/l1_cache.v` | the tiny cache (used twice) |
| `rtl/lower_memory.v` | the shared 32-byte memory with one port |
| `rtl/hierarchy_system.v` | wires controller + two caches + lower memory; makes the `hold` signal |
| `rtl/simple_controller.v` | gained one input, `hold` (0 in Phase I, so Phase I results are unchanged) |
| `tb/tb_hierarchy.v` | self-checking test |
| `docs/report/phase2_report.tex` | final IEEE report (`make report2` → `output/pdf/HEXARCH_Final_Report.pdf`) |

Run: `make hierarchy` (or `make check` for everything).

## Likely interview questions
- *Why does a miss cost one cycle?* The lower memory returns a whole 4-byte block in one read; the controller just waits one clock.
- *Why is data served before instructions?* The lower memory has one port; the LOAD already in the controller is older than the next fetch.
- *Why does STORE not allocate a line?* Simplicity: write-through, update the cache only if the byte is already there. Memory is always correct.
- *Why can instruction misses be only N/4?* One block holds four instructions (spatial locality).
- *When is the hierarchy as fast as Harvard?* When everything hits; it never beats Phase I Harvard in this model.
- *What breaks it?* Two blocks sharing one line evict each other (`conflict_thrash`: every LOAD misses).

## Starter tasks for the team (each from their own fork and PR; nobody commits for anyone else)
| Member | Task |
| --- | --- |
| Akshat | Add a directed program in `tb/tb_hierarchy.v` that shows instruction misses = ⌈N/4⌉ for N = 5 and 9; explain why. |
| Ajeesh | Add a test where a STORE hits a cached byte and a later LOAD must read the new value without a miss. |
| Vaibhav | Add a check that the lower-memory port is never read and written in the same cycle; explain the single-port rule. |
| Hardik | Run `make hierarchy`, add a waveform dump for `demo_copy` and put a screenshot in `docs/figures/`. |
| Mitul | Merge PRs, regenerate `results/`, rebuild the final report, keep README current. |
