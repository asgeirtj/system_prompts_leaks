# `ideas.idea_feedback_state`

Current user feedback associated with each idea.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `feedback` uses `text` and is required.

- `reason` uses `text` and is nullable.

- `event_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `ideas.bandit_folded_events.event_id`, `ideas.idea_events.event_id`.

- `surface` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `idea_feedback_state_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_feedback_state_pkey` covers `idea_id`.
