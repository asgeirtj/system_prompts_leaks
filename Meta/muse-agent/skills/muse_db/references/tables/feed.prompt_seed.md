# `feed.prompt_seed`

Completion marker for initial Feed prompt seeding.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `seeded_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `prompt_seed_pkey` covers `singleton`.
