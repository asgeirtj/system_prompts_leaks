# `self_improvement.conversation_follow_up_attempts`

Conversation follow-up decisions and delivery submissions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `occurrence` uses `text` and is required.

  Local row identifier (primary key).

- `delivery_submission_id` uses `text` and is required.

  Soft local reference → `agent.message_mailbox.submission_id`.

- `selector_decision` uses `text` and is nullable.

- `selector_message` uses `text` and is nullable.

- `feedback_note` uses `text` and is nullable.

- `selected_at` uses `timestamp with time zone` and is nullable.

- `state` uses `text` and is required.

  Default: `'pending'::text`.

- `disposition_reason` uses `text` and is nullable.

- `surfaced_at` uses `timestamp with time zone` and is nullable.

- `terminal_at` uses `timestamp with time zone` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `source_root_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `selector_priority` uses `smallint` and is nullable.

- `chat_id` uses `text` and is nullable.

  Soft local reference → `chat.chats.chat_id`.

- `chat_binding_epoch` uses `bigint` and is nullable.

## Keys and relationships

- PRIMARY KEY `conversation_follow_up_attempts_pkey` covers `occurrence`.
