# Facebook Feed

Browse your ranked Facebook feeds — the algorithmic newsfeed and the friends-only feed.

## Commands

### Newsfeed

Fetch the ranked algorithmic newsfeed (organic stories only, no ads).

```bash
facebook-cli feed newsfeed [--limit <n>] [--after <cursor>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--limit` | No | Maximum stories to return (default 10, max 10) |
| `--after` | No | Pagination cursor from a previous response's `next_cursor` (`--cursor` accepted as a back-compat alias) |

**Examples:**  
```bash
# Fetch your newsfeed
facebook-cli feed newsfeed

# Fetch up to 10 stories (the max)
facebook-cli feed newsfeed --limit 10

# Fetch next page
facebook-cli feed newsfeed --limit 10 --after <after_cursor_from_previous>
```

### Friends Feed

Fetch the ranked friends-only feed (stories from friends only).

```bash
facebook-cli feed friends [--limit <n>] [--after <cursor>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--limit` | No | Maximum stories to return (default 10, max 10) |
| `--after` | No | Pagination cursor from a previous response's `next_cursor` (`--cursor` accepted as a back-compat alias) |

**Examples:**  
```bash
# Fetch friends feed
facebook-cli feed friends

# Fetch 5 stories from friends
facebook-cli feed friends --limit 5
```

## Response Fields

Both commands return the compact `social_posts_v1` collection shared with
social search:

- `posts`: Ranked feed stories with `post_id`, `url`, `platform`, `created_at`,
  `username`, `post_caption`, `header_text`, and available media/engagement
  fields. `post_caption` prefers authored text, then a media summary, then the
  provider-generated story header also emitted as `header_text`. Treat a media
  summary or story header as a description, never as the author's quoted words.
- `next_cursor`: Cursor for the next page (pass as `--after`)
- `has_next_page`: Whether another page is available

Read `posts[]` directly. Do not guess a provider response path or pipe the
command through `jq`. A provider schema mismatch fails instead of returning an
empty collection.

## Operating Rules

1. Use `feed newsfeed` for the standard ranked feed. Use `feed friends` for friends-only content.
2. Always check `next_cursor` — if present, more pages are available. Offer to fetch the next page.
3. Feed stories produce `post_id` values that can be used with `post comments read` and `post reactions read`.
4. Present stories in the order returned (they are ML-ranked by relevance).
5. Do not editorialize or add subjective commentary on post content.
6. When presenting stories, always include `url` so the user can view them on Facebook.
