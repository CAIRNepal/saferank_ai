# model_meta.csv

One row per distinct model in the OpenEval BBQ table. Fill after `make audit` (reports/audit/audit_models.csv).

| Column | Rule |
| --- | --- |
| model_name | Exactly as in OpenEval |
| model_name_normalised | Lowercase, quantisation suffix removed (the audit prints this as `stem`) |
| developer, developer_country | From the model card or developer site |
| release_date | ISO date of first public release of that version |
| parameters_billions | Number only; NA for undisclosed proprietary models |
| base_or_instruct | base, instruct, chat, reasoning; NA if unknown |
| open_weight_or_proprietary | open_weight or proprietary |
| family | Model family for the one-per-family sensitivity run (for example llama, qwen) |
| source_url, source_accessed | Where each value came from, and the date |

Never guess. Write NA and a note. A column left as NA is reported as missing in the paper.
Groups used for DIF (Phase 5): open_weight_or_proprietary; release_date before or from 2024-01-01; base_or_instruct.
