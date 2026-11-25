"""Synthetic OpenEval-style BBQ tables built from the real BBQ items, for testing only."""
from __future__ import annotations
import json, os, sys
import numpy as np, pandas as pd, pyarrow as pa, pyarrow.parquet as pq
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from saferank.bbq import load_bbq


def make(bbq_dir: str, out: str, layout: str = "nested", n_models: int = 12, n_items: int = 4000, seed: int = 0) -> None:
    rng = np.random.default_rng(seed)
    bbq = load_bbq(bbq_dir).sample(n_items, random_state=seed).reset_index(drop=True)
    os.makedirs(os.path.join(out, "bbq.item"), exist_ok=True)
    os.makedirs(os.path.join(out, "bbq.response"), exist_ok=True)
    items = []
    for i, r in bbq.iterrows():
        prompt = (f"Context: {r.context}\nQuestion: {r.question}\nA. {r.ans0}\nB. {r.ans1}\nC. {r.ans2}\nAnswer:")
        items.append(dict(item_id=f"bbq_20260101T000000Z_{i}",
                          item_content=dict(input=[prompt], references=["ABC"[r.label]])))
    resp = []
    for m in range(n_models):
        cover = 1.0 if m < 8 else 0.5              # 8 full-coverage models, 4 half-coverage
        skill = 0.3 + 0.5 * m / n_models
        for i, r in bbq.iterrows():
            if rng.random() > cover:
                continue
            pick = r.label if rng.random() < skill else int(rng.integers(0, 3))
            if m == 11:
                pick = 0                           # always option A: position-bias model
            correct = float(pick == r.label)
            resp.append(dict(
                response_id=f"bbq_20260101T000000Z_{i}_{m}",
                model=dict(name=f"org/model-{m}" + ("-gguf" if m == 10 else ""), size="7B",
                           model_adaptation=dict(system_instruction="", generation_parameters=json.dumps(dict(temperature=0.0, max_tokens=16)))),
                item_adaptation=dict(request_input=[f"Context: {r.context}\nQuestion: {r.question}\nA. {r.ans0}\nB. {r.ans1}\nC. {r.ans2}\nAnswer:"]),
                response_content=["ABC"[pick]],
                scores=[dict(metric=dict(name="exact_match", models=[]), value=correct)]))
    if layout == "nested":
        pq.write_table(pa.Table.from_pylist(items), os.path.join(out, "bbq.item", "train-0.parquet"))
        pq.write_table(pa.Table.from_pylist(resp), os.path.join(out, "bbq.response", "train-0.parquet"))
    else:   # flattened dotted columns
        def flat(d, p=""):
            o = {}
            for k, v in d.items():
                kk = f"{p}{k}"
                if isinstance(v, dict):
                    o.update(flat(v, kk + "."))
                else:
                    o[kk] = v
            return o
        pq.write_table(pa.Table.from_pylist([flat(x) for x in items]), os.path.join(out, "bbq.item", "train-0.parquet"))
        pq.write_table(pa.Table.from_pylist([flat(x) for x in resp]), os.path.join(out, "bbq.response", "train-0.parquet"))


if __name__ == "__main__":
    make(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "nested")
