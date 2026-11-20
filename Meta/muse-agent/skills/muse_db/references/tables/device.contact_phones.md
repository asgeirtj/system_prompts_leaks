# `device.contact_phones`

Labeled phone numbers belonging to synchronized contacts.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `contact_phone_id` uses `bigint` and is required.

  Default: `nextval('device.contact_phones_contact_phone_id_seq'::regclass)`.

  Local row identifier (primary key).

- `contact_id` uses `bigint` and is required.

  FK → `device.contacts.contact_id`

- `label` uses `text` and is nullable.

- `phone_e164` uses `text` and is nullable.

- `phone_raw` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `contact_phones_contact_id_fkey` covers `contact_id`. References [device.contacts](/opt/muse/skills/muse_db/references/tables/device.contacts.md), columns `contact_id`.

- PRIMARY KEY `contact_phones_pkey` covers `contact_phone_id`.
