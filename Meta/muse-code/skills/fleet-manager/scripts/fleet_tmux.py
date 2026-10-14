"""The tmux provider: sessions on a machine that has no Herdr (or when
`--mode tmux` says so).

tmux knows liveness, scrollback, and a keyboard — nothing about an agent's
state or its dialogs. So a tmux session gets exactly: `list`/`context`
rows (liveness, recent activity), `read` (scrollback), `send --type`
(guarded input: never typed over a non-empty composer), `open`, `stop`
(ctrl-c), `close` (kill-session, refused while a program is still running
unless `--confirm`), and `status` (the identity tuple). Every other verb
answers `unsupported_by_provider` with the verb that does work.

Commands run on the local host directly or on a remote machine down the
execution ladder (`fleet_remote.run_remote`), never through a fresh ssh
login. FLEET_MANAGER_TMUX_SOCKET names a private tmux server (`-L`), so
tests and black-box runs never touch the user's own sessions.
"""

from __future__ import annotations

import os
import re
import secrets
import shlex
import shutil
import time

from fleet_contract import AUTOMATED_MARKER, TMUX_CAPABILITIES, Refused, Unreachable, Unsupported, Usage, now, receipt
from fleet_remote import run_remote

CAPABILITIES = TMUX_CAPABILITIES


def server_label() -> str:
    return os.environ.get("FLEET_MANAGER_TMUX_SOCKET") or "default"


def identity_of(machine: dict | None, row: dict) -> dict:
    return {"provider": "tmux", "machine": machine_label(machine), "server": server_label(), "ref": row["ref"], "cwd": row["cwd"], "engine": row["engine"]}
UNSUPPORTED_NEXT = {
    "dialog": "tmux has no dialog model; `read <ref>` shows the screen and `send <ref> <text> --type` types a guarded line",
    "approve": "tmux has no dialog model; `read <ref>`, then `send <ref> y --type` types the answer as a guarded line",
    "deny": "tmux has no dialog model; `read <ref>`, then `send <ref> n --type` types the answer as a guarded line",
    "send --keys": "tmux input is guarded plain text only: `send <ref> <text> --type`",
    "events": "tmux pushes no events; poll `context` (its cadence is fixed) or `list <label>`",
    "wait": "tmux exposes liveness only: poll `status <ref>`",
    "attach": "`attach <ref>` prints the tmux attach command",
    "open --worktree": "tmux has no worktree model; create the worktree yourself, then `open --cwd <path>`",
    "open --label": "tmux sessions have one name: use `open --name <name>`",
}
SHELLS = {"bash", "zsh", "sh", "fish", "dash", "ksh", "tcsh", "csh", "login", "-bash", "-zsh"}
PROMPT_CHARS = "❯⟩›>$%#"   # Muse ❯, Codex ›, Claude/shells >
# Muse draws one of these dim tips inside an EMPTY composer a few seconds after a turn settles
# (crates/tui/src/state/prompt_hint.rs); a capture returns it as plain text. The same list as host-manager's
# lane_runtime.py (the two skills are separate packages; `fleet_manager_package.rs` pins both to the TUI table).
PROMPT_HINT_GHOSTS = (
    'Type @ to search and insert workspace file paths',
    'Start a message with ! to run a shell command yourself',
    'Paste an image with Ctrl+V — file paths and URLs work too',
    'Press Alt+V to dictate instead of typing',
    'Alt+Enter queues or steers while a run is active',
    'Press ? on an empty composer to see keyboard shortcuts',
    'Press Ctrl+O to expand collapsed tool output',
    '/side asks a quick question without touching this thread',
    '/fork branches the conversation from the latest point',
    '/goal pins a session objective with a progress bar',
    '/resume reopens a past session (--last for the latest)',
    "Ask to 'use a workflow' to fan out parallel agents on big tasks",
    "Say 'use a workflow' to fan out agents on big tasks",
    'Ask to monitor a running build or log and get pinged on changes',
    '/agent opens the subagent command center',
    '/tasks shows workflows, subagents and terminals in one place',
    '/loop 10m <prompt> schedules a recurring prompt',
    'Ctrl+B sends the selected task to the background queue',
    '/skills browses ready-made skills for repeatable procedures',
    '/plugins marketplace installs new commands and skills',
    '/effort adjusts reasoning depth vs speed',
    "/usage shows this session's token usage",
    '/export saves the conversation to a text file',
)
STRIPPED_ENV = ("HERDR_ENV", "HERDR_PANE_ID", "HERDR_SOCKET_PATH", "HERDR_BIN_PATH", "TMUX", "TMUX_PANE")   # a session is nobody's pane
MUSE_ENGINES = {"muse", "tbh"}
POSTURE_FLAG = "--yolo"   # only with `open --unattended` (owner ruling 2026-09-19, #38715): a session defaults to the engine's normal permission prompts


def tmux_bin() -> str | None:
    return os.environ.get("FLEET_MANAGER_TMUX_BIN") or shutil.which("tmux")


def server_argv() -> list[str]:
    """The tmux binary plus the private socket: what a human types to attach (attaching never starts a server)."""
    argv = [os.environ.get("FLEET_MANAGER_TMUX_BIN") or "tmux"]   # the bare name: the remote rung resolves it on the machine's own PATH
    sock = os.environ.get("FLEET_MANAGER_TMUX_SOCKET")
    if sock:
        argv += ["-L", sock]
    return argv


def base_argv() -> list[str]:
    """What the helper runs: on a private socket also `-f /dev/null`, so a server this helper starts never
    reads the user's tmux.conf (#28743: tmux-continuum would resurrect saved panes); inert on a running server."""
    argv = server_argv()
    if "-L" in argv:
        argv += ["-f", "/dev/null"]
    return argv


def run(machine: dict | None, args: list[str], *, timeout: float = 20.0, progress: list[str] | None = None):
    return run_remote(machine, base_argv() + args, timeout=timeout, progress=progress)


def machine_label(machine: dict | None) -> str:
    return (machine or {}).get("label") or "local"


def unsupported(verb: str, ref: str | None, machine: dict | None) -> Unsupported:
    return Unsupported(f"{verb} is not available on a tmux-only session ({machine_label(machine)})",
                       next=UNSUPPORTED_NEXT.get(verb, "use a Herdr-managed session for this verb"), ref=ref, provider="tmux")


# ---------------------------------------------------------------- inventory


FIELDS = ("#{session_name}", "#{pane_id}", "#{pane_current_path}", "#{pane_current_command}", "#{pane_pid}", "#{window_activity}", "#{session_created}",
          "#{pane_start_command}", "#{default-shell}", "#{pane_dead}", "#{pane_dead_status}")


def engine_of(start_command: str, default_shell: str) -> str:
    """The engine a pane was started with: the first word of its start command after the
    `env -u …` wrapper `open_session` adds, else the default shell. Stable for the pane's
    life, unlike `pane_current_command` (a shell running vim reports vim)."""
    text = start_command or ""
    for _ in range(3):   # a command line handed to tmux as ONE string comes back quoted: unwrap until the head is a bare word (QA r8 AG2)
        try:
            tokens = shlex.split(text)
        except ValueError:
            tokens = text.split()
        if tokens and os.path.basename(tokens[0]) == "env":
            tokens = tokens[1:]
            while tokens and tokens[0] == "-u" and len(tokens) > 1:
                tokens = tokens[2:]
            while tokens and "=" in tokens[0] and not tokens[0].startswith("-"):
                tokens = tokens[1:]
        if not tokens:
            return os.path.basename(default_shell) or "sh"
        if len(tokens) > 1 or not any(c.isspace() for c in tokens[0]):
            return os.path.basename(tokens[0])   # a head with a space in its path beside real arguments is the engine, not a wrapped command line
        text = tokens[0].strip()
    parts = text.split()
    return os.path.basename(parts[0]) if parts else (os.path.basename(default_shell) or "sh")   # a whitespace head after three rounds: the shell, never a crash


def list_sessions(machine: dict | None, *, progress: list[str] | None = None) -> dict:
    """{"online", "note", "sessions": [...]} — one row per tmux session: its first pane's place
    and engine, every pane's current program (liveness is any pane's), dead when all panes exited."""
    label = machine_label(machine)
    if machine is None and not tmux_bin():
        return {"online": False, "note": "tmux is not installed on this host", "sessions": []}
    sep = f"|{secrets.token_hex(4)}|"   # a fresh separator per read: no path, name or title can carry it
    result = run(machine, ["list-panes", "-a", "-F", sep.join(FIELDS)], progress=progress)
    if not result.ok:
        stderr = (result.get("stderr") or "").strip()
        if "no server running" in stderr or "no sessions" in stderr or "error connecting" in stderr or result.get("rc") == 1 and not stderr:
            return {"online": True, "note": "tmux server not running (no sessions)", "sessions": []}
        if result.get("rc") == 127:
            return {"online": False, "note": f"tmux is not installed on {label}", "sessions": []}
        return {"online": False, "note": stderr or f"tmux list-panes exited {result.get('rc')}", "sessions": []}
    sessions: dict[str, dict] = {}
    current = now()
    for line in result["stdout"].splitlines():
        parts = line.split(sep)
        if len(parts) < len(FIELDS):
            continue
        name, pane, cwd, command, pid, activity, created, start, shell, dead, dead_status = parts[:len(FIELDS)]
        row = sessions.get(name)
        if row is not None:
            row["programs"].append(command)
            row["panes"] += 1
            row["dead"] = row["dead"] and dead == "1"
            continue
        try:
            active_ago = current - float(activity)
        except ValueError:
            active_ago = 1e9
        engine = engine_of(start, shell)
        sessions[name] = {
            # `pane_id` is the address ref (the session name), so handles, sync and parse_addr work unchanged
            "addr": f"{label}/{name}", "machine": label, "server": server_label(), "ref": name, "pane_id": name, "tmux_pane": pane,
            "name": name, "agent": engine, "engine": engine, "program": command, "programs": [command], "panes": 1, "dead": dead == "1", "dead_status": dead_status,
            "cwd": cwd, "pid": pid, "status": "working" if active_ago < 60 else "idle", "liveness": "alive",
            "title": "", "terminal_id": f"tmux:{pid}", "workspace_id": name, "tab_id": name,
            "provider": "tmux", "created": created,
        }
    for row in sessions.values():
        row["live_programs"] = [p for p in row["programs"] if p not in SHELLS]
        if row["dead"]:
            row.update(status="exited", liveness="dead")
    return {"online": True, "note": "", "sessions": list(sessions.values())}


def offline(machine: dict | None, note: str, ref: str) -> Unreachable:
    """The tmux server (or tmux itself) is not there: exit 6 with the command that fixes it."""
    label = machine_label(machine)
    missing = "not installed" in note
    if machine is None:
        next_cmd = "doctor (installs tmux when that needs no password)" if missing else "doctor"
    else:
        next_cmd = f"connect {machine['target']} --label {label}" + (" (installs tmux when that needs no password)" if missing else "")
    return Unreachable(f"{label}: {note}", next=next_cmd, ref=ref, provider="tmux", outcome="tmux_unavailable" if missing else "provider_unreachable")


def find_session(machine: dict | None, ref: str) -> dict:
    listing = list_sessions(machine)
    if not listing["online"]:
        raise offline(machine, listing["note"], f"{machine_label(machine)}/{ref}")
    for row in listing["sessions"]:
        if row["ref"] == ref:
            return row
    raise Refused(f"{machine_label(machine)}/{ref}: no tmux session by that name", next=f"list {machine_label(machine)}",
                  ref=f"{machine_label(machine)}/{ref}", provider="tmux", outcome="no_such_session")


# ---------------------------------------------------------------- reads


def capture(machine: dict | None, ref: str, *, lines: int = 60) -> list[str]:
    result = run(machine, ["capture-pane", "-p", "-J", "-t", f"={ref}:", "-S", f"-{lines}"])
    if result.get("rc") == 127:
        raise offline(machine, f"tmux is not installed on {machine_label(machine)}", f"{machine_label(machine)}/{ref}")
    if not result.ok:
        raise Unreachable(f"{machine_label(machine)}/{ref}: capture failed ({(result.get('stderr') or '').strip()})", ref=f"{machine_label(machine)}/{ref}", provider="tmux", outcome="failed")
    out = [l.rstrip() for l in result["stdout"].splitlines()]
    while out and not out[-1].strip():
        out.pop()
    return out[-lines:]


def screen_and_cursor(machine: dict | None, ref: str) -> tuple[list[str], int]:
    """The visible screen and the cursor's row. A read that cannot run raises `composer_unreadable` (exit 6)
    itself, so no caller can mistake "could not look" for "free"."""
    addr = f"{machine_label(machine)}/{ref}"
    probe = run(machine, ["display-message", "-p", "-t", f"={ref}:", "#{cursor_y}"])
    visible = run(machine, ["capture-pane", "-p", "-t", f"={ref}:"])
    if not probe.ok or not visible.ok:
        raise Unreachable(f"{addr}: the composer could not be read; nothing was typed", next=f"read {addr}", ref=addr, provider="tmux", outcome="composer_unreadable")
    try:
        y = int(probe["stdout"].strip())
    except ValueError:
        raise Unreachable(f"{addr}: the composer could not be read (no cursor row); nothing was typed", next=f"read {addr}", ref=addr, provider="tmux", outcome="composer_unreadable")
    return visible["stdout"].split("\n"), y


def composer(machine: dict | None, ref: str, *, tui: bool = False, engine: str | None = None) -> tuple[str, bool]:
    """(held text, from the row above) for the session's screen: `composer_of` on one read."""
    lines, y = screen_and_cursor(machine, ref)
    return composer_of(lines, y, tui=tui, engine=engine)


def composer_of(lines: list[str], y: int, *, tui: bool = False, engine: str | None = None) -> tuple[str, bool]:
    """(held text, from the row above): the line under the cursor (stripped) — whatever sits below it (a status
    bar) is not the composer — or, for a Muse TUI (`tui`) whose cursor row is empty, a prompt line right above it
    that still holds text (an Enter the TUI took as a newline leaves `❯ text` above an empty continuation line;
    QA r8 AG2). A plain shell shows the same screen while `cat` or `read` waits, so the rule is the TUI's alone.
    `engine` keys the chrome rule (`engine_ghost`): Codex's placeholder and Claude's echoed prompt are not held text."""
    glyph = tip_prompt(lines, y)
    if glyph:
        return glyph, False   # the cursor sits in Muse's idle tip: an empty composer showing a bare prompt
    line = row_text(lines, y)
    above = row_text(lines, y - 1)
    if engine_ghost(line, engine):
        return line[0], False
    if engine_ghost(above, engine):
        above = above[0]
    if tui and not line and above and above[0] in PROMPT_CHARS and line_busy(above):
        return above, True   # a continued composer: the held text sits on the prompt line above the empty cursor line
    return line, False


def cursor_line(machine: dict | None, ref: str, *, tui: bool = False, engine: str | None = None) -> str:
    """The composer row as the guard reads it. `engine` keys the chrome rule, so the verify path judges the same row the same
    way the pre-send guard did: Codex's empty-composer placeholder is not a line the pane is still holding (QA r11 parity N8)."""
    return composer(machine, ref, tui=tui, engine=engine)[0]


def is_tui(row: dict) -> bool:
    """The pane runs a Muse TUI (by its current program or its engine): the continuation-line rule applies."""
    return any(os.path.basename(str(row.get(key) or "")) in MUSE_ENGINES for key in ("program", "engine"))


def _squash(text: str) -> str:
    return "".join(text.split())


SQUASHED_TIPS = {_squash(tip) for tip in PROMPT_HINT_GHOSTS}
TIP_ROWS_MAX = 4   # bound on the rows one wrapped tip may span; a tip needing more rows reads as held text (fail-closed)
# The composer wraps a few columns short of the pane edge (its prompt gutter plus the wrap limit, crates/tui/src/composer.rs);
# on the QA r10 FM-1 frames the tip was cut when its next word would have crossed column width-4 to width-8. A head whose
# next word would still fit with more room than that was typed by a person (fail-closed).
TIP_CLIP_MARGIN = 8


def tip_rows(lines: list[str], glyph_row: int, *, width: int | None = None) -> int:
    """How many rows from `glyph_row` down show exactly one Muse idle tip after the prompt glyph (0 when they do
    not). The TUI soft-wraps the tip like typed input (spec 8836 FR-012), so a narrow composer shows it over the
    rows below the glyph; the rows are compared with their whitespace removed, so a wrap at a word or inside one
    reads the same (QA r9 FM NEW-2; review of PR 39253). Exactly one tip: one character more is held text.
    The composer slot is sized for its EMPTY input, so in a pane narrower than the tip the TUI draws only the first
    wrapped row: the head of the tip, cut at the last word that fits, with no continuation under it (QA r10 FM-1).
    That head is the one tip too (`clipped_tip`); a head with a row below that continues it is judged as a wrap.
    `width` is the pane's column count: the widest row of the raw capture (the TUI's separators span it) when the
    caller has not measured it before squeezing the screen."""
    first = lines[glyph_row].strip() if 0 <= glyph_row < len(lines) else ""
    if not first or first[0] not in PROMPT_CHARS:
        return 0
    head = _squash(first[1:])
    if head in SQUASHED_TIPS:
        return 1
    if not head or not any(tip.startswith(head) for tip in SQUASHED_TIPS):
        return 0
    below = _squash(lines[glyph_row + 1]) if glyph_row + 1 < len(lines) else ""
    if not below or not any(tip[len(head)] == below[0] for tip in SQUASHED_TIPS if tip.startswith(head)):
        # nothing under the head continues it: the TUI clipped the tip there, or a person typed its head
        return 1 if clipped_tip(" ".join(first[1:].split()), width or max(len(l.rstrip()) for l in lines)) else 0
    joined = head
    for row in range(glyph_row + 1, min(len(lines), glyph_row + TIP_ROWS_MAX)):
        joined += _squash(lines[row])
        if joined in SQUASHED_TIPS:
            return row - glyph_row + 1
        if not any(tip.startswith(joined) for tip in SQUASHED_TIPS):
            return 0
    return 0


def clipped_tip(text: str, width: int) -> bool:
    """`text` (a glyph row after its prompt glyph) is the head of exactly one Muse idle tip, cut at a word boundary
    because the tip's next word would not fit the composer row of a `width`-column pane (the widest row of the
    capture: the TUI's separators span it)."""
    if not text:
        return False
    tips = [tip for tip in PROMPT_HINT_GHOSTS if tip.startswith(text + " ")]
    if len(tips) != 1:
        return False
    next_word = tips[0][len(text):].split()[0]
    return len(text) + 1 + len(next_word) > width - TIP_CLIP_MARGIN


# What an engine draws inside its EMPTY composer, or echoes above it, that a capture returns as text (QA r10 parity D3).
ENGINE_PLACEHOLDERS = {"codex": ("Ask Codex to do anything",)}   # after Codex's `›` glyph
CLAUDE_ECHO = re.compile("^[❯>]\u00a0")   # Claude Code echoes a submitted prompt as glyph + no-break space; its live composer uses a plain space


def engine_ghost(line: str, engine: str | None) -> bool:
    """`line` (a stripped screen row) is the engine's own chrome, not held text: Codex's empty-composer placeholder or
    Claude's transcript echo of a prompt it already took. Keyed by the session's engine: another engine showing the
    same words gets no excuse (fail-closed)."""
    if not line or line[0] not in PROMPT_CHARS:
        return False
    key = os.path.basename(engine or "")
    if key == "claude":
        return bool(CLAUDE_ECHO.match(line))
    return " ".join(line[1:].split()) in ENGINE_PLACEHOLDERS.get(key, ())


def tip_prompt(lines: list[str], cursor_row: int) -> str:
    """The prompt glyph when the cursor row is inside one Muse idle tip (the glyph row or a wrapped row of it), else ''."""
    for glyph_row in range(cursor_row, max(-1, cursor_row - TIP_ROWS_MAX), -1):
        row = lines[glyph_row].strip() if 0 <= glyph_row < len(lines) else ""
        if row and row[0] in PROMPT_CHARS:
            return row[0] if tip_rows(lines, glyph_row) >= cursor_row - glyph_row + 1 else ""
    return ""


def row_text(lines: list[str], row: int) -> str:
    """One screen row as the composer guard reads it: stripped, and a row that starts exactly one Muse idle tip
    reads as the bare prompt glyph it sits in — the same rule for the cursor row and the row above it."""
    text = lines[row].strip() if 0 <= row < len(lines) else ""
    return text[0] if text and tip_rows(lines, row) else text


def without_tips(lines: list[str], *, width: int | None = None) -> list[str]:
    """`lines` with every Muse idle tip (its glyph row and the rows it wraps onto) removed: what the Herdr guard reads.
    `width`: the pane's column count, measured on the raw screen when `lines` were squeezed first."""
    kept: list[str] = []
    row = 0
    while row < len(lines):
        span = tip_rows(lines, row, width=width)
        if span:
            row += span
            continue
        kept.append(lines[row])
        row += 1
    return kept


# A dialog only a person should answer: host-manager's `dialog_on_screen` reading (the two skills are separate packages;
# QA r10 FM-5 brought the numbered selector, QA r11 FM-2 the rest). Only markers still waiting for an answer: a trust,
# permission or confirmation phrase, a y/n wait on the LAST line (an answered one sits above the prompt in scrollback),
# a choice block with a selector cursor on one row, or a question followed by two or more numbered choices that are
# decision words. A numbered list of facts under a recap question, or an unnumbered decision-word pair with no cursor
# ("Yes, that works." / "No further changes."), is ordinary output that `--type` exists to reply to.
DIALOG_PHRASES = (
    r"(?i)\ballow (once|always|for this session)\b",
    r"(?i)\bpress (enter|return) to (confirm|continue|approve)\b",
    r"(?i)\benter to (confirm|select|choose)\b",   # Claude's `Enter to confirm · Esc to cancel`, Muse's `Up/Down to choose, Enter to confirm.`
)
YN_WAITING = re.compile(r"(?i)(\[y/n\]|\(y/n\)|\[yes/no\])\s*[:?]?\s*$")
# The selector cursor each engine draws: Muse `>` (trust, hooks) and `›` (file access), Claude Code and Codex `❯`. A bare `>`
# counts only on a NUMBERED row: diff and heredoc output draw `> Yes, …` lines too, and two of those must never block typing.
CURSOR = "[\u276f>\u203a]"
GLYPH_CURSOR = "[\u276f\u203a]"
DIALOG_CHOICE = re.compile(rf"^\s*(?P<mark>{CURSOR}\s*)?\d[.)]?\s+(?P<text>\S.*)$")
# An unnumbered choice (Claude's folder trust and bypass warning: `❯ No, exit` over `Yes, I trust this folder`): a decision word opens the line.
DIALOG_PLAIN_CHOICE = re.compile(rf"(?i)^\s*(?:{GLYPH_CURSOR}\s+)?(?P<text>(?:yes|no|allow|deny|trust|proceed|continue|approve|"
                                 r"reject|cancel|exit|abort|skip|always|once|accept|decline|quit|don'?t ask)\b.*)$")
# A row carrying the cursor is a widget waiting for a keypress; ordinary output never draws one, and these dialogs need no question mark.
DIALOG_CURSOR = re.compile(rf"^\s*(?:{CURSOR}\s*\d[.)]?\s+|{GLYPH_CURSOR}\s+)\S")
QUESTION_REACH = 6   # Muse puts the workspace path and two prose lines between its question and the choices
DIALOG_QUESTION = re.compile(r"(?i)\b(trust|allow|permit|permission|proceed|continue|approve|confirm|accept|grant|"
                             r"run (this|it|the command)|execute|overwrite|delete|remove|apply|install|enable|disable)\b")
DIALOG_OPTION = re.compile(r"(?i)^(yes|no|y|n|allow|deny|trust|proceed|continue|approve|reject|cancel|exit|abort|"
                           r"skip|always|once|accept|decline|quit|don'?t ask)\b")


def dialog_on_screen(lines: list[str]) -> list[str]:
    """The screen tail (up to 12 non-empty rows) when a dialog is up, else []."""
    text = [line.rstrip() for line in lines if line.strip()]
    if not text:
        return []
    if any(re.search(phrase, line) for phrase in DIALOG_PHRASES for line in text) or YN_WAITING.search(text[-1]):
        return text[-12:]
    kinds = ["n" if DIALOG_CHOICE.match(line) else "p" if DIALOG_PLAIN_CHOICE.match(line) else None for line in text]
    index = 0
    while index < len(text):
        kind, start = kinds[index], index
        while index < len(text) and kinds[index] == kind:
            index += 1
        if kind is None or index - start < 2:
            continue
        block = text[start:index]
        if any(DIALOG_CURSOR.match(line) for line in block):
            return text[-12:]
        if kind != "n":
            continue   # an unnumbered pair without a cursor is prose
        # a numbered block without a cursor: the question sits above it, a few prose lines at most between them;
        # it is a dialog when it asks for a decision or the choices are decision words
        choices = [DIALOG_CHOICE.match(line).group("text") for line in block]
        question = next((line for line in reversed(text[max(0, start - QUESTION_REACH):start]) if line.endswith("?")), None)
        if question and (DIALOG_QUESTION.search(question) or any(DIALOG_OPTION.match(c) for c in choices)):
            return text[-12:]
    return []


def choice_shape(line: str) -> bool:
    """`line` LOOKS like a choice: a numbered choice (`› 1. Yes, continue`, `> 1  Trust and continue`) or an unnumbered
    decision word (`❯ No, exit`). Shape alone never decides anything — a person types `❯ 2 apples for lunch` and
    `❯ no need to run tests` too (review of #39823); `dialog_choice_rows` adds the position rule."""
    text = (line or "").strip()
    return bool(text) and bool(DIALOG_CHOICE.match(text) or DIALOG_PLAIN_CHOICE.match(text))


def dialog_choice_rows(dialog: list[str]) -> set[str]:
    """The rows of `dialog` (what `dialog_on_screen` returned for ONE screen read) that belong to the dialog's own choice
    block: a run of two or more adjacent choice-shaped rows, with at least one further row below the run — a dialog draws its
    footer or prompt under its choices, while a composer line a person is typing is the last thing on the screen.

    Shape alone is not enough and containment in the tail is not either (the tail includes the composer row): a half-typed
    `❯ no need to run tests, just ship it` is choice-shaped and on the screen, and keying Enter at it would submit the
    person's unfinished line (review of #39823). Only a row inside the block is the dialog's own."""
    rows = [line.strip() for line in dialog]
    out: set[str] = set()
    index = 0
    while index < len(rows):
        start = index
        while index < len(rows) and choice_shape(rows[index]):
            index += 1
        if index - start >= 2 and index < len(rows):   # a run of choices with something drawn under it
            out.update(rows[start:index])
        if index == start:
            index += 1
    return out


def attach_command(machine: dict | None, ref: str) -> str:
    """What a person runs to sit in front of the session (nothing is executed here)."""
    command = " ".join(shlex.quote(a) for a in server_argv() + ["attach", "-t", f"={ref}"])
    return f"ssh -t {machine['target']} -- {shlex.quote(command)}" if machine is not None else command


def line_busy(line: str) -> bool:
    """The composer check, the same for every engine: free only when empty or a bare prompt (ends in a
    prompt character); any other text is half-typed input and nothing is typed over it."""
    return bool(line) and line[-1] not in PROMPT_CHARS


def _knob(name: str, default: float) -> float:
    try:
        return float(os.environ.get(name) or default)
    except ValueError:
        return default


def _line_taken(line: str, *, prompt_expected: bool) -> bool:
    """The one "the pane took my line" rule: the cursor row is free, and it is not a BLANK row when a prompt was
    there before (a submit redraws the prompt; an Enter the program took as a newline leaves a blank continuation
    row with the unsent text one row up). Without a prompt before (cat, a raw tty) a blank row is all a submit leaves."""
    return not line_busy(line) and (bool(line) or not prompt_expected)


def _settles(machine: dict | None, ref: str, *, within: float, prompt_expected: bool, tui: bool = False, engine: str | None = None,
             program_before: str | None = None) -> bool:
    """True once the pane shows the program took the line: its program changed from `program_before` (bash -> sleep:
    the line runs; never a second Enter into it) or the cursor row is free (`_line_taken`); False when the line still
    sits there after `within` s. The program is read first and on EVERY pass (#39857): one look after the window
    missed a command that had started and finished inside it, and a loaded helper then pressed a second Enter."""
    deadline = time.monotonic() + within
    while True:
        if program_before is not None and find_session(machine, ref).get("program") != program_before:
            return True
        if _line_taken(cursor_line(machine, ref, tui=tui, engine=engine), prompt_expected=prompt_expected):
            return True
        if time.monotonic() >= deadline:
            return False
        time.sleep(0.1)


# ---------------------------------------------------------------- writes


def guarded_send(machine: dict | None, ref: str, text: str, *, automated: bool = False, asked_by: str | None = None,
                 verify: bool = True, verify_s: float | None = None) -> dict:
    """Type one guarded line. `verify` (the caller's `--no-verify` off) waits for the pane to take the line and
    presses Enter once more when it did not; `verify_s` (`--verify-seconds`, else FLEET_MANAGER_TYPE_VERIFY_S)
    bounds each wait. `submitted` is always what the pane showed, never a claim."""
    row = find_session(machine, ref)
    if row["dead"]:
        # the program quit and remain-on-exit kept the pane: tmux draws `Pane is dead (status N, …)` on the cursor row, which
        # is not held text (QA r11 FM-1); nothing runs there to type into
        raise Refused(f"{row['addr']}: the program in it exited (status {row['dead_status'] or '?'}); nothing runs there and nothing was typed",
                      next=f"close {row['addr']} removes the dead pane; open a new session instead", ref=row["addr"], provider="tmux", outcome="no_such_session")
    tui = is_tui(row)
    lines, y = screen_and_cursor(machine, ref)
    # the dialog scan comes FIRST, on the whole visible screen, whatever row the cursor sits on: after a redraw Codex parks its
    # cursor on a blank row under its trust dialog, and a cursor-row-only guard typed the steer plus Enter into it (QA r11 FM-1).
    # A trust or permission selector is a dialog, not held text (QA r10 FM-5): the Herdr path's `agent_blocked` shape; a
    # person answers it in attach, the helper has no key-pressing verb (owner ruling 3, 2026-09-20)
    dialog = dialog_on_screen(lines)
    if dialog:
        raise Refused(f"{row['addr']}: a dialog is up ({dialog[-1][:60]!r}); nothing was typed",
                      next=f"a dialog is answered by a person in attach, never by the helper: run `{attach_command(machine, ref)}`",
                      ref=row["addr"], provider="tmux", detail={"code": "agent_blocked", "dialog": dialog})
    held, above = composer_of(lines, y, tui=tui, engine=row.get("engine"))
    if line_busy(held):
        where = "text held on the row above the cursor" if above else "the composer already holds text"
        raise Refused(f"{row['addr']}: {where} ({held[:60]!r}); nothing was typed",
                      next=f"read {row['addr']} and clear or finish that line first", ref=row["addr"], provider="tmux", outcome="composer_not_empty")
    payload = f"{AUTOMATED_MARKER} {text}" if automated else text
    sent = run(machine, ["send-keys", "-t", f"={ref}:", "-l", "--", payload])   # `--`: text that starts with a dash is text
    if not sent.ok:
        raise Unreachable(f"{row['addr']}: send-keys failed ({(sent.get('stderr') or '').strip()})", ref=row["addr"], provider="tmux", outcome="failed")
    window = verify_s if verify_s is not None else _knob("FLEET_MANAGER_TYPE_VERIFY_S", 3.0)
    needed_enter = False
    result = {"automated": automated, "receipt": receipt("Typed a guarded line into", identity_of(machine, row), asked_by=asked_by)}
    try:
        # Enter is its own step, after the text has landed and a short gap: an Enter in the same input burst as the
        # text is a pasted newline to the Muse TUI (nothing runs; measured, QA r8 FM2 D2). Then the pane says whether
        # the line was taken; one more Enter when it was not (like the Herdr path's `needed_enter`), never a third.
        probe = (payload.splitlines() or [""])[-1][-24:]   # the LAST line's tail: that is the row the cursor holds (a long line wraps to its end too)
        engine = row.get("engine")
        landed_by = time.monotonic() + window
        while probe not in cursor_line(machine, ref, tui=tui, engine=engine) and time.monotonic() < landed_by:
            time.sleep(0.05)
        landed = probe in cursor_line(machine, ref, tui=tui, engine=engine)
        # Enter follows the OBSERVATION that the pane drew the text (host-manager's #40603 shape), never a fixed gap:
        # a drawn line is a burst the TUI already took, so the key that follows is its own input.
        run(machine, ["send-keys", "-t", f"={ref}:", "Enter"])
        if not verify:
            submitted = _line_taken(cursor_line(machine, ref, tui=tui, engine=engine), prompt_expected=bool(held))   # one plain read, no wait, no retry
        else:
            # the pane's program changing (bash -> sleep) is read inside the wait, on every pass: the line was taken and is
            # running, never a second Enter into it (#39857: one look after the window lost a 3 s command on a loaded helper)
            program = row.get("program")
            submitted = _settles(machine, ref, within=window, prompt_expected=bool(held), tui=tui, engine=engine, program_before=program)
            if not submitted:
                needed_enter = True
                run(machine, ["send-keys", "-t", f"={ref}:", "Enter"])
                submitted = _settles(machine, ref, within=window, prompt_expected=bool(held), tui=tui, engine=engine, program_before=program)
    except (Unreachable, Refused):
        # the text WAS typed (send-keys succeeded): a pane that cannot be read now (the program took the line and
        # exited, the session went — `find_session` in the settle loop answers `no_such_session`) is not "nothing was
        # typed" — say what happened and point at read
        result.update(submitted=False, needed_enter=needed_enter, note="typed; the pane went unreadable before the submit was observed",
                      next=f"read {row['addr']} before any retry")
        return result
    note = ("the first Enter was taken as text; pressed Enter once more to submit" if needed_enter and submitted
            else "the line still sits in the composer after a second Enter; read before re-sending" if verify and not submitted
            else "not verified (--no-verify): one read after the Enter" if not verify else "")
    if not landed:
        note = (note + "; " if note else "") + "the typed text was not seen on the cursor row before Enter"
    result.update(submitted=submitted, needed_enter=needed_enter, note=note,
                  next=f"read {row['addr']} --tail" if submitted and landed else f"read {row['addr']} before any retry")   # submitted is not taken (owner 2026-09-21): the follow-up read is the next command; text never seen: the pane, not this envelope, is the proof
    return result


def posture_flags(argv: list[str], *, unattended: bool) -> list[str]:
    """The engine's own skip-permission flags `open --unattended` adds (Muse: `--yolo`): empty when attended,
    when the engine is not Muse, or when the caller already passed the flag. What the envelope's `posture` reports."""
    if unattended and argv and os.path.basename(argv[0]) in MUSE_ENGINES and POSTURE_FLAG not in argv:
        return [POSTURE_FLAG]
    return []


def engine_argv(argv: list[str], cwd: str | None, *, unattended: bool = False) -> list[str]:
    """The command a new session runs: a Muse engine gets `--workspace <cwd>`, and the auto-approve posture
    (`--yolo`) only with `--unattended`; every engine starts without the caller's
    Herdr/tmux pane variables (`env -u`), so it is nobody's pane."""
    argv = list(argv)
    if argv and os.path.basename(argv[0]) in MUSE_ENGINES:
        extra = []
        if cwd and "--workspace" not in argv:
            extra += ["--workspace", cwd]
        extra += posture_flags(argv, unattended=unattended)
        argv = argv[:1] + extra + argv[1:]
    stripped = sorted(set(STRIPPED_ENV) | {k for k in os.environ if k.startswith("HERDR_")})
    return ["env"] + [item for key in stripped for item in ("-u", key)] + argv


def open_session(machine: dict | None, name: str, *, cwd: str | None, argv: list[str], asked_by: str | None = None, unattended: bool = False) -> dict:
    """`new-session` with remain-on-exit, so an engine that exits at once leaves a dead pane whose exit
    status and last line explain why; that pane is killed and the verb is `failed` (exit 6), never `opened`."""
    label = machine_label(machine)
    ref = f"{label}/{name}"
    args = ["new-session", "-d", "-s", name]
    if cwd:
        args += ["-c", cwd]
    if argv:
        args += engine_argv(argv, cwd, unattended=unattended)
    args += [";", "set-option", "-t", f"={name}:", "remain-on-exit", "on"]
    result = run(machine, args)
    if not result.ok:
        stderr = (result.get("stderr") or "").strip()
        if "duplicate session" in stderr:
            raise Refused(f"{ref}: a tmux session by that name already exists", next=f"status {ref}", ref=ref, provider="tmux", outcome="name_taken")
        raise Unreachable(f"{label}: tmux new-session failed ({stderr})", ref=ref, provider="tmux", outcome="failed")
    # bounded wait for the pane to be the engine (exec'd) or dead: local state, not a timing assert
    deadline = time.monotonic() + 3.0
    row = None
    while True:
        try:
            row = find_session(machine, name)
        except Refused:
            row = None   # gone before remain-on-exit took hold
        if row is None or row["dead"] or (argv and row["program"] not in ("tmux", "env")) or time.monotonic() >= deadline:
            break
        time.sleep(0.05)
    if row is None or row["dead"]:
        reason = ""
        if row is not None:
            # the whole pane: tmux prints its `Pane is dead (status N, …)` marker on the bottom row, so the
            # program's own last line sits above blank rows and is the last non-blank line once that marker is dropped
            last = next((l for l in reversed(capture(machine, name)) if l.strip() and "Pane is dead" not in l), "")
            reason = f"exit status {row['dead_status'] or '?'}" + (f": {last.strip()[:160]}" if last else "")
            run(machine, ["kill-session", "-t", f"={name}"])
        command = " ".join(argv) if argv else "the shell"
        raise Unreachable(f"{ref}: `{command}` exited at once" + (f" ({reason})" if reason else ""),
                          next=f"check the command on {label}: `{command}`, then rerun open", ref=ref, provider="tmux", outcome="failed")
    row["receipt"] = receipt("Opened", identity_of(machine, row), asked_by=asked_by, detail=" ".join(argv) or row["engine"])
    return row


def stop_session(machine: dict | None, ref: str, *, asked_by: str | None = None) -> dict:
    row = find_session(machine, ref)
    result = run(machine, ["send-keys", "-t", f"={ref}:", "C-c"])
    if not result.ok:
        raise Unreachable(f"{row['addr']}: ctrl-c failed ({(result.get('stderr') or '').strip()})", ref=row["addr"], provider="tmux", outcome="failed")
    return {"sent": "ctrl-c", "receipt": receipt("Interrupted", identity_of(machine, row), asked_by=asked_by, detail="ctrl-c")}


def close_session(machine: dict | None, ref: str, *, confirm: bool, asked_by: str | None = None) -> dict:
    row = find_session(machine, ref)
    live = [] if row["dead"] else row["live_programs"]
    if live and not confirm:
        raise Refused(f"{row['addr']}: `{'`, `'.join(live)}` is still running in it ({row['panes']} pane(s)); close refused without --confirm",
                      next=f"stop {row['addr']} first, or rerun close {row['addr']} --confirm", ref=row["addr"], provider="tmux", outcome="session_live")
    result = run(machine, ["kill-session", "-t", f"={ref}"])
    if not result.ok:
        raise Unreachable(f"{row['addr']}: kill-session failed ({(result.get('stderr') or '').strip()})", ref=row["addr"], provider="tmux", outcome="failed")
    was = ", ".join(live) if live else ("nothing (exited)" if row["dead"] else row["program"])
    return {"closed": row["addr"], "receipt": receipt("Closed", identity_of(machine, row), asked_by=asked_by, detail=f"kill-session, was running {was}")}


def status(machine: dict | None, ref: str) -> dict:
    row = find_session(machine, ref)
    return {"identity": identity_of(machine, row), "live": not row["dead"], "liveness": row["liveness"], "status": row["status"], "program": row["program"],
            "programs": row["programs"], "provider": "tmux", "checked_at": time.time()}
