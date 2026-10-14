"""Reaching a Herdr server and running a command on a machine.

This module owns the ways a server is reached: the local socket paths and the
socket API (`ping`, `api_call`, `snapshot_agents`), the one `herdr` CLI seam
(`run_herdr`, `herdr_json`), ssh ControlMaster checks (`master_alive`,
`control_path_for`) and the socket forward over a live master
(`forward_status`). On top of those sits the remote execution ladder.

Rungs, tried in order, never skipped forward silently:

1. `herdr-pane` — the machine's Herdr server answers over its forwarded
   socket: the command runs in a pane this skill owns on that server (one
   per engagement, labelled `fleet-manager@<home host>`), writes its output
   to a file there, and the file is read back through the pane. No ssh
   session at all, so it works while the machine's single session slot is
   held by the Herdr bridge.
2. `ssh-master` — the ssh ControlMaster for the machine is alive: the
   command rides it (`ssh <target> <command>` multiplexes over the master;
   no new login, no second factor).
3. `unreachable` — neither: the verb stops with the `connect` command.

This module never opens a fresh ssh login (`BatchMode=yes` everywhere, no
`ControlMaster=auto` here); `connect` is the only verb that does, once,
with the human present.

Command output comes home through the pane (rung 1) or the master (rung 2)
and stops above FLEET_MANAGER_COPY_CAP_BYTES (default 4 MiB) with the cap
named; the home machine is the sole owner of the record.

Copying home is lazy. No verb copies a file per round: `context` and `list`
pull status only. `fetch <machine> <path>` asks the machine for the file's
content hash first and copies only when the home copy is missing or its own
sha256 differs from the remote one (the last hash is also kept in the state
file); an unchanged file is a no-op answer. Symlinks are never followed, the copy cap applies to the file, and
the decoded bytes are checked against the remote hash. Code never travels
this way: it comes home through a PR.
"""

from __future__ import annotations

import base64
import binascii
import hashlib
import json
import os
import re
import shlex
import shutil
import socket
import subprocess
import tempfile
import uuid

import fleet_machines
import fleet_session  # cyclic with fleet_session's import of this module: read its names inside functions only, never at module scope
from fleet_contract import FleetError, FleetTimeout, Refused, Unreachable, Unsupported, Usage, iso, now, size_cap_bytes

LOCAL = "local"
DONE_RE = re.compile(r"FM-DONE:(\d+):(\d+):([0-9a-f]+)")
FETCH_RE = re.compile(r"FM-FETCH:(ok:([0-9a-fA-F]{64}):(\d+)|symlink|directory|missing|unreadable|nohash)")
EXEC_LABEL_PREFIX = "fleet-manager@"


# ---------------------------------------------------------------- reaching a Herdr server: paths, CLI, socket API

BIN = os.environ.get("HERDR_BIN_PATH") or shutil.which("herdr") or "herdr"
SSH = os.environ.get("FLEET_MANAGER_SSH") or "ssh"
UID = os.getuid() if hasattr(os, "getuid") else 0
FORWARD_DIR = os.environ.get("FLEET_MANAGER_DIR") or f"/tmp/fleet-manager-{UID}"
CALL_TIMEOUT_S = float(os.environ.get("FLEET_MANAGER_CALL_TIMEOUT_S", "20"))
SSH_TIMEOUT_S = float(os.environ.get("FLEET_MANAGER_SSH_TIMEOUT_S", "15"))
API_TIMEOUT_S = float(os.environ.get("FLEET_MANAGER_API_TIMEOUT_S", "5"))
USER = os.environ.get("USER") or os.environ.get("LOGNAME") or ""
SESSION = os.environ.get("FLEET_MANAGER_SESSION") or ""


def default_local_socket() -> str:
    """The local server's API socket. FLEET_MANAGER_SESSION names a Herdr named
    session (its own server + socket) so a caller or a test can own an isolated
    local server instead of the default one the human's TUI attaches to."""
    if SESSION:
        return session_socket_path(SESSION)
    return os.environ.get("HERDR_SOCKET_PATH") or session_socket_path("default")


def session_socket_path(session: str, home: str | None = None) -> str:
    """Where a Herdr session's server socket lives under one home directory."""
    base = home if home is not None else os.path.expanduser("~")
    if not session or session == "default":
        return f"{base}/.config/herdr/herdr.sock"
    return f"{base}/.config/herdr/sessions/{session}/herdr.sock"


def local_session_name(sock: str) -> str:
    """The Herdr session name of a resolved local socket. HERDR_SOCKET_PATH (which
    every pane of a named session inherits) is honoured by default_local_socket(),
    so the name is read off the socket path, not off FLEET_MANAGER_SESSION alone."""
    m = re.search(r"/sessions/([^/]+)/herdr\.sock$", sock)
    return SESSION or (m.group(1) if m else "default")


def local_server_argv() -> list[str]:
    return [BIN, "--session", SESSION, "server"] if SESSION else [BIN, "server"]


def herdr_env(socket_path: str, local: bool) -> dict:
    env = dict(os.environ)
    env["HERDR_SOCKET_PATH"] = socket_path
    if not local:
        # The caller's pane context belongs to the LOCAL server; never let a
        # remote command default to it.
        for key in ("HERDR_PANE_ID", "HERDR_TAB_ID", "HERDR_WORKSPACE_ID"):
            env.pop(key, None)
    return env


def run_herdr(socket_path: str, args: list[str], *, local: bool, timeout: float | None = None) -> subprocess.CompletedProcess:
    """The one seam every herdr CLI call goes through: a hung binary is a typed `FleetTimeout`, one that cannot
    run (missing, not executable, a directory) a `FleetError` — so a verb that needs the answer fails the same way
    (exit 6, `next`), never a raw traceback; the best-effort digest reads swallow only the timeout."""
    try:
        return subprocess.run(
            [BIN, *args],
            env=herdr_env(socket_path, local),
            capture_output=True,
            text=True,
            timeout=timeout or CALL_TIMEOUT_S,
            stdin=subprocess.DEVNULL,
        )
    except subprocess.TimeoutExpired:
        raise FleetTimeout(f"herdr {' '.join(args)} timed out after {timeout or CALL_TIMEOUT_S:.0f}s")
    except OSError as exc:   # FileNotFoundError, PermissionError (no +x), NotADirectoryError (a file in the path) …
        raise FleetError(f"herdr binary could not be run: {BIN!r} ({exc.strerror or exc}); set HERDR_BIN_PATH")


def herdr_error_detail(text: str) -> tuple[str, str]:
    """herdr's JSON error envelope `{"error": {"code", "message"}}` as (code, message): the message is the text a
    human reads, the code rides `FleetError.detail["code"]`; anything that is not the envelope (a panic trace) is
    ("", the text itself). The one decoder for `herdr_json`, `prompt` and `list_machines` (#39447)."""
    detail = (text or "").strip()
    try:
        error = json.loads(detail).get("error") or {}
    except (ValueError, AttributeError):
        return "", detail
    return str(error.get("code") or ""), str(error.get("message") or "") or detail


def herdr_json(socket_path: str, args: list[str], *, local: bool, timeout: float | None = None) -> dict:
    """Run a JSON-returning herdr command; raise FleetError with the CLI's error."""
    proc = run_herdr(socket_path, args, local=local, timeout=timeout)
    if proc.returncode != 0:
        code, detail = herdr_error_detail(proc.stderr or proc.stdout)
        if code in ("agent_not_found", "pane_not_found"):
            raise Refused(detail, next="list (it shows every live session)", provider="herdr", outcome="no_such_session")   # the caller's address rides in from main()
        raise FleetError(detail or f"herdr {' '.join(args)} exited {proc.returncode}", detail={"code": code} if code else None)
    try:
        return json.loads(proc.stdout)
    except ValueError:
        raise FleetError(f"herdr {' '.join(args)} returned non-JSON output")


def api_connect(socket_path: str, timeout: float | None = None) -> socket.socket:
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.settimeout(timeout or API_TIMEOUT_S)
    try:
        sock.connect(socket_path)
    except OSError as exc:
        sock.close()
        raise FleetError(f"cannot connect to {socket_path}: {exc.strerror or exc}")
    return sock


def api_call(socket_path: str, method: str, params: dict | None = None, *, timeout: float | None = None) -> dict:
    """One Herdr socket request. The server answers one request per connection
    (it closes after the reply), so every call is its own connection."""
    sock = api_connect(socket_path, timeout)
    try:
        request = {"id": f"fleet:{method}", "method": method, "params": params or {}}
        sock.sendall((json.dumps(request) + "\n").encode())
        reader = sock.makefile("rb")
        line = reader.readline()
    except OSError as exc:
        raise FleetError(f"{method} on {socket_path}: {exc.strerror or exc}")
    finally:
        sock.close()
    if not line:
        raise FleetError(f"{method} on {socket_path}: the server closed the connection without a reply")
    try:
        reply = json.loads(line)
    except ValueError:
        raise FleetError(f"{method} on {socket_path}: non-JSON reply")
    if reply.get("error"):
        err = reply["error"]
        raise FleetError(f"{method}: {err.get('code', 'error')}: {err.get('message', '')}".rstrip(": "))
    return reply.get("result") or {}


def ping(socket_path: str) -> dict:
    """{"version", "protocol"} of the server behind `socket_path`; FleetError when none answers."""
    if not os.path.exists(socket_path):
        raise FleetError(f"no socket at {socket_path}")
    result = api_call(socket_path, "ping")
    return {"version": str(result.get("version") or ""), "protocol": result.get("protocol")}


def probe_error(socket_path: str) -> str | None:
    """None when a herdr server answers on `socket_path`, else why it did not."""
    try:
        ping(socket_path)
    except FleetError as exc:
        return str(exc)
    return None


def probe(socket_path: str) -> bool:
    return probe_error(socket_path) is None


def snapshot_agents(socket_path: str) -> tuple[list[dict], dict]:
    """(agents, snapshot) from one `session.snapshot`: every pane Herdr counts as an agent."""
    result = api_call(socket_path, "session.snapshot")
    snap = result.get("snapshot") or {}
    agents = snap.get("agents")
    if agents is None:
        agents = [p for p in snap.get("panes") or [] if p.get("agent")]
    return agents, snap


# ---------------------------------------------------------------- ssh control and the forward


def ssh_control(target: str, *args: str, timeout: float | None = None, control_path: str | None = None) -> subprocess.CompletedProcess:
    control = ["-o", f"ControlPath={control_path}"] if control_path else []
    return subprocess.run(
        [SSH, "-o", "BatchMode=yes", *control, "-O", *args, target],
        capture_output=True,
        text=True,
        timeout=timeout or SSH_TIMEOUT_S,
        stdin=subprocess.DEVNULL,
    )


def derived_control_path(machine: dict) -> str:
    """Where `connect` puts the ControlMaster socket it opens for a target."""
    return os.path.join(FORWARD_DIR, f"cm-{fleet_machines.label_for_target(machine['target'])}")


def control_path_for(machine: dict) -> str | None:
    """The ControlMaster socket to check for a machine: the directory row's
    `control_path`, else the derived one when this skill opened it (so a
    Herdr-saved machine needs no directory copy, D2), else None — ssh's own
    config then finds a master Herdr or the user opened."""
    if machine.get("control_path"):
        return machine["control_path"]
    derived = derived_control_path(machine)
    return derived if os.path.exists(derived) else None


def master_alive(target: str, control_path: str | None = None) -> bool:
    try:
        proc = ssh_control(target, "check", control_path=control_path)
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False
    return proc.returncode == 0 and "Master running" in (proc.stderr + proc.stdout)


def profile_session(machine: dict) -> str:
    return machine.get("session") or "default"


def forward_socket_path(label: str, session: str = "default") -> str:
    safe = re.sub(r"[^A-Za-z0-9_.-]", "_", label)
    if session and session != "default":
        safe += "@" + re.sub(r"[^A-Za-z0-9_.-]", "_", session)
    return os.path.join(FORWARD_DIR, f"{safe}.sock")


def remote_socket_candidates(machine: dict, session: str) -> list[str]:
    """Where the remote server's socket lives, derived from the profile: its
    Herdr session (`herdr machine add --remote-session`) picks the session
    directory; the ssh target's user (or this user) picks the home."""
    override = os.environ.get("FLEET_MANAGER_REMOTE_SOCKET")
    if override:
        return [override]
    target = machine.get("target", "")
    user = (target.split("@", 1)[0] if "@" in target else "") or USER
    return [session_socket_path(session, home) for home in (f"/home/{user}", f"/Users/{user}")]


def forward_status(machine: dict, *, session: str | None = None, reset: bool = False) -> dict:
    """Reach one machine's server over its forward, spending one probe and at most
    one `ssh -O check`: {"socket", "note", "master" (True|False|None when a live
    forward made the check unnecessary), "remote" (the ping reply, or None)}."""
    label = machine["label"]
    target = machine["target"]
    session = session or profile_session(machine)
    local_sock = forward_socket_path(label, session)
    os.makedirs(FORWARD_DIR, mode=0o700, exist_ok=True)
    if not reset:
        try:
            return {"socket": local_sock, "note": "forwarded", "master": None, "remote": ping(local_sock)}
        except FleetError:
            pass
    control = control_path_for(machine)
    if not master_alive(target, control_path=control):
        return {"socket": None, "note": f"ssh master down for {target}", "master": False, "remote": None}
    for remote_sock in remote_socket_candidates(machine, session):
        spec = f"{local_sock}:{remote_sock}"
        try:
            ssh_control(target, "cancel", "-L", spec, control_path=control)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        try:
            os.unlink(local_sock)
        except FileNotFoundError:
            pass
        try:
            proc = ssh_control(target, "forward", "-L", spec, control_path=control)
        except subprocess.TimeoutExpired:
            return {"socket": None, "note": "ssh -O forward timed out", "master": True, "remote": None}
        except FileNotFoundError:
            return {"socket": None, "note": f"ssh binary not found: {SSH!r}", "master": True, "remote": None}
        if proc.returncode != 0:
            continue
        try:
            return {"socket": local_sock, "note": "forwarded", "master": True, "remote": ping(local_sock)}
        except FleetError:
            continue
    return {"socket": None, "note": "forward bound but the remote herdr server did not answer (is herdr running there?)", "master": True, "remote": None}


# ---------------------------------------------------------------- the remote execution ladder


def home_host() -> str:
    return os.environ.get("FLEET_MANAGER_ENGAGEMENT") or socket.gethostname().split(".", 1)[0]


def exec_label() -> str:
    return EXEC_LABEL_PREFIX + home_host()


class RemoteResult(dict):
    """{"rung", "rc", "stdout", "stderr"}; truthy `ok` when rc == 0."""

    @property
    def ok(self) -> bool:
        return self.get("rc") == 0


def ssh_argv(machine: dict | None, *args: str) -> list[str]:
    argv = [SSH, "-o", "BatchMode=yes", "-o", "ControlMaster=no"]
    control = control_path_for(machine) if machine and machine.get("target") else None
    if control:
        argv += ["-o", f"ControlPath={control}"]
    return argv + list(args)


def run_local(argv: list[str], *, timeout: float, stdin_text: str | None = None) -> RemoteResult:
    try:
        proc = subprocess.run(argv, capture_output=True, text=True, timeout=timeout, input=stdin_text,
                              stdin=None if stdin_text is not None else subprocess.DEVNULL)
    except FileNotFoundError as exc:
        return RemoteResult(rung="local", rc=127, stdout="", stderr=str(exc))
    except subprocess.TimeoutExpired:
        return RemoteResult(rung="local", rc=124, stdout="", stderr=f"timed out after {timeout:.0f}s")
    return RemoteResult(rung="local", rc=proc.returncode, stdout=proc.stdout, stderr=proc.stderr)


def _shell_line(argv: list[str]) -> str:
    return " ".join(shlex.quote(a) for a in argv)


# ---------------------------------------------------------------- rung 2: ssh master


def master_up(machine: dict) -> bool:
    return master_alive(machine["target"], control_path=control_path_for(machine))


def refuse_above_cap(machine: dict, size: int, provider: str = "tmux") -> None:
    """Outputs come home under FLEET_MANAGER_COPY_CAP_BYTES on every rung; above it the verb refuses with the cap named."""
    cap = size_cap_bytes()
    if size > cap:
        raise Usage(f"{machine['label']}: output is {size} bytes, above the {cap}-byte copy cap",
                    next="raise FLEET_MANAGER_COPY_CAP_BYTES or read the output on the machine", ref=machine["label"], provider=provider)


def run_over_master(machine: dict, argv: list[str], *, timeout: float, stdin_text: str | None = None) -> RemoteResult:
    cmd = ssh_argv(machine, machine["target"], "--", _shell_line(argv))
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, input=stdin_text,
                              stdin=None if stdin_text is not None else subprocess.DEVNULL)
    except FileNotFoundError:
        return RemoteResult(rung="ssh-master", rc=127, stdout="", stderr=f"ssh binary not found: {SSH!r}")
    except subprocess.TimeoutExpired:
        return RemoteResult(rung="ssh-master", rc=124, stdout="", stderr=f"timed out after {timeout:.0f}s")
    refuse_above_cap(machine, len(proc.stdout.encode("utf-8", "replace")))   # the same cap on every rung
    return RemoteResult(rung="ssh-master", rc=proc.returncode, stdout=proc.stdout, stderr=proc.stderr)


def _session_refused(result: RemoteResult) -> bool:
    text = (result.get("stderr") or "").lower()
    return result.get("rc") == 255 and ("session open refused" in text or "mux_client_request_session" in text
                                        or "connect to host" in text or "control socket" in text)


# ---------------------------------------------------------------- rung 1: herdr pane


def forwarded_socket(machine: dict) -> str | None:
    """The machine's forwarded Herdr socket when its server answers now, else None."""
    if machine.get("provider", "herdr") != "herdr":
        return None
    try:
        status = forward_status(machine)
    except FleetError:
        return None
    return status["socket"] if status.get("socket") and status.get("remote") else None


def exec_pane(machine: dict, sock: str) -> str:
    """The pane this skill owns on that server (created once per engagement, remembered in state)."""
    key = f"{machine['label']}@{home_host()}"
    with fleet_session.State() as state:
        pane_id = (state.data.setdefault("exec_panes", {})).get(key)
    if pane_id:
        try:
            herdr_json(sock, ["pane", "get", pane_id], local=False)
            return pane_id
        except FleetError:
            pass
    created = herdr_json(sock, ["workspace", "create", "--label", exec_label(), "--no-focus"], local=False)["result"]
    pane_id = (created.get("root_pane") or {}).get("pane_id")
    if not pane_id:
        raise Unreachable(f"{machine['label']}: Herdr created no pane for the fleet-manager exec workspace", ref=machine["label"], provider="herdr")
    with fleet_session.State() as state:
        state.data.setdefault("exec_panes", {})[key] = pane_id
    return pane_id


def pane_run(machine: dict, sock: str, pane_id: str, line: str) -> None:
    """Type ONE line into the exec pane. Real `herdr pane run` (0.9.0) space-joins everything after the pane id
    unquoted and succeeds with an EMPTY stdout, so the argument is one string and the exit status is the receipt —
    never a JSON parse (#37718: reading that success as a failure typed the command a second time over ssh)."""
    proc = run_herdr(sock, ["pane", "run", pane_id, line], local=False)
    if proc.returncode != 0:
        raise Unreachable(f"{machine['label']}: pane run refused ({(proc.stderr or proc.stdout or f'exit {proc.returncode}').strip()[:160]})",
                          ref=machine["label"], provider="herdr")


def run_in_pane(machine: dict, sock: str, argv: list[str], *, timeout: float) -> RemoteResult:
    """Run `argv` in the exec pane; output goes to a remote file and comes back base64 through the pane."""
    token = uuid.uuid4().hex[:12]
    pane_id = exec_pane(machine, sock)
    out = f"/tmp/fleet-manager-{token}.out"
    line = (f"{_shell_line(argv)} >{out} 2>&1; rc=$?; printf '\\nFM-DONE:%s:%s:{token}\\n' $rc $(wc -c <{out})")
    pane_run(machine, sock, pane_id, f"sh -c {shlex.quote(line)}")
    waited = herdr_json(sock, ["pane", "wait-output", pane_id, "--regex", f"FM-DONE:[0-9]+:[0-9]+:{token}", "--timeout", str(int(timeout * 1000))],
                           local=False, timeout=timeout + 15)
    text = str((waited.get("result") or {}).get("matched") or (waited.get("result") or {}).get("line") or waited)
    match = DONE_RE.search(text)
    if not match:
        return RemoteResult(rung="herdr-pane", rc=124, stdout="", stderr=f"no completion marker within {timeout:.0f}s", pane=pane_id)
    rc, size = int(match.group(1)), int(match.group(2))
    if size > size_cap_bytes():
        pane_run(machine, sock, pane_id, f"rm -f {out}")
    refuse_above_cap(machine, size, provider="herdr")
    # The markers are built with printf's %s so the typed command line (echoed on screen before any output)
    # never contains the literal `FM-OUT-END:<token>`: the wait is anchored to the real line, not the echo.
    pane_run(machine, sock, pane_id, "sh -c " + shlex.quote(f"printf 'FM-OUT-%s:{token}\\n' BEGIN; base64 <{out} | tr -d '\\n'; printf '\\nFM-OUT-%s:{token}\\n' END; rm -f {out}"))
    herdr_json(sock, ["pane", "wait-output", pane_id, "--regex", f"^FM-OUT-END:{token}$", "--timeout", "15000"], local=False, timeout=30)
    lines = max(20, size // 60 + 20)
    proc = run_herdr(sock, ["pane", "read", pane_id, "--source", "recent-unwrapped", "--lines", str(lines)], local=False)
    screen = proc.stdout or ""
    begin, end = screen.rfind(f"FM-OUT-BEGIN:{token}"), screen.rfind(f"FM-OUT-END:{token}")
    if begin < 0 or end < begin:
        return RemoteResult(rung="herdr-pane", rc=124, stdout="", stderr="output markers not found in the pane read (the read window missed FM-OUT-BEGIN, or pane read failed)", pane=pane_id)
    blob = "".join(screen[begin + len(f"FM-OUT-BEGIN:{token}"):end].split())
    try:
        payload = base64.b64decode(blob, validate=False).decode("utf-8", "replace")
    except (ValueError, UnicodeDecodeError):
        return RemoteResult(rung="herdr-pane", rc=124, stdout="", stderr="output blob in the pane did not decode", pane=pane_id)
    return RemoteResult(rung="herdr-pane", rc=rc, stdout=payload, stderr="", pane=pane_id)


# ---------------------------------------------------------------- the ladder


def run_remote(machine: dict | None, argv: list[str], *, timeout: float = 30.0, stdin_text: str | None = None,
               progress: list[str] | None = None) -> RemoteResult:
    """Run `argv` on `machine` (None or label `local` = this host) down the ladder."""
    if machine is None or machine.get("label") == LOCAL:
        return run_local(argv, timeout=timeout, stdin_text=stdin_text)
    label = machine.get("label", "?")
    sock = forwarded_socket(machine) if stdin_text is None else None
    if sock:
        try:
            result = run_in_pane(machine, sock, argv, timeout=timeout)
            if progress is not None:
                progress.append(f"{label}: ran over the Herdr pane ({result.get('pane')})")
            return result
        except Usage:
            raise   # a refusal on the pane rung (the copy cap) is the answer, not a reason to try another rung
        except FleetError as exc:
            if progress is not None:
                progress.append(f"{label}: Herdr pane rung failed ({exc}); trying the ssh master")
    if master_up(machine):
        result = run_over_master(machine, argv, timeout=timeout, stdin_text=stdin_text)
        if not _session_refused(result):
            if progress is not None:
                progress.append(f"{label}: ran over the ssh master")
            return result
        if progress is not None:
            progress.append(f"{label}: the ssh master refused a session ({result.get('stderr', '').strip()[:80]})")
    raise Unreachable(f"{label}: unreachable — no Herdr forward answers and no ssh master carries a session",
                      next=f"connect {machine.get('target', label)} --label {label}", ref=label, provider=machine.get("provider", ""))


# ---------------------------------------------------------------- fetch: one file home, by content hash


def _fetch_probe_line(path: str) -> str:
    """One remote shell line: what the path is and, for a regular file, its sha256 and size."""
    q = shlex.quote(path)
    return (f"p={q}; if [ -L \"$p\" ]; then echo FM-FETCH:symlink; elif [ -d \"$p\" ]; then echo FM-FETCH:directory; "
            f"elif [ ! -f \"$p\" ]; then echo FM-FETCH:missing; elif [ ! -r \"$p\" ]; then echo FM-FETCH:unreadable; else "
            f"h=$( (sha256sum \"$p\" 2>/dev/null || shasum -a 256 \"$p\" 2>/dev/null) | cut -c1-64 ); s=$(wc -c <\"$p\" | tr -d ' '); "
            f"if [ -z \"$h\" ]; then echo FM-FETCH:nohash; else echo \"FM-FETCH:ok:$h:$s\"; fi; fi")


def remote_digest(machine: dict, path: str, *, progress: list[str] | None = None) -> dict:
    """{"sha256", "bytes", "rung"} for a regular file on the machine; a symlink is refused,
    a directory or a missing path is a usage error, a box without a hash tool is unreachable."""
    label = machine["label"]
    ref = f"{label}:{path}"
    provider = machine.get("provider", "herdr")
    result = run_remote(machine, ["sh", "-c", _fetch_probe_line(path)], timeout=30, progress=progress)
    match = FETCH_RE.search(result.get("stdout") or "")
    if not result.ok or not match:
        raise Unreachable(f"{label}: could not read {path} ({(result.get('stderr') or result.get('stdout') or '').strip()[:160] or 'no answer'})",
                          next=f"connect {machine.get('target', label)} --label {label}", ref=ref, provider=provider)
    kind = match.group(1)
    if kind == "symlink":
        raise Refused(f"{ref} is a symlink; fetch never follows one", next=f"fetch {label} <the link's target path>", ref=ref, provider=provider)
    if kind == "directory":
        raise Usage(f"{ref} is a directory; fetch copies one file", next=f"fetch {label} <a file under it>", ref=ref, provider=provider)
    if kind == "missing":
        raise Usage(f"{ref} does not exist on {label}", next=f"read the session that writes it, or check the path on {label}", ref=ref, provider=provider)
    if kind == "unreadable":
        raise Refused(f"{ref} exists but this login cannot read it", next=f"chmod/chown it on {label} (or read it as a user who can), then fetch {label} {path}", ref=ref, provider=provider)
    if kind == "nohash":
        raise Unreachable(f"{label}: neither sha256sum nor shasum is on that machine, so the file cannot be hashed", next=f"install coreutils on {label}", ref=ref, provider=provider)
    return {"sha256": match.group(2).lower(), "bytes": int(match.group(3)), "rung": result.get("rung")}


def machine_home(label: str) -> str:
    """home/<machine>/ — the one directory a machine's fetched files may land in (a label of dots never climbs out)."""
    safe = re.sub(r"[^A-Za-z0-9_.@-]", "_", label)
    if not safe.strip("."):   # `..` would climb out of home/ onto the state file
        safe = "_" + safe.replace(".", "_")
    return os.path.join(os.path.dirname(fleet_session.state_path()), "home", safe)


def home_path(label: str, path: str) -> str:
    """Where a fetched file lands by default: home/<machine>/<path>; `..` in the path is refused."""
    parts = [p for p in os.path.normpath(path).split(os.sep) if p and p != "."]
    if ".." in parts or not parts:
        raise Usage(f"{path!r} is not a plain file path", next="fetch <machine> </absolute/path/to/file>", ref=f"{label}:{path}")
    return os.path.join(machine_home(label), *parts)


def _sha256_of(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 16), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _write_home(dest: str, blob: bytes) -> None:
    os.makedirs(os.path.dirname(dest), mode=0o700, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(dest), prefix=".fetch-")
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(blob)
        os.chmod(tmp, 0o600)
        os.replace(tmp, dest)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def fetch(machine: dict, path: str, *, progress: list[str] | None = None) -> dict:
    """Bring one file home. The hash probe is the only round trip when nothing changed."""
    progress = progress if progress is not None else []
    label = machine["label"]
    ref = f"{label}:{path}"
    provider = machine.get("provider", "herdr")
    dest = home_path(label, path)   # the one place fetch writes: home/<machine>/<path> (fetch never prompts; a human moves the file)
    digest = remote_digest(machine, path, progress=progress)
    with fleet_session.State() as state:
        record = dict((state.data.get("fetched") or {}).get(ref) or {})
    base = {"machine": label, "path": path, "home": dest, "sha256": digest["sha256"], "bytes": digest["bytes"], "rung": digest["rung"],
            "last_fetched_at": record.get("at")}
    if os.path.isfile(dest) and _sha256_of(dest) == digest["sha256"]:   # the home copy IS the remote file: nothing to move
        progress.append(f"{ref} unchanged since {record.get('at') or 'an earlier copy'} ({digest['sha256'][:12]}); nothing copied")
        return dict(base, copied=False, unchanged=True)
    cap = size_cap_bytes()
    wire = 4 * ((digest["bytes"] + 2) // 3) + 1   # base64 on the way home
    if digest["bytes"] > cap or wire > cap:
        raise Usage(f"{ref} is {digest['bytes']} bytes ({wire} on the wire), above the {cap}-byte copy cap",
                    next="raise FLEET_MANAGER_COPY_CAP_BYTES or read it on the machine", ref=ref, provider=provider)
    result = run_remote(machine, ["sh", "-c", f"base64 <{shlex.quote(path)}"], timeout=120, progress=progress)
    if not result.ok:
        raise Unreachable(f"{ref}: the copy failed ({(result.get('stderr') or '').strip()[:160] or 'no output'})", next=f"fetch {label} {path} again", ref=ref, provider=provider)
    try:
        blob = base64.b64decode("".join((result.get("stdout") or "").split()), validate=True)
    except (ValueError, binascii.Error):
        raise Unreachable(f"{ref}: the copy did not decode", next=f"fetch {label} {path} again", ref=ref, provider=provider)
    if hashlib.sha256(blob).hexdigest() != digest["sha256"]:
        raise Unreachable(f"{ref} changed while it was being copied; nothing written", next=f"fetch {label} {path} again", ref=ref, provider=provider)
    _write_home(dest, blob)
    at = iso(now())
    with fleet_session.State() as state:
        state.data.setdefault("fetched", {})[ref] = {"sha256": digest["sha256"], "bytes": digest["bytes"], "at": at, "home": dest}
    progress.append(f"{ref} -> {dest} ({digest['bytes']} bytes, {digest['sha256'][:12]}, over the {result.get('rung')})")
    return dict(base, copied=True, unchanged=False, last_fetched_at=at)


# ---------------------------------------------------------------- the MSP rung: host-manager's mode C beside this skill
#
# A machine that advertises MSP is reached through the transport CLI host-manager's `msp` provider speaks (decision record 41038
# D4: fleet-manager answers "which machines" and "where does this session go"; host-manager opens and drives the
# session). Two reads are this skill's own — `muse hosts` (the machine source) and `muse sessions --host <host>` per
# online host (the board) — spoken through host-manager's `Cli` (the CLI's name, its override, the instance flags, the exit table live
# there once); every write, and every per-session read, is one call of host-manager's helper with `--mode msp`, so the
# two skills keep one record of the session. The flag that turns mode `msp` on is host-manager's
# (`TBH_AGENTS_SESSION_PROTOCOL`): off is the old path byte for byte — no source, no machine, no call.

MSP_FLAG = "TBH_AGENTS_SESSION_PROTOCOL"
MSP_HELPER_TIMEOUT_S = float(os.environ.get("FLEET_MANAGER_MSP_HELPER_TIMEOUT_S", "300"))   # a mode-C open is two transport calls; each has its own deadline
MSP_LIST_TIMEOUT_S = float(os.environ.get("FLEET_MANAGER_MSP_LIST_TIMEOUT_S", "8"))         # one host's session listing inside a digest: past it the host is "not answered yet"
MSP_LIST_WORKERS = 4
MSP_UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)
_MSP: dict = {}


def msp_enabled() -> bool:
    return os.environ.get(MSP_FLAG, "").strip().lower() in ("1", "on", "true", "yes")


def host_manager_dir() -> str:
    """host-manager's skill directory: `FLEET_MANAGER_HOST_MANAGER`, else the sibling of this skill (the two ship side by side)."""
    configured = os.environ.get("FLEET_MANAGER_HOST_MANAGER")
    if configured:
        return configured
    return os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "host-manager"))


def host_manager_helper() -> str | None:
    path = os.path.join(host_manager_dir(), "scripts", "lane_runtime.py")
    return path if os.path.isfile(path) else None


def _msp_provider():
    """host-manager's `msp_provider` module (its `Cli` and the `muse hosts` reading), or None when it is not beside its helper."""
    if "module" in _MSP:
        return _MSP["module"]
    import sys
    scripts = os.path.join(host_manager_dir(), "scripts")
    module = None
    if os.path.isfile(os.path.join(scripts, "msp_provider.py")):
        if scripts not in sys.path:
            sys.path.append(scripts)   # append: this skill's own modules keep their names
        try:
            import msp_provider   # noqa: PLC0415
            module = msp_provider
        except Exception:   # noqa: BLE001 — an older or broken host-manager beside us: no MSP source, said in the note
            module = None
    _MSP["module"] = module
    return module


def msp_reset() -> None:
    _MSP.clear()


def msp_source(fresh: bool = False) -> dict:
    """The MSP machine source, once per process: `{"state": off | not_available | unreachable | available, "hosts": [{"host",
    "availability"}], "note", "retry", "cli"}`. `hosts` are the rows `muse hosts` marks MSP-ready and authorized (the real
    rows carry no `authorized` key: absent is authorized), online or offline — offline is a machine that is unreachable,
    never one that is gone. Nothing is started here: the transport's own service is asked as it stands."""
    if fresh:
        _MSP.pop("source", None)
        _MSP.pop("sessions", None)
    if "source" in _MSP:
        return _MSP["source"]
    report = {"state": "off", "hosts": [], "note": f"MSP hosts are listed when {MSP_FLAG} is on", "retry": None, "cli": None}
    if msp_enabled():
        module = _msp_provider()
        if module is None:
            report.update(state="not_available", note="MSP hosts need the host-manager skill beside this one (its scripts/msp_provider.py); none was found")
        else:
            cli = module.Cli()
            if cli.resolved.error:
                report.update(state="not_available", note=f"MSP hosts: {cli.resolved.why}", cli=cli.resolved.path)
            else:
                try:
                    envelope = cli.run("hosts", "hosts")
                except module.Transport as fault:
                    state = "not_available" if fault.error in module.NOT_AVAILABLE_ERRORS else "unreachable"
                    report.update(state=state, note=f"MSP hosts: {module.named_reason(str(fault), cli.name)}", retry=cli.shown(fault.argv), cli=cli.resolved.path)
                except module.Refusal as refusal:
                    report.update(state="unreachable", note=f"MSP hosts: {module.named_reason(str(refusal), cli.name)}", retry=cli.shown(cli.argv("hosts")), cli=cli.resolved.path)
                else:
                    rows = envelope.get("result") or {}
                    rows = rows.get("hosts") if isinstance(rows, dict) else rows
                    hosts = []
                    for row in rows or []:
                        if not isinstance(row, dict) or not row.get("msp_ready") or row.get("authorized") is False or not row.get("host_mailbox_id"):
                            continue
                        availability = str(row.get("availability") or "online").lower()
                        hosts.append({"host": str(row["host_mailbox_id"]), "availability": "offline" if availability == "offline" else "online",
                                      "is_local": bool(row.get("is_local"))})
                    report.update(state="available", hosts=hosts, note=f"{len(hosts)} machine(s) advertise MSP", cli=cli.resolved.path)
    _MSP["source"] = report
    return report


def msp_host_error(host: str) -> str | None:
    """The transport's words for the last `sessions --host <host>` that did not answer, or None."""
    return (_MSP.get("host_errors") or {}).get(host)


def msp_ready(host: str) -> bool:
    source = msp_source()
    return source["state"] == "available" and any(h["host"] == host and h["availability"] == "online" for h in source["hosts"])


def msp_directory_host(name: str) -> dict | None:
    """The advertising host `name` names exactly (any host of the directory, in scope or not), or None."""
    return next((dict(h) for h in msp_source()["hosts"] if h["host"] == name), None)


def _own_tokens() -> set[str]:
    """The names this user's own hosts carry in their ids: the login the transport derives ids from (`USER`/`LOGNAME`, then
    the account name), as id slugs; a token shorter than three characters would match strangers and is dropped."""
    names = [os.environ.get("USER"), os.environ.get("LOGNAME")]
    try:
        import pwd
        names.append(pwd.getpwuid(os.geteuid()).pw_name)
    except (ImportError, KeyError, OSError):
        pass
    out = set()
    for name in names:
        slug = re.sub(r"[^a-z0-9._-]+", "-", str(name or "").lower()).strip("-")
        if len(slug) >= 3:
            out.add(slug)
    return out


def _own_host(host: str, tokens: set[str]) -> bool:
    """`msp-<user>-<host>`, `daemon-<user>-<host>-2`, `<user>-mac-demo`: the login stands whole between dashes (a login that
    itself carries a dash still matches as a whole); `testerx` or `xtester` never match `tester`."""
    padded = f"-{host.lower()}-"
    return any(f"-{tok}-" in padded for tok in tokens)


def msp_scope_reason(host: str) -> str | None:
    """Why `host` is in the digest's scope: `local`, `own` (the login family), `saved` (a `connect <host id>` row or an ssh
    row's label), `held` (a session opened here), `named` (this turn), or None."""
    source = msp_source()
    row = next((h for h in source["hosts"] if h["host"] == host), None)
    if row is None:
        return None
    if row.get("is_local"):
        return "local"
    if _own_host(host, _own_tokens()):
        return "own"
    try:
        rows = fleet_machines.load_directory()
    except FleetError:
        rows = []
    if any(host in (r.get("label"), r.get("target")) for r in rows):
        return "saved"
    if any(e.get("machine") == host and e.get("provider") == "msp" and e.get("opened_here") and not e.get("gone_at") for e in fleet_session.read_handles().values()):
        return "held"
    if host in _MSP.get("named", set()):
        return "named"
    return None


def msp_release_host(host: str) -> int:
    """`forget <host id>`: the sessions opened here on `host` stop holding it in the digest's scope (their handles keep
    working by name; the sessions stay on their host). Returns how many handles were released."""
    released = 0
    with fleet_session.State() as state:
        for entry in state.data["handles"].values():
            if entry.get("machine") == host and entry.get("provider") == "msp" and entry.pop("opened_here", None):
                released += 1
    return released


def msp_name(host: str) -> None:
    """The human named this advertising host in this turn (`open <id>`, `list <id>`, an address): it is in scope for this
    invocation even when it is not yours and not connected — a named ask is the authority, a directory listing is not."""
    _MSP.setdefault("named", set()).add(host)


def msp_scope() -> dict:
    """The MSP hosts this skill treats as the user's machines (decision record 41038 D4 read with this skill's own contract, "the machines
    you connected"; QA-B-43535 row 24: a shared directory held 444 sessions of other people's machines and a digest that
    read them all never reached the human): this machine's own advert (`is_local`), the hosts of the user's own login family
    (`msp-<user>-…`, `daemon-<user>-…`), every host saved in the machine directory (`connect <host id>`) or merged into an
    ssh row, every host that holds a session this skill opened or adopted, and any host the user named in this turn. The
    rest of the directory is a count, never rows — and never its sessions. `{"hosts": [...], "advertising": N,
    "not_shown": M, "note": str}`."""
    source = msp_source()
    if "scope" in _MSP:
        return _MSP["scope"]
    tokens = _own_tokens()
    try:
        saved = {r.get("label") for r in fleet_machines.load_directory()} | {r.get("target") for r in fleet_machines.load_directory()}
    except FleetError:
        saved = set()
    # only sessions this skill opened here keep a host in scope: a handle the digest minted while a host was connected must
    # not hold it after `forget` (V-43535 B2 — the stranger's session and prompt kept rendering)
    held = {e.get("machine") for e in fleet_session.read_handles().values() if e.get("provider") == "msp" and e.get("opened_here") and not e.get("gone_at")}
    named = _MSP.get("named", set())
    hosts = [dict(h) for h in source["hosts"]
             if h.get("is_local") or _own_host(h["host"], tokens) or h["host"] in saved or h["host"] in held or h["host"] in named]
    not_shown = len(source["hosts"]) - len(hosts)
    note = ("" if not_shown <= 0 else
            f"{not_shown} more machine(s) advertise MSP in the directory (not yours, not connected): `connect <host id>` adds one you know; "
            "`open <host id> --cwd <dir>` opens on one you name")
    _MSP["scope"] = {"hosts": hosts, "advertising": len(source["hosts"]), "not_shown": max(0, not_shown), "note": note}
    return _MSP["scope"]


def _msp_group(session: dict, pending: list | None) -> str:
    """The fleet's status word for one transport session: `blocked` with a pending request, `working` with a running turn,
    else `idle` (a session the host has not loaded is idle too: alive on the host, nothing pending)."""
    if pending:
        return "blocked"
    if session.get("status") == "running" or session.get("activeTurnId"):
        return "working"
    return "idle"


def _fault_message(fault) -> str:
    """The transport's own words for a failed call: `error.message` of the envelope when the host answered (its `kind` when
    the message is empty), the listing budget when the deadline passed, else the fault's own words."""
    if getattr(fault, "error", None) in ("timeout", "cli_hung"):
        return f"did not answer within {MSP_LIST_TIMEOUT_S:g} s (listing pending; ask again)"
    envelope = getattr(fault, "envelope", None)
    error = envelope.get("error") if isinstance(envelope, dict) else None
    if isinstance(error, dict) and (error.get("message") or error.get("kind")):
        message, kind = str(error.get("message") or ""), error.get("kind")
        return (message or f"the host answered {kind}") + (f" ({kind})" if kind and message else "")
    return str(fault)


def _listing_cli(module):
    """host-manager's `Cli` with the digest's own per-host deadline: a host that does not answer within `MSP_LIST_TIMEOUT_S`
    is "not answered yet", never a digest that waits on it (the operator's own shorter deadline wins)."""
    env = dict(os.environ)
    current = env.get(module.TIMEOUT_ENV, "").strip()
    try:
        current_s = float(current.rstrip("s")) if current else None
    except ValueError:
        current_s = None
    if current_s is None or current_s > MSP_LIST_TIMEOUT_S:
        env[module.TIMEOUT_ENV] = f"{int(MSP_LIST_TIMEOUT_S)}s"
    return module.Cli(env)


def _host_sessions(module, cli, host: str) -> tuple[str, list[dict] | None, str | None]:
    """`(host, rows, None)` from one `muse sessions --host <host>`, or `(host, None, why)` when that host did not answer."""
    cap = MSP_LIST_TIMEOUT_S + 4
    try:
        envelope = cli.run("sessions", "sessions", "--host", host, cap=cap)
    except (module.Transport, module.Refusal) as fault:
        return host, None, _fault_message(fault)[:200]
    result = envelope.get("result") or {}
    rows = result.get("sessions") if isinstance(result, dict) else result
    out: list[dict] = []
    for row in rows or []:
        if not isinstance(row, dict):
            continue
        target = str(row.get("target") or "")
        session = row.get("session") if isinstance(row.get("session"), dict) else {}
        session_id = str(session.get("sessionId") or (target.split("/", 1)[1] if "/" in target else ""))
        if not session_id:
            continue
        pending = None
        if session.get("status") == "running" or session.get("activeTurnId"):
            try:
                shown = cli.run("show", "show", f"{host}/{session_id}", cap=cap).get("result") or {}
                pending = shown.get("pendingRequests") if isinstance(shown, dict) else None
            except (module.Transport, module.Refusal):
                pending = None
        title = str(session.get("title") or "")
        out.append({
            "pane_id": session_id, "addr": f"{host}/{session_id}", "name": title or None, "agent": "muse", "status": _msp_group(session, pending),
            "cwd": session.get("workspaceRoot"), "title": title, "labels": {}, "provider": "msp", "server": host, "terminal_id": session_id,
            "host_status": session.get("status"), "turn_id": session.get("activeTurnId"), "pending": len(pending or []),
        })
    return host, out, None


def msp_sessions(hosts: list[str] | None = None) -> tuple[dict[str, list[dict]], str | None]:
    """The sessions on the MSP hosts asked for (default: every advertised host that is provider `msp` here is asked by the
    inventory; a merged ssh row is read through its ssh provider and never listed here), once per process per host set:
    `({host: [agent rows]}, None)`, or `({}, why)` when the source itself is not available (unknown, never "no sessions").
    One `muse sessions --host <host>` per online host, in parallel — the same read host-manager's provider makes; the CLI's
    `--all-hosts` is a catalog scan with a 64-host budget that answers `partial` with no rows when the directory is
    larger (seen live 2026-09-27), so it is never the board's source. A host that does not answer is unreachable with the
    transport's own words (`msp_host_error`), never "0 sessions"; a running session is asked `muse show` once for its
    pending requests (a request is `waiting-on-you`), a `show` that fails leaves it `working`."""
    source = msp_source()
    online = {h["host"] for h in source["hosts"] if h["availability"] == "online"}
    wanted = tuple(sorted(h for h in (hosts if hosts is not None else online) if h in online))
    cache = _MSP.setdefault("sessions", {})
    if wanted in cache:
        return cache[wanted]
    module = _msp_provider()
    if source["state"] != "available" or module is None:
        cache[wanted] = ({}, source["note"])
        return cache[wanted]
    cli = _listing_cli(module)
    cli.resolved   # noqa: B018 — resolve the CLI and its environment once, before the workers share the object
    cli.run_env    # noqa: B018
    by_host: dict[str, list[dict]] = {}
    errors = _MSP.setdefault("host_errors", {})
    if wanted:
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(len(wanted), MSP_LIST_WORKERS))) as pool:
            for host, rows, why in pool.map(lambda h: _host_sessions(module, cli, h), wanted):
                if why is not None:
                    errors[host] = why
                else:
                    errors.pop(host, None)
                    by_host[host] = rows or []
    cache[wanted] = (by_host, None)
    return cache[wanted]


HM_OUTCOMES = {   # host-manager's word -> this skill's closed vocabulary (fleet_contract); anything else is `failed`
    "opened": "opened", "sent": "sent", "read": "read", "status": "status", "closed": "closed", "stopped": "interrupted", "attach_command": "attach_command",
    "not_found": "no_such_session", "no_such_session": "no_such_session", "refused": "refused", "session_live": "session_live", "ambiguous_ref": "refused",
    "identity_mismatch": "identity_mismatch", "usage": "usage", "mode_unavailable": "unsupported_by_provider", "unsupported_by_provider": "unsupported_by_provider",
    "needs_user_action": "needs_user_action", "transport_unreachable": "provider_unreachable", "mode_unreachable": "provider_unreachable",
    "unreachable": "provider_unreachable", "provider_unreachable": "provider_unreachable", "internal": "failed",
}


def host_manager_msp(argv: list[str], *, ref: str | None = None, next_hint: str = "", host_open: bool = False) -> dict:
    """One host-manager verb on a mode-C session: `python3 <host-manager>/scripts/lane_runtime.py --mode msp <argv>`, its one
    JSON line back. A success line is returned as is; a failure raises this skill's `FleetError` with host-manager's word
    mapped onto the closed vocabulary, its message, and its line under `detail.host_manager`."""
    import sys
    helper = host_manager_helper()
    if helper is None:
        raise Unsupported("an MSP session is driven through the host-manager skill, and none is installed beside this one",
                          next="install host-manager beside fleet-manager, or point FLEET_MANAGER_HOST_MANAGER at its directory", ref=ref, provider="msp")
    command = [sys.executable, helper, *([] if host_open else ["--mode", "msp"]), *argv]   # an `open --host` is judged by host-manager's own ladder (rule 2)
    try:
        proc = subprocess.run(command, capture_output=True, text=True, timeout=MSP_HELPER_TIMEOUT_S, stdin=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        raise Unreachable(f"host-manager gave no answer within {MSP_HELPER_TIMEOUT_S:.0f}s ({shlex.join(argv[:2])})", next=next_hint or "list", ref=ref, provider="msp")
    line = None
    for raw in reversed((proc.stdout or "").splitlines()):
        try:
            candidate = json.loads(raw)
        except ValueError:
            continue
        if isinstance(candidate, dict) and "outcome" in candidate:
            line = candidate
            break
    if line is None:
        raise Unreachable(f"host-manager printed no answer (exit {proc.returncode}): {(proc.stderr or proc.stdout).strip()[-240:]}", next=next_hint or "list", ref=ref, provider="msp")
    word = str(line.get("outcome") or "")
    if proc.returncode == 0 and word in HM_OUTCOMES and HM_OUTCOMES[word] not in ("no_such_session", "refused", "session_live", "usage"):
        return line
    outcome = HM_OUTCOMES.get(word, "failed")
    if word == "refused" and line.get("error") == "live_session_needs_confirm":
        outcome = "session_live"
    if host_open and word in ("mode_unavailable", "mode_unreachable"):
        outcome = "provider_unreachable"   # this skill's source listed the host a moment ago: it stopped advertising or answering between the two reads
    message = str(line.get("message") or line.get("error") or word)
    raise FleetError(message, next=next_hint or str(line.get("next") or "list"), ref=ref, provider="msp", outcome=outcome,
                     detail={"host_manager": {k: line.get(k) for k in ("outcome", "error", "next", "note", "retry", "host", "fallback", "flag") if k in line}})


def msp_identity(host: str, session_id: str, cwd: str | None) -> dict:
    return {"provider": "msp", "machine": host, "server": host, "ref": session_id, "cwd": cwd, "engine": "muse"}
