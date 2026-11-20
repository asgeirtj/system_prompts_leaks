# `goals.momentum_history`

Recorded goal progress assessments and adjustment recommendations.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `history_id` uses `bigint` and is required.

  Default: `nextval('goals.momentum_history_history_id_seq'::regclass)`.

  Local row identifier (primary key).

- `goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `momentum_status` uses `text` and is nullable.

- `momentum_dimensions` uses `jsonb` and is nullable.

- `adjustment_recommendation` uses `text` and is nullable.

- `source` uses `text` and is required.

- `run_id` uses `text` and is nullable.

  Producer-run correlation identifier; no single Muse PostgreSQL owner table.

- `observed_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `momentum_history_goal_id_fkey` covers `goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `momentum_history_pkey` covers `history_id`.
