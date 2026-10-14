# Facebook Comments

Read comments on Facebook posts.

## Command

```bash
facebook-cli post comments read --post-id <post-id> [--limit <n>] [--after <cursor>]
```

**Options:**
- `--post-id` (required): Post ID to read comments from
- `--limit` (optional): Maximum number of comments per page (max 20; higher values are capped server-side)
- `--after` (optional): Pagination cursor — pass the `paging.cursors.after` value from the previous response to fetch the next page

## Response Fields

The response is cursor-paginated:
- `data`: Array of comment objects, each with:
  - `id`: Comment ID
  - `author_name`: Name of the comment author
  - `text`: Comment text content
  - `created_time`: Unix timestamp of when the comment was created
  - `reply_count`: Number of replies to this comment
  - `comment_url`: Direct Facebook URL to this specific comment. Use this when the user wants to see or share a particular comment.
- `summary.post_url`: Permalink to the original post on Facebook. Always present — use this to link the user back to the post. (This moved from the old top-level `post_url` into `summary` when the endpoint became paginated.)
- `paging.cursors.after`: Opaque cursor for the next page. **Present only when more comments exist** — its absence means you've reached the end. Pass it back via `--after` to continue.

When presenting comments to the user, always include `summary.post_url` so they can navigate to the original post, and mention that each comment has a direct `comment_url` link. To gather more than one page, follow `paging.cursors.after` with `--after` until it's absent.

## Operating Rules

1. When presenting comments, always include `summary.post_url` for the parent post and `comment_url` for each comment. Never show raw comment IDs or post IDs — always use the URLs.
2. When the user asks about "recent" or "latest" comments, always state the date range you used in your response (e.g., "Here are comments from the past 7 days").
3. When organizing comments across multiple posts, present them grouped per post with clear separation.
4. Include timestamps (`created_time`) for comments when presenting them.
5. When cross-referencing commenters across posts, accurately identify only people who appear in multiple threads. Do not fabricate commenter names.
