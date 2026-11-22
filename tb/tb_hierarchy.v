`timescale 1ns/1ps
// Phase II test: Harvard L1 caches over one shared lower memory ("hierarchy")
// against the Phase I Harvard design, plus a software model of the caches.
//
// For a straight-line program of N instructions (including HALT):
//   Harvard cycles   = N + 1
//   Hierarchy cycles = N + 1 + (instruction misses) + (data-load misses)
// Every miss costs exactly one extra cycle. The expected miss counts come from a
// small software cache model written below, independent of the RTL.
module tb_hierarchy;
    reg clk = 0, reset = 1;
    always #5 clk = ~clk;

    wire [3:0] h_pc, h_addr, c_pc, c_addr;
    wire [7:0] h_acc, h_ir, c_acc, c_ir;
    wire h_valid, h_halted, h_fault, h_fetch, h_read, h_write;
    wire c_valid, c_halted, c_fault, c_fetch, c_read, c_write, c_hold, c_imiss, c_dmiss;

    memory_system #(.SHARED_BUS(0)) h (
        .clk(clk), .reset(reset), .pc(h_pc), .data_address(h_addr),
        .accumulator(h_acc), .instruction_register(h_ir), .execute_valid(h_valid),
        .halted(h_halted), .fault(h_fault), .fetch_enable(h_fetch),
        .data_read_enable(h_read), .data_write_enable(h_write));
    hierarchy_system c (
        .clk(clk), .reset(reset), .pc(c_pc), .data_address(c_addr),
        .accumulator(c_acc), .instruction_register(c_ir), .execute_valid(c_valid),
        .halted(c_halted), .fault(c_fault), .fetch_enable(c_fetch),
        .data_read_enable(c_read), .data_write_enable(c_write),
        .hold(c_hold), .i_miss(c_imiss), .d_miss(c_dmiss));

    reg [7:0] program_image [0:15];
    reg [7:0] seed [0:15];
    reg [7:0] model [0:15];
    reg [7:0] model_acc;
    // software model of the data cache: 2 lines, valid + tag per line
    reg mv [0:1];
    reg mt [0:1];
    integer t, i, n, m, a, op, hc, cc, exp_im, exp_dm, got_im, got_dm, bad;
    integer failures, scenarios, directed;
    reg [8*24-1:0] name;
    reg [15:0] last_block_i;

    // Build model + expected counts for the program currently in program_image.
    task build_expectations;
        begin
            model_acc = 0; exp_im = 0; exp_dm = 0; m = 0;
            mv[0] = 0; mv[1] = 0;
            for (i = 0; i < 16; i = i + 1) model[i] = seed[i];
            // straight-line fetches of addresses 0..n-1: one miss per new 4-byte block
            exp_im = (n + 3) / 4;
            for (i = 0; i < n - 1; i = i + 1) begin
                a = program_image[i][3:0];
                case (program_image[i][7:4])
                    4'h1: begin   // LOAD: miss unless the block is cached
                        model_acc = model[a]; m = m + 1;
                        if (!(mv[a[2]] && mt[a[2]] == a[3])) begin
                            exp_dm = exp_dm + 1; mv[a[2]] = 1; mt[a[2]] = a[3];
                        end
                    end
                    4'h2: begin model[a] = model_acc; m = m + 1; end  // STORE: no allocate
                    default: ;
                endcase
            end
        end
    endtask

    task run_program(input record);
        begin
            @(negedge clk); reset = 1;
            for (i = 0; i < 16; i = i + 1) begin
                h.harvard_path.imem.words[i] = program_image[i];
                h.harvard_path.dmem.words[i] = seed[i];
                c.lower.words[i] = program_image[i];
                c.lower.words[16+i] = seed[i];
            end
            @(posedge clk); #1;
            @(negedge clk); reset = 0;
            hc = 0; cc = 0; bad = 0; got_im = 0; got_dm = 0;
            while (!(h_halted && c_halted) && hc < 200 && cc < 200) begin
                @(posedge clk);
                if (!h_halted) hc = hc + 1;
                if (!c_halted) begin
                    cc = cc + 1;
                    // an instruction miss is counted when its block is actually filled
                    if (c_imiss && !c_dmiss) got_im = got_im + 1;
                    if (c_dmiss) got_dm = got_dm + 1;
                    // the single lower-memory port: nothing else may use it during a hold
                    if (c_hold && c.lower.write_enable) bad = 1;
                end
                #1;
            end
            if (hc != n + 1) bad = 1;
            if (got_im != exp_im || got_dm != exp_dm) bad = 1;
            if (cc != n + 1 + exp_im + exp_dm) bad = 1;
            if (c_acc !== model_acc || h_acc !== model_acc || c_fault || h_fault) bad = 1;
            for (i = 0; i < 16; i = i + 1) begin
                if (c.lower.words[16+i] !== model[i] || h.harvard_path.dmem.words[i] !== model[i]) bad = 1;
                if (c.lower.words[i] !== program_image[i]) bad = 1;
            end
            scenarios = scenarios + 1;
            if (bad) begin
                failures = failures + 1;
                if (failures <= 5)
                    $display("FAIL %0s: N=%0d Harvard=%0d (exp %0d) hierarchy=%0d (exp %0d) I-miss=%0d (exp %0d) D-miss=%0d (exp %0d)",
                             name, n, hc, n+1, cc, n+1+exp_im+exp_dm, got_im, exp_im, got_dm, exp_dm);
            end else if (record)
                $display("PASS %-22s N=%0d  Harvard=%0d  Hierarchy=%0d  I-miss=%0d  D-miss=%0d  ACC=%0d",
                         name, n, hc, cc, got_im, got_dm, c_acc);
        end
    endtask

    task clear;
        begin
            for (i = 0; i < 16; i = i + 1) begin program_image[i] = 8'hf0; seed[i] = 0; end
        end
    endtask

    initial begin
        failures = 0; scenarios = 0;
        mt[0] = 0; mt[1] = 0;
        $display("Scenario               Program size, cycles and cache events");

        clear; name = "demo_copy"; n = 3;           // LOAD 0, STORE 1, HALT
        program_image[0]=8'h10; program_image[1]=8'h21; seed[0]=7;
        build_expectations; run_program(1);

        clear; name = "data_reuse"; n = 6;          // four LOADs from one block, then STORE
        program_image[0]=8'h10; program_image[1]=8'h11; program_image[2]=8'h12;
        program_image[3]=8'h13; program_image[4]=8'h24;
        seed[0]=1; seed[1]=2; seed[2]=3; seed[3]=4;
        build_expectations; run_program(1);

        clear; name = "two_data_blocks"; n = 5;     // LOAD 0, LOAD 4, LOAD 1, LOAD 5 (2 lines: all fit)
        program_image[0]=8'h10; program_image[1]=8'h14; program_image[2]=8'h11; program_image[3]=8'h15;
        seed[0]=1; seed[1]=2; seed[4]=5; seed[5]=6;
        build_expectations; run_program(1);

        clear; name = "conflict_thrash"; n = 5;     // blocks 0 and 2 share line 0 (tag differs)
        program_image[0]=8'h10; program_image[1]=8'h18; program_image[2]=8'h10; program_image[3]=8'h18;
        seed[0]=1; seed[8]=9;
        build_expectations; run_program(1);

        clear; name = "full_16_byte_program"; n = 16;
        for (i = 0; i < 15; i = i + 1) program_image[i] = 8'h00;
        build_expectations; run_program(1);

        clear; name = "instr_and_data_miss"; n = 2;   // first fetch + first LOAD both miss at once
        program_image[0]=8'h1a; seed[10]=8'h55;
        build_expectations; run_program(1);

        clear; name = "store_then_load"; n = 4;       // STORE does not allocate; the LOAD then misses
        program_image[0]=8'h10; program_image[1]=8'h23; program_image[2]=8'h13;
        seed[0]=8'h42;
        build_expectations; run_program(1);

        // 3000 random straight-line programs
        for (t = 0; t < 3000; t = t + 1) begin
            clear; name = "random";
            n = 1 + ($urandom % 16);
            for (i = 0; i < 16; i = i + 1) seed[i] = $urandom;
            for (i = 0; i < n - 1; i = i + 1) begin
                op = $urandom % 3; a = $urandom % 16;
                program_image[i] = {op[3:0], a[3:0]};
            end
            build_expectations; run_program(0);
        end

        if (failures == 0)
            $display("HIERARCHY PASSED: %0d programs; results match the Harvard design and the software model; cycles = N + 1 + I-misses + D-misses every time.", scenarios);
        else
            $display("HIERARCHY FAILED: %0d of %0d programs", failures, scenarios);
        $finish;
    end
    initial begin #200000000; $fatal(1, "global simulation timeout"); end
endmodule
