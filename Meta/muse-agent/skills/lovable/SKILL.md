---
name: "lovable"
description: >-
  Read, create, edit, and deploy web apps and projects in Lovable. Use to turn a
  product brief into a working website or prototype, inspect existing project
  code, update pages and features, and publish changes through Lovable's official
  MCP server.
icon: "lovable"
metadata: { "includeInPrompt": false }
---

# Lovable

Use the installed `lovable` CLI. Start with `lovable status`. If it reports
`not_connected`, run `lovable authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses Lovable's fixed Muse client and PKCE through authd. CAGI supplies the
client secret for token exchange and refresh; it never enters Muse and must
never be requested in chat.
The first connection requests read-only access. Before a write, or after one
fails for missing access, run `lovable status --for-command <tool-name>`. If it
returns `scope_status: not_granted`, copy `scope_add_url` exactly and post it on
its own line as `[Additional Lovable access](<scope_add_url>)` so the client
renders the native access button, then wait for consent to finish before
retrying once. OAuth access does not replace Hatch approval. Never construct a
scope URL or ask for tokens in chat.

Run `lovable list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
lovable call-tool --name <tool> --arguments-json '<json-object>'
```

`list-tools` exposes only reviewed Lovable tools and includes each tool's
`hatch_permission`, `hatch_action`, and `hatch_permission_label`. Unknown or
new provider tools remain unavailable until reviewed. Read permissions follow
the user's connector settings; edits, publishes, and database operations use
separate granular approvals. Do not retry a failed or timed-out write
automatically because its side effect may have completed.
