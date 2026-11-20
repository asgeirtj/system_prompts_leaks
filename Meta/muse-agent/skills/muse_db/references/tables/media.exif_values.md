# `media.exif_values`

Extracted EXIF metadata for media items.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `exif_value_id` uses `bigint` and is required.

  Default: `nextval('media.exif_values_exif_value_id_seq'::regclass)`.

  Local row identifier (primary key).

- `media_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `media.descriptions.media_id`, `media.items.media_id`, `media.locations.media_id`.

- `tag_name` uses `text` and is required.

- `scalar_type` uses `text` and is required.

- `scalar_value` uses `text` and is required.

## Keys and relationships

- PRIMARY KEY `exif_values_pkey` covers `exif_value_id`.

- UNIQUE `exif_values_media_id_tag_name_key` covers `media_id`, `tag_name`.
