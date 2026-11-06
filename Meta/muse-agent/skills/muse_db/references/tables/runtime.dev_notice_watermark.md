# `runtime.dev_notice_watermark`

The last developer notice version observed by the runtime.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `last_seen_version_id` uses `bigint` and is required.

  Version from the code-owned developer-notice catalog; no owner table.

## Keys and relationships

- PRIMARY KEY `dev_notice_watermark_pkey` covers `singleton`.
