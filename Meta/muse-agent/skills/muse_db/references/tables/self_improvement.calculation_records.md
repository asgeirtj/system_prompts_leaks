# `self_improvement.calculation_records`

Saved improvement calculations and their evidence handles.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `replay_id` uses `text` and is required.

  Local row identifier (primary key).

- `card_id` uses `text` and is required.

  Code-defined self-improvement measurement card key; no owner table.

- `objective_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `self_improvement.handoff_dedupe.objective_id`, `self_improvement.objective_markers.objective_id`, `self_improvement.objective_state.objective_id`.

- `config_hash` uses `text` and is required.

- `code_version` uses `text` and is required.

- `source_handles` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `normalized_inputs` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `formulas` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `outputs` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `calculation_records_pkey` covers `replay_id`.
