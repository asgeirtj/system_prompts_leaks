# `ideas.bandit_arm_state`

Learning statistics for each idea policy domain and lane.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `policy_id` uses `text` and is required.

  FK → `ideas.explore_policy.policy_id`

- `domain` uses `text` and is required.

  Local row identifier (primary key).

- `lane` uses `text` and is required.

  Local row identifier (primary key).

- `decision_points` uses `bigint` and is required.

  Default: `0`.

- `terminal_rewards` uses `bigint` and is required.

  Default: `0`.

- `terminal_observations` uses `bigint` and is required.

  Default: `0`.

- `fast_reward_sum` uses `double precision` and is required.

  Default: `0`.

- `fast_observations` uses `bigint` and is required.

  Default: `0`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `bandit_arm_state_policy_id_fkey` covers `policy_id`. References [ideas.explore_policy](/opt/muse/skills/muse_db/references/tables/ideas.explore_policy.md), columns `policy_id`.

- PRIMARY KEY `bandit_arm_state_pkey` covers `policy_id`, `domain`, `lane`.
