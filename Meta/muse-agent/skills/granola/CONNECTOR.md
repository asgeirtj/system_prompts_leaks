# Granola

- Granola keeps notes, summaries and transcripts of the user's past meetings. Use `/opt/hatch/bin/granola-cli`, which reaches Granola's hosted MCP service at `https://mcp.granola.ai/mcp`.

- The connector only reads past notes. It cannot create or edit notes and is not for scheduling or upcoming events, which belong to a calendar connector.

## Connect

- Run `status` before any other work. When `auth_status` is `not_connected`, run `authorize-url` and share the returned `connect_url` exactly as `[Connect Granola](<connect_url>)`, then wait for the user to authorize.

- After the user authorizes, their browser returns through Muse and the sign-in completes on its own. Run `status` again, which lists the tool catalog once `auth_status` is `connected`.

- Where that return path is not available, finish with `exchange-code --code <code>` once the user has the code. Never read or edit connector authentication files.

- The token refreshes automatically after a 401. If calls keep failing with `unauthorized`, run `refresh` or ask the user to authorize again, and run `disconnect` only when they ask to remove the connection.

## Find and call a tool

```text
/opt/hatch/bin/granola-cli list-tools
/opt/hatch/bin/granola-cli call-tool --name <tool> --arguments-json '<json-object>'
```

- Run `list-tools` before `call-tool` unless you already know the tool and its arguments. Never guess a tool name.

- `--arguments-json` must be a JSON object, and arrays or bare values are rejected.

## Find meetings and notes

- Use `query_granola_meetings` for a natural-language question, `list_meetings` for meeting details, `get_meetings` for known meeting IDs and `get_meeting_transcript` only when the user needs verbatim detail.

- `get_account_info` shows which account and workspace are connected. When results come back empty, check its `mcp_note_access.scopes`, because a workspace with public-only access leaves out personal notes.

- `list_meetings` covers the last 30 days by default. When it finds nothing, try `time_range` set to `custom` with `custom_start` and `custom_end`, and check `list_meeting_folders`, before concluding the account has no such meeting.

- Keep Granola's citation links in answers to the user.

- Verification codes in results appear as a `[credential:<id>]` placeholder. Never try to recover the code.

## Related skills

- [Meeting Notes and Follow-ups](/opt/muse/skills/meeting-follow-up/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
