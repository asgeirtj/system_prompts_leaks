# `spaces.shares`

Artifact sharing settings and publication state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `space_slug` uses `text` and is required.

  FK → `spaces.spaces.space_slug`

- `share_type` uses `text` and is required.

- `shortcode` uses `text` and is required.

- `is_active` uses `boolean` and is required.

  Default: `true`.

- `share_id` uses `text` and is nullable.

  Artifact-publishing service share identifier; no local owner table.

- `cloudflare_deploy_status` uses `text` and is nullable.

- `cloudflare_public_url` uses `text` and is nullable.

- `cloudflare_actions_url` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `cloudflare_storage_mode` uses `text` and is required.

  Default: `'d1_r2'::text`.

- `published_manifest_sha256` uses `text` and is nullable.

- `sharing_summary` uses `jsonb` and is nullable.

- `recipient_profiles` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

## Keys and relationships

- FOREIGN KEY `shares_space_slug_fkey` covers `space_slug`. References [spaces.spaces](/opt/muse/skills/muse_db/references/tables/spaces.spaces.md), columns `space_slug`.

- PRIMARY KEY `shares_pkey` covers `space_slug`.

- UNIQUE `shares_shortcode_key` covers `shortcode`.
