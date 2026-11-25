"""Readers for OpenEval parquet tables. Layout-tolerant.

OpenEval stores one table per benchmark and kind (bbq.item, bbq.response).
Nested fields may arrive as parquet structs or as dotted flat columns, and
polymorphic fields are JSON strings. These helpers hide that.
"""
from __future__ import annotations
import glob, hashlib, json, os, re
from typing import Any, Iterable, Iterator
import pyarrow.parquet as pq


def find_files(root: str, kind: str, bench: str = "bbq") -> list[str]:
    """Parquet files under root whose path contains both `bench` and `kind`."""
    out = []
    for p in glob.glob(os.path.join(root, "**", "*.parquet"), recursive=True):
        low = p.lower().replace("\\", "/")
        if bench.lower() in low and kind in low:
            out.append(p)
    return sorted(out)


def schema_of(path: str) -> dict:
    pf = pq.ParquetFile(path)
    return {"path": path, "rows": pf.metadata.num_rows,
            "columns": {f.name: str(f.type) for f in pf.schema_arrow}}


def _maybe_json(v: Any) -> Any:
    if isinstance(v, str):
        s = v.strip()
        if s[:1] in "{[" and s[-1:] in "}]":
            try:
                return json.loads(s)
            except Exception:
                return v
    return v


def col(rec: dict, path: str, default: Any = None) -> Any:
    """Read `a.b.c` from a record that is nested, flat-dotted, or mixed."""
    if path in rec:
        return _maybe_json(rec[path])
    parts = path.split(".")
    for i in range(len(parts) - 1, 0, -1):          # longest flat prefix first
        head = ".".join(parts[:i])
        if head in rec:
            cur = _maybe_json(rec[head])
            for p in parts[i:]:
                if isinstance(cur, dict) and p in cur:
                    cur = _maybe_json(cur[p])
                else:
                    return default
            return cur
    return default


def iter_rows(files: Iterable[str], wanted: list[str], batch_size: int = 50_000) -> Iterator[dict]:
    """Yield rows as dicts, reading only columns that can hold `wanted` paths."""
    for f in files:
        pf = pq.ParquetFile(f)
        names = pf.schema_arrow.names
        cols = [n for n in names
                if any(n == w or n.startswith(w + ".") or w.startswith(n + ".") for w in wanted)]
        if not cols:
            raise ValueError(f"{f}: none of {wanted} found in columns {names}")
        for batch in pf.iter_batches(batch_size=batch_size, columns=cols):
            yield from batch.to_pylist()


def sha256_file(path: str, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        while True:
            b = fh.read(chunk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


def flatten_text(x: Any) -> str:
    """All strings inside str / list / dict (JSON-decoded) joined by newlines."""
    x = _maybe_json(x)
    if x is None:
        return ""
    if isinstance(x, str):
        return x
    if isinstance(x, dict):
        return "\n".join(flatten_text(v) for v in x.values())
    if isinstance(x, (list, tuple)):
        return "\n".join(flatten_text(v) for v in x)
    return str(x)


_ws = re.compile(r"\s+")


def norm(s: str) -> str:
    return _ws.sub(" ", s.strip().lower())
