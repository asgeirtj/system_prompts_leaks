# `goals.actions`

Actions attached to goals and their completion state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `action_id` uses `bigint` and is required.

  Default: `nextval('goals.actions_action_id_seq'::regclass)`.

  Local row identifier (primary key).

- `goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `status` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

- `updated_at` uses `timestamp with time zone` and is required.

- `action_text` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `actions_goal_id_fkey` covers `goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `actions_pkey` covers `action_id`.
