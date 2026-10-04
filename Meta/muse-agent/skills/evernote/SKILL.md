---
name: "evernote"
description: "Read and create notes through Evernote's official MCP server."
icon: "evernote"
metadata: { "includeInPrompt": false }
---

# Evernote

Use the installed `evernote` CLI. Start with `evernote status`. If it reports
`not_connected`, run `evernote authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses Dynamic Client Registration and PKCE through authd. No shared client
secret enters Muse, and credentials must never be requested in chat.

Run `evernote list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
evernote call-tool --name <tool> --arguments-json '<json-object>'
```

`list-tools` exposes only reviewed Evernote tools and includes each tool's
`hatch_permission`, `hatch_action`, and `hatch_permission_label`. Unknown or
new provider tools remain unavailable until reviewed. Read permissions follow
the user's connector settings; creating notes requires the corresponding
granular approval. Do not retry a failed or timed-out write automatically
because its side effect may have completed.
