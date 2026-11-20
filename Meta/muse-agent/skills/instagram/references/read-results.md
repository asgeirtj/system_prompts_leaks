# Instagram read commands

- These are subcommands of `/opt/hatch/bin/instagram-cli`. Each needs `--account-id` with the user's own `user_fbid`, as the [connector docs](/opt/hatch/connectors/instagram/CONNECTOR.md) explain. The Instagram service validates these flags, so copy them exactly.

- Keep IDs and cursors inside tool calls. Show the user usernames, content and links.

## Account search

- Find account candidates by name or username with `account-search --query TEXT`.
  The query must be 1–256 bytes after trimming. `--count` defaults to 10, must
  be positive, and values above 20 are capped at 20.

- Deduplicate results across pages by `id`. These are possible matches, not
  verified identities; an empty result does not mean the username is free.
- Present candidates from `account-search` results directly. Do not call
  `user-profile` for each candidate unless the user asks for details the
  search results lack.

- Reuse an identity already established by the task when it clearly matches
  a result. Otherwise, compare returned names and links. If the intended
  account is still unclear, have the user choose by username and full name
  before using any candidate ID. Never guess a username.

```sh
/opt/hatch/bin/instagram-cli account-search --account-id <user_own_fbid> \
  --query "<name>" --count 10
/opt/hatch/bin/instagram-cli account-search --account-id <user_own_fbid> \
  --query "<name>" --count 10 --after <cursor>
```

- For another page, keep the query and count unchanged and pass
  `page_info.end_cursor` as `--after` when `page_info.has_next_page` is true.
  A page can hold fewer results than `--count`, so rely on `has_next_page` to
  tell whether more remain. Search only as far as the task needs. This
  command searches accounts, not posts, Reels, hashtags, or messages.

## Profiles and people

- `profile` reads the user's own profile when you omit `--username` and `--profile-url`, or another account's profile with one `--username` (with or without `@`) or `--profile-url` per call. Read `profiles[]`, including `bio`, `website` and the follower and following counts. Use it instead of the follower lists when only counts are needed.

- `user-profile` reads another account by `--user-id`, one `--username` or `--profile-url`. Prefer `--user-id` when an FBID from earlier output is known. Results are in `profiles[]`.

- For `profile` and `user-profile`, an empty `profiles[]` alone does not establish that a handle is available or reserved, or that the command failed.

```sh
/opt/hatch/bin/instagram-cli profile --account-id <user_own_fbid>
/opt/hatch/bin/instagram-cli profile --account-id <user_own_fbid> --username @<username>
/opt/hatch/bin/instagram-cli profile --account-id <user_own_fbid> --profile-url https://instagram.com/<username>
/opt/hatch/bin/instagram-cli user-profile --account-id <user_own_fbid> --user-id <user_fbid>
```

- `followers` reads the user's own followers in `users[]`, newest first. `--count` defaults to 200. When `has_more` is true, pass `next_max_id` as `--after`.

- `following` reads the user's own following list in `users[]`. Another
  account's following list is unsupported. `--count` defaults to 200.
  When `page_info.has_next_page` is true, pass
  `page_info.end_cursor` as `--after`. Read only the requested scope and report
  partial coverage. If a page returns the cursor you just sent, stop and say
  the list may be incomplete; it has not been confirmed as the whole list.

- When the user asks what kind of accounts they follow (for example, which
  are pottery accounts), answer from the bio and category already in the
  `following` results before fetching individual profiles. If those don't
  settle it, say that account's kind is unknown rather than guessing.
  Separate what the profile says from your own inference, and include the
  profile link with the username when one is returned.

- Follower and following rows include `id`, `username`, `full_name` and `profile_pic_url`. Compare membership by `id` without looking up each profile.

- Rows for the user's own followers also include `follower_count` and `is_verified`. When a follower's row was already fetched with `followers`, use these fields instead of a `user-profile` call for that follower.

- To find every follower that matches a condition, such as every verified follower, page plain `followers` with `--after <next_max_id>` until `has_more` is false and check each row. A ranked call returns only the top rows of each batch, so it can miss matches.

- To rank the user's followers by their follower counts, as in "my top followers" or "my most popular followers", run `followers --sort-by follower_count` and follow its cursor as the next bullets describe. The server ranks them, so no profile lookups are needed.

- `--sort-by follower_count` ranks up to 10,000 followers per call, newest first, and returns the top `--count` of them (default 50, maximum 1,000) in `users[]`, highest `follower_count` first. Later calls do not return the rows below an earlier call's cutoff, so set `--count` to at least the number of top followers you need. `followers_ranked` is how many followers that call ranked.

- When a ranked call returns `has_more: true`, older followers are not ranked yet. Run the same command with `--after <next_max_id>` until `has_more` is false, then merge every batch by `follower_count` before you answer. If you stop early, say how many followers you ranked.

```sh
/opt/hatch/bin/instagram-cli followers --account-id <user_own_fbid> --count 25
/opt/hatch/bin/instagram-cli followers --account-id <user_own_fbid> --after <next_max_id>
/opt/hatch/bin/instagram-cli followers --account-id <user_own_fbid> --sort-by follower_count --count 20
/opt/hatch/bin/instagram-cli followers --account-id <user_own_fbid> --sort-by follower_count --count 20 --after <next_max_id>
/opt/hatch/bin/instagram-cli following --account-id <user_own_fbid> --after <end_cursor>
```

- `close-friends` reads the Close Friends list the user curated on Instagram. It is not ranked or inferred. For the people the user interacts with most, use `top-recipients` in the [Instagram Messages](/opt/hatch/connectors/instagram_messages/CONNECTOR.md) connector.

- `activity-notifications` reads `notifications` and `priority_notifications` without marking them seen. Pass `page_info.end_cursor` as `--after` for the next page.

```sh
/opt/hatch/bin/instagram-cli close-friends --account-id <user_own_fbid>
/opt/hatch/bin/instagram-cli activity-notifications --account-id <user_own_fbid> --after <end_cursor>
```

## Posts and feed

- `posts`, `feed` and `post` return the `social_posts_v1` collection described in the connector docs. Pass its `next_cursor` as `--after` and omit `--after` on the first request.

- `posts` reads the user's own posts when you omit `--username` and `--user-id`. Otherwise pass one or more usernames or one or more user IDs, comma-separated or repeated, but never both kinds in one command.

- `posts` filters include `--since`, `--until`, `--sort-order asc|desc`, `--limit` and `--post-types` with values such as `POST`, `REEL`, `STORY` and `HIGHLIGHT`. Pass `--post-types POST,REEL` for posts and reels only. The response can hold more posts than `--limit` requested.

```sh
/opt/hatch/bin/instagram-cli posts --account-id <user_own_fbid>
/opt/hatch/bin/instagram-cli posts --account-id <user_own_fbid> --username <username>,<username>
/opt/hatch/bin/instagram-cli posts --account-id <user_own_fbid> --user-id <user_fbid> --after <next_cursor>
/opt/hatch/bin/instagram-cli posts --account-id <user_own_fbid> --username <username> \
  --since 2026-01-01 --until 2026-02-01 --sort-order asc --limit 25 --post-types POST,REEL
```

- `feed` requires `--variant following` for the following feed or `--variant favorites` for the close-friends feed. The ranked home timeline cannot be read, and any other value fails.

- `post` reads one post with exactly one of `--id` or `--url`. `--id` takes a media ID alone or as `<media_id>_<owner_id>`, and `--url` takes the full post or reel link.

```sh
/opt/hatch/bin/instagram-cli feed --account-id <user_own_fbid> --variant following
/opt/hatch/bin/instagram-cli feed --account-id <user_own_fbid> --variant favorites --after <next_cursor>
/opt/hatch/bin/instagram-cli post --account-id <user_own_fbid> --id <media_id>
/opt/hatch/bin/instagram-cli post --account-id <user_own_fbid> --url https://www.instagram.com/reels/<shortcode>
```

- `tagged-posts` reads posts the user is tagged in, or with `--user-id ID[,ID]` posts other accounts are tagged in. It accepts `--since`, `--until`, `--sort-order`, `--limit` and `--after`.

- `recently-liked-posts` and `recently-commented-posts` read posts the user recently liked or commented on. They accept `--limit`, `--after`, `--since`, `--until` and `--sort-order`.

```sh
/opt/hatch/bin/instagram-cli tagged-posts --account-id <user_own_fbid> --user-id <user_fbid> --limit 25
/opt/hatch/bin/instagram-cli recently-liked-posts --account-id <user_own_fbid> --limit 10 --after <end_cursor>
/opt/hatch/bin/instagram-cli recently-commented-posts --account-id <user_own_fbid> --since 2026-01-01 --until 2026-02-01
```

## Comments and likers

- `fetch-post-comments --post-ids ID[,ID]` reads comments for one or more posts by media ID. Comment text is at `post_groups[].comments[].comment_text`. Filters are `--since`, `--until`, `--sort-order`, `--limit` and repeated or comma-separated `--author-ids`.

- `fetch-post-likers --post-ids ID[,ID]` reads likers at `post_groups[].reactors[]`, with the same filters and `--reactor-ids` in place of `--author-ids`.

- Each `post_groups[]` entry pages on its own. For an entry with `has_next_page`, request only its `media_id` as `--post-ids` with its `end_cursor` as `--after`.

```sh
/opt/hatch/bin/instagram-cli fetch-post-comments --account-id <user_own_fbid> --post-ids <media_id>,<media_id>
/opt/hatch/bin/instagram-cli fetch-post-comments --account-id <user_own_fbid> --post-ids <media_id> --limit 25 --after <end_cursor>
/opt/hatch/bin/instagram-cli fetch-post-likers --account-id <user_own_fbid> --post-ids <media_id> --reactor-ids <user_fbid>
```

## Saved content

- `saved-posts` reads the user's saved posts. Pass a `collection_id` from `saved-collections` as `--collection-id` for one collection. Without a collection it also accepts `--since`, `--until`, `--sort-order` and `--limit`.

- `saved-posts` and `recently-liked-posts` pages report `has_next_page` and `end_cursor`. Pass `end_cursor` as `--after`.

- `saved-collections` lists the user's collections and accepts `--after`. The connector docs cover saving, unsaving and changing collections.

```sh
/opt/hatch/bin/instagram-cli saved-collections --account-id <user_own_fbid>
/opt/hatch/bin/instagram-cli saved-posts --account-id <user_own_fbid> --since 2026-01-01 --until 2026-02-01 --sort-order asc --limit 25
/opt/hatch/bin/instagram-cli saved-posts --account-id <user_own_fbid> --collection-id "<collection_id>" --after <end_cursor>
```

## Stories and media

- `own-stories` reads the user's current stories.

- `own-stories-archive` reads the user's story archive. Pass `next_max_id` as `--max-id`, not `--after`, and prefer an item's nonempty video URL over its image URL.

- `stories-tray` reads the stories available from accounts the user follows. `--count` defaults to 200, and the response holds only media IDs.

- `story-media --ids ID[,ID]` returns each story's permalink and posting time. Use it only for stories the user asked about, never for every story in the tray.

- `media-understanding --media-ids ID[,ID]` returns stored descriptions, including a narrative summary and semantic understanding. It does not analyze the media again.

- `location-search --search-query TEXT` finds location IDs for story stickers. Optional `--latitude` and `--longitude` narrow the results and must be passed together.

```sh
/opt/hatch/bin/instagram-cli own-stories-archive --account-id <user_own_fbid> --max-id <next_max_id>
/opt/hatch/bin/instagram-cli stories-tray --account-id <user_own_fbid> --count 25
/opt/hatch/bin/instagram-cli story-media --account-id <user_own_fbid> --ids <story_id>,<story_id>
/opt/hatch/bin/instagram-cli media-understanding --account-id <user_own_fbid> --media-ids <media_id>
/opt/hatch/bin/instagram-cli location-search --account-id <user_own_fbid> \
  --search-query "<query>" --latitude <latitude> --longitude <longitude>
```

## Other output

- Reads outside `posts`, `feed` and `post` return Instagram's own decoded JSON. Present the meaningful content, such as names, text, media, links and captions.

- For a linked post or reel, use [content questions](content-questions.md). For account totals, use [account insight metrics](account-insights-metrics.md), and for analytics commands, use [analytics](analytics.md).
