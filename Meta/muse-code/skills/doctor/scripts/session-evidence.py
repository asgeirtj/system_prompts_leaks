#!/usr/bin/env python3
"""Bounded, redacted projections of retained Muse Code sessions."""

from __future__ import annotations

import argparse
import collections
import json
import os
import re
import shlex
import sys
from pathlib import Path
from typing import Iterable

SCHEMA_VERSION = 1
SESSION_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}")
SENSITIVE_KEY = re.compile(
    r"(?:api.?key|authorization|bearer|cookie|credential|password|secret|token)", re.I
)
SENSITIVE_TEXT = (
    re.compile(r"(?i)\bBearer\s+[^\s,;]+"),
    re.compile(
        r"(?i)\b(api[_-]?key|authorization|cookie|credential|password|secret|token)"
        r"(?:\\)?(\s*[\"']?\s*[:=]\s*)(?:\\)?"
    ),
)
PRIVATE_KEY_BLOCK = re.compile(
    r"-----BEGIN ([A-Z ]*PRIVATE KEY)-----.*?(?:-----END \1-----|\Z)", re.S
)
STANDALONE_SECRET = re.compile(
    r"(?<![A-Za-z0-9])(?:"
    r"sk[-_][A-Za-z0-9_-]{8,}|"
    r"gh[pousr]_[A-Za-z0-9_]{8,}|"
    r"github_pat_[A-Za-z0-9_]{8,}|"
    r"(?:AKIA|ASIA)[0-9A-Z]{12,}|"
    r"AIza[A-Za-z0-9_-]{20,}|"
    r"npm_[A-Za-z0-9_-]{8,}|"
    r"xox[baprs]-[A-Za-z0-9-]{8,}|"
    r"LLM\|[^\s,;]+|"
    r"eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}"
    r")(?![A-Za-z0-9])"
)
DIRECT_MUTATORS = {
    "apply_patch",
    "delete_file",
    "edit_file",
    "write_file",
}
SHELL_TOOLS = {"bash", "exec_command", "shell"}
SHELL_MUTATORS = {
    "cp",
    "git",
    "install",
    "mv",
    "rm",
    "rmdir",
    "sed",
    "tee",
    "truncate",
    "unlink",
}


class SelectionError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _emit(value: dict) -> None:
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def _error(code: str, message: str) -> int:
    _emit({"schema_version": SCHEMA_VERSION, "status": "error", "code": code, "message": message})
    return 2


def _canonical(path: Path) -> Path:
    return path.expanduser().resolve(strict=False)


def _matches_workspace(metadata: str, workspace: Path) -> bool:
    return _canonical(workspace).is_relative_to(_canonical(Path(metadata)))


def _session_root(data_root: Path) -> Path:
    return data_root.expanduser().absolute() / "muse" / "sessions"


def _workspace_metadata(path: Path) -> str | None:
    latest: str | None = None
    try:
        with path.open("r", encoding="utf-8", errors="replace") as handle:
            for line in handle:
                try:
                    record = json.loads(line)
                except (ValueError, UnicodeError):
                    continue
                if not isinstance(record, dict):
                    continue
                payload = record.get("payload")
                if not isinstance(payload, dict):
                    continue
                workspace_root: object = None
                if record.get("payload_type") == "runtime.session.metadata":
                    workspace_root = payload.get("workspace_root")
                    nested = payload.get("record")
                    if not isinstance(workspace_root, str) and isinstance(nested, dict):
                        workspace_root = nested.get("workspace_root")
                    latest = workspace_root if isinstance(workspace_root, str) else None
                elif record.get("payload_type") == "runtime.session":
                    event = payload.get("event")
                    if (
                        isinstance(event, dict)
                        and event.get("kind") == "context_projection_checkpoint"
                    ):
                        checkpoint_metadata = event.get("session_metadata")
                        if isinstance(checkpoint_metadata, dict):
                            workspace_root = checkpoint_metadata.get("workspace_root")
                            latest = (
                                workspace_root if isinstance(workspace_root, str) else None
                            )
    except OSError:
        return None
    return latest


def _select_by_id(session_id: str, data_root: Path, workspace: Path) -> Path:
    if not SESSION_ID.fullmatch(session_id):
        raise SelectionError("invalid_session_id", "Session id contains unsupported characters")
    root = _session_root(data_root)
    if not root.is_dir():
        raise SelectionError("session_not_found", "No retained session root exists under the data directory")
    candidates: list[Path] = []
    for directory, _dirnames, filenames in os.walk(root):
        path = Path(directory)
        if path.name != session_id or "session.jsonl" not in filenames:
            continue
        relative = path.relative_to(root)
        if "subagent" not in relative.parts:
            candidates.append(path / "session.jsonl")
    if not candidates:
        raise SelectionError("session_not_found", f"No retained session matches id {session_id!r}")
    matches: list[Path] = []
    unknown = 0
    mismatched = 0
    for candidate in sorted(candidates):
        metadata = _workspace_metadata(candidate)
        if metadata is None:
            unknown += 1
        elif _matches_workspace(metadata, workspace):
            matches.append(candidate)
        else:
            mismatched += 1
    if len(matches) > 1:
        raise SelectionError("session_ambiguous", "More than one retained session id matches this workspace")
    if len(matches) == 1:
        return matches[0]
    if unknown:
        raise SelectionError(
            "session_workspace_unknown",
            "The selected earlier session has no durable workspace metadata",
        )
    if mismatched:
        raise SelectionError(
            "session_workspace_mismatch",
            "The selected earlier session belongs to another workspace",
        )
    raise SelectionError("session_not_found", f"No retained session matches id {session_id!r}")


def _select(args: argparse.Namespace) -> tuple[Path, str]:
    validate_workspace = False
    if args.session_log:
        path = Path(args.session_log).expanduser().absolute()
        mode = "current_path"
        validate_workspace = True
    elif args.session_id:
        data_root = Path(args.data_root) if args.data_root else _default_data_root()
        path = _select_by_id(args.session_id, data_root, Path(args.workspace))
        mode = "explicit_id"
    else:
        current = os.environ.get("MUSE_CURRENT_SESSION_LOG")
        if not current:
            raise SelectionError(
                "current_session_required",
                "Pass the startup-injected current session log or an explicit earlier session id/path",
            )
        path = Path(current).expanduser().absolute()
        mode = "current_env"
    if not path.is_file():
        raise SelectionError("session_log_unavailable", f"Session log is unavailable: {path}")
    if validate_workspace:
        metadata = _workspace_metadata(path)
        if metadata is None:
            raise SelectionError(
                "session_workspace_unknown",
                "The selected session path has no durable workspace metadata",
            )
        if not _matches_workspace(metadata, Path(args.workspace)):
            raise SelectionError(
                "session_workspace_mismatch",
                "The selected session path belongs to another workspace",
            )
    return path, mode


def _default_data_root() -> Path:
    value = os.environ.get("XDG_DATA_HOME")
    return Path(value) if value else Path.home() / ".local" / "share"


def _event(record: dict) -> dict:
    payload = record.get("payload")
    if not isinstance(payload, dict):
        return {}
    event = payload.get("event")
    return event if isinstance(event, dict) else {}


def _tool_name(value: object) -> str:
    if not isinstance(value, str):
        return ""
    name = value
    for separator in ("__", ".", "/"):
        if separator in name:
            name = name.rsplit(separator, 1)[-1]
    return name


def _args(value: object) -> dict | str:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except ValueError:
            return "[REDACTED]"
        return parsed if isinstance(parsed, dict) else "[REDACTED]"
    return {}


def _truncate(text: str, maximum: int, omissions: dict) -> str:
    encoded = text.encode("utf-8")
    if len(encoded) <= maximum:
        return text
    omissions["text_truncations"] += 1
    return encoded[:maximum].decode("utf-8", errors="ignore") + "…[truncated]"


def _sensitive_value_end(text: str, start: int) -> int:
    if start >= len(text):
        return start
    opener = text[start]
    if opener in "{[":
        closers = {"{": "}", "[": "]"}
        stack = [closers[opener]]
        quote: str | None = None
        escaped = False
        for index in range(start + 1, len(text)):
            character = text[index]
            if quote is not None:
                if escaped:
                    escaped = False
                elif character == "\\":
                    escaped = True
                elif character == quote:
                    quote = None
            elif character in "\"'":
                quote = character
            elif character in closers:
                stack.append(closers[character])
            elif character == stack[-1]:
                stack.pop()
                if not stack:
                    return index + 1
        return len(text)
    if opener in "\"'":
        if start > 0 and text[start - 1] == "\\":
            index = start + 1
            inner_escaped = False
            # JSON encoding adds one escape layer: scan `\x` units and close on
            # `\<opener>` unless preceded by `\\`; no closer redacts to the end.
            while index < len(text):
                if text[index] == "\\" and index + 1 < len(text):
                    unit = text[index + 1]
                    index += 2
                    if inner_escaped:
                        inner_escaped = False
                    elif unit == "\\":
                        inner_escaped = True
                    elif unit == opener:
                        return index
                else:
                    index += 1
                    inner_escaped = False
            return len(text)
        escaped = False
        for index in range(start + 1, len(text)):
            character = text[index]
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == opener:
                return index + 1
        return len(text)
    end = start
    while end < len(text) and text[end] not in "\t\r\n ,;":
        end += 1
    return end


def _redact_sensitive_values(text: str) -> str:
    parts: list[str] = []
    position = 0
    while match := SENSITIVE_TEXT[1].search(text, position):
        parts.extend(
            (text[position : match.start()], match.group(1), match.group(2), "[REDACTED]")
        )
        position = _sensitive_value_end(text, match.end())
    parts.append(text[position:])
    return "".join(parts)


def _redact_text(text: str, maximum: int, omissions: dict) -> str:
    redacted = PRIVATE_KEY_BLOCK.sub("[REDACTED]", text)
    redacted = SENSITIVE_TEXT[0].sub("Bearer [REDACTED]", redacted)
    redacted = _redact_sensitive_values(redacted)
    redacted = STANDALONE_SECRET.sub("[REDACTED]", redacted)
    return _truncate(redacted, maximum, omissions)


def _sanitize(value: object, maximum: int, omissions: dict, key: str = "") -> object:
    if SENSITIVE_KEY.search(key):
        return "[REDACTED]"
    if isinstance(value, str):
        return _redact_text(value, maximum, omissions)
    if isinstance(value, dict):
        return {
            str(child_key): _sanitize(child_value, maximum, omissions, str(child_key))
            for child_key, child_value in value.items()
        }
    if isinstance(value, list):
        return [_sanitize(item, maximum, omissions) for item in value]
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    return _redact_text(str(value), maximum, omissions)


def _summary(value: object, maximum: int, omissions: dict) -> str:
    sanitized = _sanitize(value, maximum, omissions)
    if isinstance(sanitized, str):
        return sanitized
    return _truncate(
        json.dumps(sanitized, sort_keys=True, separators=(",", ":")), maximum, omissions
    )


def _path_from_args(args: dict) -> str | None:
    for key in ("path", "file_path", "target_path", "target", "filename"):
        value = args.get(key)
        if isinstance(value, str):
            return value
    patch = args.get("patch") or args.get("input")
    if isinstance(patch, str):
        match = re.search(r"^\*\*\* (?:Add|Update|Delete) File: (.+)$", patch, re.M)
        if match:
            return match.group(1)
    return None


def _shell_segments(command: str) -> list[list[str]]:
    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|")
        lexer.whitespace_split = True
        lexer.commenters = "#"
        tokens = list(lexer)
    except ValueError:
        return []
    segments: list[list[str]] = []
    current: list[str] = []
    for token in tokens:
        if token and all(character in ";|&" for character in token):
            if current:
                segments.append(current)
                current = []
        else:
            current.append(token)
    if current:
        segments.append(current)
    return segments


def _shell_segment_mutation(tokens: list[str]) -> tuple[bool, str | None]:
    if not tokens:
        return False, None
    start = 0
    while start < len(tokens) and "=" in tokens[start] and not tokens[start].startswith(("/", "./")):
        start += 1
    if start >= len(tokens):
        return False, None
    executable = Path(tokens[start]).name
    if executable not in SHELL_MUTATORS:
        return False, None
    args = tokens[start + 1 :]
    if executable == "git":
        index = 0
        git_workspace: str | None = None
        while index < len(args):
            token = args[index]
            if token in {"-C", "-c", "--git-dir", "--work-tree", "--namespace"}:
                if token == "-C" and index + 1 < len(args):
                    git_workspace = args[index + 1]
                index += 2
            elif token.startswith(("--git-dir=", "--work-tree=", "--namespace=")):
                index += 1
            elif token.startswith("-"):
                index += 1
            else:
                break
        if index >= len(args):
            return False, None
        operation = args[index]
        if operation == "worktree":
            remainder = args[index + 1 :]
            subcommand = next(
                (token for token in remainder if not token.startswith("-")), None
            )
            if subcommand != "remove":
                return False, None
            operands = [
                token
                for token in remainder[remainder.index(subcommand) + 1 :]
                if token != "--" and not token.startswith("-")
            ]
            return True, operands[-1] if operands else git_workspace
        if operation == "switch":
            if not any(
                token in {"--discard-changes", "--force", "-f"}
                for token in args[index + 1 :]
            ):
                return False, None
        elif operation not in {"checkout", "clean", "reset", "restore", "rm"}:
            return False, None
        operands = [
            token
            for token in args[index + 1 :]
            if token != "--" and not token.startswith("-")
        ]
        return True, operands[-1] if operands else git_workspace
    operands = [token for token in args if token != "--" and not token.startswith("-")]
    path = operands[-1] if operands else None
    return True, path


def _shell_mutation(command: str) -> tuple[bool, str | None]:
    for segment in _shell_segments(command):
        mutation, path = _shell_segment_mutation(segment)
        if mutation:
            return mutation, path
    return False, None


def _base_event(record: dict, source: str, kind: str, run_id: str | None) -> dict:
    value = {
        "source": source,
        "sequence": record.get("sequence"),
        "recorded_at": record.get("recorded_at"),
        "run_id": run_id,
        "kind": kind,
    }
    stream = record.get("stream")
    if isinstance(stream, dict):
        value["stream"] = {
            key: stream[key]
            for key in ("id", "kind")
            if isinstance(stream.get(key), (str, int))
        }
    elif isinstance(stream, str):
        value["stream"] = {"id": stream}
    return value


def _project(
    record: dict,
    source: str,
    maximum: int,
    omissions: dict,
    call_tools: collections.OrderedDict[tuple[str, str], str],
) -> list[dict]:
    payload = record.get("payload")
    if not isinstance(payload, dict):
        return []
    payload_type = str(record.get("payload_type") or "")
    event = _event(record)
    payload_kind = str(payload.get("kind") or "")
    kind = str(event.get("kind") or payload_kind)
    run_id = payload.get("run_id") or event.get("run_id")
    run_id = run_id if isinstance(run_id, str) else None
    projected: list[dict] = []

    if kind == "started" and payload_kind == "run":
        prompt = event.get("prompt")
        if isinstance(prompt, str):
            item = _base_event(record, source, "user_message", run_id)
            item["summary"] = _redact_text(prompt, maximum, omissions)
            projected.append(item)
        item = _base_event(record, source, "run", run_id)
        item["summary"] = "run started"
        projected.append(item)
    elif kind == "assistant_message_committed":
        item = _base_event(record, source, "assistant_message", run_id)
        item["summary"] = _summary(event.get("text", ""), maximum, omissions)
        projected.append(item)
    elif kind == "assistant_tool_calls_committed":
        for call in event.get("tool_calls") or []:
            if not isinstance(call, dict):
                continue
            tool = _tool_name(call.get("name"))
            call_args = call.get("args")
            args = _args(call_args)
            if isinstance(args, str):
                args = {"raw_args": args}
            call_id = call.get("call_id") or call.get("id")
            call_id = call_id if isinstance(call_id, str) else None
            path = _path_from_args(args)
            item = _base_event(record, source, "tool_call", run_id)
            item.update({"tool": tool, "summary": _summary(args, maximum, omissions)})
            if call_id is not None:
                item["call_id"] = call_id
                call_tools[(source, call_id)] = tool
                call_tools.move_to_end((source, call_id))
                if len(call_tools) > 4096:
                    call_tools.popitem(last=False)
            if path is not None:
                item["path"] = _redact_text(path, maximum, omissions)
            projected.append(item)
            mutation = tool in DIRECT_MUTATORS
            if tool in SHELL_TOOLS:
                command = args.get("cmd") or args.get("command")
                if not command and isinstance(call_args, str):
                    command = call_args
                if isinstance(command, str):
                    mutation, shell_path = _shell_mutation(command)
                    path = shell_path or path
            if mutation:
                changed = _base_event(record, source, "file_mutation", run_id)
                changed.update({"tool": tool, "summary": item["summary"]})
                if call_id is not None:
                    changed["call_id"] = call_id
                if path is not None:
                    changed["path"] = _redact_text(path, maximum, omissions)
                projected.append(changed)
    elif kind in {
        "tool_result",
        "tool_result_batch_committed",
        "tool_results_committed",
        "tool_result_committed",
    }:
        results = event.get("results")
        if not isinstance(results, list):
            results = [event]
        for result in results:
            if not isinstance(result, dict):
                continue
            text = result.get("text") or result.get("output") or result.get("result") or ""
            call_id = result.get("tool_call_id") or result.get("call_id")
            call_id = call_id if isinstance(call_id, str) else None
            item = _base_event(record, source, "tool_result", run_id)
            item["summary"] = _summary(text, maximum, omissions)
            if call_id is not None:
                item["call_id"] = call_id
                tool = call_tools.get((source, call_id))
                if tool is not None:
                    item["tool"] = tool
            projected.append(item)
    elif "compaction" in kind:
        item = _base_event(record, source, "compaction", run_id)
        item["summary"] = _summary(event, maximum, omissions)
        projected.append(item)
    elif (
        "approval" in kind.lower()
        or "approval" in payload_kind.lower()
        or "approval" in payload_type.lower()
    ):
        item = _base_event(record, source, "approval", run_id)
        approval = dict(event or payload)
        if "raw_args" in approval:
            approval["raw_args"] = _args(approval["raw_args"])
        item["summary"] = _summary(approval, maximum, omissions)
        projected.append(item)
    elif kind == "terminal":
        item = _base_event(record, source, "run", run_id)
        item["summary"] = f"run {event.get('terminal', 'terminal')}"
        projected.append(item)

    if "subagent" in payload_type.lower() or "subagent" in kind.lower():
        item = _base_event(record, source, "subagent", run_id)
        item["summary"] = _summary(event or payload, maximum, omissions)
        projected.append(item)
    return projected


def _sources(session_log: Path, include_subagents: bool) -> Iterable[tuple[str, Path]]:
    yield "main", session_log
    if not include_subagents:
        return
    root = session_log.parent / "subagent"
    if not root.is_dir():
        return
    for directory, dirnames, filenames in os.walk(root):
        dirnames.sort()
        if "session.jsonl" not in filenames:
            continue
        path = Path(directory) / "session.jsonl"
        relative = path.parent.relative_to(root).as_posix()
        yield f"subagent/{relative}", path


def _matches(event: dict, args: argparse.Namespace) -> bool:
    if args.kind and event.get("kind") != args.kind:
        return False
    if args.path and args.path not in str(event.get("path") or ""):
        return False
    if args.tool and event.get("tool") != _tool_name(args.tool):
        return False
    if args.run_id and event.get("run_id") != args.run_id:
        return False
    sequence = event.get("sequence")
    if args.from_sequence is not None and (not isinstance(sequence, int) or sequence < args.from_sequence):
        return False
    if args.to_sequence is not None and (not isinstance(sequence, int) or sequence > args.to_sequence):
        return False
    return True


def _read_projection(session_log: Path, args: argparse.Namespace) -> tuple[list[dict], dict, dict]:
    omissions = {
        "events_before_limit": 0,
        "output_byte_cap_unsatisfied": False,
        "output_events_dropped": 0,
        "selection_fields_truncated": 0,
        "text_truncations": 0,
        "unreadable_sources": 0,
        "subagents_excluded": not args.include_subagents,
    }
    bounds = {
        "records_read": 0,
        "malformed_lines": 0,
        "matched_events": 0,
        "truncated": False,
    }
    main_events: collections.deque[dict] = collections.deque(maxlen=args.limit)
    child_events: collections.deque[dict] = collections.deque(maxlen=args.limit)
    call_tools: collections.OrderedDict[tuple[str, str], str] = collections.OrderedDict()
    for source, path in _sources(session_log, args.include_subagents):
        try:
            handle = path.open("r", encoding="utf-8", errors="replace")
        except OSError:
            omissions["unreadable_sources"] += 1
            continue
        with handle:
            for line in handle:
                try:
                    record = json.loads(line)
                except (ValueError, UnicodeError):
                    bounds["malformed_lines"] += 1
                    continue
                if not isinstance(record, dict):
                    bounds["malformed_lines"] += 1
                    continue
                bounds["records_read"] += 1
                for event in _project(
                    record, source, args.max_text_bytes, omissions, call_tools
                ):
                    if not _matches(event, args):
                        continue
                    bounds["matched_events"] += 1
                    target = main_events if source == "main" else child_events
                    target.append(event)
    main = list(main_events)
    children = list(child_events)
    if not main:
        events = children[-args.limit :]
    elif not children:
        events = main[-args.limit :]
    else:
        main_count = min(len(main), max(1, args.limit // 2))
        child_count = min(len(children), args.limit - main_count)
        remaining = args.limit - main_count - child_count
        if remaining:
            extra_main = min(remaining, len(main) - main_count)
            main_count += extra_main
            remaining -= extra_main
        if remaining:
            child_count += min(remaining, len(children) - child_count)
        events = (main[-main_count:] if main_count else []) + (
            children[-child_count:] if child_count else []
        )
    omissions["events_before_limit"] = max(0, bounds["matched_events"] - len(events))
    bounds["truncated"] = bool(
        omissions["events_before_limit"] or omissions["text_truncations"]
    )
    return list(events), bounds, omissions


def _bounded_output(payload: dict, maximum: int) -> bytes:
    while True:
        encoded = (json.dumps(payload, sort_keys=True, separators=(",", ":")) + "\n").encode()
        if len(encoded) <= maximum:
            return encoded
        marker = "[omitted]"
        selection_truncated = False
        for key in ("session_log", "workspace", "session_id"):
            value = payload["selection"].get(key)
            if isinstance(value, str) and len(value) > len(marker):
                payload["selection"][key] = marker
                payload["omissions"]["selection_fields_truncated"] += 1
                payload["bounds"]["truncated"] = True
                selection_truncated = True
                break
        if selection_truncated:
            continue
        if not payload["events"]:
            return encoded
        main_indices = [
            index
            for index, event in enumerate(payload["events"])
            if event.get("source") == "main"
        ]
        child_indices = [
            index
            for index, event in enumerate(payload["events"])
            if event.get("source") != "main"
        ]
        if len(main_indices) <= 1 and len(child_indices) <= 1:
            compacted = False
            for event in payload["events"]:
                for key in ("run_id", "call_id", "path", "summary"):
                    value = event.get(key)
                    if isinstance(value, str) and len(value) > len(marker):
                        event[key] = marker
                        payload["omissions"]["text_truncations"] += 1
                        compacted = True
                stream = event.get("stream")
                if isinstance(stream, dict):
                    value = stream.get("id")
                    if isinstance(value, str) and len(value) > len(marker):
                        stream["id"] = marker
                        payload["omissions"]["text_truncations"] += 1
                        compacted = True
            if compacted:
                payload["bounds"]["truncated"] = True
                continue
        if len(child_indices) > len(main_indices) and len(child_indices) > 1:
            drop_index = child_indices[0]
        elif len(main_indices) > 1:
            drop_index = main_indices[0]
        elif len(child_indices) > 1:
            drop_index = child_indices[0]
        else:
            payload["omissions"]["output_byte_cap_unsatisfied"] = True
            payload["bounds"]["truncated"] = True
            return (
                json.dumps(payload, sort_keys=True, separators=(",", ":")) + "\n"
            ).encode()
        payload["events"].pop(drop_index)
        payload["omissions"]["output_events_dropped"] += 1
        payload["bounds"]["truncated"] = True


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    selector = parser.add_mutually_exclusive_group()
    selector.add_argument("--session-log")
    selector.add_argument("--session-id")
    parser.add_argument("--data-root")
    parser.add_argument("--workspace", default=os.getcwd())
    parser.add_argument("--kind")
    parser.add_argument("--path")
    parser.add_argument("--tool")
    parser.add_argument("--run-id")
    parser.add_argument("--from-sequence", type=int)
    parser.add_argument("--to-sequence", type=int)
    parser.add_argument("--limit", type=int, default=200)
    parser.add_argument("--max-text-bytes", type=int, default=2048)
    parser.add_argument("--max-output-bytes", type=int, default=131072)
    parser.add_argument("--no-subagents", dest="include_subagents", action="store_false")
    parser.set_defaults(include_subagents=True)
    return parser


def main(argv: list[str]) -> int:
    parser = _parser()
    args = parser.parse_args(argv)
    if args.limit < 1 or args.max_text_bytes < 16 or args.max_output_bytes < 1024:
        return _error("invalid_bound", "Bounds must be positive and max output must be at least 1024 bytes")
    try:
        session_log, mode = _select(args)
    except SelectionError as error:
        return _error(error.code, error.message)
    events, bounds, omissions = _read_projection(session_log, args)
    payload = {
        "schema_version": SCHEMA_VERSION,
        "status": "ok",
        "selection": {
            "mode": mode,
            "session_id": session_log.parent.name,
            "session_log": str(session_log),
            "workspace": str(_canonical(Path(args.workspace))),
        },
        "bounds": bounds,
        "omissions": omissions,
        "events": events,
    }
    sys.stdout.buffer.write(_bounded_output(payload, args.max_output_bytes))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
