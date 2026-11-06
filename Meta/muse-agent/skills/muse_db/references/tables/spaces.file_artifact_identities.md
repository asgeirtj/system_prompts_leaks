# `spaces.file_artifact_identities`

Stable identities for file artifacts.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `slug` uses `text` and is required.

  Local row identifier (primary key).

- `artifact_id` uses `uuid` and is required.

  Default: `gen_random_uuid()`.

  Stable local artifact identifier owned by this row; `slug` is the primary key.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `file_artifact_identities_pkey` covers `slug`.
