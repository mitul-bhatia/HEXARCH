`timescale 1ns/1ps
// Asynchronous read, rising-edge write. Reset does not erase memory.
module data_memory #(
    parameter DATA_FILE = "programs/data.hex"
) (
    input wire clk, read_enable, write_enable,
    input wire [3:0] address,
    input wire [7:0] write_data,
    output wire [7:0] read_data
);
    reg [7:0] words [0:15];
    initial $readmemh(DATA_FILE, words);
    assign read_data = read_enable ? words[address] : 8'h00;
    always @(posedge clk)
        if (write_enable) words[address] <= write_data;
endmodule
