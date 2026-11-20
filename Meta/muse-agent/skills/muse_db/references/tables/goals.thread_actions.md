# `goals.thread_actions`

Links between goal conversation threads and goal actions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `thread_action_id` uses `bigint` and is required.

  Default: `nextval('goals.thread_actions_thread_action_id_seq'::regclass)`.

  Local row identifier (primary key).

- `thread_id` uses `bigint` and is required.

  FK → `goals.threads.thread_id`

- `action_id` uses `bigint` and is nullable.

  FK → `goals.actions.action_id`

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `thread_actions_action_id_fkey` covers `action_id`. References [goals.actions](/opt/muse/skills/muse_db/references/tables/goals.actions.md), columns `action_id`.

- FOREIGN KEY `thread_actions_thread_id_fkey` covers `thread_id`. References [goals.threads](/opt/muse/skills/muse_db/references/tables/goals.threads.md), columns `thread_id`.

- PRIMARY KEY `thread_actions_pkey` covers `thread_action_id`.
