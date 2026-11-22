`timescale 1ns/1ps
// Phase II: the shared lower-level memory (32 bytes, ONE port).
// Instructions live at 0..15, data at 16..31 (same map as the shared memory).
// A cache miss reads a whole 4-byte block in one cycle; a STORE writes one byte.
module lower_memory #(
    parameter PROGRAM_FILE = "programs/demo.hex",
    parameter DATA_FILE = "programs/data.hex"
) (
    input wire clk, write_enable,
    input wire [4:0] block_address,   // which 4-byte block to read (address[4:2])
    input wire [4:0] write_address,
    input wire [7:0] write_data,
    output wire [31:0] block_data
);
    reg [7:0] words [0:31];
    initial begin
        $readmemh(PROGRAM_FILE, words, 0, 15);
        $readmemh(DATA_FILE, words, 16, 31);
    end
    wire [4:0] base = {block_address[4:2], 2'b00};
    assign block_data = {words[base+3], words[base+2], words[base+1], words[base]};
    always @(posedge clk)
        if (write_enable) words[write_address] <= write_data;
endmodule
