#!/usr/bin/env python3
"""Find local third-party coding-agent session evidence by session id.

This helper is read-only. It prints JSON and never launches native resume
commands or modifies third-party session stores.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.parse
from pathlib import Path
from typing import Any


DEFAULT_MAX_ENTRIES = 50_000
DEFAULT_MAX_RESULTS = 12
DEFAULT_HEAD_BYTES = 4 * 1024
DEFAULT_TAIL_BYTES = 12 * 1024


class ScanBudget:
    def __init__(self, max_entries: int) -> None:
        self.remaining = max(0, max_entries)
        self.limit_hit = False

    def take(self) -> bool:
        if self.remaining <= 0:
            self.limit_hit = True
            return False
        self.remaining -= 1
        return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Find Claude Code, Codex, or Grok Build session evidence by id."
    )
    parser.add_argument("session_id", help="Native session id or id-like handle")
    parser.add_argument(
        "--source",
        choices=["auto", "cc", "claude", "claude-code", "codex", "grok", "grok-build"],
        default="auto",
        help="Limit the scan to one source.",
    )
    parser.add_argument(
        "--cwd",
        default=os.getcwd(),
        help="Workspace cwd used to prefer current-project session buckets.",
    )
    parser.add_argument(
        "--max-entries",
        type=int,
        default=DEFAULT_MAX_ENTRIES,
        help="Maximum directory entries to inspect across all roots.",
    )
    parser.add_argument(
        "--max-results",
        type=int,
        default=DEFAULT_MAX_RESULTS,
        help="Maximum candidates to print.",
    )
    parser.add_argument(
        "--snippets",
        action="store_true",
        help="Include bounded head/tail previews when there is a single best candidate.",
    )
    parser.add_argument(
        "--head-bytes",
        type=int,
        default=DEFAULT_HEAD_BYTES,
        help="Head bytes to include with --snippets.",
    )
    parser.add_argument(
        "--tail-bytes",
        type=int,
        default=DEFAULT_TAIL_BYTES,
        help="Tail bytes to include with --snippets.",
    )
    args = parser.parse_args()

    session_id = clean_session_id(args.session_id)
    if not session_id:
        print(
            json.dumps(
                {
                    "schema_version": 1,
                    "status": "invalid_id",
                    "error": "session_id is empty after trimming quotes and .jsonl suffix",
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 2

    cwd = Path(args.cwd).expanduser()
    budget = ScanBudget(args.max_entries)
    warnings: list[str] = []
    candidates: list[dict[str, Any]] = []
    sources = selected_sources(args.source)

    if "claude-code" in sources:
        candidates.extend(scan_claude_code(session_id, cwd, budget, warnings))
    if "codex" in sources:
        candidates.extend(scan_codex(session_id, cwd, budget, warnings))
    if "grok-build" in sources:
        candidates.extend(scan_grok_build(session_id, cwd, budget, warnings))

    candidates = ranked_candidates(candidates, args.max_results)
    if budget.limit_hit:
        warnings.append(
            f"scan stopped after {args.max_entries} directory entries; results may be incomplete"
        )

    if args.snippets:
        attach_snippets_when_unambiguous(
            candidates,
            warnings,
            max(0, args.head_bytes),
            max(0, args.tail_bytes),
        )

    output = {
        "schema_version": 1,
        "status": "ok",
        "session_id": session_id,
        "cwd": str(cwd),
        "source_filter": args.source,
        "sources_scanned": sources,
        "candidate_count": len(candidates),
        "candidates": candidates,
        "warnings": warnings,
        "bare_invocation_stop_rule": (
            "If the current prompt only invoked the import skill with "
            "this handle, do not run more tools after this evidence is enough; "
            "emit the resume checkpoint and ask before continuing."
        ),
        "next_step": next_step(candidates),
    }
    print(json.dumps(output, indent=2, sort_keys=True))
    return 0


def clean_session_id(raw: str) -> str:
    value = raw.strip().strip("'\"`")
    return value.removesuffix(".jsonl")


def selected_sources(source: str) -> list[str]:
    if source in {"cc", "claude", "claude-code"}:
        return ["claude-code"]
    if source == "codex":
        return ["codex"]
    if source in {"grok", "grok-build"}:
        return ["grok-build"]
    return ["claude-code", "codex", "grok-build"]


def scan_claude_code(
    session_id: str, cwd: Path, budget: ScanBudget, warnings: list[str]
) -> list[dict[str, Any]]:
    roots = claude_project_roots()
    slug = claude_project_slug(cwd)
    candidates: list[dict[str, Any]] = []
    seen: set[Path] = set()
    file_name = f"{session_id}.jsonl"

    for root in roots:
        direct = root / slug / file_name
        if direct.is_file():
            candidates.append(
                candidate(
                    source="claude-code",
                    path=direct,
                    path_type="file",
                    score=110,
                    reason="exact session file in current cwd project bucket",
                    evidence=[jsonl_evidence(direct, "transcript")],
                )
            )
            seen.add(direct)

    for root in roots:
        if not root.is_dir():
            warnings.append(f"claude-code root not found: {root}")
            continue
        for path in walk_files(root, budget, warnings):
            if path.name != file_name or path in seen:
                continue
            parent_score = 100 if path.parent.name == slug else 85
            reason = (
                "exact session file in current cwd project bucket"
                if path.parent.name == slug
                else "exact session file in another Claude Code project bucket"
            )
            candidates.append(
                candidate(
                    source="claude-code",
                    path=path,
                    path_type="file",
                    score=parent_score,
                    reason=reason,
                    evidence=[jsonl_evidence(path, "transcript")],
                )
            )
            seen.add(path)
    return candidates


def scan_codex(
    session_id: str, cwd: Path, budget: ScanBudget, warnings: list[str]
) -> list[dict[str, Any]]:
    del cwd
    candidates: list[dict[str, Any]] = []
    for root in codex_session_roots():
        if not root.is_dir():
            warnings.append(f"codex root not found: {root}")
            continue
        for path in walk_files(root, budget, warnings):
            name = path.name
            if session_id not in name:
                continue
            if not (name.endswith(".jsonl") or name.endswith(".jsonl.zst")):
                continue
            candidates.append(
                candidate(
                    source="codex",
                    path=path,
                    path_type="file",
                    score=75,
                    reason="session id appears in Codex rollout filename",
                    evidence=[jsonl_evidence(path, "rollout")],
                )
            )
    return candidates


def scan_grok_build(
    session_id: str, cwd: Path, budget: ScanBudget, warnings: list[str]
) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    cwd_bucket = urllib.parse.quote(str(cwd), safe="")
    for root in grok_session_roots():
        direct = root / cwd_bucket / session_id
        if direct.is_dir():
            candidates.append(
                grok_candidate(
                    direct,
                    score=105,
                    reason="exact session directory in current cwd bucket",
                )
            )
        if not root.is_dir():
            warnings.append(f"grok-build root not found: {root}")
            continue
        for path in walk_dirs(root, budget, warnings):
            if path.name != session_id or path == direct:
                continue
            candidates.append(
                grok_candidate(
                    path,
                    score=80,
                    reason="exact session directory in another Grok Build cwd bucket",
                )
            )
    return candidates


def claude_project_roots() -> list[Path]:
    roots: list[Path] = []
    config_dir = os.environ.get("CLAUDE_CONFIG_DIR")
    if config_dir:
        roots.append(Path(config_dir).expanduser() / "projects")
    home = user_home()
    if home is not None:
        roots.append(home / ".claude" / "projects")
    return dedupe(roots)


def codex_session_roots() -> list[Path]:
    roots: list[Path] = []
    codex_home = os.environ.get("CODEX_HOME")
    if codex_home:
        roots.append(Path(codex_home).expanduser() / "sessions")
    home = user_home()
    if home is not None:
        roots.append(home / ".codex" / "sessions")
    return dedupe(roots)


def grok_session_roots() -> list[Path]:
    roots: list[Path] = []
    grok_home = os.environ.get("GROK_HOME")
    if grok_home:
        roots.append(Path(grok_home).expanduser() / "sessions")
    home = user_home()
    if home is not None:
        roots.append(home / ".grok" / "sessions")
    return dedupe(roots)


def user_home() -> Path | None:
    try:
        return Path.home()
    except RuntimeError:
        return None


def dedupe(paths: list[Path]) -> list[Path]:
    result: list[Path] = []
    seen: set[str] = set()
    for path in paths:
        key = str(path)
        if key not in seen:
            seen.add(key)
            result.append(path)
    return result


def claude_project_slug(cwd: Path) -> str:
    return "".join(ch if ch.isascii() and ch.isalnum() else "-" for ch in str(cwd))


def walk_files(root: Path, budget: ScanBudget, warnings: list[str]):
    for path, is_dir, is_file in walk_entries(root, budget, warnings):
        if is_file:
            yield path
        elif is_dir:
            continue


def walk_dirs(root: Path, budget: ScanBudget, warnings: list[str]):
    for path, is_dir, is_file in walk_entries(root, budget, warnings):
        del is_file
        if is_dir:
            yield path


def walk_entries(root: Path, budget: ScanBudget, warnings: list[str]):
    stack = [root]
    while stack:
        directory = stack.pop()
        try:
            entries = list(os.scandir(directory))
        except OSError as error:
            warnings.append(f"cannot scan {directory}: {error}")
            continue
        for entry in entries:
            if not budget.take():
                return
            try:
                is_dir = entry.is_dir(follow_symlinks=False)
                is_file = entry.is_file(follow_symlinks=False)
            except OSError as error:
                warnings.append(f"cannot stat {entry.path}: {error}")
                continue
            path = Path(entry.path)
            yield path, is_dir, is_file
            if is_dir:
                stack.append(path)


def candidate(
    *,
    source: str,
    path: Path,
    path_type: str,
    score: int,
    reason: str,
    evidence: list[dict[str, Any]],
) -> dict[str, Any]:
    stat = safe_stat(path)
    return {
        "source": source,
        "path": str(path),
        "path_type": path_type,
        "score": score,
        "reason": reason,
        "modified_unix": stat.st_mtime if stat else None,
        "bytes": stat.st_size if stat and path_type == "file" else None,
        "evidence": evidence,
    }


def grok_candidate(path: Path, *, score: int, reason: str) -> dict[str, Any]:
    evidence = []
    for name, kind in [
        ("summary.json", "summary"),
        ("chat_history.jsonl", "chat_history"),
        ("events.jsonl", "events"),
        ("updates.jsonl", "updates"),
    ]:
        file_path = path / name
        if file_path.is_file():
            evidence.append(jsonl_evidence(file_path, kind))
    return candidate(
        source="grok-build",
        path=path,
        path_type="directory",
        score=score,
        reason=reason,
        evidence=evidence,
    )


def jsonl_evidence(path: Path, kind: str) -> dict[str, Any]:
    return {
        "path": str(path),
        "kind": kind,
        "read_order": ["tail", "head"],
        "read_hint": (
            "Read the last bounded tail first for latest state; read the first head "
            "only for metadata or original objective."
        ),
    }


def safe_stat(path: Path):
    try:
        return path.stat()
    except OSError:
        return None


def ranked_candidates(
    candidates: list[dict[str, Any]], max_results: int
) -> list[dict[str, Any]]:
    unique: dict[tuple[str, str], dict[str, Any]] = {}
    for item in candidates:
        key = (item["source"], item["path"])
        prior = unique.get(key)
        if prior is None or item["score"] > prior["score"]:
            unique[key] = item
    ranked = sorted(
        unique.values(),
        key=lambda item: (
            item["score"],
            item["modified_unix"] or 0,
            item["source"],
            item["path"],
        ),
        reverse=True,
    )
    for index, item in enumerate(ranked):
        item["rank"] = index + 1
    return ranked[: max(0, max_results)]


def attach_snippets_when_unambiguous(
    candidates: list[dict[str, Any]],
    warnings: list[str],
    head_bytes: int,
    tail_bytes: int,
) -> None:
    if not candidates:
        return
    if len(candidates) > 1 and candidates[0]["score"] <= candidates[1]["score"]:
        warnings.append("snippets omitted because candidates are ambiguous")
        return
    evidence = candidates[0].get("evidence") or []
    if not evidence:
        warnings.append("snippets omitted because the best candidate has no readable evidence file")
        return
    path = Path(evidence[0]["path"])
    if not path.is_file():
        warnings.append(f"snippets omitted because evidence path is not a file: {path}")
        return
    if path.suffix == ".zst":
        warnings.append(
            "snippets omitted for compressed rollout; decompress with `zstd -d` before reading"
        )
        return
    snippets = read_head_tail(path, head_bytes, tail_bytes)
    candidates[0]["snippets"] = snippets


def read_head_tail(path: Path, head_bytes: int, tail_bytes: int) -> dict[str, Any]:
    try:
        size = path.stat().st_size
        with path.open("rb") as handle:
            head = handle.read(head_bytes)
            tail_start = max(0, size - tail_bytes)
            handle.seek(tail_start)
            tail = handle.read(tail_bytes)
    except OSError as error:
        return {"status": "read_error", "error": str(error), "path": str(path)}
    return {
        "status": "ok",
        "path": str(path),
        "total_bytes": size,
        "head_bytes": len(head),
        "tail_bytes": len(tail),
        "omitted_middle_bytes": max(0, tail_start - len(head)),
        "head_preview": head.decode("utf-8", errors="replace"),
        "tail_preview_latest": tail.decode("utf-8", errors="replace"),
        "tail_messages_latest": extract_message_previews(tail, max_messages=12),
    }


def next_step(candidates: list[dict[str, Any]]) -> str:
    if not candidates:
        return "No candidate found. Ask the user for an explicit transcript path or a different source hint."
    if len(candidates) == 1:
        return "Use the candidate evidence, snippets, and tail_messages_latest. Emit a resume checkpoint first: source, objective, latest explicit user request, decisions, files, checks, blockers, and next step. A bare resume invocation is read-only recovery: stop after the checkpoint and ask before doing the next action. Do not run whole-file transcript parsers. Do not load follow-up task skills or inspect workspace, disk, git, or PR state for a bare invocation. Continue only when the current prompt explicitly asks to continue; if that request needs destructive changes, broad filesystem cleanup, live network/provider work, or long benchmarks, stop at the checkpoint and ask before running it."
    if candidates[0]["score"] > candidates[1]["score"]:
        return "Use rank 1 unless transcript evidence contradicts it; tail evidence is most important. Emit a resume checkpoint before continuing. A bare resume invocation is read-only recovery, and destructive, broad, live, or long-running work needs an explicit current-prompt request."
    return "Multiple candidates have the same confidence. Ask the user which path to use."


def extract_message_previews(data: bytes, max_messages: int) -> list[dict[str, Any]]:
    previews: list[dict[str, Any]] = []
    text = data.decode("utf-8", errors="replace")
    for line in text.splitlines():
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(obj, dict):
            continue
        preview = message_preview(obj)
        if preview:
            previews.append(preview)
    return previews[-max(0, max_messages) :]


def message_preview(obj: dict[str, Any]) -> dict[str, Any] | None:
    kind = str(obj.get("type") or obj.get("role") or "")
    role = str(obj.get("role") or "")
    timestamp = obj.get("timestamp") or obj.get("created_at") or obj.get("time")
    text = ""

    message = obj.get("message")
    if isinstance(message, dict):
        role = str(message.get("role") or role)
        text = content_to_text(message.get("content"))

    if not text:
        text = content_to_text(obj.get("content"))
    if not text and isinstance(obj.get("lastPrompt"), str):
        text = obj["lastPrompt"]

    text = " ".join(text.split())
    if not text:
        return None

    return {
        "type": kind or None,
        "role": role or None,
        "timestamp": timestamp,
        "text": text[:1200],
    }


def content_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                if isinstance(item.get("text"), str):
                    parts.append(item["text"])
                elif isinstance(item.get("content"), str):
                    parts.append(item["content"])
        return "\n".join(parts)
    if isinstance(content, dict):
        if isinstance(content.get("text"), str):
            return content["text"]
        if isinstance(content.get("content"), str):
            return content["content"]
    return ""


if __name__ == "__main__":
    sys.exit(main())
