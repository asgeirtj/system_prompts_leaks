---
name: "vercel"
description: >-
  Inspect and manage the user's Vercel websites, web apps, projects, and
  deployments. Use to read build and runtime logs, investigate production errors
  and failed deployments, check deployment status, and deploy projects through
  Vercel's official MCP server.
icon: "vercel"
metadata: { "includeInPrompt": false }
---

# Vercel

Use the installed `vercel` CLI. Start with `vercel status`. If it reports
`not_connected`, run `vercel authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses Dynamic Client Registration and PKCE through authd. Vercel declares
the client public and issues no client secret, so no shared credential enters
Muse and credentials must never be requested in chat. Vercel exposes only
identity and session OAuth scopes for this MCP server, so read-only-by-default
behavior is enforced by the connector permissions below rather than a narrower
provider scope.

Run `vercel list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
vercel call-tool --name <tool> --arguments-json '<json-object>'
```

The reviewed catalogue follows Vercel's current public MCP tool documentation,
including `create_deployment`. The former `deploy_to_vercel` name and other
recently replaced names remain accepted only when the live server still
advertises them during rollout. Always use the live schema returned by
`list-tools`; for example, current `create_deployment` arguments place the
deployment definition under `requestBody`.

`list-tools` exposes only reviewed Vercel tools and includes each tool's
`hatch_permission`, `hatch_action`, and `hatch_permission_label`. Unknown or
new provider tools remain unavailable until reviewed. Ordinary reads follow
the user's connector settings. Decrypted secrets, deployment or sandbox file
contents, deployments, purchases, credential creation, security changes,
sandbox execution, and other mutations use separate granular permissions that
ask by default. Vercel advertises identity/session OAuth scopes only, so there
is no provider-side incremental scope to request for an individual tool.

Purchase tools can create immediate, non-refundable charges. Obtain a quote
when the live tool contract provides one, show it to the user, and never infer
confirmation. Do not retry any failed or timed-out write automatically because
its side effect may have completed.
