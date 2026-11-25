#!/usr/bin/env python3
"""Phase 1 data audit for OpenEval BBQ. Answers the eight audit questions and computes Gate G1.

Usage:
  python scripts/02_audit.py --data-dir data/frozen/openeval --bbq-dir data/external/BBQ \
      --out reports/audit [--k 8] [--seed 1] [--metric NAME] [--min-coverage 0.8]

Memory: streams the 6.5M-row response table in batches and keeps compact arrays.
Plan on 8 GB free RAM. Nothing is downloaded here.
"""
from __future__ import annotations
import argparse, json, os, re, sys, zlib
from array import array
from collections import Counter, defaultdict
import numpy as np
import pandas as pd
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from saferank.openeval_io import find_files, schema_of, iter_rows, col, flatten_text
from saferank.bbq import load_bbq, analysis_item_set
from saferank.join import build_item_map

QUANT = re.compile(r"[-_.](gguf|awq|gptq|int4|int8|4bit|8bit|bf16|fp16|fp8|q[2-8]_[a-z0-9_]+)\b", re.I)
LETTER = re.compile(r"^[\s\*\(\[]*(?:(?:final\s+)?answer\s*(?:is)?\s*[:\-]?\s*)?[\(\[\*]*([ABC012])(?:[\)\]\.\:\*,\s]|$)")


def crc(s: str) -> int:
    return zlib.crc32(s.encode("utf-8", "ignore"))


def md_table(df: pd.DataFrame, max_rows: int = 40) -> str:
    d = df.head(max_rows)
    cols = list(d.columns)
    lines = ["| " + " | ".join(map(str, cols)) + " |", "| " + " | ".join("---" for _ in cols) + " |"]
    for _, r in d.iterrows():
        lines.append("| " + " | ".join(str(r[c]) for c in cols) + " |")
    if len(df) > max_rows:
        lines.append(f"\n({len(df) - max_rows} more rows in the CSV)")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", required=True)
    ap.add_argument("--bbq-dir", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--k", type=int, default=8)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--metric", default=None, help="score metric name that holds BBQ correctness")
    ap.add_argument("--min-coverage", type=float, default=0.8)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    item_files = find_files(a.data_dir, "item")
    resp_files = find_files(a.data_dir, "response")
    if not item_files or not resp_files:
        sys.exit(f"No bbq item/response parquet under {a.data_dir}. Run scripts/00_freeze_openeval.py first.")
    schemas = {"item": [schema_of(f) for f in item_files], "response": [schema_of(f) for f in resp_files]}
    json.dump(schemas, open(os.path.join(a.out, "schema.json"), "w"), indent=1)
    print("item files:", len(item_files), "response files:", len(resp_files))

    # ---- items and join to original BBQ ---------------------------------
    bbq = load_bbq(a.bbq_dir)
    aset = analysis_item_set(bbq, k=a.k, seed=a.seed)
    aset_keys = set(aset["key"])
    items = list(iter_rows(item_files, ["item_id", "item_content"]))
    item_ids = {col(r, "item_id") for r in items}
    imap = build_item_map(items, bbq)
    del items
    imap.to_csv(os.path.join(a.out, "item_map.csv"), index=False)
    join = imap["method"].value_counts().to_dict()
    n_items = len(imap)
    matched = imap["bbq_key"].notna().sum()
    print("items", n_items, "joined", matched, join)
    id2key = dict(zip(imap["item_id"], imap["bbq_key"]))
    bbq_strs = {r.key: sorted([r.context, r.question, r.ans0, r.ans1, r.ans2], key=len, reverse=True)
                for r in bbq.itertuples()}
    analysis_item_ids = {i for i, k in id2key.items() if k in aset_keys}

    # ---- stream responses -------------------------------------------------
    wanted = ["response_id", "model.name", "scores", "response_content",
              "item_adaptation.request_input", "model.model_adaptation.system_instruction",
              "model.model_adaptation.generation_parameters"]
    models, mcode = [], {}
    iidx, itm = {}, []
    A = dict(item=array("i"), model=array("i"), val=array("d"), mcode=array("i"),
             fmt=array("I"), sysh=array("I"), genh=array("I"), letter=array("b"))
    metric_names, metric_vals = {}, defaultdict(set)
    gen_params = {}
    unresolved = 0
    n_resp = 0

    def resolve(rid: str):
        cur = rid
        for _ in range(4):
            if cur in item_ids:
                return cur
            if "_" not in cur:
                break
            cur = cur.rsplit("_", 1)[0]
        return None

    for rec in iter_rows(resp_files, wanted):
        n_resp += 1
        rid = col(rec, "response_id")
        iid = resolve(rid)
        if iid is None:
            unresolved += 1
            continue
        mname = col(rec, "model.name") or "UNKNOWN"
        mi = mcode.setdefault(mname, len(mcode))
        ii = iidx.setdefault(iid, len(iidx))
        # score: first metric whose value is present (all metrics kept for the metric table)
        scs = col(rec, "scores") or []
        chosen_c, chosen_v = -1, np.nan
        for s in scs:
            s = s if isinstance(s, dict) else {}
            nm = col(s, "metric.name") or "UNKNOWN"
            v = s.get("value")
            c = metric_names.setdefault(nm, len(metric_names))
            if v is not None:
                if len(metric_vals[nm]) < 20:
                    metric_vals[nm].add(float(v))
                if a.metric is None or nm == a.metric:
                    if chosen_c < 0:
                        chosen_c, chosen_v = c, float(v)
        txt = flatten_text(col(rec, "response_content")).strip()[:120]
        m = LETTER.match(txt) if txt else None
        letter = (-1 if not txt else (3 if not m else "ABC012".index(m.group(1)) % 3))
        prompt = flatten_text(col(rec, "item_adaptation.request_input"))
        strs = bbq_strs.get(id2key.get(iid))
        if strs:                                    # strip item content; what is left is the prompt format
            sk = prompt
            for t in strs:
                sk = sk.replace(t, "\u00a7")
            fmt = crc(re.sub(r"\s+", " ", sk).strip())
        else:
            fmt = crc(prompt[:40] + "||" + prompt[-25:])
        sysh = crc(flatten_text(col(rec, "model.model_adaptation.system_instruction")))
        gp = col(rec, "model.model_adaptation.generation_parameters")
        gps = json.dumps(gp, sort_keys=True) if gp is not None else ""
        gh = crc(gps)
        gen_params.setdefault(gh, gps)
        A["item"].append(ii); A["model"].append(mi); A["val"].append(chosen_v); A["mcode"].append(chosen_c)
        A["fmt"].append(fmt); A["sysh"].append(sysh); A["genh"].append(gh); A["letter"].append(letter)
    print("responses read", n_resp, "unresolved item ids", unresolved)

    inv_item = {v: k for k, v in iidx.items()}
    inv_model = {v: k for k, v in mcode.items()}
    inv_metric = {v: k for k, v in metric_names.items()}
    R = pd.DataFrame({k: np.asarray(v) for k, v in A.items()})
    R["item_id"] = R["item"].map(inv_item)
    R["model"] = R["model"].map(inv_model)
    R["metric"] = R["mcode"].map(inv_metric)

    # ---- Q4 storage: metrics --------------------------------------------
    mt = pd.DataFrame([{"metric": k, "distinct_values_seen(up to 20)": sorted(v)[:8]} for k, v in metric_vals.items()])
    mt.to_csv(os.path.join(a.out, "audit_metrics.csv"), index=False)
    binary = [k for k, v in metric_vals.items() if v and v <= {0.0, 1.0}]
    primary = a.metric or (max(binary, key=lambda k: (R["metric"] == k).sum()) if binary else None)
    R_p = R[R["metric"] == primary] if primary else R.iloc[0:0]

    # ---- Q1 models -------------------------------------------------------
    mdl = R.groupby("model").agg(n_responses=("item", "size"), n_items=("item", "nunique")).reset_index()
    mdl["stem"] = mdl["model"].str.lower().str.replace(QUANT, "", regex=True)
    dup = mdl.groupby("stem")["model"].apply(list)
    dup = dup[dup.map(len) > 1]
    # ---- Q2 repeats ------------------------------------------------------
    rep = R.groupby(["model", "item"]).size()
    rep_dist = rep.value_counts().sort_index()
    # ---- Q3 coverage on the analysis set --------------------------------
    R["in_analysis"] = R["item_id"].isin(analysis_item_ids)
    n_an = len(analysis_item_ids)
    cov = (R[R["in_analysis"]].groupby("model")["item"].nunique() / max(n_an, 1)).rename("coverage_analysis_set")
    mdl = mdl.merge(cov, on="model", how="left").fillna({"coverage_analysis_set": 0.0})
    mdl["coverage_all_items"] = mdl["n_items"] / max(n_items, 1)
    # connectivity
    sub = R[R["in_analysis"]][["model", "item"]].drop_duplicates()
    mi_ = {m: i for i, m in enumerate(sorted(sub["model"].unique()))}
    ii_ = {m: i for i, m in enumerate(sorted(sub["item"].unique()))}
    if len(sub):
        g = coo_matrix((np.ones(len(sub)), (sub["model"].map(mi_), sub["item"].map(ii_) + len(mi_))),
                       shape=(len(mi_) + len(ii_),) * 2)
        ncomp, lab = connected_components(g, directed=False)
        comp_sizes = sorted(np.bincount(lab).tolist(), reverse=True)[:5]
    else:
        ncomp, comp_sizes = 0, []
    # ---- Q4 parse proxy and position bias -------------------------------
    L = R.groupby("model")["letter"].value_counts(normalize=True).unstack(fill_value=0.0)
    for c, nm in [(0, "pick_A"), (1, "pick_B"), (2, "pick_C"), (3, "other_text"), (-1, "empty")]:
        mdl[nm] = mdl["model"].map(L[c] if c in L.columns else pd.Series(dtype=float)).fillna(0.0).round(3).values
    mdl["max_position_share"] = mdl[["pick_A", "pick_B", "pick_C"]].max(axis=1)
    mdl["position_flag_gt50"] = mdl["max_position_share"] > 0.5
    # ---- Q6 prompt format / settings ------------------------------------
    fm = R.groupby("model").agg(n_formats=("fmt", "nunique"), n_system=("sysh", "nunique"), n_gen=("genh", "nunique"))
    mdl = mdl.merge(fm, on="model", how="left")
    gen_tbl = pd.DataFrame([{"gen_hash": k, "params": v} for k, v in gen_params.items()])
    gen_tbl.to_csv(os.path.join(a.out, "audit_generation_params.csv"), index=False)
    # primary-metric accuracy per model (sanity only)
    acc = R_p.groupby("model")["val"].mean().rename("mean_primary_metric")
    mdl = mdl.merge(acc, on="model", how="left")
    mdl = mdl.sort_values("coverage_analysis_set", ascending=False)
    mdl.to_csv(os.path.join(a.out, "audit_models.csv"), index=False)

    # ---- Gate G1 ---------------------------------------------------------
    n_ge = int((mdl["coverage_analysis_set"] >= a.min_coverage).sum())
    plan = "full" if n_ge >= 60 else ("reduced" if n_ge >= 30 else "stop")
    low_join = matched / max(n_items, 1) < 0.95
    summary = dict(
        items_in_openeval_bbq=int(n_items), items_joined_to_original_bbq=int(matched), join_methods=join,
        analysis_items_k=a.k, analysis_items_total_in_original=int(len(aset)), analysis_items_present_in_openeval=int(n_an),
        responses_read=int(n_resp), responses_unresolved_item_id=int(unresolved),
        distinct_models=int(len(mdl)), duplicate_model_groups=dup.to_dict(),
        responses_per_model_item_distribution={int(k): int(v) for k, v in rep_dist.items()},
        primary_metric=primary, binary_metrics=binary,
        components_in_bipartite_graph=int(ncomp), largest_component_sizes=comp_sizes,
        models_with_coverage_ge=dict(ge50=int((mdl.coverage_analysis_set >= .5).sum()), ge80=n_ge,
                                     ge95=int((mdl.coverage_analysis_set >= .95).sum())),
        min_coverage_used=a.min_coverage, g1_plan=plan,
        warnings=(["Item join rate below 95%: G1 is unreliable until the join is fixed."] if low_join else []),
    )
    json.dump(summary, open(os.path.join(a.out, "audit_summary.json"), "w"), indent=1, default=str)

    # ---- Markdown report -------------------------------------------------
    rpt = [f"# Phase 1 audit report (auto-generated)\n",
           f"Analysis item set: k = {a.k} items per template, seed {a.seed}; {len(aset)} items in the original BBQ, {n_an} present in OpenEval.\n",
           "## Gate G1\n", f"Models answering at least {int(a.min_coverage*100)}% of the analysis items: **{n_ge}**. Plan: **{plan.upper()}**.\n",
           "## Q1 Models\n", f"Distinct models: {len(mdl)}. Duplicate-name groups: {len(dup)}.\n",
           md_table(pd.DataFrame({'stem': dup.index, 'names': dup.values})) if len(dup) else "No duplicate-name groups found.\n",
           "## Q2 Responses per model-item pair\n", md_table(rep_dist.rename_axis("responses_per_cell").reset_index(name="cells")),
           "## Q3 Coverage and connectivity\n", f"Connected components in the model-by-item graph (analysis set): {ncomp}. Largest sizes: {comp_sizes}.\n",
           "## Q4 Stored fields, metrics and parse proxy\n", md_table(mt),
           "\nParse proxy columns in audit_models.csv: pick_A/B/C, other_text, empty. A high other_text share means the stored text is not a bare letter; re-parse from raw text.\n",
           "## Q5 Item fields and join\n", f"Join methods: {join}. Join rate {matched/max(n_items,1):.3f}.\n",
           "## Q6 Prompt format and settings\n", "Per-model counts of distinct prompt-format hashes (n_formats), system prompts (n_system) and generation settings (n_gen) are in audit_models.csv. More than 1 means the format changed within a model.\n",
           md_table(gen_tbl),
           "\n## Models (top rows by coverage)\n", md_table(mdl[["model", "n_items", "coverage_analysis_set", "n_formats", "n_system", "n_gen", "max_position_share", "mean_primary_metric"]], 60)]
    open(os.path.join(a.out, "audit_report.md"), "w").write("\n".join(rpt))
    print(json.dumps({k: summary[k] for k in ["distinct_models", "models_with_coverage_ge", "g1_plan", "warnings"]}, indent=1))


if __name__ == "__main__":
    main()
