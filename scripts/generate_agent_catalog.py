#!/usr/bin/env python3
import argparse
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]

SECTIONS = [
    (
        "Claude Code & Anthropic agents",
        [
            Path("Anthropic/Claude Code/agents"),
            Path("Anthropic/Claude Code"),
        ],
    ),
    (
        "OpenAI agentic systems",
        [
            Path("OpenAI/Codex"),
            Path("OpenAI/ChatGPT"),
        ],
    ),
    (
        "Microsoft Copilot and agent experiences",
        [
            Path("Microsoft"),
        ],
    ),
    (
        "Google agentic tools",
        [
            Path("Google"),
        ],
    ),
    (
        "xAI and Grok agent builds",
        [
            Path("xAI"),
        ],
    ),
    (
        "Other AI-native agent tools",
        [
            Path("Misc"),
        ],
    ),
]

SKIP_DIRS = {"old", "raw", ".git", ".github"}
SKIP_FILES = {"README.md", "readme.md"}


def read_title(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
    if path.name == "README.md":
        return path.parent.name
    title = path.stem.replace("-", " ").replace("_", " ")
    return " ".join(part.capitalize() for part in title.split())


def collect_files(base_dir: Path):
    if not base_dir.exists():
        return []
    files = []
    for path in sorted(base_dir.rglob("*.md")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name in SKIP_FILES:
            continue
        if path.is_dir():
            continue
        files.append(path)
    return files


def render_catalog(root: Path) -> str:
    lines = [
        "# AI agent catalog",
        "",
        "This file is generated automatically from the prompt archive and reflects the agentic systems and agent-oriented prompts available in the repository.",
        "",
        "## How to use it",
        "",
        "- Browse the agent-oriented prompts and subagent definitions.",
        "- Use the linked files directly for research, comparison, or prompt auditing.",
        "- Re-run the generator after adding new prompt files to refresh the catalog.",
        "",
        "> The catalog is intended to be a practical navigation layer for the repository, not a replacement for reading the original prompt files.",
        "",
    ]

    for title, directories in SECTIONS:
        files = []
        for directory in directories:
            files.extend(collect_files(root / directory))

        files = sorted({path.resolve(): path for path in files}.values(), key=lambda p: p.as_posix())
        if not files:
            continue

        lines.append(f"## {title}")
        lines.append("")
        for path in files:
            rel_path = path.relative_to(root).as_posix()
            title_text = read_title(path)
            lines.append(f"- [{title_text}]({quote(rel_path)})")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main():
    parser = argparse.ArgumentParser(description="Generate an agent catalog markdown file")
    parser.add_argument("--root", default=str(ROOT), help="Repository root")
    parser.add_argument("--output", default="AGENT_CATALOG.md", help="Path to the generated markdown file")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    output = root / args.output if not Path(args.output).is_absolute() else Path(args.output)
    output.write_text(render_catalog(root), encoding="utf-8")
    print(f"Wrote {output.relative_to(root).as_posix()}")


if __name__ == "__main__":
    main()
