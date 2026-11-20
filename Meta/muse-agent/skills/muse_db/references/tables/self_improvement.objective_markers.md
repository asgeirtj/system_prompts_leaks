# `self_improvement.objective_markers`

Named progress markers for improvement objectives.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `objective_id` uses `text` and is required.

  Local row identifier (primary key).

- `marker` uses `text` and is required.

  Local row identifier (primary key).

- `set_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `objective_markers_pkey` covers `objective_id`, `marker`.
