---
name: agy-customizations
description: >-
  Comprehensive guide and reference for the Antigravity Customization System.
  Use to explain how customizations work, their loading priority, discovery mechanisms,
  and to guide the creation of skills, rules, plugins, hooks, and MCP servers.
---

# Antigravity Customization System Guide

The Antigravity Customization System allows you to tailor the agent's behavior,
teach it new workflows, enforce guidelines, and integrate it with external
tools. By customizing the agent, you can transition it from a general-purpose
assistant to an expert pair programmer specialized in your project's codebase
and processes.

--------------------------------------------------------------------------------

## Customization Types: Quick Reference

Choose the right customization type based on your goal:

Type            | Config File/Folder           | Scope                     | Best For                                                                                | Learn More  
:-------------- | :--------------------------- | :------------------------ | :-------------------------------------------------------------------------------------- | :---------  
**Rules**       | `GEMINI.md`, `AGENTS.md`     | Contextual / Hierarchical | Enforcing coding styles, API restrictions, and local guidelines.                        | [Rules Guide](./docs/rules.md)  
**Skills**      | `skills/<name>/SKILL.md`     | On-Demand (Progressive)   | Teaching the agent multi-step procedures, runbooks, and tool workflows.                 | [Skills Guide](./docs/skills.md)  
**Plugins**     | `plugins/<name>/plugin.json` | Bundle                    | Packaging related skills, rules, and MCP configs into a single unit.                    | [Plugins Guide](./docs/plugins.md)  
**Hooks**       | `hooks.json`                 | Lifecycle Event           | Running scripts/commands at specific agent lifecycle points (e.g., pre-tool execution). | [Hooks Guide](./docs/hooks.md)  
**MCP Servers** | `mcp_config.json`            | Tool Integration          | Connecting the agent to external services and custom tool providers.                    | [MCP Guide](./docs/mcp_servers.md)

--------------------------------------------------------------------------------

## Customization Discovery and Locations

Antigravity automatically discovers your own customizations by traversing
specific directories. Built-in customizations are not found this way: the agent
config names the ones it mounts.

### Discovery Locations

1.  **Workspace Customizations** (Project-Specific):
    *   Path: `.agents/` (or `.agent/`, `_agents/`, `_agent/`) at the root of  
        your project.
    *   Use this to share customizations with your team by checking them into  
        version control (VCS).
    *   The agent walks from your current working directory up to the repository  
        root (e.g., the folder containing `.git`) to find these directories.
2.  **Directory & Project Rules** (Hierarchical):
    *   Paths: `GEMINI.md`, `AGENTS.md`, `.agents/rules/*.md`
    *   As you open or edit files, the agent walks up from the file's directory  
        to the repository root, loading all rules it finds.
3.  **Global Configuration** (Machine-Local):
    *   Path: `~/.gemini/config/`
    *   Applies to all projects and workspaces run on your machine.

--------------------------------------------------------------------------------

## Loading Priority and Precedence

When multiple customizations are discovered, they are loaded and applied in a
specific order. If there are naming conflicts (e.g., two skills with the same
name), the higher-priority customization overrides the lower-priority one.

The priority order (from highest to lowest) is:

1.  **Workspace Project**: Hierarchical discovery walking up from the CWD to the
    repository root.
2.  **Declared Configurations**: Customizations explicitly listed in
    `skills.json` or `plugins.json` in your workspace.
3.  **Global Discovery**: `~/.gemini/config/`
4.  **Built-in Customizations**: Default skills bundled with the application,
    mounted by name rather than discovered.
5.  **Global Declared Configurations**: Explicitly listed in global JSON
    configs.

--------------------------------------------------------------------------------

## How Customizations are Applied

### Progressive Disclosure (Skills and Rules)

To prevent overwhelming the model's context window, Antigravity uses

**progressive disclosure**:

*   **Skills** are not loaded into the context window by default. Only their
    names and descriptions are injected. The full content of a skill is only
    loaded if the model (or the user) explicitly decides to activate it.
*   **Rules** with `trigger: model_decision` behave similarly. Only `always_on`
    rules are loaded unconditionally.

### Deduplication

All customizations (especially rules) are deduplicated by their resolved file
paths. A rule file will never be injected more than once in a single
conversation turn, even if it matches multiple trigger conditions.

--------------------------------------------------------------------------------

## Advanced Management: JSON Configs

For customizations stored in non-standard locations, you can use `skills.json`
and `plugins.json` to explicitly register them and inherit from shared
configurations.

*   Learn how to configure these in the
    [JSON Configurations Guide](./docs/json_configs.md).
