`timescale 1ns/1ps
// Random stress test: 2000 straight-line programs (NOP/LOAD/STORE, ending in
// HALT) run on both organizations and are checked against a software model.
// It also checks the cycle model used in the report:
//   Harvard cycles = N + 1,  shared cycles = N + 1 + M
// where N = instructions executed (including HALT) and M = LOAD/STORE count.
// $urandom uses a fixed default seed in Icarus Verilog, so runs are repeatable.
module tb_random_stress;
    reg clk = 0, reset = 1;
    always #5 clk = ~clk;

    wire [3:0] h_pc, h_addr, s_pc, s_addr;
    wire [7:0] h_acc, h_ir, s_acc, s_ir;
    wire h_valid, h_halted, h_fault, h_fetch, h_read, h_write;
    wire s_valid, s_halted, s_fault, s_fetch, s_read, s_write;

    memory_system #(.SHARED_BUS(0)) h (
        .clk(clk), .reset(reset), .pc(h_pc), .data_address(h_addr),
        .accumulator(h_acc), .instruction_register(h_ir), .execute_valid(h_valid),
        .halted(h_halted), .fault(h_fault), .fetch_enable(h_fetch),
        .data_read_enable(h_read), .data_write_enable(h_write));
    memory_system #(.SHARED_BUS(1)) s (
        .clk(clk), .reset(reset), .pc(s_pc), .data_address(s_addr),
        .accumulator(s_acc), .instruction_register(s_ir), .execute_valid(s_valid),
        .halted(s_halted), .fault(s_fault), .fetch_enable(s_fetch),
        .data_read_enable(s_read), .data_write_enable(s_write));

    localparam PROGRAMS = 2000;
    reg [7:0] program_image [0:15];
    reg [7:0] seed [0:15];
    reg [7:0] model [0:15];
    reg [7:0] model_acc;
    integer t, i, n, m, op, a, hc, sc, failures, bad;

    initial begin
        failures = 0;
        for (t = 0; t < PROGRAMS; t = t + 1) begin
            @(negedge clk); reset = 1;
            // Build the program and compute the expected result in software.
            n = 1 + ($urandom % 16);
            m = 0;
            model_acc = 0;
            for (i = 0; i < 16; i = i + 1) begin
                program_image[i] = 8'hf0;
                seed[i] = $urandom;
                model[i] = seed[i];
            end
            for (i = 0; i < n - 1; i = i + 1) begin
                op = $urandom % 3;
                a = $urandom % 16;
                if (op == 0) program_image[i] = {4'h0, a[3:0]};
                else if (op == 1) begin
                    program_image[i] = {4'h1, a[3:0]}; model_acc = model[a]; m = m + 1;
                end else begin
                    program_image[i] = {4'h2, a[3:0]}; model[a] = model_acc; m = m + 1;
                end
            end
            for (i = 0; i < 16; i = i + 1) begin
                h.harvard_path.imem.words[i] = program_image[i];
                h.harvard_path.dmem.words[i] = seed[i];
                s.shared_path.mem.words[i] = program_image[i];
                s.shared_path.mem.words[16+i] = seed[i];
            end
            @(posedge clk); #1;
            @(negedge clk); reset = 0;

            hc = 0; sc = 0; bad = 0;
            while (!(h_halted && s_halted) && hc < 100 && sc < 100) begin
                @(posedge clk);
                if (!h_halted) hc = hc + 1;
                if (!s_halted) sc = sc + 1;
                if (s_fetch && (s_read || s_write)) bad = 1;
                #1;
            end
            if (hc != n + 1 || sc != n + 1 + m) bad = 1;
            if (h_acc !== model_acc || s_acc !== model_acc || h_fault || s_fault) bad = 1;
            for (i = 0; i < 16; i = i + 1) begin
                if (h.harvard_path.dmem.words[i] !== model[i] ||
                    s.shared_path.mem.words[16+i] !== model[i]) bad = 1;
                if (h.harvard_path.imem.words[i] !== program_image[i] ||
                    s.shared_path.mem.words[i] !== program_image[i]) bad = 1;
            end
            if (bad) begin
                failures = failures + 1;
                if (failures <= 5)
                    $display("FAIL program %0d: N=%0d M=%0d Harvard=%0d (expected %0d) shared=%0d (expected %0d)",
                             t, n, m, hc, n + 1, sc, n + 1 + m);
            end
        end
        if (failures == 0)
            $display("STRESS PASSED: %0d random programs; both designs match the software model; Harvard = N+1 and shared = N+1+M cycles in every program.", PROGRAMS);
        else
            $display("STRESS FAILED: %0d of %0d programs", failures, PROGRAMS);
        $finish;
    end
    initial begin #100000000; $fatal(1, "global simulation timeout"); end
endmodule
