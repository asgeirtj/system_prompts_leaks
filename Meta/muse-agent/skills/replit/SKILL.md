---
name: "replit"
description: "Read, create, update, and publish apps through Replit's official MCP server."
icon: "replit"
metadata: { "includeInPrompt": false }
---

# Replit

Use the installed `replit` CLI. Start with `replit status`. If it reports
`not_connected`, run `replit authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses Dynamic Client Registration and PKCE through authd. No shared client
secret enters Muse, and credentials must never be requested in chat.
The first connection requests read-only access. Before a write, or after one
fails for missing access, run `replit status --for-command <tool-name>`. If it
returns `scope_status: not_granted`, copy `scope_add_url` exactly and post it on
its own line as `[Additional Replit access](<scope_add_url>)` so the client
renders the native access button, then wait for consent to finish before
retrying once. OAuth access does not replace Hatch approval. Never construct a
scope URL or ask for tokens in chat.

Run `replit list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
replit call-tool --name <tool> --arguments-json '<json-object>'
```

`list-tools` exposes only reviewed Replit tools and includes each tool's
`hatch_permission`, `hatch_action`, and `hatch_permission_label`. Unknown or
new provider tools remain unavailable until reviewed. Read permissions follow
the user's connector settings; creating, editing, and publishing apps use
separate granular approvals. Do not retry a failed or timed-out write
automatically because its side effect may have completed.
