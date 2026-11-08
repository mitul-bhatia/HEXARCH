`timescale 1ns/1ps
// Same controller and 32-byte total capacity in both configurations.
module memory_system #(
    parameter SHARED_BUS = 0,
    parameter PROGRAM_FILE = "programs/demo.hex",
    parameter DATA_FILE = "programs/data.hex"
) (
    input wire clk, reset,
    output wire [3:0] pc, data_address,
    output wire [7:0] accumulator, instruction_register,
    output wire execute_valid, halted, fault,
    output wire fetch_enable, data_read_enable, data_write_enable
);
    wire [7:0] instruction_data, data_read_data;
    simple_controller #(.SHARED_BUS(SHARED_BUS)) controller (
        .clk(clk), .reset(reset), .instruction_data(instruction_data),
        .data_read_data(data_read_data), .pc(pc), .data_address(data_address),
        .fetch_enable(fetch_enable), .data_read_enable(data_read_enable),
        .data_write_enable(data_write_enable), .accumulator(accumulator),
        .instruction_register(instruction_register), .execute_valid(execute_valid),
        .halted(halted), .fault(fault)
    );
    generate
        if (SHARED_BUS == 0) begin: harvard_path
            instruction_memory #(.PROGRAM_FILE(PROGRAM_FILE)) imem (
                .read_enable(fetch_enable), .address(pc), .read_data(instruction_data));
            data_memory #(.DATA_FILE(DATA_FILE)) dmem (
                .clk(clk), .read_enable(data_read_enable), .write_enable(data_write_enable),
                .address(data_address), .write_data(accumulator), .read_data(data_read_data));
        end else begin: shared_path
            wire [4:0] physical_address;
            wire [7:0] memory_read_data;
            address_decoder addresses (
                .data_select(data_read_enable || data_write_enable),
                .instruction_address(pc), .data_address(data_address),
                .physical_address(physical_address));
            shared_memory #(.PROGRAM_FILE(PROGRAM_FILE), .DATA_FILE(DATA_FILE)) mem (
                .clk(clk), .read_enable(fetch_enable || data_read_enable),
                .write_enable(data_write_enable), .address(physical_address),
                .write_data(accumulator), .read_data(memory_read_data));
            assign instruction_data = memory_read_data;
            assign data_read_data = memory_read_data;
        end
    endgenerate
endmodule
