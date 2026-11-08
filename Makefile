IVERILOG ?= iverilog
VVP ?= vvp
PYTHON ?= python3
RTL := $(wildcard rtl/*.v)
.DEFAULT_GOAL := demo

.PHONY: demo test figures report clean
build/memory_compare.vvp: $(RTL) tb/tb_memory_compare.v
	mkdir -p build
	$(IVERILOG) -g2012 -Wall -s tb_memory_compare -o $@ $(RTL) tb/tb_memory_compare.v

demo: build/memory_compare.vvp
	mkdir -p build results
	$(VVP) build/memory_compare.vvp +DEMO_ONLY | tee results/demo_output.txt
	@$(PYTHON) -c 'from pathlib import Path; assert "DEMO PASSED" in Path("results/demo_output.txt").read_text(), "Demo failed; inspect results/demo_output.txt"'
	cp build/demo.vcd results/demo.vcd

test: build/memory_compare.vvp
	mkdir -p build results
	$(VVP) build/memory_compare.vvp | tee results/test_output.txt
	@$(PYTHON) -c 'from pathlib import Path; assert "ALL TESTS PASSED" in Path("results/test_output.txt").read_text(), "Simulation failed; inspect results/test_output.txt"'
	cp build/memory_compare.vcd results/memory_compare.vcd

figures:
	$(PYTHON) scripts/make_figures.py
	rsvg-convert -o docs/figures/architecture.png docs/figures/architecture.svg
	rsvg-convert -o docs/figures/waveforms.png docs/figures/waveforms.svg
	rsvg-convert -o docs/figures/architecture_report.png docs/figures/architecture_report.svg
	rsvg-convert -o docs/figures/waveforms_report.png docs/figures/waveforms_report.svg

report:
	mkdir -p build/report output/pdf
	TEXINPUTS=docs/report: pdflatex -interaction=nonstopmode -halt-on-error -output-directory=build/report docs/report/phase1_report.tex
	TEXINPUTS=docs/report: pdflatex -interaction=nonstopmode -halt-on-error -output-directory=build/report docs/report/phase1_report.tex
	cp build/report/phase1_report.pdf output/pdf/HEXARCH_Phase_I_Report_Draft.pdf

clean:
	rm -rf build
