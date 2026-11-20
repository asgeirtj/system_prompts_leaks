# `self_improvement.runs`

Improvement runs, objective identity and processing phase.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `run_id` uses `text` and is required.

  Local row identifier (primary key).

- `objective_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `self_improvement.handoff_dedupe.objective_id`, `self_improvement.objective_markers.objective_id`, `self_improvement.objective_state.objective_id`.

- `state` uses `text` and is required.

- `request_id` uses `text` and is required.

  Soft local reference → `runtime.requests.request_id`.

- `request_origin` uses `text` and is required.

- `phase` uses `text` and is nullable.

- `subphase` uses `text` and is nullable.

- `diagnostics` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `queued_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `started_at` uses `timestamp with time zone` and is nullable.

- `finished_at` uses `timestamp with time zone` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `run_clock` uses `timestamp with time zone` and is required.

- `available_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `recovery_phase_version` uses `integer` and is nullable.

- `recovery_admitted_at` uses `timestamp with time zone` and is nullable.

- `recovery_admission_boot_id` uses `text` and is nullable.

  Daemon boot-generation identifier; no Muse PostgreSQL owner table.

## Keys and relationships

- PRIMARY KEY `runs_pkey` covers `run_id`.
