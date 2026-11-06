# `spaces.action_arguments`

Arguments recorded for an artifact action invocation.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `action_argument_id` uses `bigint` and is required.

  Default: `nextval('spaces.action_arguments_action_argument_id_seq'::regclass)`.

  Local row identifier (primary key).

- `invocation_id` uses `text` and is required.

  FK → `spaces.action_invocations.invocation_id`

- `argument_name` uses `text` and is required.

- `scalar_value` uses `text` and is nullable.

- `text_content` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `action_arguments_invocation_id_fkey` covers `invocation_id`. References [spaces.action_invocations](/opt/muse/skills/muse_db/references/tables/spaces.action_invocations.md), columns `invocation_id`.

- PRIMARY KEY `action_arguments_pkey` covers `action_argument_id`.

- UNIQUE `action_arguments_invocation_id_argument_name_key` covers `invocation_id`, `argument_name`.
