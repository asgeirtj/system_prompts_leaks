# `ideas.feed_snapshot_cards`

Cards and their ordering within an Ideas snapshot.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `snapshot_id` uses `text` and is required.

  FK → `ideas.feed_snapshot_sections.snapshot_id`

- `section_id` uses `text` and is required.

  FK → `ideas.feed_snapshot_sections.section_id`

- `position` uses `integer` and is required.

  Local row identifier (primary key).

- `source_key` uses `text` and is required.

- `origin` uses `text` and is required.

- `display_title` uses `text` and is nullable.

- `display_summary` uses `text` and is nullable.

- `context_label` uses `text` and is nullable.

- `detail_description` uses `text` and is nullable.

- `build_summary` uses `text` and is nullable.

- `type_label` uses `text` and is nullable.

- `prerequisite_notes` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `feed_snapshot_cards_snapshot_id_section_id_fkey` covers `snapshot_id`, `section_id`. References [ideas.feed_snapshot_sections](/opt/muse/skills/muse_db/references/tables/ideas.feed_snapshot_sections.md), columns `snapshot_id`, `section_id`.

- PRIMARY KEY `feed_snapshot_cards_pkey` covers `snapshot_id`, `section_id`, `position`.
