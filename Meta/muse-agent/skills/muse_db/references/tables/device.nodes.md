# `device.nodes`

Paired devices, advertised commands and enabled permissions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `node_id` uses `text` and is required.

  Local row identifier (primary key).

- `node_kind` uses `text` and is required.

- `display_name` uses `text` and is nullable.

- `platform` uses `text` and is required.

  Default: `'unknown'::text`.

- `enabled_permissions_json` uses `text` and is required.

  Default: `'[]'::text`.

- `commands_json` uses `text` and is required.

  Default: `'[]'::text`.

- `version` uses `text` and is nullable.

- `device_family` uses `text` and is nullable.

- `model_id` uses `text` and is nullable.

  Model or device-provider identifier; no single Muse PostgreSQL owner table.

- `is_wakeup_supported` uses `boolean` and is nullable.

- `delivery_app` uses `text` and is nullable.

- `paired_at_text` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `last_seen_at_text` uses `text` and is nullable.

- `last_seen_at` uses `timestamp with time zone` and is nullable.

- `status` uses `text` and is required.

  Default: `'registered'::text`.

- `revoked` uses `boolean` and is required.

  Default: `false`.

- `contacts_last_synced_at` uses `text` and is nullable.

- `contacts_last_received_at` uses `text` and is nullable.

- `contacts_last_sync_status` uses `text` and is required.

  Default: `'never'::text`.

- `contacts_last_sync_error` uses `text` and is nullable.

- `contacts_contact_count` uses `bigint` and is required.

  Default: `0`.

- `health_last_received_at` uses `text` and is nullable.

- `health_last_sync_status` uses `text` and is required.

  Default: `'never'::text`.

- `health_last_sync_error` uses `text` and is nullable.

- `data_sources_json` uses `text` and is required.

  Default: `'{}'::text`.

- `invoke_protocol` uses `text` and is required.

  Default: `'node'::text`.

- `pairing_status` uses `text` and is required.

  Default: `'ok'::text`.

- `contacts_content_sha256` uses `text` and is nullable.

- `metadata_json` uses `text` and is required.

  Default: `'{}'::text`.

- `location_sharing_mode` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `nodes_pkey` covers `node_id`.
