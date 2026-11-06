# `runtime.invite_badge_seen_state`

The invite badge version last seen by the user.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `last_seen_badge_version` uses `bigint` and is required.

  Default: `0`.

## Keys and relationships

- PRIMARY KEY `invite_badge_seen_state_pkey` covers `singleton`.
