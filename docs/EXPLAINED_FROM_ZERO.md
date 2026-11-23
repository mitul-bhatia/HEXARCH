# HEXARCH explained from zero (no Verilog knowledge needed)

Read top to bottom. Each step uses only what the previous steps taught.

---

## Step 1. What is a computer doing, in one sentence?

A processor repeats two jobs forever:

1. **Fetch**: read the *next instruction* from memory ("what should I do?").
2. **Execute**: do it. Sometimes that means reading or writing a *data value* in memory.

Memory is just a numbered list of boxes. Each box holds one number. The box number is the **address**.

```
address:   0    1    2    3   ...
content:  [10] [21] [F0] [00] ...
```

## Step 2. The problem this project studies

A memory has a "door" (called a **port**). Only **one thing can go through a door per clock tick**.

- If instructions and data live in **one memory with one door**, then when the processor needs data it **cannot** fetch the next instruction in the same tick. It waits. (This is the **von Neumann** style.)
- If instructions and data live in **two memories with two doors**, both happen in the same tick. (This is **Harvard**.)

Our whole project builds both, runs the same tiny program on each, and **counts clock ticks (cycles)**. Result: Harvard 4 cycles, shared 6 cycles.

## Step 3. What is Verilog?

Verilog is a language for **describing hardware**, not for writing programs.

- A normal program (Python, C) is a list of steps a CPU follows one after another.
- Verilog describes **circuits that all exist and work at the same time**: wires, gates, memories, counters.

We do not build a chip. We **simulate** it on the laptop with a free tool called **Icarus Verilog** (`iverilog`). The simulator pretends to be the chip and shows what each wire does at each tick. That is what `make demo` runs.

### The only Verilog you need (7 ideas)

| Idea | Meaning | Example from our code |
| --- | --- | --- |
| `module ... endmodule` | One building block (like one Lego brick) with inputs and outputs | `module program_counter (...)` |
| `input` / `output` | The block's connectors | `input wire clk, reset, enable` |
| `wire` | A plain connection. Its value is *always* whatever drives it | `wire [3:0] pc;` (4 wires side by side) |
| `reg` | A thing that **remembers** a value (a tiny memory, a flip-flop) | `reg [7:0] accumulator;` |
| `assign x = ...;` | "x is always equal to this". Combinational: no clock, instant | `assign load = instruction[7:4] == 4'h1;` |
| `always @(posedge clk)` | "On every rising clock tick, do this". This is how things remember and change | the PC counting up |
| `[7:0]` | A group of bits. `[7:0]` = 8 bits = one byte, `[3:0]` = 4 bits | `reg [7:0] words [0:15]` = 16 boxes of 8 bits |

Number notation: `4'h1` means "4 bits wide, hex 1". `8'hF0` = 8 bits, hex F0. `1'b1` = one bit, value 1.

Two symbols you will see:
- `=` inside `assign` or a testbench: ordinary "set to".
- `<=` inside `always @(posedge clk)`: "**will become** this at the tick". It is how real registers update together.

## Step 4. The clock

A **clock** is a wire that goes 0, 1, 0, 1... forever. Each rising edge (0 to 1) is one **cycle**. In our simulation one cycle = 10 ns (`always #5 clk = ~clk;` flips the clock every 5 ns). It is a simulation clock, not a real chip speed.

All the "remembering" things (`reg`) change **only** on a rising edge. That is why we can count cycles: 4 vs 6.

## Step 5. Our tiny processor and its language

Every instruction is **one byte (8 bits)** = two hex digits:

```
  1 0          2 1          F 0
  | |          | |          | |
  | +-address  | +-address  | +-unused
  +--opcode    +--opcode    +--opcode
```

| Opcode (first digit) | Name | Meaning |
| --- | --- | --- |
| `0` | NOP | do nothing |
| `1` | LOAD a | copy the data box `a` into the **accumulator** (one working register) |
| `2` | STORE a | copy the accumulator into data box `a` |
| `F` | HALT | stop |
| anything else | illegal | stop and set the `fault` flag |

**Our demo program** is in `programs/demo.hex`: `10 21 F0` meaning:

```
LOAD 0    ; accumulator = data[0]  (data[0] starts as 7)
STORE 1   ; data[1] = accumulator  (so data[1] becomes 7)
HALT      ; stop
```
It copies one number. That is all. The interesting question is only: **how many ticks does it take?**

## Step 6. Our files, one by one (real code)

### 6.1 `rtl/program_counter.v`: the "which instruction next?" counter
```verilog
module program_counter (input wire clk, reset, enable, output reg [3:0] address);
    always @(posedge clk) begin
        if (reset) address <= 4'd0;          // reset: go back to instruction 0
        else if (enable) address <= address + 4'd1;   // fetched one: move to the next
    end
endmodule
```
A counter that adds 1 on each tick **only when `enable` is on**. 4 bits, so it counts 0 to 15 then wraps to 0.

### 6.2 `rtl/instruction_memory.v`: the instruction box list
```verilog
reg [7:0] words [0:15];                       // 16 boxes, 8 bits each
initial $readmemh(PROGRAM_FILE, words);       // at the start, load programs/demo.hex into it
assign read_data = read_enable ? words[address] : 8'h00;
```
`$readmemh` fills the memory from the hex file. The `assign` line means: "output is the box at `address` (if reading is on)". No clock needed to read.

### 6.3 `rtl/data_memory.v`: the data box list
Same idea, plus a **write**:
```verilog
assign read_data = read_enable ? words[address] : 8'h00;
always @(posedge clk)
    if (write_enable) words[address] <= write_data;   // writes happen on the clock tick
```
Reads are instant, writes happen on the tick.

### 6.4 `rtl/read_write_control.v`: decoding the instruction
```verilog
assign load  = instruction[7:4] == 4'h1;
assign store = instruction[7:4] == 4'h2;
assign halt  = instruction[7:4] == 4'hf;
```
`instruction[7:4]` is the **top 4 bits = the opcode**. Three yes/no wires say which instruction it is.

### 6.5 `rtl/simple_controller.v`: the brain
It holds the **PC**, the **instruction register** (the instruction currently being executed), the **accumulator**, and a **valid bit** ("is there a real instruction to run?"). Key lines:
```verilog
assign data_read_enable  = running && execute_valid && load;
assign data_write_enable = running && execute_valid && store;
assign fetch_enable = running && !stop_now && !(SHARED_BUS && data_access);
```
The last line is the **entire difference between the two designs**: "fetch the next instruction unless (we are in shared mode **and** this instruction is using data)". In Harvard (`SHARED_BUS = 0`) that condition never blocks. In shared mode (`SHARED_BUS = 1`) a LOAD/STORE blocks the fetch for a tick. That is the extra cycle.

Overlap: each tick it **executes the current instruction while fetching the next one**. This overlap is why Harvard takes N + 1 cycles, not 2N.

### 6.6 `rtl/shared_memory.v` and `rtl/address_decoder.v`: the one-door memory
One 32-box memory. The decoder decides which box: instructions use addresses 0-15, data uses 16-31:
```verilog
assign physical_address = data_select ? {1'b1, data_address} : {1'b0, instruction_address};
```
`{1'b1, x}` glues a leading 1 to the front (so data address 3 becomes 19).

### 6.7 `rtl/memory_system.v`: the top wiring
One file with a **switch** (`parameter SHARED_BUS`). Set it to 0 and it wires the controller to two separate memories (Harvard). Set it to 1 and it wires the same controller to the one shared memory. Same controller, same program: a fair comparison.

## Step 7. Why 4 versus 6, tick by tick

**Harvard (4 ticks)**

| Tick | Fetching | Executing |
| --- | --- | --- |
| 1 | LOAD | nothing yet |
| 2 | STORE | LOAD (reads data) |
| 3 | HALT | STORE (writes data) |
| 4 | nothing | HALT |

In ticks 2 and 3 the processor fetches **and** touches data at the same time (two doors).

**Shared (6 ticks)**: while LOAD reads data (tick 2) the door is busy, so the fetch of STORE is **blocked** and happens in tick 3. Same for STORE (tick 4): total 3 instructions + 1 + 2 blocked = 6.

**Formulas** (N = instructions incl. HALT, M = how many are LOAD/STORE): Harvard = N + 1, shared = N + 1 + M.

## Step 8. Phase II: why add caches?

Real computers use **both ideas**: small fast memories near the processor (split into instruction and data), backed by one big shared memory below. Small fast memory in front = **cache**. Putting levels on top of each other = **memory hierarchy** (the project's title).

Our version:

```
controller -> instruction cache --\
           -> data cache ----------+--> ONE shared memory (32 bytes, one door)
```

### 8.1 What a cache is (desk and library)
The shared memory is a library. A cache is your desk. If the book is on the desk, grab it instantly (**hit**). If not, go to the library and bring a **stack of four books** back (**miss**). That costs one extra step.

### 8.2 `rtl/l1_cache.v`: a cache with 2 shelves
- 2 **lines**, each holding **4 bytes** (a "stack of four").
- A 4-bit address is split: `address[3]` = **tag** (which stack is on the shelf), `address[2]` = **index** (which shelf), `address[1:0]` = **which byte** in the stack.
- Each line has a **valid bit** ("is anything here yet?").
```verilog
wire index = address[2];
assign hit = valid[index] && (tag[index] == address[3]);   // right stack on the right shelf?
assign read_data = line[index] >> (8 * address[1:0]);      // pick the byte out of the 4
```
Because each address fits only one shelf, this is called **direct-mapped**. Two stacks that want the same shelf kick each other out (our "conflict" test: slow).

### 8.3 `rtl/lower_memory.v`: the shared memory under the caches
Like `shared_memory.v` but it can hand back a whole **4-byte block** in one go, and accepts one byte write for STORE.

### 8.4 `rtl/hierarchy_system.v`: the new top level
Three rules in code:
```verilog
assign d_miss = data_read_enable && !d_hit;     // LOAD, data not in cache
assign i_miss = fetch_enable && !i_hit;         // fetch, instruction not in cache
assign hold   = d_miss || i_miss;               // any miss: pause the controller
wire fill_d = d_miss;                           // data goes first (one door)
wire fill_i = i_miss && !d_miss;
wire store_now = data_write_enable && !hold;    // STORE never happens during a pause
```
- **Hit:** nothing special, no delay.
- **Miss:** `hold` = 1 for one tick. The controller **freezes** (it got a new input `hold` in `simple_controller.v`, tied to 0 in Phase I) while the 4-byte block is copied into the cache.
- **STORE** writes straight through to the shared memory (**write-through**), so memory is always right.

Formula: **cycles = N + 1 + I + D** (I, D = instruction and data-load misses). Every miss costs one tick.

### 8.5 The demo on the hierarchy (6 ticks)
1. Pause: first instruction not in cache, copy block 0 in.
2. Fetch LOAD.
3. Pause: LOAD needs data[0], not in the data cache, copy it in.
4. LOAD runs while STORE is fetched.
5. STORE runs while HALT is fetched.
6. HALT runs.

## Step 9. The test files (`tb/`)

A **testbench** is Verilog that is **not hardware**; it is the "tester". It creates a clock, loads a program, runs the design, and **checks the answers itself**, printing PASS or stopping with FAIL.

- `tb/tb_memory_compare.v`: the demo and 11 hand-made scenarios on both designs.
- `tb/tb_random_stress.v`: 2000 random programs, each checked against a software calculation.
- `tb/tb_hierarchy.v`: the Phase II test. It also contains a small **software copy of the cache logic** that predicts every hit and miss. The test fails if the hardware disagrees.
- `tb/tb_data_memory.v`, `tb/tb_read_write_control.v`: unit tests for single modules.

Run: `make demo`, `make test`, `make stress`, `make hierarchy`, or `make check` for all.

## Step 10. The other files

| File | What |
| --- | --- |
| `programs/demo.hex`, `data.hex` | the program and starting data, as hex numbers |
| `Makefile` | the shortcuts (`make demo` etc.) |
| `results/` | saved outputs and waveforms (`.vcd` = signals over time) |
| `docs/report/` | the IEEE report source |
| `docs/figures/` | diagrams |
| `.github/workflows/` | GitHub's robots: run the tests on every pull request, publish the website |

## Step 11. How to practise (30 minutes)

1. `make demo`. Read the table printed. Find tick 2: Harvard fetches and reads together, shared does not fetch.
2. Open `rtl/program_counter.v` and read it. It is ten lines.
3. Open `rtl/read_write_control.v` (three `assign` lines) and match each to a row of the instruction table in step 5.
4. Open `rtl/simple_controller.v`, find the `fetch_enable` line from step 6.5, and say it out loud in English.
5. `make hierarchy`. Match each printed row to a line in the Phase II results table.
6. Say step 8.5 to a friend without looking.

If you can do 4 and 6, you can answer almost any question in the interview.
