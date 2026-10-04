---
name: "threads"
description: "Read and manage the user's Threads account: profile, posts, feed, saved posts, activity, insights, social graph, search, trends, and a specific post by URL or ID. Can tune feed ranking and publish posts on request."
icon: "threads"
metadata: { "includeInPrompt": true }
---

# Threads CLI

## Purpose
Read and manage authenticated Threads data using the `threads-cli` companion
CLI. Reads, `dear-algo-whisper`, and approved `publish-post` invocations are
available wherever the Threads skill is supported.

Use the separate `threads_messages` skill for Threads inboxes and message threads.

## Account Linking

Before running any other command, verify the user's Threads account is connected by running `threads-cli accounts`. If the command returns account info (one or more accounts with `id`), the account is connected — proceed normally. Cache this result for the rest of the conversation; do not re-run the check before every command. If any subsequent command fails with an auth or account error, re-run `threads-cli accounts` to recheck account linking status.

If the command fails or returns an empty result indicating no account is linked, the account is not connected. Get the connect URL by running `threads-cli connect-url` (it outputs JSON with a `connect_url` field), then tell the user, substituting that URL:

> Your Threads account is not connected. To connect it, visit ``[Meta Accounts Center](`connect_url`)`` and link your Threads account.

If the user asks to disconnect their Threads account, run `threads-cli disconnect-url` (it outputs JSON with a `disconnect_url` field) and direct them to that URL:

> To disconnect your Threads account, visit ``[Meta Accounts Center](`disconnect_url`)`` and remove the linked account.

Always read these URLs from the command output rather than hardcoding them.

## Tooling
Use `exec` to run:

```sh
threads-cli <target> [options]
```

Targets:
- `accounts`
- `profile`
- `activity-feed`
- `liked-media`
- `saved-posts`
- `insights-overview`
- `post-insights`
- `top-posts`
- `user-profile`
- `profile-threads`
- `profile-replies`
- `profile-media`
- `followers`
- `following`
- `post`
- `fetch-post-comments` (alias: `comments`)
- `fetch-post-likers` (alias: `likers`)
- `feedback-hub-overview`
- `feedback-hub-tab`
- `trends`
- `search`
- `feed`
- `publish-post` (hidden; explicit confirmation required)
- `dear-algo-whisper`

### Post output

`feed` and `post` use the same compact `social_posts_v1` presentation as
`instagram-cli`. Use the filtered result as authoritative; do not reconstruct
omitted fields. An explicit error-only post row is omitted and its message is
surfaced as `provider_error`.

### Global options
- `--account-id <threads_account_id>` **(required for all commands except `accounts`)** — select which Threads account to operate on. The value must be the authenticated user's own `id` field from the `accounts` response. Always call `accounts` first. If it returns multiple entries, ask the user which account to use.
- `--retries <N>` — retry transient failures (default: 0). This is not
  supported for `dear-algo-whisper` or `publish-post`, because a
  retry could duplicate a mutation.

## Commands

### Accounts
List Threads accounts associated with the currently authenticated user.

```sh
threads-cli accounts
```

### Profile
Fetch the current user's own Threads profile.

```sh
threads-cli profile --account-id <threads_account_id>
```

### Activity Feed
Fetch the user's activity notifications.

```sh
threads-cli activity-feed --account-id <threads_account_id>
threads-cli activity-feed --account-id <threads_account_id> --first 20
threads-cli activity-feed --account-id <threads_account_id> --category-filter text_post_app_mentions
threads-cli activity-feed --account-id <threads_account_id> --after <cursor>
```

Category filters: `text_post_app_conversations`, `text_post_app_following`, `text_post_app_private_follow_requests`, `text_post_app_mentions`, `text_post_app_replies`, `text_post_app_user_follows`, `text_post_app_quote_posts`, `text_post_app_reposts`.

### Liked Media
Fetch posts you've liked.
This uses the shared engagement query and supports `--since`, `--until`, `--sort-order`, `--limit`, and `--after`.

```sh
threads-cli liked-media --account-id <threads_account_id>
threads-cli liked-media --account-id <threads_account_id> --limit 20
threads-cli liked-media --account-id <threads_account_id> --since 2026-03-01 --until 2026-03-20
threads-cli liked-media --account-id <threads_account_id> --sort-order asc
threads-cli liked-media --account-id <threads_account_id> --after <cursor>
```

### Saved Posts
Fetch your saved posts.
This uses the shared engagement query and supports `--since`, `--until`, `--sort-order`, `--limit`, and `--after`.

```sh
threads-cli saved-posts --account-id <threads_account_id>
threads-cli saved-posts --account-id <threads_account_id> --limit 20
threads-cli saved-posts --account-id <threads_account_id> --since 2026-03-01 --until 2026-03-20
threads-cli saved-posts --account-id <threads_account_id> --after <cursor>
```

### Insights Overview
Fetch account-level insights (views, likes, quotes, replies, reposts, traffic sources, demographics).

```sh
threads-cli insights-overview --account-id <threads_account_id> --start-date 2026-03-13 --end-date 2026-03-20
threads-cli insights-overview --account-id <threads_account_id> --start-date 2026-03-13 --end-date 2026-03-20 --sections followers
```

Section values: `summary`, `views`, `interactions`, `followers`, `demographics`, `all`.

The typed insights backend uses the Threads account selected by
`--account-id`. Do not retry an account-binding failure through `/gq`; run
`accounts` again and pass one of the returned account IDs.

### Post-Level Insights
Fetch insights for a specific post.

```sh
threads-cli post-insights --account-id <threads_account_id> --post-id 3856993780407305605
```

### Top Posts
Fetch the most-viewed posts and the service-defined top three most-liked posts
over a date range. `--count` controls most-viewed posts and is bounded to 50.

```sh
threads-cli top-posts --account-id <threads_account_id> --start-date 2026-03-13 --end-date 2026-03-20
threads-cli top-posts --account-id <threads_account_id> --start-date 2026-03-13 --end-date 2026-03-20 --count 5
```

### Other User's Profile
Fetch another user's profile by numeric Threads user FBID. This command does
not accept usernames or profile URLs.

```sh
threads-cli user-profile --account-id <threads_account_id> --user-id 12345678
```

### Profile Threads
Fetch threads by numeric Threads user FBID. `--limit` is accepted as a
compatibility alias for `--first`.

```sh
threads-cli profile-threads --account-id <threads_account_id> --user-id 12345678
threads-cli profile-threads --account-id <threads_account_id> --user-id 12345678 --first 10 --after <cursor>
```

### Profile Replies
Fetch a user's replies.

```sh
threads-cli profile-replies --account-id <threads_account_id> --user-id 12345678
threads-cli profile-replies --account-id <threads_account_id> --user-id 12345678 --first 10 --after <cursor>
```

### Profile Media
Fetch a user's media posts (images, videos, carousels).

```sh
threads-cli profile-media --account-id <threads_account_id> --user-id 12345678
threads-cli profile-media --account-id <threads_account_id> --user-id 12345678 --first 10 --after <cursor>
```

### Followers
Fetch a user's followers list.

```sh
threads-cli followers --account-id <threads_account_id> --user-id 12345678
threads-cli followers --account-id <threads_account_id> --user-id 12345678 --first 10 --after <cursor>
```

### Following
Fetch a user's following list.

```sh
threads-cli following --account-id <threads_account_id> --user-id 12345678
threads-cli following --account-id <threads_account_id> --user-id 12345678 --first 10 --after <cursor>
```

### Post by URL or ID
Fetch a specific post. Use `fetch-post-comments` for its replies.

Exactly one of `--url` or `--post-id` (alias `--id`) is required.

When the user supplies a Threads permalink or share link (`threads.com` or
`threads.net`), use `--url` first and pass the original URL unchanged. WWW
resolves it and enforces access.

```sh
threads-cli post --account-id <threads_account_id> --url https://www.threads.com/@carnage4life/post/DdU_q-9mLbt
threads-cli post --account-id <threads_account_id> --url https://www.threads.com/share/HCmFh1x9l/
```

Use `--post-id` when you already have a known numeric post FBID:

```sh
threads-cli post --account-id <threads_account_id> --post-id 3856993780407305605
```

### Fetch Post Comments
Fetch comments for one or more post media IDs.
Use `--since`, `--until`, `--sort-order`, `--limit`, and repeated/comma-separated `--author-id` filters when needed.

```sh
threads-cli fetch-post-comments --account-id <threads_account_id> --post-ids 3856993780407305605
threads-cli fetch-post-comments --account-id <threads_account_id> --post-ids 3856993780407305605,3856993780407305606 --limit 20 --after <cursor>
threads-cli fetch-post-comments --account-id <threads_account_id> --post-ids 3856993780407305605 --since 2026-03-01 --until 2026-03-20 --author-id 12345678
threads-cli comments --account-id <threads_account_id> --post-ids 3856993780407305605
```

### Fetch Post Likers
Fetch users who liked one or more post media IDs.
Use `--since`, `--until`, `--sort-order`, `--limit`, and repeated/comma-separated `--reactor-id` filters when needed.

```sh
threads-cli fetch-post-likers --account-id <threads_account_id> --post-ids 3856993780407305605
threads-cli fetch-post-likers --account-id <threads_account_id> --post-ids 3856993780407305605 --limit 20 --after <cursor>
threads-cli fetch-post-likers --account-id <threads_account_id> --post-ids 3856993780407305605 --since 2026-03-01 --until 2026-03-20 --reactor-id 12345678
threads-cli likers --account-id <threads_account_id> --post-ids 3856993780407305605
```

### Feedback Hub Overview
Fetch a post's engagement summary (likes, reposts, quotes counts).

```sh
threads-cli feedback-hub-overview --account-id <threads_account_id> --post-id 3856993780407305605
```

### Feedback Hub Tab
Fetch paginated lists of users who liked, reposted, or quoted a post.

```sh
threads-cli feedback-hub-tab --account-id <threads_account_id> --post-id 3856993780407305605 --tab-type like
threads-cli feedback-hub-tab --account-id <threads_account_id> --post-id 3856993780407305605 --tab-type repost --first 10
threads-cli feedback-hub-tab --account-id <threads_account_id> --post-id 3856993780407305605 --tab-type quote --after <cursor>
```

### Trends
Fetch trending topics on Threads.

```sh
threads-cli trends --account-id <threads_account_id>
threads-cli trends --account-id <threads_account_id> --first 10
```

### Search
Search Threads by keyword, or dive deeper into a trend.

```sh
threads-cli search --account-id <threads_account_id> --query "AI news"
threads-cli search --account-id <threads_account_id> --query "AI news" --recent 1
threads-cli search --account-id <threads_account_id> --query "trending topic" --trend-fbid 987654
threads-cli search --account-id <threads_account_id> --query "AI" --first 10 --after <cursor>
```

Use `--recent 1` for "Recent" tab results instead of "Top".

### Feed
Fetch the ranked feed (For You or Following).

For You feed:  
```sh
threads-cli feed --account-id <threads_account_id> --variant for_you
```

Following feed:  
```sh
threads-cli feed --account-id <threads_account_id> --variant following
threads-cli feed --account-id <threads_account_id> --variant following --sort-by recent
```

For all feed variants, use `--after` for pagination:  
```sh
threads-cli feed --account-id <threads_account_id> --variant for_you --after <cursor>
```

### Publish a post

`publish-post` is a hidden write command. It publishes a normal Threads post
in one approved operation and returns the post ID. There is no public draft
step and no creation handle to pass between commands.

Text must contain at least one non-whitespace character when no media is
present. Every byte of accepted text, including leading or trailing whitespace
and Unicode, is preserved through confirmation and publication. A post may
include one to twenty ordered local images or videos from the Hatch workspace,
optionally reply to a specific post, and set who can reply. If a file is outside
the workspace, copy it into the workspace first; never use a `/tmp` path.

Run `threads-cli accounts` first and pass the selected account's numeric `id`
unchanged as `--account-id`. If multiple accounts are returned, ask which one
to use. Account and reply targets are canonical positive decimal FBIDs with no
sign, leading zero, or surrounding whitespace; never derive one from a URL or
username.

```sh
threads-cli publish-post --account-id <threads_account_fbid> --text "Hello Threads"
threads-cli publish-post --account-id <threads_account_fbid> --text "Caption" --media-item '{"file":"/workspace/Launch photo.jpg","alt_text":"Description"}'
threads-cli publish-post --account-id <threads_account_fbid> --text "Mixed media" --media-item '{"file":"/workspace/first.jpg","alt_text":"First image"}' --media-item '{"file":"/workspace/second.mp4","cover":"/workspace/second-cover.jpg"}'
threads-cli publish-post --account-id <threads_account_fbid> --text "Reply video" --media-item '{"file":"/workspace/video.mp4","cover":"/workspace/video-cover.jpg"}' --reply-to-post-fbid <post_fbid> --reply-control mentioned_only
```

Reply control accepts exactly `everyone`, `accounts_you_follow`,
`mentioned_only`, `parent_post_author_only`, or `followers_only`. The old
`following`, `mentioned`, and `followers` spellings are invalid. Never silently
translate an older spelling.

`--media-item` is repeatable from one to twenty times. Each JSON value has
exactly `file`, optional `cover`, and optional exact `alt_text`. Supported media
files are JPEG, PNG, static WebP, MP4, and MOV, at most 100 MB each. Media type
is inferred from the extension. Every MP4/MOV requires a JPEG, PNG, or WebP
`cover`; images reject `cover`. File order is display order, and each cover is
kept with its video item. Omit all media items for a text-only post. One item
publishes an image or video; two to twenty items publish one carousel in the
supplied order.

After approval, the CLI reads every declared file through its privsep input and
multipart-uploads it to the private Threads staging endpoint. A single item is
staged with its exact text, alt text, and reply settings, then `publish-post`
receives only the private returned creation ID. For a carousel, the CLI stages
each ordered item with empty text, no reply settings, and
`is_carousel_item=true`, validates every distinct returned creation ID, then
publishes one `media_type=CAROUSEL` parent with the ordered `children`, exact
text, and optional reply fields. Paths and creation IDs remain internal.

The CLI validates the complete post before approval. One `content.post`
approval covers the account, human reply context, reply control, exact text,
and all ordered media. Confirmation shows each item from an authenticated
workspace preview resource with a safe basename and optional exact alt text; it
also shows every video cover as an adjacent image attachment immediately after
its video. The twenty-media maximum can therefore produce forty visual
attachments. Confirmation never substitutes raw identifiers. Missing or unsafe
names become `Threads image` or `Threads video`.
Names must be nonempty after trimming, at most 255 Unicode scalar characters,
and contain no slash, backslash, control character, numeric-only stem,
hexadecimal digest stem, or provider/upload identifier. Alt text must be
nonempty after trimming, at most 1024 Unicode scalar characters, and contain no
control character. Truncation fails closed.

After approval, every write uses zero retries. A child failure or duplicate
handle stops immediately without creating later children or publishing the
parent. Any later attempt is a new invocation requiring new explicit approval.
Creation IDs are accepted only from the private staging response.

### Post write safety

1. Never publish until the explicit Hatch confirmation window is approved. A
   decline or dismissal ends the action.
2. Never use transport retries. A child or parent failure is terminal and
   ambiguous. Do not continue a failed carousel. Any later attempt is a new
   invocation with a new explicit approval.
3. Show exact post text, exact reply control, all ordered media items, and every
   video cover described above. Resolve account and reply labels on a
   best-effort basis for up to 30 seconds. If lookup times out or returns an
   error, malformed data, or a missing/unsafe label, show a non-identifying  
   `Unverified Threads …`  
   placeholder and continue to explicit approval; never substitute its raw
   identifier. Never show account, reply, child, creation, or post IDs or local
   paths in normal prose.
4. Post text is trimmed only to test emptiness. Every byte of a nonempty value,
   including leading/trailing whitespace and Unicode, is preserved in both the
   structured confirmation preview and dispatched request. If the full text
   cannot fit without preview truncation, the write is rejected.
5. This write command is available wherever the Threads skill is supported,
   but every invocation still requires its own explicit confirmation.
6. Respect authorization, account-selection, and quota failures. Do not bypass
   them through an alternate or undocumented command path.
7. Read the published post back and compare it with the approved snapshot when
   the exact publication result matters.

### Dear Algo Whisper
Send a message directly to the Threads ranking algorithm to modify what the user sees in their feed (e.g. "show me less politics", "more cat content"). This command is available to all supported users, and a clear user request may proceed without an additional confirmation.

```sh
threads-cli dear-algo-whisper --account-id <threads_account_id> --message "show me less politics"
```

## Operating rules
1. This skill reads Threads data the authenticated user can access — their own account plus posts they supply links to — not general Threads search.
2. **Always call `accounts` first** to obtain the account `id` for `--account-id`. Cache this value for subsequent commands in the same conversation. If `accounts` returns no entries, direct the user to Meta Accounts Center to link a Threads account (refer to the "Account Linking" section for details).
3. **Minimize API calls to avoid rate limiting.** The Threads API enforces strict rate limits — excessive calls will result in `429 Too Many Requests` errors that are not retried. Follow these principles:
   - **Batch your information gathering.** Before making calls, plan which data you actually need. Don't fetch data speculatively.
   - **Reuse data from earlier responses.** If you already fetched `accounts` or `profile`, extract IDs and usernames from that response instead of calling again.
   - **Avoid redundant pagination.** Only paginate (`--after`) when the user explicitly needs more results. Don't automatically fetch all pages.
   - **Never call the same command twice with identical arguments** in one conversation unless the previous call failed or the user explicitly asks for a refresh.
4. Avoid requests to persistently / frequently poll these commands.
5. Use numeric Threads FBIDs for account, user, post, and other entity identifiers. Do not derive an identifier from a Threads URL or pass a URL where an FBID is required. The one exception is `post --url`, which takes the original Threads URL as-is and lets WWW resolve it.
6. Treat U18 enforcement as a server-side invariant. Do not reconstruct filtered fields, retry through `/gq`, or otherwise bypass server results.
7. Use the structured, filtered media result returned by each named read command; do not reconstruct omitted provider fields.

## Output
The CLI prints decoded JSON to stdout. `publish-post` prints exactly
`{"post_id":"<string>"}`. Treat the value as a machine-only workflow handle
and never repeat it in user-facing prose or an approval preview.
