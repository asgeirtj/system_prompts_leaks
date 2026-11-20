# `ideas.bandit_folded_events`

Events already incorporated into idea-policy learning.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `policy_id` uses `text` and is required.

  FK → `ideas.explore_policy.policy_id`

- `event_id` uses `text` and is required.

  FK → `ideas.idea_events.event_id`

- `folded_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `bandit_folded_events_event_id_fkey` covers `event_id`. References [ideas.idea_events](/opt/muse/skills/muse_db/references/tables/ideas.idea_events.md), columns `event_id`.

- FOREIGN KEY `bandit_folded_events_policy_id_fkey` covers `policy_id`. References [ideas.explore_policy](/opt/muse/skills/muse_db/references/tables/ideas.explore_policy.md), columns `policy_id`.

- PRIMARY KEY `bandit_folded_events_pkey` covers `policy_id`, `event_id`.
