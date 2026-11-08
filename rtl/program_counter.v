`timescale 1ns/1ps
// Counts instruction addresses only when a fetch is accepted.
module program_counter (
    input wire clk, reset, enable,
    output reg [3:0] address
);
    always @(posedge clk) begin
        if (reset) address <= 4'd0;
        else if (enable) address <= address + 4'd1;
    end
endmodule
