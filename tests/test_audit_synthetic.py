"""End-to-end test of the audit on synthetic OpenEval-style tables (both layouts)."""
import json, os, subprocess, sys
import pytest

ROOT = os.path.dirname(os.path.dirname(__file__))
BBQ = os.environ.get("BBQ_DIR", os.path.join(ROOT, "data", "external", "BBQ"))


@pytest.mark.skipif(not os.path.isdir(BBQ), reason="original BBQ not fetched (scripts/01_fetch_bbq_original.py)")
@pytest.mark.parametrize("layout", ["nested", "flat"])
def test_audit_runs_and_counts(tmp_path, layout):
    sys.path.insert(0, os.path.join(ROOT, "tests"))
    from make_synthetic import make
    data, out = str(tmp_path / "d"), str(tmp_path / "o")
    make(BBQ, data, layout=layout, n_models=12, n_items=1500)
    subprocess.check_call([sys.executable, os.path.join(ROOT, "scripts", "02_audit.py"),
                           "--data-dir", data, "--bbq-dir", BBQ, "--out", out, "--k", "8"])
    s = json.load(open(os.path.join(out, "audit_summary.json")))
    assert s["distinct_models"] == 12
    assert s["items_joined_to_original_bbq"] == s["items_in_openeval_bbq"] == 1500
    assert s["responses_per_model_item_distribution"] == {"1": s["responses_read"]}
    assert s["primary_metric"] == "exact_match"
    assert s["components_in_bipartite_graph"] == 1
    import pandas as pd
    m = pd.read_csv(os.path.join(out, "audit_models.csv"))
    assert m.loc[m.model == "org/model-11", "position_flag_gt50"].item()      # always-A model is flagged
    assert not m.loc[m.model == "org/model-0", "position_flag_gt50"].item()
    assert (m["n_formats"] == 1).all()                                        # one prompt format per model
