# `chat.chats`

Canonical chat metadata. chat_id is the existing root session UUID.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `chat_id` uses `text` and is required.

  Canonical chat identity; the same UUID as its root agent's session_id.

- `origin` uses `text` and is required.

- `lifecycle` uses `text` and is required.

- `status` uses `text` and is required.

- `thread_title` uses `text` and is nullable.

- `source_session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `source_prompt_seq_upper_bound` uses `bigint` and is nullable.

- `source_message_id_boundary` uses `text` and is nullable.

- `created_at` uses `bigint` and is required.

- `updated_at` uses `bigint` and is required.

- `pinned` uses `boolean` and is required.

  Default: `false`.

- `pinned_order` uses `bigint` and is nullable.

## Keys and relationships

- PRIMARY KEY `chats_pkey` covers `chat_id`.
