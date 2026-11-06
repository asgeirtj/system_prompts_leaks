# `podcasts.feeds`

Podcast feed identities, publication URLs and linked show information.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `feed_id` uses `text` and is required.

  Local row identifier (primary key).

- `feed_title` uses `text` and is required.

- `feed_url` uses `text` and is nullable.

- `cover_path` uses `text` and is nullable.

- `spotify_show_url` uses `text` and is nullable.

- `spotify_show_id` uses `text` and is nullable.

  Spotify provider identifier; no Muse PostgreSQL owner table.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `feeds_pkey` covers `feed_id`.
