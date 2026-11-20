# `feed.units`

Generated Feed content and its edition and source prompt.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `unit_id` uses `text` and is required.

  Local row identifier (primary key).

- `run_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `feed.run_steps.run_id`, `feed.runs.run_id`.

- `prompt_id` uses `text` and is nullable.

  Potential local reference; resolve by domain context in: `feed.promptless_unit_orders.prompt_id`, `feed.prompts.prompt_id`.

- `edition_kind` uses `text` and is required.

- `edition_local_date` uses `date` and is required.

- `edition_generated_at_ms` uses `bigint` and is required.

- `position` uses `integer` and is required.

- `kicker` uses `text` and is required.

- `body_md` uses `text` and is required.

- `attachment_kind` uses `text` and is required.

- `header_image_path` uses `text` and is nullable.

- `image_urls` uses `text[]` and is nullable.

- `widget_html` uses `text` and is nullable.

- `social_embed_url` uses `text` and is nullable.

- `category` uses `text` and is required.

- `connector_attribution` uses `text` and is nullable.

- `stats` uses `jsonb` and is nullable.

- `reaction` uses `text` and is nullable.

- `reaction_updated_at_ms` uses `bigint` and is nullable.

- `share_count` uses `bigint` and is required.

  Default: `0`.

- `discuss_count` uses `bigint` and is required.

  Default: `0`.

- `origin` uses `text` and is required.

- `share_instructions` uses `jsonb` and is nullable.

- `share_artifact_generated_at_ms` uses `bigint` and is nullable.

- `share_artifact_stale` uses `boolean` and is required.

  Default: `false`.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

- `embedding` uses `vector(384)` and is nullable.

- `manual_order` uses `double precision` and is nullable.

- `seen_at_ms` uses `bigint` and is nullable.

- `title` uses `text` and is nullable.

- `search_vector` uses `tsvector` and is nullable.

  Default: `to_tsvector('simple'::regconfig, "left"(((((((COALESCE(kicker, ''::text) \|\| ' '::text) \|\| COALESCE(title, ''::text)) \|\| ' '::text) \|\| COALESCE(body_md, ''::text)) \|\| ' '::text) \|\| COALESCE(category, ''::text)), 200000))`.

- `last_seen_at_ms` uses `bigint` and is nullable.

- `timespent_ms` uses `bigint` and is nullable.

- `social_thumbnail_url` uses `text` and is nullable.

- `social_thumbnail_aspect_ratio` uses `double precision` and is nullable.

- `social_attribution_text` uses `text` and is nullable.

- `social_post_username` uses `text` and is nullable.

- `why_did_i_see_this` uses `text` and is nullable.

- `source_post_url` uses `text` and is nullable.

- `video_media_path` uses `text` and is nullable.

- `carousel_clip_paths` uses `text[]` and is nullable.

- `source_fleet_origin_id` uses `text` and is nullable.

  Fleet-learning origin identifier; its owner is outside this VM database.

- `fleet_reaction_version` uses `bigint` and is required.

  Default: `0`.

- `emoji` uses `text` and is nullable.

- `source_idea_id` uses `text` and is nullable.

  Soft local reference → `ideas.ideas.idea_id`.

- `icon_key` uses `text` and is nullable.

- `source_url_keys` uses `text[]` and is nullable.

- `activity_tier` uses `text` and is nullable.

- `beat` uses `text` and is nullable.

- `reader_response` uses `text` and is nullable.

- `stake_type` uses `text` and is nullable.

- `act_by` uses `date` and is nullable.

## Keys and relationships

- PRIMARY KEY `units_pkey` covers `unit_id`.
