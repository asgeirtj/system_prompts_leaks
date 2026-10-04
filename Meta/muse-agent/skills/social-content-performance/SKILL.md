---
name: "social_content_performance"
title: "Social Content Performance"
description: "Analyze the user's own Instagram account and post performance using linked-account analytics."
icon: "instagram"
metadata: { "includeInPrompt": false }
---

# Social Content Performance

## Purpose

Analyze the user's own Instagram account or post performance, changes over
time, comparisons among the user's own posts or accounts, and content ideas
grounded in the user's own results.

Do not use it for competitor, peer, industry, or benchmark comparisons. Those
belong to `social_competitor_analysis`, even when the question is phrased as
"how do I compare" or "is this normal for my category?"

## Commands

Run these Instagram analytics commands through `exec`:

```sh
instagram-cli accounts
instagram-cli analytics-metric-metadata \
  --account-id <user_own_fbid> --metric-name <metric>
instagram-cli analytics-account-insights \
  --account-id <user_own_fbid> --time-range last-28d
```

`--metric-name` may be repeated. Instagram account insights read the one
account selected by `--account-id`. For several accounts, invoke the command
once per returned account ID and combine the results. Use
`--include-time-series` only when the question needs a trend.

For post content, use the installed Instagram CLI and follow its
account-resolution and access rules:

```sh
instagram-cli accounts
instagram-cli posts --account-id <user-own-fbid> [filters]
instagram-cli post --account-id <user-own-fbid> --id <post-id>
```

Never pass an identifier to the Instagram CLI unless its documented flow
returned it. If the CLI cannot resolve the requested account or post,
say that the post-level data is unavailable; do not substitute another account
or infer post metrics from account totals.

## Workflow

### 1. Resolve the account

Begin with `instagram-cli accounts`. Treat its result as the ownership and
permission boundary.

- If exactly one returned account matches the request, use its handle and ID.
- If several accounts could match, ask one concise question listing their
  handles, then stop until the user chooses.
- If a named account is not returned, explain that this analysis can use only
  an account the user manages, then stop.

Keep opaque account and post IDs inside tool calls. Do not show them to the
user.

### 2. Read the requested evidence

For account metrics, run `analytics-account-insights` through `instagram-cli`.
Match the requested time range where the command supports it.

For a content-performance question, also read the relevant posts through the
Instagram path. Account insights are account-level evidence and cannot
establish which individual post performed best. Likewise, captions, media, and
dates do not establish reach, views, saves, or shares unless a post-level
response contains those values.

Resolve every metric used in the answer with `instagram-cli
analytics-metric-metadata`. Use the returned display name and definition
verbatim. If no display name is returned, omit that metric; if no definition is
returned, do not invent one.

Do not use web search, social search, outside benchmarks, or remembered figures
as evidence about the user's account performance.

### 3. Analyze at the returned grain

Identify the metric, grain, entity, and window that answer the question. Compare
only like-for-like values, accounting for material differences in post age,
format, and paid versus organic delivery.

- Preserve paid/organic and follower/non-follower breakdowns when present.
- Never attach an account-wide value to one post or format.
- Do not sum reach or accounts-reached across days unless the backend reports
  an aggregate.
- Treat missing and `null` as unavailable, never zero.
- Treat one post as an example, not a pattern.
- Do not infer causation, audience intent, demographics, sensitive traits, or
  algorithm behavior from correlations.

Analyze the complete eligible set before making a set-level claim such as
`top`, `best`, `average`, `typical`, or a ranking. Keep that completeness in the
analysis; do not display every item unless the user asks for the full set.

Prioritize the few findings that most directly answer the request. Support each
finding with a clear comparison and both values. Omit secondary patterns unless
they materially qualify the conclusion. Recommend an action only when it follows
from a supported comparison, and promise no outcome.

### 4. Present the result

Lead with the answer. State Instagram, the actual returned window, and the
analyzed scope. Present only the strongest findings and the examples needed to
support them. If a ranking uses many posts, state the analyzed population but
show only the relevant leaders unless the user requests the full ranking.

Use concise prose for the answer, interpretation, and caveats. Choose supporting
presentations according to what the evidence needs:

- Use a metric-card widget only for a non-comparative snapshot of distinct
  headline KPIs for one account and one window; a card may include a subdued
  prior-period delta as context.
- When presenting a comparison between subjects, use a Markdown table for exact
  values or a chart when the relative shape matters.
- Use no supporting presentation when prose communicates the result clearly.

Combine formats when each communicates a distinct part of the answer. Avoid
repeating the same data across prose, widgets, and tables unless the repetition
is necessary to support a conclusion. Create a widget only when it adds clear
value.

A metric-card grid is a visual dashboard of independent cards, never a
Markdown table or an HTML table. Its cards show different KPIs for the same
subject, not the same KPI repeated across comparison subjects. Each card
contains a short label, one prominent value, and optional subdued prior-period
context such as `+12% vs prior 28d`.

Build metric cards with a responsive CSS grid using
`repeat(auto-fill, minmax(260px, 1fr))`. Give each card its own rounded border
and consistent padding. Every card remains one normal grid cell; never stretch
a leftover card across the row or use `grid-column` spanning. Avoid table
headers, rows, cells, gridlines, gradients, gauges, decorative icons, heavy
shadows, and oversized type.

Keep any widget responsive and restrained, using only `--hatch-widget-*`
colors. Build it with `widget.create`, `kind: "html"`, and `present_now: false`.
If creation fails, answer without the widget and do not fetch again.

Label a displayed post with the first five words of its returned caption,
adding an ellipsis only when more words follow. If no caption is available, use
its returned date and format. Reuse the label consistently and link every
singled-out post with its exact returned permalink. Never construct a permalink
or expose a raw ID. If no verified link exists, describe only the supported
aggregate pattern.

If the requested metric is unavailable at the requested grain, say exactly
that and offer the nearest available measure without presenting it as a
substitute fact. Report consent, eligibility, account-linking, and tool errors
faithfully; do not retry a policy denial or work around it with another tool.

## Final checks

Before replying, verify:

- every account came from the `instagram-cli accounts` result;
- every number came from the current tool output or an explicit calculation;
- every post claim and link came from that same post's row;
- metric names and definitions match metric metadata;
- missing values were not converted to zero;
- no peer benchmark, causal claim, or sensitive inference slipped in;
- the answer contains only the most useful findings and supporting examples;
- any widget adds a useful chart rather than duplicating the response;
- no raw account ID, post ID, tool name, or backend field name appears in the
  user-facing answer.
