`timescale 1ns/1ps
module instruction_memory #(
    parameter PROGRAM_FILE = "programs/demo.hex"
) (
    input wire read_enable,
    input wire [3:0] address,
    output wire [7:0] read_data
);
    reg [7:0] words [0:15];
    initial $readmemh(PROGRAM_FILE, words);
    assign read_data = read_enable ? words[address] : 8'h00;
endmodule
