# Asana

- Asana holds a team's projects and tasks. Run `/opt/hatch/bin/asana`, which calls Asana's official MCP server with the account the user connects through Muse.

## Connect

- Run `status`. If it reports `not_connected`, run `authorize-url` and share only the returned `connect_url`. Never ask for tokens or credentials in chat.
- Never build an authorization link or add Asana API scopes yourself, because Asana rejects ordinary API scopes for this connection.

```text
/opt/hatch/bin/asana status
/opt/hatch/bin/asana authorize-url
```

## Select an account

Asana authorizes one workspace per grant. Run `accounts` before accessing
connected workspace data. Treat every `account_id` as opaque and use its
workspace `display_name` to select the workspace the user requested. When
entries are ambiguous, inspect each workspace with `get_user` and ask the user
which one they mean. Carry the selected `--account` through every following
`status`, `refresh`, `list-tools`, and `call-tool` command for that task. Never
silently fall back to another account.

```text
/opt/hatch/bin/asana accounts
/opt/hatch/bin/asana status --account <account-id>
/opt/hatch/bin/asana call-tool --account <account-id> --name get_user --arguments-json '{"user_id":"me","opt_fields":"workspaces.gid,workspaces.name"}'
```

If the selected account fails authentication, run `accounts` again. For an
entry marked `needs_reauth`, run `status` without `--account`: share its
`add_account_url` as “Add account” if another workspace is connected, or its
`connect_url` if none are. If no link is available, direct the user to add the
account in Settings. After reconnection, list accounts again and pick the
healthy entry for the intended workspace before retrying, because a stale
`needs_reauth` row can remain beside it. If its ID changed, tell the user and
use the new ID; ask before switching when the workspace remains ambiguous.
Never retry the old `needs_reauth` ID.

To remove one account, healthy or stale, direct the user to that account under
Connectors → Asana in Settings. To disconnect Asana entirely, run `disconnect`
and share `[Disconnect Asana](<disconnect_url>)`. Confirming there removes every
account, so don't say it's disconnected yet. No `disconnect_url` means Asana is
not connected.

## Find and call a tool

- Run `list-tools` for the reviewed tools and their live input schemas, with each tool's `hatch_action` showing whether Muse treats it as a read or a write. Unknown or new provider tools stay unavailable until they are reviewed.

- Build `--arguments-json` as one JSON object from that schema, and never guess a tool name or required field. Follow the returned pagination fields to read more.

```text
/opt/hatch/bin/asana list-tools --account <account-id>
/opt/hatch/bin/asana call-tool --account <account-id> --name <tool> --arguments-json '<json-object>'
```

- The reviewed tools search the workspace and read tasks, projects, portfolios, status overviews, users and teams. They also create, update and delete tasks, add comments, and create projects and project status updates.

## Work with tasks

- Resolve the workspace and project before changing a task, and use the IDs and required fields from the schema.

- Task attachments cannot be read through this connector.

## Check the result

- Reads follow the user's connector settings, and each change asks for approval as those settings require.

- Never retry a failed or timed-out write automatically. Read the task or project first, because Asana may already have made the change.

## Related skills

- [Task Management](/opt/muse/skills/task-management/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
