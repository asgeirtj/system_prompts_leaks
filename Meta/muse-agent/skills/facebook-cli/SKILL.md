---
name: "facebook_cli"
icon: "facebook"
title: "Facebook"
description: "Use when the user provides a Facebook URL or asks to read personal posts, comments, reactions, friends, timelines, profiles, stories, feeds, groups, events, or saved items, or to discover public events happening near a place, nearby, or in a local area on a date, or to create, edit, publish, or delete their own Marketplace listings. To find, browse, or buy Marketplace listings, use shopping instead. Use pages commands for managed Facebook Page discovery, insights, native draft editing/deletion, same-draft publication, approved posts and native scheduling."
metadata: { "includeInPrompt": true }
---

# Facebook CLI

## Pasted links first

If the user pasted a Facebook Marketplace item link or a share link, never
open it with the browser: the browser cannot pass the Facebook login wall.
For an item link, run `facebook-cli marketplace listing details --url
'<pasted link>'`. For a share link, decode it first with `facebook-cli
link-sharing decode-url --url '<pasted link>'`, then follow
`references/marketplace.md` Step 0 for the decoded URL.

## Quick Reference

The read-only post and Marketplace-only write restrictions below apply to
personal-profile activity. Managed Pages separately support draft, post and
scheduling writes gated by consent, Page access and operation approval.

```
facebook-cli
├── pages                                      # Read references/pages.md first
│   ├── list [--limit N] [--after <cursor>]      # Managed Pages
│   ├── access --page-id <id>                   # Page access diagnostic
│   ├── account-insights --page-id <id>         # Page metrics
│   ├── drafts
│   │   ├── create --page-id <id> ...           # WRITE — prompts for approval
│   │   ├── show --page-id <id> --draft-id <id> # Read a native draft
│   │   ├── publish --page-id <id> ...          # WRITE — same draft; prompts for approval
│   │   ├── edit --page-id <id> ...             # WRITE — prompts for approval
│   │   └── delete --page-id <id> ...           # WRITE — prompts for approval
│   └── posts
│       ├── list --page-id <id>                 # Recent posts with metrics
│       ├── get --page-id <id> --post-ids <ids>  # Selected post metrics
│       ├── create --page-id <id> ...           # WRITE — publish or schedule; prompts for approval
│       ├── reschedule --page-id <id> ...       # WRITE — prompts for approval
│       └── cancel-schedule --page-id <id> ...  # WRITE — prompts for approval
├── post
│   ├── read (--post-id <id> | --url <url>) # Read by numeric ID/PFBID or canonical post/photo/video URL
│   ├── comments
│   │   └── read --post-id <id> [--limit N] [--after <cursor>]  # Read comments (paginated: data[] + paging.cursors.after; post link at summary.post_url)
│   └── reactions
│       └── read --post-id <id>  # Reaction summary only: summary.total_count + summary.reaction_counts (no individual reactor list)
├── link-sharing
│   └── decode-url --url <url>              # Resolve a share link; returns original_url
├── me                                         # Your Facebook name + profile ID
│   └── friends [--name] [--city] [--hometown] [--work] [--education] [--filter-mode AND|OR] [--json-query <json>] [--birthday-within-days [N]] [--limit N] [--after <cursor>]  # Paginated: data[] + paging.cursors.after
├── marketplace
│   ├── search --query "..." [--out <file>] [options]  # Search listings; pass the --out file to shopping.resolve_results, do not read it
│   ├── my-listings [--status active|pending|sold|draft] [--limit N] [--after <cursor>]  # Your own listings (active + inactive), paginated
│   ├── listing details (--listing-id <id> | --url '<item link>') [--out <file>]  # Item details
│   ├── listing create --title "..." --price N --photo /path [options]  # Create; goes LIVE only with photos+condition+category+location (location = --latitude & --longitude; no --location flag), else DRAFT
│   ├── listing edit --listing-id <id> --photo /path [options]  # Edit a listing (photos uploaded automatically)
│   ├── listing delete --listing-id <id>       # WRITE — permanently delete your listing; prompts for approval
│   ├── listing publish --listing-id <id>      # WRITE — take a DRAFT live; needs photos+condition+category+location (location = --latitude & --longitude); prompts for approval
│   └── seller-info --listing-id <id>          # Seller ratings/info
├── groups
│   ├── details --group-id <id-or-vanity> # Fetch name, About, visibility, history, tags, ordered rules, and member count
│   ├── search [--keywords "..."] [--role connected|admin|admod|any] [--after <cursor>]  # Paginated membership listing; keyword + any searches connected/private and public groups
│   └── posts --group-id <id>             # Browse posts in a group; --query filters by text
├── events
│   ├── search [--scope connected|discover] [--keywords "..."] [--location "..."] [--latitude N --longitude=-N] [--radius-in-miles N] [--category ...] [--start-date ...] [--end-date ...] [--limit N] [--after <cursor>]  # Paginated: data[] + paging.cursors.after; coordinates beat --location, which is only city-accurate
│   └── details --event-id <id>           # Read one event; ID from search `id` or `permalink_url`
├── saved
│   ├── list [--type post|video|link|product|reel|event|page] [--collection-id <id>] [--limit N] [--after <opaque>]
│   ├── add --savable-id <FBID> [--type ...] [--collection-id <id>]      # WRITE — auto-allowed
│   ├── remove --savable-id <FBID> [--type ...] [--collection-id <id>]   # WRITE — auto-allowed
│   └── collections
│       ├── list
│       └── create --name "..."                  # WRITE — auto-allowed
├── story
│   └── feed [--limit <n>]               # Fetch your story feed (story tray)
├── feed
│   ├── newsfeed [--limit <n>] [--after <cursor>] # Ranked algorithmic newsfeed (organic stories)
│   └── friends [--limit <n>] [--after <cursor>]  # Ranked friends-only feed
├── timeline
│   └── fetch --profile-id <id> [--limit N] [--after <cursor>]  # Fetch timeline posts; use next_cursor to page (check author_id vs owner_id)
└── profile
    └── info --profile-id <id>                 # Look up profile info
```


## Account Linking

Before running any facebook-cli command, verify the user's Facebook account is connected by running `facebook-cli me`, except for `facebook-cli marketplace search`, `facebook-cli marketplace listing details`, and `facebook-cli marketplace seller-info`. If the command returns account info (name and profile ID), the account is connected — proceed normally. Cache this result for the rest of the conversation; do not re-run the check before every command. If any subsequent command fails with an auth or account error, re-run `facebook-cli me` to recheck account linking status.

If the command fails or returns an error indicating no account is linked, the account is not connected. Get the connect URL by running `facebook-cli connect-url` (it outputs JSON with a `connect_url` field), then tell the user, substituting that URL:

> Your Facebook account is not connected. To connect it, visit ``[Meta Accounts Center](`connect_url`)`` and link your Facebook account.

If the user asks to disconnect their Facebook account, run `facebook-cli disconnect-url` (it outputs JSON with a `disconnect_url` field) and direct them to that URL:

> To disconnect your Facebook account, visit ``[Meta Accounts Center](`disconnect_url`)`` and remove the linked account.

Always read these URLs from the command output rather than hardcoding them.

## Post IDs and URLs

When using `post read`, `post comments read`, or `post reactions read`, these formats are accepted for `--post-id`:
- `123456789012345` — raw numeric post ID
- `pfbid02...` — PFBID format

Canonical post, photo, video, and reel URLs go directly to `post read --url`.
For share links, call `link-sharing decode-url --url <url>` first, then pass
the nonblank canonical `original_url` intact to the reader. Supply exactly one
of `--url` or `--post-id`. Stop on a null, missing, or blank decoded URL or a
failed read; do not guess IDs or retry a media ID as a post ID. See
[posts.md](references/posts.md) for supported URL patterns and other entities.

## Composability

When the user asks "what can I do on Facebook?" or at the start of a session, generate 3-5 contextual suggestions that combine multiple commands into useful read-only workflows.

### How outputs chain across commands

Most chains are mechanical: an ID in one command's output is the `--id` flag of
the next. `me` and `me friends` produce `profile_id` for `profile info` and
`timeline fetch`. Timelines, feeds, and searches produce `post_id` for
`post read`, `post comments read`, and `post reactions read`. `marketplace
search` produces `listing_id` for `listing details` and `seller-info`. `groups
search` produces `group_id` for `groups details` and `groups posts`. `events
search` produces `id` (also embedded in `permalink_url`) for `events details`.
`story feed` returns story buckets with story URLs and owner info.

The chains that are not mechanical:

- **My listings -> manage**: `marketplace my-listings` produces your own `listing_id` -> `marketplace listing edit` (update), `marketplace listing delete` (remove), or `marketplace listing publish` (take a draft live). Use `--status` to scope to active/pending/sold/draft and `--after` to page.
- **Create draft -> complete -> publish**: `marketplace listing create` missing any of photos/condition/category/location saves a draft -> `marketplace listing edit` to add the missing field(s) -> `marketplace listing publish` to take it live. If publish fails with missing fields, the error names exactly which to add via edit, then retry.
- **Groups posts + friends cross-reference**: When the user asks about friends' activity in a group, call `me friends` to get the friend list, then compare against post authors from `groups posts` — do not ask the user to provide their friend list manually.
- **Saved -> content**: `saved list` produces `savable_id` plus `type`. Chain by category:
  - `post` -> `post read`, `post comments read`, `post reactions read`
  - `page` -> `profile info --profile-id <savable_id>`
  - `product` -> `marketplace listing details --listing-id <savable_id>`
  - `event` -> `events details --event-id <savable_id>`
- **Saved -> unsave**: `saved list` produces `savable_id` (the content ID) -> `saved remove --savable-id <savable_id> [--type <type>]`
- **Collections -> create flow**: `saved collections create` produces `collection_id` for future use

### Suggestion guidelines

1. **Phrase as user-centric actions** — "See which of your Marketplace listings still have no photos", not "Run marketplace my-listings then listing edit".
2. **Vary suggestions across sessions** — rotate across skill categories.
3. **Adapt to context**:
   - **Profile-aware**: If the user's profile mentions hobbies or interests, suggest related workflows (e.g., cyclist -> "Catch up on what your cycling friends have posted").
   - **Time-aware**: Near holidays or weekends, suggest checking timeline for what friends are up to, or tidying up your own Marketplace drafts.
   - **Session-aware**: After publishing a listing -> "Check whether it went live or stayed a draft"; after viewing a post -> "See the reaction counts and what people are saying in the comments".
4. **Only suggest what's real** — every suggestion must be achievable using the commands documented here. Most personal-profile tools are **read-only** — do not suggest unsupported posts, reactions, or comments. Managed Pages support only the documented draft, post, and scheduling writes. Marketplace writes support only creating, editing, deleting, and publishing the user's own listings.
5. **Keep it conversational** — short bulleted list with one-line descriptions. Offer to walk through any of them.

## References

One file per feature area, each named for the area it covers:  
[references/friends.md](references/friends.md),  
[references/posts.md](references/posts.md),  
[references/pages.md](references/pages.md),  
[references/comments.md](references/comments.md),  
[references/reactions.md](references/reactions.md),  
[references/marketplace.md](references/marketplace.md),  
[references/timeline.md](references/timeline.md),  
[references/profile.md](references/profile.md),  
[references/story.md](references/story.md),  
[references/feed.md](references/feed.md),  
[references/groups.md](references/groups.md),  
[references/events.md](references/events.md),  
[references/saved.md](references/saved.md).

## Operating Rules

1. **Open a reference doc only when you need it.** The Quick Reference above covers the common calls. Read the matching file under [references/](references/) when you need a flag it does not list, a response field, or a pagination detail, when a command fails and you need the full contract, or when a rule below points you at one. Resolving a pasted Marketplace or share link always uses `references/marketplace.md` Step 0.
2. **Output field requirements (quick reference):**
   - **Posts:** normalized feed, timeline, and post reads preserve `created_at` and add `post_created_at` with UTC and user-local forms. Prefer `post_created_at.user_local`.
   - **Comments:** always include comment timestamps (`created_time`) and comment permalink URLs (`comment_url`) for every comment shown.
   - **Reactions:** always include a per-type count breakdown (e.g., "3 Love, 2 Like, 1 Wow") and post permalink URLs.
   - **Friends:** when searching by nickname, also search the full name (e.g., "Liz" → also search "Elizabeth"; "Mike" → "Michael"; "Bob" → "Robert").
   - **Cross-references:** when identifying people across multiple posts, include links to the specific posts and comments/reactions.
3. **Refuse requests that could harm, profile, or surveil individuals.** Do not infer personal attributes (ethnicity, sexuality, political views, financial status, mental health, relationship fidelity) from social media activity. Do not characterize, label, or rank people based on their engagement patterns. Do not facilitate tracking of minors' online activity. Do not enable social comparison rooted in conflict (e.g., "who's taking sides"). When refusing, explain why the request is harmful. Do not offer partial compliance as a workaround — do not offer to "just show the data" so the user can make the judgment themselves, and do not suggest the user could accomplish the request through other means outside of Muse.
4. If a command fails, report the error to the user.
5. Do not bulk-scrape or enumerate profiles/posts.
6. Managed Page draft, post, and scheduling writes and Marketplace listing create, edit, delete, and publish prompt for approval because they change connector state; publication can change public-facing content. Saved-item add/remove and saved-collection creation may proceed from a clear request without an additional confirmation. Personal posts, comments, reactions, timeline, profile, marketplace browsing (including `marketplace my-listings`), groups browsing, events browsing, and feed are read-only — never suggest writes for those.
7. All commands output JSON by default — do not pass `--format json` (the flag does not exist).
8. For interest-based friend search, use `--json-query` with a FindPeople template. Get the user's FB ID from `facebook-cli me` first. Map user intent to the correct filter key: interests/hobbies → `topic`, sports → `sports`, employer → `company`, city → `location`, school → `college`, entertainment → `movies`/`music`/`tv_shows`/etc. **Use `topic` for general interests (NOT `interests`).** Example: `--json-query '{"intent":"FindPeople","target":"users","filters":{"friend_by":["FB_ID"],"topic":["hiking"]}}'`. Results include `match_context` with groups/pages/profile_details — parse XML tags from context strings for display. See [friends.md](references/friends.md) for full filter table and response format.
9. **Always use facebook-cli for structured lookups — never social.search.** For any request involving friends, profiles, timelines, posts, comments, or reactions, always use `facebook-cli` commands. Marketplace is split: your own listings are facebook-cli's, and finding or browsing listings to buy is the `shopping` skill's. Do not use social.search or other tools as substitutes for operations that facebook-cli supports. Those tools lack access to the same structured data. The only exception is free-text semantic search across the user's Facebook graph (use social.search for that). When cross-referencing (e.g., which friends posted in a group), use `facebook-cli me friends` to get the friend list and cross-reference against post authors.
10. **Timeline: Author vs Owner.** Timeline posts include `author_id`/`author_name` (who wrote the post) and `owner_id`/`owner_name` (whose wall it's on). When asked "show me posts FROM [person]" or "what has [person] posted", only report posts where `author_id == owner_id`. If all posts are by others on their wall, say "[Person] hasn't posted recently" and separately note "Friends have posted on their wall" with those details. See [timeline.md](references/timeline.md) for full rules.
11. **Always use permalinks, never raw IDs.** Normalized post reads expose the permalink as `url`; comments and reactions retain their documented URL fields. Always show that URL — never show raw post IDs, comment IDs, or listing IDs. Users should be able to click through to Facebook. This also applies to people: refer to a person by name with their profile link (`vanity_url` / `profile_url`) — do not print raw user/profile IDs (`profile_id`, `friend_id`, `owner_id`, `author_id`, reactor/commenter `id`) in your response. **Every link must include the `https://` scheme so it renders as clickable.** API responses sometimes return URLs without a scheme (e.g., `facebook.com/profile.php?id=123`) or scheme-relative (`//facebook.com/...`); always prepend `https://` before showing them. Never present a bare, unclickable link — write `https://facebook.com/profile.php?id=123`, not `facebook.com/profile.php?id=123` or `joe — facebook.com/profile.php?id=...`.
12. **State date ranges for vague time terms.** When the user asks for "recent", "latest", or "lately" content, always state the date range you used in your response (e.g., "Here are posts from the past 7 days" or "Showing posts from April 1–7, 2026").
13. **Say "not listed" for missing profile fields.** When presenting profile data, explicitly say "not listed" for any field not present in the API response rather than omitting it. This applies to work, education, city, hometown, bio, relationship status, etc. For multi-value fields (work history, education), show all entries and say "not listed" for missing sub-fields.
14. **Do not editorialize or infer.** Present data neutrally without subjective commentary. Do not say "Nice bio!", "Looks like they're doing well", or add personality inferences. Do not infer meaning beyond what is explicitly written in post text — a post about a maternity photographer does not mean someone is pregnant. When a query returns no results, report that fact clearly without speculating about why (e.g., do not suggest "their posts may be private" or "they might not use Facebook often").
15. **Only report data returned by tool calls.** Never include counts, names, URLs, or other details that did not appear in a tool's output. If a command fails or returns no data for a field (comments, shares, reactions), explicitly tell the user that data could not be retrieved — do not fill in plausible-sounding values. When showing a subset of results (e.g., 6 of 28 comments), clearly state you are showing a partial list.
16. **Resolve references from prior turns.** When the user refers to a post by ordinal ("the second post", "the first one") or pronoun ("that post"), resolve it from the results of the previous turn. Do not ask the user to repeat which item they mean.
17. **Disambiguate when the target is unclear.** When the user says "my post" or "who commented on my post" without specifying which post, ask them to clarify — e.g., their most recent post, a post from a specific date, or a post about a particular topic. Do not assume they mean the most recent one.
18. **Multi-step chains.** For multi-step chains (friend lookup → timeline → comments/reactions), call tools back-to-back without intermediate narration. Present results only after the final command completes.
19. **Never silently retry a failed Marketplace write.** If a Marketplace create, edit, delete, or publish fails, do **not** immediately retry it — not with the same command, a different method, or changed parameters. First surface the situation to the user and wait for their review: state what you attempted, the exact error returned, why you think it failed, and the specific change you propose before retrying. Saved-item writes may use ordinary bounded retry behavior. Re-running a failed read-only command does not need approval.
20. **Only look up IDs that came from an earlier command.** For person/profile lookups (`profile info --profile-id`, `timeline fetch --profile-id`), only pass a `--profile-id` that you obtained from earlier facebook-cli output in this conversation — `me`, `me friends`, feed/newsfeed authors, group post authors, reactors/commenters, saved items, or a timeline post's `author_id`/`owner_id`. Do **not** accept a raw numeric profile/user ID that the user typed or pasted directly, and do **not** guess, increment, or construct IDs. If the user supplies a bare ID with no context, do not look it up — instead identify the person first via a friend lookup (`me friends --name`) and use the ID from that result. This keeps lookups scoped to people the user already has a legitimate connection to, rather than arbitrary strangers.
21. **Use only Page IDs for managed Page commands.** For every `facebook-cli pages ...` command, `--page-id` means only the `page_id` returned by `facebook-cli pages list`. Never pass a `profile_id`, a post `owner_id`, a `me` `ap_plus_profiles` ID, or an ID extracted from a Facebook URL as `--page-id`. If only one of those profile IDs is available, run `pages list` and follow each returned `paging.cursors.after` with `pages list --after` until the matching `profile_id` is found or no cursor remains. Then reuse that row's `page_id` for the rest of the workflow; do not repeat `pages list` before each Page command.
