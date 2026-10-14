# Saved

Read and manage Facebook saved items and collections.

## Commands

### `saved list`

```
facebook-cli saved list [--type <category>] [--collection-id <id>] [--limit N] [--after <opaque>]
```

Lists saved items, most recent first.

- `--type` (optional): filter by category. One of `post`, `video`, `link`, `product`, `reel`, `event`, `page`.
- `--collection-id` (optional): list items from a specific collection.
- `--limit` (optional): maximum number of items per page (max 20).
- `--after` (optional): opaque next-page cursor from a previous response's `paging.cursors.after` (`--cursor` accepted as a back-compat alias).

**Response shape**:

```json
{
  "data": [
    {
      "id": "<save-relationship-id>",
      "savable_id": "<content-id>",
      "type": "post",
      "saved_time": 1719500000,
      "title": "...",
      "description": "...",
      "permalink": "https://www.facebook.com/..."
    }
  ],
  "paging": { "cursors": { "before": "...", "after": "..." } }
}
```

To fetch the next page, pass `paging.cursors.after` as `--after`.

### `saved add`

```
facebook-cli saved add --savable-id <FBID> [--type <category>] [--collection-id <id>]
```

Saves an item. A clear user request may proceed without an additional approval.

- `--savable-id` (required): Facebook ID of the content (post, page, listing, etc.) — sent as the `id` field.
- `--type` (optional): defaults to `post` server-side. One of `post`, `video`, `link`, `product`, `reel`, `event`, `page`.
- `--collection-id` (optional): add the item to a specific collection. Omit to save to the default All Saves bucket.

**Response**: `{ "id": "<savable-id>", "saved": true }`

### `saved remove`

```
facebook-cli saved remove --savable-id <FBID> [--type <category>] [--collection-id <id>]
```

Removes a previously-saved item. A clear user request may proceed without an additional approval.

- `--savable-id` (required): Facebook ID of the saved content (post, page, listing, etc.) — the `savable_id` from `saved list`, sent as the `id` field.
- `--type` (optional): defaults to `post` server-side. Pass the item's category to disambiguate.
- `--collection-id` (optional): remove the item only from this collection. Omit to fully unsave.

This command only removes the save relationship — it does not delete the underlying post/video/page.

**Response**: `{ "id": "<savable-id>", "unsaved": true }`

### `saved collections list`

```
facebook-cli saved collections list
```

Lists collections.

**Response shape**:

```json
{
  "data": [
    { "id": "<collection-id>", "name": "...", "item_count": 5 }
  ]
}
```

### `saved collections create`

```
facebook-cli saved collections create --name "My Collection"
```

Creates an empty collection. A clear user request may proceed without an additional approval.

**Response**: `{ "collection_id": "<id>", "name": "<name>" }`

## Operating notes

- Pagination: `saved list` returns `paging.cursors.after`; pass it as `--after` to fetch the next page. Do not auto-paginate without user direction.
- Saved item IDs — use `savable_id` for unsave and chaining: every item from `saved list` has two IDs. `id` is the save-relationship entry; `savable_id` is the underlying content. `saved remove` identifies the item by content, so pass the `savable_id` to `saved remove --savable-id <savable_id>` (add `--type <type>` to disambiguate; default is POST). Omitting `--collection-id` fully unsaves the item; passing it removes the item only from that collection. `saved remove` never deletes the post/video/page itself. When chaining to other commands (e.g. `post comments read`, `timeline fetch`), also use `savable_id`.
- Saved-item writes are auto-allowed by default. Resolve the exact item or collection before changing it.
