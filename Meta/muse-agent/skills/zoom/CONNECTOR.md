# Zoom

- Zoom reaches the user's meetings, recordings, transcripts and summaries, plus Team Chat, Canvas, Tasks, Whiteboard and Revenue Accelerator, through Zoom's official MCP servers and `/opt/hatch/bin/zoom`.

- Commands below omit the `/opt/hatch/bin/zoom` prefix.

## Connect

- Run `status`. When `auth_status` is `not_connected`, run `authorize-url` and share only the returned `connect_url`.

- Once connected, `status` checks every server and lists each one's `available_tools`. Its `ok` is true when any server answers, and `all_servers_ok` tells you whether all of them did.

- Never ask the user for a secret or any other credential in chat.

- `refresh` renews the stored token. `disconnect` deletes the stored connection, so run it only when the user asks, never as a troubleshooting step.

## Find and call a tool

```text
list-tools --names-only
list-tools --names-only --server <server>
describe-tool --server <server> --name <tool>
call-tool --server <server> --name <tool> --arguments-json '<json-object>'
```

- The servers are `zoom`, `meeting`, `chat`, `canvas`, `tasks`, `whiteboard` and `revenue-accelerator`, and `zoom` is the default. The `meeting` server overlaps with the meeting and recording tools on `zoom`, while the others add product areas.

- Pick a tool from the compact list, read only its schema with `describe-tool`, then call it on the server that advertised it. Bare `list-tools` returns the full catalog for diagnostics, so never cut it down through a shell pipe to find one schema.

- For meetings, the reviewed reads include `search_meetings`, `recordings_list`, `get_meeting_assets` and `get_recording_resource`. The catalog changes over time, so confirm a tool is listed before relying on it.

- Reviewed reads use Zoom's read permission. Changes and any tool not yet reviewed ask for the user's approval by default, whatever the provider's own hints say.

- Find meeting creation, updates and deletion in the live catalog, never from scopes or earlier results. If `meeting_create` is offered, read its schema first, and the CLI fills in `userId` as `me` when you leave it out.

- Verification codes in results appear as a `[credential:<id>]` placeholder. Never try to recover the code.

## Recordings and transcripts

- Before promising a recap, confirm the connected user can open that meeting's recording or transcript. An attendee usually cannot read the host's private recording, and some summaries need a separate Zoom license, so explain a missing asset right away.

- These servers cannot join a live meeting.

## Recover from errors

- Never retry a failed or timed-out call automatically, because it may have completed. Inspect the meeting or job to settle an uncertain result, and never repeat a meeting creation after a timeout.

- A failed tool reports its error category, or `unknown` when none of these fit:
  - `missing_scope` after an upgrade means the user should reconnect through `authorize-url` so the expanded access can be approved.
  - `license_required` means the account lacks the Zoom product that server needs.
  - `not_found_or_no_access` means the item does not exist or the user cannot open it.

- A license or scope gap can limit one server without affecting the others, so keep using servers that report `ok: true`. Keep the connection while resolving access rather than disconnecting it.

- A result marked as an error is a failed call, even when the transport itself succeeded.

## Related skills

- [Meeting Notes and Follow-ups](/opt/muse/skills/meeting-follow-up/SKILL.md)

- [Scheduling](/opt/muse/skills/scheduling/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
