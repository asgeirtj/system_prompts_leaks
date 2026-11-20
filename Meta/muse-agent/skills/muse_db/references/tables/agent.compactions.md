# `agent.compactions`

Compaction checkpoints and the history ranges they replace.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `compaction_id` uses `bigint` and is required.

  Default: `nextval('agent.compactions_compaction_id_seq'::regclass)`.

  Local row identifier (primary key).

- `agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `checkpoint_context_item_id` uses `bigint` and is nullable.

  FK → `agent.context_items.context_item_id`

- `replacement_history_first_seq` uses `integer` and is nullable.

- `replacement_history_last_seq` uses `integer` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `summary_text` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `compactions_checkpoint_context_item_id_fkey` covers `checkpoint_context_item_id`. References [agent.context_items](/opt/muse/skills/muse_db/references/tables/agent.context_items.md), columns `context_item_id`.

- PRIMARY KEY `compactions_pkey` covers `compaction_id`.
