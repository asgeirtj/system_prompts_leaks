# `scheduler.terminal_signals`

Terminal signals and messages for completed scheduler runs.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `run_id` uses `text` and is required.

  Local row identifier (primary key).

- `signal_type` uses `text` and is required.

- `message` uses `text` and is nullable.

- `producer_request_trace_json` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `created_at_utc` uses `bigint` and is required.

  Default: `0`.

- `producer_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `producer_phase_attempt` uses `integer` and is nullable.

- `producer_boot_generation` uses `text` and is nullable.

- `blocked_reason` uses `text` and is nullable.

- `blocked_dependency` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `terminal_signals_pkey` covers `run_id`.
