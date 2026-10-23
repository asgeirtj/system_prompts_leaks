---
name: diagnosing-plugins
description: Use to diagnose and fix ZCode plugin and marketplace problems in the ZCode client. Applies when a plugin is not listed, adding a marketplace or installing a plugin fails, a plugin is enabled but its skills or commands are missing, a built-in plugin still appears after being disabled, a plugin is not enabled as expected, a plugin.json manifest has a parse error, a plugin name is invalid, a dependency is unresolved or blocked across marketplaces, or a sensitive configuration value cannot be entered in the interface. Provides the plugin lifecycle, manifest schema, how to manage plugins in the client, and a step-by-step localization and repair workflow.
---

# Diagnosing Plugin Configuration

Goal: reduce any plugin problem to a single concrete fix.

Plugins are managed in **Settings → Plugin Management** — the **Installed** tab (enable/disable, view details, configure, uninstall) and the **Discover** tab (browse, install, and add marketplaces via the **`+`** button).

> Key facts: enable/disable state is stored under `plugins` in `~/.zcode/cli/config.json`; the official marketplace is `zcode-plugins-official`; and for cloning marketplace repositories behind a proxy, ZCode reads the proxy from `ZCODE_HTTP_PROXY` (a bare `http_proxy` is not used).

## 1. Plugin lifecycle and persistence

- **Discovery sources** (first match wins): inline directories, bundled official plugins, the official plugin cache, and marketplace-installed plugins. The entire subsystem is governed by the `plugins.enabled` master switch.
- **Manifest location** (probed in order): `.zcode-plugin/plugin.json` (preferred), then `.claude-plugin/plugin.json`, then `.codex-plugin/plugin.json`. A plugin's identity is `<name>@<marketplace>`.
- **Enable/disable resolution**: an explicit enable/disable entry always wins; only when no entry exists does the plugin's default-enabled status apply. A disabled plugin still appears in the list as disabled, but its components resolve to nothing.
- **Persistence** (all under `plugins` in `~/.zcode/cli/config.json`): the enable/disable map, per-plugin configuration values, and the list of suppressed (uninstalled) built-in plugins. Because a built-in plugin ships with the application and cannot be deleted, "uninstalling" one records a suppression marker that hides it from discovery.
- **Built-in seeding**: on first launch, bundled official plugins are materialized into the plugin cache and registered in the official marketplace listing. This is idempotent and only re-materializes on a content or version change.

## 2. Manifest schema

- **plugin.json**: requires `name` (matching `^[a-z0-9][a-z0-9._-]{0,127}$`); optional `version` (defaults to `0.0.0`), `description`, `commands`/`skills`/`hooks`/`mcpServers`, and `userConfig`.
- **Recorded but not executed**: `agents`, `channels`, `lspServers`, `outputStyles`, `settings`.
- Component paths are validated: an absolute path or one that escapes the plugin root is rejected as an invalid component path.
- **userConfig**: `type` is one of `string`, `number`, `boolean`, `directory`, or `file`, with `title`, `description`, `default`, `required`, and `sensitive`. A **sensitive value cannot currently be entered in the interface or persisted** to the configuration file.
- **marketplace.json**: `{ name, plugins[], pluginRoot?, allowCrossMarketplaceDependenciesOn? }`. Each `plugins[].source` may be a relative path string or an object of kind `directory`, `github`, `git`, `url`, or `git-subdir`; `npm` and `pip` are not supported.

## 3. Managing plugins in the client

- **Install**: on the **Discover** tab, find the plugin card and click **Get**; when done it shows **Installed**. New plugins are enabled by default.
- **Enable / disable**: on the **Installed** tab, toggle the switch on the plugin's row. Disabling removes all of its components from the session immediately.
- **Configure**: open the plugin's detail view and expand **Advanced** to fill in its configuration values (required fields are marked; sensitive fields cannot be entered here).
- **Uninstall**: from the detail view; a built-in plugin can only be disabled, not uninstalled.
- **Add a marketplace**: the **`+`** button on the Discover tab accepts a GitHub repository, a Git URL, a local directory, or a file.

## 4. Common pitfalls (symptom → cause → fix)

1. **A plugin is not listed at all** — its marketplace was never added, so there is no installation record or cache; or `plugins.enabled` is false. → Add the marketplace on the Discover tab and install it, or set `plugins.enabled: true`.
2. **Adding a marketplace or installing fails to clone** — an error such as `RPC failed`, `timed out`, or `early EOF` (after retries). The clone process did not inherit the shell proxy. → **Set `ZCODE_HTTP_PROXY=http://host:port`** (ZCode reads the proxy only from this variable; a bare `http_proxy` is ignored).
3. **Enabled but its skills or commands are missing** — a component path escapes the plugin root, the plugin is actually disabled, or it is not being treated as enabled where the session reads it. → Open the plugin's detail view to see the invalid component, and make the manifest path relative and inside the plugin root.
4. **A built-in plugin still appears after being disabled, or returns after uninstalling** — the suppression state was not applied where it was read. → Confirm the plugin id is in the suppressed-built-ins list in `~/.zcode/cli/config.json`; restoring it removes that entry and re-seeds.
5. **Not enabled as expected — listed as enabled but a skill reports "not found" in the session** — the default-enabled set was not applied along the session's discovery path even though the listing shows it enabled. → Verify the plugin's skills are actually available in the session (via **Settings → Skills** and the `/` menu), not only that the plugin shows as enabled.
6. **Manifest parse error** — the JSON is invalid, is not an object, or has a missing/invalid `name`. → Fix it into a valid object whose `name` matches the pattern.
7. **Invalid plugin name** — the name violates `^[a-z0-9][a-z0-9._-]{0,127}$`. → Rename.
8. **Unresolved or cross-marketplace dependency** — a dependency lives in another marketplace not listed in `allowCrossMarketplaceDependenciesOn`, is missing, or forms a cycle. → Add the target marketplace to `allowCrossMarketplaceDependenciesOn`, install the missing dependency's marketplace, or break the cycle. Dependencies are written as `name@marketplace`.
9. **Version shows 0.0.0 or updates are not detected** — Git/URL plugins often lack a top-level version, and official plugins track updates by commit. → Confirm the installed record and the manifest entry both carry their source revision.
10. **A sensitive configuration value cannot be set** — the field is disabled with a note that it requires secure storage. There is no secure credential store yet. → Remove `sensitive: true`, or provide the value out of band (for example via an environment variable); it cannot be persisted today.
11. **A `filesystem`/`sea` source reports "unsupported"** — a built-in plugin's cache path is missing or stale. → Re-seed the plugin (clearing its cache entry so it is re-materialized on the next launch).

## 5. Localization workflow (in order)

1. **Is the subsystem on?** Check `plugins.enabled` (false means everything is empty).
2. **Look at the plugin.** On the **Installed** tab, confirm whether the plugin is present and enabled; open its detail view for its source, components, and any warnings.
3. **Classify by presence.** Entirely absent → a marketplace or installation problem (confirm the marketplace was added and the plugin installed). Present but disabled → check the enable state against the default. Present and enabled but broken at runtime → a component-path problem (pitfall 3) or a session-versus-listing divergence (pitfall 5).
4. **Built-in issues.** Compare the suppressed-built-ins list against what the official marketplace offers, and confirm the plugin cache is current.
5. **Installation and network.** Reproduce the clone with the proxy set, confirming `ZCODE_HTTP_PROXY`, and look for the retryable-error signatures.
6. **Session-versus-listing divergence.** If the plugin shows enabled but its capabilities are absent in the session, treat it as a discovery-path problem: confirm the plugin's skills and commands actually appear in the session (Settings → Skills, the `/` menu), not merely that the plugin is enabled.
