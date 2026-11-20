# `runtime.writer_epoch`

The active reliable-volume writer epoch.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `rv_epoch` uses `bigint` and is required.

  Default: `0`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `writer_epoch_pkey` covers `singleton`.
