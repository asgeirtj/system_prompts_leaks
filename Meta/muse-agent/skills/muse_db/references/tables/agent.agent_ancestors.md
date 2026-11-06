# `agent.agent_ancestors`

Ancestor relationships between agents, including distance through the tree.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `descendant_id` uses `text` and is required.

  Local row identifier (primary key).

- `ancestor_id` uses `text` and is required.

  Local row identifier (primary key).

- `distance` uses `integer` and is required.

## Keys and relationships

- PRIMARY KEY `agent_ancestors_pkey` covers `descendant_id`, `ancestor_id`.
