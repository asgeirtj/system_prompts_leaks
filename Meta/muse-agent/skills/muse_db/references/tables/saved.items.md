# `saved.items`

Anything the user saved (a product, link, post, chat message or note), each once, with notes saying what it was saved for, its status and the agent, chat and turn that saved it.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `item_id` uses `text` and is required.

  Local row identifier (primary key).

- `entity_type` uses `text` and is required.

- `entity_key` uses `text` and is required.

- `url_key` uses `text` and is nullable.

- `payload_version` uses `smallint` and is required.

- `payload` uses `text` and is required.

- `title` uses `text` and is required.

- `url` uses `text` and is nullable.

- `image_url` uses `text` and is nullable.

- `note` uses `text` and is nullable.

  Short phrases, one per line, saying what the item was saved for.

- `raw_input` uses `text` and is nullable.

- `agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `root_session_id` uses `text` and is required.

  Root session of the chat the item was saved in; the same UUID as `chat.chats.chat_id`.

- `chat_surface` uses `text` and is required.

- `message_id` uses `text` and is nullable.

  Soft local reference to `runtime.messages.message_id` of the turn that saved the item.

- `request_origin` uses `text` and is required.

- `saved_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `body` uses `text` and is nullable.

  The saved content itself when it is the thing saved: a note's text, a chat message, a post's caption.

- `status` uses `text` and is nullable.

  What became of the item (purchased, reserved, attended, done); null while it is still wanted.

- `status_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- PRIMARY KEY `items_pkey` covers `item_id`.

- UNIQUE `saved_items_entity_unique` covers `entity_type`, `entity_key`.
