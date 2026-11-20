# `ideas.feed_snapshot_sections`

Section titles, roles and ordering within an Ideas snapshot.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `snapshot_id` uses `text` and is required.

  FK → `ideas.feed_snapshots.snapshot_id`

- `section_id` uses `text` and is required.

  Local row identifier (primary key).

- `position` uses `integer` and is required.

- `role` uses `text` and is required.

- `title` uses `text` and is required.

- `subtitle` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `feed_snapshot_sections_snapshot_id_fkey` covers `snapshot_id`. References [ideas.feed_snapshots](/opt/muse/skills/muse_db/references/tables/ideas.feed_snapshots.md), columns `snapshot_id`.

- PRIMARY KEY `feed_snapshot_sections_pkey` covers `snapshot_id`, `section_id`.

- UNIQUE `feed_snapshot_sections_snapshot_id_position_key` covers `snapshot_id`, `position`.
