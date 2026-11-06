# `goals.learning_state`

Learning-goal prerequisites, mastery evidence and misconceptions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `target_skill` uses `text` and is nullable.

- `prerequisites` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `mastery_estimate` uses `double precision` and is nullable.

- `mastery_evidence` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `misconceptions` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `last_retrieval_at` uses `timestamp with time zone` and is nullable.

- `next_review_at` uses `timestamp with time zone` and is nullable.

- `confidence` uses `double precision` and is nullable.

- `transfer_status` uses `text` and is nullable.

- `study_status` uses `text` and is required.

  Default: `'queued'::text`.

- `last_studied_at` uses `timestamp with time zone` and is nullable.

- `updated_at_ts` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `learning_state_goal_id_fkey` covers `goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `learning_state_pkey` covers `goal_id`.
