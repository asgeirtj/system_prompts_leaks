# `memory.embedding_models`

Embedding-model names, dimensions and distance metrics.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `embedding_model_id` uses `bigint` and is required.

  Default: `nextval('memory.embedding_models_embedding_model_id_seq'::regclass)`.

  Local row identifier (primary key).

- `model_name` uses `text` and is required.

- `dimensions` uses `integer` and is required.

- `distance_metric` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `embedding_models_pkey` covers `embedding_model_id`.

- UNIQUE `embedding_models_model_name_dimensions_distance_metric_key` covers `model_name`, `dimensions`, `distance_metric`.
