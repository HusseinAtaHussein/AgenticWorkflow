#!/usr/bin/env python3
"""
Deterministic helper for test-automation-builder: scope filtering.
Filtering "which rows get a spec written" is a mechanical AND of two columns,
not a judgment call — get it wrong and the skill either automates something
a human reviewer explicitly excluded, or silently drops something they approved.

Usage:
    py automation_tools.py scope <test_design.csv> <out_scope.json>
        Reads the reviewed Test Design CSV and splits rows into:
          - "automate"      : Valid in Scope = 1 AND Needs automation = 1
          - "not_automation": Valid in Scope = 1 AND Needs automation = 0
                               (in scope for manual execution, just not this skill's job)
          - "out_of_scope"  : Valid in Scope = 0
          - "invalid_value" : either column blank or not "0"/"1"
        Writes out_scope.json with all four lists plus "counts".
        Never modifies the input CSV.
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

    automate, not_automation, out_of_scope, invalid_value = [], [], [], []
    seen_ids = set()
    for row in rows:
        tc_id = (row.get("TC ID") or "").strip()
        if not tc_id:
            die(f"row with blank TC ID: {row}")
        if tc_id in seen_ids:
            die(f"duplicate TC ID in CSV: {tc_id}")
        seen_ids.add(tc_id)

        scope_raw = (row.get("Valid in Scope") or "").strip()
        auto_raw = (row.get("Needs automation") or "").strip()

        if scope_raw not in ("0", "1") or auto_raw not in ("0", "1"):
            invalid_value.append(row)
        elif scope_raw == "0":
            out_of_scope.append(row)
        elif auto_raw == "1":
            automate.append(row)
        else:
            not_automation.append(row)

    counts = {
        "total": len(rows),
        "automate": len(automate),
        "valid_scope_manual_only": len(not_automation),
        "out_of_scope": len(out_of_scope),
        "invalid_or_blank_value": len(invalid_value),
    }

    out = {
        "automate": automate,
        "not_automation": not_automation,
        "out_of_scope": out_of_scope,
        "invalid_value": invalid_value,
        "counts": counts,
    }
    Path(out_path).write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(json.dumps(counts, indent=2))
    if invalid_value:
        print(
            f"WARNING: {len(invalid_value)} row(s) had a blank/invalid 'Valid in Scope' or "
            f"'Needs automation' value and were excluded: {[r['TC ID'] for r in invalid_value]}",
            file=sys.stderr,
        )


def main():
    if len(sys.argv) != 4 or sys.argv[1] != "scope":
        die("usage: automation_tools.py scope <test_design.csv> <out_scope.json>")
    cmd_scope(sys.argv[2], sys.argv[3])


if __name__ == "__main__":
    main()
