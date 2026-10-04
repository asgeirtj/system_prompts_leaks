"""Provider detection, `doctor`, `connect`, and `forget`.

Provider rule: Herdr is optional and preferred when installed
and reachable — its server is started when installed but down, never
installed; tmux is the fallback and is installed automatically when that
needs no password (otherwise the exact command is printed and the verb
stops; this skill never drives sudo); `--mode` overrides; Windows has
no provider.

`connect <ssh-target> [--label]` is one command with one progress line per
step and stops at the first thing wrong with the next command. With Herdr on
this host the machine goes in through Herdr (`herdr machine add`: its machine
list is authoritative and Herdr runs the login), and the forwarded Herdr
socket is reused when it already answers; a failed add is `herdr_add_failed`
with the Herdr command as `next`, never a silent tmux fallback (`--mode
tmux` asks for one). Without Herdr this skill opens its own ssh master (the
one interactive login), verifies the remote provider, and keeps the row in
`~/.config/muse/machines.toml`. It never degrades silently: a machine whose
provider could not be verified is recorded as `none`, not guessed.

"""

from __future__ import annotations

import os
import shlex
import sys
import platform
import shutil
import subprocess
import time

import fleet_machines
import fleet_remote
import fleet_session
from fleet_contract import FleetError, NeedsHuman, Refused, Unreachable, Unsupported, Usage, caps_for, iso, now
from fleet_remote import run_over_master

PROVIDERS = ("herdr", "tmux", "none")
INSTALLERS = (
    ("apt-get", ["apt-get", "install", "-y", "tmux"]),
    ("dnf", ["dnf", "install", "-y", "tmux"]),
    ("yum", ["yum", "install", "-y", "tmux"]),
    ("apk", ["apk", "add", "tmux"]),
    ("pacman", ["pacman", "-S", "--noconfirm", "tmux"]),
    ("zypper", ["zypper", "--non-interactive", "install", "tmux"]),
    ("brew", ["brew", "install", "tmux"]),
)
CONNECT_BUDGET_S = float(os.environ.get("FLEET_MANAGER_CONNECT_TIMEOUT_S", "25"))
CONNECT_FLOOR_S = min(5.0, CONNECT_BUDGET_S)   # the least a login step gets however little budget is left; a budget under 5 s means what it says


def _fm():
    import fleet_manager
    return fleet_manager


def is_windows() -> bool:
    return os.name == "nt" or platform.system().lower().startswith("win") or os.environ.get("FLEET_MANAGER_PLATFORM", "").lower() == "windows"


def herdr_binary() -> str | None:
    configured = os.environ.get("HERDR_BIN_PATH")
    if configured:
        return configured if os.path.isfile(configured) and os.access(configured, os.X_OK) else None
    return shutil.which(fleet_remote.BIN) if not os.path.isabs(fleet_remote.BIN) else (fleet_remote.BIN if os.path.isfile(fleet_remote.BIN) else None)


def herdr_version(binary: str) -> str:
    try:
        return subprocess.run([binary, "--version"], capture_output=True, text=True, timeout=10, stdin=subprocess.DEVNULL).stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return ""


def tmux_version() -> str:
    import fleet_tmux
    binary = fleet_tmux.tmux_bin()
    if not binary:
        return ""
    try:
        return subprocess.run([binary, "-V"], capture_output=True, text=True, timeout=10, stdin=subprocess.DEVNULL).stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return ""


def ensure_local_server(*, start: bool = True, progress: list[str] | None = None) -> dict:
    """{"state": running|started|down|not_installed, "socket", "version"}; starts the local Herdr server when installed but down."""
    binary = herdr_binary()
    sock = fleet_remote.default_local_socket()
    if not binary:
        return {"state": "not_installed", "socket": sock, "version": ""}
    version = herdr_version(binary)
    if fleet_remote.probe(sock):
        return {"state": "running", "socket": sock, "version": version}
    if not start:
        return {"state": "down", "socket": sock, "version": version}
    os.makedirs(fleet_remote.FORWARD_DIR, mode=0o700, exist_ok=True)
    with open(os.path.join(fleet_remote.FORWARD_DIR, "local-server.log"), "ab") as log:
        try:
            subprocess.Popen(fleet_remote.local_server_argv(), stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True,
                             # Deliberate: the spawned server must not inherit this skill's own knobs (socket, state dir,
                             # test overrides) nor the caller's pane identity — it serves every caller, not this one.
                             env={k: v for k, v in os.environ.items() if not k.startswith(("HERDR_", "FLEET_MANAGER_"))})
        except FileNotFoundError:
            return {"state": "not_installed", "socket": sock, "version": version}
    wait_s = server_start_wait_s()   # the same knob as the remote arm (FLEET_MANAGER_SERVER_WAIT_S)
    deadline = time.monotonic() + wait_s
    while time.monotonic() < deadline:
        if fleet_remote.probe(sock):
            if progress is not None:
                progress.append("started the local Herdr server")
            return {"state": "started", "socket": sock, "version": version}
        time.sleep(min(0.25, wait_s))
    return {"state": "down", "socket": sock, "version": version}


def _install_tmux(run, progress: list[str], *, where: str, retry: str) -> None:
    """Install tmux through `run(argv) -> (rc, text)` when that needs no password; else stop with the exact command (never drive sudo)."""
    for tool, argv in INSTALLERS:
        if run(["sh", "-c", f"command -v {tool}"])[0] != 0:
            continue
        prefix = [] if tool == "brew" or (where == "this host" and hasattr(os, "geteuid") and os.geteuid() == 0) else ["sudo", "-n"]
        if prefix and run(["sudo", "-n", "true"])[0] != 0:
            raise NeedsHuman(f"tmux is not installed on {where} and installing it needs a password", next=f"run `sudo {' '.join(argv)}` on {where}, then {retry}", provider="none")
        rc, text = run(prefix + argv)
        if rc == 0:
            progress.append(f"{where}: installed tmux with {' '.join(prefix + argv)}")
            return
        raise NeedsHuman(f"{where}: tmux install failed ({text.strip()[:160]})", next=f"install tmux on {where} yourself (`{' '.join(argv)}`), then {retry}", provider="none")
    raise NeedsHuman(f"tmux is not installed on {where} and no known package manager was found", next=f"install tmux on {where}, then {retry}", provider="none")


def install_tmux_locally(progress: list[str]) -> str:
    if is_windows():
        raise Unsupported("no session provider on Windows (neither Herdr nor tmux runs here)", next="run fleet-manager from a Linux or macOS host", outcome="no_provider")

    def run(argv):
        proc = subprocess.run(argv, capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=600)
        return proc.returncode, proc.stderr or proc.stdout

    _install_tmux(run, progress, where="this host", retry="rerun doctor")
    return shutil.which("tmux") or "tmux"


def detect(*, override: str | None = None, start_server: bool = True, install: bool = True, progress: list[str] | None = None) -> dict:
    """The explainable provider decision for THIS host."""
    progress = progress if progress is not None else []
    report = {"platform": platform.system(), "herdr": {}, "tmux": {}, "provider": "none", "reason": "no_provider", "why": "", "override": override or "", "providers": []}
    if is_windows():
        report.update(provider="none", reason="no_provider", why="Windows: neither Herdr nor tmux runs here")
        return report
    local = ensure_local_server(start=start_server and override in (None, "herdr"), progress=progress)
    report["herdr"] = {"installed": local["state"] != "not_installed", "version": local["version"], "server": local["state"], "socket": local["socket"]}
    tmux = tmux_version()
    report["tmux"] = {"installed": bool(tmux), "version": tmux}
    report["providers"] = [
        {"provider": "herdr", "installed": report["herdr"]["installed"], "reachable": local["state"] in ("running", "started"), "server": local["socket"],
         "version": local["version"], "reason": local["state"], "capabilities": caps_for("herdr")},
        {"provider": "tmux", "installed": bool(tmux), "reachable": bool(tmux), "server": os.environ.get("FLEET_MANAGER_TMUX_SOCKET") or "default",
         "version": tmux, "reason": "installed" if tmux else "absent", "capabilities": caps_for("tmux")},
    ]
    if override == "herdr":
        if local["state"] in ("running", "started"):
            report.update(provider="herdr", reason="requested", why="--mode herdr")
        else:
            raise Unreachable("--mode herdr, but no local Herdr server answers", next="install Herdr or run `herdr server`, then rerun", provider="herdr")
        return report
    if override == "tmux" or local["state"] == "not_installed":
        if not tmux and install and override != "none":
            path = install_tmux_locally(progress)
            report["tmux"] = {"installed": True, "version": tmux_version() or path}
        if report["tmux"]["installed"]:
            installed_now = any("installed tmux" in line for line in progress)
            report.update(provider="tmux", reason="requested" if override == "tmux" else "tmux_installed" if installed_now else "tmux_available",
                          why="--mode tmux" if override == "tmux" else "Herdr not installed; tmux fallback")
        else:
            report.update(provider="none", reason="no_provider", why="neither Herdr nor tmux is available")
        return report
    if local["state"] == "down":
        report.update(provider="herdr", reason="herdr_down", why="Herdr installed, its server is down: `doctor` or `open` starts it; reads report server_down")
        return report
    report.update(provider="herdr", reason="herdr_started" if local["state"] == "started" else "herdr_reachable",
                  why="Herdr installed and its server answers" + (" (started now)" if local["state"] == "started" else ""))
    return report


# ---------------------------------------------------------------- doctor


def doctor(*, override: str | None = None, start_server: bool = True, install: bool = True) -> tuple[dict, str, str]:
    """(report, outcome, next). Never raises for a missing provider: the report says what is missing."""
    fm = _fm()
    progress: list[str] = []
    try:
        providers = detect(override=override, start_server=start_server, install=install, progress=progress)
    except (NeedsHuman, Unsupported, Unreachable) as exc:
        return ({"providers": {"provider": "none", "reason": "no_provider", "why": str(exc)}, "machines": [], "progress": progress,
                 "checks": [{"check": "provider", "state": "fail", "note": str(exc)}]}, exc.outcome, exc.next)
    herdr_rows = None
    catalog_note = ""
    if providers["herdr"].get("installed"):
        try:
            herdr_rows = fm.list_machines()
        except FleetError as exc:
            catalog_note = str(exc)
            herdr_rows = []
    machines = fleet_machines.merged(herdr_rows)
    rows = []
    for machine in fm.with_msp_machines(fleet_machines.active(machines)):
        rows.append(machine_reachability(machine))
    msp = fleet_remote.msp_source()
    msp_state = {"off": "off", "available": "ok", "not_available": "absent", "unreachable": "warn"}.get(msp["state"], "warn")
    missing = []
    if providers["provider"] == "none":
        missing.append(providers.get("reason") or "no provider")
    next_cmd = ""
    if providers["provider"] == "none":
        next_cmd = "install tmux (or Herdr), then rerun doctor"
    elif not rows:
        next_cmd = "connect <ssh-target> --label <name> to add a machine, or `open` to start a session here"
    else:
        first_bad = next((r for r in rows if r["reachability"] not in ("connected",)), None)
        if first_bad:
            next_cmd = first_bad["next"]
    checks = [
        {"check": "python", "state": "ok", "note": platform.python_version()},
        {"check": "herdr", "state": "ok" if providers["herdr"].get("server") in ("running", "started") else "warn" if providers["herdr"].get("installed") else "absent", "note": providers["herdr"].get("server", "")},
        {"check": "tmux", "state": "ok" if providers["tmux"].get("installed") else "absent", "note": providers["tmux"].get("version", "")},
        {"check": "machines_directory", "state": "ok" if os.path.exists(fleet_machines.directory_path()) else "absent", "note": fleet_machines.directory_path()},
        {"check": "provider", "state": "ok" if providers["provider"] != "none" else "fail", "note": providers.get("reason", "")},
    ] + ([{"check": "msp", "state": msp_state, "note": msp["note"]}] if fleet_remote.msp_enabled() else [])   # flag off: the old report byte for byte
    report = {"providers": providers, "checks": checks, "machines": rows, "directory": fleet_machines.directory_path(), "state_file": fleet_session.state_path(),
              "catalog_note": catalog_note, "missing": missing, "progress": progress, "inside_herdr": os.environ.get("HERDR_ENV") == "1"}
    return report, ("healthy" if providers["provider"] != "none" else "no_provider"), next_cmd


def machine_reachability(machine: dict) -> dict:
    """One machine's provider and reachability, from `ssh -O check` and the forward probe only (never a login)."""
    fm = _fm()
    label = machine.get("label", "?")
    row = {"label": label, "target": machine.get("target", ""), "provider": machine.get("provider", "herdr"), "source": machine.get("source", "herdr"),
           "reachability": "", "note": "", "next": "", "session": machine.get("session") or "default", "modes": list(machine.get("modes") or [machine.get("provider") or "herdr"])}
    if row["provider"] == "msp":
        # decision record 41038 D4: reachability is `muse hosts`' word (online|offline); there is no login to open and no ssh target to test
        online = machine.get("availability") != "offline"
        row.update(reachability="connected" if online else "unreachable", availability=machine.get("availability"),
                   note="advertises MSP" + ("" if online else " but is offline per `muse hosts`; its sessions are unknown"),
                   next=f"open {label} --cwd <dir>" if online else "machines")
        return row
    if row["provider"] == "herdr":
        if not machine.get("enabled", True):
            row.update(fm.machine_status(machine))
            row.update(reachability="disabled", next=row.get("next_step") or f"herdr machine enable {label}")
            return row
        try:
            status = fm.machine_status(machine, local_proto=fm.local_protocol())
        except FleetError as exc:
            row.update(reachability="unreachable", note=str(exc), next=f"connect {row['target']} --label {label}")
            return row
        row.update(status)   # every field machine_status derives (state, sockets, protocol, ssh_master, next_step …)
        row.update(reachability="connected" if status["state"] == "connected" else "unreachable", note=status["note"], next=status["next_step"])
        if row["reachability"] == "unreachable" and not row["next"]:
            row["next"] = f"connect {row['target']} --label {label}"
        return row
    alive = fleet_remote.master_alive(machine["target"], control_path=fleet_remote.control_path_for(machine))
    if not alive:
        row.update(reachability="unreachable", note=f"ssh master down for {machine['target']}", next=f"connect {machine['target']} --label {label}")
        return row
    row.update(reachability="connected", note="ssh master up" + (" (tmux)" if row["provider"] == "tmux" else " (provider unverified)"))
    if row["provider"] == "none":
        row.update(next=f"connect {machine['target']} --label {label}")
    return row


# ---------------------------------------------------------------- connect


def open_master(machine: dict, progress: list[str], *, budget: float) -> None:
    """The one interactive login: the human answers at most one second-factor prompt here.
    Never opened while a master already answers: the row's own, the one this skill derived, or
    the one the user's ssh config keeps (`ssh -O check` with no ControlPath forced) — the
    no-login branch of a first connect (QA r8 FM1 D2)."""
    os.makedirs(fleet_remote.FORWARD_DIR, mode=0o700, exist_ok=True)
    existing = fleet_remote.control_path_for(machine)   # the row's path, else the derived one when it exists, else None: ssh's own config
    for control_path in ([existing, None] if existing else [None]):   # a dead recorded path still gives ssh's own config its turn
        if fleet_remote.master_alive(machine["target"], control_path=control_path):
            if control_path is None and existing:
                # the recorded/derived socket is dead and ssh's own config carries the live master: drop the dead
                # path so every later hop (`control_path_for`) resolves to ssh's config too, never to the dead socket
                if existing == fleet_remote.derived_control_path(machine):
                    try:
                        os.unlink(existing)
                    except OSError:
                        pass
                machine["control_path"] = ""   # an empty row field: cleared on the next upsert, not kept
            else:
                machine["control_path"] = control_path
            progress.append(f"ssh master already up for {machine['target']}")
            return
    control = machine.get("control_path") or fleet_remote.derived_control_path(machine)
    machine["control_path"] = control
    argv = [fleet_remote.SSH, "-o", "ControlMaster=auto", "-o", f"ControlPath={control}", "-o", "ControlPersist=yes",
            "-o", f"ConnectTimeout={int(budget)}", "-fN", machine["target"]]
    try:
        proc = subprocess.run(argv, timeout=budget)   # stdin/tty inherited: the human sees and answers the prompt once
    except FileNotFoundError:
        raise Usage(f"ssh binary not found: {fleet_remote.SSH!r}", ref=machine["label"])
    except subprocess.TimeoutExpired:
        raise NeedsHuman(f"{machine['target']}: the login did not finish within {budget:.0f}s (a second factor or a host prompt is still waiting)",
                         next=f"answer the prompt, then rerun connect {machine['target']} --label {machine['label']}", ref=machine["label"])
    if proc.returncode != 0 or not fleet_remote.master_alive(machine["target"], control_path=control):
        raise Unreachable(f"{machine['target']}: ssh login failed (exit {proc.returncode})",
                          next=f"check `ssh {machine['target']}` by hand, then rerun connect {machine['target']} --label {machine['label']}", ref=machine["label"])
    progress.append(f"opened the ssh master for {machine['target']} (one login)")


def verify_remote_provider(machine: dict, progress: list[str]) -> dict:
    probe = "command -v herdr >/dev/null 2>&1 && herdr --version; command -v tmux >/dev/null 2>&1 && tmux -V; uname -s"
    result = run_over_master(machine, ["sh", "-c", probe], timeout=20)
    if result.get("rc") not in (0, 1) or not result.get("stdout", "").strip():
        raise Unreachable(f"{machine['label']}: the ssh master carries no session ({(result.get('stderr') or '').strip()[:120] or 'no output'})",
                          next=f"connect {machine['target']} --label {machine['label']} again after the master is repaired", ref=machine["label"])
    lines = [l.strip() for l in result["stdout"].splitlines() if l.strip()]
    herdr = next((l for l in lines if l.startswith("herdr")), "")
    tmux = next((l for l in lines if l.startswith("tmux")), "")
    system = lines[-1] if lines else ""
    info = {"herdr": herdr, "tmux": tmux, "system": system}
    if herdr:
        info["provider"] = "herdr"
    elif tmux:
        info["provider"] = "tmux"
    else:
        info["provider"] = "none"
    progress.append(f"{machine['label']}: remote has " + (", ".join(v for v in (herdr, tmux) if v) or "neither herdr nor tmux") + f" ({system})")
    return info


def install_tmux_remotely(machine: dict, progress: list[str]) -> None:
    """Install tmux over the master or raise; the caller probes the box again afterwards."""
    def run(argv):
        result = run_over_master(machine, argv, timeout=600)
        return result.get("rc"), result.get("stderr") or result.get("stdout") or ""

    _install_tmux(run, progress, where=machine["target"], retry=f"rerun connect {machine['target']} --label {machine['label']}")


def start_remote_herdr(machine: dict, progress: list[str], session: str | None = None) -> None:
    session = session or machine.get("session") or "default"
    argv = ["sh", "-c", "nohup herdr " + (f"--session {shlex.quote(session)} " if session != "default" else "") + "server >/dev/null 2>&1 </dev/null &"]
    run_over_master(machine, argv, timeout=15)
    progress.append(f"{machine['label']}: started the remote Herdr server (session {session})")


def server_start_wait_s() -> float:
    """How long a just-started remote server gets to answer over the forward (FLEET_MANAGER_SERVER_WAIT_S, default 12)."""
    try:
        return float(os.environ.get("FLEET_MANAGER_SERVER_WAIT_S") or 12.0)
    except ValueError:
        return 12.0


def ensure_remote_server(machine: dict, progress: list[str], *, session: str | None = None) -> dict:
    """Herdr installed on the machine but its server down: start it over the live ssh master
    without asking (owner answer 3, relay #38715 comment 5740250090, 2026-09-19 07:36Z,
    verbatim in decision 38715 Amendment 1 D17; the decision record is in the amendment under specs/27701), one line in the caller's `progress`, then re-forward until it
    answers. Returns the forward status; a server that still does not answer is
    `provider_unreachable` with the manual command as `next`."""
    status = fleet_remote.forward_status(machine, session=session, reset=True)
    if not status.get("socket") or not status.get("remote"):
        start_remote_herdr(machine, progress, session=session)
        wait_s = server_start_wait_s()
        deadline = time.monotonic() + wait_s
        while time.monotonic() < deadline:
            status = fleet_remote.forward_status(machine, session=session, reset=True)
            if status.get("socket") and status.get("remote"):
                break
            time.sleep(min(0.5, wait_s))
    if not status.get("socket") or not status.get("remote"):
        label, target = machine["label"], machine["target"]
        raise Unreachable(f"{label}: the remote Herdr server did not answer over the forward ({status.get('note')})",
                          next=f"run `herdr server` on {target} yourself, then connect {label}", ref=label, provider="herdr")
    return status


def connect(target: str, *, label: str | None, provider: str | None, session: str | None = None, budget: float = CONNECT_BUDGET_S) -> dict:
    """One command: with Herdr here, `herdr machine add` then the forward; without it, save,
    master, verify, forward, record. Stops at the first thing wrong; a failure after a
    directory save says so (`saved`, `created`) so the caller knows the row exists."""
    fm = _fm()
    progress: list[str] = []
    started = time.monotonic()
    label_given = bool(label)
    label = fleet_machines.check_label(label or fleet_machines.label_for_target(target))   # before either path: Herdr's list is not where a `..` belongs
    saved: dict = {}
    try:
        return _connect(fm, target, label=label, provider=provider, session=session, budget=budget, progress=progress, started=started, saved_out=saved.update,
                        label_given=label_given)
    except FleetError as exc:
        if saved:
            exc.detail.setdefault("saved", {k: saved[k] for k in ("label", "target", "provider", "path")})
            exc.detail.setdefault("created", saved["created"])
        exc.detail.setdefault("progress", progress)
        raise


def herdr_remove(row: dict) -> str:
    """The command that drops a Herdr-saved machine: 0.9.0 takes the 32-hex id from `machine list --json`, not the label (QA r8 FM2 D6).
    Every Herdr row carries `id` (0.8.x has no rows at all), so a missing one is an internal failure, never the label 0.9.0 rejects."""
    return f"herdr machine remove {row['id']}"


def _herdr_row(rows: list[dict] | None, target: str, label: str) -> dict | None:
    return next((m for m in rows or [] if m.get("target") == target or m.get("label") == label), None)


def _descendants(pid: int) -> list[int]:
    """Every process under `pid`, from one `ps` listing (Linux and macOS alike)."""
    try:
        listing = subprocess.run(["ps", "-eo", "pid=,ppid="], capture_output=True, text=True, timeout=10, stdin=subprocess.DEVNULL).stdout
    except (OSError, subprocess.TimeoutExpired):
        return []
    children: dict[int, list[int]] = {}
    for line in listing.splitlines():
        parts = line.split()
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            children.setdefault(int(parts[1]), []).append(int(parts[0]))
    out, stack = [], [pid]
    while stack:
        for child in children.get(stack.pop(), []):
            out.append(child)
            stack.append(child)
    return out


def end_process_tree(proc: subprocess.Popen) -> None:
    """Stop a timed-out child AND everything under it: an interpreter wrapper or Herdr's own `ssh`
    is a grandchild, and killing only the direct child would leave it running on the human's
    terminal. No process group is used, so an interactive prompt keeps its controlling tty."""
    import signal
    below = _descendants(proc.pid)
    for target in [proc.pid] + below:
        try:
            os.kill(target, signal.SIGTERM)
        except OSError:
            pass
    try:
        proc.wait(timeout=2)
    except subprocess.TimeoutExpired:
        pass
    for target in [proc.pid] + below:
        try:
            os.kill(target, signal.SIGKILL)
        except OSError:
            pass
    try:
        proc.wait(timeout=2)
    except subprocess.TimeoutExpired:
        pass


def herdr_machine_add(fm, target: str, label: str, *, session: str | None, budget: float, progress: list[str]) -> dict:
    """Record the machine through Herdr (its machine list is authoritative, D2): `herdr machine
    add <target> --label <label>` runs Herdr's own setup and login with the human present. The
    target comes FIRST: Herdr 0.9.0's parser answers options-first argv with its usage line and
    exit 2 although `--help` prints `[OPTIONS] --label <LABEL> <SSH_TARGET>` (QA r8 FM1 D1). A
    failure is `herdr_add_failed` with the Herdr command as `next`; nothing falls back on its own."""
    argv = [fleet_remote.BIN, "machine", "add", target, "--label", label] + (["--remote-session", session] if session and session != "default" else [])
    command = "herdr " + " ".join(shlex.quote(a) for a in argv[1:])
    manual = f"run `{command}` yourself, then connect {label}; a tmux-only machine: connect {target} --label {label} --mode tmux"
    progress.append(f"adding {target} to Herdr's machine list as {label} (`{command}`; Herdr runs the login)")
    try:
        proc = subprocess.Popen(argv, stdin=None, stdout=sys.stderr)   # Herdr's prompts and output reach the human's terminal; stdout stays one JSON object
    except FileNotFoundError:
        raise FleetError(f"herdr binary not found: {fleet_remote.BIN!r}", next=manual, ref=label, provider="herdr", outcome="herdr_add_failed", detail={"command": command})
    try:
        proc.wait(timeout=budget)
    except subprocess.TimeoutExpired:
        end_process_tree(proc)
        raise NeedsHuman(f"{target}: `herdr machine add` did not finish within {budget:.0f}s and was stopped (Herdr was still in its login or setup prompt)",
                         next=f"{manual}; a slow login: raise FLEET_MANAGER_CONNECT_TIMEOUT_S (now {CONNECT_BUDGET_S:.0f}s) and rerun connect {target} --label {label}",
                         ref=label, provider="herdr", detail={"command": command, "budget_s": budget})   # the manual path first (never a blind second timed add), the knob named
    if proc.returncode != 0:
        raise FleetError(f"{target}: `{command}` exited {proc.returncode}; Herdr did not save the machine (its own output above says why)",
                         next=manual, ref=label, provider="herdr", outcome="herdr_add_failed", detail={"command": command, "exit": proc.returncode})
    try:
        row = _herdr_row(fm.list_machines(), target, label)
    except FleetError as exc:   # Herdr most likely saved the machine and ran its login: only the read-back failed, so never advise a second add
        raise Unreachable(f"{target}: `herdr machine list` failed after the add ({exc})", next=f"connect {label}", ref=label, provider="herdr",
                          detail={"command": command, "created": True})   # Herdr did save the machine: the exit table's `created: true` says so
    if row is None:
        raise FleetError(f"{target}: `{command}` exited 0 but `herdr machine list` does not show {label}", next=manual, ref=label, provider="herdr",
                         outcome="herdr_add_failed", detail={"command": command})
    progress.append(f"Herdr saved {target} as {row.get('label', label)}")
    return row


def _connect(fm, target: str, *, label: str, provider: str | None, session: str | None, budget: float, progress: list[str], started: float, saved_out,
             label_given: bool = True) -> dict:
    herdr_rows = None
    if herdr_binary():
        try:
            herdr_rows = fm.list_machines()
        except FleetError:
            herdr_rows = []
    herdr_row = next((m for m in herdr_rows or [] if m.get("target") == target), None)   # by target only: a label match would reach the OLD host
    clash = None if herdr_row else next((m for m in herdr_rows or [] if m.get("label") == label), None)
    if clash:
        raise Refused(f"{label} is saved by Herdr as {clash.get('target')}, not {target}; this skill never retargets Herdr's row",
                      next=f"connect {target} --label <another label>, or `{herdr_remove(clash)}` first", ref=label, provider="herdr")
    directory = fleet_machines.load_directory()
    by_target = next((r for r in directory if r.get("target") == target and r.get("verified") and r.get("provider") == "tmux"), None)
    if by_target and not label_given:
        label = by_target["label"]   # `connect <target>` for a box saved tmux-only under a custom name: the saved row, not a second identity
    elif by_target and by_target["label"] != label and not herdr_row:   # a target Herdr saves reconnects through Herdr's row; its stale tmux twin is only shadowed
        raise Usage(f"{target} is saved tmux-only as {by_target['label']}; a second identity is never made",
                    next=f"connect {by_target['label']}, or forget {by_target['label']} first", ref=label, provider="tmux")
    before = next((r for r in directory if r["label"] == label), None)
    same = before if before and before.get("target") == target and before.get("verified") else None   # the verified row for THIS target
    saved_tmux = bool(same and same.get("provider") == "tmux")   # the user's tmux-only choice: skips the Herdr add unless --mode herdr asks for it
    if herdr_row and provider == "tmux":
        raise Usage(f"{herdr_row.get('label', label)} is saved by Herdr: it is a Herdr machine here, not a tmux-only one",
                    next=f"connect {herdr_row.get('label', label)} (or `{herdr_remove(herdr_row)}` first)", ref=label, provider="herdr")
    added_now = False
    if herdr_row:
        progress.append(f"Herdr already saves {target} as {herdr_row.get('label', label)}; using its row")
    elif herdr_rows is not None and provider != "tmux" and not (saved_tmux and provider is None):   # an explicit --mode herdr still goes through Herdr
        herdr_row = herdr_machine_add(fm, target, label, session=session, budget=max(CONNECT_FLOOR_S, budget - (time.monotonic() - started)), progress=progress)
        added_now = True
    if herdr_row:
        if same and added_now and fleet_machines.remove(label):   # only the add THIS connect ran (the user asked for Herdr) retires the row: one owner (D2)
            progress.append(f"{label}: dropped the {same.get('provider') or 'directory'} directory row; Herdr owns it now")
        machine = dict(herdr_row)
        machine.setdefault("provider", "herdr")
        machine["label"] = machine.get("label") or label
        return _connect_herdr(fm, machine, target, session=session, budget=budget, progress=progress, started=started)
    # No Herdr on this host (or --mode tmux): this skill opens its own master and keeps the row.
    # Save first (D11) but claim nothing: the provider stays `none` until verified below. A verified row
    # keeps its stamp only for the SAME target: retargeting a label (`connect <new> --label <old>`) must
    # not carry the old box's provider or control path onto a host this verb has not reached (FR-38715-5).
    row = fleet_machines.upsert(label, target, provider=same["provider"] if same else "none",
                                verified=None if same else "", control_path=None if same else "",
                                note="" if same else "unverified: connect has not finished")
    machine = dict(row)
    saved_out({"label": label, "target": target, "provider": row["provider"], "path": fleet_machines.directory_path(), "created": before is None})
    progress.append(f"{'saved' if before is None else 'kept'} {label} = {target} in {fleet_machines.directory_path()}")
    machine["label"] = label
    open_master(machine, progress, budget=max(CONNECT_FLOOR_S, budget - (time.monotonic() - started)))
    info = verify_remote_provider(machine, progress)
    chosen = provider or ("tmux" if saved_tmux and info["tmux"] else info["provider"])   # a saved tmux row keeps tmux while the probe still finds tmux there; once it is gone the probe decides
    if chosen == "herdr" and not info["herdr"]:
        raise Unsupported(f"{label}: --mode herdr, but Herdr is not installed on {target}", next=f"install Herdr on {target} or connect with --mode tmux", ref=label)
    if (chosen == "tmux" and not info["tmux"]) or chosen == "none":
        install_tmux_remotely(machine, progress)   # a box without tmux: install, or stop with the command (exit 5) — never a verified row
        info = verify_remote_provider(machine, progress)   # the envelope's `remote` block is the box after the install, not the probe that asked for it (QA r8 FM1 D5)
        if not info["tmux"]:
            raise Unreachable(f"{label}: tmux was installed on {target} but `tmux -V` still answers nothing",
                              next=f"check `tmux -V` on {target}, then rerun connect {target} --label {label}", ref=label)
        chosen = "tmux"
    remote_socket = ""
    if chosen == "herdr":
        status = ensure_remote_server(machine, progress, session=session)
        remote_socket = status["socket"]
        progress.append(f"{label}: forwarded the Herdr socket ({status['remote'].get('version', '?')})")
    else:
        progress.append(f"{label}: tmux-only machine ({info['tmux'] or 'tmux'}): liveness, scrollback and guarded input")
    fleet_machines.upsert(label, target, provider=chosen, control_path=machine.get("control_path"), verified=iso(), note="")
    with fleet_session.State() as state:
        if label not in state.data["connected_once"]:
            state.data["connected_once"].append(label)
    progress.append(f"recorded {label} as {chosen} ({time.monotonic() - started:.1f}s)")
    return {"machine": label, "target": target, "provider": chosen, "via": "ssh-master", "control_path": machine.get("control_path"), "forward_socket": remote_socket,
            "remote": info, "progress": progress, "elapsed_s": round(time.monotonic() - started, 1), "at": iso(now())}


def _connect_herdr(fm, machine: dict, target: str, *, session: str | None, budget: float, progress: list[str], started: float) -> dict:
    """A machine Herdr saves: no directory row (D2). Reuse the forwarded socket when it answers
    (no ssh at all); otherwise `open_master` rides a master that already answers or opens the one
    login, then the remote server is started or forwarded. Herdr 0.9.0's `machine add` leaves
    nothing to ride: its ssh uses a private control socket (`-S /tmp/herdr-ssh-<pid>-0/ctl`) and
    `-O exit`s it before returning, so a first connect costs Herdr's login plus at most one of ours."""
    label = machine["label"]
    local_sock = fleet_remote.forward_socket_path(label, session or fleet_remote.profile_session(machine))
    try:
        status = {"socket": local_sock, "remote": fleet_remote.ping(local_sock)}   # Herdr's forward already answers: no ssh at all
        progress.append(f"{label}: reusing the forwarded Herdr socket ({status['remote'].get('version', '?')})")
    except FleetError:
        open_master(machine, progress, budget=max(CONNECT_FLOOR_S, budget - (time.monotonic() - started)))
        status = ensure_remote_server(machine, progress, session=session)
        progress.append(f"{label}: forwarded the Herdr socket ({status['remote'].get('version', '?')})")
    with fleet_session.State() as state:
        if label not in state.data["connected_once"]:
            state.data["connected_once"].append(label)
    progress.append(f"recorded {label} as herdr ({time.monotonic() - started:.1f}s)")
    version = status["remote"].get("version", "")
    control = machine.get("control_path") or fleet_remote.control_path_for(machine)   # the master this connect used, else the one already there
    return {"machine": label, "target": target, "provider": "herdr", "via": "herdr", "control_path": control, "forward_socket": status["socket"],
            "remote": {"provider": "herdr", "herdr": f"herdr {version}".strip()}, "progress": progress,   # only what this path observed: the forward's ping
            "elapsed_s": round(time.monotonic() - started, 1), "at": iso(now())}


# ---------------------------------------------------------------- forget


def forget(label: str, *, confirm: bool) -> dict:
    fm = _fm()
    machines = fleet_machines.merged(fm.list_machines() if herdr_binary() else None)
    machine = next((m for m in machines if m.get("label") == label), None)
    if machine is None:
        raise Usage(f"unknown machine {label!r}", next="machines", ref=label)
    if machine.get("source") == "herdr":
        raise Unsupported(f"{label} is saved by Herdr; this skill never edits Herdr's list", next=herdr_remove(machine), ref=label, provider="herdr")
    live, verified = 0, False
    try:
        if machine.get("provider") == "tmux":
            import fleet_tmux
            listing = fleet_tmux.list_sessions(machine)
            live, verified = len(listing["sessions"]), bool(listing["online"])
        elif machine.get("provider") == "herdr":
            row = fm.server_agents(label, machine)
            live, verified = len(row["agents"]), bool(row["online"])
    except FleetError:
        verified = False
    if not verified and not confirm:
        raise Unreachable(f"{label} does not answer, so its live sessions cannot be counted; forget refused without --confirm",
                          next=f"connect {machine.get('target', label)} --label {label}, or rerun forget {label} --confirm to drop the row unverified", ref=label)
    if live and not confirm:
        raise Refused(f"{label} still has {live} live session(s); forget refused without --confirm",
                      next=f"close them, or rerun forget {label} --confirm to drop the row and leave them running", ref=label, outcome="session_live")
    fleet_machines.remove(label)
    with fleet_session.State() as state:
        state.data["connected_once"] = [m for m in state.data.get("connected_once", []) if m != label]
        state.data.get("exec_panes", {}).pop(f"{label}@{fleet_remote.home_host()}", None)
    return {"forgot": label, "live_sessions_left_running": live, "verified": verified}
