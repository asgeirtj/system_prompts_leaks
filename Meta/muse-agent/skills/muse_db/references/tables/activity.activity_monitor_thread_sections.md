# `activity.activity_monitor_thread_sections`

Titles, state and ordering of sections within activity threads.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `activity_thread_id` uses `text` and is required.

  FK → `activity.activity_monitor_threads.activity_thread_id`

- `section_key` uses `text` and is required.

  Local row identifier (primary key).

- `title` uses `text` and is required.

- `status` uses `text` and is required.

- `section_order` uses `integer` and is nullable.

- `section_depth` uses `integer` and is nullable.

- `parent_section_key` uses `text` and is nullable.

- `ordinal_label` uses `text` and is nullable.

- `created_at` uses `text` and is required.

- `updated_at` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `activity_monitor_thread_sections_goal_id_fkey` covers `activity_thread_id`. References [activity.activity_monitor_threads](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_threads.md), columns `activity_thread_id`.

- PRIMARY KEY `activity_monitor_thread_sections_pkey` covers `activity_thread_id`, `section_key`.
