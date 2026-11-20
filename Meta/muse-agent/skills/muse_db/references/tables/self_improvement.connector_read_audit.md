# `self_improvement.connector_read_audit`

Connector reads, their stated purpose and request attribution.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `audit_id` uses `bigint` and is required.

  Default: `nextval('self_improvement.connector_read_audit_audit_id_seq'::regclass)`.

  Local row identifier (primary key).

- `connector_id` uses `text` and is nullable.

  Connector identity owned by authd; no Muse PostgreSQL owner table.

- `device_node_id` uses `text` and is nullable.

  Soft local reference → `device.nodes.node_id`.

- `method_key` uses `text` and is required.

- `purpose` uses `text` and is required.

- `request_id` uses `text` and is required.

  Soft local reference → `runtime.requests.request_id`.

- `request_origin` uses `text` and is required.

- `sensitivity` uses `text` and is required.

- `source_handle` uses `text` and is nullable.

- `metadata` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `connector_read_audit_pkey` covers `audit_id`.
