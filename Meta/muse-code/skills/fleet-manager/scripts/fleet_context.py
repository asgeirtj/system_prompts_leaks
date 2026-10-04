"""`context`: the whole picture in one call, and the outage cadence behind it.

One object per model turn: the providers on this host, every machine with
its reachability, every session in one of five groups, the resources of the
machines that answered, and what changed since the last call.

Groups (Herdr's native agent state where Herdr runs; liveness alone on tmux,
and the row says so):

    waiting-on-you     a dialog is up (`blocked`)
    ready-for-review   finished since the last call (`done`, or working -> idle)
    working            a turn is running
    idle               everything else that is alive

Outage cadence (fixed): a machine that stops answering is
skipped for two minutes and its sessions keep their last group (marked
`stale`); one `outage` item after ten minutes down; one `recovered` item
when it answers again. A successful `connect <label>` ends that skip window
early: the next `context` probes the machine live and still emits the one
`recovered` item. The clock comes from `fleet_contract.now()`, so a test
injects it (FLEET_MANAGER_NOW) instead of waiting.
"""

from __future__ import annotations

import copy
import os
import re
import shlex
import time

import fleet_session
from fleet_contract import FleetError, iso, now
from fleet_remote import msp_enabled as fleet_remote_msp_enabled, msp_host_error as fleet_remote_msp_host_error, msp_scope as fleet_remote_msp_scope, msp_source as fleet_remote_msp_source, run_remote

SKIP_S = 120.0
OUTAGE_ITEM_S = 600.0
GROUPS = ("waiting-on-you", "ready-for-review", "working", "idle")


def _fm():
    import fleet_manager
    return fleet_manager


# ---------------------------------------------------------------- tmux rows for the inventory


def tmux_server_row(name: str, machine: dict | None) -> dict:
    """A tmux machine (or the tmux-only local host) as one inventory row, shaped like a Herdr server row."""
    import fleet_tmux
    row = {"machine": name, "server": fleet_tmux.server_label(), "state": "", "online": False, "note": "", "next_step": "", "socket": None,   # the tuple's `server`: the socket label the verbs use
           "target": (machine or {}).get("target"), "server_version": "", "protocol": None, "agents": [], "provider": "tmux"}
    try:
        listing = fleet_tmux.list_sessions(machine)
    except FleetError as exc:
        row.update(state="unreachable", note=str(exc), next_step=exc.next or (f"connect {row['target']} --label {name}" if machine else "doctor"))
        return row
    if not listing["online"]:
        row.update(state="unreachable", note=listing["note"], next_step=(f"connect {row['target']} --label {name}" if machine else "doctor"))
        return row
    row.update(online=True, state="connected", note=listing["note"], agents=listing["sessions"])
    return row


def msp_host_rows(machines: list[dict]) -> list[dict]:
    """Every MSP host as one inventory row (decision record 41038 D4: the merged board), from one `sessions --host` read per
    online host, in parallel: `connected` with its sessions when the host answered; `unreachable` — unknown, never gone —
    when the host is offline per `muse hosts` or did not answer its own listing (the note carries the transport's words)."""
    if not machines:
        return []
    from fleet_remote import msp_sessions
    sessions, why = msp_sessions([m["label"] for m in machines])
    # the host lists a fresh session with no title until it earns one (seen live 2026-09-27): the name `open` recorded on the
    # handle is the name the human knows, so it stands in while the host's title is empty
    recorded = {(e.get("machine"), e.get("pane_id")): e.get("name") for e in fleet_session.read_handles().values() if e.get("provider") == "msp" and e.get("name")}
    rows = []
    for machine in machines:
        host = machine["label"]
        row = {"machine": host, "server": host, "state": "", "online": False, "note": "", "next_step": "", "socket": None, "target": host,
               "server_version": "", "protocol": None, "agents": [], "provider": "msp"}
        if machine.get("availability") == "offline":
            row.update(state="offline", note="advertises MSP but is offline per `muse hosts`; its sessions are unknown", next_step="machines")
        elif why:
            row.update(state="offline", note=why, next_step="machines")   # `offline`, not an outage: the next digest asks the directory again
        elif fleet_remote_msp_host_error(host):
            row.update(state="offline", note=f"advertises MSP but did not answer the session listing ({fleet_remote_msp_host_error(host)}); its sessions are unknown", next_step="machines")
        else:
            row.update(online=True, state="connected", note="advertises MSP",
                       agents=[dict(a, name=a.get("name") or recorded.get((host, a.get("pane_id")))) for a in sessions.get(host, [])])
        rows.append(row)
    return rows


def reachability(row: dict, stale: set[str]) -> str:
    """The word `context` shows for an inventory row: `connected` when it answered, `stale` inside the outage cadence,
    `disabled` / `unverified` as such, everything else `unreachable`. One place for the collapse: `build` and the
    fleet-steward scan both read it."""
    if row.get("online"):
        return "connected"
    if row["machine"] in stale:
        return "stale"
    return row["state"] if row.get("state") in ("disabled", "unverified") else "unreachable"


def unverified_row(name: str, machine: dict | None) -> dict:
    """A machine with no session provider as one inventory row: a directory row whose `connect` stopped before
    verification (provider `none`), or this host without Herdr or tmux. The same next step `machines` gives, never an
    outage (QA r8 FM1 D4). One place for these words: `fleet_inventory` and the fleet-steward scan both read it."""
    return {"machine": name, "server": "", "state": "no_provider" if machine is None else "unverified", "online": False,
            "note": "no session provider (neither Herdr nor tmux)" if machine is None else (machine.get("note") or "unverified: connect has not finished"),
            "next_step": "doctor" if machine is None else f"connect {machine.get('target')} --label {name}",
            "socket": None, "target": (machine or {}).get("target"), "server_version": "", "protocol": None, "agents": [], "provider": "none"}


# ---------------------------------------------------------------- resources


def resources_row(machine: dict | None) -> dict:
    """Load, memory, disk and CPU count from portable shell probes down the ladder."""
    label = (machine or {}).get("label") or "local"
    if (machine or {}).get("provider") == "msp":
        return {"machine": label, "reachability": "unsupported", "note": "no shell over MSP: load, memory and disk are not read there", "next": ""}
    probe = ("uptime; echo ---; nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null; echo ---; "
             "free -m 2>/dev/null | sed -n 2p || vm_stat 2>/dev/null | head -5; echo ---; df -Pk \"$HOME\" 2>/dev/null | tail -1")
    try:
        result = run_remote(machine, ["sh", "-c", probe], timeout=20)
    except FleetError as exc:
        return {"machine": label, "reachability": "unreachable", "note": str(exc), "next": exc.next}
    if not result.ok:
        return {"machine": label, "reachability": "unreachable", "note": (result.get("stderr") or "").strip()[:200], "next": ""}
    parts = [p.strip() for p in result["stdout"].split("---")]
    row = {"machine": label, "reachability": "connected", "rung": result.get("rung"), "load_1m": None, "cpus": None, "mem_total_mb": None,
           "mem_available_mb": None, "disk_home_free_gb": None, "raw": result["stdout"].strip()[:600]}
    load = re.search(r"load averages?:\s*([\d.]+)", parts[0]) if parts else None
    if load:
        row["load_1m"] = float(load.group(1))
    if len(parts) > 1 and parts[1].strip().isdigit():
        row["cpus"] = int(parts[1].strip())
    if len(parts) > 2:
        mem = parts[2].split()
        if len(mem) >= 7 and mem[0].lower().startswith("mem"):
            row["mem_total_mb"], row["mem_available_mb"] = int(mem[1]), int(mem[6])
    if len(parts) > 3:
        disk = parts[3].split()
        if len(disk) >= 4 and disk[3].isdigit():
            row["disk_home_free_gb"] = round(int(disk[3]) / 1024 / 1024, 1)
    return row


# ---------------------------------------------------------------- grouping


def group_of(agent: dict, previous: dict | None) -> str:
    # Groups are facts (the native status, and the previous reading for "finished since last call"); a name or
    # title is the model's to read, never a group (R-HM walkthrough H2 (#38715) retired the `landing` label group).
    status = agent.get("status") or "unknown"
    if status == "blocked":
        return "waiting-on-you"
    if status == "working":
        return "working"
    if status == "done":
        return "ready-for-review"
    if status == "idle" and previous and previous.get("status") in ("working", "blocked"):
        return "ready-for-review"
    return "idle"


def session_item(row: dict, agent: dict, group: str, *, stale: bool) -> dict:
    provider = agent.get("provider") or row.get("provider") or "herdr"
    return {"handle": agent.get("handle"), "addr": agent.get("addr"), "ref": agent.get("pane_id"), "machine": row["machine"], "provider": provider, "server": row.get("socket") or agent.get("server") or row.get("server"),
            "name": agent.get("name"), "engine": agent.get("agent"), "status": agent.get("status"), "cwd": agent.get("cwd"), "title": agent.get("title") or "", "live": not stale,
            "labels": agent.get("labels") or {},
            "purpose": agent.get("purpose", ""), "identity": {"provider": provider, "machine": row["machine"], "server": row.get("socket") or agent.get("server") or row.get("server"), "ref": agent.get("pane_id"), "cwd": agent.get("cwd"), "engine": agent.get("agent")},
            "group": group, "stale": stale, "liveness_only": provider == "tmux" or bool(agent.get("liveness_only"))}


# ---------------------------------------------------------------- outage cadence


def apply_cadence(rows: list[dict], outages: dict, at: float) -> tuple[list[dict], list[dict], set[str]]:
    """Fold the outage bookkeeping into the rows. Returns (rows to show, items, machines served stale)."""
    items: list[dict] = []
    stale: set[str] = set()
    shown: list[dict] = []
    for row in rows:
        name = row["machine"]
        record = outages.get(name)
        if row.get("skipped") and record:
            cached = dict(row)
            cached["agents"] = record.get("last_rows") or []
            cached["stale"] = True
            shown.append(cached)
            stale.add(name)
            continue
        if not row["online"] and row.get("state") in ("disabled", "never_connected", "unverified", "offline") and not (record or {}).get("since"):
            shown.append(row)   # never reached, never verified, switched off, or offline per its own directory: plainly unreachable, not an outage
            continue
        if row["online"]:
            if record and record.get("since"):
                if record.get("reported"):
                    items.append({"kind": "recovered", "machine": name, "down_s": round(at - record["since"]), "detail": row.get("note", "")})
                elif at - record["since"] >= SKIP_S:
                    items.append({"kind": "recovered", "machine": name, "down_s": round(at - record["since"]), "detail": row.get("note", "")})
            outages[name] = {"since": None, "last_ok": at, "reported": False, "last_rows": row["agents"], "skip_until": 0.0}
            shown.append(row)
            continue
        if not record or not record.get("since"):
            record = {"since": at, "last_ok": (record or {}).get("last_ok"), "reported": False, "last_rows": (record or {}).get("last_rows") or [], "skip_until": at + SKIP_S}
        else:
            record["skip_until"] = at + SKIP_S
        if at - record["since"] >= OUTAGE_ITEM_S and not record["reported"]:
            record["reported"] = True
            items.append({"kind": "outage", "machine": name, "down_s": round(at - record["since"]), "detail": row.get("note", ""), "next": row.get("next_step", "")})
        outages[name] = record
        cached = dict(row)
        cached["agents"] = record.get("last_rows") or []
        cached["stale"] = True
        shown.append(cached)
        stale.add(name)
    return shown, items, stale


def skip_set(outages: dict, at: float) -> set[str]:
    """Machines inside their two-minute skip window: served from cache, not probed."""
    return {name for name, record in outages.items() if record.get("since") and at < record.get("skip_until", 0)}


def clear_skip_window(outages: dict, label: str) -> None:
    """A successful `connect` ends the machine's skip window: the next `context`
    probes it live instead of serving the stale cached row for the rest of the
    window. Only the window: `since`/`reported` stay so that probe still emits
    the one `recovered` item and resets the record itself."""
    record = outages.get(label)
    if record:
        record["skip_until"] = 0.0


def merge_outages(stored: dict, snapshot: dict, computed: dict) -> dict:
    """This build's outage rows over the store, without undoing a `connect` that
    cleared a skip window while the build was probing: from a row the store
    changed since the snapshot, only the field `connect` owns (`skip_until`)
    comes over; this build's cadence fields (`since`, `reported`) stay, so one
    outage still yields one `outage` line and one `recovered` line."""
    merged = dict(stored)
    for name, record in computed.items():
        if stored.get(name) != snapshot.get(name):
            record = dict(record, skip_until=(stored.get(name) or {}).get("skip_until", 0.0))
        merged[name] = record
    return merged


# ---------------------------------------------------------------- the digest


def render(report: dict) -> str:
    lines = [f"Context · {report['session_count']} sessions on {report['machines_online']}/{len(report['machines'])} machines · {report['at'][11:16]} UTC · provider {report['provider']}"]
    titles = {"waiting-on-you": "Waiting on you", "ready-for-review": "Ready for review", "working": "Working", "idle": "Idle"}
    for group in GROUPS:
        items = report["groups"][group]
        if not items:
            continue
        lines.append(f"{titles[group]} ({len(items)}):")
        for item in items:
            where = os.path.basename((item.get("cwd") or "").rstrip("/")) or ""
            tag = " [stale]" if item.get("stale") else ""
            live = " (liveness only)" if item.get("liveness_only") else ""
            label = next((item["labels"][k] for k in ("pane", "tab") if (item.get("labels") or {}).get(k)), "")   # the name a human gave the pane or its tab (ruling 17); a workspace label is `open --label`'s, not a human's word
            tail = " — ".join(part for part in (where, f'"{label}"' if label and label != item.get("name") else "") if part)
            lines.append(f"  {item.get('handle') or '-'} {item.get('name') or item.get('engine') or '?'}@{item['machine']} {item.get('status')}{tag}{live}" + (f" — {tail}" if tail else ""))
    for machine in report["machines"]:
        if machine["reachability"] != "connected":
            lines.append(f"⚫ {machine['label']} {machine['reachability']} — {machine.get('note', '')}" + (f"; next: {machine['next']}" if machine.get("next") else ""))
    if report["changed"]:
        lines.append("Since last call: " + "; ".join(report["changed"][:12]) + (" …" if len(report["changed"]) > 12 else ""))
    for item in report["items"]:
        lines.append(f"! {item['machine']} {item['kind']} after {item['down_s']}s" + (f" — {item.get('detail')}" if item.get("detail") else ""))
    return "\n".join(lines)


def build(*, reset: bool = False) -> dict:
    fm = _fm()
    at = now()
    progress: list[str] = []
    provider = fm.local_provider()
    machines = fm.all_machines()
    with fleet_session.State() as state:
        snapshot = {} if reset else copy.deepcopy(state.data.get("outages", {}))
        outages = copy.deepcopy(snapshot)
        last = {} if reset else dict(state.data.get("context_last", {}))
        last_at = None if reset else state.data.get("context_last_at")
    skipping = skip_set(outages, at)
    # Probe every machine outside its skip window (one snapshot each, in parallel); serve the rest from cache.
    rows = fm.fleet_inventory(exclude=skipping)
    for name in skipping:
        record = outages[name]
        rows.append({"machine": name, "server": "", "state": "skipped", "skipped": True, "online": False, "note": f"not probed: down since {iso(record['since'])}, re-probe after {iso(record['skip_until'])}",
                     "next_step": "", "socket": None, "target": next((m.get("target") for m in machines if m.get("label") == name), None), "agents": [], "provider": "herdr"})
        progress.append(f"{name}: inside its skip window; last group kept")
    shown, items, stale = apply_cadence(rows, outages, at)
    with fleet_session.State() as state:
        fleet_session.sync(state, [dict(r, online=False) if r["machine"] in stale else r for r in shown])   # a stale machine is offline: its handles stay, unknown not gone
        for row in shown:
            for agent in row["agents"]:
                if not agent.get("handle"):
                    agent["handle"] = state.handle_for(row["machine"], agent["pane_id"]) or state.mint(row["machine"], agent["pane_id"])
        handles = dict(state.data["handles"])
    groups: dict[str, list[dict]] = {g: [] for g in GROUPS}
    current: dict[str, dict] = {}
    for row in shown:
        for agent in row["agents"]:
            handle = agent.get("handle")
            previous = last.get(handle) if handle else None
            group = previous.get("group") if (row["machine"] in stale and previous) else group_of(agent, previous)
            item = session_item(row, agent, group or "idle", stale=row["machine"] in stale)
            groups[item["group"]].append(item)
            current[handle] = {"status": agent.get("status"), "group": item["group"], "machine": row["machine"], "name": agent.get("name") or agent.get("agent")}
    changes: list[str] = []
    for handle, entry in current.items():
        before = last.get(handle)
        if before is None:
            changes.append(f"new {handle} ({entry['name']}@{entry['machine']}, {entry['group']})")
        elif before.get("group") != entry["group"]:
            changes.append(f"{handle} {before.get('group')} -> {entry['group']}")
    read_machines = {row["machine"] for row in shown}
    for handle, before in last.items():
        if handle in current or before.get("machine") in stale or before.get("machine") in skipping:
            continue
        if before.get("machine") not in read_machines:
            # the machine left the digest (`forget`, or it stopped advertising): its sessions are unknown, not gone — and a
            # stranger's session title is never repeated here (V-43535 B2)
            changes.append(f"{handle} not read ({before.get('machine')} is no longer in the digest)")
            continue
        changes.append(f"gone {handle} ({before.get('name')}@{before.get('machine')})")
    machine_rows = []
    online = 0
    for row in shown:
        reach = reachability(row, stale)
        if row["online"]:
            online += 1
        machine_rows.append({"label": row["machine"], "provider": row.get("provider") or "herdr", "reachability": reach, "note": row.get("note", ""), "next": row.get("next_step", ""),
                             "sessions": len(row["agents"]), "target": row.get("target")})
    for machine in machines:
        if not any(m["label"] == machine.get("label") for m in machine_rows):
            machine_rows.append({"label": machine.get("label"), "provider": machine.get("provider", "herdr"), "reachability": "disabled" if not machine.get("enabled", True) else "unknown",
                                 "note": "", "next": "", "sessions": 0, "target": machine.get("target")})
    with fleet_session.State() as state:
        state.data["outages"] = outages if reset else merge_outages(state.data.get("outages", {}), snapshot, outages)
        state.data["context_last"] = current
        state.data["context_last_at"] = at
    if fleet_remote_msp_enabled():
        source = fleet_remote_msp_source()
        report_msp = {"state": source["state"], "note": source["note"]}
        if source["state"] == "available":
            scope = fleet_remote_msp_scope()   # yours, connected, held, named — the rest of the directory is a count
            report_msp.update(hosts=[h["host"] for h in scope["hosts"]], directory={"advertising": scope["advertising"], "shown": len(scope["hosts"]), "not_shown": scope["not_shown"]})
            if scope["note"]:
                progress.append(scope["note"])
    else:
        report_msp = None
    local_resources = resources_row(None) if provider != "none" else {}
    resources = {"cpu_count": local_resources.get("cpus"), "load_1m": local_resources.get("load_1m"), "memory_available_mb": local_resources.get("mem_available_mb"),
                 "disk_free_mb": (round(local_resources["disk_home_free_gb"] * 1024) if local_resources.get("disk_home_free_gb") is not None else None), "sampled_at": iso(at)}
    unknowns = [m["label"] for m in machine_rows if m["reachability"] not in ("connected", "disabled")]
    report = {"provider": provider, "capabilities": ["context"], "at": iso(at), "since": iso(last_at) if last_at else None,
              "machines": machine_rows, "machines_online": online, "groups": groups, "session_count": sum(len(v) for v in groups.values()),
              "sessions": [i for g in GROUPS for i in groups[g]], "changed": changes, "items": items, "resources": resources,
              "coverage": {"machines_answered": online, "machines": len(machine_rows)}, "unknowns": unknowns,
              "cadence": {"skip_s": SKIP_S, "outage_item_s": OUTAGE_ITEM_S}, "progress": progress,
              "next": next((m["next"] for m in machine_rows if m["reachability"] in ("unreachable", "unverified") and m.get("next")), "")}
    if report_msp is not None:
        report["msp"] = report_msp
        if report_msp["state"] != "available":
            report["progress"].append(report_msp["note"])
    report["text"] = render(report)
    return report
