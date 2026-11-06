# `agent.message_mailbox`

Accepted agent submissions, their ordering and routing state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `submission_id` uses `text` and is required.

  Local row identifier (primary key).

- `accepted_ordinal` uses `bigint` and is required.

- `agent_id` uses `text` and is required.

  FK → `agent.agents.agent_id`

- `conversation_epoch` uses `bigint` and is required.

- `submission_kind` uses `text` and is required.

- `routing_scope` uses `text` and is required.

- `state` uses `text` and is required.

- `stream_owner_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `submission_json` uses `text` and is required.

- `transcript_event_seq` uses `bigint` and is nullable.

  FK → `runtime.events.event_seq`

- `accepted_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `attached_at` uses `timestamp with time zone` and is nullable.

- `terminalized_at` uses `timestamp with time zone` and is nullable.

- `checkpoint_custody` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `message_mailbox_agent_id_fkey` covers `agent_id`. References [agent.agents](/opt/muse/skills/muse_db/references/tables/agent.agents.md), columns `agent_id`.

- FOREIGN KEY `message_mailbox_transcript_event_seq_fkey` covers `transcript_event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `message_mailbox_pkey` covers `submission_id`.

- UNIQUE `message_mailbox_agent_id_conversation_epoch_accepted_ordina_key` covers `agent_id`, `conversation_epoch`, `accepted_ordinal`.
