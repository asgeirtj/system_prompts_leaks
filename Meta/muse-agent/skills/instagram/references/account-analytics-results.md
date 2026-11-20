# Account analytics results

- For `analytics-account-insights` totals, read the selected account and requested window, then resolve requested metric keys with `analytics-metric-metadata`, batching repeated `--metric-name` flags. Follow [Analytics](analytics.md) for metadata lookups.

- For totals-only requests, omit optional series, top content and follower-history fallback calls. Never replace an unavailable field with another command or metric.

- `analytics-account-insights` returns an `accounts` array for the selected linked account. Read each entry's `error` and `time_range` before reporting its `metrics` or comparing periods.

- Apply [Account insight metrics](account-insights-metrics.md#interpret-the-values) to counting units, windows, estimate status and caption corrections.

## Interactions and followers

- `metrics.ig_total_account_interactions_count` is the account's interaction count for the window.

- With `--include-time-series`, `interactions_over_time` contains daily interaction counts. `net_followers_over_time` contains `overall`, `follows` and `unfollows` series; `overall` is net growth, not the number of new follows.

- `metrics.instagram_account_follows_count` is **Followers**, the current follower-count snapshot despite its field name. `metrics.instagram_user_follower_growth` is **Net followers**, the returned change in followers over the window.

- `follower_growth_delta.value` is formatted growth from the window's starting follower count to its current count, accompanied by `sentiment`. Preserve that display value; it is not an unformatted ratio or a count of follows.

## Views and viewers

- `metrics.instagram_organic_account_content_views_count` supplies Views. `metrics.instagram_organic_account_content_meta_viewer_count` supplies estimated Viewers. Views can include repeated viewing; viewers count accounts, not people.

- If the requested Views or Viewers field is omitted or `null`, report that metric as unavailable. Never infer it from `ig_account_aggregated_content_views_count`, even when that combined Instagram/Facebook count is zero. Report zero only when the requested metric's own field contains zero.

- Keep returned content-format and follower-status labels, including unknown buckets, unchanged.

- Daily Viewers or Accounts reached values cannot be summed into a unique count for the whole window because an account can appear on multiple days.

- Active followers are snapshots; sparse points do not establish a daily activity trend.

## Comparisons and availability

- `prior_period_comparison` supplies `current`, `prior` and `delta_pct` for each metric. `delta_pct` is a decimal fraction: `0.2` means 20%. It is separate from formatted `follower_growth_delta.value` and metric-card `growth_display`.

- Omitted fields, `null` values and empty series are unavailable, not zero. Retain measured zeroes and the dates actually returned.

- A missing or zero prior baseline can produce `delta_pct: null`. That does not establish zero growth or justify a computed percentage.

## Content ranked by views

- `--include-top-content` requests up to five records in `top_content_by_views`.

- The requested window filters creation dates. Ranking uses lifetime views within Instagram's candidate limit, so it does not measure views earned during that window or guarantee a ranking across every post ever published.

- Use each record's `media_id` with `post --id` for captions and links. Account totals stay at account level; the ranking's `views` belong to each returned media record.
