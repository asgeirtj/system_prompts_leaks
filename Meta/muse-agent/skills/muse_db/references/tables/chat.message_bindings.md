# `chat.message_bindings`

Bindings between provider messages, native conversations and Muse messages.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `binding_id` uses `bigint` and is required.

  Default: `nextval('chat.message_bindings_binding_id_seq'::regclass)`.

  Local row identifier (primary key).

- `transport_message_id` uses `text` and is nullable.

  Provider-native channel message identifier; no Muse PostgreSQL owner table.

- `transport` uses `text` and is nullable.

- `jarvis_message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `provider` uses `text` and is nullable.

- `native_conversation_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

- `native_message_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

- `created_at_ms` uses `bigint` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `chat_id` uses `text` and is nullable.

  Soft local reference → `chat.chats.chat_id`.

- `binding_epoch` uses `bigint` and is nullable.

- `admitted_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- PRIMARY KEY `message_bindings_pkey` covers `binding_id`.

- UNIQUE `message_bindings_chat_identity` covers `chat_id`, `binding_epoch`, `transport`, `transport_message_id`.
