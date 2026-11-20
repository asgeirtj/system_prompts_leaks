# `self_improvement.leases`

Leases for improvement work and their current ownership.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `lease_key` uses `text` and is required.

  Local row identifier (primary key).

- `owner` uses `text` and is required.

- `objective_id` uses `text` and is nullable.

  Potential local reference; resolve by domain context in: `self_improvement.handoff_dedupe.objective_id`, `self_improvement.objective_markers.objective_id`, `self_improvement.objective_state.objective_id`.

- `run_id` uses `text` and is nullable.

  FK → `self_improvement.runs.run_id`

- `acquired_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `expires_at` uses `timestamp with time zone` and is required.

- `heartbeat_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `metadata` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

## Keys and relationships

- FOREIGN KEY `leases_run_id_fkey` covers `run_id`. References [self_improvement.runs](/opt/muse/skills/muse_db/references/tables/self_improvement.runs.md), columns `run_id`.

- PRIMARY KEY `leases_pkey` covers `lease_key`.
