# `runtime.widgets`

Widget contents, display text and versioned state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `widget_id` uses `text` and is required.

  Local row identifier (primary key).

- `kind` uses `text` and is required.

- `data_json` uses `text` and is required.

- `display_text` uses `text` and is nullable.

- `state_bundle_json` uses `text` and is required.

  Default: `'{}'::text`.

- `state_version` uses `bigint` and is required.

  Default: `0`.

- `state_updated_at_ms` uses `bigint` and is nullable.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `widgets_pkey` covers `widget_id`.
