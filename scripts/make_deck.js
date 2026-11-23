// Builds output/HEXARCH_Presentation.pptx (Phase I + Phase II) from the repo's real files.
// Run from the repository root:  node scripts/make_deck.js
// Every code excerpt and figure on a slide names the repository file (and lines) it comes from.
const pptxgen = require("pptxgenjs");
const path = require("path");
const SKILL = process.env.PPTX_SKILL_DIR || "";
let applyTheme = null;
try { applyTheme = require(path.join(SKILL, "scripts/apply_theme.js")).applyTheme; } catch (e) { /* optional */ }

const THEME = {
  name: "HEXARCH", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: "172638", lt1: "FFFFFF", dk2: "566778", lt2: "F3F6F9",
    accent1: "145F9B", accent2: "A54C13", accent3: "17745C", accent4: "7A3E8F",
    accent5: "D5DCE3", accent6: "101C2A", hlink: "145F9B", folHlink: "7A3E8F" },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "HEXARCH: Instruction and Data Memory Hierarchy (Phase I and II)";
pres.author = "Team HEXARCH, Section A";
const C = pres.SchemeColor;

pres.defineSlideMaster({
  title: "CONTENT", background: { color: C.background1 },
  objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 7.1, h: 0.75,
    fontSize: 28, bold: true, color: C.text1, align: "left", valign: "middle", margin: 0 }, text: "" } }],
  slideNumber: { x: 9.2, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: C.text2, align: "right" },
});
pres.defineSlideMaster({ title: "DARK", background: { color: C.accent6 } });

const seen = new Set();
function sec(t) { if (!seen.has(t)) { pres.addSection({ title: t }); seen.add(t); } }
const MONO = "Courier New";
const W = 10;
let n = 0;

function base(title, who, source, section) {
  sec(section);
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText(title, { placeholder: "title" });
  // presenter chip (top right)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.75, y: 0.4, w: 1.75, h: 0.55, rectRadius: 0.12,
    fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "Presenter chip" });
  s.addText([{ text: "PRESENTS", options: { fontSize: 10, breakLine: true } },
             { text: who, options: { fontSize: 14, bold: true } }],
    { x: 7.75, y: 0.4, w: 1.75, h: 0.55, align: "center", valign: "middle", color: C.background1, margin: 0,
      isTextBox: true, objectName: "Presenter" });
  // source line
  s.addText([{ text: "Source: ", options: { bold: true } }, { text: source }],
    { x: 0.5, y: 5.12, w: 8.6, h: 0.35, fontSize: 11, color: C.text2, margin: 0, valign: "middle",
      isTextBox: true, objectName: "Source" });
  return s;
}

function code(s, x, y, w, h, lines, file) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: C.accent6 },
    line: { color: C.accent6 }, objectName: "Code box" });
  const runs = [];
  if (file) runs.push({ text: file, options: { fontFace: MONO, fontSize: 10, color: "9FB3C8", breakLine: true } });
  lines.forEach((l, i) => runs.push({ text: l.t, options: { fontFace: MONO, fontSize: 12,
    color: l.hl ? "FFB070" : "E8EEF5", bold: !!l.hl, breakLine: i < lines.length - 1 } }));
  s.addText(runs, { x: x + 0.12, y: y + 0.08, w: w - 0.24, h: h - 0.16, valign: "top", margin: 0,
    paraSpaceAfter: 2, isTextBox: true, objectName: "Code" });
}

function card(s, x, y, w, h, head, body, color) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: C.background2 },
    line: { color: C.accent5, width: 1 }, objectName: "Card" });
  s.addText(head, { x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.35, fontSize: 16, bold: true, color: color || C.accent1,
    margin: 0, isTextBox: true });
  s.addText(body, { x: x + 0.15, y: y + 0.45, w: w - 0.3, h: h - 0.55, fontSize: 14, color: C.text1,
    margin: 0, valign: "top", isTextBox: true, paraSpaceAfter: 4 });
}

function bullets(items, opt = {}) {
  return items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, ...opt } }));
}

// ---------- 1 TITLE ----------
{
  sec("Introduction");
  const s = pres.addSlide({ masterName: "DARK", sectionTitle: "Introduction" });
  s.addText("HEXARCH", { x: 0.6, y: 0.7, w: 8.8, h: 0.9, fontSize: 54, bold: true, color: C.background1,
    fontFace: "Cambria", margin: 0, isTextBox: true });
  s.addText("Instruction and Data Memory Hierarchy", { x: 0.6, y: 1.6, w: 8.8, h: 0.6, fontSize: 28,
    color: "9FB3C8", margin: 0, isTextBox: true });
  s.addText("Phase I: Harvard vs shared memory   |   Phase II: cached hierarchy", { x: 0.6, y: 2.3, w: 8.8, h: 0.4,
    fontSize: 16, color: C.background1, margin: 0, isTextBox: true });
  const names = ["Akshat Chauhan", "Ajeesh Amreet", "Vaibhav", "Hardik Maheshwari", "Mitul Bhatia"];
  names.forEach((nm, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6 + i * 1.8, y: 3.2, w: 1.7, h: 0.85, rectRadius: 0.1,
      fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "Name chip " + nm });
    s.addText(nm, { x: 0.6 + i * 1.8, y: 3.2, w: 1.7, h: 0.85, fontSize: 14, bold: true, color: C.background1,
      align: "center", valign: "middle", margin: 4, isTextBox: true });
  });
  s.addText("MCA Project 9  |  Section A  |  Team HEXARCH", { x: 0.6, y: 4.5, w: 8.8, h: 0.4, fontSize: 14,
    color: "9FB3C8", margin: 0, isTextBox: true });
  s.addText("Repository: github.com/mitul-bhatia/HEXARCH", { x: 0.6, y: 4.9, w: 8.8, h: 0.35, fontSize: 12,
    color: "9FB3C8", margin: 0, isTextBox: true });
  s.addNotes("MITUL (30 seconds). Introduce all five members by name. One sentence: we built a simplified Harvard memory in Verilog, compared it with a shared single-port memory (Phase I), and in Phase II added a shared lower-level memory with two small caches, which is a memory hierarchy.");
}

// ---------- 2 PROBLEM ----------
{
  const s = base("The problem: one door or two?", "Mitul", "Project 9 brief, summarised in docs/REQUIREMENTS.md", "Introduction");
  // one door
  card(s, 0.5, 1.2, 4.3, 2.55, "Shared memory: one door", "", C.accent2);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.75, y: 2.0, w: 1.1, h: 0.7, fill: { color: C.accent1 }, line: { color: C.accent1 } });
  s.addText("CPU", { x: 0.75, y: 2.0, w: 1.1, h: 0.7, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.4, y: 2.0, w: 1.15, h: 0.7, fill: { color: C.accent2 }, line: { color: C.accent2 } });
  s.addText("One memory", { x: 3.4, y: 2.0, w: 1.15, h: 0.7, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.LINE, { x: 1.85, y: 2.35, w: 1.55, h: 0, line: { color: C.text1, width: 2.5, endArrowType: "triangle" } });
  s.addText("code OR data", { x: 1.7, y: 2.75, w: 1.9, h: 0.3, fontSize: 12, align: "center", color: C.text1, margin: 0, isTextBox: true });
  s.addText("Fetch must wait while data is used.", { x: 0.65, y: 3.2, w: 4.0, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true });
  // two doors
  card(s, 5.2, 1.2, 4.3, 2.55, "Harvard: two doors", "", C.accent3);
  s.addShape(pres.shapes.RECTANGLE, { x: 5.45, y: 2.0, w: 1.1, h: 0.7, fill: { color: C.accent1 }, line: { color: C.accent1 } });
  s.addText("CPU", { x: 5.45, y: 2.0, w: 1.1, h: 0.7, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 8.1, y: 1.75, w: 1.2, h: 0.5, fill: { color: C.accent3 }, line: { color: C.accent3 } });
  s.addText("Code", { x: 8.1, y: 1.75, w: 1.2, h: 0.5, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 8.1, y: 2.5, w: 1.2, h: 0.5, fill: { color: C.accent3 }, line: { color: C.accent3 } });
  s.addText("Data", { x: 8.1, y: 2.5, w: 1.2, h: 0.5, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addShape(pres.shapes.LINE, { x: 6.55, y: 2.0, w: 1.55, h: 0, line: { color: C.text1, width: 2.5, endArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 6.55, y: 2.7, w: 1.55, h: 0, line: { color: C.text1, width: 2.5, endArrowType: "triangle" } });
  s.addText("Fetch and data happen together.", { x: 5.35, y: 3.2, w: 4.0, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true });
  s.addText([
    { text: "Goal: ", options: { bold: true } },
    { text: "build both in Verilog, run the same programs, count cycles. Phase II adds the brief's optional shared lower-level memory.", options: {} }],
    { x: 0.5, y: 3.95, w: 9, h: 0.9, fontSize: 16, color: C.text1, margin: 0, valign: "top", isTextBox: true });
  s.addNotes("MITUL (45 seconds). A memory port can serve one access per clock tick. If code and data share one port, a data access blocks the next instruction fetch. A Harvard design has separate memories so both happen in the same tick. We measure the difference in cycles. Phase II adds the optional shared lower-level memory from the brief.");
}

// ---------- 3 TEAM ----------
{
  const s = base("Who built what", "Mitul", "docs/TEAM_AND_PLAN.md (roles table); member pull requests #6 to #9 in the GitHub history", "Introduction");
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 13 } });
  const row = (a, b, c, d) => [{ text: a, options: { bold: true } }, b, c, d];
  s.addTable([
    [hdr("Member"), hdr("Owns (files in rtl/ and tb/)"), hdr("Phase II role"), hdr("Slides")],
    row("Akshat Chauhan", "program_counter.v, instruction_memory.v, programs/demo.hex", "Instruction cache", "4, 5, 11"),
    row("Ajeesh Amreet", "data_memory.v, read_write_control.v, programs/data.hex", "Data cache, write-through", "6, 11"),
    row("Vaibhav", "shared_memory.v, address_decoder.v, fetch-stall rule", "lower_memory.v, one port", "7, 12"),
    row("Hardik Maheshwari", "tb/ testbenches, results/, waveforms", "Hierarchy tests and results", "8, 9, 13"),
    row("Mitul Bhatia", "memory_system.v, simple_controller.v, Makefile, report", "hierarchy_system.v, hold", "1-3, 10, 12, 14"),
  ], { x: 0.5, y: 1.25, w: 9, colW: [1.7, 3.9, 2.2, 1.2], fontSize: 12, color: C.text1,
       border: { type: "solid", color: C.accent5, pt: 1 }, rowH: 0.52, valign: "middle", margin: 0.06,
       fill: { color: C.background1 } });
  s.addText("Each member presents the slides above and can open their own files and pull requests.",
    { x: 0.5, y: 4.55, w: 9, h: 0.4, fontSize: 14, color: C.text1, margin: 0, isTextBox: true });
  s.addNotes("MITUL (30 seconds). Walk the table: each person owns specific files and presents specific slides. Everyone can explain the whole project, not only their files.");
}

// ---------- 4 BLOCK DIAGRAM ----------
{
  const s = base("Phase I architecture", "Akshat", "docs/figures/architecture.png (editable: architecture.svg); wired in rtl/memory_system.v, parameter SHARED_BUS", "Phase I");
  s.addImage({ path: "docs/figures/architecture.png", x: 0.5, y: 1.15, w: 5.6, h: 3.36, altText: "Block diagram: Harvard with separate memories on top, von Neumann style shared memory below", objectName: "Architecture diagram" });
  s.addText(bullets([
    "Top: Harvard. Two memories, two paths.",
    "Bottom: shared. One memory, one port.",
    "Same controller and program for both.",
    "One switch, SHARED_BUS = 0 or 1, picks the wiring.",
  ]), { x: 6.35, y: 1.2, w: 3.2, h: 3.2, fontSize: 15, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 8, isTextBox: true });
  s.addNotes("AKSHAT (45 seconds). Top half of the diagram is Harvard: controller with separate instruction and data memories. Bottom half is the shared design: an address decoder in front of one memory. The controller is the same module; one parameter, SHARED_BUS, selects which wiring is built in rtl/memory_system.v.");
}

// ---------- 5 INSTRUCTION PATH ----------
{
  const s = base("Instruction path: PC and memory", "Akshat", "rtl/program_counter.v lines 7-10; rtl/instruction_memory.v lines 9-11; programs/demo.hex", "Phase I");
  code(s, 0.5, 1.2, 5.3, 1.55, [
    { t: "always @(posedge clk) begin" },
    { t: "  if (reset) address <= 4'd0;" },
    { t: "  else if (enable)", hl: true },
    { t: "    address <= address + 4'd1;", hl: true },
    { t: "end" },
  ], "program_counter.v");
  code(s, 0.5, 2.95, 5.3, 1.6, [
    { t: "reg [7:0] words [0:15];" },
    { t: "initial $readmemh(PROGRAM_FILE, words);" },
    { t: "assign read_data = read_enable", hl: true },
    { t: "   ? words[address] : 8'h00;", hl: true },
  ], "instruction_memory.v");
  card(s, 6.05, 1.2, 3.45, 3.35, "Instruction = 1 byte",
    [{ text: "High 4 bits: opcode", options: { bullet: true, breakLine: true } },
     { text: "Low 4 bits: data address", options: { bullet: true, breakLine: true } },
     { text: "0 NOP, 1 LOAD, 2 STORE, F HALT", options: { bullet: true, breakLine: true } },
     { text: "Demo program: 10 21 F0 = LOAD 0, STORE 1, HALT", options: { bullet: true } }]);
  s.addNotes("AKSHAT (1 minute). The program counter is a 4-bit counter. It adds one on a clock tick only when a fetch is accepted (enable). The instruction memory is 16 bytes loaded from programs/demo.hex with $readmemh; reading is combinational. The demo program 10 21 F0 means LOAD 0, STORE 1, HALT.");
}

// ---------- 6 DATA PATH ----------
{
  const s = base("Data path: memory and decoding", "Ajeesh", "rtl/data_memory.v lines 11-15; rtl/read_write_control.v lines 7-10; programs/data.hex", "Phase I");
  code(s, 0.5, 1.2, 4.7, 1.8, [
    { t: "reg [7:0] words [0:15];" },
    { t: "assign read_data = read_enable" },
    { t: "  ? words[address] : 8'h00;" },
    { t: "always @(posedge clk)", hl: true },
    { t: "  if (write_enable)", hl: true },
    { t: "    words[address] <= write_data;", hl: true },
  ], "data_memory.v");
  code(s, 0.5, 3.15, 4.7, 1.4, [
    { t: "assign load  = instruction[7:4] == 4'h1;", hl: true },
    { t: "assign store = instruction[7:4] == 4'h2;", hl: true },
    { t: "assign halt  = instruction[7:4] == 4'hf;" },
  ], "read_write_control.v");
  card(s, 5.45, 1.2, 4.05, 3.35, "How it behaves",
    [{ text: "Reads are instant; writes happen on the clock tick.", options: { bullet: true, breakLine: true } },
     { text: "Reset does not erase memory (tested).", options: { bullet: true, breakLine: true } },
     { text: "Decoder turns the opcode into LOAD, STORE, HALT or illegal.", options: { bullet: true, breakLine: true } },
     { text: "Unknown opcode: stop and raise the fault flag.", options: { bullet: true } }]);
  s.addNotes("AJEESH (1 minute). Data memory is 16 bytes. Reads are combinational, writes are on the rising clock edge. read_write_control looks at the top four bits of the instruction: 1 is LOAD, 2 is STORE, F is HALT, 0 is NOP, anything else is illegal and the controller halts with the fault flag.");
}

// ---------- 7 SHARED + RULE ----------
{
  const s = base("Shared memory: the one-port rule", "Vaibhav", "rtl/address_decoder.v lines 8-9; rtl/shared_memory.v lines 12-19; rtl/simple_controller.v line 30", "Phase I");
  code(s, 0.5, 1.2, 4.7, 1.2, [
    { t: "assign physical_address =" },
    { t: "  data_select ? {1'b1, data_address}", hl: true },
    { t: "              : {1'b0, instruction_address};" },
  ], "address_decoder.v");
  code(s, 0.5, 2.55, 4.7, 1.0, [
    { t: "reg [7:0] words [0:31];  // ONE port" },
    { t: "assign read_data = ... words[address];" },
  ], "shared_memory.v");
  code(s, 0.5, 3.7, 9, 0.85, [
    { t: "assign fetch_enable = running && !stop_now && !(SHARED_BUS && data_access);", hl: true },
  ], "simple_controller.v:30  (the whole difference between the two designs)");
  card(s, 5.45, 1.2, 4.05, 2.35, "In plain words",
    [{ text: "Code sits at 0-15, data at 16-31.", options: { bullet: true, breakLine: true } },
     { text: "One port: LOAD or STORE uses it, so the next fetch waits one cycle.", options: { bullet: true, breakLine: true } },
     { text: "Harvard never blocks.", options: { bullet: true } }], C.accent2);
  s.addNotes("VAIBHAV (1 minute). In the shared design the address decoder puts instructions at addresses 0 to 15 and data at 16 to 31 of one 32-byte memory with one port. The key line is fetch_enable in simple_controller.v line 30: fetch is allowed unless we are in shared mode and the current instruction is using data. Each LOAD or STORE therefore adds one cycle.");
}

// ---------- 8 PHASE I RESULTS ----------
{
  const s = base("Result: Harvard 4, shared 6 cycles", "Hardik", "results/test_output.txt and results/demo_output.txt (make test, make demo)", "Phase I");
  const labels = ["demo", "boundaries", "no data", "halt only", "illegal", "reset+copy"];
  s.addChart(pres.charts.BAR, [
    { name: "Harvard", labels, values: [4, 6, 4, 2, 2, 8] },
    { name: "Shared", labels, values: [6, 10, 4, 2, 2, 14] },
  ], { x: 0.4, y: 1.15, w: 5.9, h: 3.8, barDir: "col", barGrouping: "clustered",
       chartColors: ["145F9B", "A54C13"], showLegend: true, legendPos: "b", legendFontSize: 12,
       showValue: true, dataLabelFontSize: 11, dataLabelPosition: "outEnd",
       catAxisLabelFontSize: 11, valAxisLabelFontSize: 11, catAxisLabelColor: "172638", valAxisLabelColor: "566778",
       valGridLine: { color: "D5DCE3", size: 0.5 }, catGridLine: { style: "none" },
       showTitle: true, title: "Cycles to finish (lower is better)", titleFontSize: 13, titleColor: "172638" });
  card(s, 6.55, 1.2, 2.95, 1.55, "Demo program", "LOAD 0, STORE 1, HALT. Data 7 is copied.");
  card(s, 6.55, 2.9, 2.95, 1.65, "Rule", "Harvard N+1. Shared N+1+M. M = LOAD/STORE count.", C.accent3);
  s.addNotes("HARDIK (1 minute). Run make demo and read the table: Harvard finishes in 4 cycles, shared in 6, same final memory. The bar chart shows the other scenarios from make test. With no data accesses both are equal. The formulas hold for every scenario and for 2000 random programs.");
}

// ---------- 9 WAVEFORM + TESTS ----------
{
  const s = base("Waveforms and automatic checking", "Hardik", "docs/figures/waveforms.png (from results/demo.vcd); tb/tb_memory_compare.v, tb/tb_random_stress.v, tb/tb_data_memory.v, tb/tb_read_write_control.v", "Phase I");
  s.addImage({ path: "docs/figures/waveforms.png", x: 0.5, y: 1.15, w: 5.2, h: 3.45, altText: "Waveform: Harvard fetch overlaps data read and write; shared fetch is blocked", objectName: "Waveform" });
  s.addText(bullets([
    "Harvard: fetch stays high while read and write pulse.",
    "Shared: fetch drops whenever read or write is high.",
    "11 scenarios, 2000 random programs.",
    "Checks: every data word, access counts, PC advance and hold, port ownership.",
    "make check runs everything; GitHub runs it on every pull request.",
  ]), { x: 5.95, y: 1.2, w: 3.6, h: 3.4, fontSize: 14, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 6, isTextBox: true });
  s.addNotes("HARDIK (1 minute). Left: the waveform. Blue is Harvard: fetch stays high while read and write pulse. Orange is shared: fetch drops every time the single port serves data. The testbenches check the final memory, that instructions never change, exact access counts, PC behaviour and that fetch and data never share the port. A random test of 2000 programs is compared with a software model.");
}

// ---------- 10 PHASE II IDEA ----------
{
  const s = base("Phase II: the cached hierarchy", "Mitul", "docs/figures/hierarchy.png (editable: hierarchy.svg); rtl/hierarchy_system.v; docs/PHASE2.md", "Phase II");
  s.addImage({ path: "docs/figures/hierarchy.png", x: 0.5, y: 1.15, w: 5.4, h: 2.16, altText: "Controller on top, instruction cache and data cache, one shared lower-level memory below", objectName: "Hierarchy diagram" });
  s.addText(bullets([
    "Each cache: 2 lines x 4 bytes.",
    "Hit: no delay.",
    "Miss: controller pauses 1 cycle (hold).",
    "One port: data goes first on a double miss.",
    "STORE writes through to memory.",
  ]), { x: 6.1, y: 1.2, w: 3.45, h: 3.3, fontSize: 15, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 8, isTextBox: true });
  card(s, 0.5, 3.5, 5.4, 1.05, "Why this is a hierarchy", "Small split memories on top, one shared memory below, like real machines.", C.accent3);
  s.addNotes("MITUL (1 minute). The brief lists an optional shared lower-level memory. We added it: the Harvard split stays on top as two tiny caches, and one shared memory sits underneath. A hit costs nothing. A miss pauses the controller for one cycle while a 4-byte block is copied in. The lower memory has one port, so on a double miss the data side is served first. Stores write through.");
}

// ---------- 11 CACHE ----------
{
  const s = base("The cache: one module used twice", "Akshat + Ajeesh", "rtl/l1_cache.v lines 18-20 (hit, read) and 26-28 (fill); instantiated twice in rtl/hierarchy_system.v", "Phase II");
  // address split
  const bit = (x, t, col, w) => { s.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w, h: 0.6, fill: { color: col }, line: { color: C.background1 } });
    s.addText(t, { x, y: 1.3, w, h: 0.6, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true }); };
  bit(0.5, "bit 3 = tag", "145F9B", 1.7); bit(2.2, "bit 2 = line", "17745C", 1.7); bit(3.9, "bits 1:0 = byte", "A54C13", 1.9);
  s.addText("4-bit address split", { x: 0.5, y: 1.95, w: 5.3, h: 0.3, fontSize: 12, color: C.text2, margin: 0, isTextBox: true });
  code(s, 0.5, 2.3, 5.3, 1.55, [
    { t: "wire index = address[2];" },
    { t: "assign hit = valid[index] &&", hl: true },
    { t: "    (tag[index] == address[3]);", hl: true },
    { t: "assign read_data = line[index]" },
    { t: "    >> (8 * address[1:0]);" },
  ], "l1_cache.v lines 18-20");
  code(s, 0.5, 3.98, 5.3, 0.9, [
    { t: "valid[index] <= 1'b1; tag[index] <= address[3];" },
    { t: "line[index] <= fill_data;   // 4 bytes", hl: true },
  ], "l1_cache.v lines 26-28 (fill on a miss)");
  card(s, 6.05, 1.3, 3.45, 3.3, "Two users",
    [{ text: "Instruction cache (Akshat): read-only, 4 instructions per miss.", options: { bullet: true, breakLine: true } },
     { text: "Data cache (Ajeesh): updated on a STORE if the byte is cached.", options: { bullet: true, breakLine: true } },
     { text: "Valid bit: line holds nothing until filled.", options: { bullet: true } }]);
  s.addNotes("AKSHAT then AJEESH (1 minute). One module, l1_cache.v, used twice. A 4-bit address is split: bit 3 is the tag, bit 2 picks one of two lines, bits 1 and 0 pick the byte. Hit means the line is valid and the tag matches. On a miss the whole 4-byte block is filled. Akshat: for instructions, one miss brings four, so a 16-byte program has only four misses. Ajeesh: for data, a STORE updates the cached byte only if it is already there.");
}

// ---------- 12 LOWER MEMORY + HOLD ----------
{
  const s = base("Lower memory, miss and hold", "Vaibhav + Mitul", "rtl/lower_memory.v lines 20-21; rtl/hierarchy_system.v lines 37-44; rtl/simple_controller.v lines 9, 18, 33, 42", "Phase II");
  code(s, 0.5, 1.2, 5.6, 1.15, [
    { t: "wire [4:0] base = {block_address[4:2], 2'b00};" },
    { t: "assign block_data = {words[base+3], words[base+2]," },
    { t: "                     words[base+1], words[base]};", hl: true },
  ], "lower_memory.v lines 20-21 (4-byte block, one port)");
  code(s, 0.5, 2.5, 5.6, 2.05, [
    { t: "assign d_miss = data_read_enable && !d_hit;" },
    { t: "assign i_miss = fetch_enable && !i_hit;" },
    { t: "assign hold   = d_miss || i_miss;", hl: true },
    { t: "wire fill_d = d_miss;       // data first" },
    { t: "wire fill_i = i_miss && !d_miss;" },
    { t: "wire store_now = data_write_enable && !hold;" },
  ], "hierarchy_system.v lines 37-44");
  card(s, 6.35, 1.2, 3.15, 3.35, "What it means",
    [{ text: "Vaibhav: lower memory returns a 4-byte block and takes one write.", options: { bullet: true, breakLine: true } },
     { text: "Mitul: any miss raises hold; the controller freezes one cycle.", options: { bullet: true, breakLine: true } },
     { text: "A STORE never runs during hold, so it never fights a miss for the port.", options: { bullet: true } }], C.accent2);
  s.addNotes("VAIBHAV then MITUL (1 minute). Vaibhav: lower_memory.v is the 32-byte shared memory with one port. On a miss it returns a whole 4-byte block; a STORE writes one byte. Mitul: hierarchy_system.v wires controller, two caches and the lower memory. hold is high when either cache misses. The controller got one new input, hold, tied to zero in Phase I so Phase I results did not change. If both miss, the data side fills first because there is one port. A store is gated by not hold.");
}

// ---------- 13 PHASE II RESULTS ----------
{
  const s = base("Phase II: each miss costs one cycle", "Hardik", "results/hierarchy_output.txt (make hierarchy); tb/tb_hierarchy.v", "Phase II");
  const labels = ["demo", "4 loads", "2 blocks", "same line", "16 bytes", "double miss", "store, load"];
  s.addChart(pres.charts.BAR, [
    { name: "Harvard", labels, values: [4, 7, 6, 6, 17, 3, 5] },
    { name: "Hierarchy", labels, values: [6, 10, 10, 12, 21, 5, 7] },
  ], { x: 0.4, y: 1.15, w: 6.1, h: 3.8, barDir: "col", barGrouping: "clustered",
       chartColors: ["145F9B", "7A3E8F"], showLegend: true, legendPos: "b", legendFontSize: 12,
       showValue: true, dataLabelFontSize: 11, dataLabelPosition: "outEnd",
       catAxisLabelFontSize: 11, valAxisLabelFontSize: 11, catAxisLabelColor: "172638", valAxisLabelColor: "566778",
       valGridLine: { color: "D5DCE3", size: 0.5 }, catGridLine: { style: "none" },
       showTitle: true, title: "Cycles to finish (lower is better)", titleFontSize: 13, titleColor: "172638" });
  card(s, 6.7, 1.2, 2.8, 1.5, "Formula", "N + 1 + I + D", C.accent3);
  card(s, 6.7, 2.85, 2.8, 1.7, "Verified",
    "7 directed + 3000 random programs match a software cache model.");
  s.addNotes("HARDIK (1 minute). Run make hierarchy. It prints a table: for example the demo takes 6 cycles with one instruction miss and one data miss. The bars compare Harvard with the hierarchy. The extra cycles equal the number of misses. Four loads from one block show the benefit: one miss serves four reads. Two blocks that share a line evict each other, so every load misses: 12 cycles. The test also checks a separate software model of the cache.");
}

// ---------- 14 CONCLUSION ----------
{
  const s = base("Three designs, three formulas", "Mitul", "docs/report/phase2_report.tex (final IEEE report), output/pdf/HEXARCH_Final_Report.pdf", "Phase II");
  const f = (x, head, formula, sub, col) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.2, w: 2.85, h: 1.6, rectRadius: 0.1, fill: { color: col }, line: { color: col } });
    s.addText([{ text: head, options: { fontSize: 14, bold: true, breakLine: true } },
               { text: formula, options: { fontSize: 22, bold: true, breakLine: true } },
               { text: sub, options: { fontSize: 12 } }],
      { x, y: 1.2, w: 2.85, h: 1.6, align: "center", valign: "middle", color: C.background1, margin: 6, isTextBox: true });
  };
  f(0.5, "Harvard", "N + 1", "demo: 4 cycles", "145F9B");
  f(3.575, "Shared", "N + 1 + M", "demo: 6 cycles", "A54C13");
  f(6.65, "Hierarchy", "N + 1 + I + D", "demo: 6 cycles", "7A3E8F");
  s.addText([
    { text: "Limits (we say them first)", options: { bold: true, breakLine: true } },
    ...bullets(["Tiny caches, no branches or loops.", "Simulation only: no synthesis or real clock speed.", "Hierarchy never beats pure Harvard; it models a real shared memory."]),
  ], { x: 0.5, y: 3.0, w: 4.5, h: 1.9, fontSize: 14, color: C.text1, margin: 0, valign: "top", paraSpaceAfter: 5, isTextBox: true });
  s.addText([
    { text: "Next steps", options: { bold: true, breakLine: true } },
    ...bullets(["Branches and loops.", "Synchronous-read memories.", "Bigger caches, FPGA synthesis."]),
  ], { x: 5.3, y: 3.0, w: 4.2, h: 1.9, fontSize: 14, color: C.text1, margin: 0, valign: "top", paraSpaceAfter: 5, isTextBox: true });
  s.addNotes("MITUL (1 minute). Three designs, three formulas. Harvard N+1. Shared N+1+M: one extra cycle per data access. Hierarchy N+1+I+D: one extra cycle per cache miss. Be upfront about limits: tiny caches, no branches, simulation only. The hierarchy cannot beat pure Harvard in our model; its value is realism and that it beats the shared-only design when code and data are reused. Next: branches, synchronous memories, synthesis.");
}

// ---------- 15 WHERE EVERYTHING IS ----------
{
  const s = base("Where everything is", "Everyone", "Repository root: github.com/mitul-bhatia/HEXARCH (README.md, VIDEO.md, docs/PHASE2.md)", "Wrap-up");
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 12 } });
  s.addTable([
    [hdr("What"), hdr("Where")],
    ["Verilog RTL", "rtl/  (Phase II: l1_cache.v, lower_memory.v, hierarchy_system.v)"],
    ["Testbenches", "tb/  (tb_hierarchy.v is Phase II)"],
    ["Results and waveforms", "results/  (*.vcd, *_output.txt)"],
    ["Diagrams", "docs/figures/"],
    ["Reports", "output/pdf/  (Phase I and Final IEEE reports)"],
    ["Study material", "website: mitul-bhatia.github.io/HEXARCH  (simple.html)"],
  ], { x: 0.5, y: 1.2, w: 5.6, colW: [1.7, 3.9], fontSize: 12, color: C.text1,
       border: { type: "solid", color: C.accent5, pt: 1 }, rowH: 0.45, valign: "middle", margin: 0.06 });
  code(s, 6.35, 1.2, 3.15, 2.2, [
    { t: "make demo" }, { t: "make test" }, { t: "make stress" }, { t: "make hierarchy" }, { t: "make check", hl: true },
  ], "run from the repo root");
  card(s, 6.35, 3.55, 3.15, 1.0, "Questions?", "Any member, any slide.", C.accent3);
  s.addNotes("EVERYONE (remaining time). Point at the repository map. Offer to run make demo and make hierarchy live. Any member can answer questions about any slide.");
}

(async () => {
  await pres.writeFile({ fileName: "output/HEXARCH_Presentation.pptx" });
  if (applyTheme) await applyTheme("output/HEXARCH_Presentation.pptx", THEME);
  console.log("written output/HEXARCH_Presentation.pptx", applyTheme ? "(theme applied)" : "(theme NOT applied)");
})();
