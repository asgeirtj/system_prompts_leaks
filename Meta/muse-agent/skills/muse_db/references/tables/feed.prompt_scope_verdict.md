# `feed.prompt_scope_verdict`

Classification of a Feed prompt and the version that produced it.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `prompt_sha256` uses `text` and is required.

- `needs_interpretation` uses `boolean` and is required.

- `reason` uses `text` and is required.

- `classifier_version` uses `integer` and is required.

- `classified_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `prompt_scope_verdict_pkey` covers `singleton`.
