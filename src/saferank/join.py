"""Join OpenEval BBQ items to the original BBQ rows (category, template, condition, label)."""
from __future__ import annotations
from typing import Any, Iterable
import re
import ahocorasick
import pandas as pd
from .openeval_io import col, flatten_text, norm, _maybe_json


def _find_key_dict(x: Any) -> dict | None:
    """Return a dict holding both example_id and category, if one is nested anywhere in x."""
    x = _maybe_json(x)
    if isinstance(x, dict):
        if "example_id" in x and "category" in x:
            return x
        for v in x.values():
            r = _find_key_dict(v)
            if r:
                return r
    elif isinstance(x, (list, tuple)):
        for v in x:
            r = _find_key_dict(v)
            if r:
                return r
    return None


def _has(text: str, needle: str) -> bool:
    """needle occurs in text as a whole phrase (not inside a longer word)."""
    return re.search(r"(?<![a-z0-9])" + re.escape(needle) + r"(?![a-z0-9])", text) is not None


def build_item_map(items: Iterable[dict], bbq: pd.DataFrame) -> pd.DataFrame:
    """One row per OpenEval item: item_id, bbq_key, method.

    method: direct (example_id and category stored in the item),
            text (context, question and three answers found in the prompt text),
            ambiguous (several identical BBQ rows match), none (no match).
    """
    by_key = {k: i for i, k in enumerate(bbq["key"])}
    bn = pd.DataFrame({c: bbq[c].map(norm) for c in ["context", "question", "ans0", "ans1", "ans2"]})
    by_ctx: dict[str, list[int]] = {}
    for i, c in enumerate(bn["context"]):
        by_ctx.setdefault(c, []).append(i)
    A = ahocorasick.Automaton()
    for c in by_ctx:
        A.add_word(c, c)
    A.make_automaton()

    out = []
    for rec in items:
        iid = col(rec, "item_id")
        inp = col(rec, "item_content.input")
        ref = col(rec, "item_content.references")
        d = _find_key_dict(inp) or _find_key_dict(ref)
        if d is not None:
            key = f"{d['category']}:{int(d['example_id'])}"
            if key in by_key:
                out.append((iid, key, "direct"))
                continue
        text = norm(flatten_text(inp))
        best = None
        for _, ctx in A.iter(text):
            if best is None or len(ctx) > len(best):
                best = ctx
        if best is None:
            out.append((iid, None, "none"))
            continue
        cands = [i for i in by_ctx[best]
                 if bn.at[i, "question"] in text
                 and all(_has(text, bn.at[i, a]) for a in ("ans0", "ans1", "ans2"))]
        if len(cands) == 1:
            out.append((iid, bbq.at[cands[0], "key"], "text"))
        elif len(cands) > 1:
            out.append((iid, bbq.at[cands[0], "key"], "ambiguous"))
        else:
            out.append((iid, None, "none"))
    return pd.DataFrame(out, columns=["item_id", "bbq_key", "method"])
