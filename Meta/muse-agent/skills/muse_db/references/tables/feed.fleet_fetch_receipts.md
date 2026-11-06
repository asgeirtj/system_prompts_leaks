# `feed.fleet_fetch_receipts`

Receipts for fetched shared Feed payloads.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `payload_hash` uses `text` and is required.

  Local row identifier (primary key).

- `first_fetched_at_ms` uses `bigint` and is required.

- `origin_id` uses `text` and is nullable.

  Fleet-learning origin identifier; its owner is outside this VM database.

## Keys and relationships

- PRIMARY KEY `fleet_fetch_receipts_pkey` covers `payload_hash`.
