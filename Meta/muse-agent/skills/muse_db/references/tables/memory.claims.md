# `memory.claims`

Memory claims, supporting quotations and their recorded importance.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `claim_id` uses `text` and is required.

  Local row identifier (primary key).

- `run_id` uses `text` and is required.

  Opaque correlation identifier; no declared local table relationship.

- `kind` uses `text` and is required.

- `salience` uses `text` and is required.

- `claim_text` uses `text` and is required.

- `quote` uses `text` and is nullable.

- `speaker` uses `text` and is required.

- `evidence_handles` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `supersedes_claim_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

- `status` uses `text` and is required.

  Default: `'active'::text`.

- `confidence` uses `double precision` and is required.

- `first_seen` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `reinforced_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `valid_until` uses `timestamp with time zone` and is nullable.

- `source_path` uses `text` and is required.

- `source_line` uses `bigint` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `claims_pkey` covers `claim_id`.
