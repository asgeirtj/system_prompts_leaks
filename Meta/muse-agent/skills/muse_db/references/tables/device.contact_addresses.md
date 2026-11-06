# `device.contact_addresses`

Labeled postal addresses belonging to synchronized contacts.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `contact_address_id` uses `bigint` and is required.

  Default: `nextval('device.contact_addresses_contact_address_id_seq'::regclass)`.

  Local row identifier (primary key).

- `contact_id` uses `bigint` and is required.

  FK → `device.contacts.contact_id`

- `label` uses `text` and is nullable.

- `street` uses `text` and is nullable.

- `city` uses `text` and is nullable.

- `state` uses `text` and is nullable.

- `postal_code` uses `text` and is nullable.

- `country` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `contact_addresses_contact_id_fkey` covers `contact_id`. References [device.contacts](/opt/muse/skills/muse_db/references/tables/device.contacts.md), columns `contact_id`.

- PRIMARY KEY `contact_addresses_pkey` covers `contact_address_id`.
