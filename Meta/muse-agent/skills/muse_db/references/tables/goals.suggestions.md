# `goals.suggestions`

Suggestions linking goals to ideas and their current state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `suggestion_id` uses `text` and is required.

  Local row identifier (primary key).

- `goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `idea_id` uses `text` and is required.

  Soft local reference → `ideas.ideas.idea_id`.

- `status` uses `text` and is required.

- `created_at` uses `text` and is required.

- `updated_at` uses `text` and is required.

- `created_at_ts` uses `timestamp with time zone` and is nullable.

- `updated_at_ts` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- FOREIGN KEY `suggestions_goal_id_fkey` covers `goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `suggestions_pkey` covers `suggestion_id`.

- UNIQUE `suggestions_goal_id_idea_id_key` covers `goal_id`, `idea_id`.
