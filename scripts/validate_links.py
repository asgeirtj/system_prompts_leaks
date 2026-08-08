#!/usr/bin/env python3
import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
link_pattern = re.compile(r'(?<!\!)\[[^\]]+\]\(([^)]+)\)')

PLACEHOLDERS = {
    "url",
    "link",
    "href",
    "file",
    "file.md",
    "file.txt",
    "file.py",
    "absolute",
    "localhost",
}
LOCAL_EXTENSIONS = (".md", ".txt", ".py", ".json", ".yaml", ".yml", ".html", ".png", ".jpg", ".jpeg", ".gif", ".svg")


def should_skip(raw: str) -> bool:
    if not raw:
        return True
    value = raw.strip().lower()
    if value.startswith(("http://", "https://", "mailto:", "tel:", "data:", "#")):
        return True
    if value.startswith(("sandbox:", "container:", "claim:", "citation:", "file://", "app://")):
        return True
    if value.startswith(("/users/", "/abs/", "/absolute", "/mnt/", "c:/", "c\\")):
        return True
    if value.startswith(("examples/", "./cli/", "../cli/", "sandbox/")):
        return True
    if value.startswith(("url?", "url#", "url/")):
        return True
    if "cite" in value and "reference" in value:
        return True
    if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', value):
        return True
    if "{" in value or "}" in value:
        return True
    if value in PLACEHOLDERS:
        return True
    if value.startswith(("file.", "url.", "link.")) and value.endswith(LOCAL_EXTENSIONS):
        return True
    if "[" in value or "]" in value:
        return True
    if "/" not in value and "." in value and not value.endswith(LOCAL_EXTENSIONS):
        return True
    return False


def normalize_link(raw: str):
    raw = raw.strip()
    if not raw:
        return None
    if raw.startswith("<") and raw.endswith(">"):
        raw = raw[1:-1].strip()
    if " " in raw and not raw.startswith(("./", "../", "/", "~")):
        raw = raw.split()[0]
    if should_skip(raw):
        return None
    return raw


def validate_file(path: Path):
    text = path.read_text(encoding="utf-8")
    missing = []
    for raw in link_pattern.findall(text):
        link = normalize_link(raw)
        if not link:
            continue
        target = unquote(link.split("#", 1)[0])
        if not target:
            continue
        resolved = (path.parent / target).resolve()
        if not resolved.exists():
            missing.append(link)
    return missing


def main():
    md_files = [p for p in ROOT.rglob("*.md") if ".git" not in p.parts]
    errors = []
    for md_file in md_files:
        missing = validate_file(md_file)
        if missing:
            errors.append((md_file.relative_to(ROOT).as_posix(), missing))
    if errors:
        print("Broken markdown links found:")
        for rel_path, missing in errors:
            print(f"- {rel_path}")
            for link in missing:
                print(f"  • {link}")
        sys.exit(1)
    print(f"Validated {len(md_files)} markdown files with no broken relative links.")


if __name__ == "__main__":
    main()
