# `agent.volatile_context_pins`

Pinned context variants and their history checkpoint positions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `agent_id` uses `text` and is required.

  Local row identifier (primary key).

- `variant_hash` uses `text` and is required.

  Local row identifier (primary key).

- `variant_json` uses `text` and is required.

- `prompt_floor_seq` uses `bigint` and is required.

- `checkpoint_seq` uses `bigint` and is required.

- `body` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `body_hash` uses `bytea` and is nullable.

## Keys and relationships

- PRIMARY KEY `volatile_context_pins_pkey` covers `agent_id`, `variant_hash`.
