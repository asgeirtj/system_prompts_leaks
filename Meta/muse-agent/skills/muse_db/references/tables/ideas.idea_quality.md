# `ideas.idea_quality`

Recorded relevance, novelty and feasibility scores for ideas.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `relevance_score` uses `double precision` and is required.

- `novelty_score` uses `double precision` and is required.

- `feasibility_score` uses `double precision` and is required.

- `composite_score` uses `double precision` and is required.

- `composite_version` uses `text` and is required.

- `scorer` uses `text` and is required.

- `decision_outcome` uses `text` and is required.

- `decision_reasons` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `scored_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `value_score` uses `double precision` and is required.

  Default: `0`.

## Keys and relationships

- FOREIGN KEY `idea_quality_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_quality_pkey` covers `idea_id`.
