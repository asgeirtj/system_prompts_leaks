# `ideas.idea_install_assets`

Assets prepared for installing or executing an idea.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `asset_id` uses `text` and is required.

  Local row identifier (primary key).

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `asset_type` uses `text` and is required.

- `asset_json` uses `jsonb` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `idea_install_assets_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_install_assets_pkey` covers `asset_id`.
