---
name: "google_tasks"
description: "Manage the user's Google Tasks: lists, task details, creation, updates, and completion."
icon: "google_tasks"
metadata: { "includeInPrompt": false }
---

# Google Tasks

Everything runs through `hatch_gws_cli tasks <resource> <method>`. The two resources are `tasklists` and `tasks`, so a task command names `tasks` twice — `hatch_gws_cli tasks tasks list` (service `tasks`, resource `tasks`, method `list`). Parameters go in a `--params` JSON object, and creates and edits add a `--json` request body. The flows below give the exact command for each job, so use them verbatim; run `hatch_gws_cli tasks <resource> --help` for a command's flags, and `hatch_gws_cli schema tasks.tasks.insert` (and so on) for a method's `--params`/`--json` shape.

A task's `due` is a date given as an RFC3339 timestamp like `2026-04-16T00:00:00Z`, but Google Tasks uses only the date — there is no time of day and no reminders. The default task list is `@default`.

## Connecting
Tasks needs a one-time connect before commands return data. Run `hatch_gws_cli tasks status`. If it is not connected, post the exact `connect_url` it returns as `[Connect Google Tasks](<connect_url>)` and wait for the user to tap it. Don't invent a URL, send the user to Settings, or ask for credentials.

To disconnect, run `hatch_gws_cli tasks disconnect` and post its `disconnect_url` as `[Disconnect Google Tasks](<disconnect_url>)`.

If a command reports an auth failure or not-connected, rerun `status` and follow the link it returns. If status is unavailable, say Google Tasks isn't available on this device and stop. Auth flows only through `status` and `disconnect`, with no hand-authored credential files or raw `gws auth`.

## Common flows

### See your lists and tasks
- Your to-do lists: `hatch_gws_cli tasks tasklists list`. Use when the user asks what lists they have or wants to target one by name.
- Open tasks on a list: `hatch_gws_cli tasks tasks list --params '{"tasklist":"@default","showCompleted":false}'`. Use `@default` unless the user named a list (resolve its ID with `hatch_gws_cli tasks tasklists list` first). To include finished tasks, set `"showCompleted":true,"showHidden":true` (completed tasks drop off the default view over time).
- Tasks due in a window: `hatch_gws_cli tasks tasks list --params '{"tasklist":"@default","dueMin":"<start>","dueMax":"<end>"}'` (RFC3339) — use for "what's due this week".
- One task's full detail or its ID before editing: `hatch_gws_cli tasks tasks get --params '{"tasklist":"@default","task":"<id>"}'`.

### Add a task
`hatch_gws_cli tasks tasks insert --params '{"tasklist":"@default"}' --json '{"title":"Buy groceries","notes":"Milk, eggs","due":"<date>"}'`. Only `title` is required; add `notes` and a `due` date when the user gives them.

### Complete or reopen a task
- Mark done: `hatch_gws_cli tasks tasks patch --params '{"tasklist":"@default","task":"<id>"}' --json '{"status":"completed"}'`.
- Reopen: the same with `'{"status":"needsAction"}'`.

### Edit or reschedule a task
`hatch_gws_cli tasks tasks patch --params '{"tasklist":"@default","task":"<id>"}' --json '{"title":"...","due":"<date>"}'`. Patch only the fields that change.

### Organize
- Move, nest as a subtask, or reorder: `hatch_gws_cli tasks tasks move --params '{"tasklist":"@default","task":"<id>","parent":"<parent-id>","previous":"<sibling-id>"}'` — omit `parent` for top level, omit `previous` to move to the top.
- Manage lists: `hatch_gws_cli tasks tasklists insert --json '{"title":"Work"}'`, `hatch_gws_cli tasks tasklists patch --params '{"tasklist":"<id>"}' --json '{"title":"..."}'`, `hatch_gws_cli tasks tasklists delete --params '{"tasklist":"<id>"}'`.

### Delete or clear
- Delete one task: `hatch_gws_cli tasks tasks delete --params '{"tasklist":"@default","task":"<id>"}'`.
- Hide completed tasks from a list's normal view (they stay retrievable with `showHidden`, not deleted): `hatch_gws_cli tasks tasks clear --params '{"tasklist":"@default"}'`.

Carry the tasklist ID and task ID from the read that found the item straight through the write, and use them exactly. `@default` is only the default when the user has not pointed at a specific list; once a read locates a task on some list, target that same list for the update, complete, move, or delete — never fall back to `@default`. Never invent or rewrite a task or list ID.

## Rules
- Task and task-list writes may proceed from a clear, unambiguous user request without an additional confirmation. Resolve the exact task and list before editing, moving, completing, or deleting.
- Talk to the user in plain language only. The commands and their JSON output are for you, not the user: keep them out of your replies — no command or flag (`hatch_gws_cli`, `--params`), no status word (`not_connected`, `unavailable`), no task or list id, no API field (`etag`, `updated`, page tokens), and no raw JSON. Say "your to-do list" or name a task by its title. A task's own content is not an id: its title, notes, and due date are what the user asked for, so keep those in your reply.
- Get due dates right against the current date and the user's timezone; report them as plain dates.
- `due` remains a date-only value. For actual instants, prefer the added
  `task_record_updated_at` and `task_completed_at` UTC/user-local fields.
- Never print tokens, secrets, or credential material. Redact them if they appear in tool output.

## Limits
- Tasks are date-based only: a `due` date carries no time of day, and Google Tasks sends no reminders or notifications — don't promise a specific time or an alert. If the user wants a timed reminder, suggest Google Calendar instead.
- Tasks are personal to the connected account: no sharing a list, no assigning a task to someone else, no attachments.
