# `device.calendar_events`

Calendar events synchronized from paired devices.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `node_id` uses `text` and is required.

  FK → `device.nodes.node_id`

- `external_event_id` uses `text` and is required.

  Local row identifier (primary key).

- `title` uses `text` and is required.

- `start_at` uses `timestamp with time zone` and is required.

- `end_at` uses `timestamp with time zone` and is required.

- `is_all_day` uses `boolean` and is required.

- `external_calendar_id` uses `text` and is required.

  External/provider identifier; no Muse PostgreSQL owner table.

- `calendar_name` uses `text` and is required.

- `availability` uses `text` and is required.

- `location` uses `text` and is nullable.

- `notes` uses `text` and is nullable.

- `time_zone` uses `text` and is nullable.

- `start_local_date` uses `date` and is nullable.

- `end_local_date` uses `date` and is nullable.

- `is_recurring` uses `boolean` and is required.

- `url` uses `text` and is nullable.

- `event_status` uses `text` and is required.

- `calendar_color` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `calendar_events_node_id_fkey` covers `node_id`. References [device.nodes](/opt/muse/skills/muse_db/references/tables/device.nodes.md), columns `node_id`.

- PRIMARY KEY `calendar_events_pkey` covers `node_id`, `external_event_id`.
