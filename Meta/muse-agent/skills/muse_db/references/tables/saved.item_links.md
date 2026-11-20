# `saved.item_links`

Relations from a saved item to other records: the widget, citation or chat message it was saved from, and its attached images, videos and files.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `item_id` uses `text` and is required.

  Soft local reference to `saved.items.item_id`.

- `link_kind` uses `text` and is required.

  Relation kind, `widget` or `citation`; it decides how to read `target_id`.

- `target_id` uses `text` and is required.

  Interpret by `link_kind`: `widget` is `runtime.widgets.widget_id`; `citation` is `<message_id>#<citation_id>` of an inline product chip.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `item_links_pkey` covers `item_id`, `link_kind`, `target_id`.
