# `scheduler.cron_mutations`

Recorded changes to scheduled jobs and their request attribution.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `mutation_seq` uses `bigint` and is required.

  Default: `nextval('scheduler.cron_mutations_mutation_seq_seq'::regclass)`.

  Local row identifier (primary key).

- `job_id` uses `text` and is required.

  Soft local reference → `scheduler.jobs.job_id`.

- `action` uses `text` and is required.

- `occurred_at_ms` uses `bigint` and is required.

- `carrier_message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `request_id` uses `text` and is required.

  Soft local reference → `runtime.requests.request_id`.

- `tool_call_id` uses `text` and is required.

  Soft local reference → `runtime.tool_calls.tool_call_id`.

- `input_message_ids` uses `text[]` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `cron_mutations_pkey` covers `mutation_seq`.

- UNIQUE `cron_mutations_request_id_tool_call_id_job_id_key` covers `request_id`, `tool_call_id`, `job_id`.
