# Linear

- Linear tracks software issues, projects and cycles. Run `/opt/hatch/bin/linear`, which calls Linear's official MCP server with the account the user connects through Muse.

## Connect

- Run `status`. If it reports `not_connected`, run `authorize-url` and share only the returned `connect_url`. Never ask for tokens or credentials in chat.

- The first connection is read-only. Before a write, or after one fails for missing access, run `status --for-command PERMISSION`. For a `save_*` tool, use the matching `*.create` permission when the arguments omit `id` and `*.manage` when they include it, such as `issues.create` for a new issue.

- If the result has `scope_status: not_granted`, copy `scope_add_url` exactly onto its own line as `[Additional Linear access](<scope_add_url>)`, which renders the native access button. Wait for consent, then retry once, and never construct a scope URL yourself.

- OAuth access and Muse's approval for an action are separate, and one never replaces the other. Run `disconnect` only when the user asks, because it removes the stored connection.

```text
/opt/hatch/bin/linear status
/opt/hatch/bin/linear status --for-command issues.create
/opt/hatch/bin/linear authorize-url
```

## Find and call a tool

- Run `list-tools` for the reviewed tools, their live input schemas and each tool's `hatch_permission`, `hatch_action` and `hatch_permission_label`. For a `save_*` tool, these fields show how the presence of `id` selects the permission.

- Build `--arguments-json` as one JSON object from that schema, and never guess a tool name or required field. Follow the returned pagination fields to read more.

```text
/opt/hatch/bin/linear list-tools
/opt/hatch/bin/linear call-tool --name <tool> --arguments-json '<json-object>'
```

- The reviewed tools read issues, comments, projects, documents, teams, users, cycles, labels and statuses. `save_issue`, `save_project`, `save_comment` and `save_issue_label` create or update records, and `create_issue_label` adds a label.

- While the grant is read-only, Linear hides its write tools, so an all-read list does not mean writes are unsupported. `list-tools` then returns `additional_access` entries for those capabilities, without their schemas.

- When the user wants one of those capabilities, share its `scope_add_url` in the access link format above and wait for consent. Then run `list-tools` again for the provider's live write schema. Unknown or newly advertised tools stay unavailable until they are reviewed.

## Update the intended issue

- Resolve the team, project and issue before editing, and keep fields and relationships outside the requested change.

- Reads follow the user's connector settings, and each change asks for approval as those settings require.

- Never retry a failed or timed-out write automatically. Read the issue first, because Linear may already have made the change.

## Related skills

- [Task Management](/opt/muse/skills/task-management/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
