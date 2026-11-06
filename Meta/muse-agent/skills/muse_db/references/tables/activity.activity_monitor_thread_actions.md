# `activity.activity_monitor_thread_actions`

Actions displayed within an activity thread and their agent attribution.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `action_seq` uses `bigint` and is required.

  Default: `nextval('activity.activity_monitor_thread_actions_action_seq_seq'::regclass)`.

- `action_id` uses `text` and is required.

  Local row identifier (primary key).

- `activity_thread_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `activity.activity_monitor_thread_sections.activity_thread_id`, `activity.activity_monitor_threads.activity_thread_id`.

- `action_index` uses `bigint` and is required.

- `agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `agent_depth` uses `integer` and is nullable.

- `icon` uses `text` and is required.

- `title` uses `text` and is required.

- `subtitle` uses `text` and is nullable.

- `report` uses `text` and is required.

- `status` uses `text` and is required.

- `created_at` uses `text` and is required.

- `section_key` uses `text` and is nullable.

- `section_title` uses `text` and is nullable.

- `section_order` uses `integer` and is nullable.

- `section_depth` uses `integer` and is nullable.

- `parent_section_key` uses `text` and is nullable.

- `ordinal_label` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `activity_monitor_thread_actions_pkey` covers `action_id`.

- UNIQUE `activity_monitor_thread_actions_action_seq_key` covers `action_seq`.
