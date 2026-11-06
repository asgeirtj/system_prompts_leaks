# `runtime.client_rendering_capabilities`

The client's declared support for presentation types.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `client_id` uses `text` and is required.

  Client installation identifier; no separate Muse PostgreSQL owner table.

- `platform` uses `text` and is required.

- `supported_presentations` uses `text[]` and is required.

  Default: `'{}'::text[]`.

- `supported_inline_presentations` uses `text[]` and is required.

  Default: `'{}'::text[]`.

- `declared_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `client_rendering_capabilities_pkey` covers `singleton`.
