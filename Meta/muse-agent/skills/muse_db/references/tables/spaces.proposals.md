# `spaces.proposals`

Artifact proposals and their confirmation state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `proposal_id` uses `text` and is required.

  Local row identifier (primary key).

- `root_session_id` uses `text` and is required.

  Soft local reference → `agent.sessions.session_id`.

- `space_slug` uses `text` and is required.

- `proposed_name` uses `text` and is required.

- `params_json` uses `text` and is required.

- `confirmed_at_text` uses `text` and is nullable.

- `confirmed_at` uses `timestamp with time zone` and is nullable.

- `created_at_text` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `proposals_pkey` covers `proposal_id`.
