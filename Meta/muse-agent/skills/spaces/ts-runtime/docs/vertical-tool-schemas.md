# `ctx.tool` vertical schemas

Source of truth:

- Contract: `sdk/src/verticals.ts` (`TOOL_*_RESULT_SCHEMA`, option types,
  `SpaceToolClient`), re-exported from `sdk/src/index.ts`.
- Backend mapping: `worker/src/web_search.ts` (MASE `vertical_data` → typed result).

## Landing now vs. follow-up

This documents what is **landed and mapped today**:

- **Weather** — enriched current conditions + daily/hourly forecast + alerts.
- **Finance** — latest quote (with session change) + interval-keyed OHLCV history.
  `finance(query)` returns an **array** of matched instruments;
  `finance_ticker(symbol)` returns the **single** resolved instrument (same
  fields). `ctx.tool.finance` is **deprecated** and pulled from the guidance —
  use `finance_ticker` for a single ticker's quote/price/history (by symbol) and
  `web_search` for everything else, including resolving a company name to a
  ticker (search the name, read the symbol, then call `finance_ticker`),
  comparing several instruments, and analysis. The method stays available so
  existing artifacts keep working, but it will be deleted.
- **Sports** — the flat per-event `items` list, enriched with normalized
  `sport`/`league`/`season` scope, explicit `home`/`away` teams, and parsed
  `player_statistics`/`team_statistics`. A sport-discriminated `games` union
  remains a **follow-up** (see §3).
- **Web search** — `web_search(query)`: a general web search with **no vertical
  filter** — the same plain search the agent's browser_search runs. **Web**
  results only — the exception to principle 1 below: **no `vertical_data`**;
  every field is mapped from plain web results into `results[]` (see §4).

Design principles that still hold:

1. **Structure lives in `vertical_data`.** The typed contract below is what we map
   out of MASE's per-result `vertical_data` payload. Display text (`summary`,
   `excerpt`) is display-only — do not parse it; read the structured fields.
2. **Every observation is nullable/optional.** MASE may omit a field or surface it
   only in text, so the builders degrade missing data to `null` and emit a
   schema-valid stub on an empty payload rather than throwing.
3. **Caps live in the contract.** Heavy lists carry a `.max(...)` ceiling
   (`forecast_hourly` ≤48, finance `history.points` ≤400); the builders slice to
   the cap so a large upstream series never trips `.parse()`.

### Request knobs not yet plumbed to the backend

`ToolSearchOptions.until`, `ToolWeatherOptions.hourly_hours`, and the
`ToolFinanceOptions.interval` selector are not backend request fields today;
the backend returns its full forecast or candle sets. Both runtimes apply the
model-selected variants client-side: `hourly_hours` caps the hourly forecast,
`interval` selects one candle set, and `since`/`until` bound finance history.

---

## 1. Weather

### Request

```ts
export interface ToolWeatherOptions extends ToolSearchOptions {
  /** Cap the upstream hourly forecast series at this many points, ≤48. */
  readonly hourly_hours?: number;
}
```

### Result (`TOOL_WEATHER_RESULT_SCHEMA`)

`location`, `summary`, `conditions`, `forecast_days`, `forecast_hourly?`,
`alerts?`, `sources`.

**Supported (landed) fields:**

- `conditions`: `temperature`, `unit`, `description`, `feels_like`, `high`, `low`,
  `humidity_percent`, `precipitation_chance` (0–100), `precipitation_amount`
  (formatted string, e.g. `"0.37 in"`), `wind`, `uv_index`, `air_quality_index`,
  `air_quality_description`, `sunrise`, `sunset`.
- `forecast_days[]`: `date`, `summary`, `high`, `low`, `precipitation_chance`,
  `precipitation_amount`, `wind`.
- `forecast_hourly[]` (≤48, present when the feed returns hourly): `time` (ISO),
  `temperature` (null — the feed omits it hourly today), `description`,
  `precipitation_chance`, `precipitation_amount`, `wind`. When supplied,
  `hourly_hours` selects the maximum returned points; omission preserves the
  existing maximum of 48.
- `alerts[]`: active alert headlines (mapped from `{ event, severity }` objects).

Upstream `vertical_data` arrives with measures as `{ value, unit }` objects
(`temperature`, `wind_speed`, `feels_like`, `precipitation_*`, daily high/low);
`humidity`, `uv_index`, `air_quality_index` are bare numbers;
`air_quality_description`, `sunrise`, `sunset` are strings.

> Landed via the KES weather thrift + NLQ + MSL/WWW decoder work
> (D107777759, D107957780, D107729843, D108000766); live-verified against
> P2371491675. (The earlier "`feels_like` / precipitation are future KES work"
> caveat no longer applies — they landed.)

---

## 2. Finance

### Request

```ts
export interface ToolFinanceOptions extends ToolSearchOptions {
  /** Selects which candle set maps into `instruments[].history`. Omit for quote only. */
  readonly interval?: "1m" | "30m" | "1d" | "1w" | "1mo";
  // `since`/`until` (inherited) bound the history window — see below.
}
```

### Result (`TOOL_FINANCE_RESULT_SCHEMA`)

Per `instruments[]` entry: `name`, `symbol`, `summary`, `price`, `currency`,
`change`, `change_percent`, `market_status`, `as_of`, `url`, and an opt-in
`history`.

**Supported (landed) fields:**

- `change` ← `entity.attributes.change`; `change_percent` ←
  `entity.attributes.percentChange`; `as_of` ←
  `entity.attributes.lastUpdatedAt` (epoch seconds → ISO).
- `history` (present only when an `interval` is requested):
  `{ interval, since, until, points: [{ date, open?, high?, low?, close, volume? }] }`,
  sorted oldest first, capped at 400. For intraday intervals (`1m` and `30m`)
  each point's `date` is a full ISO timestamp so same-day bars stay distinct;
  `1d`/`1w`/`1mo` use `YYYY-MM-DD`.
- **History window (`from`/`to`)** uses the inherited `since`/`until`, applied
  client-side to the candle set: `until` defaults to **today**; `since`
  defaults to an **interval-based look-back** ending at `until`
  (`1m` ≈ 1 day, `30m` ≈ 1 week, `1d` ≈ 3 months, `1w` ≈ 1 year,
  `1mo` ≈ 5 years). Bars outside `[from, to]` are dropped, and
  `history.since`/`history.until` echo the **effective** (resolved) window.
  Bounds are date-granular (`YYYY-MM-DD`).

`vd.candles` is a **top-level sibling of `entity`**, keyed
`{ daily, weekly, monthly, thirty_minute, one_minute }`; each bar is
`{ open, high, low, close, volume, timestamp }` (timestamp = epoch seconds). The
`interval` maps `1m→one_minute`, `30m→thirty_minute`, `1d→daily`,
`1w→weekly`, and `1mo→monthly`. The caller selects exactly one series;
`30m` is not derived from `1m`. For current-day/current-session charts choose
`1m`; choose `30m` for coarser multi-day intraday charts.

> `market_status` is not surfaced by the integration yet, so it maps to `null`.
> **Monthly candles are upstream-gated (empty today)**, so `history` for
> `interval: "1mo"` returns empty `points` until that lands. Landed via the
> finance NLQ + WWW decoder work (D107985840, D108000766); monthly tracked in
> D107789956.

---

## 3. Sports

Landed support is the **flat per-event list**, now carrying the normalized
scope (`sport`/`league`/`season`) and explicit `home`/`away` slots that the
upstream decoder surfaces at the top level of `vertical_data`:

```ts
export const TOOL_SPORTS_DATA_RESULT_SCHEMA = z.object({
  summary: z.string(), // display-only
  items: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),       // display-only (short excerpt body)
      url: nullableString.optional(),
      sport: nullableString.optional(),   // normalized token, e.g. "basketball"
      league: nullableString.optional(),  // "NBA" | "NFL" | "MLB" | … (omitted when ambiguous)
      season: z.object({                  // flat label OR structured object
        label: nullableString.optional(), // e.g. "2025-26" | "2026 REG"
        year: nullableNumber.optional(),  // e.g. 2025 (coerced from int or "2026")
        type: nullableString.optional(),  // "REG" | "PST"
        name: nullableString.optional(),  // "Regular Season" | "World Cup 2026"
        start_date: nullableString.optional(), // YYYY-MM-DD when provided
        end_date: nullableString.optional(),
      }).nullable().optional(),
      teams: z.array(z.string()).optional(), // order is not a home/away signal
      home: nullableString.optional(),    // home team name (when split upstream)
      away: nullableString.optional(),    // away team name (when split upstream)
      score: nullableString.optional(),      // "home-away", e.g. "90-94" (from home/away.score)
      status: nullableString.optional(),     // "closed" | "inprogress" | "scheduled" | …
      starts_at: nullableString.optional(),  // ISO 8601 UTC (legacy payloads only — see note)
      player_statistics: z.array(z.object({  // per-player, universal across sports
        player: z.string(),
        team: nullableString.optional(),
        position: nullableString.optional(),
        stats: z.record(z.string(), z.union([z.number(), z.string()])),
      })).optional(),                        // absent/empty when the feed omits it
      team_statistics: z.array(z.object({
        team: z.string(),
        qualifier: nullableString.optional(),
        stats: z.record(z.string(), z.union([z.number(), z.string()])),
      })).optional(),
    }),
  ),
  sources: z.array(toolSourceSchema),
});
```

Mapping notes (`worker/src/web_search.ts`):

- `sport`/`league`/`status` read the normalized top-level `vertical_data` fields
  (D108265855 sources them from the KES `results` blob). `sport` is lowercased
  for a stable token contract; `status` falls back to the raw
  `event.attributes.status` for older payloads.
- `season` is normalized from a flat string (`→ { label }`) or a structured
  object into one shape; `year` is coerced from an int **or** a numeric string,
  and `start_date`/`end_date` are carried when present. Absent → null.
- `home`/`away` read the explicit `vertical_data.home`/`away` names; the upstream
  emits `{name, score}`. `score` ("home-away") is derived from those per-side
  scores, falling back to the legacy `event.attributes.results` blob for older
  payloads. `teams` still comes from `competitors`.
- `starts_at` came from `event.attributes.startDateUTC`. The trimmed decoder
  (D108695383) no longer emits `event.attributes`, so it resolves only for legacy
  payloads and is otherwise null.
- `player_statistics`/`team_statistics` arrive as **text** the WWW decoder
  passes through, parsed into the flexible `stats` records here. Both use the
  same block layout (confirmed against live prod):
  ```
  Statistics - <label>:
    key: value
    key: value
  ```
  - **player** — the label nests the team + qualifier, e.g.
    `"Ariel Hukporti (New York Knicks (Away))"` → `player` + `team`.
  - **team** — the label is `"<Team> (<Qualifier>)"`, e.g.
    `"New York Knicks (Away)"` → `team` + `qualifier`.
  Values are numbers or quoted strings (e.g. `minutes: "1:52"`). The feed
  (SportRadar) does not always populate them, so the fields are omitted when
  empty. Confirmed against live NBA prod traffic; revisit if other sports diverge.

> **Payload trim (D108695383):** the decoder no longer emits the verbatim
> per-event `summary` (a ~24 KB blob) or the raw `event.attributes` map; the
> consumer reads only the small parsed fields. The item `summary` is retained but
> now sources the short `excerpt` body (the giant blob is gone); the redundant
> `player_statistics_text` raw fallback is dropped.

**Deferred (not in this change):** a sport-discriminated `games` union (per-sport
period/score models) and canonical (cross-sport normalized) stat keys — today
stat keys are kept verbatim from the feed. These remain a future follow-up.

---

## 4. Web search (`web_search`; web-only, no `vertical_data`)

`web_search(query)` is a general web search run in the action — the **exception** to
the "structure lives in `vertical_data`" principle: it sends **no vertical**
(empty `verticals`), the same plain search the agent's browser_search runs by
default, and MASE returns **no `vertical_data`** for plain web results. So
`buildWebSearchResult` maps `summary.top[]` web entries directly into a typed
`results[]` (it does **not** use `selectByVertical`, which keys off
`vertical_data`).

### Result (`TOOL_WEB_SEARCH_RESULT_SCHEMA`)

`results[]`, capped at 20 in upstream rank order, each:

- `title`, `url`, `source` (publisher/hostname), `snippet` (display-only).
- `published_at` — best-effort, derived primarily from the URL slug
  (`/YYYY/MM/DD/`); a hint, not authoritative.
- `last_updated_raw` — the raw freshness phrase ("3 hours ago") exposed
  verbatim, **never parsed** (unreliable in both directions — the stale-source
  trap).
- `favicon_url` — external source-domain icon URL the Space does **not** own;
  render only as a small source icon with an `onError` fallback, never as content
  imagery (use `media.generate_image` or self-host for real pictures). There is no
  `thumbnail` field — these tools return no real page images.
- `rank`, `is_index_page` (heuristic: section/tag/index page vs a real page).

The result's `vertical` field is `""` (web_search pins no vertical).

### Routing

`web_search` runs in the action — the same search the agent's browser search
runs — and is the path for any web query on any subject. Summarize results
with `ctx.inference.complete` when you need a narrative. For a stock
quote/price/history use `finance_ticker`; for scores/schedules/stats use
`sports_data`.
Don't spawn a Space task just to search — `spawnTask` runs this same search.
Reserve a task for what the agent loop adds *beyond* search: opening and reading
full pages (`browser.open`), browsing across several sites, multi-step research,
or other agent tools.
