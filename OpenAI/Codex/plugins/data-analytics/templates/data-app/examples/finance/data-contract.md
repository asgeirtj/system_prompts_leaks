# Stock watch: evidence contract

**Grain:** Daily × ticker OHLC and volume; scenario assumptions are separate from observations.

**Queries:** market_prices, analyst_scenarios, scenario_outlooks, company_news. Exact fields and deterministic fixtures are in `fixtures/generate.mjs`. `fixture()` returns an independent copy.

## Required evidence

- Valid ordered OHLC bars and volume
- Explicit timeframe coverage
- Separate scenario assumptions and synthetic disclosure

Calendar timeframes end at the latest loaded session; only fully covered presets are offered. The fixture models weekdays, not an exchange holiday calendar. Aggregated candles preserve first open, maximum high, minimum low, last close and summed volume; their hover identifies the full bucket interval. Analyst recommendations and long/short price-change assumptions are synthetic source rows, never inferred from OHLC. Scenarios exclude transaction costs, dividends and borrowing. The plotted basis is explicitly modeled, not account-level evidence.

## Exclusions

- Audited real market evidence from this synthetic fixture
- Treating scenario projections as observed returns

Price and scenario fixtures are synthetic, never executed warehouse queries or a live market feed. Company news is a separately sourced, dated editorial snapshot with primary-source links. Missing evidence is not zero. Rates require their eligible population; percentile aggregates require mergeable observations/distributions. Preserve independently scoped filters and the example's custom compositions. The catalog owns current approval status; semantic and rendered/interaction verification remain separately recorded.

Stock watch is a personal research tool with an eight-stock demo watchlist, not a company dashboard. Price-event annotations are derived once from the latest year of loaded prices and filtered to the visible range. News & events follows the selected company independently of the simulated price window. Each ticker requires at least four distinct source URLs and headlines, without duplicating an announcement to fill space. Publication dates and scheduled event dates remain explicit; real news is never positioned on synthetic prices or used to imply causation. Fundamentals absent from the fixture are omitted. Relative volume compares the latest session with the trailing 30-session mean. Period price changes compare first and last loaded closes in each calendar window; maximum drawdown uses closing-price peaks in the trailing year. None of these are total returns.
