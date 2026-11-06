# `feed.fleet_publish_state`

Watermark of published shared Feed contributions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `published_watermark_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `fleet_publish_state_pkey` covers `singleton`.
