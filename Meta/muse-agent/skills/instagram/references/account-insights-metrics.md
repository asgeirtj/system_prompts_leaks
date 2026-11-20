# Account insight metrics

- The field list describes `account-insights`; [Account analytics results](account-analytics-results.md) covers `analytics-account-insights`. Audience selection and interpretation apply to account and post insights, including user-supplied figures. Use each returned definition for counting scope.

- Use the documented display name for fields listed below and the external Metric Catalog display name returned for catalog-keyed analytics results whenever citing a metric, including in prose, headings, tables, comparisons and recommendations. Preserve every substantive word and qualifier; if the name reads awkwardly, rewrite the sentence rather than shortening, expanding or paraphrasing it. Explain the definition in plain language without changing the display name, meaning or unit.

- Report only values returned for that metric, account or post, and window or lifetime scope. Preserve the sign and qualifiers; do not round, estimate, bucket or substitute a nearby value.

- Do not derive, extrapolate, aggregate, or recompute analytics values. Use tool-provided totals, deltas, ratios, extrema and rankings as returned; when the requested result is not returned, say it is unavailable.

- Apply the unit and caption rules to account and post figures; returned media definitions take precedence for `individual-post-insights`. Use supplied values unless the request needs missing or newer data.

- For `account-insights`, Unix-second time bounds override a period and date bounds; a period overrides date bounds. Date-only bounds start at UTC midnight. The response omits the window, so state the window you used beside the values.

- A returned metric can be absent or `null`; otherwise it is a list of entries with a `value` and optional `dimension_values` codes. Absence and `null` do not mean zero. `account-insights` is refused when Access analytics is set to deny or ask; explain the setting rather than retrying.

## Audience metric selection

- Lead account summaries and eligible media summaries with the actual **Viewers** metric. Keep its Accounts Center count separate from **Accounts reached**, which counts Instagram accounts.

- Posts published before February 1, 2026 retain **Accounts reached**. Establish the publication date from matching media metadata before using the returned Accounts reached value as the legacy audience count. Missing Viewers alone does not establish eligibility.

- Unavailable Viewers is not zero; preserve a measured zero. Do not substitute Accounts reached for unavailable Viewers on account insights or newer posts.

## Interpret the values

- Accounts reached, Viewers and Accounts engaged are estimated account counts, and one person can have several accounts. Keep the account unit in reports and captions, and state the reporting window in the same text.

- Views, interactions, profile visits and taps count events. Keep those units instead of converting their totals to accounts or people. Label a metric as estimated only when its definition says so.

- If requested copy uses the wrong unit, correct it in the publishable text itself. A separate note does not fix a misleading caption.

- When explaining or comparing metrics, state each definition's counting unit, counting condition, included content types and estimate status.

- The catalog does not say how Accounts Center accounts map to Instagram accounts, guarantee any ordering among these totals, or link the accounts and events behind different metrics. Treat those relationships as unknown.

- For an interpretation beyond the reported counts and arithmetic, name the catalog statement or independent evidence that supports it, or say what remains unknown. When the user asks whether a gap proves a cause, stop there without volunteering possible causes.

- Use the Viewers definition as written, without adding a video-only scope or a minimum watch time.

- Describe a returned ratio by its stated numerator and denominator. Ratios of visits or taps do not show the share of distinct accounts that acted.

- Visit counts can include repeat visits and do not identify distinct visitors, whose number can equal or fall below the visit count.

- `account-insights` returns no current follower total, change in followers or calculated engagement-rate metric. Never derive those figures from other values; report them as unavailable from this command.

## Fields returned by account-insights

- `accounts_reached` maps to **Accounts reached**, counted in accounts. It is the number of unique accounts that have seen your content at least once, including promoted posts and stories. It differs from Views, which may include several views by the same accounts, and it is estimated.

- `viewers` is **Viewers**, counted in Accounts Center accounts. It is the number of Accounts Center accounts that have viewed your content at least once, across reels, posts, stories, videos, live videos and ads, and it is estimated.

- `content_views` is **Views**, counted in views. It is the number of times your content was played or displayed, including repeat views, across reels, posts, stories, videos, live videos and ads.

- `content_views_by_follow_type` is **Views by followers and non-followers**, counted in views. It splits views by `1` followers, `2` non-followers and `0` unknown. **Views from non-followers** is the percentage of views that came from non-followers.

- `engaged_accounts` is **Accounts engaged**, counted in accounts. It is the number of accounts that have interacted with your content, including in ads, through likes, saves, comments, shares and replies, and it is estimated.

- `total_interactions` is **Content interactions**, counted in interactions. It is the total number of post, story, reel, video and live video interactions, including interactions on boosted content.

- `interactions_by_follow_type` is **Content interactions by followers and non-followers**, counted in interactions. It splits interactions by `1` followers and `2` non-followers.

- `interactions_by_media_type` is **Content interactions by content type**, counted in interactions. It splits interactions by internal content-type codes, so report the total or omit it, and never name the content types.

- `likes` is **Likes**, the number of likes on your content.

- `comments` is **Comments**, the number of comments on your content minus deleted comments.

- `saves` is **Saves**, the number of saves of your content minus unsaves.

- `shares` is **Shares**, the number of shares of your content.

- `replies` is **Replies**, the replies to your stories, including text replies and quick reaction replies.

- `profile_visits` is **Profile visits**, counted in visits. It is the number of times your profile was visited.

- `bio_link_taps` is **Bio link taps**, counted in taps. It counts taps on links on your profile, excluding taps on your connected Facebook profile.

- `contact_button_taps` is **Contact button taps**, counted in taps. It counts taps on your business address, call, email or text buttons.

- `follower_demographics_by_*` is **Follower demographics**, counted in followers. It breaks down your followers by age, gender (`F`, `M`, or `U` for unknown), country or city, based on information people provide in their profiles.

- `online_followers` is **Most active times**, counted in followers. It shows followers online by day and hour range.

## Other Instagram metrics

- `account-insights` does not return these metrics. Use the definitions to answer questions about them.

- `account_followers` is **Followers**, the account's current follower-count snapshot.

- `instagram_organic_media_follow_count` is **Follows**, the number of follows attributed to the content.

- `ig_posts_count` is **Number of Posts**, the returned published-content count. Never shorten it to "Posts."

- `ig_account_aggregated_content_views_count` is **Aggregated account level views from IG and FB**. Keep that full cross-platform scope; never relabel it as Views, total views or content views.

- `instagram_media_impressions_count` is **Impressions**, the number of times your content was on screen, including in ads. Instagram now reports Views for organic content.

- `ig_clips_play_count` is **Initial plays**, the number of times your reel starts to play for the first time in a reel session. It counts plays of at least 1 millisecond and excludes replays.

- `instagram_clips_video_replay_count` is **Replays**, the number of times your reel starts to play again after an initial play in the same reel session.

- `instagram_organic_video_view_total_time` is **Watch time**, the total time your reel was played, including time spent replaying it.

- `ig_reels_avg_watch_time` is **Average watch time**, watch time divided by initial plays. A viewer-based version divides by viewers.

- `ig_reels_skip_rate` is **Reels skip rate**. Preserve the returned rate and never recompute it.

- `instagram_organic_clips_retention_graph` is **Reels Retention Graph**. Preserve its returned points rather than deriving retention values.

- `instagram_media_repost_count` is **Reposts**, the number of times the media was reposted.

- `ig_post_engagement_rate` has no official display name. Omit it rather than calling it "Engagement rate" or deriving a replacement.

- **Story views** are the number of views of your story, including repeat views.

- `instagram_media_impressions_unique` is **Accounts reached**. For a live video, it is the number of unique accounts that saw at least 3 seconds of it, and it is estimated.

- **3-second video plays** are the number of times your video played for at least 3 seconds, or nearly its full length if shorter.

- **Returning viewers** are viewers who saw your content in the last 90 days and are returning to see this reel.

- `instagram_user_follower_growth` is **Net followers**, the accounts that followed you minus the accounts that unfollowed you or left Instagram in the period. It is net growth, not new followers.

- **Active followers** are followers who were active on Instagram in the period.

- **Hook rate** is the percentage of views that watched past the first 3 seconds of recent reels, calculated as views of at least 3 seconds divided by initial views.

- **Like rate** and **save rate** are each the number of a reel's viewers who took that action divided by initial views, expressed as a percentage.

- **Comment rate** and **share rate** are calculated the same way. Both are estimated and in development.

- **Profile activity** is the actions taken when engaging with your profile.

- For a metric not listed here, resolve its definition with `analytics-metric-metadata` as [analytics](analytics.md) describes. Never invent a definition.
