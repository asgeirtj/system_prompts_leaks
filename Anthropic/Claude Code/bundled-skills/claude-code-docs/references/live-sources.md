# Live Documentation Sources

WebFetch URLs for fetching current Claude Code documentation. Use these when the bundled references and the live build configuration in your prompt don't answer the question, or when the user asks about behavior, internals, or topics not covered by the live build snapshot.

Mintlify serves both `.md` and `.mdx` for every page; prefer `.md` for clean fetches. The `.md` form is for fetching only: when linking a page for the user, drop the trailing `.md` so they get the rendered page.

## Start here

| Topic | URL | Extraction prompt |
|---|---|---|
| Page index (all pages + headings) | `https://code.claude.com/docs/en/claude_code_docs_map.md` | "Find the page that covers `<topic>` and return its URL" |
| Changelog | `https://code.claude.com/docs/en/changelog.md` | "Extract changes since version `<X.Y.Z>`" |

## Configuration

| Topic | URL | Extraction prompt |
|---|---|---|
| Settings reference | `https://code.claude.com/docs/en/settings.md` | "Extract the settings key, type, scope, and default for `<setting>`" |
| CLI reference (flags) | `https://code.claude.com/docs/en/cli-reference.md` | "Extract the flag, its arguments, and what it does for `<flag>`" |
| Permissions and rules | `https://code.claude.com/docs/en/permissions.md` | "Extract the permission rule syntax and examples for `<tool>`" |
| Memory (CLAUDE.md) | `https://code.claude.com/docs/en/memory.md` | "Extract how to use and structure CLAUDE.md" |
| `.claude/` directory layout | `https://code.claude.com/docs/en/claude-directory.md` | "Extract what goes where in the .claude directory" |
| Environment variables | `https://code.claude.com/docs/en/env-vars.md` | "Extract the environment variable name, type, and effect for `<variable>`" |

## Extensibility

| Topic | URL | Extraction prompt |
|---|---|---|
| Hooks | `https://code.claude.com/docs/en/hooks.md` | "Extract the hook event names, JSON schema, and configuration for `<hook event>`" |
| Skills | `https://code.claude.com/docs/en/skills.md` | "Extract how to create and structure a skill" |
| Subagents | `https://code.claude.com/docs/en/sub-agents.md` | "Extract how to define and configure subagents" |
| MCP servers | `https://code.claude.com/docs/en/mcp.md` | "Extract how to add, configure, and authenticate MCP servers" |
| Plugins | `https://code.claude.com/docs/en/plugins.md` | "Extract how to install and develop plugins" |
| Output styles | `https://code.claude.com/docs/en/output-styles.md` | "Extract how to create and apply output styles" |

## Workflows and surfaces

| Topic | URL | Extraction prompt |
|---|---|---|
| Commands reference | `https://code.claude.com/docs/en/commands.md` | "Extract the command name, syntax, and description for /`<command>`" |
| Interactive mode (keybindings) | `https://code.claude.com/docs/en/interactive-mode.md` | "Extract the keyboard shortcut for `<action>`" |
| Common workflows | `https://code.claude.com/docs/en/common-workflows.md` | "Extract the workflow steps for `<task>`" |
| GitHub Actions | `https://code.claude.com/docs/en/github-actions.md` | "Extract how to set up Claude Code in GitHub Actions" |
| Claude Code on the web | `https://code.claude.com/docs/en/claude-code-on-the-web.md` | "Extract how remote sessions work and what's configurable" |
| VS Code integration | `https://code.claude.com/docs/en/vs-code.md` | "Extract how to set up and use the VS Code extension" |
| JetBrains integration | `https://code.claude.com/docs/en/jetbrains.md` | "Extract how to set up and use the JetBrains plugin" |

## Deployment and security

| Topic | URL | Extraction prompt |
|---|---|---|
| Amazon Bedrock | `https://code.claude.com/docs/en/amazon-bedrock.md` | "Extract setup, auth, and capability differences on Bedrock" |
| Google Vertex AI | `https://code.claude.com/docs/en/google-vertex-ai.md` | "Extract setup, auth, and capability differences on Vertex" |
| Microsoft Foundry | `https://code.claude.com/docs/en/microsoft-foundry.md` | "Extract setup, auth, and capability differences on Foundry" |
| Sandboxing | `https://code.claude.com/docs/en/sandboxing.md` | "Extract how sandboxing works and how to configure it" |
| Security | `https://code.claude.com/docs/en/security.md` | "Extract the security model and trust boundaries" |
| Network configuration | `https://code.claude.com/docs/en/network-config.md` | "Extract proxy, firewall, and offline configuration" |
| Costs and tracking | `https://code.claude.com/docs/en/costs.md` | "Extract how costs are calculated and how to track them" |

## Claude in Slack (Claude Tag)

Read `references/claude-tag.md` first — it is the offline floor for this surface. Then fetch:

| Topic | URL | Extraction prompt |
|---|---|---|
| Claude Tag (Claude as a teammate in Slack, org-managed) | `https://claude.com/docs/claude-tag/overview.md` | "Extract what Claude Tag is, plan availability, and how an org owner enables and configures it" |
| All Claude Tag pages (index for the claude.com docs domain) | `https://claude.com/docs/llms.txt` | "Find the Claude Tag page that covers `<topic>` and return its URL" |
| Org-owner setup walkthrough (pair Slack, connect tools, spend limit, launch) | `https://claude.com/docs/claude-tag/admins/setup-overview.md` | "Extract the setup steps and prerequisites for enabling Claude Tag" |
| End-user getting started | `https://claude.com/docs/claude-tag/users/getting-started.md` | "Extract how a Slack user starts working with Claude Tag" |
| Migrating from the earlier "Claude in Slack" app | `https://claude.com/docs/claude-tag/admins/migrate-from-earlier.md` | "Extract what changes for workspaces moving from the earlier app to Claude Tag" |

## Agent SDK

For building custom agents with the Claude Agent SDK (Python or TypeScript), the docs are part of the Claude API documentation. Fetch `https://platform.claude.com/llms.txt` to find the right page, or use the `/claude-api` skill which covers the SDK in depth.
