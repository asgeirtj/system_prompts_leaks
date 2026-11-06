# `self_improvement.objective_state`

Current improvement objective state and source revisions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `objective_id` uses `text` and is required.

  Local row identifier (primary key).

- `current_file_hash` uses `text` and is nullable.

- `projection_hash` uses `text` and is nullable.

- `status` uses `text` and is required.

- `last_run_utc` uses `timestamp with time zone` and is nullable.

- `state_json` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `objective_state_pkey` covers `objective_id`.
