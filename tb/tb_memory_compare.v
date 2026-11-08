`timescale 1ns/1ps
module tb_memory_compare;
    reg clk = 0;
    reg reset = 1;
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

    reg [7:0] image [0:15];
    reg [7:0] seed [0:15];
    reg [7:0] expected [0:15];
    integer summary, trace, i;
    integer cycles, hc, sc, overlaps, stalls, hr, hw, sr, sw;
    reg [3:0] hp, sp;
    reg hf, sf, hrd, hwr, srd, swr;
    reg boot_verified = 0;
    reg demo_only;

    task check(input condition, input string message);
        if (condition !== 1'b1) $fatal(1, "FAIL: %s at %0t", message, $time);
    endtask

    task prepare(input integer mode);
        begin
            @(negedge clk); reset = 1;
            for (i = 0; i < 16; i = i + 1) begin
                image[i] = 8'hf0; seed[i] = 0; expected[i] = 0;
            end
            case (mode)
                0: begin
                    // Main demonstration: copy one byte, then stop.
                    image[0]=8'h10; image[1]=8'h21;
                    seed[0]=7;
                    expected[0]=7; expected[1]=7;
                end
                1: begin
                    // Exercise both address boundaries and an immediate store-to-load.
                    image[0]=8'h1f; image[1]=8'h20; image[2]=8'h10; image[3]=8'h2f;
                    seed[15]=8'ha5; expected[0]=8'ha5; expected[15]=8'ha5;
                end
                2: begin image[0]=8'h00; image[1]=8'h00; end
                3: begin /* HALT is already at address zero. */ end
                4: begin image[0]=8'h30; image[1]=8'h21; end
                5: begin
                    // Longer copy chain is used only to check mid-program reset.
                    image[0]=8'h10; image[1]=8'h21; image[2]=8'h11;
                    image[3]=8'h22; image[4]=8'h12; image[5]=8'h23;
                    seed[0]=7;
                    expected[0]=7; expected[1]=7; expected[2]=7; expected[3]=7;
                end
            endcase
            // Load identical images into both architectures while held in reset.
            for (i = 0; i < 16; i = i + 1) begin
                if (!boot_verified) begin
                    check(h.harvard_path.imem.words[i] === image[i] &&
                          s.shared_path.mem.words[i] === image[i], "program hex file initializes both memories");
                    check(h.harvard_path.dmem.words[i] === seed[i] &&
                          s.shared_path.mem.words[16+i] === seed[i], "data hex file initializes both memories");
                end
                h.harvard_path.imem.words[i] = image[i];
                h.harvard_path.dmem.words[i] = seed[i];
                s.shared_path.mem.words[i] = image[i];
                s.shared_path.mem.words[16+i] = seed[i];
            end
            boot_verified = 1;
            @(posedge clk); #1;
            check(h_pc == 0 && s_pc == 0 && h_acc == 0 && s_acc == 0,
                  "reset clears controller state");
            check(!(h_fetch || h_read || h_write || s_fetch || s_read || s_write),
                  "reset suppresses memory traffic");
            @(negedge clk); reset = 0;
        end
    endtask

    task run_checked(input string label_name, input integer expected_hc,
                     input integer expected_sc, input integer memory_ops,
                     input [7:0] final_acc, input expected_fault, input record_trace);
        begin
            cycles=0; hc=0; sc=0; overlaps=0; stalls=0; hr=0; hw=0; sr=0; sw=0;
            if (record_trace) begin
                trace = $fopen("results/demo_trace.csv", "w");
                check(trace != 0, "trace file opens");
                $fwrite(trace, "cycle,h_pc,h_ir,h_valid,h_fetch,h_read,h_write,h_acc_before,s_pc,s_ir,s_valid,s_fetch,s_read,s_write,s_acc_before,h_acc_after,s_acc_after,h_halted_after,s_halted_after\n");
                if (demo_only) begin
                    $display("PROGRAM: LOAD 0 -> STORE 1 -> HALT. Initially data[0]=7.");
                    $display("F/R/W = instruction fetch / data read / data write. H/S = Harvard / shared.");
                    $display("Cycle | Harvard F/R/W | Shared F/R/W | ACC H/S after edge | HALT H/S");
                end
            end
            while (!(h_halted && s_halted) && cycles < 80) begin
                @(posedge clk);
                cycles = cycles + 1;
                hp=h_pc; sp=s_pc; hf=h_fetch; sf=s_fetch;
                hrd=h_read; hwr=h_write; srd=s_read; swr=s_write;
                if (!h_halted) hc=hc+1;
                if (!s_halted) sc=sc+1;
                check(!(s_fetch && (s_read || s_write)), "shared port has one owner");
                check(!(h_read && h_write) && !(s_read && s_write), "no read/write collision");
                if (h_fetch && (h_read || h_write)) overlaps=overlaps+1;
                if (s_read || s_write) stalls=stalls+1;
                if (h_read) hr=hr+1;
                if (h_write) hw=hw+1;
                if (s_read) sr=sr+1;
                if (s_write) sw=sw+1;
                if (record_trace)
                    $fwrite(trace, "%0d,%0d,%02h,%0d,%0d,%0d,%0d,%0d,%0d,%02h,%0d,%0d,%0d,%0d,%0d,",
                        cycles,h_pc,h_ir,h_valid,h_fetch,h_read,h_write,h_acc,
                        s_pc,s_ir,s_valid,s_fetch,s_read,s_write,s_acc);
                #1;
                check(h_pc === ((hp + hf) & 4'hf), "Harvard PC advances only on fetch");
                check(s_pc === ((sp + sf) & 4'hf), "shared PC holds during blocked fetch");
                if (record_trace)
                    $fwrite(trace, "%0d,%0d,%0d,%0d\n", h_acc,s_acc,h_halted,s_halted);
                if (record_trace && demo_only)
                    $display("  %0d   |     %0d/%0d/%0d     |    %0d/%0d/%0d     |       %0d/%0d        |   %0d/%0d",
                        cycles,hf,hrd,hwr,sf,srd,swr,h_acc,s_acc,h_halted,s_halted);
            end
            if (record_trace) $fclose(trace);
            check(h_halted && s_halted, "both systems halt before timeout");
            check(hc == expected_hc && sc == expected_sc, "expected total cycle counts");
            check(h_acc === final_acc && s_acc === final_acc, "expected accumulator");
            check(h_fault === expected_fault && s_fault === expected_fault, "expected fault state");
            check(hr+hw == memory_ops && sr+sw == memory_ops, "exactly-once data operations");
            check(hr == sr && hw == sw, "same number of reads and writes");
            check(overlaps == memory_ops && stalls == memory_ops, "overlap and stall counts");
            for (i = 0; i < 16; i = i + 1) begin
                check(h.harvard_path.dmem.words[i] === expected[i], "Harvard data result");
                check(s.shared_path.mem.words[16+i] === expected[i], "shared data result");
                check(h.harvard_path.imem.words[i] === image[i], "Harvard instructions unchanged");
                check(s.shared_path.mem.words[i] === image[i], "shared instructions unchanged");
            end
            repeat (2) begin
                @(posedge clk); #1;
                check(!(h_fetch || h_read || h_write || s_fetch || s_read || s_write),
                      "halt suppresses all traffic");
                check(h_acc === final_acc && s_acc === final_acc, "halt holds accumulator");
            end
            $display("PASS %-18s Harvard=%0d shared=%0d overlap=%0d stalls=%0d ACC=%0d",
                     label_name,hc,sc,overlaps,stalls,h_acc);
            $fwrite(summary, "%s,%0d,%0d,%0d,%0d,%0d,%0d\n",
                    label_name,hc,sc,overlaps,stalls,h_acc,expected_fault);
        end
    endtask

    initial begin
        demo_only = $test$plusargs("DEMO_ONLY");
        if (demo_only) $dumpfile("build/demo.vcd");
        else $dumpfile("build/memory_compare.vcd");
        $dumpvars(0, tb_memory_compare);
        if (demo_only) summary=$fopen("results/demo_summary.csv", "w");
        else summary=$fopen("results/summary.csv", "w");
        check(summary != 0, "summary file opens");
        $fwrite(summary, "case,harvard_cycles,shared_cycles,overlap_cycles,shared_stalls,accumulator,fault\n");
        prepare(0); run_checked("demo",4,6,2,7,0,1);
        if (demo_only) begin
            $fclose(summary);
            $display("DEMO PASSED: data[1]=7 in both designs. Harvard=4 cycles; shared=6 cycles.");
            $finish;
        end
        prepare(1); run_checked("address_boundaries",6,10,4,8'ha5,0,0);
        prepare(2); run_checked("no_data_access",4,4,0,0,0,0);
        prepare(3); run_checked("halt_only",2,2,0,0,0,0);
        prepare(4); run_checked("illegal_opcode",2,2,0,0,1,0);

        prepare(5);
        repeat (4) @(posedge clk);
        @(negedge clk); reset=1;
        @(posedge clk); #1;
        check(h_pc == 0 && s_pc == 0 && !h_valid && !s_valid &&
              !h_halted && !s_halted && !h_fault && !s_fault && h_acc == 0 && s_acc == 0,
              "mid-program reset clears controller and pending instruction");
        check(h.harvard_path.dmem.words[1] == 7 && s.shared_path.mem.words[17] == 7,
              "controller reset retains completed memory writes");
        check(!(h_write || s_write || h_fetch || s_fetch), "reset has no write or fetch");
        @(negedge clk); reset=0;
        run_checked("reset_and_restart",8,14,6,7,0,0);
        $fclose(summary);
        $display("ALL TESTS PASSED (6 scenarios)");
        $finish;
    end
    initial begin #10000; $fatal(1, "global simulation timeout"); end
endmodule
