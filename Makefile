IVERILOG ?= iverilog
VVP ?= vvp
PYTHON ?= python3
CHROME ?= /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
RTL := $(wildcard rtl/*.v)
.DEFAULT_GOAL := demo

# Simulation output is written to build/ first. It is copied into results/
# only after the run passes, so a failing run never overwrites the evidence.
.PHONY: demo test stress check figures report guide clean

build/memory_compare.vvp: $(RTL) tb/tb_memory_compare.v
	mkdir -p build
	$(IVERILOG) -g2012 -Wall -s tb_memory_compare -o $@ $(RTL) tb/tb_memory_compare.v

build/random_stress.vvp: $(RTL) tb/tb_random_stress.v
	mkdir -p build
	$(IVERILOG) -g2012 -Wall -s tb_random_stress -o $@ $(RTL) tb/tb_random_stress.v

demo: build/memory_compare.vvp
	mkdir -p build results
	$(VVP) build/memory_compare.vvp +DEMO_ONLY | tee build/demo_output.txt
	@$(PYTHON) -c 'from pathlib import Path; assert "DEMO PASSED" in Path("build/demo_output.txt").read_text(), "Demo failed; inspect build/demo_output.txt"'
	cp build/demo_output.txt build/demo_trace.csv build/demo_summary.csv results/
	$(PYTHON) scripts/normalize_vcd.py build/demo.vcd results/demo.vcd

test: build/memory_compare.vvp
	mkdir -p build results
	$(VVP) build/memory_compare.vvp | tee build/test_output.txt
	@$(PYTHON) -c 'from pathlib import Path; assert "ALL TESTS PASSED" in Path("build/test_output.txt").read_text(), "Simulation failed; inspect build/test_output.txt"'
	cp build/test_output.txt build/summary.csv results/
	$(PYTHON) scripts/normalize_vcd.py build/memory_compare.vcd results/memory_compare.vcd

stress: build/random_stress.vvp
	mkdir -p build results
	$(VVP) build/random_stress.vvp | tee build/stress_output.txt
	@$(PYTHON) -c 'from pathlib import Path; assert "STRESS PASSED" in Path("build/stress_output.txt").read_text(), "Stress test failed; inspect build/stress_output.txt"'
	cp build/stress_output.txt results/

check: demo test stress

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
	cp build/report/phase1_report.pdf output/pdf/HEXARCH_Phase_I_Report.pdf

# The study guide PDF is printed from its HTML source with headless Chrome.
guide:
	mkdir -p output/pdf
	"$(CHROME)" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf=output/pdf/HEXARCH_Study_Guide.pdf "file://$(CURDIR)/docs/study_guide/study_guide.html"

clean:
	rm -rf build
