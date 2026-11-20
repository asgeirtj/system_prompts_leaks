# `activity.activity_monitor_runtime_work_threads`

Links durable runtime work to activity threads.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `work_id` uses `text` and is required.

  Local row identifier (primary key).

- `activity_thread_id` uses `text` and is required.

  FK → `activity.activity_monitor_threads.activity_thread_id`

- `created_at` uses `text` and is required.

- `updated_at` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `activity_monitor_runtime_work_threads_goal_id_fkey` covers `activity_thread_id`. References [activity.activity_monitor_threads](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_threads.md), columns `activity_thread_id`.

- PRIMARY KEY `activity_monitor_runtime_work_threads_pkey` covers `work_id`.
