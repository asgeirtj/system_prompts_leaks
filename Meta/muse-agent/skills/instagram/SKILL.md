---
name: "instagram"
description: "Read Instagram profiles, followers, posts, comments, likes, stories, feed, saved content, and account insights. Answer questions about posts, reels, and Instagram links. Manage interests and profile details, and publish stories, reels, posts, or carousels on request."
icon: "instagram"
metadata: { "includeInPrompt": true }
---

# Instagram CLI

## Purpose
Read, manage, and answer questions about Instagram data.

## Analyzing posts and reels

Before working with the content of an Instagram post or reel, read [Instagram content questions](references/content-questions.md) with `muse.read`. State what you checked, distinguish guesses from verified facts, and say what you could not verify.

## Account Linking

Every `instagram-cli` command except `accounts`, `connect-url`, `disconnect-url`, and `--help` requires `--account-id`. For those commands, use the user's `user_fbid` from an `instagram-cli accounts` result available in your context. If none is available, run `instagram-cli accounts` first. Run `accounts` again after an auth or account error, or when the user says they connected, disconnected, or switched accounts.

If several accounts are returned without a selection in the task, or the
selected linked account conflicts with the requested publishing destination,
resolve the account choice before running the affected command. Reuse an
explicit account choice already in the task without asking again. An agent
in live conversation asks the user about an unresolved choice. A subagent
returns an unresolved choice to its parent agent. A detached worker reports
an unresolved choice in its final message. Do not choose an account
arbitrarily.

If a command says Instagram is not connected, check its `--account-id` against
the refreshed `accounts` result. If the selected account is returned with a
different `user_fbid`, retry with that value. Treat Instagram as unlinked only
when `accounts` returns an empty list or the command reports it is not
connected using the selected account's freshly verified `user_fbid`. If unlinked and the task requires an account, run `instagram-cli connect-url` and use its `connect_url` in the message below:

> Your Instagram account is not connected. To connect it, visit ``[Meta Accounts Center](`connect_url`)`` and link your Instagram account.

A link to a post or reel does not need the user's account. Follow Instagram content questions for it.

Reading a public profile does not require connecting Instagram. If no account
is linked, use web search or a browser task for public-profile questions.
If browser inspection is still needed, use `browser.spawn_task` when
available. A subagent returns the known profile URL or username and
unresolved question to its parent agent only if browser inspection is still
needed and `browser.spawn_task` is unavailable.
The native `profile`, `user-profile`, and `post` commands still require a
linked account. Do not send a connect link for a public-only task unless the
user asks to connect.

If the user asks to disconnect Instagram, run `instagram-cli disconnect-url` and send the user its `disconnect_url`:

> To disconnect your Instagram account, visit ``[Meta Accounts Center](`disconnect_url`)`` and remove the linked account.

Use the URL returned by the corresponding command. Do not hardcode it.

## Related skills
- Use the `instagram_messages` skill for inbox, thread, and message reads, DM search and sending, and top recipients. Follow its separate messaging connection and sending rules.
- Use `social.search` for general post discovery.
- Use this skill for direct `account-insights` reports and for explaining or rewriting supplied metric values. Use `social_content_performance` for performance comparisons, trends, or content recommendations for the user's own accounts and posts. Use `social_competitor_analysis` for competitor, peer, or category comparisons. When every account in a performance comparison belongs to the user, use `social_content_performance`.

If `social_content_performance` or `social_competitor_analysis` is unavailable,
use this skill's documented reads for the parts of the request they support.
Use `account-insights` only for the user's linked accounts. For competitors,
use public `profile` and `posts` data under the Account Linking rules. Do not
substitute the user's account totals for competitor metrics or invent missing
values. State which requested metrics or comparisons remain unavailable.

## Running commands

Run `instagram-cli` commands with `exec`.

Use flag names exactly as documented. Unknown flags can be ignored without
an error.

For `fetch-post-comments` and `fetch-post-likers`, use `--post-ids` even for one
post. For `save-post`, `unsave-post`, and `media-understanding`, use
`--media-ids` even for one item. The singular flags `--post-id` and `--media-id`
are unsupported.

Reuse results already in your context. When a script will process a result,
redirect the first call's output to a file under `~/workspace/` and read that
file. Do not rerun a successful command with the same arguments in the same
task.

The Instagram API enforces rate limits. If a request returns
`429 Too Many Requests`, stop all `instagram-cli` calls for this task, including
calls issued by scripts. For a post or reel link, continue with the fallbacks in
Instagram content questions. Otherwise, report what you completed and what
remains.

In scripts, check the exit status of each `instagram-cli` call. Stop at the
first 429, and do not treat a failed call as an empty result.

If a bulk read repeatedly returns HTTP 500, stop issuing calls for that bulk
read, including from scripts. An HTTP 500 alone does not identify a rate limit.
State how much you read and what remains.

For requests covering an entire list, fetch every page while pagination makes
progress. Stop before requesting a cursor already used for that list. Also
stop when a page reports more pages but adds no new items. Apply these checks
inside pagination scripts. If you stop before completing the requested scope,
state how much you read and what remains.

When a request needs a separate `user-profile`, `profile`, or `post` call for
each of more than 50 accounts or posts, start with the 50 most recent. Stop
after those 50. Report their results and how many remain for a later batch.
Instagram rate-limits these calls after a few dozen.

Perform write actions only when the user explicitly asks for the change.
This includes interest updates, publishing, and profile changes.

`instagram-cli` does not support following, unfollowing, removing followers,
blocking, liking, commenting, replying to comments, deleting posts, archiving
posts, pinning posts, or editing captions.

### Post output

`posts`, `feed`, and `post` return the same compact post collection used by
`social.search`. Read `posts[]` directly. Do not guess a provider GraphQL path or
pipe these commands through `jq`:

```json
{
  "format": "social_posts_v1",
  "count": 1,
  "posts": [{
    "rank": 1,
    "post_id": "...",
    "url": "https://www.instagram.com/...",
    "platform": "instagram",
    "post_created_at": {"utc":"...","user_local":"...","user_timezone":"..."},
    "username": "account",
    "post_caption": "..."
  }],
  "next_cursor": "...",
  "has_next_page": true
}
```

Prefer `post_created_at.user_local` when presenting a post time. The response
retains `created_at` for compatibility. Fields unavailable in the provider
response are omitted. A feed item can omit `url` or `created_at`. Before
quoting, dating, or linking a selected feed item, run `post --id <post_id>` and use
the returned record. A valid partial response includes the provider's reason in
optional `provider_error`. Do not describe it as a complete page. If required
post data is absent, the CLI fails and includes that reason when the provider
supplied one. Without a provider reason, it reports the schema mismatch rather
than returning an empty post list.

Post rows can include the author's `username`, `author_name`, `author_bio`,
`follower_count`, and `verified`. Use these returned fields instead of a
separate profile lookup for the same information, unless the request needs
missing or refreshed profile information.

The `posts`, `feed`, and `post` responses can include per-post counts in
`likes` and `comments`, but do not expose per-post views, reach, saves, or
shares. Do not assign account-level totals to individual posts.

### Global options
- `--account-id <user_own_fbid>` selects the account. Use the user's own `user_fbid` from Account Linking. Do not pass another user's ID.
- `--retries <N>` retries transient failures. The default is 0. Nonzero values are unsupported for `post-story`, `post-feed`, `set-profile-picture`, and `profile-banner`.
- `--after <cursor>` supplies the pagination cursor from the previous response, except for `own-stories-archive`, which uses `--max-id`. Omit the cursor to fetch the first page.

For `fetch-post-comments` and `fetch-post-likers`, pagination is per
`post_groups[]` entry. To fetch another page for an entry with `has_next_page`
set to true, pass only its `media_id` as `--post-ids` and its `end_cursor` as  
`--after`.

## Commands

Available commands:
- `accounts`
- `connect-url`
- `disconnect-url`
- `profile`
- `current-interests`
- `posts`
- `followers`
- `following`
- `close-friends`
- `feed`
- `activity-notifications`
- `user-profile`
- `tagged-posts`
- `post`
- `fetch-post-comments`
- `fetch-post-likers`
- `saved-posts`
- `saved-collections`
- `create-saved-collection`
- `rename-saved-collection`
- `save-post`
- `unsave-post`
- `own-stories`
- `own-stories-archive`
- `stories-tray`
- `story-media`
- `location-search`
- `media-understanding`
- `account-insights`
- `recently-liked-posts`
- `recently-commented-posts`
- `update-interests`
- `post-feed`
- `post-story`
- `set-profile-picture`
- `update-bio`
- `profile-banner`

### Accounts
List the Instagram accounts linked to the user.

```sh
instagram-cli accounts
```

### Profile
Fetch the Instagram profile bio and follower/following counts. Omit `--username` and `--profile-url` to fetch the user's own profile. Otherwise, provide a username or profile URL to fetch another user's profile. When only counts are needed, use this command instead of fetching the follower or following lists.

When using `--username`, pass one username per call. Read the result from `profiles[]`, including
`bio` and `website`. For `profile` and `user-profile`, an empty `profiles` list
alone does not establish that a handle is available or reserved, or that the
tool failed.

```sh
instagram-cli profile --account-id <user_own_fbid>
instagram-cli profile --account-id <user_own_fbid> --username <username>
instagram-cli profile --account-id <user_own_fbid> --username @<username>
instagram-cli profile --account-id <user_own_fbid> --profile-url https://instagram.com/<username>
```

### Update bio
Update the user's Instagram profile bio. `--bio` is required and may contain at
most 150 characters. Pass an empty string to clear the bio.

```sh
instagram-cli update-bio --account-id <user_own_fbid> --bio "<bio>"
```

### Muse profile banner
Add or remove the user's Muse banner on their Instagram profile. This shows as a
pill on the user's profile beneath their bio. This does not change their profile
picture or bio.

```sh
instagram-cli profile-banner --account-id <user_own_fbid> --action add
instagram-cli profile-banner --account-id <user_own_fbid> --action remove
```

Do not supply media or a profile URL. Report completion only when the result
contains `success: true`; `success: false` is not a completed update. Automatic
retries are disabled; after an ambiguous failure, do not claim success or
silently repeat the mutation.

### Current interests
Fetch topics the user is interested in or uninterested in. Show the topic and its type without distinguishing inferred from explicit interests.  
```sh
instagram-cli current-interests --account-id <user_own_fbid>
```

### Update interests
Mark a topic as "interested" so the user sees more of it on Instagram, or as "not interested" so the user sees less of it.

```sh
instagram-cli update-interests --account-id <user_own_fbid> --text "<topic>" --interested true
instagram-cli update-interests --account-id <user_own_fbid> --text "<topic>" --interested false
```

### Posts
Omit `--username` and `--user-id` to fetch the user's own posts. Otherwise, provide one or more usernames or one or more user IDs to fetch other users' posts. Do not mix usernames and user IDs in the same command.  
Pass the previous response's `next_cursor` as `--after`. Omit `--after` on the first request.  
Narrow results with `--since`, `--until`, `--sort-order asc|desc`, `--limit`, and repeated or comma-separated `--post-types` values such as `POST`, `REEL`, `STORY`, or `HIGHLIGHT`.

The response can contain more posts than `--limit` requests. Attribute each
post to its returned `username`, which can differ from the requested account.
When the request is for posts and reels only, pass `--post-types POST,REEL`.
Do not infer profile-grid order or pin status from the order of returned
posts.

```sh
instagram-cli posts --account-id <user_own_fbid>
instagram-cli posts --account-id <user_own_fbid> --after <cursor>
instagram-cli posts --account-id <user_own_fbid> --username <username>
instagram-cli posts --account-id <user_own_fbid> --username <username>,<username>
instagram-cli posts --account-id <user_own_fbid> --user-id <FBID>
instagram-cli posts --account-id <user_own_fbid> --user-id <FBID>,<FBID>
instagram-cli posts --account-id <user_own_fbid> --username <username> --since 2026-01-01 --until 2026-02-01 --sort-order asc --limit 25 --post-types POST,REEL
```

### Followers
Fetch the user's own follower list. `--count` is optional and defaults to `200`.
Read the returned `users[]` list. To fetch another page when `has_more` is
true, pass the previous response's `next_max_id` as `--after`. Omit `--after`
on the first request.

For `followers` and `following`, `users[]` entries include `id`, `username`,
`full_name`, and `profile_pic_url`. Compare list membership by `id` without
per-account profile lookups.

```sh
instagram-cli followers --account-id <user_own_fbid>
instagram-cli followers --account-id <user_own_fbid> --count 25
instagram-cli followers --account-id <user_own_fbid> --after <cursor>
```

### Following
Fetch the user's own following list. Other users' following lists are not supported. `--count` is optional and defaults to `200`.  
Read the returned `users[]` list. To fetch another page when
`page_info.has_next_page` is true, pass the previous response's
`page_info.end_cursor` as `--after`. Omit `--after` on the first request.

```sh
instagram-cli following --account-id <user_own_fbid>
instagram-cli following --account-id <user_own_fbid> --count 25
instagram-cli following --account-id <user_own_fbid> --after <cursor>
```

### Close friends
Fetch the user's current Instagram close friends list.

This is the user's own curated Close Friends list on Instagram. It is not ranked or inferred. To get an inferred list of people the user interacts with most, use the `top-recipients` command from the `instagram_messages` skill instead.

```sh
instagram-cli close-friends --account-id <user_own_fbid>
```

### Feed
Following feed:  
```sh
instagram-cli feed --account-id <user_own_fbid> --variant following
```

Close-friends feed:  
```sh
instagram-cli feed --account-id <user_own_fbid> --variant favorites
```

`--variant` is required. Its supported values are `following` and `favorites`.
The ranked home timeline is not readable through this surface. Omitting
`--variant` returns an error.

For all feed variants, pass the previous response's `next_cursor` as `--after`. Omit `--after` on the first request.

```sh
instagram-cli feed --account-id <user_own_fbid> --variant following --after <cursor>
```

### Activity notifications
Fetch `notifications` and `priority_notifications` without marking them seen.
Paginate with `page_info.end_cursor` as `--after`.

```sh
instagram-cli activity-notifications --account-id <user_own_fbid> [--after <cursor>]
```

### Other user's profile
Fetch another user's profile by user ID, username, or profile URL. Prefer `--user-id` when you already have a user FBID from prior tool output.  
When using `--username`, pass one username per call. Read the result from `profiles[]`, including
`bio` and `website`.

```sh
instagram-cli user-profile --account-id <user_own_fbid> --user-id <user_fbid>
instagram-cli user-profile --account-id <user_own_fbid> --username @<username>
instagram-cli user-profile --account-id <user_own_fbid> --profile-url https://instagram.com/<username>
```

### Tagged posts
Fetch posts a user has been tagged in. Omit `--user-id` to fetch the user's own tagged posts. Otherwise, pass the target user's FBID as `--user-id`.  
Narrow results with `--since`, `--until`, `--sort-order`, and `--limit`.

```sh
instagram-cli tagged-posts --account-id <user_own_fbid>
instagram-cli tagged-posts --account-id <user_own_fbid> --after <cursor>
instagram-cli tagged-posts --account-id <user_own_fbid> --user-id <user_fbid>
instagram-cli tagged-posts --account-id <user_own_fbid> --user-id <user_fbid>,<user_fbid> --since 2026-01-01 --until 2026-02-01 --sort-order asc --limit 25
```

### Post by ID or URL
Fetch a single post by its media ID or full Instagram post/reel URL. Provide
exactly one of `--id` or `--url`.

```sh
instagram-cli post --account-id <user_own_fbid> --id <media_id>_<owner_id>
instagram-cli post --account-id <user_own_fbid> --id <media_id>
instagram-cli post --account-id <user_own_fbid> --url https://www.instagram.com/p/<shortcode>/
instagram-cli post --account-id <user_own_fbid> --url https://www.instagram.com/reels/<shortcode>
```

### Post comments
Fetch comments for one or more posts by media ID. Batch IDs in a comma-separated `--post-ids` list. Narrow results with `--since`, `--until`, `--sort-order`, `--limit`, and repeated or comma-separated `--author-ids`.  
Read comment text from `post_groups[].comments[].comment_text`.

```sh
instagram-cli fetch-post-comments --account-id <user_own_fbid> --post-ids <media_id>
instagram-cli fetch-post-comments --account-id <user_own_fbid> --post-ids <media_id>,<media_id>
instagram-cli fetch-post-comments --account-id <user_own_fbid> --post-ids <media_id> --limit 25 --after <cursor>
instagram-cli fetch-post-comments --account-id <user_own_fbid> --post-ids <media_id> --since 2026-01-01 --until 2026-02-01 --author-ids <user_fbid>
```

### Post likers
Fetch likers for one or more posts by media ID. Batch IDs in a comma-separated `--post-ids` list. Narrow results with `--since`, `--until`, `--sort-order`, `--limit`, and repeated or comma-separated `--reactor-ids`.  
Read the likers from `post_groups[].reactors[]`.

```sh
instagram-cli fetch-post-likers --account-id <user_own_fbid> --post-ids <media_id>
instagram-cli fetch-post-likers --account-id <user_own_fbid> --post-ids <media_id>,<media_id>
instagram-cli fetch-post-likers --account-id <user_own_fbid> --post-ids <media_id> --limit 25 --after <cursor>
instagram-cli fetch-post-likers --account-id <user_own_fbid> --post-ids <media_id> --since 2026-01-01 --until 2026-02-01 --reactor-ids <user_fbid>
```

### Saved posts
Fetch the user's saved posts. To fetch the posts in one collection, pass `--collection-id` with a `collection_id` from `saved-collections`.  
Without `--collection-id`, `saved-posts` supports `--since`, `--until`, `--sort-order`, and `--limit`.

```sh
instagram-cli saved-posts --account-id <user_own_fbid>
instagram-cli saved-posts --account-id <user_own_fbid> --after <cursor>
instagram-cli saved-posts --account-id <user_own_fbid> --since 2026-01-01 --until 2026-02-01 --sort-order asc --limit 25
instagram-cli saved-posts --account-id <user_own_fbid> --after <cursor> --collection-id "<collection_id>"
```

### Saved collections
Fetch the user's saved collections (folders/categories of saved posts).

```sh
instagram-cli saved-collections --account-id <user_own_fbid>
instagram-cli saved-collections --account-id <user_own_fbid> --after <cursor>
```

### Manage saved posts and collections

```sh
instagram-cli create-saved-collection --account-id <user_own_fbid> --name "<name>"
instagram-cli rename-saved-collection --account-id <user_own_fbid> --collection-id <collection_id> --name "<name>"

instagram-cli save-post --account-id <user_own_fbid> --media-ids <media_id>
instagram-cli save-post --account-id <user_own_fbid> --media-ids <media_id>,<media_id> --collection-id <collection_id>

instagram-cli unsave-post --account-id <user_own_fbid> --media-ids <media_id> --collection-id <collection_id>
instagram-cli unsave-post --account-id <user_own_fbid> --media-ids <media_id>
```

Saving with a collection both saves the post and adds it to that collection. Unsaving with a collection only removes it from that collection. Omitting `--collection-id` unsaves it globally.

### Own stories
Fetch the user's own currently posted Instagram stories.

```sh
instagram-cli own-stories --account-id <user_own_fbid>
```

### Stories archive
Fetch the user's own Instagram story archive. Use the previous response's `next_max_id` as `--max-id` to paginate. Omit `--max-id` on the first request. When an item has a non-empty video URL, use it instead of the image URL.

```sh
instagram-cli own-stories-archive --account-id <user_own_fbid>
instagram-cli own-stories-archive --account-id <user_own_fbid> --max-id <cursor>
```

### Stories tray
Fetch the user's stories tray, containing available stories from accounts the user follows. `--count` is optional and defaults to `200`. The response contains only media IDs. To get the permalink for a specific story, pass its ID to `story-media`.

```sh
instagram-cli stories-tray --account-id <user_own_fbid>
instagram-cli stories-tray --account-id <user_own_fbid> --count 25
```

Use `story-media` only for stories the user explicitly requested. Do not fetch media for every story in the tray by default.

### Story media
Fetch media metadata for one or more story items by ID, including the permalink and posting time. Batch IDs in a comma-separated `--ids` list.

```sh
instagram-cli story-media --account-id <user_own_fbid> --ids <story_id>
instagram-cli story-media --account-id <user_own_fbid> --ids <story_id>,<story_id>
```

### Location search
Search Instagram locations with required `--search-query`. Optionally pass
both `--latitude` and `--longitude` to narrow the results.

```sh
instagram-cli location-search --account-id <user_own_fbid> --search-query "<query>"
instagram-cli location-search --account-id <user_own_fbid> \
  --search-query "<query>" --latitude <latitude> --longitude <longitude>
```

### Media files for publishing
Media and cover files for `post-story`, `post-feed`, and `set-profile-picture`
must be under `~/workspace/`. Before passing a file from outside
`~/workspace/`, copy it into `~/workspace/`. Do not use a `/tmp` path.

### Publish story
Publish one JPEG, PNG, static WebP, MP4, or MOV file, preferably vertical 9:16
at 1080 x 1920 px. Do not letterbox the media. `--file` is required and
limited to 100 MB. Directly posted videos require a matching JPEG, PNG, or
static WebP `--cover`. Videos edited with stickers or text generate their
cover automatically.

Use `post-story --draft` with `--file` and `--editor-json` for all visible
Story text and supported native stickers. First run
`instagram-cli post-story --help` and follow its detailed parameter, text,
sticker, geometry, and media contract. Draft mode renders under
`~/workspace/instagram/stories/` without posting. Render revisions from the
same clean media. Record every returned draft output and cover path.

Edited Stories using `--editor-json` require user approval of the rendered draft
before publishing. If approval is pending, an agent in live conversation shows
the preview inline and asks for confirmation, a subagent returns the preview to
its parent agent, and a detached worker returns the preview through normal result
delivery. Publish an edited Story from a delegated or detached task only when
that task carries the user's approval of the rendered draft.

After approval, rerun the same command without `--draft`. It renders the approved
edit in `~/workspace/instagram/stories/` and posts that output.
Once publishing succeeds, delete every earlier draft and draft cover by its
exact recorded path. Keep the last user-approved draft and the final published
render. Do not use a glob.

Only mention, location, and link native stickers are supported. Refuse other
native sticker types. For a location sticker, select a result with
`location-search` and include its `location_id` in the location object passed
to `--editor-json`.
Mention objects require `user_fbid`. Link objects require `url`.

The final command automatically uploads the rendered output and its video cover:

```sh
EDITOR_JSON='[
  {"type":"text","text":"<text>","style":"poster","x":0.5,"y":0.2},
  {"type":"mention","text":"@<username>","user_fbid":"<user_fbid>","style":"default","x":0.5,"y":0.4},
  {"type":"location","text":"<location_name>","location_id":"<location_id>","style":"default","x":0.5,"y":0.65},
  {"type":"link","text":"<link_text>","url":"<url>","style":"default","x":0.5,"y":0.82}
]'

instagram-cli post-story --draft --account-id <user_own_fbid> \
  --file <clean-media> --editor-json "$EDITOR_JSON"

instagram-cli post-story --account-id <user_own_fbid> --file <clean-media> \
  --editor-json "$EDITOR_JSON"
```

### Publish feed post
Publish media to the user's feed. `post-feed` selects the post type from the
files supplied:

- One JPEG or PNG image or static WebP image publishes a regular image post.
  Prefer portrait 4:5 at 1080 x 1350 px. Square 1:1 at 1080 x 1080 px is also
  suitable.
- One MP4/MOV publishes a reel shared to the feed and profile grid. Use vertical
  9:16 video, preferably 1080 x 1920 px, and pass a matching JPEG, PNG, or
  static WebP `--cover`.
- Two or more JPEG, PNG, static WebP, MP4, or MOV files publish a carousel in
  the order supplied. Image, video, and mixed image/video carousels are
  supported. Keep all items at the same aspect ratio and dimensions, preferably
  4:5 at 1080 x 1350 px.

Each file may be at most 100 MB. `--caption` is optional, may include hashtags
and textual @mentions, and is limited to 2,200 characters. Whitespace-only
captions are treated as absent. `--mentions` takes a JSON array of user tags.
Each tag requires `user_fbid`. Optional `x` and `y` coordinates run from 0 to 1
and default to 0.5. On a carousel, the CLI applies the supplied user tags to
every item.

For video media, `--video-thumbnail-playback-offset-ms` optionally selects a
non-negative video frame for the final thumbnail. Each video requires a JPEG,
PNG, or static WebP `--cover`, shown until frame extraction finishes. For a
carousel, repeat `--cover` once per video in the same order as the video files.
Image items do not take covers. Do not pass either video option for an
image-only post or carousel.

```sh
# Image post
instagram-cli post-feed --account-id <user_own_fbid> \
  --file ~/workspace/<image>.jpg --caption '<caption>' \
  --mentions '[{"user_fbid":"<tagged_user_fbid>","x":0.5,"y":0.5}]'

# Reel shared to feed
instagram-cli post-feed --account-id <user_own_fbid> \
  --file ~/workspace/<reel>.mp4 --cover ~/workspace/<cover>.jpg \
  --video-thumbnail-playback-offset-ms 1200 \
  --caption '<caption>'

# Mixed carousel. File order is display order and cover order follows videos.
instagram-cli post-feed --account-id <user_own_fbid> \
  --file ~/workspace/<first>.jpg --file ~/workspace/<second>.mp4 \
  --cover ~/workspace/<second-cover>.jpg \
  --caption '<caption>'
```

Do not start the same publish again while its `post-feed` command is running
or a scheduled job for that publish is still in progress. Wait for the
command or job's result.

Do not use `--retries` for posting because an automatic retry could publish a
duplicate. Instagram also enforces a per-account daily publish limit.

### Set profile picture
Pass exactly one square (1:1) JPEG or PNG, preferably at least 320 x 320 px and
no larger than 1080 x 1080 px. The file may be at most 100 MB.

```sh
instagram-cli set-profile-picture --account-id <user_own_fbid> \
  --file ~/workspace/<profile>.jpg
```

### Media understanding
Fetch media descriptions for one or more Instagram media FBIDs, including narrative summary and semantic understanding. Batch IDs in a comma-separated `--media-ids` list.

```sh
instagram-cli media-understanding --account-id <user_own_fbid> --media-ids <media_id>
instagram-cli media-understanding --account-id <user_own_fbid> --media-ids <media_id>,<media_id>
```

### Recently liked posts
Fetch posts the user has recently liked.

```sh
instagram-cli recently-liked-posts --account-id <user_own_fbid>
instagram-cli recently-liked-posts --account-id <user_own_fbid> --limit 5
instagram-cli recently-liked-posts --account-id <user_own_fbid> --limit 10 --after <cursor>
instagram-cli recently-liked-posts --account-id <user_own_fbid> --since 2026-01-01 --until 2026-02-01 --sort-order asc
```

### Recently commented posts
Fetch posts the user has recently commented on.

```sh
instagram-cli recently-commented-posts --account-id <user_own_fbid>
instagram-cli recently-commented-posts --account-id <user_own_fbid> --limit 5
instagram-cli recently-commented-posts --account-id <user_own_fbid> --limit 10 --after <cursor>
instagram-cli recently-commented-posts --account-id <user_own_fbid> --since 2026-01-01 --until 2026-02-01 --sort-order asc
```

### Account insights

When reporting, explaining, or rewriting Instagram metrics, use the relevant
source definitions from [Account insights metrics](references/account-insights-metrics.md).
Read them with `muse.read` when the exact definitions are absent from the current
context, including on follow-ups. A previous summary does not replace them.
This includes captions based on supplied values. Use supplied values directly
unless the request needs missing or refreshed account data.

`account-insights` returns account-level totals. The default window is the
last 30 days. Choose another with `--period last_7_days`, `last_30_days`,
`last_90_days`, `this_month`, or `this_year`, or with `--start-date` and
`--end-date`. Paired `--start-time` and `--end-time` values select Unix-second
bounds and take precedence over periods and dates. A supported period takes
precedence over dates. Date-only bounds use UTC midnight. Use one supported
form and state its time window when presenting the values. The response does
not include the window.

A metric can be absent or `null`. Otherwise, it is a list of entries with a
`value` field. When `dimension_values` is present, interpret its codes using
the metric definitions before reporting the breakdown.

Report each field by its Instagram name:

- `accounts_reached` (or `reach`) is **Accounts reached**.
- `viewers` is **Viewers**.
- `content_views` is **Views**.
- `engaged_accounts` is **Accounts engaged**.
- `total_interactions` is **Content interactions**.

When reporting Accounts reached, Viewers, or Accounts engaged, identify the
values as estimated account counts. One person can have multiple accounts.
Keep the account unit in reports and captions, including when addressing the
audience directly. State the reporting window in the text containing the
values.

Views, interactions, profile visits, and taps count events. Keep those units
rather than converting their totals to accounts or people. Label a metric as
estimated when its definition says so. Do not add that label to other metrics.

If requested copy uses the wrong unit, correct it in the publishable text.
A separate note does not correct a misleading caption.

## Output
The CLI prints JSON to stdout. Post reads use the normalized collection above.
Other commands retain their provider-specific decoded JSON. When presenting
results to the user, focus on meaningful content (names, text, images or
video, links, captions).

Include what you found in your response before asking a question or offering
more help. Do not end with only a question, an offer, or a promise of later
work.

Do not expose FBIDs, opaque IDs, cursors, Unix timestamps, or implementation
terminology to the user. Use usernames, display names, and plain-language
descriptions. Keep IDs only in tool calls.
