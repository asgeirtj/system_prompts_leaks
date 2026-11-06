# `feed.fleet_engagement_outbox`

Queued Feed engagement counts awaiting publication.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `contribution_id` uses `text` and is required.

  Local row identifier (primary key).

- `origin_id` uses `text` and is required.

  Fleet-learning origin identifier; its owner is outside this VM database.

- `deleted_count` uses `bigint` and is required.

- `discuss_count` uses `bigint` and is required.

- `share_count` uses `bigint` and is required.

- `seed_use_count` uses `bigint` and is required.

- `mutation_version` uses `bigint` and is required.

- `attempt_count` uses `integer` and is required.

  Default: `0`.

- `next_attempt_at_ms` uses `bigint` and is required.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `fleet_engagement_outbox_pkey` covers `contribution_id`.
