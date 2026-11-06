# `media.descriptions`

Generated media descriptions and the model and version used.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `media_id` uses `text` and is required.

  Local row identifier (primary key).

- `model` uses `text` and is nullable.

- `version` uses `bigint` and is required.

  Default: `1`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `description_text` uses `text` and is required.

- `summary_short_text` uses `text` and is required.

- `summary_full_text` uses `text` and is nullable.

- `people_text` uses `text` and is nullable.

- `activity_text` uses `text` and is nullable.

- `objects_text` uses `text` and is nullable.

- `ocr_text` uses `text` and is nullable.

- `location_hint_text` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `descriptions_pkey` covers `media_id`.
