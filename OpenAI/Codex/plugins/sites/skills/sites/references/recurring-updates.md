# Recurring Updates

Use when the requested outcome needs updates while the Site is closed, or a useful optional automation is being considered. Refreshing an open page does not provide unattended updates.

## Prepare the Update

Reuse [persistent data](storage.md), source access, and a writer callable by a cloud task without the user present. Verify source access and writer authorization independently. [Site service access](identity-and-secrets.md#service-access) supplies neither a signed-in visitor nor consent to access connected apps; preview bindings cannot supply hosted access.

Use [Site MCP server](site-mcp-server.md) when the update needs a hosted tool, reusing existing data operations and connections. Recurring updates do not inherently require a Site plugin. Browser WebMCP and local-only plugins cannot provide the cloud connection. Explain any required Install/Connect step and resume once connected.

Routine runs update data without republishing. For multi-step work, commit source settings, supported access acquisition, required identity/scope, update/readback steps, and retry behavior with the Site through the [workflow](../SKILL.md#workflow). Store no credentials. Verify a fresh cloud task can retrieve that revision through the linked Site. A verified action with a self-contained prompt needs no extra instructions file.

After publication, exercise a new or changed writer through its intended unattended access and read back the persisted result. Reuse an initial content write and unchanged verification; avoid duplicate records. Do not wait for a scheduled occurrence merely to verify readiness.

## Choose the Schedule

Before setup, call `get_site` for the active, published, user-owned Site and its linked `automations`. Missing/null metadata prevents duplicate checking: do not create or offer a schedule, but continue the Site handoff. An empty array means none linked, not that the writer works.

Reuse an automation covering the work, preserving paused state unless asked to resume. Use supported task controls for edits, retaining the Site link; schedule changes need no deployment.

- **Clearly requested:** When no matching automation exists, use Sites `create_schedule` for requested recurring work, an outcome requiring it, or an accepted offer in chat. Recheck linked automations before creating. Preserve requested/accepted timing; otherwise choose reasonable timing in the user's known timezone and ask if it is unknown.
- **Optional:** After the normal Site handoff, offer one complete schedule with `offer_site_schedule` and a short sentence naming work, time, and timezone. Button acceptance already creates and links it; do not call `create_schedule` again. Chat acceptance uses the offered Site/work/timing, including the user's changes.

Skip optional offers for fixed snapshots, manual/browser-only updates, scheduled runs, already-covered work, or a previous offer or decline. Resolve unclear Site, automation, or requested work before changing schedules.

## Handoff

Keep the schedule prompt short and nontechnical: outcome, sources, user requirements, and any verified saved instructions needed by future runs. After creation or edits, confirm saved timing and enabled/paused status. Creation proves a schedule was saved, not that an update ran. Unavailable scheduling does not block Site handoff; report the incomplete scheduling work separately.
