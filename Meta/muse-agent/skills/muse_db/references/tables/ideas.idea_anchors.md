# `ideas.idea_anchors`

Links between ideas and the product entities that represent them.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `anchor_kind` uses `text` and is required.

  Local row identifier (primary key).

- `anchor_id` uses `text` and is required.

  Local row identifier (primary key).

- `lifecycle_status` uses `text` and is required.

  Default: `'candidate'::text`.

- `build_status` uses `text` and is nullable.

- `surfaced_at` uses `timestamp with time zone` and is nullable.

- `impression_count` uses `integer` and is required.

  Default: `0`.

- `decided_at` uses `timestamp with time zone` and is nullable.

- `dismiss_reason` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `idea_anchors_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_anchors_pkey` covers `idea_id`, `anchor_kind`, `anchor_id`.
