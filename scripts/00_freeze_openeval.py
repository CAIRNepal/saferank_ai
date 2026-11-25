#!/usr/bin/env python3
"""Download the OpenEval BBQ tables at a pinned revision and write a hash manifest.

Run on a machine with access to huggingface.co.
  python scripts/00_freeze_openeval.py --list-only            # show what exists
  python scripts/00_freeze_openeval.py                        # bbq item + response + data summary
  python scripts/00_freeze_openeval.py --extras mmlu_pro gpqa gsm8k ifeval medqa harmbench
  python scripts/00_freeze_openeval.py --revision <sha>        # re-download a recorded revision
The commit sha goes into data/frozen/openeval/MANIFEST.json. Cite it in the paper.
"""
from __future__ import annotations
import argparse, datetime as dt, json, os, sys
from huggingface_hub import HfApi, hf_hub_download

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from saferank.openeval_io import sha256_file

REPO = "Open-Eval-Commons/OpenEval"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="data/frozen/openeval")
    ap.add_argument("--revision", default=None)
    ap.add_argument("--extras", nargs="*", default=[], help="benchmark names whose response table is also needed (model names only are used)")
    ap.add_argument("--list-only", action="store_true")
    a = ap.parse_args()

    api = HfApi()
    rev = a.revision or api.dataset_info(REPO).sha
    files = api.list_repo_files(REPO, repo_type="dataset", revision=rev)
    print("revision:", rev, "| files in repo:", len(files))

    def want(p: str) -> bool:
        low = p.lower()
        if "data_summary" in low and low.endswith(".json"):
            return True
        if low.endswith(".parquet"):
            if "bbq" in low:
                return True
            return any(b.lower() in low and "response" in low for b in a.extras)
        return False

    sel = [p for p in files if want(p)]
    if a.list_only or not sel:
        print("\n".join(files[:200]))
        print("\nselected:", *sel, sep="\n  ")
        if not sel:
            sys.exit("Nothing matched. Inspect the listing above and adjust want() in this script.")
        return

    os.makedirs(a.out, exist_ok=True)
    manifest = {"repo": REPO, "revision": rev, "downloaded_utc": dt.datetime.utcnow().isoformat() + "Z",
                "licence": "cc-by-nc-4.0", "files": []}
    for p in sel:
        local = hf_hub_download(REPO, p, repo_type="dataset", revision=rev, local_dir=a.out)
        manifest["files"].append({"path": p, "bytes": os.path.getsize(local), "sha256": sha256_file(local)})
        print("ok", p)
    json.dump(manifest, open(os.path.join(a.out, "MANIFEST.json"), "w"), indent=1)
    print("Wrote MANIFEST.json. Commit it; never commit the parquet files.")


if __name__ == "__main__":
    main()
