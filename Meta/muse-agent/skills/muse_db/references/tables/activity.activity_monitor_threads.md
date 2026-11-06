# `activity.activity_monitor_threads`

Activity thread identity, presentation and current state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `activity_thread_id` uses `text` and is required.

  Local row identifier (primary key).

- `name` uses `text` and is required.

- `subtitle` uses `text` and is required.

- `status_title` uses `text` and is nullable.

- `icon` uses `text` and is required.

- `emoji` uses `text` and is nullable.

- `activity_thread_kind` uses `text` and is nullable.

- `space_slug` uses `text` and is nullable.

- `expected_finish_description` uses `text` and is nullable.

- `status` uses `text` and is required.

- `finish_status` uses `text` and is nullable.

- `finish_status_reason` uses `text` and is nullable.

- `created_at` uses `text` and is required.

- `finished_at` uses `text` and is nullable.

- `finish_message` uses `text` and is nullable.

- `artifact_slug` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `activity_monitor_threads_pkey` covers `activity_thread_id`.
