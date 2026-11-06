# Threads read commands

- These are subcommands of `/opt/hatch/bin/threads-cli`, and each needs `--account-id` from `accounts`. The defaults and limits below come from the CLI, which rejects invalid values before calling Threads.

- Page sizes take 1 to 50. Pass a returned cursor as `--after` only when the request needs more results.

## The user's account

- `profile` reads the user's own Threads profile.

- `activity-feed` reads activity notifications. `--first` (alias `--limit`) defaults to 50. `--category-filter` narrows the feed to `text_post_app_conversations`, `text_post_app_following`, `text_post_app_private_follow_requests`, `text_post_app_mentions`, `text_post_app_replies`, `text_post_app_user_follows`, `text_post_app_quote_posts` or `text_post_app_reposts`.

- `liked-media` and `saved-posts` read the posts the user liked or saved. Both accept `--since`, `--until`, `--sort-order`, `--after` and `--first` (alias `--limit`), which defaults to 10.

```sh
/opt/hatch/bin/threads-cli activity-feed --account-id <account_id> --first 20 --category-filter text_post_app_mentions
/opt/hatch/bin/threads-cli liked-media --account-id <account_id> --since 2026-03-01 --until 2026-03-20 --sort-order asc
/opt/hatch/bin/threads-cli saved-posts --account-id <account_id> --limit 20 --after <cursor>
```

## Insights

- `insights-overview` reads account insights, such as views, likes, quotes, replies, reposts, traffic sources and demographics. It requires `--start-date` and `--end-date` in YYYY-MM-DD. `--sections` takes a comma-separated subset of `summary`, `views`, `interactions`, `followers`, `demographics` and `all`.

- `post-insights --post-id ID` reads insights for one post.

- `top-posts` returns the most-viewed posts and the service's top three most-liked posts between the required `--start-date` and `--end-date`. `--count` sets how many most-viewed posts come back and defaults to 10.

- `insights-overview --time-zone-id` and `top-posts --time-zone-name` default to `America/Los_Angeles`. Pass the user's IANA time zone, such as `Europe/London`, when the dates should follow their calendar.

```sh
/opt/hatch/bin/threads-cli insights-overview --account-id <account_id> --start-date 2026-03-13 --end-date 2026-03-20 --sections followers
/opt/hatch/bin/threads-cli post-insights --account-id <account_id> --post-id <post_id>
/opt/hatch/bin/threads-cli top-posts --account-id <account_id> --start-date 2026-03-13 --end-date 2026-03-20 --count 5
```

## Other profiles

- `user-profile --user-id ID` reads a profile by numeric user FBID only. It accepts no username or profile URL.

- `profile-threads`, `profile-replies` and `profile-media` read a user's posts, replies and media posts with `--user-id`, `--after` and `--first` (alias `--limit`), which defaults to 20.

- `followers` and `following` read a user's lists with `--user-id`, `--first` and `--after`. `following` defaults to 20 accounts per page.

```sh
/opt/hatch/bin/threads-cli user-profile --account-id <account_id> --user-id <user_id>
/opt/hatch/bin/threads-cli profile-threads --account-id <account_id> --user-id <user_id> --first 10 --after <cursor>
/opt/hatch/bin/threads-cli followers --account-id <account_id> --user-id <user_id> --first 10
```

## Posts and reactions

- `post` reads one post with exactly one of `--url` or `--post-id` (alias `--id`). For a `threads.com` or `threads.net` permalink or share link, pass the original URL unchanged to `--url`. Use `fetch-post-comments` for its replies.

- `fetch-post-comments` (alias `comments`) reads comments for up to 10 posts in `--post-ids`. It accepts `--since`, `--until`, `--sort-order` (default `desc`), `--limit` (alias `--first`, default 50), `--after` and repeated or comma-separated `--author-id`.

- `fetch-post-likers` (alias `likers`) reads likers with the same options, filtered by up to 50 `--reactor-id` values instead of `--author-id`.

- `feedback-hub-overview --post-id ID` summarizes a post's like, repost and quote counts. `feedback-hub-tab --post-id ID --tab-type TYPE` pages through the accounts behind one tab, where `--tab-type` is `like`, `repost`, `quote` or `highlight` and `--first` defaults to 20.

```sh
/opt/hatch/bin/threads-cli post --account-id <account_id> --url https://www.threads.com/@<username>/post/<shortcode>
/opt/hatch/bin/threads-cli post --account-id <account_id> --post-id <post_id>
/opt/hatch/bin/threads-cli fetch-post-comments --account-id <account_id> --post-ids <post_id>,<post_id> --limit 20 --after <cursor>
/opt/hatch/bin/threads-cli fetch-post-likers --account-id <account_id> --post-ids <post_id> --reactor-id <user_id>
/opt/hatch/bin/threads-cli feedback-hub-tab --account-id <account_id> --post-id <post_id> --tab-type repost --first 10
```

## Discovery

- `trends` reads trending topics, with `--first` defaulting to 15.

- `search --query TEXT` searches Threads by keyword and returns the Top tab. `--recent 1` returns the Recent tab instead, `--trend-fbid` digs into a trend from `trends`, and `--first` (default 20) with `--after` pages the results.

- `feed --variant for_you` or `--variant following` reads the For You or Following feed, with `--first` (default 20) and `--after`. `--sort-by top` or `--sort-by recent` applies only to Following.

```sh
/opt/hatch/bin/threads-cli trends --account-id <account_id> --first 10
/opt/hatch/bin/threads-cli search --account-id <account_id> --query "AI news" --recent 1
/opt/hatch/bin/threads-cli search --account-id <account_id> --query "<trend name>" --trend-fbid <trend_fbid>
/opt/hatch/bin/threads-cli feed --account-id <account_id> --variant following --sort-by recent
/opt/hatch/bin/threads-cli feed --account-id <account_id> --variant for_you --after <cursor>
```
