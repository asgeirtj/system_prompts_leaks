# `agent.context_items`

Ordered readable conversation items, including message and tool references.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Read restrictions

Redacted. Rows holding model reasoning (thinking and redacted-thinking items) are withheld. Stored commentary can be queried through `muse.db` for diagnosis. Commentary is hidden from the user's chat. A commentary record does not establish that the user received its contents. Queries against this table run against the security-barrier view `inspection.context_items`, which projects the columns listed below.

## Columns

- `context_item_id` uses `bigint` and is required.

  Default: `nextval('agent.context_items_context_item_id_seq'::regclass)`.

  Local row identifier (primary key).

- `agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `seq` uses `bigint` and is required.

- `item_kind` uses `agent.context_item_kind` and is required.

- `message_id` uses `text` and is nullable.

  FK → `runtime.messages.message_id`

- `tool_call_id` uses `bigint` and is nullable.

  FK → `runtime.tool_calls.tool_call_id`

- `tool_output_id` uses `bigint` and is nullable.

  FK → `runtime.tool_outputs.tool_output_id`

- `role` uses `runtime.message_role` and is nullable.

- `call_id` uses `text` and is nullable.

  Soft local reference to `runtime.workflow_agent_calls.call_id`.

- `tool_name` uses `text` and is nullable.

- `success` uses `boolean` and is nullable.

- `message_source` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `data_fbids` uses `bigint[]` and is nullable.

- `data_message_ids` uses `text[]` and is nullable.

  Source-system message identifiers carried for retention cleanup; resolve them from the context item's provenance, not by assuming runtime message ids.

- `data_cleanup_checked_at` uses `timestamp with time zone` and is nullable.

- `data_summarized_at` uses `timestamp with time zone` and is nullable.

- `data_thread_ids` uses `text[]` and is nullable.

  Source-system thread identifiers carried for retention cleanup; no single Muse PostgreSQL owner table.

- `data_expires_at` uses `timestamp with time zone` and is nullable.

- `text_content` uses `text` and is nullable.

- `item_json` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `context_items_message_id_fkey` covers `message_id`. References [runtime.messages](/opt/muse/skills/muse_db/references/tables/runtime.messages.md), columns `message_id`.

- FOREIGN KEY `context_items_tool_call_id_fkey` covers `tool_call_id`. References [runtime.tool_calls](/opt/muse/skills/muse_db/references/tables/runtime.tool_calls.md), columns `tool_call_id`.

- FOREIGN KEY `context_items_tool_output_id_fkey` covers `tool_output_id`. References [runtime.tool_outputs](/opt/muse/skills/muse_db/references/tables/runtime.tool_outputs.md), columns `tool_output_id`.

- PRIMARY KEY `context_items_pkey` covers `context_item_id`.

- UNIQUE `context_items_agent_id_seq_key` covers `agent_id`, `seq`.
