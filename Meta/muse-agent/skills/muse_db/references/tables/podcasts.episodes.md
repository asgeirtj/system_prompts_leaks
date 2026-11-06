# `podcasts.episodes`

Generated podcast episodes, descriptions, audio paths and duration.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `slug` uses `text` and is required.

  Local row identifier (primary key).

- `title` uses `text` and is required.

- `description` uses `text` and is required.

  Default: `''::text`.

- `created_at` uses `text` and is required.

- `duration_secs` uses `bigint` and is required.

- `audio_path` uses `text` and is required.

- `chunk_count` uses `bigint` and is required.

- `cover_path` uses `text` and is nullable.

- `episode_url` uses `text` and is nullable.

- `feed_url` uses `text` and is nullable.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `spotify_episode_uri` uses `text` and is nullable.

- `script` uses `text` and is nullable.

- `topics` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `episodes_pkey` covers `slug`.
