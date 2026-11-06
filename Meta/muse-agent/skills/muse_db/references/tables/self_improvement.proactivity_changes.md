# `self_improvement.proactivity_changes`

Brief agent-reported completed changes. Delivery acknowledges the ledger without making its entries selection candidates.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `change_id` uses `text` and is required.

  Local row identifier (primary key).

- `research_turn_id` uses `text` and is required.

  Private background-worker turn identifier; its journal is not queryable through muse.db.

- `agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `request_id` uses `text` and is required.

  Soft local reference → `runtime.requests.request_id`.

- `recording_call_id` uses `text` and is required.

  Soft local reference to `runtime.tool_calls.call_id`, scoped by this row's agent_id and message_id; distinct from the numeric tool_call_id.

- `summary` uses `text` and is required.

- `recorded_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `claimed_follow_up_id` uses `text` and is nullable.

  Private delivery-queue identifier; its owner is not queryable through muse.db.

- `claimed_submission_id` uses `text` and is nullable.

  Soft local reference to `runtime.messages.message_id` for the delivery submission.

- `delivered_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- PRIMARY KEY `proactivity_changes_pkey` covers `change_id`.
