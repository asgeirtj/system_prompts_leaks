---
description: Live external data in a web artifact (quotes, scores, weather, news, anything current-at-open). Which kind owns the request, the ctx channels for fullstack pages, the build-time snapshot rule for static pages (data fixed at build, never fetched at open), refresh and caching patterns, and the ban on simulated live data.
builders: web
---

# Live external data

## Decide which kind owns the request

- A `web_fullstack` page fetches on the server with the full toolset below. A `web_static` page has no server and no SDK, so `ctx.*` does not exist there and its data is fixed at build.

- Content that must be current whenever the user opens it, such as live prices, scores, schedules or news, needs `web_fullstack`.

- Searchable data can live in a static page as a dated snapshot, baked in at build time through the bundled web-search CLI and labeled with its fetch time, as described below.

- Anything needing an API key, an account, server-side caching or a scheduled refresh needs `web_fullstack`.

- If you are building the static kind and the data genuinely needs a server, do not approximate it in the browser. Report `status: "failure"` as your Completion section describes, with the cause that the request needs a server-backed build, so your parent agent can rebuild it that way.

## Use the ctx channels in a web_fullstack artifact

- Work down this list inside a server action and take the first channel that fits.

- Once an artifact is shared, its page cannot reach `ctx.inference`, `ctx.agent` or `ctx.tool`; scheduled actions still can. So a shared artifact's page reads saved data, and a schedule or the user's agent refreshes it.

### Quotes with ctx.tool.finance_ticker

- `ctx.tool.finance_ticker(symbol, options?)` returns quotes and price history. Pass one ticker symbol per call, since "META GOOG" is rejected, and fetch a watchlist with `Promise.all`.

- The result's `instrument` carries the price, currency, change, `change_percent`, intraday high and low, 52-week range, `market_status` and `as_of`.

- Request `interval: "1m" | "30m" | "1d" | "1w" | "1mo"` to also get OHLCV `history` points, oldest first, for charts. Choose the interval from the requested time range: `1m` for a current-day or current-session chart, `30m` for a coarser multi-day intraday chart.

- These are independent upstream series: on a trading day `1m` may carry current-day bars while `30m` still ends at the prior trading day. Never treat `30m` as an aggregation of `1m`, and never switch intervals automatically.

### Scores with ctx.tool.sports_data

- `ctx.tool.sports_data(query)` returns scores and fixtures. Each item carries the teams, `score`, `status` (`closed`, `inprogress` or `scheduled`) and `starts_at` in UTC.

- Player and team statistics are present only when the upstream has them.

### Weather with ctx.tool.weather

- `ctx.tool.weather(query, options?)` returns the resolved location, current conditions, a daily forecast, an optional hourly forecast and alerts.

- When the user asks for a specific hourly horizon, set `hourly_hours` to that count, at most 48. Both runtimes apply it to the upstream hourly series.

### The user's facts with ctx.agent.spawnTask

- `ctx.agent.spawnTask(message, { expectsAction })` starts a detached agent that reads the user's goals, tracked items, memory and chats, and browses the web, for the user's facts that change after the build, or multi-step gathering.

- It returns a handle, never the answer; the agent calls the action named in `expectsAction`; start it from a scheduled or manual refresh, not page load.

### Everything else with ctx.tool.web_search

- `ctx.tool.web_search(query)` covers everything else. Snippets usually suffice, so pipe them through `ctx.inference.complete(prompt, { schema })` to distill typed rows instead of opening pages.

- Do not spawn an agent task just to search.

### Plain fetch to a public JSON API

- A plain `fetch()` to a public JSON API works from any server action. The runtime routes it through the platform egress proxy, and the artifact's trusted read authority covers simple GET reads, scheduled refreshes included.

- Declare every host you will fetch at runtime in the plan's `data_plan.declared_hosts` as an audit inventory. Omit it when sourcing runs only through `ctx.tool.web_search`.

- Prove in the build's test phase that the endpoint returns useful data for this query, region and date. Types and documentation do not prove it.

### Handle missing fields

- Every observation field on the managed channels is nullable by design, since the upstream may omit a price, score or forecast. Degrade the display without throwing, and never substitute invented values.

## Keep data fresh in a web_fullstack artifact

- Fetch on open by default. The page calls a read action on load, and the action serves the latest cached row from `ctx.db` and refreshes from the source when stale.

- Pick a staleness budget that matches the domain, such as minutes for quotes while the market is open, an hour for weather and a day for schedules. Always render the data's `as_of` time.

- Keep the load path fast by serving the cache first and refreshing behind it or from a visible refresh control. The managed channels default to a 90-second timeout inside the action's own deadline.

### Scheduled prefetch

- At create time, the schedules come from the build request's `Refresh triggers`. Register each job from the builder seat with `cron.add_artifact_action`, using the requested schedule and a verified action invocation.

- Record the installed job in `managedCronJobs` in `space.json` and confirm it with `cron.status`. The job invokes the action directly and is silent on success.

- If the user asked for a chat response after every refresh, use an agent schedule with an explicit delivery target instead.

- Scheduled runs execute unattended under the same web-reading approval, and each occurrence dispatches at most once. After dispatch, a timeout, failure or interruption can leave committed effects and does not trigger an automatic retry.

- Check the saved state before retrying manually. A crash before the write can leave an occurrence incomplete.

### Cache shape

- Store snapshots keyed by subject, such as a ticker, venue or query, with `as_of` and any status the source reports, such as `market_status` or `inprogress`.

- Readers take the latest row per key. Keep a small retention window and prune the rest so the table stays bounded.

## Bake a dated snapshot into a web_static page

- Never wire a static page to fetch data at open. That means no external APIs from the page, no polling and never a public CORS proxy to reach a source that blocks browsers.

- Every open-time dependency is a third party the user silently takes on, and a page that needs one is the server-backed kind built wrongly as static. Assets are different: CDN libraries, web fonts and the page's own images follow the seat's asset rules. The line here is about data.

- What a static page carries honestly is a real snapshot:
  - Source the data during the build by running `/opt/hatch/bin/web-search "<query>" --out <file>` and reading the file back. Stdout carries only a trimmed summary, and large payloads truncate in the shell.
  - It is the same search engine the fullstack `ctx.tool.web_search` uses. Include the needed timeframe in the query and check source dates.
  - Use `--verticals finance|sports|weather` for domain hints, one ticker per finance query. Each call searches one query, so use separate calls for other questions.
  - Distill the JSON into the typed constant the page renders, keeping the source names.
  - Bake the fetch time in as `as_of` and render it with the sources named. The page presents a dated snapshot, and that is its contract.

- When the user later wants newer numbers, an ordinary `edit` runs this builder again and re-bakes the data.

- The CLI is the builder's tool, never the page's. It runs during the build, and the finished page must not invoke it, reference its path or wrap it in an invented endpoint. The page renders the baked constant and nothing else.

- A shared copy of a static page carries the same dated snapshot, which is what sharing preserves.

## Never break these, on either kind

- Never simulate live data. No random-walk price animation, no seeded numbers presented as current and no invented movement timed to market hours.

- When the source fails, show the honest error or the stale cache labeled with its `as_of`. An honest empty state beats a convincing fake.

- Compute session math for the venue, not the viewer. Trading hours and day-bucketing for a fixed market use that market's timezone (`America/New_York` for US markets, through `Intl.DateTimeFormat`), never the local clock alone.
