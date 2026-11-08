`timescale 1ns/1ps
// Exactly one address/read/write port for both instructions and data.
module shared_memory #(
    parameter PROGRAM_FILE = "programs/demo.hex",
    parameter DATA_FILE = "programs/data.hex"
) (
    input wire clk, read_enable, write_enable,
    input wire [4:0] address,
    input wire [7:0] write_data,
    output wire [7:0] read_data
);
    reg [7:0] words [0:31];
    initial begin
        $readmemh(PROGRAM_FILE, words, 0, 15);
        $readmemh(DATA_FILE, words, 16, 31);
    end
    assign read_data = read_enable ? words[address] : 8'h00;
    always @(posedge clk)
        if (write_enable) words[address] <= write_data;
endmodule
