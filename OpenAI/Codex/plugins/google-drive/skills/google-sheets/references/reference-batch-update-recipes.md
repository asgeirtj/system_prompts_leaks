# Batch Update Recipes

Use these patterns as copy-and-fill templates. The goal is request-shape recall, not a second copy of the Sheets docs.

## Rules

- Each request object must set exactly one request type key.
- Use exact Google field names and structured objects instead of stringified JSON.
- Prefer higher-level spreadsheet authoring or adapter-generated connector arguments when available. Hand-author raw `batch_update_spreadsheet` requests only after reading this reference and grounding metadata.
- Use exact Sheets request keys and fields from the Sheets API. Do not borrow Docs, Slides, or values API fields for `spreadsheets.batchUpdate`.
- Prefer `sheetId` from `get_spreadsheet_metadata` when building `GridRange`, `GridCoordinate`, or `DimensionRange`.
- For `GridRange`, row and column indexes are zero-based, start-inclusive, and end-exclusive.
- For update-style requests, set a precise `fields` mask. Do not include the root object name in the mask.
- For destructive or index-sensitive requests, re-read target metadata and ranges immediately before building the request. Do not reuse stale row, column, sheet, or table indexes after prior edits.
- Before sending a hand-authored batch, preflight that every request object has one key, no request is an empty object or JSON string, no request uses A1 notation inside `GridRange`, and no `rows` entry writes beyond the declared range.
- Ensure each `updateCells.range` height equals `rows.length` and its width equals every `values.length`.
- Keep batches logically clustered. Group edits that should succeed or fail together, but do not mix unrelated table rewrites, formatting passes, and structure changes into one mega-batch.

## Coordinate Templates

Use these shapes repeatedly:

```json
{
  "sheetId": 123456789,
  "startRowIndex": 0,
  "endRowIndex": 10,
  "startColumnIndex": 0,
  "endColumnIndex": 4
}
```

`GridRange` for rectangular regions.

```json
{
  "sheetId": 123456789,
  "rowIndex": 0,
  "columnIndex": 0
}
```

`GridCoordinate` for a single starting cell.

```json
{
  "sheetId": 123456789,
  "dimension": "ROWS",
  "startIndex": 1,
  "endIndex": 4
}
```

`DimensionRange` for whole rows or columns.

## High-Signal Request Families

Reach for these first:

- Content and formulas: `updateCells`, `appendCells`, `repeatCell`, `copyPaste`, `autoFill`
- Row and column layout: `insertDimension`, `deleteDimension`, `moveDimension`, `updateDimensionProperties`, `autoResizeDimensions`
- Range operations: `sortRange`, `setBasicFilter`, `clearBasicFilter`, `deleteDuplicates`, `trimWhitespace`
- Native tables: `addTable`, `updateTable`, `deleteTable`
- Validation and protection: `setDataValidation`, `addProtectedRange`, `updateProtectedRange`, `deleteProtectedRange`
- Sheet structure: `addSheet`, `deleteSheet`, `duplicateSheet`, `updateSheetProperties`

For the full request catalog, use the official reference linked below.

## Native Dropdown Chips In New Sheets

For table-like ranges with explicit or reference-derived finite option/list/dropdown columns, use a native table. Table `DROPDOWN` columns render selected values as chips; `setDataValidation` alone does not.

Reference-following: add or rebuild tables only when needed. Preserve copied native tables with colored dropdown chips; repair their range with `updateTable` instead of recreating them. The table rule exposes no option-color field, so `addTable` cannot reconstruct source colors.

Rules:
- Use `DATE` for dates, `DROPDOWN` plus `ONE_OF_LIST` for finite choices, and `TEXT` otherwise. Do not send unsupported `NUMBER`.
- Seed valid selected dropdown values unless the user asks for a blank template.
- Before final answer, verify `tables[].range` covers every used row/column, column names/types/options, selected values, source option colors when present, and chip visuals. Grid `rowCount`/`columnCount` is not table coverage; end indexes are exclusive (`A:O` needs `endColumnIndex: 15`). If metadata omits `tables[]`, use the probe below.

Range-only table repair shape:

```json
{
  "updateTable": {
    "table": {
      "tableId": "abc123",
      "range": {
        "sheetId": 123456789,
        "startRowIndex": 0,
        "endRowIndex": 26,
        "startColumnIndex": 0,
        "endColumnIndex": 15
      }
    },
    "fields": "range"
  }
}
```

Minimal `addTable` dropdown shape. For table-column `dataValidationRule`, send `condition` only; omit `strict`, `showCustomUi`, `displayStyle`, and `dropdownStyle`.

`"columnType"` options are: `DOUBLE`, `CURRENCY`, `PERCENT`, `DATE`, `TIME`, `DATE_TIME`, `TEXT`, `BOOLEAN`, `DROPDOWN`, `FILES_CHIP`, `PEOPLE_CHIP`, `FINANCE_CHIP`, `PLACE_CHIP`, and `RATINGS_CHIP`.

```json
{
  "addTable": {
    "table": {
      "name": "EntriesTable",
      "range": {
        "sheetId": 123456789,
        "startRowIndex": 0,
        "endRowIndex": 2,
        "startColumnIndex": 0,
        "endColumnIndex": 2
      },
      "columnProperties": [
        {
          "columnIndex": 0,
          "columnName": "Name",
          "columnType": "TEXT"
        },
        {
          "columnIndex": 1,
          "columnName": "Rating",
          "columnType": "DROPDOWN",
          "dataValidationRule": {
            "condition": {
              "type": "ONE_OF_LIST",
              "values": [
                { "userEnteredValue": "good" },
                { "userEnteredValue": "bad" }
              ]
            }
          }
        }
      ]
    }
  }
}
```

Do not convert existing non-table sheets solely to change dropdown display style unless the user asked for a table.

Expose table metadata without changing cells:

```json
{
  "requests": [
    {
      "findReplace": {
        "find": "__no_match_table_probe__",
        "replacement": "__no_match_table_probe__",
        "allSheets": true
      }
    }
  ],
  "include_spreadsheet_in_response": true,
  "response_include_grid_data": false,
  "response_ranges": ["Tracker!A1:O37"]
}
```

Use the final used rectangle for `response_ranges`. A copied table only passes when `tables[].range` covers every used row and column; otherwise repair the table before finishing.

## Write A Fixed Block Of Values Or Formulas

Use `updateCells` for a known rectangle. This is the most common raw write recipe.

```json
[
  {
    "updateCells": {
      "range": {
        "sheetId": 123456789,
        "startRowIndex": 0,
        "endRowIndex": 2,
        "startColumnIndex": 0,
        "endColumnIndex": 2
      },
      "rows": [
        {
          "values": [
            { "userEnteredValue": { "stringValue": "Owner" } },
            { "userEnteredValue": { "stringValue": "Status" } }
          ]
        },
        {
          "values": [
            { "userEnteredValue": { "stringValue": "Alex" } },
            { "userEnteredValue": { "formulaValue": "=IF(B1=\"\",\"Missing\",\"Ready\")" } }
          ]
        }
      ],
      "fields": "userEnteredValue"
    }
  }
]
```

## Format A Header Row And Freeze It

Use `repeatCell` for shared formatting across a range, then `updateSheetProperties` for sheet-level behavior.

```json
[
  {
    "repeatCell": {
      "range": {
        "sheetId": 123456789,
        "startRowIndex": 0,
        "endRowIndex": 1
      },
      "cell": {
        "userEnteredFormat": {
          "backgroundColorStyle": {
            "rgbColor": {
              "red": 0.12,
              "green": 0.47,
              "blue": 0.71
            }
          },
          "textFormat": {
            "bold": true,
            "foregroundColorStyle": {
              "rgbColor": {
                "red": 1,
                "green": 1,
                "blue": 1
              }
            }
          }
        }
      },
      "fields": "userEnteredFormat(backgroundColorStyle,textFormat)"
    }
  },
  {
    "updateSheetProperties": {
      "properties": {
        "sheetId": 123456789,
        "gridProperties": {
          "frozenRowCount": 1
        }
      },
      "fields": "gridProperties.frozenRowCount"
    }
  }
]
```

## Create A Native Sheets Table

When the user asks to create or add a table, or upgrade a range into a table, use a native Sheets table unless they explicitly request a plain range. After spreadsheet import, first use `./reference-import-spreadsheet-to-native-sheets.md` to confirm table intent and the exact populated range. `addTable` adds table metadata to existing cells; it does not write their values. Omit `tableId` so Sheets assigns it.

```json
[
  {
    "addTable": {
      "table": {
        "name": "ProjectTracker",
        "range": {
          "sheetId": 123456789,
          "startRowIndex": 0,
          "endRowIndex": 20,
          "startColumnIndex": 0,
          "endColumnIndex": 5
        }
      }
    }
  }
]
```

Before adding an imported table, if metadata omits banding, expose `updatedSpreadsheet.sheets[].bandedRanges` with `include_spreadsheet_in_response: true` and `{"updateSpreadsheetProperties":{"properties":{"title":"Existing title"},"fields":"title"}}`. Never guess the banding ID. Replace only an exact-range match, atomically:

```json
[
  { "deleteBanding": { "bandedRangeId": 123456789 } },
  {
    "addTable": {
      "table": {
        "name": "ProjectTracker",
        "range": {
          "sheetId": 123456789,
          "startRowIndex": 0,
          "endRowIndex": 20,
          "startColumnIndex": 0,
          "endColumnIndex": 5
        }
      }
    }
  }
]
```

## Append New Rows

Use `appendCells` only when there is no existing row structure to preserve. Otherwise, use the native-row recipe.

```json
[
  {
    "appendCells": {
      "sheetId": 123456789,
      "rows": [
        {
          "values": [
            { "userEnteredValue": { "stringValue": "2026-03-13" } },
            { "userEnteredValue": { "numberValue": 42 } },
            { "userEnteredValue": { "stringValue": "complete" } }
          ]
        }
      ],
      "fields": "userEnteredValue"
    }
  }
]
```

## Native-Row Recipe: Add Rows To A Populated Table

Read `./reference-native-cell-structure.md` first. This one-row fixture copies a complete exemplar, preserves D:F (shared Drive chip, relative formula, shared read-only link), and overwrites row-specific A:C in the same call. Repeat it with equal-height ranges and `rows` arrays for each verified chunk.

```json
[
  {
    "copyPaste": {
      "source": {
        "sheetId": 123456789,
        "startRowIndex": 1,
        "endRowIndex": 2,
        "startColumnIndex": 0,
        "endColumnIndex": 6
      },
      "destination": {
        "sheetId": 123456789,
        "startRowIndex": 20,
        "endRowIndex": 21,
        "startColumnIndex": 0,
        "endColumnIndex": 6
      },
      "pasteType": "PASTE_NORMAL",
      "pasteOrientation": "NORMAL"
    }
  },
  {
    "updateCells": {
      "range": {
        "sheetId": 123456789,
        "startRowIndex": 20,
        "endRowIndex": 21,
        "startColumnIndex": 0,
        "endColumnIndex": 3
      },
      "rows": [
        {
          "values": [
            {
              "userEnteredValue": { "stringValue": "@" },
              "chipRuns": [
                {
                  "startIndex": 0,
                  "chip": {
                    "personProperties": {
                      "email": "alex@example.com",
                      "displayFormat": "DEFAULT"
                    }
                  }
                }
              ]
            },
            { "userEnteredValue": { "stringValue": "First task" } },
            { "userEnteredValue": { "stringValue": "todo" } }
          ]
        }
      ],
      "fields": "userEnteredValue,chipRuns"
    }
  }
]
```

When full copy is unsafe, use separate `PASTE_FORMAT`, `PASTE_DATA_VALIDATION`, and `PASTE_FORMULA` requests plus explicit writes.

## Smart-Chip Shapes

A chip occupies an `@` placeholder. Write `userEnteredValue` and `chipRuns` together with `fields: "userEnteredValue,chipRuns"`; writing `userEnteredValue` alone erases `chipRuns`. `startIndex` is the placeholder's zero-based UTF-16 index.

The native-row fixture contains the person shape. Resolve its email through the native-cell reference. For a writable Drive-file chip, use this `CellData`; omit output-only `mimeType`:

```json
{
  "userEnteredValue": { "stringValue": "@" },
  "chipRuns": [
    {
      "startIndex": 0,
      "chip": {
        "richLinkProperties": {
          "uri": "https://drive.google.com/file/d/FILE_ID/view"
        }
      }
    }
  ]
}
```

For non-Drive rich links, follow the shared-resource rules in the native-cell reference.

## Resize a Column

After inserting a populated column or editing a value such that it's clipped/overflowed:

1. Record populated-column widths and any fixed-width requirement.
2. In the native render, check the header, longest formatted values, and controls. If clipped/overflow and column size not intentionally fixed (e.g. to match template or existing workbook pattern), resize only that column with `autoResizeDimensions` or a justified `pixelSize`.
3. Recheck widths, affected cells, and the render. Only the target width may change; preserve formulas, validation, chips, formats, frozen rows, and neighboring structure. Without native evidence, report fit unverified.

Indexes are zero-based and the end is exclusive. For inserted column B, send exactly this one-column resize:

```json
[
  {
    "autoResizeDimensions": {
      "dimensions": {
        "sheetId": 123456789,
        "dimension": "COLUMNS",
        "startIndex": 1,
        "endIndex": 2
      }
    }
  }
]
```

## Resize Or Delete Rows Or Columns

Use `updateDimensionProperties` for size changes and `deleteDimension` for destructive row or column removal.

```json
[
  {
    "updateDimensionProperties": {
      "range": {
        "sheetId": 123456789,
        "dimension": "COLUMNS",
        "startIndex": 0,
        "endIndex": 3
      },
      "properties": {
        "pixelSize": 180
      },
      "fields": "pixelSize"
    }
  },
  {
    "deleteDimension": {
      "range": {
        "sheetId": 123456789,
        "dimension": "ROWS",
        "startIndex": 10,
        "endIndex": 12
      }
    }
  }
]
```

## Sort A Table And Turn On A Basic Filter

Use this for spreadsheet workflows that should behave like a table view instead of manual row shuffling.

```json
[
  {
    "sortRange": {
      "range": {
        "sheetId": 123456789,
        "startRowIndex": 1,
        "startColumnIndex": 0,
        "endColumnIndex": 5
      },
      "sortSpecs": [
        {
          "dimensionIndex": 2,
          "sortOrder": "ASCENDING"
        }
      ]
    }
  },
  {
    "setBasicFilter": {
      "filter": {
        "range": {
          "sheetId": 123456789,
          "startRowIndex": 0,
          "startColumnIndex": 0,
          "endColumnIndex": 5
        }
      }
    }
  }
]
```

## Add Dropdown Validation

Use `setDataValidation` for restricted inputs, such as status dropdowns, when chip display is not required. If chip display is required, use Native Dropdown Chips In New Sheets. For people/file rich-link chips, use Smart-Chip Shapes.  
For requested checkboxes, on/off controls, or user-editable two-state boolean fields, use native checkboxes with `rule.condition.type` set to `BOOLEAN`.

```json
[
  {
    "setDataValidation": {
      "range": {
        "sheetId": 123456789,
        "startRowIndex": 1,
        "endRowIndex": 200,
        "startColumnIndex": 3,
        "endColumnIndex": 4
      },
      "rule": {
        "condition": {
          "type": "ONE_OF_LIST",
          "values": [
            { "userEnteredValue": "todo" },
            { "userEnteredValue": "in_progress" },
            { "userEnteredValue": "done" }
          ]
        },
        "strict": true,
        "showCustomUi": true
      }
    }
  }
]
```

## Common Failure Modes

- Confusing `spreadsheets.batchUpdate` with `spreadsheets.values.batchUpdate`
- Stringifying the `requests` array instead of sending structured objects
- Using A1 notation where the request expects `GridRange` or `DimensionRange`
- Forgetting that indexes are zero-based and end-exclusive
- Omitting `fields` on update-style requests
- Filling validated cells from plain range reads and missing the dropdown's actual allowed values
- Mixing too many unrelated operations into one batch
- Reusing stale indexes after an insert, delete, sort, or prior batch changed the sheet
- Sending Docs or Slides request names, values API payloads, or invented field names to `spreadsheets.batchUpdate`
- Declaring a small `GridRange` but sending more `rows` or `values` than the range can hold
- Using `setDataValidation` for requested chip dropdowns in new Sheets; use table `DROPDOWN` columns instead

## Official References

- Request catalog: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request
- Sheets API samples index: https://developers.google.com/workspace/sheets/api/samples
- Basic writing samples: https://developers.google.com/workspace/sheets/api/samples/writing
- Basic formatting samples: https://developers.google.com/workspace/sheets/api/samples/formatting
- Row and column samples: https://developers.google.com/workspace/sheets/api/samples/rowcolumn
- Sheet operations samples: https://developers.google.com/workspace/sheets/api/samples/sheet
- Native tables guide: https://developers.google.com/workspace/sheets/api/guides/tables
