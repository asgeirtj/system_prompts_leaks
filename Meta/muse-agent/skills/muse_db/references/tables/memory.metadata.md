# `memory.metadata`

Memory subsystem metadata and update times.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `key` uses `text` and is required.

  Local row identifier (primary key).

- `value` uses `text` and is required.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `metadata_pkey` covers `key`.
