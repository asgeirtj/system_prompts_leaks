# `runtime.avatar_state`

Current avatar assets and theme settings.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `active_stem` uses `text` and is required.

  Default: `''::text`.

- `image_path` uses `text` and is required.

  Default: `''::text`.

- `darkmode_image_path` uses `text` and is nullable.

- `chat_theme_color` uses `text` and is nullable.

- `chat_theme_color_override` uses `text` and is nullable.

- `static_frame_paths` uses `text[]` and is required.

  Default: `'{}'::text[]`.

- `video_variants_json` uses `text` and is required.

  Default: `'{}'::text`.

- `darkmode_video_variants_json` uses `text` and is required.

  Default: `'{}'::text`.

- `video_variant_repair_json` uses `text` and is required.

  Default: `'{}'::text`.

- `darkmode_video_variant_repair_json` uses `text` and is required.

  Default: `'{}'::text`.

- `revision` uses `bigint` and is required.

  Default: `0`.

- `updated_at_ms` uses `bigint` and is required.

  Default: `((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint`.

- `image_variant_assets_json` uses `text` and is required.

  Default: `'{"assets":[]}'::text`.

- `avatar_asset_repair_json` uses `text` and is required.

  Default: `'{"repairs":[]}'::text`.

- `choreography_profile_json` uses `text` and is nullable.

- `finalization_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

- `avatar_milestones_json` uses `text` and is required.

  Default: `'{}'::text`.

- `legacy_folded_at_ms` uses `bigint` and is nullable.

- `advanced_avatar_variants_json` uses `text` and is required.

  Default: `'{}'::text`.

- `avatar_visual_metadata_json` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `avatar_state_pkey` covers `singleton`.
