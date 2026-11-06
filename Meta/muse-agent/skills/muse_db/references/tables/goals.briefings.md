# `goals.briefings`

Goal briefing locations and opening timestamps.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `briefing_id` uses `text` and is required.

  Local row identifier (primary key).

- `goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `path` uses `text` and is required.

- `created_at` uses `text` and is required.

- `updated_at` uses `text` and is required.

- `last_opened_at` uses `text` and is nullable.

- `created_at_ts` uses `timestamp with time zone` and is nullable.

- `updated_at_ts` uses `timestamp with time zone` and is nullable.

- `last_opened_at_ts` uses `timestamp with time zone` and is nullable.

- `hero_image_path` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `briefings_goal_id_fkey` covers `goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `briefings_pkey` covers `briefing_id`.

- UNIQUE `briefings_goal_id_path_key` covers `goal_id`, `path`.
