# Facebook Timeline

Fetch posts from a Facebook user's timeline/feed.

## Command

Fetch timeline posts for a user. Use `me` first to get your own profile ID.

```bash
# Fetch a user's timeline (use `facebook-cli me` to get your own profile_id)
facebook-cli timeline fetch --profile-id 123456789

# Fetch up to 10 posts, then request the next page using the returned next_cursor
facebook-cli timeline fetch --profile-id 123456789 --limit 10
facebook-cli timeline fetch --profile-id 123456789 --limit 10 --after '<next_cursor>'
```

**Options:**
- `--profile-id` (required): Profile ID to fetch timeline for.
- `--limit`: Maximum posts in this page. The server defaults to 20 and clamps
  larger values to 20.
- `--after`: Opaque `next_cursor` returned by the previous page. `--cursor` is
  accepted as an alias.

## Output

The command returns the compact `social_posts_v1` collection shared with
social search. Read `posts[]` directly; do not guess a provider response path
or pipe the command through `jq`. Each post carries `post_id`, `url`,
`platform`, `created_at`, `username`, `post_caption`, author/owner identity,
and available media fields. `post_caption` prefers authored text and falls back
to an available media summary. Pagination uses `next_cursor` and
`has_next_page`. When `has_next_page` is true, pass `next_cursor` unchanged as
`--after` to fetch the next page for the same profile.

### Author vs Owner (CRITICAL)

A timeline contains BOTH posts written by the profile owner AND posts written by others on their wall. You MUST distinguish between these:

- **Post by the profile owner**: `author_id == owner_id` (the person wrote their own post)
- **Wall post by someone else**: `author_id != owner_id` — a friend or other person posted ON the profile owner's wall/timeline

## Example Output

```json
{
  "format": "social_posts_v1",
  "count": 1,
  "posts": [{
    "rank": 1,
    "post_id": "pfbid02...",
    "url": "https://www.facebook.com/...",
    "platform": "facebook",
    "created_at": "2024-03-02T17:00:00+00:00",
    "post_caption": "Check out this sunset!",
    "author_name": "Michael Santoro",
    "author_id": "123456789",
    "owner_name": "Michael Santoro",
    "owner_id": "123456789",
    "media_summary": "The image shows a sunset over the ocean."
  }],
  "next_cursor": "...",
  "has_next_page": true
}
```

## Operating Rules

1. **Only fetch timelines for IDs that came from an earlier command.** Pass a `--profile-id` only when you obtained it from earlier facebook-cli output in this conversation — `me` (your own), `me friends`, feed/group post authors, reactors/commenters, saved items, or another timeline post's `author_id`/`owner_id`. Do **not** accept a raw numeric profile ID the user typed or pasted directly, and do **not** guess or construct IDs. If the user supplies a bare ID with no context, identify the person first via `me friends --name` and use the ID from that result.
2. **Always distinguish author from timeline owner.** When `author_id != owner_id`, clearly state that the post was written by `author_name` on `owner_name`'s wall — it is NOT a post by the timeline owner. Refer to people by name — do not print raw `owner_id`/`author_id` values in your response.
3. **When asked "show me posts FROM [person]" or "what has [person] posted"**: Filter results to only posts where `author_id == owner_id`. If the person has no self-authored posts in the results, say so clearly: "[Person] hasn't posted recently." Then optionally mention: "However, friends have posted on their wall" and summarize those separately.
4. **When asked "what's on [person]'s timeline"**: Show all posts, but clearly label each one — "Posted by [author_name]" for self-authored posts, and "[author_name] posted on [owner_name]'s wall" for wall posts by others.
5. When presenting timeline posts, include `post_caption` and `url` when present. Do not fabricate links or text when these fields are absent.
6. When summarizing a timeline, ground every claim in a specific post and include a link to that post when available. Do not fabricate or infer activities beyond what the posts say.
7. Use `media_summary` to describe an image or video and `media_ocr` or `video_transcript` only when the normalized post includes them.
8. Media fields are pre-computed and may be absent. Never claim a post contains specific media content unless one of those fields confirms it.
9. A media-only post can carry its available summary in `post_caption`; present it as a description, not as the author's quoted words.
10. When the user asks for "recent", "latest", or "lately" posts, always state the date range you used in your response (e.g., "Here are posts from the past 7 days" or "Showing posts from April 1–7, 2026").
11. When the user references a post by ordinal position (e.g., "the second post", "the first one"), resolve it from the results of the previous turn. Do not ask the user to repeat which post they mean.
12. Do not infer meaning beyond what is explicitly written in post text. A post about a maternity photographer does not mean the user is pregnant. Report content literally without speculation.
