# `activity.feed_entries`

Activity entries shown for work, messages and goals.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `activity_key` uses `text` and is required.

  Local row identifier (primary key).

- `activity_type` uses `text` and is required.

- `is_goal` uses `boolean` and is required.

  Default: `false`.

- `message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `title` uses `text` and is nullable.

- `status_title` uses `text` and is nullable.

- `subtitle` uses `text` and is nullable.

- `details_json` uses `text` and is nullable.

- `status` uses `text` and is required.

- `task_label` uses `text` and is nullable.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

- `finished_at_ms` uses `bigint` and is nullable.

- `created_at` uses `timestamp with time zone` and is nullable.

- `updated_at` uses `timestamp with time zone` and is nullable.

- `finished_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- PRIMARY KEY `feed_entries_pkey` covers `activity_key`.
