# `self_improvement.learning_adoption_events`

Recorded adoption outcomes for learned guidance.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `id` uses `bigint` and is required.

  Local row identifier (primary key).

- `learning_id` uses `text` and is required.

  Learning identifier; no queryable owner table.

- `objective_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `self_improvement.handoff_dedupe.objective_id`, `self_improvement.objective_markers.objective_id`, `self_improvement.objective_state.objective_id`.

- `run_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `self_improvement.runs.run_id`.

- `outcome` uses `text` and is required.

- `detail` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `learning_adoption_events_pkey` covers `id`.
