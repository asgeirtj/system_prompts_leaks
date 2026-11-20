# `ideas.idea_events`

Idea interactions, dismissals and related anchor references.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `event_id` uses `text` and is required.

  Local row identifier (primary key).

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `event_type` uses `text` and is required.

  Engagement/lifecycle event type. Canonical engagement vocab (shared with goals.engagement_events): impression, click, engagement, feedback_up, feedback_down. Lifecycle/decision types (surfaced, accepted, dismissed, built, ...) also flow through this ledger.

- `dismissal_reason` uses `text` and is nullable.

- `anchor_kind` uses `text` and is nullable.

- `anchor_id` uses `text` and is nullable.

  Potential local reference; resolve by domain context in: `ideas.idea_anchors.anchor_id`.

- `lane` uses `text` and is nullable.

- `request_id` uses `text` and is required.

  Soft local reference → `runtime.requests.request_id`.

- `metadata` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `idea_events_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_events_pkey` covers `event_id`.
