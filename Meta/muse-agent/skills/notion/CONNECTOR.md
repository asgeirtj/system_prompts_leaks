# Notion

- Notion holds the user's pages, notes and databases. Run `/opt/hatch/bin/notion-cli`, which calls Notion's hosted MCP server.

## Connect

- Run `status` before any other work. If it reports `not_connected`, run `authorize-url` and share exactly `[Connect Notion](<connect_url>)`, without the raw URL, then wait for the user to finish. Never ask for tokens in chat or edit the stored credentials.

- After the user authorizes, the sign-in completes on its own. Run `status` again, and once it reports `connected`, its output also lists the available tools.

- If the sign-in does not complete on its own and the user has an authorization code, finish it with `exchange-code --code CODE`.

- A 401 triggers an automatic token refresh. If calls keep failing with `unauthorized`, run `refresh` or ask the user to authorize again. Run `disconnect` only when the user asks to disconnect.

```text
/opt/hatch/bin/notion-cli status
/opt/hatch/bin/notion-cli authorize-url
/opt/hatch/bin/notion-cli refresh
```

## Find and call a tool

- Run `list-tools` before `call-tool` unless you already know the tool and its argument shape, and never guess a tool name. Use the returned name and `input_schema`.

- `--arguments-json` must be one JSON object, and arrays or bare values are rejected.

```text
/opt/hatch/bin/notion-cli list-tools
/opt/hatch/bin/notion-cli call-tool --name <tool> --arguments-json '<json-object>'
```

- `notion-search` finds pages and returns titles and links, and `notion-fetch` reads a page. Pages, folders, databases and views have their own create and update tools, and comments and attachments have create tools.

- When the user has set page content access to ask or deny, searches that return page content, such as `notion-ai-search` and the data source queries, are refused. Plain `notion-search` still returns titles and links.

## Read or edit the workspace

- Find the page or database and read its current structure before changing it. Use the IDs, pagination fields and update format from the schema.

- Confirm the user's intent before changing pages, databases or blocks. Each change also asks for approval as the user's connector settings require.

- After an uncertain write, read the target before trying again, because Notion may already have made the change.

- Read results keep Notion's raw dates and add UTC and local forms for creation and edit times and for timed properties. Date-only properties stay dates and must not be read as UTC instants.

## Related skills

- [Meeting Notes and Follow-ups](/opt/muse/skills/meeting-follow-up/SKILL.md)

- [Notes](/opt/muse/skills/knowledge-organization/SKILL.md)

- [Task Management](/opt/muse/skills/task-management/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
