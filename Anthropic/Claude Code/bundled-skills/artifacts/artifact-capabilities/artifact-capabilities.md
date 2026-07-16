---
name: artifact-capabilities
description: Runtime capabilities a published Artifact can declare — calling the user's claude.ai connectors (MCP) from the page, and future abilities. Load this BEFORE passing `capabilities` to the Artifact tool or writing any `window.claude.mcp` code.
---

# Artifact runtime capabilities

A published Artifact page can declare **runtime capabilities** — abilities the claude.ai viewer grants the page at open time — by passing `capabilities: {name: config}` to the Artifact tool. The control plane is the authority on valid names and config shapes. Declaration gestures: **omitting** `capabilities` on a redeploy carries the stored declaration forward unchanged (and preserves the artifact's stored contract pin); an **empty object** `{}` is the explicit clear-all; a **non-empty object** is a full-set declaration (anything stored but not restated is revoked). Moving a republished artifact's runtime version is a deliberate gesture — pass `contract: 'latest'` to upgrade, or a specific version to pin or roll back — never a side effect of editing.

Runtime contract 0.1.12


--- capability: downloads ---

The `downloads` capability lets a published page offer a generated file to the viewer: declare `capabilities: {downloads: true}`, then call `window.claude.downloads.save({filename, data})`. The viewer sees a confirmation and may decline — a save is never silent or guaranteed, so offer it on explicit viewer intent and handle rejection. Check `window.claude.downloads` exists before first use; the type definitions are authoritative for the call contract and error codes.


--- capability: mcp ---

`mcp` lets a published page call the viewer's claude.ai connectors via `window.claude.mcp`; calls run with the viewer's credentials, never exposing tokens. Declare `capabilities: {mcp: {servers: [{server, tools}]}}` — `server` is a connector's display name. Keep the manifest minimal: it is a viewer-consented grant, and a declaring page cannot be shared publicly. Two arms: a section DISPLAYING data registers `watchTool(server, tool, input, handler, opts?)` — replays cache, refreshes when stale, polls only via `refetchInterval`, returns a sync unsubscribe to store; an ACTION calls `callTool` once and reads `result.payload`. Tool failures REJECT (`tool_error`); watch failures arrive as handler error events. Read the type definitions first: branch UX per error code, retry only `retryable` errors, drop data on authz denials, drive freshness UI from `result.cache.storedAt`. They omit argument names and result encoding: observe a real request/response pair per tool, or say so at publish — never guess.


**Your connectors this session.** Connector tools appear in your tool list as `mcp__<connector>__<toolName>`. Set `server` to the `<connector>` segment — everything between `mcp__` and the next `__` (for `mcp__claude_ai_Slack_beta__search`, the `server` is `claude_ai_Slack_beta`). Copy the segment exactly, case included; when publishing, it is resolved to the connector's display name automatically. Only claude.ai connectors are valid — locally-configured MCP servers are not. The manifest's `tools` array takes the connector's upstream tool names (as returned by `listTools()` / `/v1/mcp_servers`), which can differ from the normalized `<toolName>` segment when an upstream name contains `.` or spaces. In hermetic/CI sessions where connectors aren't loaded but `$CLAUDE_CODE_OAUTH_TOKEN` is set, fetch the list via Bash: `curl -H 'anthropic-version: 2023-06-01' -H 'anthropic-beta: mcp-servers-2025-12-04' -H "Authorization: Bearer $CLAUDE_CODE_OAUTH_TOKEN" https://api.anthropic.com/v1/mcp_servers?limit=1000`; in that case use each entry's `display_name` as the `server` value (exact display names are always accepted alongside tool-prefix segments).

**Call contract** (runtime contract 0.1.12). The platform-served `window.claude` type definitions for this contract are extracted under `<skill-dir>`: `0.1.12/downloads.d.ts`, `0.1.12/mcp.d.ts`. Read `<skill-dir>/0.1.12/mcp.d.ts` before writing any `window.claude.mcp` call — it is authoritative for this contract version over any remembered API shape. The type definitions cover only the call envelope — they do not tell you a connector tool's argument names or its result encoding. Never publish a page that calls a connector tool without having observed one real request/response pair for that tool in this session; if you cannot safely observe one (for example, the connector is unauthenticated here, or calling the tool would have side effects), say that explicitly to the user at publish time — in your reply, not as a note inside the published page — instead of shipping a guessed shape. Observed response payloads are the user's real data: learn the shape from them, but never embed the observed values in the published page as sample or placeholder data.
