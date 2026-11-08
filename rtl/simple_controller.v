`timescale 1ns/1ps
// Current instruction executes while the next instruction is fetched.
// One instruction register is enough to demonstrate this overlap.
// Shared mode inserts a fetch bubble whenever LOAD/STORE owns the bus.
module simple_controller #(
    parameter SHARED_BUS = 0
) (
    input wire clk, reset,
    input wire [7:0] instruction_data, data_read_data,
    output wire [3:0] pc, data_address,
    output wire fetch_enable, data_read_enable, data_write_enable,
    output reg [7:0] accumulator, instruction_register,
    output reg execute_valid, halted, fault
);
    wire load, store, halt, illegal;
    wire running = !reset && !halted;
    wire stop_now = execute_valid && (halt || illegal);
    wire data_access = data_read_enable || data_write_enable;

    read_write_control decode (
        .instruction(instruction_register), .load(load), .store(store),
        .halt(halt), .illegal(illegal)
    );
    assign data_address = instruction_register[3:0];
    assign data_read_enable = running && execute_valid && load;
    assign data_write_enable = running && execute_valid && store;
    // This is the comparison's key rule: a shared port must take turns.
    assign fetch_enable = running && !stop_now && !(SHARED_BUS && data_access);

    program_counter counter (.clk(clk), .reset(reset),
        .enable(fetch_enable), .address(pc));

    always @(posedge clk) begin
        if (reset) begin
            accumulator <= 8'h00;
            instruction_register <= 8'h00;
            execute_valid <= 1'b0;
            halted <= 1'b0;
            fault <= 1'b0;
        end else if (!halted) begin
            if (execute_valid) begin
                if (load) accumulator <= data_read_data;
                if (halt || illegal) halted <= 1'b1;
                if (illegal) fault <= 1'b1;
                // STORE is performed by memory on this same clock edge.
            end
            // No fetch means the next cycle has no instruction to execute.
            execute_valid <= fetch_enable;
            if (fetch_enable) instruction_register <= instruction_data;
        end
    end
endmodule
