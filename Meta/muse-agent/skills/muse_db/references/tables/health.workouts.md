# `health.workouts`

Recorded workouts and their provider, device and timing.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `workout_id` uses `bigint` and is required.

  Default: `nextval('health.workouts_workout_id_seq'::regclass)`.

  Local row identifier (primary key).

- `provider` uses `text` and is required.

- `node_id` uses `text` and is nullable.

  Soft local reference → `device.nodes.node_id`.

- `external_workout_id` uses `text` and is required.

  External/provider identifier; no Muse PostgreSQL owner table.

- `bundle_id` uses `text` and is nullable.

  Source application bundle identifier.

- `timezone` uses `text` and is nullable.

- `workout_type` uses `text` and is required.

- `start_at` uses `timestamp with time zone` and is required.

- `end_at` uses `timestamp with time zone` and is nullable.

- `active_seconds` uses `double precision` and is nullable.

- `energy_kcal` uses `double precision` and is nullable.

- `distance_meters` uses `double precision` and is nullable.

- `hr_max_bpm` uses `double precision` and is nullable.

- `hr_average_bpm` uses `double precision` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `workouts_pkey` covers `workout_id`.
