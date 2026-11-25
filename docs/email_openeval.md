To: hjiang66@jh.edu, ziang.xiao@jhu.edu   (contact addresses listed in the OpenEval GitHub README)
Subject: Questions on OpenEval's BBQ tables before an IRT analysis

Dear Han and Ziang,

We are a small team planning a non-commercial analysis of OpenEval's BBQ item-level responses with item response theory (calibration, dimensionality, uncertainty on model scores). We will cite OpenEval (Jiang et al., 2026) and respect CC-BY-NC-4.0. Seven questions, so that we use the data correctly:

1. Prompt format. Is the BBQ prompt (instruction text, option layout, few-shot examples) identical for every model? Where is it stored (item_adaptation.request_input, demonstrations)?
2. Repeats. bbq.response has 6.51M rows for 58.5k items. How many responses are there per model-item pair, and are repeats different prompt variants or repeated runs?
3. Score. Which entry in scores[] holds BBQ correctness? How is the answer parsed from the model output, and how are unparseable outputs scored?
4. Item metadata. Do the BBQ items keep category, context_condition, question_polarity and example_id from the original release? If not, is matching on item text the intended join?
5. Models. How were the BBQ responses collected (provider, date, API or local), and do you hold model metadata (size, release date, base or instruct)?
6. Coverage. Is the model-by-item matrix for BBQ complete? Could you share the data summary file that lists each benchmark's model set and item coverage?
7. Releases. Can we cite a tagged revision or DOI of the dataset? We pin a commit hash in the meantime.

If you are already running IRT on BBQ, please tell us. We would rather coordinate than duplicate.

Thank you,
[Name, affiliation]
