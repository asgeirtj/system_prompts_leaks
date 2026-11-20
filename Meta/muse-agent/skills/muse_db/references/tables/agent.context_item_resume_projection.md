# `agent.context_item_resume_projection`

Readable context projected for agent resume, with protected items withheld.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Read restrictions

Redacted. Rows projected from model-reasoning items (thinking or redacted-thinking) are withheld, and the legacy item copy is withheld because it can hold model reasoning. Saved per-turn developer instructions are also withheld from this inspection surface. They are instruction snapshots, not model reasoning. Queries against this table run against the security-barrier view `inspection.context_item_resume_projection`, which projects the columns listed below. Withheld columns: `item_json`, `turn_developer_context`, `public_import_exempt`, `public_import_done_provenance_md5`.

## Columns

- `agent_id` uses `text` and is required.

  Local row identifier (primary key).

- `seq` uses `bigint` and is required.

  Local row identifier (primary key).

- `context_item_id` uses `bigint` and is nullable.

  FK → `agent.context_items.context_item_id`

- `created_at` uses `bigint` and is nullable.

- `message_source` uses `text` and is nullable.

- `client_context_json` uses `text` and is nullable.

- `reply_prefix` uses `text` and is nullable.

- `provenance_json` uses `text` and is nullable.

- `client_context_projected` uses `boolean` and is required.

  Default: `false`.

- `reply_prefix_projected` uses `boolean` and is required.

  Default: `false`.

- `provenance_projected` uses `boolean` and is required.

  Default: `false`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `context_item_resume_projection_context_item_id_fkey` covers `context_item_id`. References [agent.context_items](/opt/muse/skills/muse_db/references/tables/agent.context_items.md), columns `context_item_id`.

- PRIMARY KEY `context_item_resume_projection_pkey` covers `agent_id`, `seq`.
