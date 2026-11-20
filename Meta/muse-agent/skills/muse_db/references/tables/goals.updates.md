# `goals.updates`

Dated updates to goal descriptions and progress.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `update_id` uses `text` and is required.

  Local row identifier (primary key).

- `goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `title` uses `text` and is nullable.

- `summary` uses `text` and is nullable.

- `description` uses `text` and is nullable.

- `effective_at` uses `text` and is nullable.

- `created_at` uses `text` and is required.

- `updated_at` uses `text` and is required.

- `effective_at_ts` uses `timestamp with time zone` and is nullable.

- `updated_at_ts` uses `timestamp with time zone` and is nullable.

- `author_source` uses `text` and is required.

  Default: `'user'::text`.

- `research_output_fingerprint` uses `text` and is nullable.

- `research_output_through` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- FOREIGN KEY `updates_goal_id_fkey` covers `goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `updates_pkey` covers `update_id`.
