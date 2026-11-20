# `runtime.idea_execution_pending`

Pending idea activations and their dispatch attribution.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `activation_id` uses `text` and is required.

  Local row identifier (primary key).

- `root_submission_message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `session_id` uses `text` and is required.

  Soft local reference → `agent.sessions.session_id`.

- `idea_card_id` uses `text` and is required.

  Soft local reference → `ideas.ideas.idea_id`.

- `idea_card_kind` uses `text` and is required.

- `dispatched_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `reconciled_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- PRIMARY KEY `idea_execution_pending_pkey` covers `activation_id`.
