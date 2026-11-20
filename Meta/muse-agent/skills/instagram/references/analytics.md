# Instagram analytics

- These commands support performance reviews of the user's accounts and public comparisons with other accounts. `individual-post-insights` reads only owned media.

- `--account-id` is always the user's own linked account from `accounts`. It selects the account the command runs as and is never a competitor's identifier.

## Commands

```sh
/opt/hatch/bin/instagram-cli analytics-metric-metadata --account-id <user_own_fbid> --metric-name <metric>
/opt/hatch/bin/instagram-cli analytics-account-insights --account-id <user_own_fbid> --time-range last-28d
/opt/hatch/bin/instagram-cli analytics-account-insights --account-id <user_own_fbid> --time-range last-28d --include-time-series
/opt/hatch/bin/instagram-cli analytics-account-insights --account-id <user_own_fbid> --time-range last-28d --include-top-content
/opt/hatch/bin/instagram-cli individual-post-insights --account-id <user_own_fbid> --post <media_id>
/opt/hatch/bin/instagram-cli analytics-metric-metadata --account-id <user_own_fbid> --content-type feed --metric-name <metric>
/opt/hatch/bin/instagram-cli analytics-top-post --account-id <user_own_fbid> --username <handle> --days 30 --include-text
/opt/hatch/bin/instagram-cli analytics-follower-count-delta --account-id <user_own_fbid> --username <handle> --days 28
/opt/hatch/bin/instagram-cli analytics-metric-cards --account-id <user_own_fbid> --username <handle> --username <handle> --days 28
```

- `analytics-metric-metadata` resolves a metric's display name and definition, and `--metric-name` can repeat. Use the returned display name and definition verbatim. Omit a metric that has no display name, and never invent a missing definition.

- The account **Viewers** key is `instagram_organic_account_content_meta_viewer_count`, optional during rollout. Follow [Audience metric selection](account-insights-metrics.md#audience-metric-selection) for selection, labels and availability.

- `analytics-account-insights` reads the selected account's metrics. For several owned accounts, call it once per account. Add `--include-time-series` when the question needs a trend.

- It defaults to `last-28d`. Follow [Read account insights](../CONNECTOR.md#read-account-insights) for command selection and supported windows, and [Account analytics results](account-analytics-results.md) for metric interpretation.

- Add `--include-top-content` for owned content ranked by views; follow [Content ranked by views](account-analytics-results.md#content-ranked-by-views) for creation-window filtering, lifetime ranking and post readback. `analytics-top-post` ranks by likes instead.

- `individual-post-insights` reads one owned post's lifetime metrics, with no time range. Follow [Owned media results](#owned-media-results) for definitions, availability and paid/organic scope.

- `analytics-top-post` returns the most-liked post for each handle in the window. Add `--include-text` whenever a post will be named, summarized or displayed, so its label comes from returned content.

- `analytics-follower-count-delta` compares follower counts for handles, including other accounts. Its `--days` selects that comparison's lookback; owned-account reviews use the follower fields in `analytics-account-insights`. An empty daily series means there is not enough history, not zero growth.

- `analytics-metric-cards` returns comparable metric cards. Check each account's `window.complete` and errors before comparing, keep card values and `growth_display` verbatim, and never convert that ratio to a percentage.

- `--username` can repeat, up to 10 handles per call. Put the accounts being compared in one call so they share one window.

## Owned media results

- The media **Viewers** key is `instagram_organic_media_content_meta_viewer_count`. Follow [Audience metric selection](account-insights-metrics.md#audience-metric-selection) for the legacy publication cutoff, labels and availability.

- Resolve requested metrics with `analytics-metric-metadata`. `individual-post-insights` does not return a content type. When matching media metadata establishes the type, use `--content-type reel`, `feed` for feed posts or carousels, `story`, or `live_video`. Omit the flag when the type is unknown. Preserve returned units and estimate status.

- Missing or `null` values are unavailable, not zero. Paid/organic splits apply only when returned. Rates and shares are fractions (`0.125` means 12.5%); follower shares under `instagram_organic_media_content_views_count` describe organic views, not distinct accounts or paid-inclusive views.

- `has_paid_traffic_in_window` reflects positive paid traffic in available lifetime metrics; false or a missing split does not prove there was no paid distribution. Accounts reached, Viewers, returned rates and Watch time retain their returned organic basis. The catalog does not specify Watch time duration units, so keep them unchanged and identify the unit as unknown.

## Read the results correctly

- Join results by the resolved handle or an echoed request identifier, never by array position.

- Keep the service's deltas, ratios and rankings as returned rather than recomputing them from rounded display values.

- `analytics-top-post` can return a post published outside the requested window. Check its returned publication date before using it.

- Account metrics describe the account, not any single post. Read the post's content with the commands in [read commands](read-results.md), and use `individual-post-insights` for detailed metrics on the user's own post.

## Other accounts

- For accounts the user does not own, the comparison commands return public metrics only. `individual-post-insights` never returns another account's private post metrics.

- No command reads a product launch directly. Read the relevant public posts instead.
