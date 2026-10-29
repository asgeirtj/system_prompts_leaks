# Table usage metadata

Use this reference when a Data app or inline Sources receipt includes tables from Snowflake, Databricks, BigQuery, or Redshift. Enrich only the tables supporting the current answer with available usage metadata. Collection happens during evidence preparation through an authorized connector; the rendered artifact displays a reviewed snapshot and does not query the warehouse.

## Collect a bounded snapshot

1. Verify the provider and exact table identity from the connected source. Do not infer either from a table name alone. Reuse current-task metadata for the same table, scope, and window.
2. If the connector exposes table usage or supports authorized metadata SQL, look up those tables together where practical. Prefer a 30-day window, shortened to the history actually available; consult the provider's current metadata schema and retention before querying. Do not scan unrelated tables or parse arbitrary SQL text to guess lineage.
3. Count distinct query/statement IDs per table, deduplicating repeated columns, scans, lineage edges, and script/container records. Record distinct querying users only when supported by the same population and window. Service principals are not necessarily people. Use the latest observed query timestamp in accessible history for `lastQueriedAt`, preserving the same table and visibility scope. It may precede the counting window: zero queries in 30 days can accompany a last query 40 days ago. Explain any different history coverage in `usageNote`; do not imply access outside the observed history is known.
4. Record the actual `windowDays`, a timezone-qualified `usageAsOf` timestamp for the snapshot's observation cutoff, and a short `usageNote` explaining what was counted and any material coverage limits. Account for metadata lag when choosing the cutoff. Preserve the metadata lookup and scope in reviewed evidence without replacing the answer's analytical SQL.
5. Put each result on that table's `source.tables` object as `trust`. Omit unsupported values. Record zero only when a successful lookup establishes no observed usage in the stated scope/window; unavailable permissions, missing history, null identifiers, or failed lookups do not establish zero. Do not infer `verified` from popularity.

If usage metadata is unavailable, continue with the table's identity and any supported fields. Do not request broader roles, change warehouse configuration, retry permission failures, or delay the answer for this optional enrichment. Do not embed query logs, user identifiers, credentials, or warehouse connections in the artifact.

## Provider entrypoints and counting scope

| Provider | Metadata to inspect | Scope to preserve |
| --- | --- | --- |
| Snowflake | [`SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY`](https://docs.snowflake.com/en/sql-reference/account-usage/access_history) | Requires Enterprise Edition or higher. Choose direct objects or underlying base objects deliberately; deduplicate query IDs for each table and record which access population was counted. Missing access-history rows do not establish that a table was never queried. |
| Databricks | Reviewed [table insights](https://docs.databricks.com/aws/en/discover/table-insights) or [`system.access.table_lineage`](https://docs.databricks.com/aws/en/admin/system-tables/lineage) | Table insights popularity covers interactive reads. Lineage covers supported events; use distinct non-null statement IDs for query counts where available, not raw lineage event counts. Record omitted events and any workload or workspace limits. |
| BigQuery | [`INFORMATION_SCHEMA.JOBS`](https://docs.cloud.google.com/bigquery/docs/information-schema-jobs), using `referenced_tables` | Referenced tables are populated for non-cache-hit query jobs. Count distinct relevant query jobs per table, excluding script parent duplication; preserve the project/region coverage and cached-query omission. |
| Redshift | [`SYS_QUERY_DETAIL`](https://docs.aws.amazon.com/redshift/latest/dg/SYS_QUERY_DETAIL.html), joined to authorized query history/catalog metadata as needed | Filter to table read/scan activity, deduplicate query IDs across scans, and resolve exact table identities. Describe scan-based coverage, which is not all submitted query references. Visibility can be limited to the current user's activity; do not present that as warehouse-wide usage. |

These sources have different retention, ingestion delay, and coverage. Never extend `windowDays` beyond the retained and accessible history or compare providers as though their counts have identical definitions. Query frequency is usage context, not evidence that the table is correct or authoritative.

## Source payload

Illustrative shape; replace all values with the observed metadata for the actual table:

```json
{
  "tables": [
    {
      "name": "analytics.sales.orders",
      "trust": {
        "provider": "BigQuery",
        "queryCount": 128,
        "uniqueUsers": 9,
        "windowDays": 30,
        "lastQueriedAt": "2026-09-04T10:15:00Z",
        "usageAsOf": "2026-09-04T12:00:00Z",
        "usageNote": "Non-cached query jobs in the analytics project, US region; querying users include service accounts."
      }
    }
  ]
}
```

`queryCount` and `uniqueUsers` are nonnegative integer counts; `windowDays` is a positive integer. `lastQueriedAt` and `usageAsOf` are recorded timestamps with timezones. Keep `usageNote` concise and factual. Usage belongs to the source table, independently of the answer's reporting period and filters. Reuse the same reviewed object when the table supports multiple findings; do not manufacture separate counts for each chart or receipt card.
