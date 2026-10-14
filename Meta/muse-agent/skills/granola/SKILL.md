---
name: "granola"
description: "Search and read Granola meeting notes and transcripts through Granola's OAuth-backed MCP server."
icon: "granola"
metadata: { "includeInPrompt": false }
---

# Granola

## Purpose
Search Granola meeting notes, summaries, and transcripts through the hosted  
Granola MCP server (`https://mcp.granola.ai/mcp`).

## Tooling
Use `exec` to run:

```sh
granola-cli <subcommand> [options]
```

### Connection management

```sh
granola-cli status
granola-cli authorize-url
granola-cli exchange-code --code <code> [--redirect-uri <url>]
granola-cli refresh
granola-cli disconnect
```

### MCP operations

```sh
granola-cli list-tools
granola-cli call-tool --name <tool> --arguments-json '<json-object>'
```

`--arguments-json` must be a JSON object; arrays or scalars are rejected. Use
`list-tools` first to discover the tool catalogue and each tool's  
`input_schema`.

## Auth
OAuth is handled by authd via Dynamic Client Registration + PKCE (S256). The
credential stays behind authd; do not read or edit connector auth files.

## First-use setup flow

1. Run `granola-cli status`.
2. If status is `not_connected`, run `granola-cli authorize-url`. When
   `connect_url` is present, replace `<connect_url>` with the returned URL
   and share exactly this Markdown link: `[Connect Granola](<connect_url>)`; do not paste the raw
   URL separately. Wait for the user to complete authorization.
3. After the user authorizes, the browser is redirected via the Muse relay
   back to this VM, and authd completes the code exchange automatically. The
   agent resumes once the token lands.
4. Re-run `granola-cli status`. When status flips to `connected` the output also
   includes the discovered MCP tool catalogue.

For manual environments where the relay is not wired up, call
`granola-cli exchange-code --code <auth-code>` after receiving the code.

## Operating Rules
1. Run `granola-cli status` before any MCP work. If not `connected`, complete
   the setup flow first.
2. Call `list-tools` before `call-tool` unless you already know the tool name
   and its argument shape. Never guess tool names.
3. `arguments-json` must be a JSON object; wrap every argument appropriately.
4. Prefer `query_granola_meetings` for natural-language questions,
   `list_meetings` for metadata, `get_meetings` for known meeting IDs, and
   `get_meeting_transcript` only when the user needs verbatim detail. Use
   `get_account_info` to answer which account/workspace is connected and,
   when results come back empty, to check `mcp_note_access.scopes` — a
   workspace whose MCP access is `public`-only excludes personal notes.
   `list_meetings` defaults to the last 30 days; when it returns zero
   meetings, retry with `time_range: "custom"` plus `custom_start` and
   `custom_end` before concluding the account has no meetings, and use
   `list_meeting_folders` to see what the workspace actually holds.
5. Preserve Granola citation links in user-facing answers.
6. Do not use Granola for calendar scheduling or upcoming-event planning.
7. Token refresh happens automatically on 401. If `call-tool` keeps failing
   with `unauthorized`, run `granola-cli refresh` explicitly or ask the user to
   re-authorize.
