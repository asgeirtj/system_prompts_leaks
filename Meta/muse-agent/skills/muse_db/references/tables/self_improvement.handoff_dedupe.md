# `self_improvement.handoff_dedupe`

Previously emitted improvement handoffs used to avoid duplicates.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `objective_id` uses `text` and is required.

  Local row identifier (primary key).

- `content_hash` uses `text` and is required.

  Local row identifier (primary key).

- `run_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `self_improvement.runs.run_id`.

- `emitted_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `handoff_dedupe_pkey` covers `objective_id`, `content_hash`.
