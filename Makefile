# Phase 1 pipeline. Run on a machine that can reach huggingface.co.
PY ?= python3
.PHONY: setup bbq freeze templates audit overlap test all
setup:
	$(PY) -m pip install -r requirements.txt
bbq:
	$(PY) scripts/01_fetch_bbq_original.py data/external/BBQ
freeze:
	$(PY) scripts/00_freeze_openeval.py
templates: bbq
	$(PY) scripts/04_template_report.py data/external/BBQ reports/bbq_templates.md
audit: bbq
	$(PY) scripts/02_audit.py --data-dir data/frozen/openeval --bbq-dir data/external/BBQ --out reports/audit --k 8
overlap:
	$(PY) scripts/03_model_overlap.py --data-dir data/frozen/openeval --out reports/audit
test:
	BBQ_DIR=data/external/BBQ $(PY) -m pytest -q tests
all: bbq freeze templates audit
