# `self_improvement.calibration_records`

Recorded calibration assessments over an evidence window.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `calibration_id` uses `text` and is required.

  Local row identifier (primary key).

- `card_id` uses `text` and is required.

  Code-defined self-improvement measurement card key; no owner table.

- `objective_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `self_improvement.handoff_dedupe.objective_id`, `self_improvement.objective_markers.objective_id`, `self_improvement.objective_state.objective_id`.

- `change_id` uses `text` and is required.

  Measured change identifier supplied by the objective; no owner table.

- `classification` uses `text` and is required.

- `window_start` uses `timestamp with time zone` and is nullable.

- `window_end` uses `timestamp with time zone` and is nullable.

- `source_handles` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `diagnostics` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `calibration_records_pkey` covers `calibration_id`.
