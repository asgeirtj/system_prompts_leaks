# Plugins

Plugins are namespaced, shareable bundles that package **Skills**, **Rules**,  
**Hooks**, and **MCP Server Configurations** into a single deployable unit. They
are the recommended way to distribute complex, feature-rich customizations to
your team.

--------------------------------------------------------------------------------

## Directory Structure

A plugin must be contained within a subdirectory of a `plugins/` folder in a
customization root (e.g., `.agents/plugins/`).

```text
plugins/<plugin_name>/
├── plugin.json       # Required: Manifest file
├── mcp_config.json   # Optional: MCP servers exposed by the plugin
├── hooks.json        # Optional: Lifecycle hooks run by the plugin
├── rules/            # Optional: Rules applied when plugin is active (AGENTS.md recommended)
│   └── AGENTS.md
└── skills/           # Optional: Skills exposed by the plugin
    └── <skill_name>/
        └── SKILL.md
```

--------------------------------------------------------------------------------

## Manifest (`plugin.json`)

The `plugin.json` file serves as the marker declaring the directory as a plugin.

```json
{
  "name": "team-developer-kit"
}
```

*   **`name`** (string, optional): The display name of the plugin. If omitted,
    it defaults to the directory name.
*   **`author`** (string or object, optional): Developer or team name string, or
    an object with `name` and optional `url` (`https://`).
*   **`homepage`** (string, optional): External `https://` website or
    documentation URL.
*   **`repository`** (string or object, optional): Source repository `https://`  
    URL (or `{"type": "git", "url": "https://..."}`).

--------------------------------------------------------------------------------

## How Plugins Work

When a plugin is discovered and enabled:

1.  **Automatic Ingestion**: All skills, rules, hooks, and MCP servers defined
    within the plugin's directory structure are automatically loaded.
2.  **Namespacing**: Tools and skills exposed by the plugin are namespaced if
    necessary to prevent collisions with other customizations.
3.  **Lifecycle Scoping**:
    *   **Hooks** defined in `plugins/<name>/hooks.json` are registered and run  
        during the agent's lifecycle.
        > [!NOTE]  
        > Runtime plugin discovery strictly loads `hooks.json` from the plugin  
        > root (`<plugin_dir>/hooks.json`). While `agy plugin install` stages  
        > `hooks/hooks.json` into `<plugin_dir>/hooks.json` when importing a  
        > pure Gemini CLI (`gemini-extension.json`) or Claude Code  
        > (`.claude-plugin/plugin.json`) extension, native plugins (any  
        > directory containing `plugin.json`, `.antigravity-plugin/plugin.json`,  
        > or `.gemini-plugin/plugin.json`, or loaded via `plugins.json`) do not  
        > run extension staging and **must** place `hooks.json` directly at the  
        > plugin root.
    *   **MCP Servers** defined in `plugins/<name>/mcp_config.json` are  
        launched, and their tools are made available.
    *   **Rules** in `plugins/<name>/rules/` are merged into the active rule  
        set. Placing a consolidated **`AGENTS.md`** (or `GEMINI.md`) file under  
        `rules/` (e.g., `rules/AGENTS.md`) is recommended over separate rule files.

## Registering Plugins

Plugins can be discovered automatically if placed in standard customization
roots, or they can be explicitly registered using `plugins.json`.

*   See the [JSON Configurations Guide](./json_configs.md) for details on how to
    use `plugins.json` to enable specific plugins or inherit them from shared
    paths.

## Turning Plugins On and Off

Most discovered plugins are **enabled by default**; a plugin can ship switched
off by declaring `"disabled": true` in its `plugin.json`, and some built-in ones
do. Whether a plugin is active is recorded in your `config.json`, under a
`plugins` map keyed by the plugin's **directory** name:

```json
{
  "plugins": {
    "my-plugin": { "enabled": false }
  }
}
```

You can change the setting from the plugin section of the settings UI, or from
the CLI's `plugin enable` / `plugin disable` subcommands, both of which write
this entry.

`config.json` wins wherever it has an entry, so your choice always beats what
the plugin declares. A plugin with no entry falls back to its `plugin.json`
declaration, which is how a plugin that ships disabled stays off until you turn
it on. Antigravity never records your preference inside the plugin itself, so
your choice survives reinstalling or updating the plugin.

A disabled plugin still appears in the plugin list so you can turn it back on,
but none of its bundled customizations are loaded.
