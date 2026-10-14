---
name: "zapier"
description: "Connect Muse to actions across apps through Zapier's official MCP server."
icon: "zapier"
metadata: { "includeInPrompt": false }
---

# Zapier

Use the installed `zapier` CLI. Start with `zapier status`. If it reports
`not_connected`, run `zapier authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses Dynamic Client Registration and PKCE through authd. No shared client
secret enters Muse, and credentials must never be requested in chat. Zapier's
MCP authorization exposes identity scopes rather than separate read and write
scopes, so read-only-by-default behavior is enforced by connector permissions.

Run `zapier list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
zapier call-tool --name <tool> --arguments-json '<json-object>'
```

`list-tools` exposes only reviewed Zapier agentic-mode tools and includes each
tool's `hatch_permission`, `hatch_action`, and `hatch_permission_label`.
Unknown or dynamic managed-mode tools remain unavailable until reviewed. Read
permissions follow the user's connector settings; executing write actions and
changing configuration use granular approvals. Do not retry a failed or
timed-out write automatically because its side effect may have completed.
