---
description: Live external data in a web artifact (quotes, scores, weather, news, anything current-at-open). Which kind owns the request, the ctx channels for fullstack pages, the build-time snapshot rule for static pages (data fixed at build, never fetched at open), refresh and caching patterns, and the ban on simulated live data.
builders: web
---

# Live external data

## First, Which Kind Owns the Request

A `web_fullstack` page fetches server-side with the full toolset below. A
`web_static` page has no server and no SDK: `ctx.*` does not exist there, and its
data is fixed when it is built.

- Anything whose content must be current whenever the user opens it (live
  prices, scores, schedules, news): `web_fullstack`.
- Any searchable data as a dated snapshot: a static page can bake real data at
  build time through the bundled web-search CLI and present it labeled as of its
  fetch time (pattern below).
- Anything needing an API key, an account, server-side caching, or a scheduled  
  refresh: `web_fullstack`.

If you are building the static kind and the data genuinely needs a server, do not
approximate it in the browser: finish with `web_artifacts.exit_build`
(`status: "failure"`) explaining that it needs to be built server-backed, so the
main agent can rebuild it that way.

## In a web_fullstack Artifact: the ctx Channels

Work down this list inside a server action and take the first channel that fits.

1. **`ctx.tool.finance_ticker(symbol, options?)`**: quotes and price history. One
   ticker symbol per call ("META GOOG" is rejected); fetch a watchlist with
   `Promise.all`. The result's `instrument` carries price, currency, change,
   change_percent, intraday high/low, 52-week range, `market_status`, and `as_of`;
   request `interval: "1m" | "30m" | "1d" | "1w" | "1mo"` to also get OHLCV
   `history` points (oldest first) for charts. Select the interval from the
   user's requested time range: use `1m` for a current-day/current-session
   chart and `30m` for a coarser multi-day intraday chart. These are independent
   upstream series: on a trading day, `1m` may already carry current-day bars
   while the `30m` series still ends at the prior trading day and carries no
   current-day bars yet. Do not treat `30m` as an aggregation of `1m`, and do
   not switch intervals automatically.
2. **`ctx.tool.sports_data(query)`**: scores and fixtures. Each item carries teams,
   `score`, `status` (`closed` / `inprogress` / `scheduled`), and `starts_at` in
   UTC; player and team statistics are present only when the upstream has them.
3. **`ctx.tool.weather(query, options?)`**: resolved location, current
   conditions, daily forecast, optional hourly, and alerts. When the user asks
   for a specific hourly horizon, set `hourly_hours` to that requested count
   (maximum 48); both web-artifact runtimes apply it to the upstream hourly
   series.
4. **`ctx.tool.web_search(query)`**: everything else. Snippets are usually enough;
   pipe them through `ctx.inference.complete(prompt, { schema })` to distill typed
   rows instead of opening pages. Do not spawn an agent task just to search.
5. **Plain `fetch()` to a public JSON API**: works from any server action; the
   runtime routes it through the platform egress proxy, and simple GET reads are
   covered by the artifact's trusted read authority, scheduled refreshes
   included. Declare every host you will fetch at runtime in the plan's
   `data_plan.declared_hosts` as an audit inventory (omit it when sourcing runs
   only through `ctx.tool.web_search`). Prove the endpoint returns useful data
   for this query, region, and date in the build's test phase; types and docs do
   not.
6. **`ctx.agent.spawnTask(message, { expectsAction })`**: a detached research agent
   with browsing and full tool use, for gathering that genuinely needs multiple
   steps. It returns a task handle immediately, never the answer; the spawned agent
   delivers results by calling the action you name. Never block a page load on it.

Every observation field on the managed channels is nullable by design: the
upstream may omit price, score, or forecast pieces. Degrade the display; do not
throw, and do not substitute invented values.

**Fetch-on-open is the default freshness pattern.** The page calls a read action
on load; the action serves the latest cached row from `ctx.db` and refreshes from
the source when the cache is stale. Pick a staleness budget that matches the
domain (quotes: minutes while the market is open; weather: an hour; schedules: a
day) and always render the data's `as_of` time. Keep the load path fast: serve
cache first, refresh behind it or on a user-visible refresh control; the managed
channels default to a 90 second timeout inside the action's own deadline.

**Wiring a scheduled prefetch.** At create time the schedules come from the
build request's `Refresh triggers`. Register each job from the builder seat with
`cron.add_artifact_action` with the requested schedule and verified action
invocation. Record the installed job in `space.json` `managedCronJobs` and
confirm it with `cron.status`. This invokes the action directly and is silent on
success. If the user asked for a chat response after every refresh, use an agent
schedule with an explicit delivery target instead. Scheduled runs execute
unattended under the same web-reading approval. Each occurrence dispatches at
most once. After dispatch, timeout, failure, or interruption can leave committed
effects and will not trigger an automatic retry. Check the saved state before
retrying manually; a crash before the write can leave an occurrence incomplete.

**Cache shape.** Store snapshots keyed by subject (ticker, venue, query) with
`as_of` and any status the source reports (`market_status`, `inprogress`). Readers
take the latest row per key; keep a small retention window and prune the rest so
the table stays bounded.

## In a web_static Page: a Dated Snapshot, Fixed at Build

Do not wire a static page to fetch data at open: no external APIs from the page, no polling, and never a public CORS
proxy to reach a source that blocks browsers; every open-time dependency is a
third party the user silently takes on, and a page that needs one is the
server-backed kind mis-built as static. Assets are different: CDN libraries,
web fonts, and the page's own images follow the seat's asset rules; the line
here is about data. What a static page carries honestly is a real snapshot:

- Source the data during the build with the bundled CLI: run
  `/opt/hatch/bin/web-search "<query>" --out <file>` and read the file back;
  stdout carries only a trimmed summary, and large payloads truncate in the
  shell. It is the same search engine the fullstack `ctx.tool.web_search`
  rides. Include the needed timeframe in the query and check source dates;
  use `--verticals finance|sports|weather` for domain hints, one ticker per
  finance query. Each call searches one query; use separate calls for other
  questions.
- Distill the JSON into the typed constant the page renders, and keep the
  source names.
- Bake the fetch time in as `as_of` and render it, with the sources named: the
  page presents a dated snapshot, and that is its contract.
- When the user later wants newer numbers, an ordinary `edit` re-runs this
  builder and re-bakes.

The CLI is the builder's tool, never the page's: it runs during the build, and
the finished page must not invoke it, reference its path, or wrap it in an
invented endpoint for the page to call. The page renders the baked constant
and nothing else.

A shared copy of a static page carries the same dated snapshot; that is what
sharing preserves.

## Non-negotiables (both kinds)

- **Never simulate live data.** No random-walk price animation, no seeded numbers
  presented as current, no fabricated movement timed to market hours. When the
  source fails, show the honest error or the stale cache labeled with its `as_of`;
  an honest empty state beats a convincing fake.
- **Session math belongs to the venue, not the viewer.** Trading hours and
  day-bucketing for a fixed market are computed in that market's timezone (US
  markets: `America/New_York` via `Intl.DateTimeFormat`), never from the local
  clock alone.
