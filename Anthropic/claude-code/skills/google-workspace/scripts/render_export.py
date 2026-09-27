#!/usr/bin/env python3
"""Turn a Drive download_file_content PDF export into page images for a visual check.

Usage:
  render_export.py EXPORT.json OUT_DIR [--dpi 110] [--pages 1-3]

EXPORT.json is the saved result of Drive download_file_content with
exportMimeType "application/pdf": a JSON object whose "content" field is the
base64 PDF, that object wrapped the way the app saved it, a bare base64 file,
or a .pdf. Writes OUT_DIR/export.pdf and OUT_DIR/page-N.jpg, and prints the
image paths so they can be opened and looked at one by one. Needs pdftoppm
(poppler-utils).
"""
import argparse
import base64
import binascii
import json
import os
import shutil
import subprocess
import sys
import tempfile


def b64decode(text):
    """Decode base64 text, ignoring line breaks and spaces. Raises ValueError if it isn't base64."""
    return base64.b64decode("".join(text.split()), validate=True)


def readable(text):
    """True if text is the base64 of a whole PDF, or JSON that may hold one: a list of
    blocks, an object with a "content" field, or a quoted string that is itself readable."""
    text = text.strip()
    if text[:1] in ("[", "{", '"'):
        try:
            value = json.loads(text)
        except ValueError:
            return False
        return (isinstance(value, list) or (isinstance(value, dict) and "content" in value)
                or (isinstance(value, str) and readable(value)))
    try:
        pdf = b64decode(text)
    except (binascii.Error, ValueError):
        return False
    return pdf.startswith(b"%PDF") and b"%%EOF" in pdf[-1024:]


def read_pdf_bytes(path):
    try:
        with open(path, "rb") as f:
            raw = f.read()
    except OSError as e:
        sys.exit(f"cannot read {path}: {e.strerror}")
    if raw.startswith(b"%PDF"):
        return raw
    # Unwrap a saved result until only the base64 text is left. A saved result can be
    # a list of content blocks, [{"type": "text", "text": ...}]; an object whose "content"
    # field holds the tool's JSON, a list of content blocks, or the base64 itself; or the
    # base64 saved as a JSON string, in quotes. Base64 never starts with "[", "{" or a quote.
    try:
        data = raw.decode("utf-8-sig")  # utf-8-sig also reads a file that starts with a byte-order mark
    except UnicodeDecodeError:
        sys.exit(f"{path} is neither a PDF nor a saved download_file_content result; pass the saved result or a .pdf")
    while True:
        if isinstance(data, str):
            text = data.strip()
            if text[:1] not in ("[", "{", '"'):
                break
            try:
                data = json.loads(text)
            except ValueError:
                sys.exit(f"the saved result is not JSON: {text[:200]!r}")
        elif isinstance(data, list):
            parts = [b["text"] for b in data
                     if isinstance(b, dict) and b.get("type") == "text" and isinstance(b.get("text"), str)]
            if not parts:
                sys.exit("the saved result has no text block holding the PDF")
            # Blocks usually join into one JSON or base64 text. If they don't, as when a block
            # of prose comes first, use the first block that can hold the PDF.
            joined = "".join(parts)
            data = next((p for p in [joined] + parts if readable(p)), joined)
        elif isinstance(data, dict) and isinstance(data.get("content"), (str, list)):
            data = data["content"]
        else:
            sys.exit("no base64 PDF found in the saved result")
    if not text:
        sys.exit("the saved result has no text holding the PDF; export again with exportMimeType application/pdf")
    try:
        return b64decode(text)
    except (binascii.Error, ValueError):
        sys.exit(f"the saved result holds no base64 PDF; it starts {text[:80]!r}. If that text names the file "
                 "the result was saved to, pass that file; if it is an error, run download_file_content again "
                 "with exportMimeType application/pdf")


def main():
    if hasattr(sys.stdout, "reconfigure"):  # print UTF-8 even where the console default isn't
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("export")
    ap.add_argument("out_dir")
    ap.add_argument("--dpi", type=int, default=110)
    ap.add_argument("--pages", help="page range such as 2-4")
    args = ap.parse_args()

    if not shutil.which("pdftoppm"):
        sys.exit("pdftoppm (from poppler-utils) is not installed here, so the pages can't be rendered. "
                 "Check the file by reading it back instead, and tell the user the layout wasn't checked visually.")
    pdf = read_pdf_bytes(args.export)
    if not pdf.startswith(b"%PDF"):
        sys.exit("decoded content is not a PDF; was exportMimeType set to application/pdf?")
    os.makedirs(args.out_dir, exist_ok=True)
    pdf_path = os.path.join(args.out_dir, "export.pdf")
    with open(pdf_path, "wb") as f:
        f.write(pdf)
    cmd = ["pdftoppm", "-jpeg", "-r", str(args.dpi)]
    if args.pages:
        first, _, last = args.pages.partition("-")
        cmd += ["-f", first, "-l", last or first]
    # Render into a new folder so the pages this run wrote are exactly its contents, then move
    # them into OUT_DIR, replacing any pages of the same name from an earlier run.
    with tempfile.TemporaryDirectory(dir=args.out_dir) as tmp:
        done = subprocess.run(cmd + [pdf_path, os.path.join(tmp, "page")], capture_output=True, text=True)
        written = sorted(os.listdir(tmp))
        if done.returncode != 0 or not written:
            why = (done.stderr or done.stdout or "").strip()[-300:] or "it wrote no page images"
            hint = ((f"check that --pages {args.pages} is within the PDF's page count; if it is, " if args.pages else "")
                    + "check the file by reading it back instead, and tell the user the layout wasn't checked visually")
            sys.exit(f"pdftoppm could not render the pages ({why}); {hint}")
        for name in written:
            os.replace(os.path.join(tmp, name), os.path.join(args.out_dir, name))
            print(os.path.join(args.out_dir, name))


if __name__ == "__main__":
    main()
