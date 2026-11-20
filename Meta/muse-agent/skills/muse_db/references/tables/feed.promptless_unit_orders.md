# `feed.promptless_unit_orders`

User ordering of Feed units for a prompt and local date.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `prompt_id` uses `text` and is required.

  Local row identifier (primary key).

- `unit_id` uses `text` and is required.

  FK → `feed.units.unit_id`

- `local_date` uses `date` and is required.

- `manual_order` uses `double precision` and is required.

## Keys and relationships

- FOREIGN KEY `promptless_unit_orders_unit_id_fkey` covers `unit_id`. References [feed.units](/opt/muse/skills/muse_db/references/tables/feed.units.md), columns `unit_id`.

- PRIMARY KEY `promptless_unit_orders_pkey` covers `prompt_id`, `unit_id`.
