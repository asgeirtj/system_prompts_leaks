# `runtime.requests`

Request ancestry, origin, transcript surface and work classification.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `request_id` uses `text` and is required.

  Local row identifier (primary key).

- `root_request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `parent_request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `request_origin` uses `text` and is required.

- `transcript_surface` uses `runtime.transcript_surface` and is required.

- `root_work_class` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `requests_parent_request_id_fkey` covers `parent_request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- FOREIGN KEY `requests_root_request_id_fkey` covers `root_request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- PRIMARY KEY `requests_pkey` covers `request_id`.
