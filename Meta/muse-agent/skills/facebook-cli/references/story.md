# Facebook stories

- `story feed` reads the user's story tray, the recent stories from friends and Pages they follow.

```sh
/opt/hatch/bin/facebook-cli story feed [--limit <1 to 50 author buckets, default 20>]
```

- Results come back as one bucket per author, each with its `stories`.

- Each bucket has `owner_name`, `owner_id` and `is_seen`. Describe each story by the owner's name, whether it's been seen, its `message_text` and a clickable link to its `story_url`. Keep IDs internal.
