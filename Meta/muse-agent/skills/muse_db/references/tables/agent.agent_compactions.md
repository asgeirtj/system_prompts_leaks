# `agent.agent_compactions`

Agent compaction summaries and token counts, with private reasoning withheld.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Read restrictions

Redacted. The compaction detail payload is withheld because it carries the model reasoning retained across the checkpoint. Queries against this table run against the security-barrier view `inspection.agent_compactions`, which projects the columns listed below. Withheld columns: `details_json`.

## Columns

- `id` uses `bigint` and is required.

  Default: `nextval('agent.agent_compactions_id_seq'::regclass)`.

  Local row identifier (primary key).

- `agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `summary` uses `text` and is required.

- `first_kept_seq` uses `bigint` and is nullable.

- `checkpoint_seq` uses `bigint` and is nullable.

- `tokens_before` uses `bigint` and is nullable.

- `tokens_after` uses `bigint` and is nullable.

- `trigger` uses `text` and is required.

- `will_retry` uses `boolean` and is required.

  Default: `false`.

- `created_at` uses `bigint` and is required.

- `has_replacement_history` uses `boolean` and is required.

  Default: `false`.

## Keys and relationships

- PRIMARY KEY `agent_compactions_pkey` covers `id`.
