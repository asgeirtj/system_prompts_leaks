# `feed.fleet_reaction_outbox`

Queued Feed reactions and delivery retry state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `unit_id` uses `text` and is required.

  Local row identifier (primary key).

- `origin_id` uses `text` and is required.

  Fleet-learning origin identifier; its owner is outside this VM database.

- `liked` uses `boolean` and is required.

- `mutation_version` uses `bigint` and is required.

- `attempt_count` uses `integer` and is required.

  Default: `0`.

- `next_attempt_at_ms` uses `bigint` and is required.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `fleet_reaction_outbox_pkey` covers `unit_id`.
