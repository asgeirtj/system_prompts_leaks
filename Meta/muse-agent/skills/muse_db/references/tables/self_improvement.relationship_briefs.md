# `self_improvement.relationship_briefs`

Saved relationship briefings and their linked ideas.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `brief_id` uses `text` and is required.

  Local row identifier (primary key).

- `title` uses `text` and is required.

- `body_html` uses `text` and is required.

- `anchored_idea_ids` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

  Soft local reference → `ideas.ideas.idea_id`.

- `request_id` uses `text` and is required.

  Soft local reference → `runtime.requests.request_id`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `last_opened_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- PRIMARY KEY `relationship_briefs_pkey` covers `brief_id`.
