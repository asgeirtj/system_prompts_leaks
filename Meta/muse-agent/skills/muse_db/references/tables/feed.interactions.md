# `feed.interactions`

User interactions recorded against Feed units.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `interaction_id` uses `text` and is required.

  Local row identifier (primary key).

- `unit_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `feed.fleet_reaction_outbox.unit_id`, `feed.promptless_unit_orders.unit_id`, `feed.units.unit_id`.

- `kind` uses `text` and is required.

- `value` uses `text` and is nullable.

- `created_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `interactions_pkey` covers `interaction_id`.
