# `spaces.action_results`

Results or errors from artifact action invocations.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `invocation_id` uses `text` and is required.

  FK → `spaces.action_invocations.invocation_id`

- `result_text` uses `text` and is nullable.

- `error_text` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `action_results_invocation_id_fkey` covers `invocation_id`. References [spaces.action_invocations](/opt/muse/skills/muse_db/references/tables/spaces.action_invocations.md), columns `invocation_id`.

- PRIMARY KEY `action_results_pkey` covers `invocation_id`.
