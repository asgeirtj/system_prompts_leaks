# Account insights metrics

Use these names, units, and definitions when reporting `account-insights`
results or explaining an Instagram metric. Definitions come from Meta's
external metric catalog. Explain them in plain language, but keep the meaning
and the unit.

## Interpretation

- When explaining or comparing metrics, state each table definition's counting
  unit, counting condition, included content types, and estimate status.
- The catalog does not specify how Accounts Center accounts map to Instagram
  accounts, guarantee an ordering of these totals, or link the accounts and
  events across metrics. Treat these relationships as unknown.
- For interpretations beyond the reported counts and arithmetic, identify the
  catalog statement or independent evidence supporting the claim. If neither
  establishes it, state what remains unknown. When answering whether a gap
  proves a cause, stop there. Do not volunteer possible or likely causes.
- Use the Viewers definition below. Do not add a video-only scope or a minimum
  watch duration.
- Describe a calculated ratio by its numerator and denominator. Ratios of
  visits or taps do not establish the fraction of distinct accounts that took
  an action.
- Visit counts can include repeat visits and do not identify distinct visitors.
  Distinct visiting accounts can equal or be fewer than the number of visits.
- `account-insights` has no follower count or follower growth. Do not derive
  one from demographic totals.
- `account-insights` does not return an engagement rate. When calculating one,
  state the chosen formula and inputs.

## `account-insights` fields

| Field | Instagram name | Unit | Definition |
|---|---|---|---|
| `accounts_reached` (or `reach`) | Accounts reached | accounts | The number of unique accounts that have seen your content at least once, including promoted posts and stories. Different from Views, which may include multiple views by the same accounts. Estimated. |
| `viewers` | Viewers | Accounts Center accounts | The number of Accounts Center accounts that have viewed your content at least once. Content includes reels, posts, stories, videos, live videos, and ads. Estimated. |
| `content_views` | Views | views | The number of times your content was played or displayed, including repeat views. Content includes reels, posts, stories, videos, live videos, and ads. |
| `content_views_by_follow_type` | Views by followers and non-followers | views | Views split by `1` followers, `2` non-followers, `0` unknown. **Views from non-followers** is the percentage of views that came from non-followers. |
| `engaged_accounts` | Accounts engaged | accounts | The number of accounts that have interacted with your content, including in ads. Interactions include likes, saves, comments, shares, and replies. Estimated. |
| `total_interactions` | Content interactions | interactions | The total number of post, story, reel, video, and live video interactions, including interactions on boosted content. |
| `interactions_by_follow_type` | Content interactions by followers and non-followers | interactions | Interactions split by `1` followers, `2` non-followers. |
| `interactions_by_media_type` | Content interactions by content type | interactions | Interactions split by internal content-type codes. Do not name the content types. Report the total or omit it. |
| `likes` | Likes | likes | The number of likes on your content. |
| `comments` | Comments | comments | The number of comments on your content minus deleted comments. |
| `saves` | Saves | saves | The number of saves of your content minus unsaves. |
| `shares` | Shares | shares | The number of shares of your content. |
| `replies` | Replies | replies | Replies to your stories, including text replies and quick reaction replies. |
| `profile_visits` | Profile visits | visits | The number of times your profile was visited. |
| `bio_link_taps` | External link taps | taps | Taps on links on your profile, excluding taps on your connected Facebook profile. |
| `contact_button_taps` | Contact button taps | taps | Taps on your business address, call, email, or text buttons. |
| `follower_demographics_by_*` | Follower demographics | followers | Your followers by age, gender (`F`, `M`, `U` unknown), country, or city, based on information people provide in their profiles. |
| `online_followers` | Most active times | followers | Followers online by day and hour range. |

## Other Instagram metrics

`account-insights` does not return these. Use the definitions to answer
questions about them.

| Metric | Definition |
|---|---|
| Impressions | The number of times your content was on screen, including in ads. Instagram now reports Views for organic content. |
| Initial plays | The number of times your reel starts to play for the first time in a reel session. Counts plays of at least 1 millisecond and excludes replays. |
| Replays | The number of times your reel starts to play again after an initial play in the same reel session. |
| Watch time | The total time your reel was played, including time spent replaying it. |
| Average watch time | Watch time divided by initial plays. A viewer-based version divides by viewers. |
| Story views | The number of views of your story, including repeat views. |
| Accounts reached (live video) | The number of unique accounts that saw at least 3 seconds of your live video. Estimated. |
| 3-second video plays | The number of times your video played for at least 3 seconds, or nearly its full length if shorter. |
| Returning viewers | Viewers who saw your content in the last 90 days and are returning to see this reel. |
| Overall followers | Accounts that followed you minus accounts that unfollowed you or left Instagram in the period. Net growth, not new followers. |
| Active followers | Followers who were active on Instagram in the period. |
| Hook rate | The percentage of views that watched past the first 3 seconds of recent reels. Calculated as views of at least 3 seconds divided by initial views. |
| Like rate, save rate | Each rate is the number of a reel's viewers who took the corresponding action divided by initial views, expressed as a percentage. |
| Comment rate, share rate | Each rate is the number of a reel's viewers who took the corresponding action divided by initial views, expressed as a percentage. Estimated and in development. |
| Profile activity | Actions taken when engaging with your profile. |

For a metric not listed here, use `social_content_performance`, which resolves
catalog definitions with `instagram-cli analytics-metric-metadata`. Do not
invent a definition.
