# `feed.fleet_engagement_contributions`

Versioned local contributions to shared Feed engagement statistics.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `contribution_id` uses `text` and is required.

  Local row identifier (primary key).

- `origin_id` uses `text` and is required.

  Fleet-learning origin identifier; its owner is outside this VM database.

- `engagement_version` uses `bigint` and is required.

  Default: `0`.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `fleet_engagement_contributions_pkey` covers `contribution_id`.
