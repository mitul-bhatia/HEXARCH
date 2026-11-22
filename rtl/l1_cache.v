`timescale 1ns/1ps
// Phase II: a tiny level-1 cache. 2 lines x 4 bytes, direct-mapped.
// Address (4 bits) = tag[3] | index[2] | byte-in-line[1:0].
// Used twice: once as the instruction cache, once as the data cache.
module l1_cache (
    input wire clk, reset,
    input wire [3:0] address,
    output wire hit,
    output wire [7:0] read_data,
    input wire fill_enable,           // copy a 4-byte block from the lower memory
    input wire [31:0] fill_data,
    input wire write_enable,          // STORE: update the byte if it is cached
    input wire [7:0] write_data
);
    reg valid [0:1];
    reg tag [0:1];
    reg [31:0] line [0:1];
    wire index = address[2];
    assign hit = valid[index] && (tag[index] == address[3]);
    assign read_data = line[index] >> (8 * address[1:0]);

    always @(posedge clk) begin
        if (reset) begin
            valid[0] <= 1'b0; valid[1] <= 1'b0;
        end else if (fill_enable) begin
            valid[index] <= 1'b1;
            tag[index] <= address[3];
            line[index] <= fill_data;
        end else if (write_enable && hit) begin
            case (address[1:0])
                2'd0: line[index][7:0]   <= write_data;
                2'd1: line[index][15:8]  <= write_data;
                2'd2: line[index][23:16] <= write_data;
                2'd3: line[index][31:24] <= write_data;
            endcase
        end
    end
endmodule
