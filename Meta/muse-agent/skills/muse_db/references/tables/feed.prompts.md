# `feed.prompts`

Saved Feed prompts, template values and enabled state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `prompt_id` uses `text` and is required.

  Local row identifier (primary key).

- `template_id` uses `text` and is nullable.

  Legacy built-in Feed template key; the template catalog is code-owned, not a table.

- `slot_values` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `free_text` uses `text` and is required.

  Default: `''::text`.

- `enabled` uses `boolean` and is required.

  Default: `true`.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

- `slot_ingredients` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `generation_queued_at_ms` uses `bigint` and is nullable.

- `full_prompt` uses `text` and is nullable.

- `generation_queued_requester` uses `jsonb` and is nullable.

## Keys and relationships

- PRIMARY KEY `prompts_pkey` covers `prompt_id`.
