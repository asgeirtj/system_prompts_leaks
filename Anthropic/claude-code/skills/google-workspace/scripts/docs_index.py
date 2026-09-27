#!/usr/bin/env python3
"""Index helpers for the Google Docs connector (read_doc / update_doc).

read_doc returns the full documents.get JSON, which is large. This script reads
that JSON from a file and prints only what an edit needs, so the document never
has to be read into context.

Usage:
  docs_index.py outline DOC.json                 one line per body element, with indexes;
                                                 pending suggestions show as [+inserted] / [-deleted]
  docs_index.py find DOC.json "text"             index range of every occurrence of text. A match
                                                 must lie inside one paragraph and cannot span a
                                                 chip, image or other non-text element
  docs_index.py fill-table DOC.json --table N --data ROWS.json [--bold-header]
                                                 the update_doc arguments (requests and writeControl)
                                                 that fill empty table N, the TABLE #N that outline
                                                 prints. ROWS.json is a JSON list of rows, each a list
                                                 of cell values; a null or "" value skips that cell
  docs_index.py new-table --at INDEX --data ROWS.json [--tab TAB_ID] [--revision REV] [--bold-header]
                                                 the update_doc arguments that insert a new table at
                                                 INDEX, the endIndex - 1 of the paragraph it goes after,
                                                 and fill it, in one call; needs no DOC.json

DOC.json may be the raw document JSON, or a tool result the app saved to disk, either
the {"content": "<json string>"} wrapper or a list of content blocks,
[{"type": "text", "text": "<json string>"}].

outline and find print the tab id and revisionId, which update_doc needs for
location.tabId and writeControl.requiredRevisionId; new-table takes them as --tab and --revision.
"""
import argparse
import json
import sys


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


def load_doc(path):
    doc = unwrap(read_json_file(path))
    if not isinstance(doc, dict) or not ("tabs" in doc or "body" in doc):
        sys.exit(f"{path} is not a read_doc result: found no 'tabs' or 'body'")
    return doc


def tabs(doc):
    """Yield (tabId, body_content) for each tab, child tabs at any depth included,
    in document order. Handles docs without tabs."""
    def visit(tab_list):
        for t in tab_list:
            yield t["tabProperties"]["tabId"], t["documentTab"]["body"]["content"]
            yield from visit(t.get("childTabs", []))

    if "tabs" in doc:
        yield from visit(doc["tabs"])
    else:
        yield None, doc["body"]["content"]


def run_text(tr):
    """Text of one textRun, with pending suggestions marked [+ins] / [-del]."""
    t = tr.get("content", "")
    if tr.get("suggestedInsertionIds"):
        return f"[+{t}]"
    if tr.get("suggestedDeletionIds"):
        return f"[-{t}]"
    return t


def para_text(p):
    return "".join(run_text(e["textRun"]) for e in p.get("elements", []) if "textRun" in e)


def walk(content, depth=0, cell=None):
    """Yield (depth, element, cell) for body elements, descending into table cells.
    cell is the (row, column) of the innermost table cell holding the element, or None."""
    for el in content:
        yield depth, el, cell
        if "table" in el:
            for r, row in enumerate(el["table"]["tableRows"]):
                for c, tc in enumerate(row["tableCells"]):
                    yield from walk(tc["content"], depth + 1, (r, c))


def tables(doc):
    """Yield (n, tabId, table element) for every table, tables inside table cells
    included, numbered across the whole document in document order. outline and
    fill-table both take their table numbers from here, so #N means the same table."""
    n = -1
    for tab_id, content in tabs(doc):
        for _, el, _ in walk(content):
            if "table" in el:
                n += 1
                yield n, tab_id, el


def cmd_outline(doc, args):
    print(f"revisionId: {doc.get('revisionId')}")
    table_no = {id(el): n for n, _, el in tables(doc)}
    for tab_id, content in tabs(doc):
        print(f"\n--- tab {tab_id} ---")
        for depth, el, cell_rc in walk(content):
            s, e = el.get("startIndex"), el.get("endIndex")
            pad = "  " * depth
            if "paragraph" in el:
                p = el["paragraph"]
                style = p.get("paragraphStyle", {}).get("namedStyleType", "NORMAL_TEXT")
                bullet = " [bullet]" if "bullet" in p else ""
                cell = f" cell{cell_rc}" if cell_rc else ""
                text = para_text(p).rstrip("\n").replace("\n", "\\n")
                if len(text) > 70:
                    text = text[:67] + "..."
                print(f"{pad}{s}-{e} {style}{bullet}{cell}: {text!r}")
            elif "table" in el:
                t = el["table"]
                print(f"{pad}{s}-{e} TABLE #{table_no[id(el)]} {t['rows']}x{t['columns']}")
            elif "sectionBreak" in el:
                print(f"{pad}{s}-{e} sectionBreak")
            else:
                kind = next(k for k in el if k not in ("startIndex", "endIndex"))
                print(f"{pad}{s}-{e} {kind}")
        end = content[-1]["endIndex"]
        print(f"body end: {end} (append by inserting at {end - 1}; the final newline must stay)")


def u16(s):
    """Length of s in UTF-16 code units, the unit Docs indexes count in."""
    return len(s.encode("utf-16-le")) // 2


def cmd_find(doc, args):
    needle = args.text
    if not needle:
        sys.exit("find needs non-empty text")
    print(f"revisionId: {doc.get('revisionId')}")
    hits = 0
    for tab_id, content in tabs(doc):
        for _, el, _ in walk(content):
            if "paragraph" not in el:
                continue
            # Search the paragraph's text runs joined together, so a match can cross
            # a style boundary (for example "Q3 launch" where only "Q3" is bold).
            # A chip, image or footnote mark between two runs breaks the join, because it
            # takes up indexes of its own.
            groups, group = [], []
            for part in el["paragraph"].get("elements", []):
                if part.get("textRun") and (not group or group[-1].get("endIndex") == part.get("startIndex")):
                    group.append(part)
                else:
                    if group:
                        groups.append(group)
                    group = [part] if part.get("textRun") else []
            if group:
                groups.append(group)
            for runs in groups:
                hits += find_in_runs(runs, needle, tab_id)
    if not hits:
        print("no matches", file=sys.stderr)
        sys.exit(1)


def find_in_runs(runs, needle, tab_id):
    """Print every match of needle in the joined text of runs, a list of adjacent
    textRun elements, and return how many there were."""
    hits = 0
    text = "".join(run["textRun"]["content"] for run in runs)
    owner = []  # owner[i] = position in runs of the run that holds text[i]
    run_start = []  # run_start[k] = where run k begins in text
    for k, run in enumerate(runs):
        run_start.append(len(owner))
        owner.extend([k] * len(run["textRun"]["content"]))
    pos = text.find(needle)
    while pos != -1:
        k = owner[pos]
        first = runs[k]
        start = first["startIndex"] + u16(text[run_start[k]:pos])
        end = start + u16(needle)
        touched = [runs[j] for j in sorted(set(owner[pos:pos + len(needle)]))]
        bolds = {bool(r["textRun"].get("textStyle", {}).get("bold", False)) for r in touched}
        bold = bolds.pop() if len(bolds) == 1 else "mixed"
        flag = ""
        if any(r["textRun"].get("suggestedDeletionIds") for r in touched):
            flag = "  PENDING SUGGESTED DELETION"
        elif any(r["textRun"].get("suggestedInsertionIds") for r in touched):
            flag = "  PENDING SUGGESTED INSERTION"
        print(f"tab {tab_id}: {start}-{end}  bold={bold}{flag}")
        hits += 1
        pos = text.find(needle, pos + 1)
    return hits


def cell_text(value):
    """The text a ROWS.json cell value puts in the doc. null and "" leave the cell empty."""
    if value is None:
        return ""
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (dict, list)):
        sys.exit(f"a cell value must be text or a number, not {json.dumps(value)[:60]}")
    return str(value)


def cmd_fill_table(doc, args):
    rows = read_json_file(args.data)
    if not isinstance(rows, list) or not rows or not all(isinstance(r, list) for r in rows):
        sys.exit(f"{args.data} must be a non-empty JSON list of rows, each row a list of cell values")
    for n, tab_id, el in tables(doc):
        if n != args.table:
            continue
        t = el["table"]
        if len(rows) > t["rows"] or max(len(r) for r in rows) > t["columns"]:
            sys.exit(f"data is {len(rows)}x{max(len(r) for r in rows)}, table is {t['rows']}x{t['columns']}")
        requests = []
        # Walk cells in reverse so each insert lands before the indexes still to be used.
        for r in range(len(rows) - 1, -1, -1):
            for c in range(len(rows[r]) - 1, -1, -1):
                if cell_text(rows[r][c]) == "":
                    continue
                text = cell_text(rows[r][c])
                cell = t["tableRows"][r]["tableCells"][c]
                first_para = cell["content"][0]
                loc = {"index": first_para["startIndex"]}
                if tab_id:
                    loc["tabId"] = tab_id
                requests.append({"insertText": {"location": loc, "text": text}})
        if args.bold_header and rows:
            # After the inserts above, header cell c starts at its original index plus
            # the length of the header texts inserted before it (lower indexes).
            shift = 0
            for c, text in enumerate(rows[0]):
                cell = t["tableRows"][0]["tableCells"][c]
                start = cell["content"][0]["startIndex"] + shift
                length = u16(cell_text(text))
                if length:
                    rng = {"startIndex": start, "endIndex": start + length}
                    if tab_id:
                        rng["tabId"] = tab_id
                    requests.append({"updateTextStyle": {"range": rng, "textStyle": {"bold": True}, "fields": "bold"}})
                shift += length
        out = {"requests": requests}
        if doc.get("revisionId"):
            out["writeControl"] = {"requiredRevisionId": doc["revisionId"]}
        json.dump(out, sys.stdout, ensure_ascii=False)
        print()
        return
    sys.exit(f"table #{args.table} not found")


def cmd_new_table(args):
    """Insert a table at args.at and fill it in one batch, with no read of the doc.

    Google lays out a new empty table predictably (measured on live Google Docs): inserted
    at index i, the table starts at S = i + 1, row r starts at S + 1 + r * (2C + 1),
    cell (r, c)'s paragraph starts at S + 3 + r * (2C + 1) + 2c, and the table ends at
    S + 2 + R * (2C + 1), where Google adds an empty paragraph that takes the style of
    the paragraph the table was inserted into. Requests in one batch run in order, so
    the inserts below can use those positions right after the insertTable.
    """
    rows = read_json_file(args.data)
    if not isinstance(rows, list) or not rows or not all(isinstance(r, list) for r in rows):
        sys.exit(f"{args.data} must be a non-empty JSON list of rows, each row a list of cell values")
    if args.at < 1:
        sys.exit("--at must be a body index of 1 or more: the endIndex - 1 of the paragraph the table goes after")
    n_rows, n_cols = len(rows), max(len(r) for r in rows)
    if n_cols < 1:
        sys.exit(f"{args.data} has no cells")

    def loc(index):
        out = {"index": index}
        if args.tab:
            out["tabId"] = args.tab
        return out

    def rng(start, end):
        out = {"startIndex": start, "endIndex": end}
        if args.tab:
            out["tabId"] = args.tab
        return out

    start = args.at + 1
    stride = 2 * n_cols + 1

    def cell_para(r, c):
        return start + 3 + r * stride + 2 * c

    table_end = start + 2 + n_rows * stride
    requests = [{"insertTable": {"rows": n_rows, "columns": n_cols, "location": loc(args.at)}},
                # The empty paragraph after the table copies the style of the paragraph the
                # table went into; after a heading it would be an empty heading.
                {"updateParagraphStyle": {"range": rng(table_end, table_end + 1),
                                          "paragraphStyle": {"namedStyleType": "NORMAL_TEXT"},
                                          "fields": "namedStyleType"}}]
    # Fill from the last cell to the first, so each insert only shifts cells already filled.
    for r in range(n_rows - 1, -1, -1):
        for c in range(len(rows[r]) - 1, -1, -1):
            if cell_text(rows[r][c]) == "":
                continue
            requests.append({"insertText": {"location": loc(cell_para(r, c)), "text": cell_text(rows[r][c])}})
    if args.bold_header:
        shift = 0
        for c, text in enumerate(rows[0]):
            length = u16(cell_text(text))
            if length:
                s = cell_para(0, c) + shift
                requests.append({"updateTextStyle": {"range": rng(s, s + length),
                                                     "textStyle": {"bold": True}, "fields": "bold"}})
            shift += length
    out = {"requests": requests}
    if args.revision:
        out["writeControl"] = {"requiredRevisionId": args.revision}
    else:
        print("no --revision given: add writeControl.requiredRevisionId from your read before sending", file=sys.stderr)
    json.dump(out, sys.stdout, ensure_ascii=False)
    print()


def _setup_output():
    import signal
    if hasattr(signal, "SIGPIPE"):  # Windows has no SIGPIPE
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    if hasattr(sys.stdout, "reconfigure"):  # print UTF-8 even where the console default isn't
        sys.stdout.reconfigure(encoding="utf-8")


def main():
    _setup_output()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("outline"); p.add_argument("doc")
    p = sub.add_parser("find"); p.add_argument("doc"); p.add_argument("text")
    p = sub.add_parser("fill-table"); p.add_argument("doc")
    p.add_argument("--table", type=int, default=0); p.add_argument("--data", required=True)
    p.add_argument("--bold-header", action="store_true")
    p = sub.add_parser("new-table")
    p.add_argument("--at", type=int, required=True, help="the endIndex - 1 of the paragraph the table goes after")
    p.add_argument("--data", required=True, help="a JSON file holding a list of rows, each a list of cell values")
    p.add_argument("--tab", help="the tabId from read_doc; needed when the doc has more than one tab")
    p.add_argument("--revision", help="the revisionId from read_doc, sent as writeControl.requiredRevisionId")
    p.add_argument("--bold-header", action="store_true")
    args = ap.parse_args()
    if args.cmd == "new-table":
        cmd_new_table(args)
        return
    doc = load_doc(args.doc)
    {"outline": cmd_outline, "find": cmd_find, "fill-table": cmd_fill_table}[args.cmd](doc, args)


if __name__ == "__main__":
    main()
