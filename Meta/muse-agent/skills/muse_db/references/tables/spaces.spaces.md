# `spaces.spaces`

Artifact inventory, names, source locations and session associations.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `space_slug` uses `text` and is required.

  Local row identifier (primary key).

- `display_name` uses `text` and is required.

- `space_root_path` uses `text` and is nullable.

- `db_path` uses `text` and is nullable.

- `force_order` uses `bigint` and is nullable.

- `session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `construction_status` uses `text` and is nullable.

- `construction_updated_at_text` uses `text` and is nullable.

- `created_at_text` uses `text` and is nullable.

- `updated_at_text` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `archived_at` uses `timestamp with time zone` and is nullable.

- `current_build_id` uses `text` and is nullable.

  Current artifact-build correlation id stored on this artifact row; the build workspace is on disk and has no separate PostgreSQL owner table.

- `created_from_proposal_id` uses `text` and is nullable.

  Soft local reference → `spaces.proposals.proposal_id`.

- `space_id` uses `uuid` and is required.

  Default: `gen_random_uuid()`.

  Soft local reference → `spaces.spaces.space_id`.

- `source` uses `text` and is required.

  Default: `'local'::text`.

- `shortcode` uses `text` and is nullable.

- `source_url` uses `text` and is nullable.

- `has_server_actions` uses `boolean` and is required.

  Default: `true`.

- `cloudflare_share_manifest_sha256` uses `text` and is nullable.

- `content_share_allowed` uses `boolean` and is nullable.

- `content_share_review_sha256` uses `text` and is nullable.

- `declared_capabilities_json` uses `jsonb` and is required.

  Default: `'{"connectors": [], "schema_version": 1, "public_web_read": false}'::jsonb`.

- `capability_manifest_revision` uses `bigint` and is required.

  Default: `0`.

- `builder_provenance_pending_build_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship. Current build id whose builder provenance capture has not completed.

- `builder_provenance_lost_build_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship. Successful served build id whose builder provenance was lost; retained across later edit attempts until a newer build records evidence.

- `builder_provenance_build_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship. Build id whose bounded builder tool-evidence projection is stored on this row.

- `builder_provenance_evidence_jsonl` uses `text` and is nullable.

  Daemon-owned bounded JSONL of provenance-capable builder tool calls and outputs.

- `share_disclosure_review` uses `jsonb` and is nullable.

- `is_promoted` uses `boolean` and is required.

  Default: `false`.

  UI placement: false means Library; true means Spaces in the sidebar. Independent of runtime kind and pinning.

- `artifact_audit_review` uses `jsonb` and is nullable.

  Runtime-owned artifact review record for the current build: bounded recent public chat turns that authorize the artifact, reviewed-coverage identities, and retained critic verdicts.

- `saved_at_ms` uses `bigint` and is nullable.

- `publisher_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

- `publisher_name` uses `text` and is nullable.

- `saved_record_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

- `saved_available` uses `boolean` and is nullable.

- `saved_target_shortcode` uses `text` and is nullable.

- `auto_publish_enabled` uses `boolean` and is required.

  Default: `false`.

- `builtin_manifest_sha256` uses `text` and is nullable.

  Approved digest of the complete publish manifest, icon and preview included, that artifact.add_builtin recorded for a built-in app; a matching share skips the text, credential and disclosure reviews, and also the image and video checks unless builtin_personalized is true.

- `builtin_personalized` uses `boolean` and is required.

  Default: `false`.

  True when the recorded built-in copy carries the user's own Muse; a matching share still runs the image and video checks.

## Keys and relationships

- PRIMARY KEY `spaces_pkey` covers `space_slug`.
