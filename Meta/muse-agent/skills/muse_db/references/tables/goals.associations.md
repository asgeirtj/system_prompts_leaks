# `goals.associations`

Links from goals to other records or resources.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `association_id` uses `text` and is required.

  Local row identifier (primary key).

- `goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `association_type` uses `text` and is required.

- `target_id` uses `text` and is required.

  Polymorphic target selected by `association_type`: cron job id (`scheduler.jobs.job_id`), artifact slug (`spaces.spaces.space_slug`), or an on-disk document path.

- `details_json` uses `text` and is required.

  Default: `'{}'::text`.

- `created_at` uses `text` and is required.

- `updated_at` uses `text` and is required.

- `created_at_ts` uses `timestamp with time zone` and is nullable.

- `updated_at_ts` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- FOREIGN KEY `associations_goal_id_fkey` covers `goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `associations_pkey` covers `association_id`.

- UNIQUE `associations_goal_id_association_type_target_id_key` covers `goal_id`, `association_type`, `target_id`.
