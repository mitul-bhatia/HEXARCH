`timescale 1ns/1ps

module tb_read_write_control;
    reg [7:0] instruction;
    wire load, store, halt, illegal;

    read_write_control dut (
        .instruction(instruction),
        .load(load),
        .store(store),
        .halt(halt),
        .illegal(illegal)
    );

    integer i;
    reg [3:0] opcode;
    reg [3:0] address;
    reg expected_load, expected_store, expected_halt, expected_illegal;
    integer pass_count = 0;

    task check(input condition, input string msg);
        if (condition !== 1'b1) begin
            $fatal(1, "FAIL [read_write_control]: %s (instruction=0x%02h, load=%b, store=%b, halt=%b, illegal=%b) at %0t",
                   msg, instruction, load, store, halt, illegal, $time);
        end
    endtask

    initial begin
        // Exhaustive test across all 256 instruction byte encodings (0x00 through 0xFF)
        for (i = 0; i < 256; i = i + 1) begin
            instruction = i[7:0];
            #1; // Allow combinational propagation
            opcode = instruction[7:4];
            address = instruction[3:0];

            expected_load    = (opcode == 4'h1);
            expected_store   = (opcode == 4'h2);
            expected_halt    = (opcode == 4'hf);
            expected_illegal = (opcode >= 4'h3 && opcode <= 4'he);

            // Verify each decoded signal
            check(load === expected_load, "LOAD decode mismatch");
            check(store === expected_store, "STORE decode mismatch");
            check(halt === expected_halt, "HALT decode mismatch");
            check(illegal === expected_illegal, "ILLEGAL decode mismatch");

            // Mutual exclusivity: at most one active control signal
            check((load + store + halt + illegal) <= 1, "Multiple control signals asserted simultaneously");

            // Invariant: LOAD and STORE must NEVER collide
            check(!(load && store), "LOAD and STORE both asserted simultaneously");

            // NOP verification: opcode 0 produces all zero control signals
            if (opcode == 4'h0) begin
                check(!load && !store && !halt && !illegal, "NOP opcode 0 asserted a control signal");
            end

            pass_count = pass_count + 1;
        end

        $display("PASS read_write_control: All %0d instruction byte encodings exhaustively verified", pass_count);
        $finish;
    end
endmodule
