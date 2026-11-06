# `ideas.explore_policy`

Idea exploration policy settings and versions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `policy_id` uses `text` and is required.

  Local row identifier (primary key).

- `explore_floor` uses `integer` and is required.

- `per_domain_min` uses `integer` and is required.

- `version` uses `text` and is required.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `explore_policy_pkey` covers `policy_id`.
