# OpenAI Developers Plugin

This plugin is the Codex-facing bundle for OpenAI developer workflows. It pairs OpenAI Platform workflows with Codex's native OpenAI docs skill guidance so users can build AI applications and agents, then connect those projects to `platform.openai.com`.

## What Is Included

- `.codex-plugin/plugin.json` declares the Codex plugin metadata and user-facing `OpenAI Developers` brand.
- `.app.json` exposes the `openai-platform` app connector used to work with the OpenAI Platform.
- `.mcp.json` and `mcp/server.mjs` provide an editable local destination confirmation form for the API-key setup flow.
- `skills/openai-platform-api-key/` handles encrypted API-key creation and local project setup; its preferred flow uses the OpenAI Platform connector-owned picker for the key name, organization, and project, then requests local confirmation of the env-file destination before writing locally.
- `skills/openai-api-troubleshooting/` classifies common runtime API failures and routes users to the right next step.
- `skills/devday-guide/` answers DevDay questions and helps plan sessions using official public sources, with a bundled 2026 attendee reference for onsite logistics. It complements the existing sidebar without adding another agenda, notes, or tools to read or change saved sessions.
- `assets/logo.png` is intentionally shared by both the plugin tile and the bundled OpenAI Platform app tile.
- `skills/agents/` builds and verifies Agents API apps with OpenAI-hosted sandboxes by default, and supports self-hosted sandboxes and Agents SDK workflows when requested. It replaces the `agents-sdk` skill; invoke it as `$agents`. Agents API use requires project access.

## Local Validation

```bash
node --test plugins/openai-developers/tests/openai-platform-api-key.test.mjs
cloud-plugin-admin validate-plugin-for-release plugins/openai-developers
cloud-plugin-admin catalog validate marketplace.json
```
