#!/usr/bin/env python3
"""The copy channel for the herdr worker gate (spec 27701, FR-43932-5/6).

`agents.py` keeps the policy (when a copy is written, refreshed,
tombstoned, repainted); this helper owns every operation that needs
fleet or Herdr-socket knowledge, so agents.py never grows a second
transport:

    agents_copy_channel.py <op> --machine <label|local> --slug <slug>
                           [--thread <id>] [--pane <pane-id>]

Ops (one JSON line out; a failure is {"ok": false, "error": ...} and
exit 1 — callers treat every op as best-effort):
  put        stdin: the copy object -> write thread-copy-<thread>.json
  refresh    stdin: {"coordinator_seen_at": epoch} -> update the stamp
             in place, only if the file still exists and reads live
  tombstone  set the copy's status to accepted (before remove)
  remove     unlink the copy
  read-notes -> {"notes": [...]} from the machine's pending.jsonl
  clear-notes  drop the --pane entries from pending.jsonl
  report     stdin: {"pane", "server", "state", "seq"} -> one
             pane.report_agent on that machine's Herdr server

Remote file ops ride fleet-manager's own remote-exec ladder
(fleet_remote.run_remote) with one small python snippet; the remote
projects home follows the same rule the hook uses ($MUSE_PROJECTS_HOME
in the remote shell, else ~/.muse/projects). Reports go over the
machine's forwarded socket (fleet_remote.forward_status), or the
local session socket for `local`.
"""

import json
import os
import pathlib
import socket
import sys

HERE = pathlib.Path(__file__).resolve().parent
FLEET_SCRIPTS = HERE.parent.parent / "fleet-manager" / "scripts"
SOURCE = "muse:herdr"
AGENT = "muse"
PROBE_TIMEOUT_S = 10.0

REMOTE_SNIPPET = r"""
import json, os, pathlib, sys
job = json.load(sys.stdin)
home = os.environ.get("MUSE_PROJECTS_HOME") or os.path.join(os.path.expanduser("~"), ".muse", "projects")
project = pathlib.Path(home) / job["slug"]
op = job["op"]
if op in ("put", "refresh", "tombstone", "remove"):
    path = project / ("thread-copy-%s.json" % job["thread"])
    if op == "put":
        project.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        tmp.write_text(json.dumps(job["payload"]))
        os.replace(tmp, path)
        print(json.dumps({"ok": True, "op": "put"}))
    elif not path.exists():
        key = "refreshed" if op == "refresh" else "disposition"
        print(json.dumps({"ok": True, "op": op, key: False if op == "refresh" else "already-gone",
                          **({"reason": "missing"} if op == "refresh" else {})}))
    elif op == "refresh":
        copy = json.loads(path.read_text())
        if copy.get("status") in ("done", "accepted", "closed"):
            print(json.dumps({"ok": True, "op": "refresh", "refreshed": False, "reason": "not-live"}))
        else:
            copy["coordinator_seen_at"] = job["payload"].get("coordinator_seen_at")
            path.write_text(json.dumps(copy))
            print(json.dumps({"ok": True, "op": "refresh", "refreshed": True}))
    elif op == "tombstone":
        copy = json.loads(path.read_text())
        copy["status"] = "accepted"
        path.write_text(json.dumps(copy))
        print(json.dumps({"ok": True, "op": "tombstone", "disposition": "tombstone-left"}))
    else:
        path.unlink()
        print(json.dumps({"ok": True, "op": "remove", "disposition": "removed"}))
elif op == "read-notes":
    path = project / "pending.jsonl"
    notes = []
    if path.exists():
        for line in path.read_text().splitlines():
            if not line.strip():
                continue
            try:
                note = json.loads(line)
            except ValueError:
                continue
            if isinstance(note, dict):
                notes.append(note)
    print(json.dumps({"ok": True, "op": "read-notes", "notes": notes}))
elif op == "clear-notes":
    path = project / "pending.jsonl"
    kept, cleared = [], 0
    if path.exists():
        for line in path.read_text().splitlines():
            if not line.strip():
                continue
            try:
                parsed = json.loads(line)
            except ValueError:
                parsed = None
            matched = isinstance(parsed, dict) and parsed.get("pane") == job["pane"]
            if matched:
                cleared += 1
            else:
                kept.append(line)
        path.write_text("".join(line + "\n" for line in kept))
    print(json.dumps({"ok": True, "op": "clear-notes", "cleared": cleared}))
"""


def fail(error):
    print(json.dumps({"ok": False, "error": error}))
    sys.exit(1)


def emit(line):
    print(json.dumps(line))
    sys.exit(0)


def flag(argv, name, default=None):
    if name in argv:
        return argv[argv.index(name) + 1]
    return default


def local_home():
    configured = os.environ.get("MUSE_PROJECTS_HOME")
    if configured:
        return pathlib.Path(configured)
    return pathlib.Path.home() / ".Muse" / "projects"


def local_file_op(op, slug, thread, pane, payload):
    """The `local` machine's file ops, served from this filesystem."""
    project = local_home() / slug
    if op in ("put", "refresh", "tombstone", "remove"):
        path = project / f"thread-copy-{thread}.json"
        if op == "put":
            project.mkdir(parents=True, exist_ok=True)
            tmp = path.with_suffix(".tmp")
            tmp.write_text(json.dumps(payload))
            os.replace(tmp, path)
            return {"ok": True, "op": "put"}
        if not path.exists():
            if op == "refresh":
                return {"ok": True, "op": "refresh", "refreshed": False, "reason": "missing"}
            return {"ok": True, "op": op, "disposition": "already-gone"}
        if op == "refresh":
            copy = json.loads(path.read_text())
            if copy.get("status") in ("done", "accepted", "closed"):
                return {"ok": True, "op": "refresh", "refreshed": False, "reason": "not-live"}
            copy["coordinator_seen_at"] = (payload or {}).get("coordinator_seen_at")
            path.write_text(json.dumps(copy))
            return {"ok": True, "op": "refresh", "refreshed": True}
        if op == "tombstone":
            copy = json.loads(path.read_text())
            copy["status"] = "accepted"
            path.write_text(json.dumps(copy))
            return {"ok": True, "op": "tombstone", "disposition": "tombstone-left"}
        path.unlink()
        return {"ok": True, "op": "remove", "disposition": "removed"}
    if op == "read-notes":
        path = project / "pending.jsonl"
        notes = []
        if path.exists():
            for line in path.read_text().splitlines():
                if not line.strip():
                    continue
                try:
                    note = json.loads(line)
                except ValueError:
                    continue
                if isinstance(note, dict):
                    notes.append(note)
        return {"ok": True, "op": "read-notes", "notes": notes}
    if op == "clear-notes":
        path = project / "pending.jsonl"
        kept, cleared = [], 0
        if path.exists():
            for line in path.read_text().splitlines():
                if not line.strip():
                    continue
                try:
                    parsed = json.loads(line)
                except ValueError:
                    parsed = None
                matched = isinstance(parsed, dict) and parsed.get("pane") == pane
                if matched:
                    cleared += 1
                else:
                    kept.append(line)
            path.write_text("".join(line + "\n" for line in kept))
        return {"ok": True, "op": "clear-notes", "cleared": cleared}
    fail(f"unknown op {op!r}")


def fleet_modules():
    if str(FLEET_SCRIPTS) not in sys.path:
        sys.path.insert(0, str(FLEET_SCRIPTS))
    import fleet_manager
    import fleet_remote

    return fleet_manager, fleet_remote


def remote_file_op(op, machine_label, slug, thread, pane, payload):
    fleet_manager, fleet_remote = fleet_modules()
    machine = fleet_manager.target_machine(machine_label)
    if machine is None:
        fail(f"unknown machine {machine_label!r}")
    job = {"op": op, "slug": slug, "thread": thread, "pane": pane, "payload": payload}
    try:
        result = fleet_remote.run_remote(
            machine,
            ["python3", "-c", REMOTE_SNIPPET],
            timeout=PROBE_TIMEOUT_S,
            stdin_text=json.dumps(job),
        )
    except Exception as error:
        fail(f"{machine_label}: {error}")
    if not result.ok:
        fail(f"{machine_label}: {(result.get('stderr') or '').strip() or 'the remote copy op failed'}")
    try:
        return json.loads((result.get("stdout") or "").strip().splitlines()[-1])
    except Exception:
        fail(f"{machine_label}: the remote copy op answered no JSON line")


def send_report(socket_path, payload):
    request = {
        "id": f"{SOURCE}:{payload['seq']}",
        "method": "pane.report_agent",
        "params": {
            "pane_id": payload["pane"],
            "source": SOURCE,
            "agent": AGENT,
            "state": payload["state"],
            "seq": payload["seq"],
        },
    }
    client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try:
        client.settimeout(PROBE_TIMEOUT_S)
        client.connect(socket_path)
        client.sendall((json.dumps(request) + "\n").encode("utf-8"))
        client.recv(4096)
    finally:
        client.close()


def report_op(machine_label, payload):
    _fleet_manager, fleet_remote = fleet_modules()
    server = payload.get("server") or "default"
    if machine_label == "local":
        socket_path = (
            fleet_remote.default_local_socket()
            if server == "default"
            else fleet_remote.session_socket_path(server)
        )
    else:
        machine = _fleet_manager.target_machine(machine_label)
        if machine is None:
            fail(f"unknown machine {machine_label!r}")
        status = fleet_remote.forward_status(machine, session=server)
        socket_path = status.get("socket")
        if not socket_path:
            fail(f"{machine_label}: no reachable Herdr socket ({status.get('note')})")
    try:
        send_report(socket_path, payload)
    except Exception as error:
        fail(f"report to {socket_path} failed: {error}")
    return {"ok": True, "op": "report"}


def main(argv):
    if not argv:
        fail("an op is required")
    op = argv[0]
    machine = flag(argv, "--machine", "local")
    slug = flag(argv, "--slug", "")
    thread = flag(argv, "--thread", "")
    pane = flag(argv, "--pane", "")
    text = sys.stdin.read() if not sys.stdin.isatty() else ""
    payload = json.loads(text) if text.strip() else {}
    if op == "report":
        emit(report_op(machine, payload))
    if machine == "local":
        emit(local_file_op(op, slug, thread, pane, payload))
    emit(remote_file_op(op, machine, slug, thread, pane, payload))


if __name__ == "__main__":
    main(sys.argv[1:])
