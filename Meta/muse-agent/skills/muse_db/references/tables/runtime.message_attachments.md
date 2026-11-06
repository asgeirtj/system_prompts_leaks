# `runtime.message_attachments`

Files and media attached to messages, in display order.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `attachment_id` uses `bigint` and is required.

  Default: `nextval('runtime.message_attachments_attachment_id_seq'::regclass)`.

  Local row identifier (primary key).

- `message_id` uses `text` and is required.

  FK → `runtime.messages.message_id`

- `ordinal` uses `integer` and is required.

- `attachment_kind` uses `text` and is required.

- `file_uri` uses `text` and is required.

- `media_type` uses `text` and is nullable.

- `byte_len` uses `bigint` and is nullable.

- `sha256` uses `bytea` and is nullable.

- `caption_text` uses `text` and is nullable.

- `transcription_text` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `message_attachments_message_id_fkey` covers `message_id`. References [runtime.messages](/opt/muse/skills/muse_db/references/tables/runtime.messages.md), columns `message_id`.

- PRIMARY KEY `message_attachments_pkey` covers `attachment_id`.

- UNIQUE `message_attachments_message_id_ordinal_key` covers `message_id`, `ordinal`.
