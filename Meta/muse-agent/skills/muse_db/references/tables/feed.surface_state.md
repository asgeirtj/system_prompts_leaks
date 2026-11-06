# `feed.surface_state`

Feed surface initialization and fetch state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `first_fetched_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `surface_state_pkey` covers `singleton`.
