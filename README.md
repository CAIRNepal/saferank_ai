# SafeRank Path B

IRT calibration of BBQ item-level responses from OpenEval. Question: what does BBQ measure?
Plan: see the phased work plan. This repository holds Phase 1 (setup and data audit).

## Quick start (machine with access to huggingface.co, 8 GB free RAM)

```bash
make setup        # install Python packages
make bbq          # clone original BBQ at the pinned commit (CC-BY-4.0)
make freeze       # download OpenEval BBQ tables at a pinned revision, write MANIFEST.json with SHA-256
make templates    # reports/bbq_templates.md: 343 templates, item-set size J for k = 4, 8, 16, 32
make audit        # reports/audit/*: the eight audit questions and Gate G1
make test         # synthetic end-to-end test (needs make bbq first)
```

Optional, for the capability check and safety overlap:

```bash
python scripts/00_freeze_openeval.py --extras mmlu_pro gpqa gsm8k ifeval medqa harmbench advbench do_not_answer sorry_bench or_bench
make overlap
```

## Layout

| Path | Content |
| --- | --- |
| scripts/00_freeze_openeval.py | Download at a pinned revision, hash files |
| scripts/01_fetch_bbq_original.py | Clone original BBQ at pinned commit |
| scripts/02_audit.py | Audit and Gate G1 |
| scripts/03_model_overlap.py | Model overlap with capability and safety benchmarks |
| scripts/04_template_report.py | BBQ template structure and item-set size |
| src/saferank/ | Readers (nested or flat parquet), BBQ loader, item join |
| tests/ | Synthetic end-to-end tests |
| plan/ | Search log, reading notes, decisions |
| meta/ | model_meta template |
| docs/ | Draft emails |
| reports/ | Audit outputs (commit the small ones) |

## Rules

- Never commit raw data. Commit MANIFEST.json, scripts and derived tables.
- Pin everything: OpenEval commit hash, BBQ commit hash, package versions.
- Cite OpenEval (Jiang et al., 2026) and BBQ (Parrish et al., 2022). See DATA_LICENSES.md.

## Status

Scripts were tested on synthetic tables built from the real BBQ items, in both nested and flat parquet layouts.
They have not been run on the real OpenEval tables yet: the schema was read from the public OpenEval repository,
not from the parquet files. The first real run may need a small fix; run `scripts/02_audit.py` and read its
schema.json before trusting any number.
