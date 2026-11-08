#!/usr/bin/env python3
"""
Deterministic helpers for test-executor: scope filtering and metrics math.
These are mechanical/arithmetic steps that must not be eyeballed — get them
wrong and the report's own numbers contradict each other.

Usage:
    py execution_tools.py scope <test_design.csv> <out_scope.json>
        Reads the reviewed Test Design CSV, splits rows by `Valid in Scope`,
        and writes out_scope.json: {"executable": [...rows...], "out_of_scope": [...rows...],
        "invalid_scope_value": [...rows...], "counts": {...}}.
        Never modifies the input CSV.

    py execution_tools.py metrics <out_scope.json> <results.json> <out_metrics.json>
        results.json: {"TC-001": "PASS", "TC-002": "FAIL", "TC-003": "BLOCKED", ...}
        Every key must correspond to a TC ID from out_scope.json's "executable" list;
        every executable TC ID must have a result, or the script refuses to run.
        Writes out_metrics.json with total/valid/out-of-scope/passed/failed/blocked/
        not-executed counts plus pass_rate and execution_rate (both "N/A" instead of
        raising on divide-by-zero).
"""
import csv
import json
import sys
from pathlib import Path

REQUIRED_COLUMNS = [
    "TC ID", "Module", "Feature", "Test Scenario", "Test Type", "Design Technique",
    "Preconditions", "Test Data", "Steps", "Expected Result", "Priority", "Severity",
    "Source", "Evidence Type", "Confidence", "Valid in Scope", "Needs automation",
]

VALID_STATUSES = {"PASS", "FAIL", "BLOCKED"}


def die(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def cmd_scope(csv_path, out_path):
    csv_path = Path(csv_path)
    if not csv_path.exists():
        die(f"CSV not found: {csv_path}")

    with csv_path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        missing = [c for c in REQUIRED_COLUMNS if c not in (reader.fieldnames or [])]
        if missing:
            die(f"CSV is missing required column(s): {missing}. Found columns: {reader.fieldnames}")
        rows = list(reader)

    if not rows:
        die("CSV has no data rows")

    executable, out_of_scope, invalid_scope = [], [], []
    seen_ids = set()
    for row in rows:
        tc_id = (row.get("TC ID") or "").strip()
        if not tc_id:
            die(f"row with blank TC ID: {row}")
        if tc_id in seen_ids:
            die(f"duplicate TC ID in CSV: {tc_id}")
        seen_ids.add(tc_id)

        raw = (row.get("Valid in Scope") or "").strip()
        if raw == "1":
            executable.append(row)
        elif raw == "0":
            out_of_scope.append(row)
        else:
            invalid_scope.append(row)

    counts = {
        "total": len(rows),
        "valid_in_scope": len(executable),
        "out_of_scope": len(out_of_scope),
        "invalid_or_blank_scope": len(invalid_scope),
    }

    out = {
        "executable": executable,
        "out_of_scope": out_of_scope,
        "invalid_scope_value": invalid_scope,
        "counts": counts,
    }
    Path(out_path).write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(json.dumps(counts, indent=2))
    if invalid_scope:
        print(
            f"WARNING: {len(invalid_scope)} row(s) had a blank/invalid 'Valid in Scope' value "
            f"and were excluded from execution: {[r['TC ID'] for r in invalid_scope]}",
            file=sys.stderr,
        )


def cmd_metrics(scope_json_path, results_json_path, out_path):
    scope = json.loads(Path(scope_json_path).read_text(encoding="utf-8"))
    results = json.loads(Path(results_json_path).read_text(encoding="utf-8"))

    executable_ids = [r["TC ID"] for r in scope["executable"]]
    missing = [tid for tid in executable_ids if tid not in results]
    if missing:
        die(f"missing execution result for in-scope test case(s): {missing}")
    extra = [tid for tid in results if tid not in executable_ids]
    if extra:
        die(f"results.json contains status for out-of-scope/unknown TC ID(s): {extra} — "
            f"only Valid in Scope=1 test cases may have a result")

    bad_status = {tid: st for tid, st in results.items() if st not in VALID_STATUSES}
    if bad_status:
        die(f"invalid status value(s), must be PASS/FAIL/BLOCKED: {bad_status}")

    passed = sum(1 for st in results.values() if st == "PASS")
    failed = sum(1 for st in results.values() if st == "FAIL")
    blocked = sum(1 for st in results.values() if st == "BLOCKED")

    counts = dict(scope["counts"])
    counts["passed"] = passed
    counts["failed"] = failed
    counts["blocked"] = blocked
    counts["not_executed"] = counts["out_of_scope"] + counts["invalid_or_blank_scope"]

    pf = passed + failed
    counts["pass_rate"] = round(passed / pf * 100, 1) if pf > 0 else "N/A"

    valid_scope = counts["valid_in_scope"]
    counts["execution_rate"] = (
        round((passed + failed + blocked) / valid_scope * 100, 1) if valid_scope > 0 else "N/A"
    )

    Path(out_path).write_text(json.dumps(counts, indent=2), encoding="utf-8")
    print(json.dumps(counts, indent=2))


def main():
    if len(sys.argv) < 2:
        die("usage: execution_tools.py <scope|metrics> ...")
    cmd = sys.argv[1]
    if cmd == "scope":
        if len(sys.argv) != 4:
            die("usage: execution_tools.py scope <test_design.csv> <out_scope.json>")
        cmd_scope(sys.argv[2], sys.argv[3])
    elif cmd == "metrics":
        if len(sys.argv) != 5:
            die("usage: execution_tools.py metrics <out_scope.json> <results.json> <out_metrics.json>")
        cmd_metrics(sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        die(f"unknown command: {cmd}")


if __name__ == "__main__":
    main()
