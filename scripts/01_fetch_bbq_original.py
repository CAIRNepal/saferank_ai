#!/usr/bin/env python3
"""Clone the original BBQ repository at a pinned commit (CC-BY-4.0)."""
import os, subprocess, sys

PIN = "bea11bd97d79217245b5871acd247b9d6eb24598"   # last commit of nyu-mll/BBQ seen on 2026-11-18 (6 Jul 2022)
dest = sys.argv[1] if len(sys.argv) > 1 else "data/external/BBQ"
if not os.path.isdir(dest):
    subprocess.check_call(["git", "clone", "https://github.com/nyu-mll/BBQ.git", dest])
subprocess.check_call(["git", "-C", dest, "checkout", PIN])
head = subprocess.check_output(["git", "-C", dest, "rev-parse", "HEAD"], text=True).strip()
open("data/external/BBQ_PIN.txt", "w").write(head + "\n")
print("BBQ at", head)
