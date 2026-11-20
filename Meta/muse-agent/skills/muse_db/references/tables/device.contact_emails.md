# `device.contact_emails`

Labeled email addresses belonging to synchronized contacts.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `contact_email_id` uses `bigint` and is required.

  Default: `nextval('device.contact_emails_contact_email_id_seq'::regclass)`.

  Local row identifier (primary key).

- `contact_id` uses `bigint` and is required.

  FK → `device.contacts.contact_id`

- `label` uses `text` and is nullable.

- `email` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `contact_emails_contact_id_fkey` covers `contact_id`. References [device.contacts](/opt/muse/skills/muse_db/references/tables/device.contacts.md), columns `contact_id`.

- PRIMARY KEY `contact_emails_pkey` covers `contact_email_id`.
