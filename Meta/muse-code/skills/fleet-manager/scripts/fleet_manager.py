#!/usr/bin/env python3
"""fleet-manager helper: sessions and agents across your machines.

One CLI that sees and steers every coding-agent session on this host and on
every machine you connected — over Herdr where Herdr runs, over tmux where
it does not — without opening new SSH logins, and that turns the fleet into
something a human drives in a sentence: short handles (`s3`), a list, a
`context` digest, an event stream for one watcher, one-word decisions
(`approve s3`).

Verb contract (shared with host-manager): every verb prints ONE JSON object
with `outcome`, `provider`, `ref`, `capabilities`, `progress`, `next`; write
verbs add `receipt`; errors add `error`. Exit codes: 0 ok, 2 usage,
3 refused, 4 unsupported by this provider / no provider, 5 stopped for a
human step, 6 unreachable or evidence unavailable, 7 internal. `events`
streams one line per change for a Monitor (its `--once` form is one object).

Providers: Herdr when installed and its server answers (started when down,
never installed); tmux otherwise (installed when that needs no password);
`--mode` pins it. Machines: `herdr machine list` when Herdr is
present (`connect` adds through `herdr machine add`), plus
`~/.config/muse/machines.toml` (the only source without Herdr; `connect`
writes it then). Remote calls ride the machine's forwarded Herdr socket
first, its ssh ControlMaster second, and stop as `unreachable` third: this
helper never runs a fresh `ssh <host>` login. Nothing is copied per round:
`context` pulls status only; `fetch` brings one file home by content hash.

Addresses — one grammar for every verb: a handle (`s3`) or
`machine[:server]/<ref>`; `machine` is `local` or a machine label; `server`
is the Herdr session name (default: the profile's); `ref` is a pane id
(`w1:p3`), a unique live agent name, or a tmux session name. Handles are
minted per (machine, ref) on first sight and carry the identity tuple
(machine, server, ref, cwd, engine) every write verb checks first.

Stdlib only. Every subprocess and socket call is bounded by a timeout.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import queue
import re
import shlex
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if __name__ in sys.modules:
    sys.modules.setdefault("fleet_manager", sys.modules[__name__])   # sibling modules import the running CLI, not a second copy

import fleet_connect  # noqa: E402
import fleet_context  # noqa: E402
import fleet_machines  # noqa: E402
import fleet_remote  # noqa: E402
import fleet_session  # noqa: E402
from fleet_remote import (  # noqa: E402,F401  the fleet-steward scan reads these off this module (#39492)
    BIN, api_call, default_local_socket, herdr_json, local_session_name, master_alive, probe_error, profile_session, run_herdr, session_socket_path,
)
import fleet_tmux  # noqa: E402
from fleet_contract import (  # noqa: E402
    AUTOMATED_MARKER, HERDR_CAPABILITIES, TMUX_CAPABILITIES, FleetError, FleetTimeout, NeedsHuman, Refused, Unreachable, Unsupported, Usage, caps_for, clock_text, emit, emit_error, iso, receipt,
)

LOCAL = "local"
DECORATION_RE = re.compile(r"^[\s─━═│┃┆┊╌╍┄┅╭╮╰╯┌┐└┘├┤┬┴┼\-_=|*·]+$")
STATUS_RANK = {"blocked": 0, "working": 1, "unknown": 2, "idle": 3, "done": 3}
STATUS_ICON = {"blocked": "🔴", "working": "🟡", "idle": "🟢", "done": "🟢", "unknown": "⚪"}
CONNECT_SKILL = "`connect <ssh-target> --label <name>` (one login, one second factor, the human present)"
SLOT_FACT = ("never open a new ssh session to check: a refused or auth-prompted `ssh {target}` while Herdr shows the "
             "machine connected means its single session slot is in use, not a dead host")
# `tab.closed` and `workspace.closed` are needed because a real Herdr closes a
# container with ONE event and no per-pane `pane.closed` (measured on 0.9.0).
SUBSCRIPTIONS = ("pane.created", "pane.closed", "pane.exited", "pane.updated", "pane.agent_detected",
                 "tab.closed", "workspace.closed")


# ---------------------------------------------------------------- machines


def list_machines() -> list[dict]:
    """Saved machines from the local client catalog (`herdr machine list --json`)."""
    try:
        proc = subprocess.run(
            [fleet_remote.BIN, "machine", "list", "--json"], capture_output=True, text=True, timeout=fleet_remote.CALL_TIMEOUT_S, stdin=subprocess.DEVNULL
        )
    except FileNotFoundError:
        raise Unreachable(f"herdr binary not found: {fleet_remote.BIN!r} (set HERDR_BIN_PATH)", next="doctor")
    except subprocess.TimeoutExpired:
        raise Unreachable("herdr machine list timed out", next="run `herdr machine list --json` by hand")
    if proc.returncode != 0:
        # An 0.8.x client has no `machine` verb: a fleet of one (Local).
        if "unknown command" in (proc.stderr + proc.stdout):
            return []
        code, message = fleet_remote.herdr_error_detail(proc.stderr or proc.stdout)   # the one envelope decoder, `herdr_json`'s wording
        raise Unreachable(message or "herdr machine list failed", next="run `herdr machine list --json` by hand", detail={"code": code} if code else None)
    try:
        rows = json.loads(proc.stdout or "[]")
    except ValueError:
        raise Unreachable("herdr machine list returned non-JSON output", next="run `herdr machine list --json` by hand")
    return rows if isinstance(rows, list) else []


def herdr_available() -> bool:
    """A herdr binary this host can run (HERDR_BIN_PATH or PATH)."""
    configured = os.environ.get("HERDR_BIN_PATH")
    if configured:
        return os.path.isfile(configured) and os.access(configured, os.X_OK)
    return bool(shutil.which(fleet_remote.BIN)) if not os.path.isabs(fleet_remote.BIN) else os.path.isfile(fleet_remote.BIN)


def all_machines(failures: list[FleetError] | None = None) -> list[dict]:
    """Every machine this skill knows: Herdr's saved machines (authoritative when Herdr
    is present) plus the tmux-only rows of ~/.config/muse/machines.toml; without Herdr the
    file is the only source. Shadowed duplicates are dropped here. With `failures` given,
    a source that fails appends its `FleetError` there and the other source is kept (the
    caller words its own report); without it the failure raises as before."""
    herdr_rows = None
    if herdr_available():
        try:
            herdr_rows = list_machines()
        except FleetError as exc:
            if failures is None:
                raise
            failures.append(exc)
    try:
        directory = fleet_machines.load_directory()
    except FleetError as exc:
        if failures is None:
            raise
        failures.append(exc)
        directory = []
    return with_msp_machines(fleet_machines.active(fleet_machines.merged(herdr_rows, directory)))


def msp_machines() -> list[dict]:
    """The machines `muse hosts` lists as advertising MSP (decision record 41038 D4: one more machine source), as machine rows:
    provider `msp`, the mailbox id as label and target, `availability` online|offline. Empty with the flag off or no
    transport; `fleet_remote.msp_source()` says why."""
    return [msp_machine_row(h) for h in fleet_remote.msp_scope()["hosts"]]


def msp_machine_row(host: dict) -> dict:
    return {"id": host["host"], "label": host["host"], "target": host["host"], "provider": "msp", "source": "msp", "enabled": True, "shadowed": False,
            "session": "default", "modes": ["msp"], "availability": host["availability"]}


def with_msp_machines(rows: list[dict]) -> list[dict]:
    """Every row carries `modes` (the modes it supports); an MSP host whose id an ssh-registered row already carries as its
    label or id is that one row with `msp` added to its modes (`open` prefers msp there, FR-41038-3), any other MSP host is a
    row of its own. The join key is the exact id: a mailbox id and an ssh target are different names, and nothing guesses."""
    out = []
    for row in rows:
        row = dict(row)
        row.setdefault("modes", [row.get("provider") or "herdr"])
        out.append(row)
    for machine in msp_machines():
        same = next((r for r in out if machine["label"] in (r.get("label"), r.get("id"))), None)
        if same is None:
            out.append(machine)
        elif "msp" not in same["modes"]:
            same["modes"] = list(same["modes"]) + ["msp"]
            same["availability"] = machine["availability"]
    return out


_LOCAL_PROVIDER: dict = {}


def local_provider() -> str:
    """herdr | tmux | none for THIS host (the D3 rule, a --mode pin applied); cached per process."""
    if "value" not in _LOCAL_PROVIDER:
        override = _LOCAL_PROVIDER.get("override")
        try:
            _LOCAL_PROVIDER["value"] = fleet_connect.detect(override=override, start_server=False, install=False)["provider"]
        except FleetError:
            _LOCAL_PROVIDER["value"] = "none"
    return _LOCAL_PROVIDER["value"]


def machine_provider(machine: dict | None) -> str:
    """The provider that serves a machine (None = this host)."""
    if machine is None:
        return local_provider()
    if machine.get("provider") == "msp":
        return "msp"   # an MSP host has no pane provider to pin: `--mode herdr|tmux` is about this host's own sessions
    override = _LOCAL_PROVIDER.get("override")
    return override or machine.get("provider") or "herdr"


def dispatch_provider(machine: dict | None) -> str:
    """The provider an `open` on this machine goes through (decision record 41038 D3 rule 2 / D4): `msp` when the machine advertises
    MSP and no `--mode herdr|tmux` pin says otherwise, else the machine's own provider."""
    if machine is not None and "msp" in (machine.get("modes") or []) and _LOCAL_PROVIDER.get("override") is None:
        return "msp"
    return machine_provider(machine)


def find_machine(name: str, machines: list[dict]) -> dict | None:
    """The catalog entry for a machine label or id; None for `local`. Unknown -> FleetError."""
    if name == LOCAL:
        return None
    for machine in machines:
        if machine.get("label") == name or machine.get("id") == name:
            return machine
    named = fleet_remote.msp_directory_host(name)
    if named is not None:
        # an advertising host the human named this turn: theirs to act on, in scope for this invocation (never the whole directory)
        fleet_remote.msp_name(name)
        return msp_machine_row(named)
    known = ", ".join([LOCAL] + [m.get("label", "?") for m in machines])
    source = fleet_remote.msp_source()
    if source["state"] == "unreachable":
        # the MSP source exists but did not answer: the name may be one of its hosts — unknown, not a usage error (exit 6, the retry named)
        raise Unreachable(f"{name!r} is not a saved machine, and the MSP hosts could not be listed ({source['note']})", next=source.get("retry") or "machines", ref=name,
                          provider="msp", detail={"created": False, "retry": source.get("retry")})
    msp_note = "" if source["state"] == "available" else f"; {source['note']}"   # a mailbox id the source cannot list yet is named for what it is, never an ssh target
    raise Usage(f"unknown machine {name!r}; known: {known}{msp_note}", next="machines", ref=name)


def resolve_server(key: str, machines: list[dict] | None = None, *, start: bool = False, progress: list[str] | None = None) -> tuple[str, bool]:
    """Map `machine[:server]` (or `local`) to (socket_path, is_local). `start=True` (verbs that
    create work: `open`) starts a stopped remote Herdr server over the live master first; the one
    progress line that start writes lands in the caller's `progress` list (the verb's envelope)."""
    machine, server = fleet_session.split_machine(key)
    if machine == LOCAL:
        # Short-circuit BEFORE the catalog lookup: `local/...` verbs must never shell
        # out to `herdr machine list` (a broken catalog would otherwise fail them).
        sock = fleet_remote.session_socket_path(server) if server else fleet_remote.default_local_socket()
        if start and not server and not fleet_remote.probe(sock):
            # D3: a stopped local server is started by `open` (and `doctor`), never asked about; the line rides `progress`.
            # A start that never answers is the same failure as the remote arm's: exit 6 with the manual command.
            status = fleet_connect.ensure_local_server(start=True, progress=progress if progress is not None else [])
            if status["state"] not in ("running", "started"):
                raise Unreachable(f"local: the Herdr server did not answer after start ({status['state']})",
                                  next=f"run `{' '.join(fleet_remote.local_server_argv())}` yourself, then rerun open", ref=key, provider="herdr")
        return sock, True
    profile = find_machine(machine, machines if machines is not None else all_machines())
    if machine_provider(profile) != "herdr":
        raise Unsupported(f"{machine} is a {machine_provider(profile)} machine: it has no Herdr socket",
                          next=f"list {machine}, read, send --type, open, stop, close and status work there", ref=machine, provider=machine_provider(profile))
    status = fleet_remote.forward_status(profile, session=server)
    sock, note = status["socket"], status["note"]
    if start and (not sock or status.get("remote") is None) and status.get("master") is not False:
        status = fleet_connect.ensure_remote_server(profile, progress if progress is not None else [], session=server)
        sock, note = status["socket"], status["note"]
    if not sock:
        state, next_step = machine_verdict(profile, note)
        raise Unreachable(f"{machine}: {state} — {note}", next=next_step, ref=machine, provider="herdr")
    return sock, False


# ---------------------------------------------------------------- machine states


def next_step_for(state: str, machine: dict | None, *, session: str = "default", remote: dict | None = None, local_protocol=None) -> str:
    label = (machine or {}).get("label", "")
    target = (machine or {}).get("target", "")
    if state == "connected":
        return ""
    if state == "server_down":
        return "run `doctor` (it starts the local herdr server when Herdr is installed), then rerun the read"
    if state == "disabled":
        return f"`herdr machine enable {label}` re-enables the profile; this helper never toggles it"
    if state == "never_connected":
        return (f"connect {target} --label {label} once (one login; it authenticates the ssh master and forwards the "
                f"server socket); `list` picks it up on the next read")
    if state == "master_down":
        return (f"connect {target} --label {label} (it re-authenticates the ssh master and re-forwards the socket); "
                + SLOT_FACT.format(target=target))
    if state == "forward_down":
        return (f"connect {label} (it re-forwards over the live master and starts the remote `herdr server`, session {session!r}) "
                f"— the ssh master is up but the remote herdr server did not answer over the forward")
    if state == "incompatible":
        return (f"remote herdr {(remote or {}).get('version') or '?'} speaks protocol {(remote or {}).get('protocol')}, "
                f"local expects protocol {local_protocol}: upgrade the remote herdr, then `connect {label}`")
    return ""


def connected_before(label: str) -> bool:
    """Whether this helper ever reached `label`: the persisted mark, or a forward socket on disk."""
    with fleet_session.State() as state:
        if label in state.data.get("connected_once", []):
            return True
    return any(name == re.sub(r"[^A-Za-z0-9_.-]", "_", label) + ".sock" or name.startswith(re.sub(r"[^A-Za-z0-9_.-]", "_", label) + "@")
               for name in (os.listdir(fleet_remote.FORWARD_DIR) if os.path.isdir(fleet_remote.FORWARD_DIR) else []))


def machine_verdict(machine: dict, note: str) -> tuple[str, str]:
    """(state, next_step) for a profile the helper could not reach, from the forward note."""
    session = fleet_remote.profile_session(machine)
    if note.startswith("ssh master down"):
        state = "master_down" if connected_before(machine["label"]) else "never_connected"
    elif note.startswith("disabled"):
        state = "disabled"
    else:
        state = "forward_down"
    return state, next_step_for(state, machine, session=session)


def local_protocol() -> int | None:
    try:
        return fleet_remote.ping(fleet_remote.default_local_socket()).get("protocol")
    except FleetError:
        return None


def machine_status(machine: dict, *, local_proto=None, reset: bool = False) -> dict:
    """One profile's reachability, derived from the catalog, `ssh -O check` and the forward probe only."""
    session = fleet_remote.profile_session(machine)
    row = {
        "id": machine.get("id"), "label": machine.get("label"), "target": machine.get("target"), "session": session,
        "enabled": machine.get("enabled", True), "state": "", "ssh_master": None,
        "forward_socket": fleet_remote.forward_socket_path(machine["label"], session),
        "remote_socket": fleet_remote.remote_socket_candidates(machine, session)[0],
        "server_version": "", "protocol": None, "note": "", "next_step": "",
    }
    if not machine.get("enabled", True):
        row.update(state="disabled", note="disabled in herdr machine list", next_step=next_step_for("disabled", machine))
        return row
    # One probe, at most one `ssh -O check`: a live forward implies a live master.
    status = fleet_remote.forward_status(machine, reset=reset)
    row["ssh_master"] = True if status["master"] is None else status["master"]
    sock, note, remote = status["socket"], status["note"], status["remote"]
    if not sock or remote is None:
        state, next_step = machine_verdict(machine, note)
        row.update(state=state, note=note, next_step=next_step)
        return row
    row.update(server_version=remote["version"], protocol=remote["protocol"])
    if local_proto is not None and remote["protocol"] is not None and remote["protocol"] != local_proto:
        row.update(state="incompatible", note=f"protocol {remote['protocol']} != local {local_proto}",
                   next_step=next_step_for("incompatible", machine, remote=remote, local_protocol=local_proto))
        return row
    row.update(state="connected")
    return row


# ---------------------------------------------------------------- inventory


def snapshot_labels(snap: dict) -> dict:
    """The names a human sees in Herdr, from one snapshot: tab id -> tab label, workspace id -> workspace label. A label that is
    only the tab's or workspace's own number is Herdr's default, not a name a human gave, and is left out (host-manager's
    `herdr_labels`; #38715 ruling 17, the fleet side)."""
    lookup = {"pane": {}, "tab": {}, "workspace": {}}
    for pane in snap.get("panes") if isinstance(snap.get("panes"), list) else []:
        # the human's name for the pane itself (`pane rename`): only the snapshot's `panes` carry it, never its agent object (measured live)
        if isinstance(pane, dict) and pane.get("pane_id") and str(pane.get("label") or "").strip():
            lookup["pane"][str(pane["pane_id"])] = str(pane["label"]).strip()
    for kind, key in (("tab", "tab_id"), ("workspace", "workspace_id")):
        for item in snap.get(f"{kind}s") if isinstance(snap.get(f"{kind}s"), list) else []:
            if not isinstance(item, dict) or not item.get(key):
                continue
            label = str(item.get("label") or "").strip()
            if label and label != str(item.get("number") or "").strip() and not label.isdigit():
                lookup[kind][str(item[key])] = label
    return lookup


def human_labels(agent: dict, labels: dict | None) -> dict:
    """`{"pane", "tab", "workspace"}` for one pane, empty ones left out: the pane's own label (`pane rename`), its tab's, its workspace's."""
    labels = labels or {"pane": {}, "tab": {}, "workspace": {}}
    pairs = (("pane", labels.get("pane", {}).get(str(agent.get("pane_id"))) or str(agent.get("label") or "").strip()),
             ("tab", labels["tab"].get(str(agent.get("tab_id")))), ("workspace", labels["workspace"].get(str(agent.get("workspace_id")))))
    return {kind: value for kind, value in pairs if value}


def human_label(agent: dict) -> str:
    """The one label the board prints beside a session: the name a human gave the PANE, else its tab's. A workspace label is
    usually the one `open --label` wrote, not a human's word for this session, so it stays in `labels` (addressable, in the
    row) instead of on every line."""
    labels = agent.get("labels") or {}
    return next((labels[kind] for kind in ("pane", "tab") if labels.get(kind)), "")


def agent_row(name: str, server: str, agent: dict, labels: dict | None = None) -> dict:
    return {
        "addr": f"{name}/{agent.get('pane_id')}",
        "labels": human_labels(agent, labels),
        "machine": name,
        "server": server,
        "name": agent.get("name"),
        "agent": agent.get("agent"),
        "status": agent.get("agent_status"),
        "cwd": agent.get("cwd"),
        "title": agent.get("terminal_title_stripped") or agent.get("terminal_title") or "",
        "workspace_id": agent.get("workspace_id"),
        "tab_id": agent.get("tab_id"),
        "pane_id": agent.get("pane_id"),
        "terminal_id": agent.get("terminal_id"),
    }


def shell_kind(kind_argv: list[str]) -> bool:
    """`open --engine bash` (any plain shell): the shell IS the session — Herdr detects no agent in it, so it is a
    liveness-only row, never a failed spawn (QA r11 FM-4; host-manager's `is_shell_engine`)."""
    return bool(kind_argv) and os.path.basename(kind_argv[0]) in fleet_tmux.SHELLS


def recorded_panes(machine: str) -> dict[str, dict]:
    """pane_id -> handle entry for the agentless Herdr panes this skill holds on `machine`: a shell pane `open --engine bash`
    made, or a raw pane `adopt` took by id. Only these ride the inventory as rows; a stranger's shell pane stays off the board."""
    return {e["pane_id"]: e for e in fleet_session.read_handles().values()
            if e.get("machine") == machine and (e.get("provider") or "herdr") == "herdr" and e.get("liveness_only") and not e.get("session") and not e.get("gone_at")}


def pane_row(name: str, server: str, pane: dict, entry: dict, labels: dict | None = None) -> dict:
    """An agentless pane as a session row: the recorded engine (the shell), status `no_agent`, liveness only (the tmux shape)."""
    row = agent_row(name, server, {**pane, "agent": entry.get("agent"), "agent_status": "no_agent", "name": entry.get("name") or pane.get("label") or pane.get("pane_id")}, labels)
    row.update(liveness_only=True, coverage="liveness-only")
    return row


def herdr_rows(name: str, server: str, agents: list[dict], snap: dict) -> list[dict]:
    """One row per detected agent, plus one per recorded agentless pane still in the snapshot (QA r11 FM-4); every row carries
    the human labels the snapshot knows (ruling 17)."""
    labels = snapshot_labels(snap)
    rows = [agent_row(name, server, agent, labels) for agent in agents]
    recorded = recorded_panes(name)
    if recorded:
        seen = {row["pane_id"] for row in rows}
        for pane in snap.get("panes") or []:
            entry = recorded.get(pane.get("pane_id"))
            if entry is not None and pane.get("pane_id") not in seen and not pane.get("agent"):
                rows.append(pane_row(name, server, pane, entry, labels))
    return rows


def server_agents(name: str, machine: dict | None, *, local_proto=None) -> dict:
    """Agents on one server from one `session.snapshot`. Never raises: an
    unreachable server is a row with its state and next step."""
    row = {"machine": name, "server": "", "state": "", "online": False, "note": "", "next_step": "", "socket": None,
           "target": (machine or {}).get("target"), "server_version": "", "protocol": None, "agents": []}
    try:
        if machine is None:
            sock = fleet_remote.default_local_socket()
            row.update(server=fleet_remote.local_session_name(sock), socket=sock)
            reason = fleet_remote.probe_error(sock)
            if reason:
                row.update(state="server_down", note=f"local herdr server not running ({reason})", next_step=next_step_for("server_down", None))
                return row
        else:
            row["server"] = fleet_remote.profile_session(machine)
            status = machine_status(machine, local_proto=local_proto)
            row.update(state=status["state"], note=status["note"], next_step=status["next_step"],
                       socket=status["forward_socket"], server_version=status["server_version"], protocol=status["protocol"])
            if status["state"] != "connected":
                return row
            sock = status["forward_socket"]
        agents, snap = fleet_remote.snapshot_agents(sock)
        row.update(online=True, state="connected", server_version=str(snap.get("version") or row["server_version"]),
                   protocol=snap.get("protocol", row["protocol"]))
        row["agents"] = herdr_rows(name, row["server"], agents, snap)
    except FleetError as exc:
        row.update(state=row["state"] if row["state"] and row["state"] != "connected" else ("server_down" if machine is None else "forward_down"),
                   note=str(exc))
        row["next_step"] = row["next_step"] or next_step_for(row["state"], machine, session=row["server"] or "default")
    return row


def fleet_inventory(only: str | None = None, exclude: set | None = None) -> list[dict]:
    """One row per server; `exclude` names machines not to probe at all (the context skip window)."""
    machines = all_machines() if only != LOCAL else []
    jobs: list[tuple[str, dict | None]] = []
    if only in (None, LOCAL):
        jobs.append((LOCAL, None))
    for machine in machines:
        if (only is None or machine.get("label") == only) and machine.get("label") not in (exclude or set()):
            jobs.append((machine["label"], machine))
    if only and not jobs:
        raise Usage(f"unknown machine {only!r}", next="machines", ref=only)
    tmux_jobs = [job for job in jobs if machine_provider(job[1]) == "tmux"]
    msp_jobs = [job for job in jobs if machine_provider(job[1]) == "msp"]
    none_jobs = [job for job in jobs if machine_provider(job[1]) not in ("herdr", "tmux", "msp")]
    jobs = [job for job in jobs if machine_provider(job[1]) == "herdr"]
    tmux_rows = [fleet_context.tmux_server_row(name, machine) for name, machine in tmux_jobs]
    tmux_rows += fleet_context.msp_host_rows([machine for _name, machine in msp_jobs])   # one `sessions --host` per online MSP host, in parallel
    tmux_rows += [fleet_context.unverified_row(name, machine) for name, machine in none_jobs]   # provider `none`: one helper, shared with the fleet-steward scan
    if not jobs:
        return tmux_rows
    proto = local_protocol() if any(m is not None for _n, m in jobs) else None
    # One snapshot per server, all at once: the list's cost is the slowest
    # machine, not the sum (owner target: p95 under 5 s at 10 machines / 100 agents).
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(len(jobs), 32))) as pool:
        rows = list(pool.map(lambda job: server_agents(*job, local_proto=proto), jobs))
    return rows + tmux_rows


def inventory_with_handles(only: str | None = None) -> tuple[list[dict], list[dict]]:
    rows = fleet_inventory(only)
    with fleet_session.State() as state:
        events = fleet_session.sync(state, rows)   # a per-machine list syncs its handles too (QA r8 FM2 D4); `sync` marks nothing gone off the machines it read
    return rows, events if only is None else []


def short_cwd(path: str | None) -> str:
    if not path:
        return ""
    home = os.path.expanduser("~")
    if path.startswith(home):
        return "~" + path[len(home):]
    return re.sub(r"^/(home|Users)/[^/]+", "~", path)


def agent_line(agent: dict) -> str:
    handle = f"{agent['handle']} " if agent.get("handle") else ""
    name = f" ({agent['name']})" if agent.get("name") else ""
    title = f" — {agent['title']}" if agent.get("title") else ""
    label = f' "{human_label(agent)}"' if human_label(agent) else ""
    return f"{handle}{agent['addr']} {agent.get('agent')}{name} {agent.get('status')} {short_cwd(agent.get('cwd'))}{title}{label}"


def offline_line(row: dict) -> str:
    return f"{row['state']} — {row['note']}" + (f"; next: {row['next_step']}" if row.get("next_step") else "")


def render_inventory(rows: list[dict]) -> str:
    out = []
    for row in rows:
        if not row["online"]:
            out.append(f"{row['machine']}: {offline_line(row)}")
            continue
        for agent in row["agents"]:
            out.append(agent_line(agent))
    return "\n".join(out)


# ---------------------------------------------------------------- screen helpers


def squeeze_lines(text: str) -> list[str]:
    lines = []
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip() or DECORATION_RE.match(line):
            continue
        lines.append(re.sub(r"\s{2,}", " ", line.strip()))
    return lines


def read_dialog(sock: str, local: bool, pane_id: str, *, lines: int = 14) -> list[str]:
    """The bottom of the screen as Herdr's detector sees it (the dialog, when blocked)."""
    try:
        proc = fleet_remote.run_herdr(sock, ["pane", "read", pane_id, "--source", "detection", "--lines", str(lines)], local=local)
        text = proc.stdout if proc.returncode == 0 else ""
    except FleetTimeout:   # a dialog excerpt is best effort: one slow pane must not take the board down
        text = ""
    if not text.strip():
        try:
            proc = fleet_remote.run_herdr(sock, ["pane", "read", pane_id, "--source", "visible", "--lines", str(lines)], local=local)
            text = proc.stdout if proc.returncode == 0 else ""
        except FleetTimeout:
            text = ""
    return squeeze_lines(text)[-lines:]


def composer_lines(sock: str, local: bool, target: str, addr: str, engine: str | None = None) -> list[str]:
    """The composer's held text, for the D5 guard: the visible prompt lines that carry text. A screen that
    cannot be read is `composer_unreadable` (exit 6) — the guard never types when it cannot look."""
    try:
        proc = fleet_remote.run_herdr(sock, ["agent", "read", target, "--source", "visible", "--lines", "6"], local=local)
    except (FleetError, OSError) as exc:
        raise Unreachable(f"{addr}: the composer could not be read ({exc}); nothing was typed", next=f"read {addr}", ref=addr, provider="herdr", outcome="composer_unreadable")
    if proc.returncode != 0:
        raise Unreachable(f"{addr}: the composer could not be read ({(proc.stderr or proc.stdout or '').strip()[:120]}); nothing was typed",
                          next=f"read {addr}", ref=addr, provider="herdr", outcome="composer_unreadable")
    width = max((len(l.rstrip()) for l in proc.stdout.splitlines()), default=0)   # the pane's columns: measured before the squeeze drops the separators
    return [l for l in fleet_tmux.without_tips(squeeze_lines(proc.stdout), width=width)
            if COMPOSER_RE.match(l) and re.match(r"^[❯⟩›>]\s*\S", l) and not fleet_tmux.engine_ghost(l, engine)]


def read_screen_raw(sock: str, local: bool, target: str, *, lines: int, source: str, strict: bool = False) -> list[str]:
    """Squeezed screen lines with the TUI chrome still in place. A digest read is best effort (a slow pane answers
    empty); `strict` is for the verb whose output IS this read (`read --tail`): the seam's fault propagates."""
    try:
        proc = fleet_remote.run_herdr(sock, ["agent", "read", target, "--source", source, "--lines", str(lines)], local=local)
    except FleetTimeout:
        if strict:
            raise
        return []
    if proc.returncode != 0:
        if strict:
            raise Unreachable(f"{target}: {(proc.stderr or proc.stdout).strip()[:200]}", next="list", provider="herdr")
        return []
    return squeeze_lines(proc.stdout)


def read_screen(sock: str, local: bool, target: str, *, lines: int, source: str, strict: bool = False) -> list[str]:
    """The screen as the engine drew it (blank rows and rule lines squeezed): the model reads a session's own
    words and chrome alike, as it would in attach — no per-engine scrubbing (R-HM walkthrough H4 (#38715))."""
    return read_screen_raw(sock, local, target, lines=lines, source=source, strict=strict)


COMPOSER_RE = re.compile(r"^[❯⟩›>]")


def composer_holds(raw_lines: list[str], probe: str) -> bool:
    """True when the LAST composer line on screen still carries `probe`.

    A submitted prompt is echoed higher up as `❯ text` with an empty composer
    below it; a parked one sits in the composer itself, with nothing below."""
    composers = [line for line in raw_lines if COMPOSER_RE.match(line)]
    return bool(composers) and probe in composers[-1] and bool(re.match(r"^[❯⟩>]\s*\S", composers[-1]))


def read_progress(sock: str, local: bool, target: str, *, lines: int, strict: bool = False) -> list[str]:
    """What the agent is saying/doing right now.

    An agent on the alternate screen (Claude Code, Muse) keeps almost nothing in
    host scrollback, so `recent-unwrapped` returns the status bar and a spinner
    while the rendered viewport holds the real work. Take whichever actually has
    content, preferring the viewport."""
    visible = read_screen(sock, local, target, lines=max(lines * 3, 40), source="visible", strict=strict)
    recent = read_screen(sock, local, target, lines=max(lines * 3, 40), source="recent-unwrapped", strict=strict)
    return visible if len(visible) >= len(recent) else recent


ANSWER_MARKERS = ("◆", "⏺", "●", "⎿")


# The one-line digest of a `done` event is the one consumer that still guesses at content: it skips the
# status-bar shapes a finished TUI leaves on its last rows (no scrubbing of `read`: the model reads that screen whole).
DIGEST_CHROME = ("bypass permissions", "shift+tab to cycle", "? for help", "for shortcuts", "% context", "esc to interrupt",
                 "ctrl+b to run in background", "Type @ to search", "Voice input", "to hide diff", "← for agents")


def digest_line(lines: list) -> str:
    """The last line worth quoting in a done event: the last answer-marked line, else the last line that is neither a
    prompt row nor status-bar chrome."""
    for line in reversed(lines):
        if line.startswith(ANSWER_MARKERS):
            return line[:160]
    for line in reversed(lines):
        if line.startswith(("⟩", "❯", ">", "[")) or any(noise in line for noise in DIGEST_CHROME):
            continue
        return line[:160]
    return ""


def last_output_line(sock: str, local: bool, target: str) -> str:
    return digest_line(read_progress(sock, local, target, lines=24))


def age(seconds: float) -> str:
    if seconds < 60:
        return "<1m"
    if seconds < 3600:
        return f"{int(seconds // 60)}m"
    if seconds < 86400:
        return f"{int(seconds // 3600)}h"
    return f"{int(seconds // 86400)}d"


# ---------------------------------------------------------------- board


REDUNDANT_TITLES = {"claude code", "muse code", "codex", "claude", "muse", "tmp", ""}


def dir_label(cwd: str | None) -> str:
    if not cwd:
        return ""
    home = os.path.expanduser("~")
    if cwd.rstrip("/") in (home, "/home/" + fleet_remote.USER, "/Users/" + fleet_remote.USER):
        return "~"
    base = os.path.basename(cwd.rstrip("/"))
    return base or short_cwd(cwd)


def who_label(agent: dict) -> str:
    return f"{agent.get('name') or agent.get('agent') or '?'}@{agent.get('machine') or ''}"


def session_line(agent: dict, entry: dict, dialog: str = "") -> str:
    now = time.time()
    status = agent.get("status") or "unknown"
    icon = STATUS_ICON.get(status, "⚪")
    since = age(now - entry["status_since"]) if entry.get("status_since") else ""
    shown = status.upper() if status == "blocked" else status
    where = dir_label(agent.get("cwd"))
    title = (agent.get("title") or "").strip()
    if status == "blocked" and dialog:
        detail = f'{where}: "{dialog}"' if where else f'"{dialog}"'
    elif title and title.lower() not in REDUNDANT_TITLES and title != where and not title.startswith(agent.get("agent") or "\0"):
        detail = f"{where}: {title}" if where else title
    else:
        detail = where
    handle = agent.get("handle") or ""
    if agent.get("drift"):
        detail = f"drift ({'; '.join(agent['drift'])}): the handle keeps its original session; adopt {agent.get('addr')} to take this one"
    label = human_label(agent)
    if label and label != title and label != (agent.get("name") or ""):
        detail = (detail + " · " if detail else "") + f'"{label}"'   # the name a human gave the pane, tab or workspace (ruling 17)
    return f"{icon} {handle} {who_label(agent)} {shown} {since}".rstrip() + (f" — {detail}" if detail else "")


def render_board(rows: list[dict], state_data: dict, *, hint: bool, dialogs: dict[str, str]) -> str:
    agents = []
    empty_online, offline = [], []
    for row in rows:
        if not row["online"]:
            offline.append(f"⚫ {row['machine']} {offline_line(row)}")
            continue
        if not row["agents"]:
            empty_online.append(row["machine"])
        for agent in row["agents"]:
            agents.append((agent, state_data["handles"].get(agent.get("handle"), {})))
    agents.sort(key=lambda pair: (STATUS_RANK.get(pair[0]["status"], 9), int(pair[0]["handle"][1:]) if pair[0].get("handle") else 0))
    counts: dict[str, int] = {}
    for agent, _ in agents:
        key = "idle" if agent["status"] == "done" else agent["status"]
        counts[key] = counts.get(key, 0) + 1
    by_state = ", ".join(f"{counts[k]} {k}" for k in ("blocked", "working", "idle", "unknown") if counts.get(k))
    servers = len(rows)
    header = f"Sessions · {len(agents)} agent{'s' if len(agents) != 1 else ''}" + (f" ({by_state})" if by_state else "") + f" on {servers} server{'s' if servers != 1 else ''} · {clock_text()}"
    lines = [header]
    for agent, entry in agents:
        lines.append(session_line(agent, entry, dialogs.get(agent.get("handle"), "") if agent["status"] == "blocked" else ""))
    if empty_online:
        lines.append(f"⚪ {len(empty_online)} machine{'s' if len(empty_online) != 1 else ''} online, no agents: {', '.join(empty_online)}")
    lines.extend(offline)
    if hint:
        lines.append('Say: "s3 approve" · "s2: run the tests" · "read s2" · "open claude on <machine> in ~/repo" · "stop s3"')
    return "\n".join(lines)


def dialog_excerpt(lines: list[str], chars: int) -> str:
    """The question and its options, not the boilerplate around them."""
    picked = [l for l in lines if "?" in l or re.match(r"^[>❯]?\s*\d[\.\)]?\s", l) or re.search(r"\[y/n\]|\(y/n\)|y/n", l, re.I) or "enter" in l.lower() and "esc" in l.lower()]
    text = " / ".join(picked or lines[-3:])
    return text[:chars]


def collect_dialogs(rows: list[dict], machines: list[dict], *, chars: int) -> dict[str, str]:
    dialogs: dict[str, str] = {}
    for row in rows:
        for agent in row.get("agents", []):
            if agent.get("status") != "blocked" or not agent.get("handle"):
                continue
            try:
                if agent.get("provider") == "tmux":
                    continue
                sock, local = resolve_server(row["machine"], machines)
            except FleetError:
                continue
            dialogs[agent["handle"]] = dialog_excerpt(read_dialog(sock, local, agent["pane_id"], lines=10), chars)
    return dialogs


# ---------------------------------------------------------------- events


DEFAULT_KINDS = "blocked,done,new,gone,machine_offline,machine_online"


def format_event(event: dict, detail: str = "") -> str:
    kind = event["kind"]
    if kind.startswith("machine_"):
        return f"{event['machine']} {'offline' if kind == 'machine_offline' else 'online'}{' — ' + event['detail'] if event.get('detail') else ''}"
    who = who_label(event)
    handle = event["handle"]
    if kind == "blocked":
        quoted = f' — "{detail}"' if detail else ""
        return f'{handle} blocked {who}{quoted} → reply "{handle} approve" or "{handle} deny"'
    tail = f" — {detail}" if detail else ""
    return f"{handle} {kind} {who}{tail}"


def event_detail(event: dict, machines: list[dict]) -> str:
    try:
        sock, local = resolve_server(event["machine"], machines)
    except FleetError:
        return ""
    if event["kind"] == "blocked":
        return dialog_excerpt(read_dialog(sock, local, event["pane_id"], lines=10), 200)
    if event["kind"] == "done":
        return last_output_line(sock, local, event["pane_id"])
    if event["kind"] == "new":
        return dir_label(event.get("cwd"))
    return ""


class ServerFeed:
    """One `events.subscribe` connection to one server, pushing (server, feed,
    event) onto the watcher's queue; a closed stream pushes (server, feed, None).
    The feed identity lets the watcher drop items a superseded stream queued."""

    def __init__(self, name: str, sock_path: str, pane_ids: list[str], out: queue.Queue):
        self.name = name
        self.sock_path = sock_path
        self.pane_ids = list(pane_ids)
        self.out = out
        self.sock: socket.socket | None = None
        self.closed = False

    def start(self) -> None:
        subs = [{"type": kind} for kind in SUBSCRIPTIONS]
        subs += [{"type": "pane.agent_status_changed", "pane_id": pane_id} for pane_id in self.pane_ids]
        self.sock = fleet_remote.api_connect(self.sock_path)
        try:
            self.sock.sendall((json.dumps({"id": "fleet:events.subscribe", "method": "events.subscribe", "params": {"subscriptions": subs}}) + "\n").encode())
            reader = self.sock.makefile("rb")
            first = reader.readline()
        except OSError as exc:
            # A wedged remote (timeout, reset) is that machine's problem, never the watcher's.
            self.sock.close()
            raise FleetError(f"{self.name}: events.subscribe on {self.sock_path}: {exc}")
        try:
            reply = json.loads(first) if first else {}
        except ValueError:
            reply = {}
        if not first or reply.get("error"):
            self.sock.close()
            raise FleetError(f"{self.name}: events.subscribe refused: {(reply.get('error') or {}).get('message', 'no reply')}")
        self.sock.settimeout(None)
        threading.Thread(target=self._pump, args=(reader,), daemon=True).start()

    def _pump(self, reader) -> None:
        try:
            for line in reader:
                try:
                    event = json.loads(line)
                except ValueError:
                    continue
                self.out.put((self.name, self, event))
        except OSError:
            pass
        finally:
            reader.close()
        if not self.closed:
            self.out.put((self.name, self, None))   # a stream the watcher did not close itself: the machine dropped

    def close(self) -> None:
        """End the stream for real: `shutdown` wakes the pump's blocked read and
        gives the server its EOF; `sock.close()` alone only detaches while the
        pump's file object keeps the descriptor (and the server a ghost subscriber)."""
        self.closed = True
        if self.sock is not None:
            try:
                self.sock.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass
            try:
                self.sock.close()
            except OSError:
                pass


def apply_event(row: dict, event: dict) -> None:
    """Fold one Herdr event into a server row's agent list (pane-keyed)."""
    kind = event.get("event", "")
    data = event.get("data") or {}
    panes = {a["pane_id"]: a for a in row["agents"]}
    if kind in ("pane_created", "pane_updated", "pane_agent_detected") and isinstance(data.get("pane"), dict):
        pane = data["pane"]
        current = panes.get(pane.get("pane_id"))
        if pane.get("agent"):
            panes[pane["pane_id"]] = agent_row(row["machine"], row["server"], pane)
        elif current is not None and current.get("liveness_only"):
            current.update(cwd=pane.get("cwd") or current.get("cwd"), title=pane.get("terminal_title_stripped") or current.get("title"))   # a recorded shell pane changed, it did not go
        else:
            panes.pop(pane.get("pane_id"), None)
    elif kind == "pane_agent_status_changed" and data.get("pane_id"):
        current = panes.get(data["pane_id"])
        if current is not None:
            current["status"] = data.get("agent_status") or current["status"]
            if data.get("agent"):
                current["agent"] = data["agent"]
            if data.get("title"):
                current["title"] = data["title"]
        elif data.get("agent"):
            panes[data["pane_id"]] = agent_row(row["machine"], row["server"], {
                "pane_id": data["pane_id"], "workspace_id": data.get("workspace_id"), "agent": data.get("agent"),
                "agent_status": data.get("agent_status"), "terminal_title_stripped": data.get("title") or ""})
    elif kind in ("pane_closed", "pane_exited"):
        panes.pop(data.get("pane_id"), None)
    elif kind == "workspace_closed":
        # Herdr reports the container closing, not each pane inside it.
        wid = data.get("workspace_id") or (data.get("workspace") or {}).get("workspace_id")
        for pane_id in [p for p, a in panes.items() if a.get("workspace_id") == wid]:
            panes.pop(pane_id, None)
    elif kind == "tab_closed":
        tid = data.get("tab_id") or (data.get("tab") or {}).get("tab_id")
        for pane_id in [p for p, a in panes.items() if a.get("tab_id") == tid]:
            panes.pop(pane_id, None)
    row["agents"] = list(panes.values())


def cmd_events(args) -> int:
    """One compact line per fleet event; quiet otherwise. Built for ONE Monitor:
    persistent=true, wake_delay_ms=0. Never exits on its own unless bounded.

    Subscription-based: one `events.subscribe` per reachable server, folded
    into the shared handle state as events arrive. No polling of a reachable
    server; only unreachable machines are re-probed, every `--interval` s."""
    machines = [m for m in all_machines() if machine_provider(m) == "herdr"]
    if local_provider() != "herdr" and not machines:
        raise Unsupported("events needs a Herdr server (this host or a connected Herdr machine); tmux pushes no events", next="poll `context` (its cadence is fixed)", provider=local_provider())
    by_label = {m["label"]: m for m in machines}
    rows = [r for r in fleet_inventory() if r.get("provider", "herdr") == "herdr"]
    inbox: queue.Queue = queue.Queue()
    feeds: dict[str, ServerFeed] = {}
    kinds = None if args.kinds == "all" else set((args.kinds or DEFAULT_KINDS).split(","))

    def subscribe(row: dict) -> None:
        """Open the server's event stream, THEN re-read its snapshot: anything that
        changed between the inventory and the stream is applied on top instead of
        being lost (Herdr replays nothing from before a subscription). Herdr scopes
        `pane.agent_status_changed` per pane, so the stream covers the panes known
        at this moment; a pane that appears later re-opens the stream."""
        old = feeds.pop(row["machine"], None)
        if old is not None:
            old.close()
        feed = ServerFeed(row["machine"], row["socket"], [a["pane_id"] for a in row["agents"]], inbox)
        try:
            feed.start()
            agents, _snap = fleet_remote.snapshot_agents(row["socket"])
        except FleetError as exc:
            feed.close()
            # A machine whose stream cannot be opened is offline WITH a verdict: the
            # offline line must carry a state and a next step, never "connected".
            state = "server_down" if row["machine"] == LOCAL else "forward_down"
            row.update(online=False, state=state, note=str(exc),
                       next_step=next_step_for(state, by_label.get(row["machine"]), session=row["server"] or "default"))
            return
        feeds[row["machine"]] = feed
        row["agents"] = herdr_rows(row["machine"], row["server"], agents, _snap)
        if any(a["pane_id"] not in feed.pane_ids for a in row["agents"]):
            subscribe(row)   # the refresh found a pane newer than the stream: cover it too

    def emit_lines(events: list[dict]) -> None:
        for event in events:
            if kinds and event["kind"] not in kinds:
                continue
            print(format_event(event, event_detail(event, machines)), flush=True)

    if not args.once:
        for row in rows:
            if row["online"]:
                subscribe(row)
    mine = {"handles": {}, "machines": {}}   # this watcher's own picture
    with fleet_session.State() as state:
        baseline = fleet_session.sync(state, rows)         # shared-state baseline (handles, gone marks)
        for row in rows:
            mine["machines"][row["machine"]] = row["online"]
            for agent in row.get("agents", []):
                handle = state.handle_for(row["machine"], agent["pane_id"])
                if handle:
                    mine["handles"][handle] = agent.get("status")
        n_agents = sum(len(r["agents"]) for r in rows if r["online"])
        n_online = sum(1 for r in rows if r["online"])
    # Printing happens OUTSIDE the state lock: a detail read resolves servers,
    # and a dead-master verdict reads the state file too (flock is not re-entrant).
    baseline_lines = [format_event(event, event_detail(event, machines)) for event in baseline] if args.replay_baseline else []
    ready = f"ready: {n_agents} sessions on {n_online}/{len(rows)} servers"
    if args.once:
        return emit("ready", provider="herdr", text=ready, events=baseline_lines, sessions=n_agents, servers_online=n_online, servers=len(rows))
    for line in baseline_lines:
        print(line, flush=True)
    # `ready` means watching: every reachable server is subscribed by now.
    print(ready, flush=True)
    deadline = time.monotonic() + args.duration if args.duration else None
    by_machine = {row["machine"]: row for row in rows}
    next_retry = time.monotonic() + args.interval
    try:
        while True:
            timeout = max(0.05, min(next_retry - time.monotonic(), (deadline - time.monotonic()) if deadline else 3600))
            changed = False
            try:
                item = inbox.get(timeout=timeout)
                items = [item]
                # coalesce a burst before syncing once
                drain_until = time.monotonic() + 0.05
                while time.monotonic() < drain_until:
                    try:
                        items.append(inbox.get(timeout=0.01))
                    except queue.Empty:
                        break
                for name, feed, event in items:
                    row = by_machine.get(name)
                    if row is None or feeds.get(name) is not feed:
                        continue   # a superseded stream's leftovers: the refresh already outranks them
                    if event is None:
                        # The stream closed: re-derive the machine's state now (master
                        # down? server gone?) so the offline line carries the verdict.
                        feeds.pop(name).close()
                        fresh = server_agents(name, by_label.get(name), local_proto=None)
                        by_machine[name] = fresh
                        changed = True
                        if fresh["online"]:
                            subscribe(fresh)
                        continue
                    apply_event(row, event)
                    changed = True
                    feed = feeds.get(name)
                    if feed is not None and any(a["pane_id"] not in feed.pane_ids for a in row["agents"]):
                        subscribe(row)   # a new pane: its status changes need their own subscription
            except queue.Empty:
                pass
            now = time.monotonic()
            if now >= next_retry:
                next_retry = now + args.interval
                for name, row in by_machine.items():
                    if row["online"]:
                        continue
                    fresh = server_agents(name, by_label.get(name), local_proto=None)
                    by_machine[name] = fresh
                    changed = True
                    if fresh["online"]:
                        subscribe(fresh)
            if changed:
                with fleet_session.State() as state:
                    events = fleet_session.sync(state, list(by_machine.values()), prev=mine)
                emit_lines(events)
            if deadline and time.monotonic() >= deadline:
                return 0
    finally:
        for feed in feeds.values():
            feed.close()


def decide_key(dialog: str, *, approve: bool) -> str | None:
    """Pick the key that answers a blocked dialog, or None when unsure."""
    low = dialog.lower()
    if re.search(r"\[y/n\]|\(y/n\)|\by/n\b|\[y/N\]", dialog) or "(y/n)" in low or "y/n" in low:
        return "y" if approve else "n"
    numbered = re.search(r"(^|\s)[>❯]\s*1[\.\s)]", dialog) or "1/2, then enter" in low or re.search(r"\b1\.\s*yes\b", low) or "enter to confirm" in low or "esc to cancel" in low
    if numbered:
        return "enter" if approve else "esc"
    if approve and re.search(r"\byes\b", low):
        return "enter"
    return None


# The selector cursor: `❯`/`›` on any row, a bare `>` only on a NUMBERED row — Codex opens with a `> You are in <dir>` banner
# above its numbered trust choices, and that banner is never the choice (QA r11 FM-3; host-manager's CURSOR rule).
CHOICE_CURSOR = re.compile(r"^\s*(?:[❯›]\s*(?:\d[.)]?\s+)?|>\s*\d[.)]?\s+)(?P<text>\S.*)$")
AFFIRMATIVE = re.compile(r"(?i)^(yes|y|trust|allow|approve|accept|proceed|continue|grant|ok|confirm)\b")
NEGATIVE = re.compile(r"(?i)^(no|n|don'?t|never|deny|reject|cancel|quit|exit|abort|skip|decline)\b")


def highlighted_choice(lines: list[str]) -> str | None:
    """The choice under a selector's cursor (`❯ No, exit`, `> 1  Trust and continue`, `› 1. Yes, continue`), its number
    stripped; None when no row carries a cursor."""
    for line in lines:
        match = CHOICE_CURSOR.match(line)
        if match:
            return match.group("text").strip()
    return None


def affirmative(choice: str) -> bool:
    return bool(AFFIRMATIVE.match(choice)) and not NEGATIVE.match(choice)


def enter_safe(highlighted: str | None) -> bool:
    """Whether pressing Enter is safe to do UNASKED: Enter confirms whatever row is really selected, so the capture must SHOW
    the affirmative choice selected. `None` is "the capture could not see a cursor", never "Yes is selected" — on a trust
    dialog that is the QA r10 D2 session death. The one question, asked the same way by the recommender (`dialog_answer`) and
    by the verb that sends the key (`cmd_decide`); `--key enter` stays the caller's explicit override (review of #39823)."""
    return highlighted is not None and affirmative(highlighted)


def herdr_attach_command(machine: dict | None, target: str) -> str:
    """What a person runs to sit in front of a Herdr session (nothing is executed here)."""
    command = f"herdr agent attach {target}"
    return f"herdr --remote {machine['target']}   # then: {command}" if machine is not None else command


def dialog_answer(addr: str, machine: str, pane_id: str, dialog_lines: list[str], *, approve: bool = True) -> str:
    """The one command that answers the dialog on screen: `approve <addr> --force` (or `deny …`) when the key the helper would
    send is safe — for Enter, the highlighted choice is the affirmative one — else the attach command (a person answers it;
    owner ruling 3). QA r11 FM-3: Codex's trust dialog on Herdr had no `next` that worked."""
    dialog = "\n".join(dialog_lines)
    key = decide_key(dialog, approve=approve)
    highlighted = highlighted_choice(dialog_lines)
    # Enter confirms whatever row is really selected, so it is only safe when the capture SHOWS the affirmative row selected;
    # no visible cursor means the screen could not be read that far, never "Yes is highlighted" (review of #39823)
    if key and (key != "enter" or not approve or enter_safe(highlighted)):
        return f"{'approve' if approve else 'deny'} {addr} --force"
    return f"a dialog is answered by a person in attach, never by keys the helper guesses: run `{herdr_attach_command(target_machine(machine), pane_id)}`"


def herdr_dialog(sock: str, local: bool, pane_id: str) -> list[str]:
    """The dialog rows on a Herdr pane's screen (host-manager's reading, `fleet_tmux.dialog_on_screen`), [] when none.
    Herdr's own `blocked` is the verdict when it says so; this read is for the sessions it calls idle while a dialog is up
    (a fresh Muse trust prompt in some drives, Codex's directory trust: QA r11 FM-3)."""
    return fleet_tmux.dialog_on_screen(read_dialog(sock, local, pane_id, lines=12))


def cmd_decide(args, approve: bool) -> int:
    machine, target = fleet_session.parse_addr(args.addr)
    require_herdr(args.addr, machine, "approve" if approve else "deny")
    fleet_session.check(args.addr, nothing="answered")
    sock, local = resolve_server(machine)
    target = by_label(sock, target)
    info = fleet_remote.herdr_json(sock, ["agent", "get", target], local=local)["result"]["agent"]
    pane_id = info["pane_id"]
    status = info.get("agent_status")
    dialog_lines = read_dialog(sock, local, pane_id, lines=10)
    dialog = "\n".join(dialog_lines)
    if status != "blocked" and not args.force:
        shown = fleet_tmux.dialog_on_screen(dialog_lines)
        if shown:
            # Herdr calls it idle, the screen shows a dialog (QA r11 FM-3): say so, and name the one command that answers it
            raise Refused(f"{args.addr}: Herdr reports {status}, but the screen shows a dialog ({shown[-1][:60]!r}); nothing was answered",
                          next=dialog_answer(args.addr, machine, pane_id, dialog_lines, approve=approve), ref=args.addr, provider="herdr",
                          detail={"code": "agent_blocked", "dialog": dialog, "highlighted": highlighted_choice(dialog_lines), "status": status})
        raise Refused(f"{args.addr} is not blocked ({status}); nothing to answer", next=f"read {args.addr}, or pass --force to send anyway", ref=args.addr,
                      provider="herdr", detail={"dialog": dialog, "status": status})
    key = args.key or decide_key(dialog, approve=approve)
    if not key:
        raise Refused(f"{args.addr}: could not tell which key answers this dialog", next=f"dialog {args.addr}, then pass --key <key>", ref=args.addr,
                      provider="herdr", detail={"dialog": dialog, "status": status})
    highlighted = highlighted_choice(dialog_lines)
    if approve and not args.key and key == "enter" and not enter_safe(highlighted):
        # Enter confirms the highlighted row: on Claude Code's folder-trust dialog that is "No, exit", and the session dies
        # (QA r10 parity D2). A capture with no visible cursor is "could not see it", not "Yes is selected" (review of #39823).
        # The helper never moves the cursor with keys of its own: a person answers it in attach (ruling 3).
        raise Refused(f"{args.addr}: the highlighted choice is {highlighted!r}, not the affirmative one; no key was sent"
                      if highlighted is not None else
                      f"{args.addr}: no row on this dialog shows the selector cursor, so Enter would confirm whatever is really selected; no key was sent",
                      next=f"a dialog is answered by a person in attach, never by keys the helper guesses: run `{herdr_attach_command(target_machine(machine), pane_id)}`",
                      ref=args.addr, provider="herdr", detail={"code": "agent_blocked", "dialog": dialog, "highlighted": highlighted, "status": status})
    fleet_remote.herdr_json(sock, ["agent", "send-keys", target, key], local=local)
    verb = "Approved" if approve else "Denied"
    return emit("answered", provider="herdr", ref=args.addr, sent=key, status_before=status, dialog=dialog,
                receipt=receipt(verb, herdr_identity(machine, sock, local, target), asked_by=args.asked_by, detail=f"key {key}"))


def agent_info(sock: str, local: bool, target: str) -> dict:
    """The agent row (`agent get`), or {} when Herdr has none for the target."""
    try:
        return fleet_remote.herdr_json(sock, ["agent", "get", target], local=local)["result"]["agent"]
    except FleetError:
        return {}


def agent_status(sock: str, local: bool, target: str) -> str:
    return agent_info(sock, local, target).get("agent_status", "")


def herdr_type(args) -> int:
    """`send --type`: submit a prompt AND make sure it actually went in.

    A freshly started agent sometimes takes the text into its composer without
    submitting it (measured on Muse 1.0.3 and Claude Code): herdr reports
    success, the pane shows the text, and nothing runs. Left alone that is a
    steer that silently vanishes, so verify and press Enter once."""
    machine, target = fleet_session.parse_addr(args.addr)
    sock, local = resolve_server(machine)
    target = by_label(sock, target)
    info = agent_or_pane(sock, local, target, args.addr)   # an address neither an agent nor a pane answers to is no_such_session
    before = info.get("agent_status", "")
    if before == "no_agent":
        return shell_run(args, machine, sock, local, info)
    # D5: never type over a non-empty composer (Herdr 0.9.1 merges the arriving prompt with the half-typed text and submits both),
    # and never over a dialog. The dialog scan does not wait for held text: a `[y/N]` question draws no prompt glyph, so the
    # composer reads empty and the steer would land on the dialog (review of #39823). Held text that is the dialog's OWN choice
    # row is the dialog (QA r11 FM-3); held text a person typed stays `composer_not_empty`, dialog on screen or not.
    pane_id = info.get("pane_id") or target
    held = composer_lines(sock, local, target, args.addr, engine=info.get("agent"))
    if before not in ("working", "blocked"):
        dialog = herdr_dialog(sock, local, pane_id) if not held or fleet_tmux.choice_shape(held[-1]) else []
        if dialog and held and held[-1].strip() not in fleet_tmux.dialog_choice_rows(dialog):
            dialog = []   # the held line is choice-SHAPED but not one of the dialog's own rows: a person's line (review of #39823)
        if dialog:
            raise Refused(f"{args.addr}: a dialog is up ({dialog[-1][:60]!r}) although Herdr reports {before or 'no status'}; nothing was typed",
                          next=dialog_answer(args.addr, machine, pane_id, read_dialog(sock, local, pane_id, lines=10)),
                          ref=args.addr, provider="herdr", detail={"code": "agent_blocked", "dialog": dialog, "status": before})
        if held:
            raise Refused(f"{args.addr}: the composer already holds text ({held[-1][:60]!r}); nothing was typed",
                          next=f"read {args.addr} and clear or finish that line first", ref=args.addr, provider="herdr", outcome="composer_not_empty")
    text = f"{AUTOMATED_MARKER} {args.text}" if args.automated else args.text
    cmd = ["agent", "prompt", target, text]
    if args.wait:
        cmd.append("--wait")
    for until in args.until or []:
        cmd += ["--until", until]
    if args.timeout:
        cmd += ["--timeout", str(args.timeout)]
    call_timeout = (args.timeout / 1000 + 30) if args.timeout else (3600 if args.wait else fleet_remote.CALL_TIMEOUT_S)
    try:
        proc = fleet_remote.run_herdr(sock, cmd, local=local, timeout=call_timeout)
    except FleetTimeout:
        raise Unreachable(f"{args.addr}: prompt timed out", next=f"read {args.addr} before any retry", ref=args.addr, provider="herdr")
    if proc.returncode != 0:
        # herdr did not complete the send: `agent_blocked` (a dialog is already up)
        # and `agent_not_found` refuse before typing anything; `agent_prompt_stalled`
        # comes after herdr typed the text and saw no state change within its 5 s
        # window. Either way the verify loop below would read PRE-EXISTING state as
        # proof of delivery, and a steer herdr did not confirm is never reported as sent.
        code, detail = fleet_remote.herdr_error_detail(proc.stderr or proc.stdout)   # the one envelope decoder (#39447)
        # The code is what SKILL.md branches on (`agent_blocked` -> answer the dialog,
        # `agent_prompt_stalled` -> tail first); the message alone is ambiguous since
        # herdr's stall text also contains the word "blocked".
        raise Refused(f"{args.addr}: {code + ': ' if code else ''}{detail or 'herdr refused the prompt'}",
                      next=(f"dialog {args.addr}, then approve/deny" if code == "agent_blocked" else f"read {args.addr} before any retry"),
                      ref=args.addr, provider="herdr", detail={"submitted": False, "needed_enter": False, "status": before, "code": code})
    needed_enter = False
    # `--wait` returns once herdr saw the state settle, so there is nothing left to verify.
    verify = not args.no_verify and not args.wait
    if verify:
        # The screen went through squeeze_lines (whitespace runs collapsed, split on
        # newlines), so raw text can never match a doubled space or a multi-line
        # steer. Normalise the probe the same way and compare only its first line.
        first = (text.strip().splitlines() or [""])[0]
        probe_text = re.sub(r"\s{2,}", " ", first)[:24]
        deadline = time.monotonic() + (args.verify_seconds if args.verify_seconds is not None else 8.0)
        while time.monotonic() < deadline:
            if agent_status(sock, local, target) in ("working", "blocked"):
                break
            if probe_text and composer_holds(read_screen_raw(sock, local, target, lines=12, source="visible"), probe_text):
                fleet_remote.run_herdr(sock, ["agent", "send-keys", target, "enter"], local=local)
                needed_enter = True
                time.sleep(2)
                break
            time.sleep(1)
    after = agent_status(sock, local, target)
    submitted = args.wait or needed_enter or after in ("working", "blocked") or after != before
    note = ("composer had swallowed the prompt; pressed enter to submit" if needed_enter
            else "could not confirm the prompt was submitted; read before re-sending" if verify and not submitted else "")
    return emit("sent", provider="herdr", ref=args.addr, submitted=submitted, needed_enter=needed_enter, status=after,
                delivery="typed", automated=bool(args.automated), note=note,
                next=(f"read {args.addr} --tail" if submitted else f"read {args.addr} before any retry"),   # owner 2026-09-21: submitted is not taken; the follow-up read is the next command
                receipt=receipt("Typed a prompt into", herdr_identity(machine, sock, local, target), asked_by=args.asked_by, detail=f"{len(args.text)} chars" + (", automated" if args.automated else "")))


def shell_run(args, machine_key: str, sock: str, local: bool, pane: dict) -> int:
    """`send --type` into an agentless pane (QA r11 FM-4): the line runs in the pane's shell through Herdr's own `pane run`
    (what `open` types its command with), never through `agent prompt`. The command line is judged from the LAST screen
    row: free when a prompt character ends it, held text otherwise (host-manager's shell rule). `--automated` rides as a
    trailing `# …` comment so the command still runs."""
    pane_id = pane.get("pane_id")
    addr = args.addr
    if "\n" in args.text.strip():
        raise Usage("a shell pane runs one line per send", next=f"send {addr} \"<one command line>\" --type", ref=addr)
    try:
        proc = fleet_remote.run_herdr(sock, ["pane", "read", pane_id, "--source", "visible", "--lines", "6"], local=local)
    except (FleetError, OSError) as exc:
        raise Unreachable(f"{addr}: the command line could not be read ({exc}); nothing was typed", next=f"read {addr}", ref=addr, provider="herdr", outcome="composer_unreadable")
    if proc.returncode != 0:
        raise Unreachable(f"{addr}: the command line could not be read ({(proc.stderr or proc.stdout or '').strip()[:120]}); nothing was typed",
                          next=f"read {addr}", ref=addr, provider="herdr", outcome="composer_unreadable")
    last = next((line.strip() for line in reversed(proc.stdout.splitlines()) if line.strip()), "")
    if fleet_tmux.line_busy(last):
        raise Refused(f"{addr}: the shell's command line already holds text ({last[-60:]!r}); nothing was typed",
                      next=f"read {addr} and clear or finish that line first", ref=addr, provider="herdr", outcome="composer_not_empty")
    line = f"{args.text}  # {AUTOMATED_MARKER}" if args.automated else args.text
    ran = fleet_remote.run_herdr(sock, ["pane", "run", pane_id, line], local=local)
    if ran.returncode != 0:
        raise Unreachable(f"{addr}: pane run failed ({(ran.stderr or ran.stdout or '').strip()[:160]})", next=f"read {addr}", ref=addr, provider="herdr", outcome="failed")
    note = "ran in the pane's shell (herdr pane run); a shell pane has no agent status: `read <addr> --tail` shows what it printed" + ("; --wait does not apply to a shell pane" if args.wait else "")
    identity = identity_from_agent_row(machine_key, sock, local, pane)
    return emit("sent", provider="herdr", ref=addr, submitted=True, needed_enter=False, status="no_agent", liveness_only=True, delivery="typed", via="pane run",
                automated=bool(args.automated), note=note, next=f"read {addr} --tail", receipt=receipt("Ran a line in the shell of", identity, asked_by=args.asked_by, detail=f"{len(args.text)} chars" + (", automated" if args.automated else "")))


def prompt_text(value: str | None) -> str | None:
    """`--prompt-file <path|->`: the brief, read from a file or stdin."""
    if value is None:
        return None
    if value == "-":
        return sys.stdin.read()
    try:
        with open(value, encoding="utf-8") as handle:
            return handle.read()
    except OSError as exc:
        raise Usage(f"--prompt-file {value}: {exc}")


# herdr 0.9.0 refuses a kind it does not manage with exit 2 and plain-text
# stderr `unsupported interactive agent kind: <kind>` (measured; no JSON).
UNSUPPORTED_KIND_TEXT = "unsupported interactive agent kind"


def left_next(addr: str) -> str:
    """The next step after an `open` that left a pane behind: look at it, or remove it (QA r10 FM-2)."""
    return f"read {addr}; close {addr} --confirm \"<the human's words>\" removes the pane it left"


def herdr_open(args, machine_key: str, kind: str, cwd: str, name: str) -> int:
    """`open` on a Herdr machine: start a new agent there and, when asked, brief it.

    Herdr primitives only: `workspace create` (labelled with `--name`), then
    `agent start --kind` for a kind Herdr manages; when Herdr does not know
    the kind, the fallback runs it as the engine command (`pane run`, then
    `agent wait` for the first ready state); then `agent prompt --wait` for
    the brief. Per turn, on a human-named machine. `--prompt` is the only
    flag beyond the ones `spawn` always had: `--name` is both the agent's
    live name and the workspace label, and the agent binary comes from the
    machine's own PATH and environment (no env passthrough: launch-
    environment inheritance stays deferred)."""
    progress: list[str] = []
    sock, local = resolve_server(machine_key, start=True, progress=progress)   # a stopped remote Herdr server is started, never asked about
    try:
        taken = {a.get("name") for a in fleet_remote.snapshot_agents(sock)[0] if a.get("name")}
    except FleetError:
        taken = set()
    name = unique_name(name, taken, exact=args.exact_name, ref=f"{machine_key}/{name}", progress=progress)
    brief = prompt_text(args.prompt_file)
    try:
        kind_argv = shlex.split(kind)   # the fallback runs the kind as a command; a broken quote fails before anything exists
    except ValueError as exc:
        raise Usage(f"--engine {kind!r}: {exc}")
    if not kind_argv:
        raise Usage("--engine must not be empty")
    cwd_args = ["--cwd", cwd] if cwd else []
    posture = fleet_tmux.posture_flags(kind_argv + list(args.engine_arg), unattended=bool(args.unattended))   # owner ruling 2026-09-19 (#38715): the engine's own flag, only when asked
    engine_args = list(args.engine_arg) + posture
    if args.worktree:
        created = fleet_remote.herdr_json(sock, ["worktree", "open", "--path", args.worktree, "--label", args.label or name, "--no-focus"], local=local)["result"]
        progress.append(f"opened worktree {args.worktree} as workspace {name}")
    else:
        created = fleet_remote.herdr_json(sock, ["workspace", "create", "--label", args.label or name, "--no-focus", *cwd_args], local=local)["result"]
        progress.append(f"created workspace {name}" + (f" in {cwd}" if cwd else ""))
    pane = created.get("root_pane") or {}
    pane_id = pane.get("pane_id")
    if not pane_id:
        raise Unreachable(f"{machine_key}: Herdr created no pane for the new session", ref=machine_key, provider="herdr")
    workspace_id = pane.get("workspace_id") or (created.get("workspace") or {}).get("workspace_id")
    via = "agent start"
    start_args = ["agent", "start", name, "--kind", kind, "--pane", pane_id, "--timeout", str(args.timeout)]
    if engine_args:
        start_args += ["--", *engine_args]
    left = {"created": True, "pane_id": pane_id, "progress": progress}   # every failure from here: the pane exists, and what `open` did first (a server start) stays visible
    if shell_kind(kind_argv):
        # a shell pane (QA r11 FM-4): the shell runs through `pane run` like any unmanaged command, but nothing waits for an
        # agent Herdr will never detect; the row is liveness only and `send --type` runs a line in it through `pane run`
        typed = fleet_remote.run_herdr(sock, ["pane", "run", pane_id, " ".join(shlex.quote(a) for a in [*kind_argv, *engine_args])], local=local)
        if typed.returncode != 0:
            raise Unreachable(f"{machine_key}: `{kind}` could not be run in pane {pane_id} ({(typed.stderr or typed.stdout or '').strip()[:160]}); the pane stays open",
                              next=left_next(f"{machine_key}/{pane_id}"), ref=f"{machine_key}/{pane_id}", provider="herdr", detail=left)
        progress.append(f"started {kind} via pane run in pane {pane_id} (no_agent: a shell pane, liveness only)")
        identity = identity_from_agent_row(machine_key, sock, local, {"pane_id": pane_id, "cwd": cwd, "agent": kind})
        with fleet_session.State() as state:
            handle = state.bind(machine_key, pane_id, {"agent": kind, "name": name, "cwd": cwd, "status": "no_agent", "status_since": time.time(), "purpose": args.purpose or "",
                                                       "provider": "herdr", "server": identity["server"], "liveness_only": True})
        note = "a shell pane has no agent status (liveness only); `send <addr> \"<command>\" --type` runs a line in its shell" + ("; the brief was not sent" if brief is not None else "")
        return emit("opened", provider="herdr", ref=f"{machine_key}/{pane_id}", progress=progress, unattended=bool(args.unattended), posture=posture, handle=handle, mode="herdr",
                    addr=f"{machine_key}/{pane_id}", machine=machine_key, name=name, engine=kind, via="pane run", workspace_id=workspace_id, pane_id=pane_id, status="no_agent",
                    liveness_only=True, prompt=None, note=note, identity=identity, created=True, purpose=args.purpose or "",
                    receipt=receipt("Opened", identity, asked_by=args.asked_by, detail=f"{kind} in {cwd or '~'}, a shell pane"))
    try:
        proc = fleet_remote.run_herdr(sock, start_args, local=local, timeout=args.timeout / 1000 + 30)
    except FleetTimeout:
        raise Unreachable(f"{machine_key}: agent start timed out; the pane {pane_id} stays open", next=left_next(f"{machine_key}/{pane_id}"),   # the pane it left, like the other arms
                          ref=f"{machine_key}/{pane_id}", provider="herdr", detail=left)
    try:
        result = json.loads(proc.stdout or proc.stderr or "{}")
    except ValueError:
        result = {}
    error = result.get("error") or {}
    status = (result.get("result") or {}).get("agent", {}).get("agent_status") or error.get("code") or "unknown"
    note = error.get("message", "")
    if proc.returncode != 0 and not note:
        # herdr answered without JSON: the exit-2 kind refusal (matched below) or a
        # plain-text hard failure (panic, usage error) whose text is the only detail.
        note = (proc.stderr or proc.stdout or "").strip()
    raw = f"{proc.stdout or ''}{proc.stderr or ''}".lower()
    if proc.returncode != 0 and UNSUPPORTED_KIND_TEXT in raw:
        # The fallback: Herdr has no manager for this engine, so run its
        # command in the pane and wait for the agent it detects to be ready.
        via = "pane run"
        # ONE string: real `pane run` space-joins its arguments unquoted and succeeds with an empty stdout (the exit status is the receipt)
        typed = fleet_remote.run_herdr(sock, ["pane", "run", pane_id, " ".join(shlex.quote(a) for a in [*kind_argv, *engine_args])], local=local)
        if typed.returncode != 0:
            raise Unreachable(f"{machine_key}: `{kind}` could not be run in pane {pane_id} ({(typed.stderr or typed.stdout or '').strip()[:160]}); the pane stays open",
                              next=left_next(f"{machine_key}/{pane_id}"), ref=f"{machine_key}/{pane_id}", provider="herdr", detail=left)
        try:
            waited = fleet_remote.herdr_json(sock, ["agent", "wait", pane_id, "--until", "idle", "--until", "blocked", "--timeout", str(args.timeout)],
                                local=local, timeout=args.timeout / 1000 + 30)
        except FleetError as exc:
            # No agent became ready behind the command: that is a failed spawn,
            # reported as one — the pane stays open for the human to inspect.
            raise Unreachable(f"{machine_key}: `{kind}` ran in pane {pane_id} but no agent became ready ({exc}); the pane stays open",
                              next=left_next(f"{machine_key}/{pane_id}"), ref=f"{machine_key}/{pane_id}", provider="herdr", detail=left)
        status = wait_status(waited) or "idle"
        note = ""
        try:
            fleet_remote.herdr_json(sock, ["agent", "rename", pane_id, name], local=local)   # the human's name, as `agent start` would have set it
        except FleetError as exc:
            note = f"agent rename: {exc}"
    elif proc.returncode != 0 and status != "agent_not_ready":
        raise Unreachable(f"{machine_key}: agent start failed ({status}: {note or 'no detail'}); the pane {pane_id} stays open",
                          next=left_next(f"{machine_key}/{pane_id}"), ref=f"{machine_key}/{pane_id}", provider="herdr", detail=left)
    progress.append(f"started {kind} via {via} in pane {pane_id} ({status})")
    prompt_report = None
    if brief is not None:
        # The brief's first-state wait shares `--timeout` with the start/wait step.
        prompt_cmd = ["agent", "prompt", pane_id, brief, "--wait", "--timeout", str(args.timeout)]
        try:
            run = fleet_remote.run_herdr(sock, prompt_cmd, local=local, timeout=args.timeout / 1000 + 30)
            prompt_report = {"submitted": run.returncode == 0, "status": agent_status(sock, local, pane_id)}
            if run.returncode != 0:
                prompt_report["error"] = (run.stderr or run.stdout).strip()[:300]
        except FleetTimeout:
            prompt_report = {"submitted": False, "error": "prompt timed out"}
    if prompt_report is not None:
        progress.append("brief " + ("submitted" if prompt_report.get("submitted") else f"not submitted ({prompt_report.get('error', '')})"))
    identity = identity_from_agent_row(machine_key, sock, local, {"pane_id": pane_id, "cwd": cwd, "agent": kind})   # one builder: `status` names the same session
    with fleet_session.State() as state:
        handle = state.bind(machine_key, pane_id, {"agent": kind, "name": name, "cwd": cwd, "status": status, "status_since": time.time(), "purpose": args.purpose or "",
                                                   "provider": "herdr", "server": identity["server"]})
    ok = prompt_report is None or prompt_report.get("submitted")
    return emit("opened" if ok else "failed", provider="herdr", ref=f"{machine_key}/{pane_id}", progress=progress, unattended=bool(args.unattended), posture=posture, mode="herdr",
                next=("" if ok else f"read {handle} before re-sending the brief"), handle=handle, addr=f"{machine_key}/{pane_id}", machine=machine_key,
                name=name, engine=kind, via=via, workspace_id=workspace_id, pane_id=pane_id, status=status, prompt=prompt_report, note=note,
                identity=identity, created=True, purpose=args.purpose or "", receipt=receipt("Opened", identity, asked_by=args.asked_by, detail=f"{kind} in {cwd or '~'}"))


def cmd_wait(args) -> int:
    """`agent wait` on one Herdr session (the provider-native wait, never a poll): `reached` says whether a
    wanted state was seen before `--duration` passed; the status is what Herdr reported last."""
    machine_key, target = fleet_session.parse_addr(args.addr)
    require_herdr(args.addr, machine_key, "wait")
    if fleet_session.split_machine(machine_key)[0] != LOCAL:
        find_machine(fleet_session.split_machine(machine_key)[0], all_machines())   # a typo'd label is a usage error, never a silent timeout
    if args.duration <= 0:
        raise Usage("--duration must be positive (seconds the helper waits at most)", ref=args.addr)   # 0 would read as "unset" downstream, not as an instant probe
    sock, local = resolve_server(machine_key)
    target = by_label(sock, target)
    until = [state.strip() for group in (args.until or []) for state in group.split(",") if state.strip()] or ["idle", "done", "blocked"]   # verbs.md: the default wanted states; `"idle, done"` is two states
    # `--duration` is the helper's own wall (a typed FleetTimeout, never a word read out of provider prose);
    # Herdr's `--timeout` is a 5 s backstop behind it, so a Herdr-side error is always a failure envelope
    # (`no_such_session`, exit 3, for a target Herdr does not know; exit 6 otherwise), never a calm `waited`.
    argv = ["agent", "wait", target, "--timeout", str(int((args.duration + 5) * 1000))]
    for state_name in until:
        argv += ["--until", state_name]
    try:
        waited = fleet_remote.herdr_json(sock, argv, local=local, timeout=args.duration)
    except FleetTimeout as exc:
        return emit("waited", provider="herdr", ref=args.addr, reached=False, status=agent_status(sock, local, target), note=str(exc), next=f"read {args.addr} --tail")
    status = wait_status(waited) or "unknown"
    return emit("waited", provider="herdr", ref=args.addr, reached=status in until, status=status)


def wait_status(reply: dict) -> str:
    """The agent state an `agent wait` reply carries: Herdr 0.9.0 answers `{"result": {"type": "agent_info",
    "agent": {"agent_status": ...}}}` (measured, QA r8 FM2 D3); no known Herdr answers a flat `result.agent_status`."""
    return ((reply.get("result") or {}).get("agent") or {}).get("agent_status") or ""


# ---------------------------------------------------------------- dispatch helpers


def target_machine(machine_key: str) -> dict | None:
    """The machine row for `machine[:server]` (None for local); unknown labels are a usage error."""
    label = fleet_session.split_machine(machine_key)[0]
    return None if label == LOCAL else find_machine(label, all_machines())


def target_provider(machine_key: str, addr: str | None = None) -> str:
    """The provider serving an address: the handle's recorded provider, else the machine's."""
    if addr and fleet_session.HANDLE_RE.match(addr):
        with fleet_session.State() as state:
            entry = state.data["handles"].get(addr) or {}
        if entry.get("provider"):
            return _LOCAL_PROVIDER.get("override") or entry["provider"]
    return machine_provider(target_machine(machine_key))


LABEL_KINDS = ("pane", "title", "tab", "workspace")   # most specific first: a pane's own label beats the workspace it sits in


def by_label(sock: str, target: str) -> str:
    """A Herdr target as a human names it (ruling 17, the fleet side; QA r10 parity D6): a pane id or an agent's name
    passes through; otherwise the pane whose label matches — its own label, its terminal title, its tab's label or its
    workspace's label — exact first, then a unique case-insensitive match. Two panes matching name the candidates; no
    match leaves the target for Herdr's own not-found answer."""
    if ":" in target:
        return target
    try:
        agents, snap = fleet_remote.snapshot_agents(sock)
    except FleetError:
        return target
    if any(a.get("name") == target for a in agents):
        return target
    tabs = {t.get("tab_id"): t.get("label") for t in snap.get("tabs") or []}
    spaces = {w.get("workspace_id"): w.get("label") for w in snap.get("workspaces") or []}
    labelled = []
    for pane in snap.get("panes") or agents:
        labels = {"pane": pane.get("label"), "title": pane.get("terminal_title_stripped") or pane.get("terminal_title"),
                  "tab": tabs.get(pane.get("tab_id")), "workspace": spaces.get(pane.get("workspace_id"))}
        labelled.append((pane.get("pane_id"), {kind: str(label) for kind, label in labels.items() if label}))
    for same in (lambda a, b: a == b, lambda a, b: a.casefold() == b.casefold()):
        for kind in LABEL_KINDS:
            hits = [(pane_id, labels[kind]) for pane_id, labels in labelled if kind in labels and same(labels[kind], target)]
            if len(hits) == 1:
                return hits[0][0]
            if hits:
                names = ", ".join(f"{pane_id} ({kind} {label!r})" for pane_id, label in hits)
                raise Refused(f"{target!r} names more than one pane: {names}", next="address it by pane id (machine/<pane-id>) or by its handle from `list`", provider="herdr")
    return target


def find_named(token: str) -> tuple[str, str]:
    """(machine[:server], ref) for a session a human names, when the name looks like a handle nobody minted (`send s17 …`:
    the owner's own sentence, QA r11 parity N11). One fleet read; every row's name and the labels a human sees are tried,
    exact first, then a unique case-insensitive match. Two answers name the candidates; none is `no_such_session`."""
    rows = fleet_inventory()
    candidates = []
    for row in rows:
        for agent in row.get("agents", []):
            names = [agent.get("name"), agent.get("title"), *(agent.get("labels") or {}).values()]
            candidates.append((row["machine"], agent.get("pane_id"), [str(n) for n in names if n]))
    for same in (lambda a, b: a == b, lambda a, b: a.casefold() == b.casefold()):
        hits = [(machine, ref) for machine, ref, names in candidates if any(same(name, token) for name in names)]
        if len(hits) == 1:
            return hits[0]
        if hits:
            named = ", ".join(f"{machine}/{ref}" for machine, ref in hits)
            raise Refused(f"{token!r} names more than one session: {named}", next="address it by machine/<ref> or by its handle from `list`", ref=token, outcome="refused")
    raise Refused(f"{token!r} is no handle, and no session or label on any machine is named {token!r}",
                  next="list (it shows every handle and every session)", ref=token, outcome="no_such_session")


def require_herdr(addr: str, machine_key: str, verb: str) -> None:
    provider = target_provider(machine_key, addr)
    if provider == "tmux":
        raise fleet_tmux.unsupported(verb, addr, target_machine(machine_key))
    if provider == "msp":
        # a session on an MSP host has no pane, no dialog and no Herdr wait: the verb stops here, never at the Herdr CLI
        raise Unsupported(f"{verb}: a session on an MSP host has no pane or dialog (its pending requests are host-manager's `pending`)",
                          next=f"read {addr} --tail", ref=addr, provider="msp")
    if provider == "none":
        raise Unsupported(f"no session provider serves {addr} (neither Herdr nor tmux)", next="doctor", ref=addr, provider="none")


def asked_by_of(args) -> str | None:
    return getattr(args, "asked_by", None)


def identity_from_agent_row(machine_key: str, sock: str, local: bool, agent: dict) -> dict:
    machine_label, server = fleet_session.split_machine(machine_key)
    # `server` is the socket the verb used — for a remote machine the local forward, the same path every write
    # resolves through `resolve_server` and `list` syncs; a guessed remote-home path would make the first write drift
    return {"provider": "herdr", "machine": machine_label, "server": sock,
            "session": server or (fleet_remote.local_session_name(sock) if local else "default"), "ref": agent.get("pane_id"), "cwd": agent.get("cwd"), "engine": agent.get("agent")}


def agent_or_pane(sock: str, local: bool, target: str, addr: str) -> dict:
    """The agent row for `target`, or — for a pane id Herdr counts no agent in (an `open` whose engine never came up,
    QA r10 FM-2) — its pane row from the server snapshot with `agent_status: no_agent`. An address neither answers to
    is `no_such_session`, naming the address (FM-4)."""
    try:
        return fleet_remote.herdr_json(sock, ["agent", "get", target], local=local)["result"]["agent"]
    except Refused as exc:
        if exc.outcome != "no_such_session":
            raise
        if ":" in target:   # a pane id, not a name: the pane may exist without an agent
            try:
                panes = fleet_remote.snapshot_agents(sock)[1].get("panes") or []
            except FleetError:
                panes = []
            for pane in panes:
                if pane.get("pane_id") == target:
                    return {**pane, "agent_status": "no_agent"}
        raise Refused(f"{addr}: no session or pane by that address ({exc})", next=exc.next, ref=addr, provider="herdr", outcome="no_such_session")


def herdr_identity(machine_key: str, sock: str, local: bool, target: str) -> dict:
    """The live tuple for a receipt; a target Herdr cannot resolve leaves the ref as given."""
    try:
        agent = fleet_remote.herdr_json(sock, ["agent", "get", target], local=local)["result"]["agent"]
    except FleetError:
        agent = {"pane_id": target}
    return identity_from_agent_row(machine_key, sock, local, agent)


# ---------------------------------------------------------------- read verbs


def cmd_list(args) -> int:
    """The board: one line per session, blocked first, handles, ages, every machine with its state."""
    rows, _events = inventory_with_handles(args.machine)
    dialogs = collect_dialogs(rows, all_machines(), chars=140) if args.dialogs else {}
    with fleet_session.State() as state:
        text = render_board(rows, state.data, hint=args.hint, dialogs=dialogs)
    sock = fleet_remote.default_local_socket()
    provider = local_provider()
    return emit("listed", provider=provider,
                text=text, inventory=render_inventory(rows), rows=rows, local_socket=sock, local_session=fleet_remote.local_session_name(sock), address_grammar=fleet_session.ADDRESS_GRAMMAR,
                next=("" if any(r["online"] for r in rows) else "doctor"))


def cmd_machines(args) -> int:
    machines = all_machines()
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(len(machines) or 1, 32))) as pool:
        rows = list(pool.map(fleet_connect.machine_reachability, machines))
    shadowed = [m for m in fleet_machines.merged(list_machines() if herdr_available() else None) if m.get("shadowed")]
    first_bad = next((r for r in rows if r["reachability"] != "connected"), None)
    lines = []
    for row in rows:
        detail = (f"{row.get('provider')} {row.get('server_version') or ''}".strip() if row["reachability"] == "connected"
                  else f"{row.get('note', '')}; next: {row.get('next', '')}")
        lines.append(f"{row['label']}\t{row['target']}\t{row.get('state') or row['reachability']}\t{detail}")
    text = "\n".join(lines) or "no machines (connect <ssh-target> --label <name>)"
    extra = msp_report()
    if extra.get("notes"):
        text += ("\n" if text else "") + "\n".join(extra["notes"])
    return emit("machines", provider=local_provider(), machines=rows, text=text, local_protocol=local_protocol() if herdr_available() else None,
                directory=fleet_machines.directory_path(), herdr_authoritative=herdr_available(), shadowed=[m["label"] for m in shadowed],
                address_grammar=fleet_session.ADDRESS_GRAMMAR, next=(first_bad["next"] if first_bad else ("connect <ssh-target> --label <name>" if not rows else "")), **extra)


def msp_report() -> dict:
    """The `msp` summary a listing verb carries with the flag on (`state`, `note`, `hosts`), plus `notes` — the one line a
    reader needs when the source is not available; nothing at all with the flag off (the old path)."""
    if not fleet_remote.msp_enabled():
        return {}
    source = fleet_remote.msp_source()
    report = {"msp": {"state": source["state"], "note": source["note"], "retry": source.get("retry"), "cli": source.get("cli")}}
    if source["state"] != "available":
        report["notes"] = [source["note"]]
        return report
    scope = fleet_remote.msp_scope()
    report["msp"].update(hosts=[h["host"] for h in scope["hosts"]], directory={"advertising": scope["advertising"], "shown": len(scope["hosts"]), "not_shown": scope["not_shown"]})
    if scope["note"]:
        report["notes"] = [scope["note"]]
    return report


def cmd_status(args) -> int:
    report = fleet_session.status(args.addr)
    return emit("status", provider=report.get("provider"), ref=args.addr, **{k: v for k, v in report.items() if k not in ("provider", "capabilities")})


def cmd_read(args) -> int:
    """The session's recent output; `--tail` is the last lines of its visible screen plus the native `status`."""
    machine_key, target = fleet_session.parse_addr(args.addr)
    provider = target_provider(machine_key, args.addr)
    if provider == "msp":
        host, session_id = msp_ref(machine_key, target)
        line = fleet_remote.host_manager_msp(["read", f"{host}/{session_id}", "--lines", str(args.lines)] + (["--tail"] if args.tail else []), ref=args.addr, next_hint="list")
        lines = [str(l) for l in (line.get("lines") or [])][-args.lines:]
        return emit("read", provider="msp", ref=args.addr, status=msp_status_word(line.get("group")), group=line.get("group"),
                    text="\n".join(lines) or "(no output from the session yet)", lines=lines, host=host)
    if provider == "tmux":
        lines = fleet_tmux.capture(target_machine(machine_key), target, lines=args.lines)
        text = "\n".join(lines[-args.lines:])
        return emit("read", provider="tmux", ref=args.addr, status="alive", text=text or "(no output on screen yet)", lines=lines[-args.lines:])
    require_herdr(args.addr, machine_key, "read")
    sock, local = resolve_server(machine_key)
    target = by_label(sock, target)
    if not args.tail:
        proc = fleet_remote.run_herdr(sock, ["agent", "read", target, "--source", args.source, "--lines", str(args.lines)], local=local)
        if proc.returncode != 0 and ":" in target and "agent_not_found" in (proc.stderr or proc.stdout or ""):
            # a pane Herdr detects no agent in (an `open` whose engine never came up): its own screen is the answer (QA r8 FM1 D3)
            proc = fleet_remote.run_herdr(sock, ["pane", "read", target, "--source", args.source, "--lines", str(args.lines)], local=local)
            if proc.returncode == 0:
                return emit("read", provider="herdr", ref=args.addr, status="no_agent", text=proc.stdout, raw=True, note="no agent detected in this pane: its raw screen")
        if proc.returncode != 0:
            code, detail = fleet_remote.herdr_error_detail(proc.stderr or proc.stdout)
            if code in ("agent_not_found", "pane_not_found"):
                raise Refused(f"{args.addr}: no session or pane by that address ({detail})", next="list (it shows every live session)", ref=args.addr, provider="herdr", outcome="no_such_session")
            raise Unreachable(f"{args.addr}: {(proc.stderr or proc.stdout).strip()[:200]}", next="list", ref=args.addr, provider="herdr")
        return emit("read", provider="herdr", ref=args.addr, status=agent_status(sock, local, target), text=proc.stdout, raw=True)
    agent = agent_or_pane(sock, local, target, args.addr)
    status = agent.get("agent_status")
    tail_lines = args.lines
    if status == "no_agent":
        # an agentless pane (a shell pane): its own screen, as drawn, is the tail (QA r11 FM-4)
        proc = fleet_remote.run_herdr(sock, ["pane", "read", agent["pane_id"], "--source", "visible", "--lines", str(max(tail_lines * 3, 40))], local=local)
        if proc.returncode != 0:
            raise Unreachable(f"{args.addr}: {(proc.stderr or proc.stdout).strip()[:200]}", next="list", ref=args.addr, provider="herdr")
        lines = squeeze_lines(proc.stdout)[-tail_lines:]
        return emit("read", provider="herdr", ref=args.addr, status="no_agent", liveness_only=True, text="\n".join(lines) or "(no output on screen yet)", lines=lines)
    lines = read_progress(sock, local, target, lines=tail_lines, strict=True)[-tail_lines:]   # this read IS the answer: a dead herdr is exit 6, never a quiet screen
    text = "\n".join(lines)
    if len(text) > args.chars:
        text = "…" + text[-args.chars:]
    return emit("read", provider="herdr", ref=args.addr, status=status, text=text or "(no output on screen yet)", lines=lines)


def cmd_dialog(args) -> int:
    machine_key, target = fleet_session.parse_addr(args.addr)
    require_herdr(args.addr, machine_key, "dialog")
    sock, local = resolve_server(machine_key)
    target = by_label(sock, target)
    pane_id = target if ":" in target else fleet_remote.herdr_json(sock, ["agent", "get", target], local=local)["result"]["agent"]["pane_id"]
    lines = read_dialog(sock, local, pane_id, lines=args.lines)
    return emit("dialog", provider="herdr", ref=args.addr, status=agent_status(sock, local, target), lines=lines,
                text="\n".join(lines) if lines else "(screen is empty)", next=("" if lines else f"read {args.addr}"))


def cmd_detect(args) -> int:
    progress: list[str] = []
    report = fleet_connect.detect(override=_LOCAL_PROVIDER.get("override"), start_server=not args.no_start, install=not args.no_install, progress=progress)
    outcome = "detected" if report["provider"] != "none" else "no_provider"
    return emit(outcome, provider=report["provider"],
                progress=progress, next=("" if outcome == "detected" else "install tmux or Herdr, then rerun detect"), **{k: v for k, v in report.items() if k != "provider"})


def cmd_doctor(args) -> int:
    report, outcome, next_cmd = fleet_connect.doctor(override=_LOCAL_PROVIDER.get("override"), start_server=not args.no_start, install=not args.no_install)
    provider = report["providers"].get("provider", "none")
    progress = report.pop("progress", [])
    return emit(outcome, provider=provider,
                progress=progress, next=next_cmd, **report)


def cmd_context(args) -> int:
    report = fleet_context.build(reset=args.reset)
    report.pop("capabilities", None)
    return emit("context", provider=report.pop("provider"), progress=report.pop("progress", []), next=report.pop("next", ""), **report)


def cmd_resources(args) -> int:
    machines = [None] if args.machine in (None, LOCAL) else [target_machine(args.machine)]   # `resources [<machine>]`, positional like list/open/forget
    if args.machine is None:
        machines += all_machines()
    rows = []
    for machine in machines:
        rows.append(fleet_context.resources_row(machine))
    return emit("resources", provider=local_provider(), machines=rows)


def cmd_fetch(args) -> int:
    """One report or library file home from a machine, by content hash: an unchanged hash copies nothing."""
    label = fleet_session.split_machine(args.machine)[0]
    if label == LOCAL:
        raise Usage("local files need no fetch: read them in place; fetch takes a machine other than local", next="machines (pick a machine label)", ref=args.machine)
    machine = target_machine(args.machine)
    if machine_provider(machine) == "msp":
        # never an ssh step toward an MSP host id: the transport carries no files
        raise Unsupported(f"fetch {label}: an MSP host has no shell or file path this skill reaches (a transport id is not an ssh target)",
                          next=f"read {label}/<session> --tail", ref=f"{label}:{args.path}", provider="msp")
    progress: list[str] = []
    result = fleet_remote.fetch(machine, args.path, progress=progress)
    return emit("fetched", provider=machine_provider(machine), ref=f"{label}:{args.path}", progress=progress, **result)


def cmd_attach(args) -> int:
    """The command a human runs to sit in front of the session; nothing is executed here."""
    machine_key, target = fleet_session.parse_addr(args.addr)
    provider = target_provider(machine_key, args.addr)
    machine = target_machine(machine_key)
    if provider == "msp":
        host, session_id = msp_ref(machine_key, target)
        line = fleet_remote.host_manager_msp(["attach", f"{host}/{session_id}"], ref=args.addr, next_hint="list")
        command = str(line.get("command") or "")
        return emit("attach_command", provider="msp", ref=args.addr, command=command, next=f"run in your own terminal: {command}",
                    note="an MSP session has no terminal to sit in: the command follows its output")
    if provider == "tmux":
        command = fleet_tmux.attach_command(machine, target)
    else:
        require_herdr(args.addr, machine_key, "attach")
        try:
            target = by_label(resolve_server(machine_key)[0], target)   # a label attaches to its pane; a server that cannot be asked keeps the words
        except FleetError:
            pass
        command = herdr_attach_command(machine, target)
    return emit("attach_command", provider=provider, ref=args.addr, command=command, next=f"run in your own terminal: {command}")


# ---------------------------------------------------------------- write verbs


def notification_line(addr: str, shown: bool, why: str | None = None) -> dict:
    """What every notification-form `send` carries: the outcome (`notified` when Herdr reports it shown; `not_shown`
    for a tmux status-line message, which reaches only an attached client, or a Herdr `shown: false`), `shown`, a
    `message` saying the agent got nothing, and the exact typed form as `next` — owner report 2026-09-20 (#38715
    ruling 18: a steer sent as a bare `send` was reported delivered while the agent in the pane never saw it;
    round-10 engines lane D7 on the two never-shown shapes)."""
    message = (f"nothing was typed; the agent in {addr} did not receive this (a human watching the pane may have)" if shown
               else f"nothing was typed, and nobody saw it ({why}); the agent in {addr} did not receive this")
    return {"outcome": "notified" if shown else "not_shown", "shown": shown, "message": message,
            "next": f'for the agent: send {addr} "<text>" --type (relayed text: send {addr} "<text>" --type --automated)'}


def cmd_send(args) -> int:
    """Default: a notification a human watching the pane sees; the agent gets nothing. `--type`: typed into the session, guarded."""
    machine_key, target = fleet_session.parse_addr(args.addr)
    provider = target_provider(machine_key, args.addr)
    if provider == "msp":
        return msp_send(args, machine_key, target)
    if args.steer:
        raise Usage("--steer is for a session on an MSP host (it steers the running turn); a Herdr or tmux session takes `send --type`", next=f"send {args.addr} \"<text>\" --type", ref=args.addr)
    if args.keys:
        if provider == "tmux":
            raise fleet_tmux.unsupported("send --keys", args.addr, target_machine(machine_key))
        require_herdr(args.addr, machine_key, "send --keys")
        fleet_session.check(args.addr, nothing="sent")
        return herdr_keys(args, machine_key, target)
    if not args.text:
        raise Usage("send needs text (or --keys)", next=f"send {args.addr} \"<text>\"", ref=args.addr)
    fleet_session.check(args.addr, nothing="sent")   # FR-38715-7: every write checks the tuple first — the notification form included
    if args.type:
        if provider == "tmux":
            result = fleet_tmux.guarded_send(target_machine(machine_key), target, args.text, automated=bool(args.automated), asked_by=asked_by_of(args),
                                             verify=not args.no_verify, verify_s=args.verify_seconds)
            return emit("sent", provider="tmux", ref=args.addr, delivery="typed", **result)
        require_herdr(args.addr, machine_key, "send --type")
        return herdr_type(args)
    text = f"{AUTOMATED_MARKER} {args.text}" if args.automated else args.text
    if provider == "tmux":
        machine = target_machine(machine_key)
        fleet_tmux.find_session(machine, target)
        result = fleet_tmux.run(machine, ["display-message", "-t", f"={target}:", "-d", "0", "--", text])   # `--`: text that starts with a dash is text
        if not result.ok:
            raise Unreachable(f"{args.addr}: display-message failed ({(result.get('stderr') or '').strip()})", ref=args.addr, provider="tmux")
        line = notification_line(args.addr, shown=False, why="a tmux status-line message reaches only an attached client")
        return emit(line.pop("outcome"), provider="tmux", ref=args.addr, delivery="notification", automated=bool(args.automated),
                    receipt=receipt("Not shown", fleet_tmux.identity_of(machine, fleet_tmux.find_session(machine, target)), asked_by=asked_by_of(args), detail="tmux display-message; nothing was typed"),
                    **line)
    require_herdr(args.addr, machine_key, "send")
    sock, local = resolve_server(machine_key)
    target = by_label(sock, target)
    title = f"fleet-manager: {asked_by_of(args) or os.environ.get('USER') or 'message'}"
    answer = fleet_remote.herdr_json(sock, ["notification", "show", title, "--body", text], local=local)
    result = answer.get("result") if isinstance(answer.get("result"), dict) else answer   # herdr 0.9.0: {"id", "result": {"shown", "reason"}}
    shown = bool(result.get("shown"))
    reason = result.get("reason") or ("notifications off" if "shown" in result else "no shown report")   # an older Herdr answers no `shown`
    line = notification_line(args.addr, shown=shown, why=None if shown else f"Herdr did not show it: {reason}")
    return emit(line.pop("outcome"), provider="herdr", ref=args.addr, delivery="notification", automated=bool(args.automated),
                receipt=receipt("Notified" if shown else "Not shown", herdr_identity(machine_key, sock, local, target), asked_by=asked_by_of(args),
                                detail="herdr notification; nothing was typed" if shown else f"herdr notification {reason}; nothing was typed"),
                **line)


def herdr_keys(args, machine_key: str, target: str) -> int:
    """`send --keys`: named keys under the composer guard (a dialog is answered; typed text is never keyed over)."""
    sock, local = resolve_server(machine_key)
    target = by_label(sock, target)
    info = agent_info(sock, local, target)
    status = info.get("agent_status", "")
    held = composer_lines(sock, local, target, args.addr, engine=info.get("agent"))
    # a dialog's own choice row is not held text: keys are how a dialog is answered (QA r11 FM-3). A line a person typed is
    # held text even with a dialog above it — keying Enter there would submit their line (review of #39823).
    if held and status not in ("working", "blocked") and held[-1].strip() not in fleet_tmux.dialog_choice_rows(
            herdr_dialog(sock, local, info.get("pane_id") or target) if fleet_tmux.choice_shape(held[-1]) else []):
        raise Refused(f"{args.addr}: the composer already holds text ({held[-1][:60]!r}); no keys sent", next=f"read {args.addr} --tail and clear or finish that line first",
                      ref=args.addr, provider="herdr", outcome="composer_not_empty")
    fleet_remote.herdr_json(sock, ["agent", "send-keys", target, *args.keys], local=local)
    return emit("keys_sent", provider="herdr", ref=args.addr, sent=args.keys,
                receipt=receipt("Sent keys to", herdr_identity(machine_key, sock, local, target), asked_by=asked_by_of(args), detail=" ".join(args.keys)))


def cmd_stop(args) -> int:
    """Interrupt the session's current turn (ctrl+c). The session stays open."""
    machine_key, target = fleet_session.parse_addr(args.addr)
    provider = target_provider(machine_key, args.addr)
    fleet_session.check(args.addr, nothing="stopped")
    if provider == "msp":
        # no ctrl-c reaches a session on an MSP host (no pane); its work ends through `close`, which interrupts the running
        # turn and stops its tasks under the human's own words — never quietly under a verb that promises the session stays
        raise Unsupported(f"{args.addr}: an MSP session has no ctrl-c; ending its work is `close` (the running turn interrupted, its tasks stopped; the host keeps the row idle)",
                          next=f"close {args.addr} --confirm \"<the human's words>\"", ref=args.addr, provider="msp")
    if provider == "tmux":
        result = fleet_tmux.stop_session(target_machine(machine_key), target, asked_by=asked_by_of(args))
        return emit("interrupted", provider="tmux", ref=args.addr, **result)
    require_herdr(args.addr, machine_key, "stop")
    sock, local = resolve_server(machine_key)
    target = by_label(sock, target)
    agent = agent_or_pane(sock, local, target, args.addr)
    if agent.get("agent_status") == "no_agent":
        # an agentless pane has no agent to key: `pane send-keys` (tmux-style names; provider-notes) reaches its shell (QA r11 FM-4).
        # Like `pane run`, it prints NOTHING on success — its exit status is the receipt (measured live, FIX-FM5 arm B6).
        keyed = fleet_remote.run_herdr(sock, ["pane", "send-keys", agent["pane_id"], "c-c"], local=local)
        if keyed.returncode != 0:
            code, detail = fleet_remote.herdr_error_detail(keyed.stderr or keyed.stdout)
            raise Unreachable(f"{args.addr}: pane send-keys failed ({code + ': ' if code else ''}{detail[:160]})", next=f"read {args.addr}", ref=args.addr, provider="herdr", outcome="failed")
        return emit("interrupted", provider="herdr", ref=args.addr, sent="c-c", liveness_only=True,
                    receipt=receipt("Interrupted", identity_from_agent_row(machine_key, sock, local, agent), asked_by=asked_by_of(args), detail="c-c in the pane's shell"))
    fleet_remote.herdr_json(sock, ["agent", "send-keys", target, "ctrl+c"], local=local)
    return emit("interrupted", provider="herdr", ref=args.addr, sent="ctrl+c",
                receipt=receipt("Interrupted", herdr_identity(machine_key, sock, local, target), asked_by=asked_by_of(args), detail="ctrl+c"))


def cmd_close(args) -> int:
    """Close the session's pane. A live session needs --confirm "<the human's words>"."""
    machine_key, target = fleet_session.parse_addr(args.addr)
    provider = target_provider(machine_key, args.addr)
    fleet_session.check(args.addr, nothing="closed")
    if provider == "msp":
        host, session_id = msp_ref(machine_key, target)
        argv = ["close", f"{host}/{session_id}"] + (["--confirm", args.confirm] if args.confirm else [])
        line = fleet_remote.host_manager_msp(argv, ref=args.addr, next_hint=f"close {args.addr} --confirm \"<the human's words>\"")
        identity = fleet_remote.msp_identity(host, session_id, (line.get("identity") or {}).get("cwd"))
        with fleet_session.State() as state:
            handle = state.handle_for(host, session_id)
            if handle:
                state.data["handles"][handle].pop("opened_here", None)   # its work ended: it no longer keeps its host in the digest's scope
        return emit("closed", provider="msp", ref=args.addr, handle=handle, confirmed_by=args.confirm or "", closed=line.get("closed"), mode="msp",
                    note=f"its work ended; the session stays listed idle on host {host} until the host unloads it (gone is the host's own `not_found`)",
                    receipt=receipt("Closed", identity, asked_by=asked_by_of(args), detail=str(line.get("closed") or "over msp")[:120]))
    if provider == "tmux":
        result = fleet_tmux.close_session(target_machine(machine_key), target, confirm=bool(args.confirm), asked_by=asked_by_of(args))
        with fleet_session.State() as state:
            handle = state.handle_for(machine_key, target)
        return emit("closed", provider="tmux", ref=args.addr, handle=handle, confirmed_by=args.confirm or "", **result)
    require_herdr(args.addr, machine_key, "close")
    sock, local = resolve_server(machine_key)
    target = by_label(sock, target)
    agent = agent_or_pane(sock, local, target, args.addr)
    pane_id = agent["pane_id"]
    status = agent.get("agent_status")
    if status in ("working", "blocked") and not args.confirm:
        raise Refused(f"{args.addr} is live ({status}); close refused without --confirm", next=f"stop {args.addr} first, or rerun close {args.addr} --confirm \"<the human's words>\"",
                      ref=args.addr, provider="herdr", detail={"status": status}, outcome="session_live")
    fleet_remote.herdr_json(sock, ["pane", "close", pane_id], local=local)
    with fleet_session.State() as state:
        handle = state.handle_for(machine_key, pane_id)
    return emit("closed", provider="herdr", ref=args.addr, closed=f"{machine_key}/{pane_id}", handle=handle, confirmed_by=args.confirm or "",
                receipt=receipt("Closed", identity_from_agent_row(machine_key, sock, local, agent), asked_by=asked_by_of(args), detail=f"pane {pane_id}, was {status}"))


def repo_root_or_cwd() -> str:
    try:
        top = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, timeout=10, stdin=subprocess.DEVNULL)
        if top.returncode == 0 and top.stdout.strip():
            return top.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        pass
    return os.getcwd()


def auto_name(cwd: str) -> str:
    """A name a human recognises: the directory, cleaned — host-manager's rule (R-HM walkthrough H13 (#38715)); a taken name
    gets `-2`, `-3` in `unique_name`, never a global counter nobody recognises."""
    base = re.sub(r"[^A-Za-z0-9._-]+", "-", os.path.basename(os.path.abspath(cwd).rstrip("/"))).strip("-")
    return base or "session"


def unique_name(name: str, taken: set, *, exact: bool, ref: str, progress: list[str], provider: str = "herdr") -> str:
    if name not in taken:
        return name
    if exact:
        raise Refused(f"{ref}: the name is taken", next=f"status {ref}", outcome="name_taken", provider=provider)
    n = 2
    while f"{name}-{n}" in taken:
        n += 1
    progress.append(f"name {name} is taken: using {name}-{n}")
    return f"{name}-{n}"


def cmd_open(args) -> int:
    """Start a session: zero required arguments (engine muse, cwd the repo root, an auto-generated name, this host)."""
    machine_key = args.machine or LOCAL
    machine = target_machine(machine_key)
    provider = dispatch_provider(machine) if machine is not None else target_provider(machine_key)
    kind = args.engine or "muse"
    cwd = args.cwd or (repo_root_or_cwd() if fleet_session.split_machine(machine_key)[0] == LOCAL else None)
    name = args.name or auto_name(cwd or kind)
    progress: list[str] = []
    if provider == "msp":
        return msp_open(args, machine, kind, cwd, name)
    if provider == "tmux":
        machine = target_machine(machine_key)
        for flag, given in (("--worktree", args.worktree), ("--label", args.label)):
            if given:
                raise fleet_tmux.unsupported(f"open {flag}", f"{machine_key}/{name}", machine)
        listing = fleet_tmux.list_sessions(machine)
        if not listing["online"]:
            raise fleet_tmux.offline(machine, listing["note"], f"{machine_key}/{name}")
        taken = {r["ref"] for r in listing["sessions"]}
        name = unique_name(name, taken, exact=args.exact_name, ref=f"{machine_key}/{name}", progress=progress, provider="tmux")
        try:
            argv = shlex.split(kind) + list(args.engine_arg)
        except ValueError as exc:
            raise Usage(f"--engine {kind!r}: {exc}")
        # The brief is the engine's last argument (host-manager's rule: the engine takes its starter prompt on its
        # command line, so no readiness signal is needed); a shell would read it as a script to run, so a shell
        # session keeps the note and takes the brief through `send --type`.
        brief = prompt_text(args.prompt_file)
        note = ""
        if brief is not None and os.path.basename(argv[0]) in fleet_tmux.SHELLS:
            note = "a shell reads a trailing argument as a script: the brief was not sent; use `send --type` once the shell is ready"
        elif brief is not None:
            argv.append(brief)
        row = fleet_tmux.open_session(machine, name, cwd=cwd, argv=argv, asked_by=asked_by_of(args), unattended=bool(args.unattended))
        identity = fleet_tmux.identity_of(machine, row)
        with fleet_session.State() as state:
            handle = state.bind(machine_key, name, {"agent": row["engine"], "name": name, "cwd": row["cwd"], "status": row["status"], "status_since": time.time(),
                                                    "provider": "tmux", "server": identity["server"]})
        return emit("opened", provider="tmux", ref=f"{machine_key}/{name}", progress=progress + [f"tmux new-session {name}" + (f" in {cwd}" if cwd else "")], purpose=args.purpose or "",
                    handle=handle, addr=f"{machine_key}/{name}", machine=machine_key, name=name, engine=kind, via="tmux new-session", status=row["status"], identity=identity, mode="tmux",
                    unattended=bool(args.unattended), posture=fleet_tmux.posture_flags(argv, unattended=bool(args.unattended)), created=True, note=note, receipt=row["receipt"])
    if provider == "none":
        raise Unsupported(f"no session provider on {machine_key}", next="doctor", ref=machine_key, outcome="no_provider")
    return herdr_open(args, machine_key, kind, cwd, name)


def cmd_adopt(args) -> int:
    result = fleet_session.adopt(args.addr, name=args.name, asked_by=asked_by_of(args))
    provider = result.get("provider", "")
    return emit("adopted", provider=provider, ref=result["addr"], **{k: v for k, v in result.items() if k != "provider"})


def cmd_forget(args) -> int:
    reason = fleet_remote.msp_scope_reason(args.machine)
    saved = next((r for r in fleet_machines.load_directory() if r["label"] == args.machine and r.get("provider") == "msp"), None)
    advertised = fleet_remote.msp_directory_host(args.machine)
    if saved is not None or reason in ("held", "named") or (advertised is not None and reason not in ("own", "local")):
        # a `connect <host id>` row, or a host held only by sessions opened here (QA-B-43535 row 27: a closed session kept its host
        # in the digest): the host leaves the digest; its sessions stay on their host and their handles keep working by name
        if saved is not None:
            fleet_machines.remove(args.machine)
        released = fleet_remote.msp_release_host(args.machine)
        return emit("forgotten", provider="msp", ref=args.machine, confirmed_by=args.confirm or "", machine=args.machine, released_handles=released,
                    receipt=receipt("Forgot machine", args.machine, asked_by=asked_by_of(args), detail="an MSP host; its sessions stay on their host"),
                    note="the host still advertises; `connect` adds it back")
    if reason in ("own", "local"):
        raise Usage(f"{args.machine} is one of your own MSP hosts, not a saved row: it leaves the list when it stops advertising", next="machines", ref=args.machine, provider="msp")
    result = fleet_connect.forget(args.machine, confirm=bool(args.confirm))
    return emit("forgotten", provider=local_provider(), ref=args.machine, confirmed_by=args.confirm or "",
                receipt=receipt("Forgot machine", args.machine, asked_by=asked_by_of(args), detail=f"{result['live_sessions_left_running']} live session(s) left running"), **result)


def _clear_skip_window(label: str) -> None:
    """A successful `connect` clears the machine's outage skip window, so the
    next `context` probes it live instead of serving the stale cached row."""
    with fleet_session.State() as state_file:
        outages = state_file.data.get("outages")
        if outages:
            fleet_context.clear_skip_window(outages, label)


def cmd_connect(args) -> int:
    """`connect <label>`: re-forward a saved machine over its live master; `connect <ssh-target>`: the full one-login path."""
    known = {m.get("label"): m for m in all_machines()}
    machine = known.get(args.target) if not args.label else None
    advertised = fleet_remote.msp_directory_host(args.target) if not args.label else None
    if advertised is not None and (machine is None or machine_provider(machine) == "msp"):
        label = args.target
        source = fleet_remote.msp_source(fresh=True)   # asked again: the human wants the machine's state now
        if not fleet_remote.msp_ready(label):
            raise Unreachable(f"{label} advertises MSP but is offline right now ({source['note']})", next="machines", ref=label, provider="msp")
        progress = [f"{label}: advertises MSP and is online; nothing to log in to (a transport id is not an ssh target)"]
        if not any(r["label"] == label for r in fleet_machines.load_directory()):
            fleet_machines.upsert(label, label, provider="msp", verified=iso())   # saved: from now on the digest reads this host with yours
            progress.append(f"saved {label} as an MSP machine in {fleet_machines.directory_path()}")
        return emit("connected", provider="msp", ref=label, machine=label, state="connected", mode="msp", progress=progress,
                    receipt=receipt("Connected", {"provider": "msp", "machine": label, "ref": None}, asked_by=asked_by_of(args), detail="msp"),
                    next=f"open {label} --cwd <dir>")
    if machine is not None and machine_provider(machine) == "herdr":
        label = machine["label"]
        progress: list[str] = []
        if not machine.get("enabled", True):
            raise NeedsHuman(f"{label}: disabled in herdr machine list", next=next_step_for("disabled", machine), ref=label, provider="herdr")
        if not fleet_remote.master_alive(machine["target"], control_path=fleet_remote.control_path_for(machine)):
            state, next_step = machine_verdict(machine, f"ssh master down for {machine['target']}")
            if SLOT_FACT[:20] not in next_step:
                next_step += "; " + SLOT_FACT.format(target=machine["target"])
            if args.no_login:
                raise Unreachable(f"{label}: {state} — ssh master down for {machine['target']}", next=next_step, ref=label, provider="herdr")
            progress.append(f"{label}: ssh master down; opening one login")
            result = fleet_connect.connect(machine["target"], label=label, provider="herdr", session=args.session)
            result.pop("provider", None)
            _clear_skip_window(label)
            return emit("connected", provider="herdr", ref=label, progress=progress + result.pop("progress"), **result)
        session = args.session or fleet_remote.profile_session(machine)
        status = fleet_remote.forward_status(machine, session=session, reset=True)
        if status.get("master") is False:
            state, next_step = machine_verdict(machine, status["note"])
            raise Unreachable(f"{label}: {state} — {status['note']}", next=next_step, ref=label, provider="herdr")
        if not status.get("socket") or status.get("remote") is None:
            # Herdr is installed there but its server is down: start it over the same master (owner ruling, #38715)
            status = fleet_connect.ensure_remote_server(machine, progress, session=session)
        with fleet_session.State() as state_file:
            if label not in state_file.data["connected_once"]:
                state_file.data["connected_once"].append(label)
        _clear_skip_window(label)
        return emit("connected", provider="herdr", ref=label, progress=progress + [f"{label}: re-forwarded the Herdr socket over the live master"],
                    machine=label, session=session, state="connected", socket=status["socket"], server_version=status["remote"]["version"], protocol=status["remote"]["protocol"],
                    receipt=receipt("Reconnected", {"provider": "herdr", "machine": label, "ref": None}, asked_by=asked_by_of(args)))
    target = machine["target"] if machine is not None else args.target
    if args.no_login:
        raise NeedsHuman(f"{target}: connecting needs one interactive login", next=f"connect {target} --label {args.label or fleet_machines.label_for_target(target)} with a terminal attached",
                         ref=args.label or target)
    wanted = args.verify_mode or (args.mode if args.mode != "auto" else None)   # the global flag also names the mode to verify
    result = fleet_connect.connect(target, label=args.label or (machine or {}).get("label"), provider=wanted, session=args.session)
    provider = result.pop("provider")
    _clear_skip_window(result["machine"])
    return emit("connected", provider=provider, ref=result["machine"],
                progress=result.pop("progress"), receipt=receipt("Connected", f"{result['machine']} ({target})", asked_by=asked_by_of(args), detail=provider), **result)


# ---------------------------------------------------------------- sessions on an MSP host (host-manager's mode C, one call each)


def msp_status_word(group: str | None) -> str:
    return {"working": "working", "waiting-on-you": "blocked", "idle": "idle", "gone": "gone"}.get(group or "", "unknown")


def msp_ref(machine_key: str, target: str) -> tuple[str, str]:
    """`(host, session id)` for an address on an MSP host: the session id as given, or a session the human named on that host
    (one `sessions` read; exact name or title first, then a unique case-insensitive match)."""
    host = fleet_session.split_machine(machine_key)[0]
    if fleet_remote.MSP_UUID_RE.match(target):
        return host, target
    with fleet_session.State() as state:
        for entry in state.data["handles"].values():
            if entry.get("machine") == host and entry.get("provider") == "msp" and target in (entry.get("name"), entry.get("pane_id")) and not entry.get("gone_at"):
                return host, entry["pane_id"]
    sessions, why = fleet_remote.msp_sessions([host])
    if why:
        raise Unreachable(f"{host}/{target}: {why}", next=f"machines", ref=f"{host}/{target}", provider="msp")
    rows = sessions.get(host, [])
    for same in (lambda a, b: a == b, lambda a, b: a.casefold() == b.casefold()):
        hits = [row for row in rows if any(same(str(n), target) for n in (row.get("name"), row.get("title")) if n)]
        if len(hits) == 1:
            return host, hits[0]["pane_id"]
        if hits:
            raise Refused(f"{target!r} names {len(hits)} sessions on {host}: " + ", ".join(f"{host}/{r['pane_id']}" for r in hits), next="address it by its handle from `list`", ref=f"{host}/{target}", provider="msp")
    raise Refused(f"no session named {target!r} on {host}", next=f"list {host}", ref=f"{host}/{target}", provider="msp", outcome="no_such_session")


def msp_send(args, machine_key: str, target: str) -> int:
    """`send --type [--steer]` on an MSP session is a message the agent receives (or a steer into its running turn); a
    notification or keys need a pane, and an MSP session has none."""
    host, session_id = msp_ref(machine_key, target)
    addr = args.addr
    if args.keys:
        raise Unsupported(f"send --keys: an MSP session has no pane or composer to key", next=f"send {addr} \"<text>\" --type", ref=addr, provider="msp")
    if not args.text:
        raise Usage("send needs text", next=f"send {addr} \"<text>\" --type", ref=addr)
    if not (args.type or args.steer):
        raise Unsupported("a notification needs a pane a human watches, and an MSP session has none; nothing was sent",
                          next=f"send {addr} \"<text>\" --type (a message the agent receives)", ref=addr, provider="msp")
    fleet_session.check(addr, nothing="sent")
    text = f"{AUTOMATED_MARKER} {args.text}" if args.automated else args.text
    argv = ["send", f"{host}/{session_id}", "--text", text] + (["--steer"] if args.steer else [])
    line = fleet_remote.host_manager_msp(argv, ref=addr, next_hint=f"read {addr} --tail")
    identity = fleet_remote.msp_identity(host, session_id, (line.get("identity") or {}).get("cwd"))
    not_applied = [flag for flag, given in (("--wait", args.wait), ("--until", args.until), ("--timeout", args.timeout), ("--no-verify", args.no_verify), ("--verify-seconds", args.verify_seconds is not None)) if given]
    delivery = str(line.get("delivery") or ("steer" if args.steer else "message"))
    return emit("sent", provider="msp", ref=addr, delivery=delivery, steer=bool(args.steer), automated=bool(args.automated), mode="msp",
                session_receipt=line.get("session_receipt"), not_applied=not_applied,
                note=("a message queued as the session's next turn" if delivery == "message" else "steered into the running turn") + "; one `read --tail` a little later tells you whether it took it",
                receipt=receipt("Sent", identity, asked_by=asked_by_of(args), detail=f"{delivery} over msp"), next=f"read {addr} --tail")


def msp_open(args, machine: dict, kind: str, cwd: str | None, name: str) -> int:
    """`open <host> --cwd D`: host-manager's `open --mode msp --host` (the session and its brief through the transport; host-manager
    records it), then this skill's handle and receipt. One call for the human's one ask."""
    host = machine["label"]
    ref = f"{host}/{name}"
    if kind != "muse":
        raise Unsupported(f"open --engine {kind}: an MSP host runs its own muse; no other engine opens there", next=f"open {host} --cwd <dir>", ref=ref, provider="msp")
    if not cwd:
        raise Usage(f"open {host}: a session on an MSP host needs --cwd <dir> (its directories are that machine's, not this one's)", next=f"open {host} --cwd <dir>", ref=ref, provider="msp")
    for flag, given in (("--worktree", args.worktree), ("--label", args.label), ("--engine-arg", args.engine_arg)):
        if given:
            raise Unsupported(f"open {flag}: not carried to a session on an MSP host", next=f"open {host} --cwd {shlex.quote(cwd)}", ref=ref, provider="msp")
    argv = ["open", "--host", host, "--cwd", cwd, "--name", name]   # `--host` alone: the ladder's rule 2, and the receipt says `host <h> advertises MSP`
    brief_path = None
    if args.prompt_file:
        brief = prompt_text(args.prompt_file)
        fd, brief_path = tempfile.mkstemp(prefix="fleet-brief-", suffix=".md")
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(brief or "")
        argv += ["--prompt-file", brief_path]
    for flag, given in (("--purpose", args.purpose),):
        if given:
            argv += [flag, given]
    if args.exact_name:
        argv.append("--exact-name")
    if args.unattended:
        argv.append("--unattended")
    try:
        line = fleet_remote.host_manager_msp(argv, ref=ref, next_hint=f"open {host} --cwd {shlex.quote(cwd)}", host_open=True)
    except FleetError as exc:
        exc.detail.setdefault("created", False)
        raise
    finally:
        if brief_path:
            try:
                os.unlink(brief_path)
            except OSError:
                pass
    hm_identity = line.get("identity") or {}
    full_ref = str(hm_identity.get("ref") or "")
    session_id = full_ref.split("/", 1)[1] if "/" in full_ref else full_ref
    live_name = str(line.get("name") or name)
    status = "working" if args.prompt_file else "idle"
    with fleet_session.State() as state:
        handle = state.bind(host, session_id, {"agent": "muse", "name": live_name, "cwd": cwd, "status": status, "status_since": time.time(), "purpose": args.purpose or "",
                                               "provider": "msp", "server": host, "terminal_id": session_id, "opened_here": True})   # keeps its host in the digest's scope
    identity = fleet_remote.msp_identity(host, session_id, cwd)
    attach = str(line.get("attach") or "")
    watch = f"; the human watches it with: {attach}" if attach else ""
    return emit("opened", provider="msp", ref=f"{host}/{session_id}", progress=[str(p) for p in (line.get("progress") or [])] + [f"host-manager opened {full_ref} (mode msp)"],
                handle=handle, addr=f"{host}/{session_id}", machine=host, name=live_name, engine="muse", via="host-manager open --mode msp", mode="msp",
                mode_line=line.get("mode_line"), status=status, identity=identity, created=True, purpose=args.purpose or "", attach=line.get("attach"),
                posture=line.get("posture"), unattended=bool(args.unattended), not_applied=line.get("not_applied"), session_receipt=line.get("session_receipt"),
                note=(str(line.get("note") or line.get("notes") or "") + (f" Tell the human the watch line: `{attach}`." if attach else "")).strip(),
                host_manager_next=line.get("next"),
                receipt=receipt("Opened", identity, asked_by=asked_by_of(args), detail=f"muse in {cwd} over msp{watch}"), next=f"read {handle} --tail")


# ---------------------------------------------------------------- parser


class Parser(argparse.ArgumentParser):
    """argparse errors are usage errors on the one-object contract, not bare stderr text."""

    def error(self, message):
        raise Usage(message, next=f"{self.prog} --help")


def build_parser() -> argparse.ArgumentParser:
    p = Parser(prog="fleet_manager.py", description=__doc__.split("\n\n")[0], epilog=f"addresses: {fleet_session.ADDRESS_GRAMMAR}")
    p.add_argument("--mode", choices=["herdr", "tmux", "auto"], default="auto", help="pin the mode (default auto: Herdr when it answers, else tmux); the same word as host-manager's --mode")
    p.add_argument("--asked-by", help="who asked for this write (goes into the receipt; default FLEET_MANAGER_ASKED_BY or $USER)")
    sub = p.add_subparsers(dest="verb", required=True)

    def verb(name, help_text):
        # the same sentence in the top-level list and as the verb's own `--help` description
        return sub.add_parser(name, help=help_text, description=help_text)

    def addr_verb(name, help_text, fn, **kw):
        s = verb(name, help_text)
        s.add_argument("addr", help=fleet_session.ADDR_USAGE)
        s.set_defaults(fn=fn)
        return s

    s = verb("doctor", "provider state, what is missing, every machine's reachability, and the one next command")
    s.add_argument("--no-start", action="store_true", help="never start a local Herdr server")
    s.add_argument("--no-install", action="store_true", help="never install tmux")
    s.set_defaults(fn=cmd_doctor)

    s = verb("detect", "the provider decision for this host, with its reasoning")
    s.add_argument("--no-start", action="store_true", help="never start a local Herdr server")
    s.add_argument("--no-install", action="store_true", help="never install tmux")
    s.set_defaults(fn=cmd_detect)

    s = verb("context", "one digest: machines with reachability, sessions grouped (ready-for-review / waiting-on-you / working / idle), changes since last call")
    s.add_argument("--reset", action="store_true", help="forget the last call's picture (every session counts as new)")
    s.set_defaults(fn=cmd_context)

    s = verb("list", "every session (blocked first, handles, ages) and every machine with its state; `list <machine>` for one")
    s.add_argument("machine", nargs="?", help="only this machine label (or local)")
    s.add_argument("--hint", action="store_true", help="append the one-line usage hint")
    s.add_argument("--dialogs", action="store_true", help="also read each blocked pane's dialog (one extra read per blocked session)")
    s.set_defaults(fn=cmd_list)

    s = verb("machines", "every machine (Herdr's saved list plus machines.toml) with provider, reachability and next step")
    s.set_defaults(fn=cmd_machines)

    s = verb("connect", "connect a machine in one command (with Herdr here: herdr machine add with Herdr's own login, then at most one ssh master of this skill's own; without Herdr: save, ssh master, one second factor, forward, verify, record); a saved label re-forwards")
    s.add_argument("target", help="an ssh target (user@host) or a saved machine label")
    s.add_argument("--label", help="the machine's name (default: the host part of the target)")
    s.add_argument("--mode", dest="verify_mode", choices=["herdr", "tmux"], help="verify this mode on the machine instead of detecting")
    s.add_argument("--session", help="the remote Herdr session to forward (default: the profile's)")
    s.add_argument("--no-login", action="store_true", help="never open an interactive login (fail with the command instead)")
    s.set_defaults(fn=cmd_connect)

    s = verb("forget", "drop a machine from machines.toml (a Herdr-saved machine is Herdr's: use `herdr machine remove <id>`, the id from `herdr machine list --json`)")
    s.add_argument("machine", help="a machines.toml label (a Herdr-saved machine has no row here)")
    s.add_argument("--confirm", help="the human's words, when the machine still has live sessions")
    s.set_defaults(fn=cmd_forget)

    s = verb("resources", "load, memory, disk and CPU count on this host and every reachable machine; `resources <machine>` for one")
    s.add_argument("machine", nargs="?", help="only this machine label (or local)")
    s.set_defaults(fn=cmd_resources)

    s = verb("fetch", "copy one report or library file home from a machine by content hash (an unchanged hash copies nothing); code travels by PR, never by fetch")
    s.add_argument("machine", help="a machine label (not local)")
    s.add_argument("path", help="the file's path on the machine")
    s.set_defaults(fn=cmd_fetch)

    s = verb("events", "fleet event stream for ONE Monitor: new/gone/blocked/working/done/machine offline|online (Herdr subscriptions)")
    s.add_argument("--interval", type=float, default=5.0, help="seconds between re-probes of unreachable machines (reachable ones push events)")
    s.add_argument("--once", action="store_true", help="sync the baseline, print one object, exit")
    s.add_argument("--replay-baseline", action="store_true", help="also print the events implied by the first sync")
    s.add_argument("--kinds", help=f"comma list to emit, or `all` (default {DEFAULT_KINDS}; `working` is opt-in)")
    s.add_argument("--duration", type=float, help="seconds; exit after this long")
    s.set_defaults(fn=cmd_events)

    addr_verb("status", "the identity tuple (provider, machine, server, ref, cwd, engine) plus the Herdr session name, liveness and drift for one session; a session that is gone is no_such_session (exit 3), an unreachable provider exit 6", cmd_status)
    s = addr_verb("read", "the session's recent output; --tail for the last rows of its visible screen as drawn, plus the native status", cmd_read)
    s.add_argument("--lines", type=int, default=60, help="how many recent lines (default 60; the same count for --tail)")
    s.add_argument("--chars", type=int, default=2500, help="with --tail: keep at most this many characters, from the end (default 2500)")
    s.add_argument("--tail", action="store_true", help="the visible screen as drawn instead of the raw recent output")
    s.add_argument("--source", default="recent-unwrapped", choices=["visible", "recent", "recent-unwrapped"], help="Herdr read source (default recent-unwrapped)")
    s = addr_verb("dialog", "what a blocked session is asking (Herdr)", cmd_dialog)
    s.add_argument("--lines", type=int, default=12, help="how many lines of the dialog to read (default 12)")
    addr_verb("attach", "the command a human runs to sit in front of the session (nothing is executed)", cmd_attach)

    s = addr_verb("send", "type a message into the session with --type (anything meant for the agent: an instruction, a steer, a question, a reminder), send keys with --keys, or without either show a notification only a human watching the pane sees (the agent gets nothing). --type and --keys refuse a non-empty composer; --type is also refused while a dialog is up: answer it with approve/deny/--keys", cmd_send)
    s.add_argument("text", nargs="?", default="", help="with --type the prompt to type; without it the notification text; a dialog is answered with approve/deny/--keys, not typed text")
    s.add_argument("--type", action="store_true", help="type the text into the session as a prompt: the form for anything meant for the agent (submitted: false means read before any retry)")
    s.add_argument("--keys", nargs="+", help="send these logical keys instead of text (Herdr; esc, ctrl+c, enter, y …) under the composer guard")
    s.add_argument("--wait", action="store_true", help="with --type: return when the agent is ready for input again (Herdr)")
    s.add_argument("--until", action="append", help="with --type --wait: a state to wait for; repeat the flag for more than one (Herdr; default idle, done or blocked)")
    s.add_argument("--timeout", type=int, help="milliseconds (Herdr --wait)")
    s.add_argument("--automated", action="store_true", help=f"prefix the text with `{AUTOMATED_MARKER}`")
    s.add_argument("--steer", action="store_true", help="a session on an MSP host only: steer its running turn instead of queueing the text as the next turn")
    s.add_argument("--no-verify", action="store_true", help="skip the did-it-submit check")
    s.add_argument("--verify-seconds", type=float, default=None, help="bound the did-it-submit wait (Herdr default 8 s; tmux default FLEET_MANAGER_TYPE_VERIFY_S, 3 s)")
    s = addr_verb("approve", "answer a blocked session's dialog affirmatively (Herdr; y / enter)", lambda a: cmd_decide(a, approve=True))
    s.add_argument("--key", help="override the key to send")
    s.add_argument("--force", action="store_true", help="answer even when Herdr does not flag the session blocked (after reading the dialog yourself)")
    s = addr_verb("deny", "answer a blocked session's dialog negatively (Herdr; n, or esc on a menu)", lambda a: cmd_decide(a, approve=False))
    s.add_argument("--key", help="override the key to send")
    s.add_argument("--force", action="store_true", help="answer even when Herdr does not flag the session blocked (after reading the dialog yourself)")
    addr_verb("stop", "interrupt the session's current turn (ctrl+c); the session stays (a user's \"stop session X\" is the graceful end: send --type its exit command, then close only if it lingers)", cmd_stop)
    s = addr_verb("close", "close the session (a live one needs --confirm \"<the human's words>\")", cmd_close)
    s.add_argument("--confirm", help="the human's words authorising the close of a live session")
    s = addr_verb("adopt", "mint a handle for an existing session (machine[:server]/<ref>) with its identity recorded; --name labels it", cmd_adopt)
    s.add_argument("--name", help="the session's live name (Herdr agent rename); shows on the board")

    s = addr_verb("wait", "wait for a Herdr session to reach a state (`agent wait`); exit 0 with `reached` true or false", cmd_wait)
    s.add_argument("--until", action="append", help="states to wait for, comma-separated or repeated (default: idle, done or blocked)")
    s.add_argument("--duration", type=float, default=600.0, help="seconds to wait at most (default 600)")

    s = verb("open", "start a session: zero required arguments (muse, the repo root, an auto name, this host); --engine/--cwd/--name/--prompt-file/--worktree/--engine-arg; after a timeout run list before a second open")
    s.add_argument("machine", nargs="?", help="machine[:server]; default local; a machine that advertises MSP opens through host-manager's mode msp (--cwd required there)")
    s.add_argument("--engine", help="agent engine (claude, codex, muse, …; default muse); a command Herdr does not manage runs in the pane; an MSP host runs its own muse")
    s.add_argument("--cwd", help="the session's working directory (local default: the repository root, else the current directory; a remote open without --cwd uses that machine's own default; required on an MSP host)")
    s.add_argument("--name", help="the session's live name and workspace label (default: the directory's name; a taken name gets -2, -3)")
    s.add_argument("--prompt-file", help="the brief to submit once the agent is ready (a path, or - for stdin)")
    s.add_argument("--engine-arg", action="append", default=[], help="an argument for the engine (repeatable)")
    s.add_argument("--purpose", help="one line on what the session is for (recorded on the handle)")
    s.add_argument("--label", help="the Herdr workspace label (default: the name)")
    s.add_argument("--exact-name", action="store_true", help="refuse a taken name instead of suffixing -2/-3")
    s.add_argument("--unattended", action="store_true", help="the engine's own skip-permission flag (Muse: --yolo); default off: the engine's normal permission prompts")
    s.add_argument("--worktree", help="open this existing git worktree as the workspace (Herdr `worktree open`)")
    s.add_argument("--timeout", type=int, default=60000, help="agent start / wait / brief first-state timeout, ms")
    s.set_defaults(fn=cmd_open)

    return p


RETIRED_FLAGS = {"--provider": "--mode"}   # renamed with host-manager (#41303), no alias


def retired_flag(argv) -> str | None:
    """The usage message for a retired flag anywhere in `argv` — before or after the verb, `--flag` or
    `--flag=value` — or None; argparse alone blamed the VERB for one placed before it (QA r22 N-9).
    Arguments after `--` are the engine's, never this helper's."""
    for arg in argv:
        if arg == "--":
            break
        name = str(arg).split("=", 1)[0]
        if name in RETIRED_FLAGS:
            return f"{name} was renamed to {RETIRED_FLAGS[name]} (no alias): run the verb again with {RETIRED_FLAGS[name]}, before or after the verb"
    return None


def main(argv=None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    parser = build_parser()
    renamed = retired_flag(argv)
    if renamed:
        return emit_error(Usage(renamed, next="run the verb again with --mode"))
    try:
        args = parser.parse_args(argv)
    except Usage as exc:
        return emit_error(exc)
    except SystemExit as exc:   # --help
        return 0 if exc.code in (0, None) else int(exc.code)
    if args.mode != "auto":
        _LOCAL_PROVIDER["override"] = args.mode
    if getattr(args, "asked_by", None):
        os.environ["FLEET_MANAGER_ASKED_BY"] = args.asked_by
    try:
        return args.fn(args)
    except FleetError as exc:
        if exc.ref is None and getattr(args, "addr", None):
            exc.ref = args.addr   # a failure on an address verb names the address it was given (QA r10 FM-4)
        return emit_error(exc)
    except KeyboardInterrupt:
        return 130
    except Exception as exc:  # noqa: BLE001 — internal: still one object, exit 7
        return emit("internal", error=f"internal: {type(exc).__name__}: {exc}", next="rerun with the same arguments; if it repeats, report the line above")


if __name__ == "__main__":
    sys.exit(main())
