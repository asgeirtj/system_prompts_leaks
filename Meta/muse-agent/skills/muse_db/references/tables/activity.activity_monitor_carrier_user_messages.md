# `activity.activity_monitor_carrier_user_messages`

Links activity carrier messages to the user messages they represent.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `link_seq` uses `bigint` and is required.

  Default: `nextval('activity.activity_monitor_carrier_user_messages_link_seq_seq'::regclass)`.

  Local row identifier (primary key).

- `carrier_message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `user_message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `root_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `activity_monitor_carrier_user_messages_pkey` covers `link_seq`.

- UNIQUE `activity_monitor_carrier_user_carrier_message_id_user_messa_key` covers `carrier_message_id`, `user_message_id`.
