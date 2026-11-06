# `runtime.summaries`

Saved runtime summaries keyed by purpose.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `id` uses `bigint` and is required.

  Default: `nextval('runtime.summaries_id_seq'::regclass)`.

  Local row identifier (primary key).

- `summary_key` uses `text` and is nullable.

- `summary_text` uses `text` and is nullable.

- `created_at_ms` uses `bigint` and is required.

  Default: `((EXTRACT(epoch FROM now()))::bigint * 1000)`.

## Keys and relationships

- PRIMARY KEY `summaries_pkey` covers `id`.
