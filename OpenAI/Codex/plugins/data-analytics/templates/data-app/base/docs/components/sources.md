# Sources

Source-backed components use the existing reviewed query's `source` metadata. The shared source inspector shows each table in Overview's Sources list; retain its source actions rather than authoring another metadata panel.

For tables from Snowflake, Databricks, BigQuery, or Redshift, follow the installed Data plugin's `shared/table-usage.md` during evidence preparation. Make a targeted best-effort metadata lookup through the existing authorized connector and record the result in `src/data.json`. The app displays this snapshot without fetching warehouse metadata.

Entries in `source.tables` may be table-name strings or objects with `name`, optional safe `href`, and optional asset-level `trust`:

| Field in `trust` | Recorded value |
| --- | --- |
| `provider` | Verified warehouse/provider name. |
| `queryCount` | Distinct queries observed for this table in the recorded scope/window. |
| `uniqueUsers` | Distinct querying identities in that same scope/window, when available. |
| `windowDays` | Positive integer days of accessible observed history. |
| `lastQueriedAt` | Latest observed query timestamp in accessible history for the same table/visibility scope; may precede the counting window. |
| `usageAsOf` | Timestamp anchoring the usage snapshot's observation window. |
| `usageNote` | Concise counting method and material limits, such as cached-query omissions or current-user-only visibility. |

Supply timezone-qualified timestamps and nonnegative integer counts. The source row displays available usage details and a separate scope note. Missing values remain absent; zero requires an observed zero. Keep the usage window distinct from the analytical reporting period. None of these fields establishes data freshness or verification. Existing `uniqueViewers`, `viewCount`, `favoriteCount`, `verified`, and `editedAt` metadata remains supported for sources where those values were observed.
