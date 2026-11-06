# Todoist

- Todoist holds the user's tasks and projects. Run `/opt/hatch/bin/todoist`, which calls Todoist's official MCP server with the account the user connects through Muse.

## Connect

- Run `status`. If it reports `not_connected`, run `authorize-url` and share only the returned `connect_url`. Never ask for tokens or credentials in chat.

- Run `disconnect` only when the user asks to disconnect, because it removes the stored connection.

```text
/opt/hatch/bin/todoist status
/opt/hatch/bin/todoist authorize-url
```

## Find and call a tool

- Run `list-tools` for the reviewed tools and their live input schemas, with each tool's `hatch_action` showing whether Muse treats it as a read or a write. Unknown or new provider tools stay unavailable until they are reviewed.

- Build `--arguments-json` as one JSON object from that schema, and never guess a tool name or required field. Follow the returned pagination fields to read more.

```text
/opt/hatch/bin/todoist list-tools
/opt/hatch/bin/todoist call-tool --name <tool> --arguments-json '<json-object>'
```

- The reviewed tools find tasks, completed tasks, comments, reminders, projects, sections, labels, filters and activity. They add, update, reschedule, assign, complete and reopen tasks, manage reminders, projects, sections, comments, labels and filters, and delete objects.

## Grant access for changes

- The first connection is read-only. Before every write or deletion, run `status --for-command PERMISSION` with the permission for that action, even when `list-tools` already shows the tool, because the list shows available operations rather than the access granted:
  - `tasks.create` to add tasks
  - `tasks.manage` to update, complete, reschedule or assign tasks, or to manage reminders
  - `projects.manage` to create or change projects and sections
  - `comments.manage` to add or update comments
  - `labels.manage` to add or update labels and filters
  - `items.delete` to delete tasks and other non-project objects
  - `projects.delete` to delete projects

```text
/opt/hatch/bin/todoist status --for-command tasks.manage
```

- If the result has `scope_status: not_granted`, copy `scope_add_url` exactly onto its own line as `[Additional Todoist access](<scope_add_url>)`, which renders the native access button. Wait for consent, then run `list-tools` again and use the newly advertised schema.

- Todoist can hide write and delete tools until access is granted, so an all-read list does not rule out a change. Never construct an access URL or substitute a raw Todoist scope. Muse's approval for the action is still needed separately.

## Confirm the result

- `delete-object` is authorized as `items.delete` when its `type` is `section`, `task`, `comment`, `label`, `filter`, `reminder` or `location_reminder`, and as `projects.delete` for any other or missing `type`. Check the object type and pass it before deleting.

- If `call-tool` returns `error_kind: additional_access_required`, nothing was sent to Todoist, so do not describe it as a failed write. Share its `scope_add_url` as above, wait for consent, run `list-tools` again, then retry once.

- Never retry any other failed or timed-out write automatically. Read the task first, because Todoist may already have made the change.

## Related skills

- [Grocery and Food Delivery](/opt/muse/skills/groceries/SKILL.md)

- [Task Management](/opt/muse/skills/task-management/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
