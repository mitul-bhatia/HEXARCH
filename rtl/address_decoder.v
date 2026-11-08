`timescale 1ns/1ps
// Shared memory: instruction offsets map to 0..15, data offsets to 16..31.
module address_decoder (
    input wire data_select,
    input wire [3:0] instruction_address, data_address,
    output wire [4:0] physical_address
);
    assign physical_address = data_select ? {1'b1, data_address}
                                          : {1'b0, instruction_address};
endmodule
