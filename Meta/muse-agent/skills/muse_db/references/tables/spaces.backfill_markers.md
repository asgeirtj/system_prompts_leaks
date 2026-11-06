# `spaces.backfill_markers`

Completed artifact backfill operations.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `marker` uses `text` and is required.

  Local row identifier (primary key).

- `completed_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `backfill_markers_pkey` covers `marker`.
