# `runtime.skill_invalidation_state`

Skill use and pending or delivered instruction-update revisions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `skill_name` uses `text` and is required.

  Local row identifier (primary key).

- `used` uses `boolean` and is required.

  Default: `false`.

- `pending_invalidation_hash` uses `text` and is nullable.

- `pending_manifest_rel_path` uses `text` and is nullable.

- `last_delivered_invalidation_hash` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `skill_invalidation_state_pkey` covers `skill_name`.
