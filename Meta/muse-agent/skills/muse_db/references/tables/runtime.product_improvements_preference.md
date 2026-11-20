# `runtime.product_improvements_preference`

The user's saved product-improvements preference.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `enabled` uses `boolean` and is required.

  Cached account preference before the GenAI training objection override. Training is off while objection_status is 'filed', regardless of enabled. This row is a cache, not a live account read.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `objection_status` uses `text` and is required.

  Default: `'unavailable'::text`.

  Cached account GenAI training objection: 'filed', 'not_filed', or 'unavailable'. 'unavailable' means the status could not be determined, not an objection.

- `objection_time` uses `timestamp with time zone` and is nullable.

  Time the objection was filed; null unless objection_status is 'filed'.

## Keys and relationships

- PRIMARY KEY `product_improvements_preference_pkey` covers `singleton`.
