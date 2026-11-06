# `agent.token_usage`

Token usage recorded for an agent and request.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `token_usage_id` uses `bigint` and is required.

  Default: `nextval('agent.token_usage_token_usage_id_seq'::regclass)`.

  Local row identifier (primary key).

- `agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `input_tokens` uses `integer` and is required.

  Default: `0`.

- `output_tokens` uses `integer` and is required.

  Default: `0`.

- `cached_input_tokens` uses `integer` and is required.

  Default: `0`.

- `reasoning_tokens` uses `integer` and is required.

  Default: `0`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `token_usage_request_id_fkey` covers `request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- PRIMARY KEY `token_usage_pkey` covers `token_usage_id`.
