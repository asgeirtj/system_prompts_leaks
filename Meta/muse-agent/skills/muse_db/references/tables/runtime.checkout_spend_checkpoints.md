# `runtime.checkout_spend_checkpoints`

Checkpoints and external references for checkout operations.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `operation_id` uses `text` and is required.

  FK → `runtime.checkout_spend_operations.operation_id`

- `provider` uses `text` and is required.

- `checkpoint_key` uses `text` and is required.

  Local row identifier (primary key).

- `external_id` uses `text` and is nullable.

  External/provider identifier; no Muse PostgreSQL owner table.

- `detail` uses `jsonb` and is nullable.

- `claimed_at_ms` uses `bigint` and is required.

- `bound_at_ms` uses `bigint` and is nullable.

- `execution_observation` uses `jsonb` and is nullable.

## Keys and relationships

- FOREIGN KEY `checkout_spend_checkpoints_operation_id_fkey` covers `operation_id`. References [runtime.checkout_spend_operations](/opt/muse/skills/muse_db/references/tables/runtime.checkout_spend_operations.md), columns `operation_id`.

- PRIMARY KEY `checkout_spend_checkpoints_pkey` covers `operation_id`, `checkpoint_key`.
