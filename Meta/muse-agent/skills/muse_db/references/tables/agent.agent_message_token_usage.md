# `agent.agent_message_token_usage`

Token usage attributed to an agent and message.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `agent_id` uses `text` and is required.

  Local row identifier (primary key).

- `message_id` uses `text` and is required.

  Local row identifier (primary key).

- `input_tokens` uses `bigint` and is required.

- `output_tokens` uses `bigint` and is required.

- `created_at` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `agent_message_token_usage_pkey` covers `agent_id`, `message_id`.
