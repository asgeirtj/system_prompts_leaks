# `self_improvement.backfill_day_runs`

Per-day historical processing runs for an improvement objective.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `backfill_day_run_id` uses `text` and is required.

  Local row identifier (primary key).

- `objective_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `self_improvement.handoff_dedupe.objective_id`, `self_improvement.objective_markers.objective_id`, `self_improvement.objective_state.objective_id`.

- `day` uses `date` and is required.

- `run_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `self_improvement.runs.run_id`.

- `request_id` uses `text` and is required.

  Soft local reference → `runtime.requests.request_id`.

- `replay_hash` uses `text` and is required.

- `status` uses `text` and is required.

  Default: `'pending'::text`.

- `diagnostics` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `started_at` uses `timestamp with time zone` and is nullable.

- `finished_at` uses `timestamp with time zone` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `backfill_day_runs_pkey` covers `backfill_day_run_id`.
