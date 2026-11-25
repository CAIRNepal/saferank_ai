#!/usr/bin/env python3
"""Which BBQ models also answered capability and safety benchmarks? Feeds Phase 4 feasibility.

Needs the response tables of the extra benchmarks (see 00_freeze_openeval.py --extras).
Only the model-name column is read.
"""
from __future__ import annotations
import argparse, glob, json, os, re, sys
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from saferank.openeval_io import find_files, iter_rows, col

QUANT = re.compile(r"[-_.](gguf|awq|gptq|int4|int8|4bit|8bit|bf16|fp16|fp8|q[2-8]_[a-z0-9_]+)\b", re.I)
CAP = ["mmlu_pro", "gpqa", "gsm8k", "ifeval", "medqa"]
SAFE = ["harmbench", "advbench", "do_not_answer", "sorry_bench", "or_bench", "health_orsc_bench", "truthfulqa", "xstest", "simplesafetytests"]


def norm_exact(s: str) -> str:
    return QUANT.sub("", s.strip().lower())


def norm_loose(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", norm_exact(s).split("/")[-1])


def models_of(data_dir: str, bench: str) -> set[str]:
    files = find_files(data_dir, "response", bench=bench)
    return {col(r, "model.name") for r in iter_rows(files, ["model.name"]) if col(r, "model.name")} if files else set()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", default="data/frozen/openeval")
    ap.add_argument("--out", default="reports/audit")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    bbq = models_of(a.data_dir, "bbq")
    rows, per_model = [], {}
    for b in CAP + SAFE:
        ms = models_of(a.data_dir, b)
        if not ms:
            rows.append(dict(benchmark=b, kind="capability" if b in CAP else "safety", models=0, overlap_exact=0, overlap_loose=0, status="table not found"))
            continue
        ex = {norm_exact(m) for m in ms} & {norm_exact(m) for m in bbq}
        lo = {norm_loose(m) for m in ms} & {norm_loose(m) for m in bbq}
        rows.append(dict(benchmark=b, kind="capability" if b in CAP else "safety", models=len(ms), overlap_exact=len(ex), overlap_loose=len(lo), status="ok"))
        for m in bbq:
            if norm_loose(m) in lo:
                per_model.setdefault(m, set()).add(b)
    df = pd.DataFrame(rows)
    df.to_csv(os.path.join(a.out, "overlap_by_benchmark.csv"), index=False)
    cap_n = {m: len(set(v) & set(CAP)) for m, v in per_model.items()}
    summary = dict(bbq_models=len(bbq),
                   bbq_models_with_3plus_capability_benchmarks=sum(1 for v in cap_n.values() if v >= 3),
                   rule_for_capability_check="run if >= 25", )
    summary["capability_check_feasible"] = summary["bbq_models_with_3plus_capability_benchmarks"] >= 25
    json.dump(summary, open(os.path.join(a.out, "overlap_summary.json"), "w"), indent=1)
    print(df.to_string(index=False)); print(json.dumps(summary, indent=1))


if __name__ == "__main__":
    main()
