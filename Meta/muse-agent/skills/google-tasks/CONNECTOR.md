# Google Tasks

- Google Tasks holds simple to-do lists in the user's Google account. Run `/opt/hatch/bin/hatch_gws_cli tasks <resource> <method>`. The resources are `tasklists` and `tasks`, so a task command names `tasks` twice, as in `hatch_gws_cli tasks tasks list`.

- Pass query and path values as a `--params` JSON object and request bodies as `--json`. The commands below cover the usual jobs. For anything else, read `/opt/hatch/bin/hatch_gws_cli tasks <resource> --help` or a method's shape with `/opt/hatch/bin/hatch_gws_cli schema tasks.tasks.insert`.

## Connect

- Run `/opt/hatch/bin/hatch_gws_cli tasks status`. If it is not connected, post the exact returned `connect_url` as `[Connect Google Tasks](<connect_url>)` and wait for the user to tap it. Never invent a URL, send the user to Settings or ask for credentials.

- If a command reports an auth failure or says it is not connected, run `status` again and follow the link it returns. If `status` itself fails, say Google Tasks is not available on this device and stop.

- To disconnect, run `tasks disconnect` and post its `disconnect_url` as `[Disconnect Google Tasks](<disconnect_url>)`. Authentication runs only through `status` and `disconnect`, never through hand-written credential files or raw `gws auth`.

## Read lists and tasks

- The default list is `@default`. Use it only until the user names a list, and resolve that list's ID with `tasklists list`.

```sh
/opt/hatch/bin/hatch_gws_cli tasks tasklists list
/opt/hatch/bin/hatch_gws_cli tasks tasks list --params '{"tasklist":"@default","showCompleted":false}'
/opt/hatch/bin/hatch_gws_cli tasks tasks list --params '{"tasklist":"@default","dueMin":"<start>","dueMax":"<end>"}'
/opt/hatch/bin/hatch_gws_cli tasks tasks get --params '{"tasklist":"<list_id>","task":"<task_id>"}'
```

- To include finished tasks, set both `"showCompleted":true` and `"showHidden":true`, because completed tasks drop off the default view over time. Use RFC3339 `dueMin` and `dueMax` for a window such as this week, and keep page tokens when results continue.

## Change tasks and lists

- Create a task with `tasks insert`. Only `title` is required, so add `notes` and a `due` date when the user gives them.

- Use `tasks patch` with only the fields that change. Set `status` to `completed` to finish a task or to `needsAction` to reopen it.

- Use `tasks move` with `parent` to nest a task as a subtask and `previous` to place it after a sibling. Omit `parent` for the top level and `previous` to move it first.

```sh
/opt/hatch/bin/hatch_gws_cli tasks tasks insert --params '{"tasklist":"@default"}' --json '{"title":"Buy groceries","notes":"Milk, eggs","due":"<date>"}'
/opt/hatch/bin/hatch_gws_cli tasks tasks patch --params '{"tasklist":"<list_id>","task":"<task_id>"}' --json '{"status":"completed"}'
/opt/hatch/bin/hatch_gws_cli tasks tasks move --params '{"tasklist":"<list_id>","task":"<task_id>","parent":"<parent_id>","previous":"<sibling_id>"}'
/opt/hatch/bin/hatch_gws_cli tasks tasklists insert --json '{"title":"Work"}'
/opt/hatch/bin/hatch_gws_cli tasks tasklists patch --params '{"tasklist":"<list_id>"}' --json '{"title":"Home"}'
/opt/hatch/bin/hatch_gws_cli tasks tasklists delete --params '{"tasklist":"<list_id>"}'
```

- Manage lists with `tasklists insert`, `tasklists patch` and `tasklists delete`.

- `tasks delete` removes one task. `tasks clear` hides a list's completed tasks from the normal view, where `showHidden` still finds them, so it is not a deletion.

```sh
/opt/hatch/bin/hatch_gws_cli tasks tasks delete --params '{"tasklist":"<list_id>","task":"<task_id>"}'
/opt/hatch/bin/hatch_gws_cli tasks tasks clear --params '{"tasklist":"<list_id>"}'
```

- Carry the list ID and task ID from the read that found the task straight into the write, and use them exactly. Once a read places a task on a list, change it on that same list and never fall back to `@default`. Never invent or rewrite an ID.

- Create, edit, complete and move tasks from a clear, unambiguous request without asking again. Confirm exactly which task or list before deleting it or clearing completed tasks.

- When the named task does not exist, say so and stop, rather than acting on a different one.

## Dates and limits

- `due` is a date sent as an RFC3339 timestamp such as `2026-04-16T00:00:00Z`, and Google Tasks keeps only the date. Check due dates against the current date and the user's timezone, and report them as plain dates.

- `task_record_updated_at` and `task_completed_at` give real instants in UTC and the user's local time. Keep them distinct from the due date.

- Google Tasks has no time of day and sends no reminders or notifications, so never promise a time or an alert. For a timed reminder, suggest a Google Calendar event or a reminder from Muse instead.

- Tasks are personal to the connected account. Lists cannot be shared, tasks cannot be assigned to someone else, and there are no attachments.

## Talk about results plainly

- Keep commands, flags, status words such as `not_connected`, task and list IDs, API fields such as `etag` and page tokens, and raw JSON out of replies. Say "your to-do list" or name a task by its title, and keep the task's own title, notes and due date in the reply.

- Never print tokens, secrets or credential material, and redact them if they appear in output.

## Related skills

- [Grocery and Food Delivery](/opt/muse/skills/groceries/SKILL.md)

- [Task Management](/opt/muse/skills/task-management/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
