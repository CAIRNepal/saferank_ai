# Corrections to carry into analysis_plan.md (Phase 2)

| # | Plan said | Phase 1 found | Change |
| --- | --- | --- | --- |
| 1 | 9 categories, 18 parcels | The BBQ data has 11 category files: 9 main plus Race_x_SES and Race_x_gender. | 22 parcels. Heterogeneity test df = 10. Report all 11, and the 9 main categories as a sensitivity run. |
| 2 | 343 question families (memo), 325 templates (paper) | (category, question_index) gives 343 groups. Paper text says 325. | Define template = (category, question_index). State the definition. Use 343. |
| 3 | 4,784 prompts at 8 per family (memo) | With k = 8 per template, half per condition: J = 2,744. k = 4: 1,372. k = 16: 5,324. k = 32: 10,412. | Primary k = 8, J = 2,744. Sensitivity k = 4 and 16. |
| 4 | Item key | example_id repeats across category files. | Key = (category, example_id). |
| 5 | No duplicates assumed | 78 rows have identical context, question and answers. | Keep the join flag "ambiguous". Collapse or drop duplicates and log the count. |
| 6 | Unregularised EM is primary | AISI regularises: log-normal prior on discrimination, normal on intercept. | Primary = regularised 2PL. Unregularised EM = sensitivity. Add the split-half discrimination-retention check (top-25 items, 10 splits). |
| 7 | Short form: 50/50 splits x 200 | AISI: 75/25 splits x 20; 100 random draws as baseline. | Primary = AISI protocol, for comparability. Keep 50/50 x 200 as a second analysis. |
| 8 | H4 expected to hold | Stanford report: BBQ irreducible (42 models, 1,000 items). | Keep H4. State in the plan that failure is the expected outcome and a reportable result. |
| 9 | "About 100 models" sample-size rule | Schroeders and Gnambs is a simulation-planning framework. | Justify N by the parameter-recovery simulation. Consider the irtsim R package. |
| 10 | Phase 6 model access | AISI cites Khoriaty (2026): not pinning the OpenRouter provider can invalidate results. | Pin the provider for every extension run. Record it. |
| 11 | Position bias as a check only | LLM-NRM models positional preference at option level. | Add a nominal-response sensitivity analysis if time allows. |
| 12 | Gender_identity and Race_ethnicity | 50 templates each; others 25 (Race_x_SES 26, Race_x_gender 42). | Category-level parcels differ in size. Report items per parcel. |
