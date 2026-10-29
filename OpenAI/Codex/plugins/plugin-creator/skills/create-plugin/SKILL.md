---
name: create-plugin
description: Create local or cloud plugins. Use when the user asks to build an app, tool, integration, or reusable workflow within ChatGPT or Codex. Covers custom MCP apps, skills, tools that connect agents to websites and services, and extensions for custom app views, file handling, and referencing app data in chat.
---

# Create a plugin

Default to a **cloud plugin built and hosted with Sites MCP**. Choose
its skills, tools, interactive views, and Extensions to fit the user's task.

For changes to an existing plugin, use
[update-plugin](../update-plugin/SKILL.md).

## Choose the capabilities

| Building block | What it provides |
| --- | --- |
| Skills | Reusable instructions, domain knowledge, workflows, and supporting files. |
| MCP tools | Access to data and actions, usable directly in chat. |
| MCP Apps | Interactive views for working with the plugin's data and actions. |
| Extensions | Integration with host surfaces such as navigation, files, settings, and the composer. |

### Extensions

Extensions provide deeper integration with ChatGPT and Codex. When the plugin's
skills, tools, and views do not fully support a workflow, consider an Extension
that enables or improves it. For example:

| User workflow | Implementation docs |
| --- | --- |
| View or edit a CSV, drawing, or other file | [File handlers](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md#file-extension-entrypoint) and [authorized file access](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md#filesystem-access) |
| Attach selected rows, objects, or app state to a message | [Model context lifecycle](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md#uiupdate-model-context-extensions) |
| Reference app content with `@` | [Extensions spec](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md) and installed SDK support for composer mentions |
| Share or reopen a location in the app | [Deep links](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md#deep-links) |
| Open from navigation or alongside a conversation | [Entrypoints](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md#mcp-app-entrypoints) |
| Configure the plugin within the host | [Structured settings](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md#structured-settings) |
| Show a workspace fullscreen or a confirmation inline | [Display preferences](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md#display-modes) |
| Match the host's appearance | [App styling](https://github.com/openai/mcp-extensions/blob/main/typescript/README.md#app-styling) |
| Collect structured input with visual selections | [Extensions spec](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md) and installed SDK support for rich forms |

Use the [Extensions guide](references/extensions.md) for development guidance.
For general tools and interactive views, use the
[MCP specification](https://modelcontextprotocol.io/specification/latest) and
[MCP Apps specification](https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/draft/apps.mdx).
Read the relevant documentation for the installed SDK version and check the
Extensions spec's current host-support guidance.

## Build a cloud plugin by default

Follow the [Sites MCP guide](references/sites-mcp.md) to load the available
Sites plugin's `sites` skill and its **Site MCP server** reference before
building, publishing, and connecting. Publishing provisions the Site's App
and canonical private plugin. Reuse that plugin.

Use this path unless the request gives a reason for another approach:

- **Skills only:** for reusable instructions or a workflow that needs no new
  server or app, create a plugin containing skills and supporting files. Follow
  [Plugin packages](references/plugin-packages.md) for installation and saving
  to the user's account.
- **Existing MCP server:** connect the plugin to that server, preserving its
  hosting and authentication. Follow [Server access](references/server-access.md)
  and [Plugin packages](references/plugin-packages.md).
- **Local plugin:** choose a local plugin when the user provides existing local
  plugin or app files to build from, asks to run locally, or needs direct access
  to local files, processes, or hardware. Reuse the requested codebase and runtime.
  Follow [Local plugins](references/local-plugins.md). Preserve an existing app's
  source and hosting unless the user asks to change them.

## Finish

Follow the chosen guide through verification and connection. Use local Codex
logs to investigate desktop failures when available.

To share inside a Workspace, go to **Plugins → Created by you → select plugin → Share**. You need to also share the Site if the Plugin is Site-hosted

To prepare a plugin for submission to the public directory, follow
[prepare-plugin-submission](../prepare-plugin-submission/SKILL.md) before the
final package handoff. Guide the user through review and publication metadata,
even when they only want a ZIP for later submission. Upload only when requested.
Sharing within a workspace does not require public submission.
