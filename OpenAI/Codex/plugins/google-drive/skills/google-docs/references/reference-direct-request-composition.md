# Connector Examples

These examples use the connected Google Drive tools. Read [SKILL.md](../SKILL.md) for routing, preservation, and verification; see the separate [smart-chip](reference-smart-chips-and-building-blocks.md) and [meeting-notes](reference-meeting-notes-direct.md) examples when needed.

## Compose a batch

The connector's `requests` array accepts Google Docs API objects such as `insertText` and `updateTableCellStyle`. Use the fields for that Docs request type; consult Google's API documentation for details. These objects are connector payloads, not separate HTTP calls.

- Pass `requests` and `write_control` as structured values, not stringified JSON. Each request must contain exactly one request-type key.
- Resolve the destination `documentId`, `tabId`, and relevant ranges from connector results. Each snippet stands alone; combine compatible requests when using several examples together.
- Requests execute in order. Track UTF-16 index shifts and calculate formatting ranges from inserted text when reliable. JavaScript string `.length` counts UTF-16 code units.
- When using `write_control`, set either `requiredRevisionId` or `targetRevisionId`, not both. Use `requiredRevisionId` to reject concurrent changes and reuse returned revisions for subsequent batches. Read again when required positions or IDs cannot be reliably derived, or to resolve a conflict or uncertain outcome; verify the completed edits once.

In the examples, `insertionIndex` is the intended text insertion point, `tableStartIndex` identifies the table, and `itemStartIndex`/`itemEndIndex` bound the intended list paragraphs. Resolve these values for the actual document rather than copying offsets from another example.

## Read a document

```js
const document = await tools.mcp__codex_apps__google_drive_get_document({
  document_id: documentId
});
```

## Insert text

```js
await tools.mcp__codex_apps__google_drive_batch_update_document({
  document_id: documentId,
  write_control: { requiredRevisionId: revisionId },
  requests: [
    { insertText: { location: { index: insertionIndex, tabId: tabId }, text: "The pilot starts next week.\n" } }
  ]
});
```

## Insert a section

Insert a section at the resolved paragraph position. For a new document, use Heading 1 for main sections and Heading 2 for subsections. For an existing document, match its hierarchy and peer headings.

```js
const headingText = "Launch risks\n";
const bodyText = "Risk one.\nRisk two.\n";
const headingStyle = "HEADING_1"; // Main section level; use HEADING_2 for subsections and match peers when editing.
await tools.mcp__codex_apps__google_drive_batch_update_document({
  "document_id": documentId,
  "write_control": {
    "requiredRevisionId": revisionId
  },
  "requests": [
    {
      "insertText": {
        "location": {
          "index": insertionIndex,
          "tabId": tabId
        },
        "text": headingText + bodyText
      }
    },
    {
      "updateParagraphStyle": {
        "range": {
          "startIndex": insertionIndex,
          "endIndex": insertionIndex + headingText.length,
          "tabId": tabId
        },
        "paragraphStyle": {
          "namedStyleType": headingStyle
        },
        "fields": "namedStyleType"
      }
    }
  ]
});
```

After inserting text, calculate style ranges from the inserted text length, not from guessed rendered layout. If the surrounding heading has explicit local text styling, add `updateTextStyle` for the heading range after matching the paragraph style.

## Insert bullets

Insert plain lines first, then create bullets over the range that contains only the intended bullet paragraphs:

```js
const bulletText = "First bullet\nSecond bullet\n";
await tools.mcp__codex_apps__google_drive_batch_update_document({
  "document_id": documentId,
  "write_control": {
    "requiredRevisionId": revisionId
  },
  "requests": [
    {
      "insertText": {
        "location": {
          "index": insertionIndex,
          "tabId": tabId
        },
        "text": bulletText
      }
    },
    {
      "createParagraphBullets": {
        "range": {
          "startIndex": insertionIndex,
          "endIndex": insertionIndex + bulletText.length,
          "tabId": tabId
        },
        "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"
      }
    }
  ]
});
```

If the peer template uses a specific existing list style, read the peer bullet paragraphs and match their visible list behavior as closely as the connector supports.

## Number an existing list

For existing item paragraphs, use `NUMBERED_DECIMAL_ALPHA_ROMAN` to produce decimal numbering at the first nesting level. Use the intended item-paragraph boundaries from readback.

```js
await tools.mcp__codex_apps__google_drive_batch_update_document({
  "document_id": documentId,
  "write_control": {
    "requiredRevisionId": revisionId
  },
  "requests": [
    {
      "createParagraphBullets": {
        "range": {
          "startIndex": itemStartIndex,
          "endIndex": itemEndIndex,
          "tabId": tabId
        },
        "bulletPreset": "NUMBERED_DECIMAL_ALPHA_ROMAN"
      }
    }
  ]
});
```

## Tables

1. Resolve table, row, column, and cell ranges from `get_document` or an available table-read tool. Do not infer empty-cell positions from paragraph order.
2. After `insertTable`, read the table before filling it. Insert into each cell's returned paragraph location.
3. Fill independent cells in descending index order, or re-read between batches, so earlier inserts do not invalidate later positions.
4. After population or row/column changes, read again if final cell ranges cannot be reliably derived. Extend existing tables in place and match peer cells when adding rows or columns.

Formatting details:

- Style or link actual cell-text ranges; a guessed span across a row can include structural boundaries.
- For lists inside cells, exclude labels and the terminal empty paragraph from the bullet range.
- New cell text can inherit heading or bold formatting; match the intended peer cell style.

### Column width example

Set a column's width with `tableColumnProperties.width`, not `columnWidth`. The first column and 80-point width are example choices; use the requested or peer layout. Column indexes are zero-based.

```js
await tools.mcp__codex_apps__google_drive_batch_update_document({
  "document_id": documentId,
  "write_control": {
    "requiredRevisionId": revisionId
  },
  "requests": [
    {
      "updateTableColumnProperties": {
        "tableStartLocation": {
          "index": tableStartIndex,
          "tabId": tabId
        },
        "columnIndices": [
          0
        ],
        "tableColumnProperties": {
          "widthType": "FIXED_WIDTH",
          "width": {
            "magnitude": 80,
            "unit": "PT"
          }
        },
        "fields": "widthType,width"
      }
    }
  ]
});
```

### Cell background example

This example shades the first two cells of the first row light blue. The cell selection and color are example choices. Row and column indexes are zero-based; spans specify how many rows and columns to include.

```js
await tools.mcp__codex_apps__google_drive_batch_update_document({
  "document_id": documentId,
  "write_control": {
    "requiredRevisionId": revisionId
  },
  "requests": [
    {
      "updateTableCellStyle": {
        "tableRange": {
          "tableCellLocation": {
            "tableStartLocation": {
              "index": tableStartIndex,
              "tabId": tabId
            },
            "rowIndex": 0,
            "columnIndex": 0
          },
          "rowSpan": 1,
          "columnSpan": 2
        },
        "tableCellStyle": {
          "backgroundColor": {
            "color": {
              "rgbColor": {
                "red": 0.91,
                "green": 0.94,
                "blue": 0.97
              }
            }
          }
        },
        "fields": "backgroundColor"
      }
    }
  ]
});
```

## Hyperlinks

Link the complete readable label, including when it is a heading or inside a table cell. Use Google's default link appearance (blue and underlined); preserve a different appearance only when explicitly requested. Keep the paragraph's heading role unchanged.

For an existing label, resolve `labelStartIndex` and the exact `labelText` from readback, and use a verified `sourceUrl`:

```js
await tools.mcp__codex_apps__google_drive_batch_update_document({
  document_id: documentId,
  write_control: { requiredRevisionId: revisionId },
  requests: [{
    updateTextStyle: {
      range: {
        tabId,
        startIndex: labelStartIndex,
        endIndex: labelStartIndex + labelText.length
      },
      textStyle: { link: { url: sourceUrl } },
      fields: "link"
    }
  }]
});
```

For newly inserted text, combine insertion and linking in one batch when the label range can be calculated reliably. In final readback, verify the full label has the intended URL and adjacent text is not linked.

## Inline images

Resolve `imageInsertionIndex` in a paragraph reserved for the image. Set `imagePath` to an absolute local image path. The connector uploads the file passed through `image_uris` and resolves the matching `uri` placeholder:

```js
await tools.mcp__codex_apps__google_drive_batch_update_document({
  document_id: documentId,
  write_control: { requiredRevisionId: revisionId },
  image_uris: [imagePath],
  requests: [{
    insertInlineImage: {
      location: { index: imageInsertionIndex, tabId },
      uri: imagePath
    }
  }]
});
```

For a public image URL, pass it directly as `uri` and omit `image_uris`; do not pass base64 data URLs. Set `objectSize` when the requested or peer layout calls for a particular size, preserving the image's aspect ratio.

When a caption is useful, place it directly below the image. Match existing caption formatting; otherwise use italic text 2 pt smaller than body text, with a minimum of 9 pt. Keep the image and caption on the same page. Number figures when needed for cross-references.

Verify the inserted `inlineObjectElement` and its referenced entry in the tab's `inlineObjects`, along with the surrounding text and caption. Export and inspect the relevant PDF pages to check size, clipping, and placement; an insertion success or placeholder caption alone does not prove the image rendered correctly.

## Multi-tab PDF exports

```js
const pdf = await tools.mcp__codex_apps__google_drive_export_file({
  id: documentId,
  mime_type: "application/pdf"
});
```

Multi-tab exports can add a title-only separator page before each tab. Compare the PDF with native document readback before treating these as document-layout errors. The current export tool has no option to suppress them.

If the requested PDF should omit these separators, remove only pages verified to be export-added tab titles from a separate PDF copy, then verify all content pages remain unchanged. Do not delete native tabs or headings to compensate for export behavior.
