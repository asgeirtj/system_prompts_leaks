---
name: update-plugin
description: Inspect, edit, or extend custom plugins the user owns or has permission to edit. Use when the user asks to change a plugin's instructions, skills, tools, app UI, Extensions, metadata, assets, or configuration, delete packaged files, or inspect a previous version.
---

# Update a plugin

Start from the selected plugin and its current source. Preserve its identity,
data, hosting, and audience while making the requested change. A question about
the plugin or its history does not by itself call for an edit.

## Find the source that owns the change

| Plugin or change | Workflow |
| --- | --- |
| A Site's website, MCP tools, or Extensions | Edit the existing Site source and use [Sites MCP](../create-plugin/references/sites-mcp.md). Keep its project, App, and plugin IDs. |
| Skills in an eligible App-backed personal or workspace plugin, including a Site | Follow [account plugin updates](references/account-updates.md#skills-in-app-backed-plugins). Keep its existing plugin and App IDs and preserve App-owned configuration. |
| A local plugin | Edit the selected directory and follow [local plugins](../create-plugin/references/local-plugins.md) to reload it when requested. |
| A separately hosted MCP server or app | Change its server/UI repository and use its existing deployment process. Update the plugin package only if its files or connection configuration also change. |
| A standalone plugin saved through Plugin Creator | Follow [account plugin updates](references/account-updates.md) to retrieve source and publish an eligible update. |
| A Git-synced or otherwise managed plugin | Change its owning source and use that release process. The archive editor cannot update every installed plugin. |

Read the [Extensions reference](../create-plugin/references/extensions.md) when
changing host integration. Use [package format](../create-plugin/references/plugin-packages.md)
when changing manifests, skills, or packaged assets. Inspect existing files
before replacing them; reuse the implementation where it still fits.

For an account plugin, use its verified backend ID and existing scope, not a
similarly named result or the active account's scope. Prefer the source tools
for text edits. Download an archive only for history or content those tools
cannot return. The account reference covers ownership, partial-file updates,
explicit file deletion, and release-conflict handling.

## Apply and verify

Honor requests to save source without deploying. For a shared plugin, make
the effect on other users clear before publishing and obtain authorization
if the conversation has not already provided it. Keep sharing and permissions
unchanged unless the user requests otherwise through a supported workflow.

Test the behavior affected by the change. For an MCP App, verify its tools and
UI in the intended ChatGPT or Codex host when available. Return the plugin link
or source changes, a brief account of what changed, and any unverified behavior.
Use [prepare-plugin-submission](../prepare-plugin-submission/SKILL.md) for a
requested public submission, not for an ordinary private update.
