#!/usr/bin/env python3
"""
Build the Test Cases workbook from a JSON payload.

Usage:
    py build_xlsx.py <input.json> <output.xlsx>

Input JSON shape:
{
  "module": "Dashboard",
  "source_file": "Output/UI_Exploration/Dashboard_UI_Exploration_Findings.md",
  "test_cases": [
    {
      "tc_id": "TC-001",
      "module": "Dashboard",
      "feature": "Country POS Filter",
      "test_scenario": "...",
      "test_type": "Functional",
      "design_technique": "Positive",
      "preconditions": "User is authenticated and on the Dashboard page.",
      "test_data": "Valid Country POS option",
      "steps": "1. ...\n2. ...\n3. ...",
      "expected_result": "...",
      "priority": "High",
      "severity": "Major",
      "source": "UI Exploration - Section 6 UI Components - Country POS filter",
      "evidence_type": "Observed",
      "confidence": "High",
      "valid_in_scope": 1,
      "needs_automation": 1
    },
    ...
  ]
}

The script computes the Summary sheet from the actual test_cases list — it never trusts
precomputed counts from the caller, so the numbers are guaranteed to match the rows.
"""
import json
import sys
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.table import Table, TableStyleInfo

COLUMNS = [
    ("tc_id", "TC ID", 10),
    ("module", "Module", 14),
    ("feature", "Feature", 20),
    ("test_scenario", "Test Scenario", 32),
    ("test_type", "Test Type", 14),
    ("design_technique", "Design Technique", 16),
    ("preconditions", "Preconditions", 28),
    ("test_data", "Test Data", 22),
    ("steps", "Steps", 42),
    ("expected_result", "Expected Result", 36),
    ("priority", "Priority", 10),
    ("severity", "Severity", 10),
    ("source", "Source", 30),
    ("evidence_type", "Evidence Type", 13),
    ("confidence", "Confidence", 11),
    ("valid_in_scope", "Valid in Scope", 12),
    ("needs_automation", "Needs automation", 14),
]

WRAP_KEYS = {"test_scenario", "preconditions", "test_data", "steps", "expected_result", "source"}

HEADER_FILL = PatternFill(start_color="FF2F5496", end_color="FF2F5496", fill_type="solid")
HEADER_FONT = Font(bold=True, color="FFFFFFFF")


def die(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def validate_case(tc, index):
    for key, _, _ in COLUMNS:
        if key not in tc:
            die(f"test_cases[{index}] missing required field '{key}' (tc_id={tc.get('tc_id', '?')})")
    if tc["valid_in_scope"] not in (0, 1):
        die(f"{tc['tc_id']}: valid_in_scope must be 0 or 1, got {tc['valid_in_scope']!r}")
    if tc["needs_automation"] not in (0, 1):
        die(f"{tc['tc_id']}: needs_automation must be 0 or 1, got {tc['needs_automation']!r}")
    if tc["priority"] not in ("High", "Medium", "Low"):
        die(f"{tc['tc_id']}: priority must be High/Medium/Low, got {tc['priority']!r}")
    if tc["severity"] not in ("Critical", "Major", "Minor", "Trivial"):
        die(f"{tc['tc_id']}: severity must be Critical/Major/Minor/Trivial, got {tc['severity']!r}")
    if tc["evidence_type"] not in ("Observed", "Documented", "Inferred"):
        die(f"{tc['tc_id']}: evidence_type must be Observed/Documented/Inferred, got {tc['evidence_type']!r}")
    if tc["confidence"] not in ("High", "Medium", "Low"):
        die(f"{tc['tc_id']}: confidence must be High/Medium/Low, got {tc['confidence']!r}")


SECRET_MARKERS = ("password", "passwd", "authorization: bearer", "api_key", "apikey", "secret", "token=")


def scan_for_secrets(tc):
    blob = " ".join(str(v) for v in tc.values()).lower()
    hits = [m for m in SECRET_MARKERS if m in blob]
    return hits


def build(payload, out_path):
    module = payload.get("module", "Module")
    source_file = payload.get("source_file", "")
    cases = payload.get("test_cases", [])
    if not cases:
        die("test_cases is empty — nothing to write")

    seen_ids = set()
    for i, tc in enumerate(cases):
        validate_case(tc, i)
        if tc["tc_id"] in seen_ids:
            die(f"duplicate TC ID found: {tc['tc_id']}")
        seen_ids.add(tc["tc_id"])
        hits = scan_for_secrets(tc)
        if hits:
            die(f"{tc['tc_id']}: possible secret/credential content detected ({hits}) — refusing to write file")

    wb = Workbook()
    ws = wb.active
    ws.title = "Test Cases"

    for col_idx, (_, header, _) in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    for row_idx, tc in enumerate(cases, start=2):
        for col_idx, (key, _, _) in enumerate(COLUMNS, start=1):
            value = tc[key]
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            wrap = key in WRAP_KEYS
            cell.alignment = Alignment(
                horizontal="center" if key in ("valid_in_scope", "needs_automation", "priority", "severity", "tc_id") else "left",
                vertical="top",
                wrap_text=wrap,
            )

    for col_idx, (_, _, width) in enumerate(COLUMNS, start=1):
        ws.column_dimensions[get_column_letter(col_idx)].width = width

    ws.freeze_panes = "A2"

    last_col_letter = get_column_letter(len(COLUMNS))
    last_row = len(cases) + 1
    table_ref = f"A1:{last_col_letter}{last_row}"
    table = Table(displayName="TestCases", ref=table_ref)
    table.tableStyleInfo = TableStyleInfo(
        name="TableStyleMedium2", showFirstColumn=False, showLastColumn=False,
        showRowStripes=True, showColumnStripes=False,
    )
    ws.add_table(table)

    for row in ws.iter_rows(min_row=2, max_row=last_row):
        ws.row_dimensions[row[0].row].height = 60

    # Summary sheet — every number derived from `cases`, never trusted from the caller.
    ws2 = wb.create_sheet("Summary")
    total = len(cases)
    high = sum(1 for t in cases if t["priority"] == "High")
    medium = sum(1 for t in cases if t["priority"] == "Medium")
    low = sum(1 for t in cases if t["priority"] == "Low")
    valid_scope = sum(1 for t in cases if t["valid_in_scope"] == 1)
    out_scope = total - valid_scope
    needs_auto = sum(1 for t in cases if t["needs_automation"] == 1)
    manual_only = total - needs_auto
    observed = sum(1 for t in cases if t["evidence_type"] == "Observed")
    documented = sum(1 for t in cases if t["evidence_type"] == "Documented")
    inferred = sum(1 for t in cases if t["evidence_type"] == "Inferred")
    blocked = sum(1 for t in cases if "block" in str(t.get("source", "")).lower() or "block" in str(t.get("test_scenario", "")).lower())

    summary_rows = [
        ("Module", module),
        ("Source UI Exploration File", source_file),
        ("Total Test Cases", total),
        ("High Priority", high),
        ("Medium Priority", medium),
        ("Low Priority", low),
        ("Valid in Scope", valid_scope),
        ("Out of Scope", out_scope),
        ("Needs Automation", needs_auto),
        ("Manual Only", manual_only),
        ("Observed Evidence", observed),
        ("Documented Evidence", documented),
        ("Inferred Evidence", inferred),
        ("Blocked / Affected", blocked),
    ]

    ws2.cell(row=1, column=1, value="Metric").font = HEADER_FONT
    ws2.cell(row=1, column=1).fill = HEADER_FILL
    ws2.cell(row=1, column=2, value="Value").font = HEADER_FONT
    ws2.cell(row=1, column=2).fill = HEADER_FILL
    for i, (metric, value) in enumerate(summary_rows, start=2):
        ws2.cell(row=i, column=1, value=metric)
        ws2.cell(row=i, column=2, value=value)
    ws2.column_dimensions["A"].width = 28
    ws2.column_dimensions["B"].width = 40
    ws2.freeze_panes = "A2"

    out_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out_path)

    print(json.dumps({
        "output": str(out_path),
        "total_test_cases": total,
        "valid_in_scope": valid_scope,
        "needs_automation": needs_auto,
        "manual_only": manual_only,
    }, indent=2))


def main():
    if len(sys.argv) != 3:
        die("usage: build_xlsx.py <input.json> <output.xlsx>")
    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    if not in_path.exists():
        die(f"input file not found: {in_path}")
    payload = json.loads(in_path.read_text(encoding="utf-8"))
    build(payload, out_path)


if __name__ == "__main__":
    main()
