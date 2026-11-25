"""Original BBQ data (github.com/nyu-mll/BBQ) and the template structure."""
from __future__ import annotations
import glob, json, os
import numpy as np
import pandas as pd


def load_bbq(bbq_dir: str) -> pd.DataFrame:
    rows = []
    for f in sorted(glob.glob(os.path.join(bbq_dir, "data", "*.jsonl"))):
        with open(f, encoding="utf-8") as fh:
            for line in fh:
                d = json.loads(line)
                md = d.get("additional_metadata", {}) or {}
                rows.append(dict(
                    category=d["category"], example_id=int(d["example_id"]),
                    question_index=str(d["question_index"]),
                    polarity=d["question_polarity"], condition=d["context_condition"],
                    label=int(d["label"]), context=d["context"], question=d["question"],
                    ans0=d["ans0"], ans1=d["ans1"], ans2=d["ans2"],
                    stereotyped_groups="|".join(md.get("stereotyped_groups", []) or []),
                    version=md.get("version"),
                    answer_info=json.dumps(d.get("answer_info", {})),
                ))
    df = pd.DataFrame(rows)
    # example_id repeats across category files: the key is (category, example_id).
    df["key"] = df["category"] + ":" + df["example_id"].astype(str)
    df["template"] = df["category"] + "|" + df["question_index"]
    return df


def analysis_item_set(df: pd.DataFrame, k: int = 8, seed: int = 1) -> pd.DataFrame:
    """Cap items per template at k, split evenly across the two conditions.

    Template = (category, question_index): 343 templates in BBQ. Within a
    template and condition take up to k//2 items, drawn without replacement.
    """
    rng = np.random.default_rng(seed)
    parts = []
    for (_, cond), g in df.groupby(["template", "condition"], sort=True):
        n = min(len(g), k // 2)
        idx = rng.choice(len(g), size=n, replace=False)
        parts.append(g.iloc[np.sort(idx)])
    return pd.concat(parts).sort_values(["category", "example_id"]).reset_index(drop=True)
