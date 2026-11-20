# `agent.runtime_restart_checkpoints`

Saved agent checkpoints used to resume work after restart.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `agent_id` uses `text` and is required.

  Local row identifier (primary key).

- `mode` uses `text` and is required.

- `payload_json` uses `text` and is nullable.

- `created_at` uses `bigint` and is required.

- `updated_at` uses `bigint` and is required.

- `recovery_class` uses `text` and is nullable.

- `recovery_owner_id` uses `text` and is nullable.

  Soft local reference → `agent.recovery_owners.owner_id`.

- `execution_config_json` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `runtime_restart_checkpoints_pkey` covers `agent_id`.
