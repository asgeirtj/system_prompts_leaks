# `agent.sessions`

Session identity, root request and archival timestamps.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `session_id` uses `text` and is required.

  Local row identifier (primary key).

- `root_request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `archived_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- FOREIGN KEY `sessions_root_request_id_fkey` covers `root_request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- PRIMARY KEY `sessions_pkey` covers `session_id`.
