# `goals.goals`

User goals, their descriptions and lifecycle state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `goal_id` uses `text` and is required.

  Local row identifier (primary key).

- `activity_key` uses `text` and is nullable.

- `slug` uses `text` and is nullable.

- `title` uses `text` and is required.

- `summary` uses `text` and is nullable.

- `description` uses `text` and is nullable.

- `momentum` uses `text` and is nullable.

- `momentum_status` uses `text` and is nullable.

- `emoji` uses `text` and is nullable.

- `image_relpath` uses `text` and is nullable.

- `icon_generation_status` uses `text` and is nullable.

- `status` uses `text` and is required.

- `created_at` uses `text` and is required.

- `updated_at` uses `text` and is required.

- `parent_goal_id` uses `text` and is nullable.

  FK → `goals.goals.goal_id`

- `sort_order` uses `double precision` and is required.

  Default: `0`.

- `completed_at` uses `text` and is nullable.

- `created_at_ts` uses `timestamp with time zone` and is nullable.

- `updated_at_ts` uses `timestamp with time zone` and is nullable.

- `last_activity_at` uses `text` and is nullable.

- `last_activity_at_ts` uses `timestamp with time zone` and is nullable.

- `pushable` uses `boolean` and is required.

  Default: `true`.

- `category` uses `text` and is nullable.

- `goal_kind` uses `text` and is nullable.

- `value_alignment` uses `text` and is nullable.

- `user_words` uses `text` and is nullable.

- `assistant_distillation` uses `text` and is nullable.

- `woop` uses `jsonb` and is nullable.

- `implementation_intentions` uses `jsonb` and is nullable.

- `monitoring_signal` uses `text` and is nullable.

- `review_cadence` uses `text` and is nullable.

- `next_review_question` uses `text` and is nullable.

- `momentum_dimensions` uses `jsonb` and is nullable.

- `adjustment_recommendation` uses `text` and is nullable.

- `provenance` uses `jsonb` and is nullable.

- `completed_at_ts` uses `timestamp with time zone` and is nullable.

- `source` uses `text` and is required.

  Default: `'user_goal'::text`.

- `attention_kind` uses `text` and is required.

  Default: `'does_not_need_attention'::text`.

- `attention_updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `next_due_at` uses `timestamp with time zone` and is nullable.

- `escalation` uses `jsonb` and is nullable.

- `escalation_due_at` uses `timestamp with time zone` and is nullable.

- `fixed_position` uses `bigint` and is nullable.

- `connection_id` uses `uuid` and is nullable.

  Client connection identifier; no durable owner table.

- `connection_follow_up_at` uses `timestamp with time zone` and is nullable.

- `connection_revision` uses `bigint` and is required.

  Default: `0`.

- `connection_request_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

- `connection_bookkeeping_effect` uses `text` and is nullable.

- `connection_match_fingerprint` uses `text` and is nullable.

- `connection_owner_initiated` uses `boolean` and is required.

  Default: `true`.

- `research_output_fingerprint` uses `text` and is nullable.

- `research_output_through` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- FOREIGN KEY `goals_parent_goal_id_fkey` covers `parent_goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `goals_pkey` covers `goal_id`.

- UNIQUE `goals_slug_key` covers `slug`.
