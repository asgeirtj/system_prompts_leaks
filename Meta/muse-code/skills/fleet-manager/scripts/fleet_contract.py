"""The verb contract fleet-manager shares with host-manager (references/verbs.md).

One JSON object on stdout per verb, success or failure, with `outcome` (what
happened, one word), `provider` (`herdr`, `tmux`, `msp`, or null), `ref`,
`capabilities`, `progress` (also echoed to stderr), `next` (always present; empty on success unless the verb has advice),
`error` on a failure, and `receipt` on a write (`what`, `session`, `who`,
`when`, plus the same as one `line`).

One exit-code table: 0 ok; 2 usage; 3 refused by a guard (`refused`,
`no_such_session`, `identity_mismatch`, `session_live`, `name_taken`,
`composer_not_empty`; nothing changed); 4 `unsupported_by_provider` /
`no_provider`; 5 `needs_user_action`; 6 `provider_unreachable`, `failed`,
`tmux_unavailable`, `herdr_unavailable`, `herdr_add_failed`,
`composer_unreadable` (nothing changed unless the line says `created: true`);
7 `internal`.

Stdlib only. `now()` honours FLEET_MANAGER_NOW (epoch seconds) so tests
inject the clock instead of sleeping.
"""

from __future__ import annotations

import datetime as _dt
import json
import os
import sys
import time

EXIT_OF = {"usage": 2, "refused": 3, "no_such_session": 3, "identity_mismatch": 3, "session_live": 3, "name_taken": 3, "composer_not_empty": 3,
           "unsupported_by_provider": 4, "no_provider": 4, "needs_user_action": 5,
           "provider_unreachable": 6, "failed": 6, "tmux_unavailable": 6, "herdr_unavailable": 6, "herdr_add_failed": 6, "composer_unreadable": 6, "internal": 7}
TMUX_CAPABILITIES = ["liveness", "scrollback", "guarded_input", "attach_by_name"]
HERDR_CAPABILITIES = TMUX_CAPABILITIES + ["agent_status", "dialogs", "prompt_readiness", "wait", "wait_for_output", "workspace", "tab", "worktree", "notify"]
MSP_CAPABILITIES = ["liveness", "scrollback", "session_message", "steer", "pending", "attach_by_name"]   # host-manager's mode C: a session on a host that advertises MSP, no pane
PROVIDERS = ("herdr", "tmux", "msp")
# Text an automated caller must carry on anything it types into a session:
# the session's operator sees who sent it, and no dialog counts it as consent.
AUTOMATED_MARKER = "[automated, not the user, approves nothing]"


# The closed success vocabulary (verbs.md); with EXIT_OF it is every word an envelope may carry.
SUCCESS_OUTCOMES = frozenset({"healthy", "detected", "context", "listed", "machines", "status", "read", "dialog", "attach_command", "resources",
                              "waited", "ready", "sent", "notified", "not_shown", "keys_sent", "answered", "opened", "interrupted", "closed", "adopted",
                              "forgotten", "connected", "fetched"})


def caps_for(provider: str | None) -> list[str]:
    return HERDR_CAPABILITIES if provider == "herdr" else TMUX_CAPABILITIES if provider == "tmux" else MSP_CAPABILITIES if provider == "msp" else []


def exit_code(outcome: str) -> int:
    return EXIT_OF.get(outcome, 0)


class FleetError(Exception):
    """A verb could not do what was asked. `outcome` is the one word (its exit
    code comes from EXIT_OF); `next` is the command that moves the caller forward."""

    default_outcome = "failed"

    def __init__(self, message: str, *, next: str = "", ref: str | None = None, provider: str | None = None,
                 detail: dict | None = None, outcome: str | None = None):
        super().__init__(message)
        self.outcome = outcome or self.default_outcome
        self.next = next or {"usage": "run the verb with --help"}.get(self.outcome, "doctor")   # never a dead end (D11)
        self.ref = ref
        self.provider = provider
        self.detail = detail or {}


class Refused(FleetError):
    default_outcome = "refused"


class FleetTimeout(FleetError):
    """The helper's own wall on a provider call expired (a typed signal, never a word in provider prose);
    `wait` treats it as a calm expiry, every other verb as `failed`."""
    default_outcome = "failed"


class Unreachable(FleetError):
    default_outcome = "provider_unreachable"


class Unsupported(FleetError):
    default_outcome = "unsupported_by_provider"


class NeedsHuman(FleetError):
    default_outcome = "needs_user_action"


class Usage(FleetError):
    default_outcome = "usage"


def now() -> float:
    """Wall clock, or the injected one (FLEET_MANAGER_NOW=<epoch seconds>)."""
    injected = os.environ.get("FLEET_MANAGER_NOW")
    if injected:
        try:
            return float(injected)
        except ValueError:
            pass
    return time.time()


def clock_text(at: float | None = None) -> str:
    """`19:33 UTC` — the form every receipt carries."""
    stamp = _dt.datetime.fromtimestamp(at if at is not None else now(), _dt.timezone.utc)
    return stamp.strftime("%H:%M UTC")


def iso(at: float | None = None) -> str:
    return _dt.datetime.fromtimestamp(at if at is not None else now(), _dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def envelope(outcome: str, *, provider: str | None = None, ref: str | None = None, capabilities: list[str] | None = None,
             progress: list[str] | None = None, next: str = "", **payload) -> dict:
    if outcome not in SUCCESS_OUTCOMES and outcome not in EXIT_OF:
        raise ValueError(f"unknown outcome {outcome!r}")   # main() maps this to `internal` / 7: an unmapped word is never a success
    body = {"outcome": outcome, "provider": provider if provider in PROVIDERS else None, "ref": ref,
            "capabilities": list(capabilities if capabilities is not None else caps_for(provider)), "progress": list(progress or []), "next": next}
    body.update(payload)
    return body


def emit(outcome: str, *, provider: str | None = None, ref: str | None = None, capabilities: list[str] | None = None,
         progress: list[str] | None = None, next: str = "", stream=None, **payload) -> int:
    """Print one envelope line (progress lines also go to stderr) and return the exit code for `outcome`."""
    body = envelope(outcome, provider=provider, ref=ref, capabilities=capabilities, progress=progress, next=next, **payload)
    for line in body["progress"]:
        sys.stderr.write(f"progress: {line}\n")
    (stream or sys.stdout).write(json.dumps(body, ensure_ascii=False) + "\n")
    (stream or sys.stdout).flush()
    return exit_code(outcome)


def emit_error(exc: FleetError) -> int:
    """The failure path: one line, the first thing wrong, the next command. A word outside the closed
    vocabulary is a programming error and still one object: `internal` / 7, never a traceback."""
    outcome, error = exc.outcome, str(exc)
    if outcome not in EXIT_OF and outcome not in SUCCESS_OUTCOMES:
        outcome, error = "internal", f"internal: unknown outcome {exc.outcome!r}: {error}"
    return emit(outcome, provider=exc.provider, ref=exc.ref, next=exc.next, error=error, **exc.detail)


def receipt(what: str, session: dict | str, *, asked_by: str | None = None, at: float | None = None, detail: str = "") -> dict:
    """`{"what", "session", "who", "when", "line"}`: what was done, on which session (the tuple), asked by whom, when
    (`when` is ISO-8601 UTC like host-manager's receipts; the human `line` carries the `HH:MM UTC` clock)."""
    who = asked_by or os.environ.get("FLEET_MANAGER_ASKED_BY") or os.environ.get("USER") or "unknown"
    when = clock_text(at)
    ident = session if isinstance(session, dict) else {"ref": session}
    name = session if isinstance(session, str) else " ".join(str(v) for v in (ident.get("machine"), ident.get("ref")) if v) or str(ident.get("ref"))
    tail = f" ({detail})" if detail else ""
    return {"what": what, "session": ident, "who": who, "when": iso(at), "line": f"{what} {name}{tail} — asked by {who} at {when}."}


def size_cap_bytes() -> int:
    """Largest remote output brought home in one verb (FLEET_MANAGER_COPY_CAP_BYTES; default 4 MiB)."""
    try:
        return int(os.environ.get("FLEET_MANAGER_COPY_CAP_BYTES") or 4 * 1024 * 1024)
    except ValueError:
        return 4 * 1024 * 1024
