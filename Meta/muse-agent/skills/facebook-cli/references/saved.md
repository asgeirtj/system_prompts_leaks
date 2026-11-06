# Facebook saved items

- `saved` commands let Muse find previously saved items, add or remove saved items, and organize saved items in collections.

## Find saved content

```sh
/opt/hatch/bin/facebook-cli saved list [--type <post, post_with_photo, video, reel, link, page, product, event, or another returned type>] [--collection-id '<id from saved collections list>'] [--limit <up to 20>] [--after '<paging.cursors.after from the previous response>']
```

- `saved list` returns the user's saved items in `data`, most recently saved first. A page holds at most 20 items.

- `summary.total_count` is how many saved items the query matches across every page, so give it as the total instead of counting the items you read. It is null with `--type`, and with `--collection-id` it counts that collection. It can be a little higher than the items listed, because Facebook leaves out some content it won't show.

- Each item's `collection_ids` lists the collections that hold it, by the IDs `saved collections list` returns. An empty list means the item is in no collection. It lists every collection that holds the item, even when `--collection-id` narrows the read.

- Read every page when the request covers all of the user's saves, such as sorting everything into collections or finding every item in no collection. For a summary or suggestions, read up to five pages, the newest 100 items. For a narrower request, such as the most recent saves, read the next page only when the user asks for more. Whenever you stop before the last page, say how many of the total you looked at.

```sh
/opt/hatch/bin/facebook-cli saved collections list [--limit <up to 20>] [--after '<paging.cursors.after from the previous response>']
```

- `saved collections list` returns each saved collection. A page holds at most 20 collections.
- Read every page of collections before creating a collection or choosing among them. To file into a named collection, stop once it appears.

- For both `saved collections list` and `saved list`, to see more results, pass the previous response's `paging.cursors.after` as `--after` with the same query and filters. A missing `paging` means there are no more results.

## Read the saved content

- `saved list` already shows each item's title, description and link. To open one in more detail, use the reader for its `type`:
  - `post`, `post_with_photo`, `video` and `reel`: pass the item's returned `permalink` unchanged to `post read --url`. Its `id` and `savable_id` are not post IDs. For comments or reactions, use `posts[0].post_id` from a successful post read with `post comments read --post-id` or `post reactions read --post-id`.
  - `page`: pass its `savable_id` to `profile info --profile-id`
  - `product`: pass its `savable_id` to `marketplace listing details --listing-id`
  - `event`: pass its `savable_id` to `events details --event-id`

## Suggest what to do with saved items

- When the user asks what to do with their saved items, start with a short summary of their saves before any suggestion: how many items they've saved, how many collections they have, and how many items are in no collection.

- Take the item total from an unfiltered `saved list` and the collection total from `saved collections list`, both from `summary.total_count`. Count the items in no collection, whose `collection_ids` is empty, across the pages you read, and say how many items that count covers when you read fewer than all of them.

- Base each suggestion on saved items you read, and link them.

- Leave unsaving out of suggestions unless the user asked to clear out their saves.

## Save or remove an item

- A clear request to save an item, file it in or take it out of a collection, or create a collection authorizes the change without another confirmation, because saves are private and easy to undo. Resolve the exact item and collection first. When several saved items match, show each one's title and link and ask which one before changing anything.

- Unsave an item only when the user asked to remove it or to clear out saves like it. When that request covers more than one item, list the items you'd unsave with their links, and run `saved remove` after the user confirms that list. A yes to suggestions that didn't name the items to remove doesn't authorize unsaving.

- Each item has an `id` for the save itself and a `savable_id` for the content. `add` and `remove` take `savable_id`.

- For an item that is already saved, copy `savable_id` from its own saved list entry, because the IDs don't follow the order of the list. Both assume `post` when `--type` is omitted, so for anything else pass the item's returned `type` unchanged.

```sh
/opt/hatch/bin/facebook-cli saved add --savable-id '<savable_id from saved list or another read>' [--type <post (the default), post_with_photo, video, reel, link, page, product, event, or another returned type>] [--collection-id '<id from saved collections list>']
```

- `saved add` saves an item. Without a collection, it saves to 'All Saves'.

```sh
/opt/hatch/bin/facebook-cli saved remove --savable-id '<savable_id from saved list>' [--type <post (the default), post_with_photo, video, reel, link, page, product, event, or another returned type>] [--collection-id '<collection to remove it from; omit to unsave completely>']
```

- `saved remove` removes a saved item. With a collection passed in, it removes only that membership. Without a collection, it fully unsaves the item.

- To move an item to another collection, add it to the new collection first, unless its `collection_ids` already include that collection. Once the item is in the new collection, run `saved remove --collection-id` for each collection it leaves; if the add failed, leave the item where it was. A move the user asked for authorizes both steps.

- A successful `add` returns `saved: true` and `remove` returns `unsaved: true`. Confirm the change from that result instead of listing again.

- Tell the user a change is done only when its command returned that result, and describe it by the item whose `savable_id` the command used. When a command failed or never ran, say which changes are still undone.

- Before filing an item, check its `collection_ids` from `saved list`. When it is already in that collection, skip the add and report it as already there, not as added.

```sh
/opt/hatch/bin/facebook-cli saved collections create --name '<collection name>'
```

- `saved collections create` creates a new saved collection.
