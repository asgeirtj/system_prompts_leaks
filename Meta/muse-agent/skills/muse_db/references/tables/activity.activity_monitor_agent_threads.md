# `activity.activity_monitor_agent_threads`

Links agents to their activity threads.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `agent_id` uses `text` and is required.

  Local row identifier (primary key).

- `activity_thread_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `activity.activity_monitor_thread_sections.activity_thread_id`, `activity.activity_monitor_threads.activity_thread_id`.

- `created_at` uses `text` and is required.

- `updated_at` uses `text` and is required.

## Keys and relationships

- PRIMARY KEY `activity_monitor_agent_threads_pkey` covers `agent_id`.
