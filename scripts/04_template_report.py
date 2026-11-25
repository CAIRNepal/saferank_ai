#!/usr/bin/env python3
"""Template structure of original BBQ and the analysis item-set size J under the cap k."""
import os, sys
import pandas as pd
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from saferank.bbq import load_bbq, analysis_item_set

bbq_dir = sys.argv[1] if len(sys.argv) > 1 else "data/external/BBQ"
out = sys.argv[2] if len(sys.argv) > 2 else "reports/bbq_templates.md"
df = load_bbq(bbq_dir)
t = df.groupby("template").size()
lines = ["# BBQ template structure (original data)\n",
         f"Items: {len(df)}. Categories: {df.category.nunique()}. Templates (category, question_index): {len(t)}.",
         f"Items per template: min {t.min()}, median {t.median():.0f}, max {t.max()}.\n",
         "## Items and templates per category\n", "| Category | Items | Templates |", "| --- | --- | --- |"]
for c, g in df.groupby("category"):
    lines.append(f"| {c} | {len(g)} | {g.template.nunique()} |")
lines += ["", "## Analysis item set size J (up to k items per template, half per condition)\n", "| k | J |", "| --- | --- |"]
for k in (4, 8, 16, 32):
    lines.append(f"| {k} | {len(analysis_item_set(df, k=k, seed=1))} |")
lines += ["", "example_id repeats across category files; the item key is (category, example_id).",
          f"Rows with duplicate (context, question, answers): {len(df) - (df.context + df.question + df.ans0 + df.ans1 + df.ans2).nunique()}."]
open(out, "w").write("\n".join(lines))
print("\n".join(lines))
