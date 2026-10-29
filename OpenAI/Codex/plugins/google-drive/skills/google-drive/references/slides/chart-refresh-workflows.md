# Chart Refresh And Replacement Workflows

Use this guidance when the user asks to refresh, update, replace, or repair a chart in Google Slides.

## 1. Read chart slides structurally, not text-only

- Do not rely on `get_presentation_text` alone for chart workflows. Text-only deck reads can drop chart-only page elements and hide the object you need to act on.
- Start with `get_presentation` for deck-wide context and `get_slide` for the target slide before any write.
- Use `get_slide_thumbnail` when the request depends on whether the visual chart itself changed.

## 2. Distinguish linked charts from static content

- Look for a linked chart element first. The target slide may expose a chart-bearing page element with linked chart metadata such as a source workbook reference, chart ID, or source spreadsheet ID.
- If the slide has a linked chart, treat it as refreshable in place.
- If the slide only has an image, generic shape, or other static content and no linked chart metadata, do not pretend it can be refreshed in place. That is a chart replacement workflow, not a linked-chart refresh.

## 3. Reuse existing source charts before creating new ones

- If the user provided or implied a connected source, such as a Google Sheet, inspect that source for existing charts before creating any temporary charts.
- When the source already contains named or obviously matching charts, reuse those existing charts as the source graphics.
- Only create a new source chart when no suitable source chart exists or when the user explicitly asked for a new chart design.
- Do not turn a Slides static-content replacement task into a source-chart authoring task unless the missing source chart forces that extra step.

## 4. For linked charts, stay in Slides and use raw batch updates

- When the slide already contains a linked chart, use raw `batch_update` with the chart refresh request on the live chart object ID.
- Refresh the chart object first, then make any nearby title or annotation edits as separate text changes if needed.
- After the write, verify that the chart-bearing slide changed, not just the text around it.
- If the refresh also changes surrounding visible layout or styling, follow [visual-change-loop](./visual-change-loop.md) instead of stopping at a single verification.

## 5. For shape placeholders, replace the placeholder with a chart graphic

- If the slide contains an obvious chart placeholder shape, replace that placeholder with the chart graphic rather than leaving the placeholder underneath or beside the new chart.
- Preserve the intended chart-area footprint so the surrounding layout stays intact.
- If the user does not require persistent linking, prefer a non-linked chart insertion path when it keeps the visible result simpler.
- If the slide also contains helper text that only exists to label the placeholder area, remove or rewrite that text as part of the replacement so the slide no longer looks like a fixture.

## 6. For static chart content, replace the image in place

- If the chart area is static chart content, preserve the approximate position and size of the existing image.
- Replace the old chart image rather than stacking a second chart on top of it.
- If the image is clearly stale or explicitly marked as replaceable static content, do not report success until the old graphic is gone and the new one occupies the intended area.
- If the replacement leaves visible residue, spacing drift, or chart-area cleanup work, switch to [visual-change-loop](./visual-change-loop.md) and do not stop before the third verified review.

## 7. If no source chart exists, be explicit about the extra step

- If the slide lacks a linked chart and the connected source lacks a suitable source chart, say that the source chart must be created or identified before the Slides replacement can be completed.
- If you create a new source chart because none existed, say so explicitly instead of describing the result as if the existing chart was merely refreshed.

## 8. Verification standard

- A chart refresh or replacement is only complete when the chart slide was re-read after the write and the visual result was checked with a thumbnail when the image itself matters.
- Do not claim success just because the write call succeeded or because adjacent chart labels changed.
- When thumbnail responses include an `image_asset_pointer`, image content part, or other rendered image artifact, inspect that returned image directly.
- If the thumbnail response only exposes a thumbnail URL or `contentUrl`, curl the rendered image to a local PNG, for example `curl -L "$contentUrl" -o /tmp/slides-thumb-<slide-id>.png`, and inspect that local image before claiming the chart visual was verified.
- After chart or layout edits, fetch a fresh thumbnail and re-curl any URL-backed thumbnail to a new local PNG before final success.
- When the refresh or replacement changed visible layout, placeholder cleanup, or nearby styling, follow [visual-change-loop](./visual-change-loop.md) and keep the review loop going through the third fresh visual pass.
- Verify both of these things before declaring success:
  - the chart graphic itself now matches the intended source chart
  - obsolete placeholder or instructional text is no longer visible unless the user asked to keep it
