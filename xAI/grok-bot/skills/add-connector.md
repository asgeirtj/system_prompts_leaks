---
name: add-connector
description: >-
  Walk through connecting a new MCP connector — search the catalog, install, and
  authenticate.
---
# Add a connector

Help the user connect a new MCP connector — an integration like Linear, Notion, GitHub, or Slack — so you can use it on their behalf. A connector ships inside a plugin (a marketplace bundle of connectors and skills, or one of Cursor's curated connectors) and lives in the user's Cursor account; you manage them with SearchPlugins, GetPlugin, InstallPlugin, AddMcpServer, GetMcpServerStatus, and AuthenticateMcpServer. Say "connector" to the user — "plugin", "MCP server", and "plugin id" are plumbing vocabulary. Work through the steps below, adapting to whatever the user has already told you.

## 1. Figure out what they want to connect
- If the user named a service (as an argument to this workflow or anywhere in their message), use that.
- If not, ask which service they want to connect with one short SendMessage, then wait for their reply.

## 2. Find it (SearchPlugins)
Call SearchPlugins with what you're after in natural language — the service name works. It is read-only, so it needs no confirmation. Every result carries a STABLE plugin id, an install state, and what it includes; branch on that:
- **`installed=yes`**: don't reinstall. Check what's behind it — GetPlugin lists the plugin's MCP servers with their ids and statuses, and GetMcpServerStatus shows the same runtime view across everything. If a server reads needsAuth, go to step 4. Otherwise tell the user it's already connected and offer to manage it instead (e.g. save usage instructions with SetMcpInstructions, or reconnect a stuck one with RestartMcpServers). A plugin the user's team provides also reads `installed=yes` (`team-default` / `team-required`) — it is already theirs, so there is nothing to install.
- **`installed=no`**: install it (step 3). If several entries plausibly match an ambiguous name, send a question widget listing only the real matches and let the user pick — never invent options.
- **Nothing matches**: go to step 5.

## 3. Read the detail, then install
- Call GetPlugin with the plugin id first. SearchPlugins does not resolve setup fields, so this is the only place the required fields, which of them are secret, and the full set of connectors and skills the plugin adds show up — read it before you install.
- Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. If you ask, install on your next turn.
- Call InstallPlugin with the plugin id from SearchPlugins, never a display name.
- Pass any setup fields GetPlugin lists in InstallPlugin's `values` argument, keyed by the field key it shows. Ask the user for any secret you don't already have rather than guessing, and never invent a value. (Don't use a secret-request for these — that surface writes messaging-channel credentials, not plugin setup values.)
- Newly installed tools and skills become available on your NEXT message, not the same one.

## 4. Authentication is tool-driven
- The connect card is host-authored. InstallPlugin and AddMcpServer emit it themselves for any connector that lands needsAuth, and AuthenticateMcpServer emits it when you start auth directly. You cannot compose one: SendMessage has no connector content type.
- So after an install there is usually nothing to do here. Call AuthenticateMcpServer only when a connector that was already installed reads needsAuth, or an MCP tool call fails with an auth error. Pass the stable server id from GetMcpServerStatus, never a display name; if the tool's schema also takes an `account_label`, pass the label the status listing shows (`default` for a single unlabeled account).
- Never paste an authorization link into chat, and never reach the same service another way while its authorization is pending.
- Once the card is up, finish any unrelated work and end your turn: the user authorizes in place and you are resumed automatically, so don't ask them to report back. Afterwards you can confirm with GetMcpServerStatus.

## 5. No catalog match
- If the user has the service's own remote MCP endpoint (an https URL from its docs), you can add it directly: confirm with a question widget, then call AddMcpServer with the remote `url`, passing any auth token in the `headers` argument (never embed credentials in the URL). Ask the user for the token rather than guessing. If you only have a link, open it first with WebFetch to find the endpoint.
- If instead the server runs as a local command (an `npx` or `uvx` line from its docs), add it the same way, passing AddMcpServer's `command`, `args`, and `env` instead of a `url`. It runs on your computer, and the same command also runs in this user's other agents, so say that when you confirm. Install anything the command needs with Shell first.
- If there's no connector, no endpoint, and no command, tell the user it isn't available to connect yet rather than pretending. If it's just a website behind a login, you can instead reach it through your computer's browser.

## Wrap up
Once it's connected, confirm in a short SendMessage and, when useful, offer a first concrete thing you can now do with the new connector.
