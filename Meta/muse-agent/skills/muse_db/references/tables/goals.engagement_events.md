# `goals.engagement_events`

User engagement events associated with a goal and surface.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `event_id` uses `text` and is required.

  Local row identifier (primary key).

- `goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `event_type` uses `text` and is required.

  Engagement/feedback event type. Canonical vocab (shared with ideas.idea_events): impression, click, engagement, feedback_up, feedback_down.

- `surface` uses `text` and is nullable.

- `value` uses `double precision` and is nullable.

  Optional numeric depth for engagement rows (e.g. dwell seconds / value weight); null for impression/click/feedback rows.

- `request_id` uses `text` and is required.

  Soft local reference → `runtime.requests.request_id`.

- `metadata` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `engagement_events_goal_id_fkey` covers `goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `engagement_events_pkey` covers `event_id`.
