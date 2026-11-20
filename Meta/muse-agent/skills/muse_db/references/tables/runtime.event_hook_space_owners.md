# `runtime.event_hook_space_owners`

Associations between event hooks and owning artifacts.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `hook_id` uses `text` and is required.

  Local row identifier (primary key).

- `space_slug` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `event_hook_space_owners_pkey` covers `hook_id`.
