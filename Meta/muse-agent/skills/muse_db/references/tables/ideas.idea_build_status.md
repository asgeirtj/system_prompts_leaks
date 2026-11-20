# `ideas.idea_build_status`

Build state and selected items for an idea source.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `source_namespace` uses `text` and is required.

  Local row identifier (primary key).

- `source_kind` uses `text` and is required.

  Local row identifier (primary key).

- `source_id` uses `text` and is required.

  Local row identifier (primary key).

- `status` uses `text` and is required.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `selected_item_ids` uses `text[]` and is nullable.

  Soft local reference → `ideas.idea_items.idea_item_id`. Accepted idea item ids for the build; NULL means no selection provenance, empty array means full-card acceptance.

## Keys and relationships

- PRIMARY KEY `idea_build_status_pkey` covers `source_namespace`, `source_kind`, `source_id`.
