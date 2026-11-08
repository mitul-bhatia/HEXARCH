`timescale 1ns/1ps
// The high nibble is the opcode; the low nibble is a data address.
module read_write_control (
    input wire [7:0] instruction,
    output wire load, store, halt, illegal
);
    assign load = instruction[7:4] == 4'h1;
    assign store = instruction[7:4] == 4'h2;
    assign halt = instruction[7:4] == 4'hf;
    assign illegal = !(load || store || halt || instruction[7:4] == 4'h0);
endmodule
