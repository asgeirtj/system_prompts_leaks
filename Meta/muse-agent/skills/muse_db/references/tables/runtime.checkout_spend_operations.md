# `runtime.checkout_spend_operations`

Checkout operation identity, approvals and reconciliation state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `operation_id` uses `text` and is required.

  Local row identifier (primary key).

- `client_task_key` uses `text` and is required.

- `checkout_request_id` uses `text` and is nullable.

  Checkout correlation key owned by this operation row; no separate owner table.

- `wallet_request_id` uses `text` and is nullable.

  Wallet-provider request identifier; no Muse PostgreSQL owner table.

- `approval_id` uses `text` and is nullable.

  Sentinel approval identifier; Stripe Link spend rows mirror it in `runtime.stripe_link_spend_requests`.

- `state` uses `text` and is required.

- `expires_at_ms` uses `bigint` and is required.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

- `terminal_result` uses `jsonb` and is nullable.

- `recovery_epoch` uses `smallint` and is required.

  Default: `0`.

- `wallet_provider` uses `text` and is required.

  Default: `'stripe-link'::text`.

- `original_request_trace_json` uses `text` and is nullable.

  Original runtime request attribution captured at operation begin; telemetry only. NULL means not recorded. Never replaced by retries or recovery.

- `checkout_attribution` uses `jsonb` and is nullable.

  Optional original checkout provider and normalized merchant origin for telemetry. Immutable after begin; NULL for predecessor rows and writers. Not authorization or replay identity.

## Keys and relationships

- PRIMARY KEY `checkout_spend_operations_pkey` covers `operation_id`.
