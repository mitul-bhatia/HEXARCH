`timescale 1ns/1ps
// Phase II: Harvard L1 caches on top of ONE shared lower-level memory.
//
//   controller --> I-cache --\
//              --> D-cache ---+--> lower_memory (single port)
//
// Rules (this is the whole design):
//   * A cache hit costs nothing: it behaves exactly like the Phase I Harvard memories.
//   * A miss HOLDS the controller for 1 cycle while the 4-byte block is copied in.
//   * The lower memory has one port. If both caches miss in the same cycle,
//     the data cache is served first, the instruction cache one cycle later.
//   * STORE is write-through: it writes the lower memory (and the D-cache if cached).
//     It never runs in a hold cycle, so it never fights a miss for the port.
module hierarchy_system #(
    parameter PROGRAM_FILE = "programs/demo.hex",
    parameter DATA_FILE = "programs/data.hex"
) (
    input wire clk, reset,
    output wire [3:0] pc, data_address,
    output wire [7:0] accumulator, instruction_register,
    output wire execute_valid, halted, fault,
    output wire fetch_enable, data_read_enable, data_write_enable,
    output wire hold, i_miss, d_miss
);
    wire [7:0] instruction_data, data_read_data;
    wire i_hit, d_hit;
    wire [31:0] block;

    simple_controller #(.SHARED_BUS(0)) controller (
        .clk(clk), .reset(reset), .hold(hold), .instruction_data(instruction_data),
        .data_read_data(data_read_data), .pc(pc), .data_address(data_address),
        .fetch_enable(fetch_enable), .data_read_enable(data_read_enable),
        .data_write_enable(data_write_enable), .accumulator(accumulator),
        .instruction_register(instruction_register), .execute_valid(execute_valid),
        .halted(halted), .fault(fault));

    assign d_miss = data_read_enable && !d_hit;
    assign i_miss = fetch_enable && !i_hit;
    assign hold = d_miss || i_miss;           // wait while a block is fetched

    wire fill_d = d_miss;                     // data side wins the single port
    wire fill_i = i_miss && !d_miss;
    wire [4:0] block_address = fill_d ? {1'b1, data_address} : {1'b0, pc};
    wire store_now = data_write_enable && !hold;

    lower_memory #(.PROGRAM_FILE(PROGRAM_FILE), .DATA_FILE(DATA_FILE)) lower (
        .clk(clk), .write_enable(store_now), .block_address(block_address),
        .write_address({1'b1, data_address}), .write_data(accumulator),
        .block_data(block));

    l1_cache icache (.clk(clk), .reset(reset), .address(pc), .hit(i_hit),
        .read_data(instruction_data), .fill_enable(fill_i), .fill_data(block),
        .write_enable(1'b0), .write_data(8'h00));
    l1_cache dcache (.clk(clk), .reset(reset), .address(data_address), .hit(d_hit),
        .read_data(data_read_data), .fill_enable(fill_d), .fill_data(block),
        .write_enable(store_now), .write_data(accumulator));
endmodule
