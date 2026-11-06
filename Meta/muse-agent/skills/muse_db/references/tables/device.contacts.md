# `device.contacts`

Contacts synchronized from a device, with source identity and names.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `contact_id` uses `bigint` and is required.

  Default: `nextval('device.contacts_contact_id_seq'::regclass)`.

  Local row identifier (primary key).

- `node_id` uses `text` and is required.

  FK → `device.nodes.node_id`

- `platform` uses `text` and is required.

- `external_contact_id` uses `text` and is required.

  External/provider identifier; no Muse PostgreSQL owner table.

- `display_name` uses `text` and is nullable.

- `given_name` uses `text` and is nullable.

- `family_name` uses `text` and is nullable.

- `organization` uses `text` and is nullable.

- `job_title` uses `text` and is nullable.

- `birthday_text` uses `text` and is nullable.

- `note` uses `text` and is nullable.

- `synced_at_text` uses `text` and is required.

- `deleted_at` uses `timestamp with time zone` and is nullable.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `thumbnail` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `contacts_node_id_fkey` covers `node_id`. References [device.nodes](/opt/muse/skills/muse_db/references/tables/device.nodes.md), columns `node_id`.

- PRIMARY KEY `contacts_pkey` covers `contact_id`.

- UNIQUE `contacts_node_id_external_contact_id_key` covers `node_id`, `external_contact_id`.
