# `ideas.idea_card_feeds`

Saved source feeds used to produce idea cards.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `feed_id` uses `text` and is required.

  Local row identifier (primary key).

- `source` uses `text` and is required.

- `payload_json` uses `jsonb` and is required.

- `generated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `idea_card_feeds_pkey` covers `feed_id`.
