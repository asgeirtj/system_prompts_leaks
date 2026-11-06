# `podcasts.feed`

Legacy single podcast feed configuration.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `feed_title` uses `text` and is required.

- `feed_id` uses `text` and is nullable.

  Soft local reference → `podcasts.feeds.feed_id`, naming whichever feed was published to most recently. `podcasts.feeds` is the full catalog; join episodes to it on `feed_url`, not through this row.

- `feed_url` uses `text` and is nullable.

- `cover_path` uses `text` and is nullable.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `spotify_show_url` uses `text` and is nullable.

- `spotify_show_id` uses `text` and is nullable.

  Spotify provider identifier; no Muse PostgreSQL owner table.

## Keys and relationships

- PRIMARY KEY `feed_pkey` covers `singleton`.
