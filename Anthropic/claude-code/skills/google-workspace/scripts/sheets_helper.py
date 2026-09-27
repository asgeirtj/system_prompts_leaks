#!/usr/bin/env python3
"""Helpers for the Google Sheets connector (get_spreadsheet / update_spreadsheet).

The Sheets batch API addresses cells by numeric sheetId and 0-based, end-exclusive
indexes, takes colors as 0-1 floats, and needs a field mask for every format
change. This connector also rejects field masks written with parentheses. These
commands do that bookkeeping so requests are right the first time.

Usage:
  sheets_helper.py range "B4:D10" [--sheet-id N | --meta META.json]
      Print the GridRange for an A1 range. A sheet name in the range
      ('P&L'!B4:D10) is resolved through META.json, the output of
      get_spreadsheet with fields ["sheets.properties"].

  sheets_helper.py format SPEC.json [--meta META.json] [--sheet-id N]
      Print the update_spreadsheet requests built from a friendly spec. See
      FORMAT SPEC below.

  sheets_helper.py cells GRID.json [--errors-only]
      Print every non-empty cell from a get_spreadsheet read with
      includeGridData, as: A1  formula-or-value  ->  displayed value.
      Error cells are marked. Use it to read formulas, which get_values
      does not return.

META.json and GRID.json may be the raw JSON or a result the app saved to disk,
either the {"content": "<json string>"} wrapper or a list of content blocks,
[{"type": "text", "text": "<json string>"}].

FORMAT SPEC (JSON):
  {
    "sheet": "Model",                       default sheet name for ranges without one
    "rules": [
      {"range": "A1:F1", "bold": true, "bg": "#1F3864", "fg": "#FFFFFF",
       "align": "CENTER", "wrap": true},
      {"range": "B2:F20", "number": "currency"},       currency | percent | multiple |
                                                       integer | decimal | date | text,
                                                       or any Sheets pattern string
      {"range": "B2:B5", "fg": "#0000FF"},             blue input cells
      {"range": "A1:F20", "borders": "#BFBFBF"}        thin outer and inner borders
    ],
    "freeze": {"rows": 1, "columns": 1},
    "col_widths": {"A": 220, "B:F": 110},              pixels
    "row_heights": {"1": 32}
  }
"""
import argparse
import json
import re
import sys

NUMBER_FORMATS = {
    "currency": {"type": "CURRENCY", "pattern": '$#,##0;($#,##0);"-"'},
    "currency2": {"type": "CURRENCY", "pattern": '$#,##0.00;($#,##0.00);"-"'},
    "percent": {"type": "PERCENT", "pattern": "0.0%"},
    "multiple": {"type": "NUMBER", "pattern": '0.0"x"'},
    "integer": {"type": "NUMBER", "pattern": "#,##0;(#,##0);\"-\""},
    "decimal": {"type": "NUMBER", "pattern": "#,##0.00"},
    "date": {"type": "DATE", "pattern": "yyyy-mm-dd"},
    "text": {"type": "TEXT"},
}


def unwrap(data):
    """Return the API JSON inside a saved tool result, however many wrappers it has.

    Accepts the raw API JSON, the {"content": "<json string>"} wrapper some apps save,
    and the list of content blocks others save, [{"type": "text", "text": "<json string>"}],
    whose text can itself be the {"content": ...} wrapper. Non-text blocks are ignored.
    """
    while True:
        if isinstance(data, dict) and isinstance(data.get("content"), (str, list)):
            # No Docs, Sheets or Slides resource has a top-level "content" field.
            data = data["content"]
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                except ValueError:
                    sys.exit(f"the saved result is not JSON: {data[:200]!r}")
        elif isinstance(data, list):
            texts = [b["text"] for b in data
                     if isinstance(b, dict) and b.get("type") == "text" and isinstance(b.get("text"), str)]
            if not texts:
                sys.exit("the saved result has no text block to read")
            try:
                data = json.loads("".join(texts))
            except ValueError:
                # Several blocks that are not one JSON text together: use the first that parses.
                for t in texts:
                    try:
                        data = json.loads(t)
                        break
                    except ValueError:
                        continue
                else:
                    sys.exit(f"the saved result's text is not JSON: {texts[0][:200]!r}")
        else:
            return data


def read_json_file(path):
    try:
        # utf-8-sig also reads files that start with a byte-order mark, as some Windows tools write.
        with open(path, encoding="utf-8-sig") as f:
            text = f.read()
    except OSError as e:
        sys.exit(f"cannot read {path}: {e.strerror}")
    except UnicodeDecodeError:
        sys.exit(f"{path} is not UTF-8 text; save it as UTF-8")
    if not text.strip():
        sys.exit(f"{path} is empty")
    try:
        return json.loads(text)
    except ValueError as e:
        sys.exit(f"{path} is not JSON ({e}); it starts {text.strip()[:80]!r}")


def load_json(path):
    """Read a tool result the model or the app saved, unwrapped to the API's JSON object."""
    data = unwrap(read_json_file(path))
    if not isinstance(data, dict):
        sys.exit(f"{path} does not hold a JSON object")
    return data


def load_spec(path, name):
    """Read a spec the model wrote. It is never a saved tool result, so no unwrapping."""
    data = read_json_file(path)
    if not isinstance(data, dict):
        sys.exit(f"{path} must be a JSON object; see {name} in 'sheets_helper.py --help'")
    return data


def col_to_index(letters):
    n = 0
    for ch in letters.upper():
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def index_to_col(i):
    s = ""
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        s = chr(65 + r) + s
    return s


def split_sheet(a1):
    """'P&L'!B4:C5 -> ("P&L", "B4:C5"); B4 -> (None, "B4")."""
    if "!" not in a1:
        return None, a1
    sheet, rng = a1.rsplit("!", 1)
    if sheet.startswith("'") and sheet.endswith("'"):
        sheet = sheet[1:-1].replace("''", "'")
    return sheet, rng


CELL = re.compile(r"^([A-Za-z]*)(\d*)$")


def parse_ref(ref):
    m = CELL.match(ref)
    if not m:
        sys.exit(f"bad cell reference: {ref}")
    col, row = m.groups()
    return (col_to_index(col) if col else None), (int(row) - 1 if row else None)


def grid_range(a1, sheet_ids, default_sheet=None, default_id=None):
    sheet, rng = split_sheet(a1)
    sheet = sheet or default_sheet
    if sheet is not None:
        if not sheet_ids:
            sys.exit(f"tab {sheet!r} can't be looked up: pass --meta with the get_spreadsheet result for fields [\"sheets.properties\"], or drop the tab name and \"sheet\" and pass --sheet-id")
        if sheet not in sheet_ids:
            sys.exit(f"sheet {sheet!r} not found; known: {', '.join(sorted(sheet_ids))}")
        sid = sheet_ids[sheet]
    elif default_id is not None:
        sid = default_id
    else:
        sys.exit(f"no sheet for range {a1!r}: pass --sheet-id or --meta, or name the sheet")
    start, _, end = rng.partition(":")
    c1, r1 = parse_ref(start)
    c2, r2 = parse_ref(end) if end else (c1, r1)
    out = {"sheetId": sid}
    if r1 is not None:
        out["startRowIndex"] = r1
    if r2 is not None:
        out["endRowIndex"] = r2 + 1
    if c1 is not None:
        out["startColumnIndex"] = c1
    if c2 is not None:
        out["endColumnIndex"] = c2 + 1
    return out


def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) != 6:
        sys.exit(f"bad color {h!r}; use #RRGGBB")
    # Full precision: Sheets stores each channel in 8 bits by truncating, so a rounded
    # value just below n/255 would come back as n - 1.
    return {k: int(h[i:i + 2], 16) / 255 for k, i in (("red", 0), ("green", 2), ("blue", 4))}


def sheet_ids_from_meta(path):
    if not path:
        return {}
    meta = load_json(path)
    return {s["properties"]["title"]: s["properties"]["sheetId"] for s in meta.get("sheets", [])}


def cmd_range(args):
    ids = sheet_ids_from_meta(args.meta)
    print(json.dumps(grid_range(args.a1, ids, default_id=args.sheet_id)))


def format_requests(spec, ids, default_id):
    default_sheet = spec.get("sheet")
    reqs = []

    def gr(a1):
        return grid_range(a1, ids, default_sheet, default_id)

    for rule in spec.get("rules", []):
        rng = gr(rule["range"])
        fmt, fields = {}, []
        if "number" in rule:
            nf = NUMBER_FORMATS.get(rule["number"], {"type": "NUMBER", "pattern": rule["number"]})
            fmt["numberFormat"] = nf
            fields.append("userEnteredFormat.numberFormat")
        text = {}
        for key, api in (("bold", "bold"), ("italic", "italic")):
            if key in rule:
                text[api] = rule[key]
                fields.append(f"userEnteredFormat.textFormat.{api}")
        if "size" in rule:
            text["fontSize"] = rule["size"]
            fields.append("userEnteredFormat.textFormat.fontSize")
        if "font" in rule:
            text["fontFamily"] = rule["font"]
            fields.append("userEnteredFormat.textFormat.fontFamily")
        if "fg" in rule:
            text["foregroundColor"] = hex_to_rgb(rule["fg"])
            fields.append("userEnteredFormat.textFormat.foregroundColor")
        if text:
            fmt["textFormat"] = text
        if "bg" in rule:
            fmt["backgroundColor"] = hex_to_rgb(rule["bg"])
            fields.append("userEnteredFormat.backgroundColor")
        if "align" in rule:
            fmt["horizontalAlignment"] = rule["align"].upper()
            fields.append("userEnteredFormat.horizontalAlignment")
        if "valign" in rule:
            fmt["verticalAlignment"] = rule["valign"].upper()
            fields.append("userEnteredFormat.verticalAlignment")
        if "wrap" in rule:
            fmt["wrapStrategy"] = "WRAP" if rule["wrap"] else "OVERFLOW_CELL"
            fields.append("userEnteredFormat.wrapStrategy")
        if fields:
            # Comma-separated full paths: this connector rejects masks with parentheses.
            reqs.append({"repeatCell": {"range": rng, "cell": {"userEnteredFormat": fmt},
                                        "fields": ",".join(fields)}})
        if "borders" in rule:
            line = {"style": "SOLID", "color": hex_to_rgb(rule["borders"])}
            reqs.append({"updateBorders": {"range": rng, **{side: line for side in (
                "top", "bottom", "left", "right", "innerHorizontal", "innerVertical")}}})

    if "freeze" in spec:
        sid = gr(f"'{default_sheet}'!A1")["sheetId"] if default_sheet else default_id
        if sid is None:
            sys.exit('freeze, col_widths and row_heights need a tab: add "sheet": "<tab title>" to the spec, or pass --sheet-id')
        props, fields = {}, []
        if "rows" in spec["freeze"]:
            props["frozenRowCount"] = spec["freeze"]["rows"]
            fields.append("gridProperties.frozenRowCount")
        if "columns" in spec["freeze"]:
            props["frozenColumnCount"] = spec["freeze"]["columns"]
            fields.append("gridProperties.frozenColumnCount")
        reqs.append({"updateSheetProperties": {"properties": {"sheetId": sid, "gridProperties": props},
                                               "fields": ",".join(fields)}})

    def dims(mapping, dimension):
        for key, px in mapping.items():
            sheet, ref = split_sheet(key)
            sheet = sheet or default_sheet
            if sheet is not None:
                if not ids:
                    sys.exit(f"tab {sheet!r} can't be looked up: pass --meta with the get_spreadsheet result for fields [\"sheets.properties\"], or drop the tab name and \"sheet\" and pass --sheet-id")
                sid = ids.get(sheet)
                if sid is None:
                    sys.exit(f"sheet {sheet!r} not found; known: {', '.join(sorted(ids))}")
            else:
                sid = default_id
                if sid is None:
                    sys.exit('freeze, col_widths and row_heights need a tab: add "sheet": "<tab title>" to the spec, or pass --sheet-id')
            a, _, b = ref.partition(":")
            b = b or a
            if dimension == "COLUMNS":
                lo, hi = col_to_index(a), col_to_index(b) + 1
            else:
                lo, hi = int(a) - 1, int(b)
            reqs.append({"updateDimensionProperties": {
                "range": {"sheetId": sid, "dimension": dimension, "startIndex": lo, "endIndex": hi},
                "properties": {"pixelSize": px}, "fields": "pixelSize"}})

    dims(spec.get("col_widths", {}), "COLUMNS")
    dims(spec.get("row_heights", {}), "ROWS")
    return reqs


def cmd_format(args):
    spec = load_spec(args.spec, "FORMAT SPEC")
    unknown = sorted(set(spec) - {"sheet", "rules", "freeze", "col_widths", "row_heights"})
    if unknown:
        print(f"WARNING: ignored top-level key(s) that FORMAT SPEC does not define: {', '.join(unknown)}; "
              "see 'sheets_helper.py --help'", file=sys.stderr)
    if args.revision:
        print("WARNING: Sheets has no revision guard, so --revision is ignored and no writeControl is added",
              file=sys.stderr)
    ids = sheet_ids_from_meta(args.meta)
    out = {"requests": format_requests(spec, ids, args.sheet_id)}
    if not out["requests"]:
        sys.exit(f"{args.spec} produced no requests; see FORMAT SPEC in 'sheets_helper.py --help'")
    print(json.dumps(out))


def scalar(v):
    if v is None:
        return None
    for k in ("formulaValue", "stringValue", "numberValue", "boolValue"):
        if k in v:
            return v[k]
    if "errorValue" in v:
        return f"#ERROR {v['errorValue'].get('type')}: {v['errorValue'].get('message', '')}"
    return v


def cmd_cells(args):
    grid = load_json(args.grid)
    errors = 0
    for sheet in grid.get("sheets", []):
        title = sheet.get("properties", {}).get("title", "?")
        for block in sheet.get("data", []):
            r0 = block.get("startRow", 0)
            c0 = block.get("startColumn", 0)
            for ri, row in enumerate(block.get("rowData", [])):
                for ci, cell in enumerate(row.get("values", [])):
                    if not cell:
                        continue
                    entered = scalar(cell.get("userEnteredValue"))
                    shown = cell.get("formattedValue", "")
                    err = "errorValue" in cell.get("effectiveValue", {})
                    errors += err
                    if args.errors_only and not err:
                        continue
                    addr = f"{index_to_col(c0 + ci)}{r0 + ri + 1}"
                    mark = "  <-- ERROR " + cell["effectiveValue"]["errorValue"].get("type", "") if err else ""
                    print(f"{title}!{addr}\t{entered!r}\t-> {shown!r}{mark}")
    print(f"errors: {errors}")


def main():
    import signal
    if hasattr(signal, "SIGPIPE"):  # Windows has no SIGPIPE
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    if hasattr(sys.stdout, "reconfigure"):  # print UTF-8 even where the console default isn't
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("range")
    p.add_argument("a1")
    p.add_argument("--sheet-id", type=int)
    p.add_argument("--meta")
    p.set_defaults(func=cmd_range)
    p = sub.add_parser("format")
    p.add_argument("spec")
    p.add_argument("--sheet-id", type=int)
    p.add_argument("--meta")
    # Sheets has no revision guard; --revision is accepted so callers that pass it don't fail,
    # then ignored with a warning.
    p.add_argument("--revision", help=argparse.SUPPRESS)
    p.set_defaults(func=cmd_format)
    p = sub.add_parser("cells")
    p.add_argument("grid")
    p.add_argument("--errors-only", action="store_true")
    p.set_defaults(func=cmd_cells)
    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
