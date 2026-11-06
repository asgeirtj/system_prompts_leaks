# `runtime.stripe_link_spend_requests`

Non-secret Stripe Link spend-request state and approved totals.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `approval_id` uses `text` and is required.

  Local row identifier (primary key).

- `continuation_root_task_id` uses `text` and is required.

  Soft local reference → `runtime.browser_tasks.task_id`.

- `merchant_origin` uses `text` and is required.

- `checkout_metadata` uses `jsonb` and is required.

- `approved_amount_minor` uses `bigint` and is required.

- `approved_currency` uses `text` and is required.

- `lifecycle_state` uses `text` and is required.

- `create_attempt_id` uses `uuid` and is required.

  Idempotency token owned by this spend-request row.

- `stripe_spend_request_id` uses `text` and is nullable.

  Stripe Link provider identifier; no Muse PostgreSQL owner table.

- `expires_at` uses `timestamp with time zone` and is required.

- `assigned_browser_task_id` uses `text` and is nullable.

  Soft local reference → `runtime.browser_tasks.task_id`.

- `assigned_at` uses `timestamp with time zone` and is nullable.

- `cancel_attempt_id` uses `uuid` and is nullable.

  Cancellation idempotency token owned by this spend-request row.

- `closed_at` uses `timestamp with time zone` and is nullable.

- `close_reason` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `owner_browser_task_id` uses `text` and is nullable.

  Soft local reference → `runtime.browser_tasks.task_id`. Exact current BrowserTask command owner. Null only for carried rows whose owner was not durably provable.

- `claiming_browser_task_lineage_id` uses `text` and is nullable.

  Browser-runtime lineage claim; no standalone Muse PostgreSQL owner table. Movable current-owner lineage claim; retained after successful checkout and cleared by cancellation/no-effect/expiry.

- `cancellation_confirmation_task_state_revision` uses `bigint` and is nullable.

  Exact parked challenge revision before response, then exact resumed running revision after response.

- `cancellation_confirmation_response_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`. Authentic User-authority message admitted to resume the retained BrowserTask.

- `wallet_provider` uses `text` and is required.

  Default: `'stripe-link'::text`.

  Wallet provider owning this direct BrowserTask lifecycle. The table name is retained only for rolling compatibility.

- `replacement_approval_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

- `replacement_task_state_revision` uses `bigint` and is nullable.

## Keys and relationships

- PRIMARY KEY `stripe_link_spend_requests_pkey` covers `approval_id`.
