`timescale 1ns/1ps

module tb_data_memory;
    reg clk = 0;
    always #5 clk = ~clk;

    reg read_enable = 0;
    reg write_enable = 0;
    reg [3:0] address = 0;
    reg [7:0] write_data = 0;
    wire [7:0] read_data;

    data_memory dut (
        .clk(clk),
        .read_enable(read_enable),
        .write_enable(write_enable),
        .address(address),
        .write_data(write_data),
        .read_data(read_data)
    );

    integer i;

    task check(input condition, input string msg);
        if (condition !== 1'b1) begin
            $fatal(1, "FAIL [data_memory]: %s (addr=0x%01h, r_en=%b, w_en=%b, w_data=0x%02h, r_data=0x%02h) at %0t",
                   msg, address, read_enable, write_enable, write_data, read_data, $time);
        end
    endtask

    initial begin
        // -------------------------------------------------------------
        // 1. Initial memory state validation from programs/data.hex
        // -------------------------------------------------------------
        #1;
        read_enable = 1;
        address = 4'h0;
        #1;
        check(read_data === 8'h07, "Initial data[0] must match programs/data.hex (0x07)");

        for (i = 1; i < 16; i = i + 1) begin
            address = i[3:0];
            #1;
            check(read_data === 8'h00, "Initial data[1..15] must be 0x00");
        end

        // -------------------------------------------------------------
        // 2. Read enable suppression
        // -------------------------------------------------------------
        read_enable = 0;
        address = 4'h0; // Address 0 contains 8'h07
        #1;
        check(read_data === 8'h00, "Read data must be suppressed (0x00) when read_enable is low");

        for (i = 0; i < 16; i = i + 1) begin
            address = i[3:0];
            #1;
            check(read_data === 8'h00, "Read data must be 0x00 for all addresses when read_enable=0");
        end

        // -------------------------------------------------------------
        // 3. Asynchronous / combinational read latency
        // -------------------------------------------------------------
        read_enable = 1;
        address = 4'h0;
        #1;
        check(read_data === 8'h07, "Async read address 0");
        address = 4'h1;
        #0; // 0-delay check: combinational update
        check(read_data === 8'h00, "Async read address 1 takes effect combinational delay");

        // -------------------------------------------------------------
        // 4. Synchronous rising-edge write timing & write enable suppression
        // -------------------------------------------------------------
        @(negedge clk);
        // Attempt write with write_enable = 0 (write suppression)
        write_enable = 0;
        address = 4'h2;
        write_data = 8'haa;
        @(posedge clk);
        #1;
        read_enable = 1;
        address = 4'h2;
        #1;
        check(read_data === 8'h00, "Clock edge with write_enable=0 must not mutate memory");

        // Write with write_enable = 1 on posedge clk
        @(negedge clk);
        write_enable = 1;
        address = 4'h2;
        write_data = 8'h5c;
        #2; // Before posedge
        check(read_data === 8'h00, "Data must NOT write before posedge clk");
        @(posedge clk);
        #1; // Immediately after posedge
        check(read_data === 8'h5c, "Data must write on posedge clk when write_enable=1");
        write_enable = 0;

        // -------------------------------------------------------------
        // 5. Boundary address testing (0x0 and 0xF)
        // -------------------------------------------------------------
        // Test lower boundary address 0x0
        @(negedge clk);
        write_enable = 1;
        address = 4'h0;
        write_data = 8'ha1;
        @(posedge clk);
        #1;
        check(read_data === 8'ha1, "Lower boundary address 0x0 write/read verification");

        // Test upper boundary address 0xF
        @(negedge clk);
        write_enable = 1;
        address = 4'hf;
        write_data = 8'hf2;
        @(posedge clk);
        #1;
        check(read_data === 8'hf2, "Upper boundary address 0xF write/read verification");
        write_enable = 0;

        // Verify address 0x0 was not affected by write to 0xF
        address = 4'h0;
        #1;
        check(read_data === 8'ha1, "Writing upper boundary must not corrupt lower boundary");

        // -------------------------------------------------------------
        // 6. Full 16-word address pattern & isolation test
        // -------------------------------------------------------------
        // Write distinct signature to each word (e.g. i ^ 8'h55)
        for (i = 0; i < 16; i = i + 1) begin
            @(negedge clk);
            write_enable = 1;
            address = i[3:0];
            write_data = i[7:0] ^ 8'h55;
            @(posedge clk);
        end
        @(negedge clk);
        write_enable = 0;

        // Read back all addresses in reverse order to verify no aliasing / crosstalk
        read_enable = 1;
        for (i = 15; i >= 0; i = i - 1) begin
            address = i[3:0];
            #1;
            check(read_data === (i[7:0] ^ 8'h55), "Address isolation check failed on readback");
        end

        // -------------------------------------------------------------
        // 7. Consecutive STORE and LOAD operations
        // -------------------------------------------------------------
        // Back-to-back STOREs on successive clock cycles
        for (i = 4; i <= 7; i = i + 1) begin
            @(negedge clk);
            write_enable = 1;
            address = i[3:0];
            write_data = 8'h30 + i[7:0];
            @(posedge clk);
        end
        @(negedge clk);
        write_enable = 0;

        // Back-to-back rapid LOADs
        for (i = 4; i <= 7; i = i + 1) begin
            address = i[3:0];
            #2;
            check(read_data === (8'h30 + i[7:0]), "Consecutive LOAD verification failed");
        end

        // Same-cycle read during write: read old data before edge, new data after edge
        @(negedge clk);
        address = 4'h4; // currently holds 8'h34
        write_enable = 1;
        write_data = 8'h99;
        #1;
        check(read_data === 8'h34, "Read-during-write: must read old data before clock edge");
        @(posedge clk);
        #1;
        check(read_data === 8'h99, "Read-during-write: must read new data immediately after clock edge");
        write_enable = 0;

        $display("PASS data_memory: Initialization, read suppression, async read, sync write, boundaries, consecutive ops verified");
        $finish;
    end
endmodule
