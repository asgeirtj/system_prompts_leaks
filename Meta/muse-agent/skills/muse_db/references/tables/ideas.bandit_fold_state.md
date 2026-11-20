# `ideas.bandit_fold_state`

Watermarks for idea-policy learning from events.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `policy_id` uses `text` and is required.

  FK → `ideas.explore_policy.policy_id`

- `folded_until` uses `timestamp with time zone` and is nullable.

- `folded_event_id` uses `text` and is nullable.

  Soft local reference → `ideas.bandit_folded_events.event_id`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `bandit_fold_state_policy_id_fkey` covers `policy_id`. References [ideas.explore_policy](/opt/muse/skills/muse_db/references/tables/ideas.explore_policy.md), columns `policy_id`.

- PRIMARY KEY `bandit_fold_state_pkey` covers `policy_id`.
