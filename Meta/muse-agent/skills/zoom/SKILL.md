---
name: "zoom"
description: >-
  Review Zoom meetings, calls, recordings, and transcripts. Use to
  catch up on missed calls, summarize decisions, and extract action items and
  owners; also work with Team Chat, Canvas, Tasks, Whiteboard, Hub, and Revenue
  Accelerator through Zoom's official MCP servers.
icon: "zoom"
metadata: { "includeInPrompt": false }
---

# Zoom

Use the installed `zoom` CLI. Start with `zoom status`. If it reports
`not_connected`, run `zoom authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses the fixed Muse Zoom OAuth client and PKCE through authd. CAGI supplies
the client secret for token exchange and refresh; the secret must never enter
Muse or be requested in chat.

Run `zoom list-tools` to inspect the live catalogues and schemas from every
official Zoom MCP server. To inspect only one server, use `zoom list-tools
--server <server>`, where `<server>` is one of `zoom`, `meeting`, `chat`,
`canvas`, `tasks`, `whiteboard`, or `revenue-accelerator`.

Call an advertised tool on the server that returned it with:

```text
zoom call-tool --server <server> --name <tool> --arguments-json '<json-object>'
```

The `zoom` server is the default for backward compatibility. The dedicated
`meeting` server currently overlaps with the meeting and recording tools on the
all-in-one `zoom` server, while the other dedicated servers add broader product
capabilities.

Provider catalogues can contain both reads and mutations and may change over
time. The CLI validates the name against the selected server's live catalogue
and requires explicit approval before every tool call. Do not retry a failed or
timed-out tool call automatically because its side effect may have completed.

If a dedicated server reports a missing OAuth scope after an upgrade, ask the
user to reconnect Zoom so the expanded grant can be approved. Never disconnect
an existing connection without the user's confirmation.

Some servers require separately licensed Zoom products. Treat a per-server
error as that server being unavailable; continue using catalogues that report
`ok: true` rather than claiming the whole Zoom connection failed.

The `zoom` and `meeting` servers currently advertise `meeting_create`,
`meeting_update`, and `meeting_delete`, so use those live tools for meeting
scheduling and management. Do not infer availability merely from OAuth scopes:
confirm the tool and its current schema with `zoom list-tools --server meeting`
before calling it.
