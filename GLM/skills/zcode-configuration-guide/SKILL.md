---
name: zcode-configuration-guide
description: Use when configuring ZCode's extension resources (MCP servers, slash commands, skills, hooks, and plugins) or instruction files such as AGENTS.md in the ZCode client. Explains where each resource is configured at the user and workspace scope, the discovery order, precedence, and merge rules, plus guidance on which location to choose. Use when someone asks how to add an MCP server, command, skill, hook, plugin, or AGENTS.md instructions, where a configuration file lives, why a configuration is not taking effect, or needs routing to a specific diagnostic skill.
---

# ZCode Configuration Guide

ZCode supports five types of extension resources, plus AGENTS.md instruction files. This skill is the **map**: it tells you where each resource is configured and how conflicts are resolved. For "something is not working, how do I fix it," follow the routing to the `diagnosing-*` skills at the end.

## How things are configured

There are two ways to work with configuration in the ZCode client, and this plugin serves both:

- **A person** manages resources through the client's graphical interface — **Settings → Plugin Management**, **Settings → Skills**, **Settings → Subagents**, **Settings → MCP**, and the **`/` menu** in the input box.
- **An agent** repairs configuration by reading and editing the underlying files directly with its file tools. The locations and rules below are what an agent uses to find the right file and field.

## Scopes and the main configuration files

- **User scope** — lives under your home directory and applies to every workspace.
- **Workspace scope** — lives inside a repository and applies only to that project; can be shared with a team through version control.
- **User configuration file**: `~/.zcode/cli/config.json`. Holds MCP servers, hooks, plugin enable/disable state, and skill/command disable overrides.
- **Workspace configuration file**: `<repo>/.zcode/config.json` (or `<repo>/zcode.json`).
- **User instruction file**: `~/.zcode/AGENTS.md`. Applies as default instructions for every workspace.
- **Workspace instruction file**: `<repo>/AGENTS.md`. Applies only to that project; the current workspace path is searched upward until the project root.

## The five resources at a glance

| Resource | Form | User scope | Workspace scope | Conflict rule |
|---|---|---|---|---|
| **Skills** | Directory + `SKILL.md` | `~/.zcode/skills/`, `~/.agents/skills/` | `<repo>/.zcode/skills/`, `<repo>/.agents/skills/` | Identity is the file path; on load the **first same-named skill wins** (user scope has priority) |
| **Commands** | `.md` file | `~/.zcode/commands/`, `~/.agents/commands/` | `<repo>/.zcode/commands/`, `<repo>/.agents/commands/` | Deduplicated by normalized command name; **first match wins** (user scope overrides workspace), the loser is ignored |
| **MCP** | JSON object | `~/.zcode/cli/config.json` → `mcp.servers` (fallback `~/.agents/mcp.json` → `mcpServers`) | `<repo>/.zcode/config.json` → `mcp.servers` (fallback `<repo>/.agents/mcp.json` → `mcpServers`) | **User overrides workspace** for a same-named server; workspace-scoped servers are **trusted and auto-connected** by default, same as user-scoped |
| **Hooks** | `hooks.json` / config object | `~/.zcode/cli/config.json` → `hooks` | `<repo>/.zcode/config.json` → `hooks` | Configuration-file hooks require `hooks.enabled: true`; plugin hooks are appended |
| **Plugins** | Directory + `plugin.json` | Installed from a marketplace; enable/disable state stored in `~/.zcode/cli/config.json` | — | A plugin contributes skills, commands, hooks, MCP servers, and agents |
| **Instructions** | `AGENTS.md` file | `~/.zcode/AGENTS.md` | `<repo>/AGENTS.md` | User default instructions load first, then workspace instructions load later so the workspace can narrow or override broad defaults |

> Note: `.agents/mcp.json` is a **compatibility fallback** for MCP. Within each scope the client reads `.zcode` first; only if that scope has no MCP servers does it fall back to `.agents/mcp.json` (which uses a top-level `mcpServers` key, whereas `.zcode` uses nested `mcp.servers`).

## Instructions / AGENTS.md: merge order

`AGENTS.md` is not a skill, command, hook, MCP server, or plugin. It is the instruction file ZCode loads into the model context for broad behavior rules.

- **User scope**: `~/.zcode/AGENTS.md`. Use this for personal defaults that should apply in every workspace, such as preferred language, review style, or local workflow conventions.
- **Workspace scope**: `<repo>/AGENTS.md`. Use this for repository-specific rules that should be shared with the project, such as architecture boundaries, logging rules, testing requirements, and commit/MR policy.
- **Resolution**: ZCode searches for the workspace `AGENTS.md` from the current working directory upward until the detected project root. The user default file is resolved from the user's home directory.
- **Merge order**: when both files exist, ZCode injects `~/.zcode/AGENTS.md` first, then the resolved workspace `AGENTS.md`. Workspace instructions appear later, so they can narrow or override broad user defaults for that repository.
- **Migration and creation**: onboarding can copy existing user memory from `~/.claude/CLAUDE.md` into `~/.zcode/AGENTS.md`. The built-in `/init` command targets the current workspace `AGENTS.md`, creating or updating repository instructions instead of editing the user default file.

## Skills and commands: discovery order (identical)

Locations are scanned in this order (earlier locations take precedence):

1. Explicitly configured roots
2. User `~/.zcode/skills` (or `commands`)
3. User `~/.agents/skills`
4. Workspace `.zcode/skills` (from the current directory up to the repository root; every level counts)
5. Workspace `.agents/skills`
6. Enabled **plugin** roots (lowest precedence)

Within a level, `.zcode` is scanned before `.agents`. A deeper working-directory location takes precedence over a repository-root location.

- **Skills merge**: identity is the file path, so same-named skills at different paths are **all discovered**, but only the first in discovery order is loaded — higher-precedence copies shadow the rest.
- **Commands merge**: the key is the normalized command name, and the **first match wins**; duplicates are ignored. Nested directories join into the name with a colon: `review/code.md` becomes `/review:code` (not `/review/code`).

## MCP: merge and auto-connect

- **Override order** for a same-named server: CLI override → environment → user → workspace → system defaults. In short, **user overrides workspace**. Plugin-provided servers form the base layer and are overridden by explicit configuration.
- **Auto-connect**: MCP servers from every scope — user, **workspace**, plugin, environment, and CLI — are **trusted and connected automatically** at session start. (Workspace-scoped servers were previously untrusted and required manual authorization; they now connect by default like any other scope.) Use **Settings → MCP** to inspect status and repair server configuration.

## Hooks: essentials

- Supported events (exactly seven): `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PostToolUseFailure`, `Stop`.
- **Configuration-file hooks must set `hooks.enabled: true`** to run (disabled by default). When any plugin contributes a hook, the hook runner is enabled automatically.

## Plugins: essentials

- Managed in **Settings → Plugin Management** (the **Installed** and **Discover** tabs). A plugin directory carries a manifest at `.zcode-plugin/plugin.json` (the compatibility names `.claude-plugin/` and `.codex-plugin/` are also recognized). The minimal manifest requires only `name` (matching `^[a-z0-9][a-z0-9._-]{0,127}$`).
- Component fields: `commands`, `skills`, `hooks`, `mcpServers`, `agents` (each may be a directory name, an array, or inline). The fields `channels`, `lspServers`, `outputStyles`, and `settings` are recorded but not executed.
- Enable/disable state is stored under `plugins` in `~/.zcode/cli/config.json`. A built-in plugin can be disabled but not uninstalled.
- Marketplaces can be added (via the **`+`** button on the Discover tab) from a GitHub repository, a Git URL, a local directory, or a file.

## Choosing where to configure

- Personal, used across projects → user scope (`~/.zcode/...` or `~/.agents/...`).
- Team- or project-shared, versioned with the repository → workspace scope (`<repo>/.zcode/...` or `.agents/...`).
- Shared with other coding agents that read `~/.agents/skills/` → put skills there; to override a same-named skill only inside ZCode, use `.zcode/skills/`.
- Personal default instructions → `~/.zcode/AGENTS.md`; repository-specific instructions → `<repo>/AGENTS.md`. If both exist, keep broad preferences in the user file and project rules in the workspace file.
- MCP servers → user configuration for personal servers, or workspace configuration to share with a team; both scopes connect automatically. Because opening a project now auto-connects the MCP servers declared in its configuration, only open workspaces you trust.
- Secrets → never commit them to version control; use environment variables or local settings.

## When something is wrong — route to a diagnostic skill

When a configuration is read but has no effect, or reports an error, load the matching skill. Each provides a symptom → cause → check → fix workflow, covering both what to click in the client and which file and field an agent should edit:

- MCP server not connecting, tools missing, untrusted, or timing out → **`diagnosing-mcp`**
- A skill is not discovered, not triggering, shadowed, or disabled → **`diagnosing-skills`**
- A `/command` is missing, overridden, has a frontmatter error, or arguments do not substitute → **`diagnosing-commands`**
- A hook does not trigger, its matcher does not match, its script is not executable, or it blocks unexpectedly → **`diagnosing-hooks`**
- A plugin is not listed, fails to install, has missing components, or is not enabled → **`diagnosing-plugins`**
