---
name: report-to-pdf
description: "Create a polished PDF from an existing Data dashboard or report."
---

# Report To PDF

Create a polished PDF from an existing Data dashboard or report.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.
- When converting a Data report or dashboard to PDF, follow the [Data App Contract](../../shared/data-app.md) for source preservation and export.

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Knowledge & Files: Source dashboards or reports, supporting artifacts, and requested styling references.

## Workflow guidance

Use this skill only when the user explicitly asks for a PDF. Author through the canonical `[@pdf](plugin://pdf@openai-primary-runtime)` plugin.

## Route

- For an existing dashboard or report, use its verified local `dist/index.html` and reviewed `src/data.json`, or its exact published HTTPS `.chatgpt.site` or `.chatgpt-team.site` URL with reviewed snapshot and presentation state. Follow [Reading a linked dashboard or report](../../shared/data-app.md#reading-a-linked-dashboard-or-report) to preserve the linked view and requested scope, including all reader-visible tabs and sections for an entire-dashboard export.
- Convert the existing app directly without creating an intermediate report or rebuilding it. If the user requested a new report and no source app exists yet, use `$build-report` once and reuse its verified HTML and evidence for every requested conversion.
- Do not print an app shell, create a PDF-specific app runtime, or author from an unstructured chat summary.

## Workflow

1. **Preflight capabilities.** Confirm that the canonical PDF skill is available before conversion. If it is unavailable, explain the blocker and retain any verified source HTML.
2. **Resolve the existing app.** For a local app, verify `dist/index.html` and use `src/data.json`. For a published app, verify the exact HTTPS `.chatgpt.site` or `.chatgpt-team.site` source URL, load the compiled app, and fetch its reviewed snapshot and saved presentation from the source origin's `/api/snapshot` and `/api/presentation` endpoints. Follow [Published Site authentication](../../shared/data-app.md#published-site-authentication) before declaring a `401` blocked. Reject unreadable or unverified sources. Preserve the reviewed evidence, requested dashboard/report scope, and current filters, selections, and presentation. For local apps, if browser access or page tools are unavailable or fail, continue from the verified compiled HTML and reviewed data. Apply supported link parameters and any supplied or saved presentation, otherwise use the authored presentation. Include all reader-visible tabs and sections for an entire-dashboard export. Briefly note after export that browser-only edits may not be included.
3. **Author with the PDF plugin.** Read and follow the canonical PDF skill completely. Preserve the title, narrative, charts, tables, metric definitions, caveats, freshness, source labels, and links. For chart figures from an open Data app, prefer `list_data_app_cards({})` followed by `get_data_app_card_image({ cardId, scale: 3 })` or `get_data_app_card_images({ cardIds, scale: 3 })`; follow [Card images for slides and documents](../../shared/data-app.md#card-images-for-slides-and-documents) to discover tools, verify scope, and decode local PNGs without printing base64. If capture is unavailable or unsuitable, use the chart's vector output or reviewed-data rendering. Keep surrounding report text selectable and avoid duplicating titles already captured in a card. Omit interactive controls and internal runtime or local-path metadata.
4. **Render, inspect, and repair.** Confirm page count and metadata, extract text when selectable text is expected, and inspect every page. Fix blank pages, clipping, overlap, broken tables, missing chart marks, unreadable glyphs, unresolved placeholders, and leaked app controls.
5. **Validate and deliver.** Confirm the PDF is non-empty, opens cleanly, and contains the required claims, definitions, caveats, freshness, and provenance. Return the verified PDF and, when useful, the source report HTML.

## Hard gates

- The canonical PDF plugin was selected and available before conversion.
- The existing app's verified local HTML and reviewed data, or its verified published app, snapshot, and presentation endpoints, were used directly as the conversion source.
- Every page passes full-page visual inspection.
- Required claims, definitions, caveats, freshness, and provenance survive conversion.
- App-only controls and internal conversion metadata are absent.

If a hard gate fails, stop and report the failure.
