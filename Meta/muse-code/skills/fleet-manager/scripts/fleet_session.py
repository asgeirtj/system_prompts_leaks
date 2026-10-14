"""Addresses, handles, the state file, and session identity.

One grammar for every verb (`ADDRESS_GRAMMAR`, `split_machine`, `parse_addr`),
the handle registry and last-seen picture (`State`, `sync`), and the identity
tuple that outlives a pane id: a pane id or session name can be reissued to a
new process, so a handle that pointed at `devA/w1:p2` yesterday can point at
a different program today. A session is therefore the tuple
(provider, machine, server or socket, ref, cwd, engine); every write verb
checks the live tuple against the one the handle was minted with before it
types, interrupts, or closes anything. A mismatch is `identity_mismatch`
with `adopt <address>` as the next command (`list` reports the drift and
never re-points a handle at the stranger now under its address); the write
never happens.

`status <ref>` shows the tuple, `adopt <machine>/<ref>` mints a handle for a
session this skill did not open (a tmux session, a pane someone else made).
"""

from __future__ import annotations

import fcntl
import json
import os
import re
import tempfile
import time

import fleet_remote  # cyclic with fleet_remote's import of this module: read its names inside functions only, never at module scope
from fleet_contract import FleetError, Refused, Usage, iso, now, receipt


def _fm():
    import fleet_manager  # the CLI module, for the machine catalog and server resolution it still owns (find_machine, all_machines, resolve_server, local_provider)
    return fleet_manager


IDENTITY_KEYS = ("provider", "machine", "server", "ref", "cwd", "engine")   # the D5 tuple, compared field by field


def identity_from_agent(machine: str, server: str, agent: dict, sock: str = "") -> dict:
    return {"provider": "herdr", "machine": machine, "server": sock, "session": server or "default", "ref": agent.get("pane_id"), "cwd": agent.get("cwd"),
            "engine": agent.get("agent") or agent.get("engine")}


def stored_identity(entry: dict) -> dict:
    # a field the stored record never knew (a handle minted by the pre-rebuild helper has no `server`) is skipped by
    # `mismatch()`, never invented: `"default"` here would read as drift against the live socket path
    return {"provider": entry.get("provider") or "herdr", "machine": entry.get("machine"), "server": entry.get("server"),
            "ref": entry.get("pane_id"), "cwd": entry.get("cwd"), "engine": entry.get("agent")}


def live_herdr_identity(machine_key: str, target: str) -> dict:
    fm = _fm()
    sock, local = fm.resolve_server(machine_key)
    target = fm.by_label(sock, target)
    agent = fm.agent_or_pane(sock, local, target, f"{machine_key}/{target}")   # an agentless pane (a shell pane) is a session too (QA r11 FM-4)
    machine, server = split_machine(machine_key)
    return identity_from_agent(machine, server or ("default" if not local else fleet_remote.local_session_name(sock)), agent, sock), agent


def mismatch(stored: dict, live: dict) -> list[str]:
    """The fields that differ, ignoring ones the stored record never knew."""
    out = []
    for key in IDENTITY_KEYS:
        was, is_now = stored.get(key), live.get(key)
        if was and is_now and was != is_now:
            out.append(f"{key}: {was!r} -> {is_now!r}")
    return out


def check(addr: str, *, nothing: str) -> dict:
    """Refuse a write on a handle whose live tuple no longer matches. Returns the live identity.
    `nothing` is the refused verb's own word for what did not happen (`sent`, `stopped`, `closed`, `answered`; QA r9
    AG2 D6) — required, so no new write verb inherits another verb's wording."""
    fm = _fm()
    if not HANDLE_RE.match(addr):
        return {}
    with State() as state:
        entry = dict(state.data["handles"].get(addr) or {})
    if not entry:
        return {}   # a handle-shaped name `parse_addr` resolved as a session name: there is no minted tuple to check (QA r11 parity N11)
    if entry.get("provider") == "msp":
        # a session id on an MSP host is minted once and never reissued to another process (unlike a pane id or a tmux
        # name), so the tuple cannot drift under the handle; host-manager answers `not_found` for a session that is gone
        return stored_identity(entry)
    if entry.get("provider") == "tmux":
        import fleet_tmux
        machine = fm.find_machine(entry["machine"], fm.all_machines()) if entry["machine"] != fleet_remote.LOCAL else None
        row = fleet_tmux.find_session(machine, entry["pane_id"])
        live = fleet_tmux.identity_of(machine, row)
    else:
        live, _agent = live_herdr_identity(machine_key_of(entry), entry["pane_id"])
    diff = mismatch(stored_identity(entry), live)
    if diff:
        raise Refused(f"{addr} is not the session it was minted for ({'; '.join(diff)}); nothing was {nothing}",
                      next=f"adopt {machine_key_of(entry)}/{entry['pane_id']} takes the session now under this address (the handle keeps refusing until then); `list` shows the drift", ref=addr,
                      provider=entry.get("provider") or "herdr", detail={"stored": stored_identity(entry), "live": live}, outcome="identity_mismatch")
    return live


def status(addr: str) -> dict:
    fm = _fm()
    machine_key, target = parse_addr(addr)
    entry = {}
    if HANDLE_RE.match(addr):
        with State() as state:
            entry = dict(state.data["handles"].get(addr) or {})
    machine_label = split_machine(machine_key)[0]
    profile = None if machine_label == fleet_remote.LOCAL else fm.find_machine(machine_label, fm.all_machines())
    provider = entry.get("provider") or ((profile or {}).get("provider") if profile else fm.local_provider())
    if provider == "msp":
        host, session_id = fm.msp_ref(machine_key, target)
        line = fleet_remote.host_manager_msp(["status", "--ref", f"{host}/{session_id}"], ref=addr, next_hint="list")
        if not line.get("live"):
            raise Refused(f"{addr}: no session {session_id} on host {host} (gone, or never there)", next=f"list {host}", ref=addr, provider="msp", outcome="no_such_session")
        report = {"identity": fleet_remote.msp_identity(host, session_id, entry.get("cwd") or (line.get("identity") or {}).get("cwd")), "live": True,
                  "status": fm.msp_status_word(line.get("group")), "group": line.get("group"), "liveness": "alive", "provider": "msp", "name": entry.get("name"),
                  "title": entry.get("title") or "", "liveness_only": False, "mode": "msp"}
    elif provider == "tmux":
        import fleet_tmux
        report = fleet_tmux.status(profile, target)
    else:
        live, agent = live_herdr_identity(machine_key, target)
        report = {"identity": live, "live": True, "status": agent.get("agent_status"), "liveness": "alive", "provider": "herdr",
                  "name": agent.get("name"), "title": agent.get("terminal_title_stripped") or "", "liveness_only": agent.get("agent_status") == "no_agent"}
    if entry:
        diff = mismatch(stored_identity(entry), report["identity"])
        report["handle"] = addr
        report["identity_ok"] = not diff
        report["identity_drift"] = diff
    report["checked_at"] = iso(now())
    return report


def adopt(addr: str, *, name: str | None = None, asked_by: str | None = None) -> dict:
    """Mint (or refresh) a handle for an existing session so `list` shows it with its identity recorded; `name` labels it (Herdr agent rename)."""
    fm = _fm()
    if HANDLE_RE.match(addr):
        raise Usage(f"{addr} is already a handle; adopt takes machine[:server]/<ref>", next="list", ref=addr)
    machine_key, target = parse_addr(addr)
    machine_label, server = split_machine(machine_key)
    profile = None if machine_label == fleet_remote.LOCAL else fm.find_machine(machine_label, fm.all_machines())
    provider = (profile or {}).get("provider") if profile else fm.local_provider()
    if provider == "tmux":
        import fleet_tmux
        row = fleet_tmux.find_session(profile, target)
        identity = fleet_tmux.identity_of(profile, row)
        ref = row["ref"]
        if name:
            raise Usage("a tmux session's stable name is its ref; --name is a Herdr feature", next=f"adopt {addr}", ref=addr, provider="tmux")
        fields = {"agent": row["engine"], "name": row["name"], "cwd": row["cwd"], "status": row["status"], "provider": "tmux", "server": identity["server"]}
    else:
        identity, agent = live_herdr_identity(machine_key, target)
        ref = agent["pane_id"]
        if name:
            sock, local = fm.resolve_server(machine_key)
            try:
                fleet_remote.herdr_json(sock, ["agent", "rename", ref, name], local=local)
            except FleetError as exc:
                if (exc.detail or {}).get("code") != "agent_name_taken":
                    raise
                # another session already answers to the name (QA r11 parity N7): a guard refusal (exit 3) naming the holder, not exit 6
                holder = next((a.get("pane_id") for a in fleet_remote.snapshot_agents(sock)[0] if a.get("name") == name and a.get("pane_id") != ref), None)
                whose = f" ({machine_label}/{holder} answers to it)" if holder else ""
                raise Refused(f"{addr}: the name {name!r} is taken{whose}; nothing was adopted",
                              next=f"adopt {addr} --name <another name>" + (f", or free it first: adopt {machine_label}/{holder} --name <new name>" if holder else ""),
                              ref=addr, provider="herdr", outcome="name_taken") from exc
            agent["name"] = name
        fields = {"agent": agent.get("agent"), "name": agent.get("name") or agent.get("label") or ref, "cwd": agent.get("cwd"), "status": agent.get("agent_status"),
                  "provider": "herdr", "server": identity["server"], "terminal_id": agent.get("terminal_id"), "liveness_only": agent.get("agent_status") == "no_agent"}
    with State() as state:
        handle = state.bind(machine_key, ref, fields)
        entry = state.data["handles"][handle]
        entry["status_since"] = entry.get("status_since") or time.time()
    return {"handle": handle, "addr": f"{machine_key}/{ref}", "identity": identity, "provider": provider,
            "receipt": receipt("Adopted", identity, asked_by=asked_by, detail=(f"as {name}, handle {handle}" if name else f"handle {handle}"))}


# ---------------------------------------------------------------- addresses, state and handles

HANDLE_RE = re.compile(r"^s\d+$")
ADDRESS_GRAMMAR = ("machine[:server]/<pane-id|agent-name> or a handle sN; `local` is this host; "
                   "server defaults to the machine profile's Herdr session (local: this pane's server); "
                   "pane ids and agent names are server-local; a human label (the pane's label, its terminal title, its tab's or "
                   "workspace's label) works in place of the name")
ADDR_USAGE = "a handle like s3 or machine[:server]/<pane-id-or-agent-name> (local/… for this machine); a human label works in place of the name"


def state_path() -> str:
    configured = os.environ.get("FLEET_MANAGER_STATE")
    if configured:
        return configured
    base = os.environ.get("XDG_DATA_HOME") or os.path.expanduser("~/.local/share")
    name = f"state-{fleet_remote.SESSION}.json" if fleet_remote.SESSION else "state.json"
    return os.path.join(base, "muse", "fleet-manager", name)


def split_machine(key: str) -> tuple[str, str | None]:
    """`devA` -> (devA, None); `devA:work` -> (devA, work). An empty half is a usage error."""
    if ":" not in key:
        if not key:
            raise Usage(f"address needs a machine: {ADDR_USAGE}", next="list (it shows every handle and address)")
        return key, None
    machine, server = key.split(":", 1)
    if not machine or not server:
        raise Usage(f"address {key!r} must be machine[:server] with both parts non-empty", next="list (it shows every handle and address)")
    return machine, server


def read_handles() -> dict:
    """The handle registry as a plain read: no lock and no save-on-exit. For a reader that only wants to know what this skill
    holds (the inventory's recorded panes), inside a thread or beside another reader — `State` is the read-modify-write path,
    and taking it to read would make a second `flock` in the same process wait on the first."""
    try:
        with open(state_path(), encoding="utf-8") as handle:
            loaded = json.load(handle)
    except (OSError, ValueError):
        return {}
    return loaded.get("handles") if isinstance(loaded, dict) and isinstance(loaded.get("handles"), dict) else {}


class State:
    """Handle registry + last-seen fleet picture, owned by this helper only.

    Shape: {"next": 4, "handles": {"s1": {...}}, "machines": {"devA": true},
    "connected_once": ["devA"]}. Atomic writes, flock around read-modify-write,
    mode 0600."""

    def __init__(self):
        self.path = state_path()
        self.data = {"next": 1, "handles": {}, "machines": {}, "connected_once": []}
        self._lock = None

    def __enter__(self):
        os.makedirs(os.path.dirname(self.path), mode=0o700, exist_ok=True)
        self._lock = open(self.path + ".lock", "a")
        fcntl.flock(self._lock, fcntl.LOCK_EX)
        try:
            with open(self.path, encoding="utf-8") as handle:
                loaded = json.load(handle)
            if isinstance(loaded, dict) and isinstance(loaded.get("handles"), dict):
                self.data = loaded
                self.data.setdefault("machines", {})
                self.data.setdefault("connected_once", [])
        except (OSError, ValueError):
            pass
        return self

    def __exit__(self, *exc):
        if not exc[0]:
            self.save()
        fcntl.flock(self._lock, fcntl.LOCK_UN)
        self._lock.close()

    def save(self):
        directory = os.path.dirname(self.path)
        fd, tmp = tempfile.mkstemp(dir=directory, prefix=".state-")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(self.data, handle, indent=1, sort_keys=True)
            os.chmod(tmp, 0o600)
            os.replace(tmp, self.path)
        except BaseException:
            try:
                os.unlink(tmp)
            except OSError:
                pass
            raise

    def handle_for(self, machine_key: str, pane_id: str) -> str | None:
        label, session = handle_key(machine_key)
        for handle, entry in self.data["handles"].items():
            if entry["machine"] == label and entry["pane_id"] == pane_id and (entry.get("session") or "") == session:
                return handle
        return None

    def mint(self, machine_key: str, pane_id: str) -> str:
        """Handles store the bare machine label; a non-default Herdr session goes in
        `session`, so `devA:work/<pane>` and the live tuple's `devA` compare equal."""
        label, session = handle_key(machine_key)
        handle = f"s{self.data['next']}"
        self.data["next"] += 1
        self.data["handles"][handle] = {"machine": label, "pane_id": pane_id}
        if session:
            self.data["handles"][handle]["session"] = session
        return handle

    def bind(self, machine_key: str, pane_id: str, fields: dict) -> str:
        """The handle for a session `open`/`adopt` just saw alive: the one its address already has, else a
        fresh mint; `fields` is what the verb learned about it. Its gone mark goes: `sync` marked the address
        gone when the earlier session died, and a handle kept marked after a new `open` refused every verb as
        no_such_session until a fleet-wide `list` (QA r9 FM NEW-1)."""
        handle = self.handle_for(machine_key, pane_id) or self.mint(machine_key, pane_id)
        entry = self.data["handles"][handle]
        entry.update(fields)
        entry.pop("gone_at", None)
        return handle


def handle_key(machine_key: str) -> tuple[str, str]:
    """(label, session) for handle lookups: '' when the address names no server or
    names the one the inventory reads anyway (local default, the profile's session)."""
    label, server = split_machine(machine_key)
    if not server:
        return label, ""
    # the local default is whatever the inventory reads (FLEET_MANAGER_SESSION / HERDR_SOCKET_PATH), not the literal `default`
    default = fleet_remote.local_session_name(fleet_remote.default_local_socket()) if label == fleet_remote.LOCAL else fleet_remote.profile_session(_fm().find_machine(label, _fm().all_machines()) or {})
    return label, "" if server == default else server


def machine_key_of(entry: dict) -> str:
    """The `machine[:server]` half a handle's entry resolves to."""
    return entry["machine"] + (f":{entry['session']}" if entry.get("session") else "")


def sync(state: State, rows: list[dict], now: float | None = None, prev: dict | None = None) -> list[dict]:
    """Fold a fresh inventory into the shared state; return the events it implies.

    Event kinds: new, gone, blocked, working, done (working->idle/done),
    machine_offline, machine_online. Everything else is silent.

    `prev` is a watcher's OWN last snapshot ({"handles": {h: status},
    "machines": {m: online}}); when given, events are derived against it and
    it is updated in place, so two watchers sharing one state file each see
    every transition instead of racing for it. Without `prev` the shared
    state's last-seen picture is the baseline (list callers)."""
    now = now or time.time()
    events: list[dict] = []
    handles = state.data["handles"]
    seen: set[str] = set()
    prev_handles = prev["handles"] if prev is not None else None
    prev_machines = prev["machines"] if prev is not None else state.data["machines"]
    for row in rows:
        machine = row["machine"]
        was_online = prev_machines.get(machine)
        if row["online"] != was_online and was_online is not None:
            detail = row.get("note", "") if row["online"] else offline_detail(row)
            events.append({"kind": "machine_online" if row["online"] else "machine_offline", "machine": machine, "detail": detail})
        state.data["machines"][machine] = row["online"]
        if row["online"] and machine != fleet_remote.LOCAL and machine not in state.data["connected_once"]:
            state.data["connected_once"].append(machine)
        if prev is not None:
            prev["machines"][machine] = row["online"]
        if not row["online"]:
            continue
        for agent in row["agents"]:
            handle = state.handle_for(machine, agent["pane_id"])
            fresh = handle is None
            if fresh:
                handle = state.mint(machine, agent["pane_id"])
            entry = handles[handle]
            if prev_handles is not None:
                fresh = fresh or handle not in prev_handles
                prev_status = prev_handles.get(handle)
                prev_handles[handle] = agent.get("status")
            else:
                prev_status = entry.get("status")
            drift = mismatch({"cwd": entry.get("cwd"), "engine": entry.get("agent")}, {"cwd": agent.get("cwd"), "engine": agent.get("agent")})
            if drift:
                # a stranger is under the handle's address (QA r10 AG2 D-R10-4): the tuple the handle was minted for stays, the
                # board shows the drift, and the write verbs keep refusing until `adopt` takes the new session on purpose.
                # The stranger is announced once, as `new` on this handle with its own fields and the drift, so a watcher learns of it.
                announced = (entry.get("drift") or {}).get("terminal_id") == agent.get("terminal_id")
                if prev_handles is not None:
                    announced = announced and handle in prev_handles
                    prev_handles[handle] = agent.get("status")
                entry.update(status=agent.get("status"), last_seen=now, drift={"fields": drift, "terminal_id": agent.get("terminal_id")})
                entry.pop("gone_at", None)
                agent["handle"] = handle
                agent["drift"] = drift
                seen.add(handle)
                if not announced:
                    live = {**entry, "agent": agent.get("agent"), "name": agent.get("name"), "cwd": agent.get("cwd"), "title": agent.get("title"), "status": agent.get("status")}
                    events.append({"kind": "new", "handle": handle, **_agent_fields(live), "drift": drift})
                continue
            entry.pop("drift", None)
            if entry.get("terminal_id") and entry.get("terminal_id") != agent.get("terminal_id"):
                fresh = True  # a new process took the pane over: same handle, new life
            entry.update(
                {
                    "agent": agent.get("agent"),
                    "name": agent.get("name"),
                    "cwd": agent.get("cwd"),
                    "title": agent.get("title"),
                    "terminal_id": agent.get("terminal_id"),
                    "status": agent.get("status"),
                    "provider": agent.get("provider") or "herdr",
                    "server": row.get("socket") or agent.get("server") or entry.get("server"),   # the socket the read used: the tuple's `server`
                    "last_seen": now,
                }
            )
            entry.pop("gone_at", None)
            if prev_status != agent.get("status") or "status_since" not in entry:
                entry["status_since"] = now
            agent["handle"] = handle
            seen.add(handle)
            status = agent.get("status")
            if fresh:
                events.append({"kind": "new", "handle": handle, **_agent_fields(entry)})
                if status == "blocked":
                    events.append({"kind": "blocked", "handle": handle, **_agent_fields(entry)})
                continue
            if status == prev_status:
                continue
            if status == "blocked":
                events.append({"kind": "blocked", "handle": handle, **_agent_fields(entry)})
            elif status == "working":
                events.append({"kind": "working", "handle": handle, **_agent_fields(entry)})
            elif status == "done" or (status == "idle" and prev_status in ("working", "blocked")):
                # Herdr's `done` is "finished and not yet seen": a completion even
                # when the agent answered inside one poll and `working` was missed.
                events.append({"kind": "done", "handle": handle, **_agent_fields(entry)})
    read = {row["machine"]: row.get("provider") or "herdr" for row in rows}   # the provider each machine was read through
    for handle, entry in list(handles.items()):
        if handle in seen:
            continue
        if entry["machine"] not in read or not state.data["machines"].get(entry["machine"]) or entry.get("session"):
            continue  # a machine this inventory did not read, or an offline one: unknown, not gone; a named-session handle is not in this inventory
        if (entry.get("provider") or "herdr") != read[entry["machine"]]:
            continue  # read through the other provider (a `--mode tmux` handle on a Herdr host, QA r11 FM-5): this inventory says nothing about it
        was_known = (handle in prev_handles) if prev_handles is not None else not entry.get("gone_at")
        if not entry.get("gone_at"):
            entry["gone_at"] = now
            entry["status"] = "gone"
        if prev_handles is not None:
            prev_handles.pop(handle, None)
        if was_known:
            events.append({"kind": "gone", "handle": handle, **_agent_fields(entry)})
    # forget long-gone handles (a day) so the file stays small; handles are never reused
    for handle in [h for h, e in handles.items() if e.get("gone_at") and now - e["gone_at"] > 86400]:
        del handles[handle]
    return events


def offline_detail(row: dict) -> str:
    detail = f"{row.get('state') or 'offline'}: {row.get('note', '')}" if row.get("state") else row.get("note", "")
    if row.get("next_step"):
        detail += f"; next: {row['next_step']}"
    return detail


def _agent_fields(entry: dict) -> dict:
    return {k: entry.get(k) for k in ("machine", "pane_id", "agent", "name", "cwd", "title", "status")}


def parse_addr(addr: str, state: State | None = None) -> tuple[str, str]:
    """`s3` -> (machine[:server], pane_id); `machine[:server]/<target>` -> (machine[:server], target)."""
    if HANDLE_RE.match(addr):
        if state is None:
            with State() as st:
                entry = st.data["handles"].get(addr)
        else:
            entry = state.data["handles"].get(addr)
        if not entry:
            return _fm().find_named(addr)   # a handle-shaped name nobody minted is a session name or label like any other (QA r11 parity N11)
        if entry.get("gone_at"):
            raise Refused(f"{addr} is gone ({machine_key_of(entry)}/{entry['pane_id']} no longer hosts a session)", next="list", ref=addr,
                          provider=entry.get("provider"), outcome="no_such_session")
        return machine_key_of(entry), entry["pane_id"]
    if "/" not in addr:
        raise Usage(f"address {addr!r} must be {ADDR_USAGE}", next="list (it shows every handle and address)", ref=addr)
    machine, target = addr.split("/", 1)
    if not machine or not target:
        raise Usage(f"address {addr!r} must be {ADDR_USAGE}", next="list (it shows every handle and address)", ref=addr)
    split_machine(machine)   # validates the machine[:server] half
    return machine, target
