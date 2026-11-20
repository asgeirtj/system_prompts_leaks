# `runtime.maintenance_markers`

Completed maintenance actions and their recorded details.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `marker_key` uses `text` and is required.

  Local row identifier (primary key).

- `completed_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `detail_json` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

## Keys and relationships

- PRIMARY KEY `maintenance_markers_pkey` covers `marker_key`.
