# `media.locations`

Coordinates and geocoding state associated with media.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `media_id` uses `text` and is required.

  Local row identifier (primary key).

- `latitude` uses `double precision` and is nullable.

- `longitude` uses `double precision` and is nullable.

- `altitude_meters` uses `double precision` and is nullable.

- `location_source` uses `text` and is nullable.

- `geocode_attempt_count` uses `integer` and is required.

  Default: `0`.

- `geocode_next_retry_at_unix` uses `bigint` and is nullable.

- `location_text` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `locations_pkey` covers `media_id`.
