# Report bindings

Read for `surface: "report"`. The build-report skill owns analytical/editorial choices; this topic owns report-specific public bindings and geometry. Import shared components from `src/data-app-public.jsx`.

## Frame and snapshot

Reports default to a 748px usable editorial column with 36px desktop / 20px mobile gutters (820px desktop frame). For evidence needing another width, set `--data-app-layout-intent: authored-report` and `--data-app-content-width` on `.report-page`; ordinary report composition needs no extra authorization. Align headings, prose, and evidence; inherit shared typography, spacing, and chart cards rather than restyling each section. Default title/body/section sizes are 48px (36px mobile), 16px with 1.6 line height, and 20px. Prose stays unboxed; chart content starts at 300px and may grow for categories, labels, or legends.

Set `report.asOf` to a known `YYYY-MM-DD` evidence cutoff; otherwise the shell uses Prepared with `generatedAt`. Do not infer a common cutoff from unrelated sources or change it after cosmetic edits. Reports have no data-only refresh: revise evidence and narrative together.

## Narrative and evidence

Use `RichNarrative` with a stable `id` and Markdown `value` for every editable prose block. Legacy marked paragraphs do not mount the formatting toolbar. Keep labels, chart titles, values, and sources on their existing editing paths, with reviewed collections marked `data-reviewed-rows`; viewers do not receive owner editing.

`ReportSection` is an optional source-backed wrapper. Set `showHeading={false}` if the Markdown contains its heading. For multiple sources, give a primary `queryId`, ordered `queryIds`, and exact `sourceRowsByQuery`; never implicitly join raw rows. Quantitative components may use derived `displayRows` while retaining each query's evidence independently.

`useDataApp` supplies reviewed rows, visibility, presentation, and actions. `reviewedPeriodRows(queryId, { period })` accepts history/latest/previous; `reviewedAggregatePeriodRows` selects comparisons without breakdown rows. Set a query's `reportingField` when its time grain is ambiguous. Dashboard filters do not apply unless explicitly visible for the report, for example in `report.visibleFilterIds`, with authored controls.

For DataTable precision and semantic `deltaTone`, see [tables](tables.md) and [comparison formatting](comparison-formatting.md).

### Optional link previews

`RichNarrative.sourcePreviews` is keyed by exact HTTPS URL. Entries use `title`, `summary`, optional `source`/`date`, and `approvedForReport: true`. Summarize a source actually read, and approve only text suitable for every report recipient: previews are embedded, not access-controlled fetches. Omit restricted excerpts and never put material qualifications only in a preview. Other links stay ordinary links. Shared tooltips provide keyboard/touch access and bundled provider icons; do not fetch favicons or treat icons as trust badges.

For shared chart annotations, see [charts](charts.md#supported-chart-annotations).

## Optional authored helpers

`src/content/shared/ReportTaskLink.jsx` uses `id`, `narrativeId`, `text`, `queryId`, optional `queryIds`/`period`, and the visible label as children. Keep the corresponding RichNarrative immediately before it in one ReportSection/div, grouping recommendations with `.report-recommendations`. Exact IDs preserve the current saved recommendation. Shared `reportFollowUpHref` handles permissions/routing; the link appears only when launch is available in View mode.

The default opens a chat-only investigation. For a reviewable draft, use `intent="prepare"` and a plain-text `deliverable` of at most 160 characters. An unsent task has not started; opening it authorizes neither edits, implementation, messages, nor external writes. Prepare requests cannot directly submit.

`src/content/shared/ReportDisclosure.jsx` preserves disclosure state in Edit mode and includes details in print. Put it inside a visible source-aware component, not around the component whose source actions/permalink must stay reachable. Keep material limitations visible and avoid responsive charts in closed containers.

Compose in `src/content/report/`; the complete starter and optional finished references linked from the installed build-report skill are examples, not required story outlines. Reference galleries stay in the plugin rather than the prepared app.
