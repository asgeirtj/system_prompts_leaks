# `agent.context_item_derived_write_backlog`

Pending derived writes for context items and their retry state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `context_item_id` uses `bigint` and is required.

  FK → `agent.context_items.context_item_id`

- `attempts` uses `integer` and is required.

  Default: `0`.

- `last_error` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `deadlettered_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- FOREIGN KEY `context_item_derived_write_backlog_context_item_id_fkey` covers `context_item_id`. References [agent.context_items](/opt/muse/skills/muse_db/references/tables/agent.context_items.md), columns `context_item_id`.

- PRIMARY KEY `context_item_derived_write_backlog_pkey` covers `context_item_id`.
