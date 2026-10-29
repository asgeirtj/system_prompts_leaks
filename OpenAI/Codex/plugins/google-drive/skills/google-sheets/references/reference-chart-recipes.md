# Chart Recipes

When to read: when the chart itself is the task.

Use this reference before the first chart write.  
The point is to refresh chart request shapes and a few non-obvious API constraints before building or editing.

## Workflow

1. Ground the chart in the live sheet first: exact source tab, domain column, series columns, headers, and whether the data is contiguous.
2. Choose the simplest chart type that matches the table shape and user intent.
3. Draft one chart spec first, using a clean anchor position that will not collide with existing content.
4. If the chart needs revision, update the chart spec deliberately rather than trying to patch a tiny nested fragment from memory.
5. Treat chart content changes and chart position changes as separate operations.

## Output Conventions

- Name the source sheet and the exact domain and series ranges.
- State the chosen chart type and why it fits the data.
- For edits, state whether you are changing the chart spec, the chart position, or both.

## High-Value API Reminders

- Official chart samples: https://developers.google.com/workspace/sheets/api/samples/charts
- Official chart spec reference: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/charts
- Official request reference: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request

- Create charts with `addChart`.
- Edit chart content with `updateChartSpec`.
- Move or resize charts with `updateEmbeddedObjectPosition`.
- Delete charts with `deleteEmbeddedObject`.
- Google documents that `updateChartSpec` replaces the chart `spec`; it is not a tiny partial edit surface.
- Google also notes that the API does not expose full control over every chart setting, and some unsupported settings can reset to defaults when edited through the API.

## Chart Choice Heuristics

- Use a column or bar chart for discrete category comparisons.
- Use a line chart for trends over an ordered domain, especially time.
- Use a pie chart only for a small number of parts-of-whole values.
- Start with a basic chart unless the user explicitly wants a more specialized chart family.

## Styling Defaults

- Always set a meaningful title, and add a subtitle only when it clarifies units, timeframe, or source.
- Prefer one accent color plus muted supporting series instead of the default rainbow palette.
- Use `legendPosition` intentionally. If the series names are obvious or there is only one series, prefer a cleaner layout over a large legend.
- Use data labels only when the chart is sparse enough that labels improve readability instead of adding clutter.
- Avoid 3D styling by default, even when the chart type supports it.
- Give the chart enough size and whitespace to breathe. Clean placement and reasonable dimensions do a lot of the styling work.
- For line charts, use smoothing and point styling only when they improve readability rather than decoration.
- Keep axis titles concise and use them when the metric or unit is not obvious from context.

## Styling Syntax Reminders

These are the main styling knobs worth remembering:

- Chart-level text and defaults live on `ChartSpec`, including `title`, `subtitle`, `titleTextFormat`, `subtitleTextFormat`, `fontName`, `backgroundColorStyle`, and `maximized`.
- Basic chart styling lives mostly on `BasicChartSpec`, including `legendPosition`, `axis[].title`, `lineSmoothing`, and `threeDimensional`.
- Series-level styling lives on `BasicChartSeries`, including `dataLabel`, `colorStyle`, and `pointStyle`.
- Prefer `colorStyle` over deprecated `color` fields when both exist.
- Pie charts have their own styling surface, especially `legendPosition`, `threeDimensional`, and `pieHole`.

Example chart-level styling:

```json
{
  "title": "Weekly Active Users",
  "subtitle": "Last 12 weeks",
  "fontName": "Google Sans",
  "titleTextFormat": {
    "fontSize": 18,
    "bold": true
  },
  "subtitleTextFormat": {
    "fontSize": 11,
    "foregroundColorStyle": {
      "rgbColor": {
        "red": 0.4,
        "green": 0.4,
        "blue": 0.4
      }
    }
  },
  "backgroundColorStyle": {
    "rgbColor": {
      "red": 1,
      "green": 1,
      "blue": 1
    }
  }
}
```

Example basic-chart styling:

```json
{
  "basicChart": {
    "legendPosition": "BOTTOM_LEGEND",
    "lineSmoothing": true,
    "axis": [
      {
        "position": "BOTTOM_AXIS",
        "title": "Week"
      },
      {
        "position": "LEFT_AXIS",
        "title": "WAU"
      }
    ],
    "series": [
      {
        "colorStyle": {
          "rgbColor": {
            "red": 0.1,
            "green": 0.45,
            "blue": 0.9
          }
        },
        "dataLabel": {
          "type": "DATA"
        },
        "pointStyle": {
          "shape": "CIRCLE",
          "size": 5
        }
      }
    ]
  }
}
```

## Source Range Reminders

- Google documents that chart data comes from a `ChartSourceRange`, whose `sources` are `GridRange` objects.
- For a chart domain or series, exactly one dimension must have length 1.
- If using multiple non-adjacent ranges, Google requires them to stay aligned across domain and series.
- Google documents that if `headerCount` is not set, Sheets may guess the number of header rows.
- Existing chart IDs can be retrieved via `spreadsheets.get` with `fields=sheets(charts)`.

## Minimal Column Chart Shape

Use this when you have one category column and one or more numeric series.

```json
[
  {
    "addChart": {
      "chart": {
        "spec": {
          "title": "Monthly Sales",
          "basicChart": {
            "chartType": "COLUMN",
            "legendPosition": "BOTTOM_LEGEND",
            "axis": [
              {
                "position": "BOTTOM_AXIS",
                "title": "Model"
              },
              {
                "position": "LEFT_AXIS",
                "title": "Sales"
              }
            ],
            "domains": [
              {
                "domain": {
                  "sourceRange": {
                    "sources": [
                      {
                        "sheetId": 123456789,
                        "startRowIndex": 0,
                        "endRowIndex": 7,
                        "startColumnIndex": 0,
                        "endColumnIndex": 1
                      }
                    ]
                  }
                }
              }
            ],
            "series": [
              {
                "series": {
                  "sourceRange": {
                    "sources": [
                      {
                        "sheetId": 123456789,
                        "startRowIndex": 0,
                        "endRowIndex": 7,
                        "startColumnIndex": 1,
                        "endColumnIndex": 2
                      }
                    ]
                  }
                },
                "targetAxis": "LEFT_AXIS"
              }
            ],
            "headerCount": 1
          }
        },
        "position": {
          "overlayPosition": {
            "anchorCell": {
              "sheetId": 123456789,
              "rowIndex": 0,
              "columnIndex": 6
            },
            "offsetXPixels": 0,
            "offsetYPixels": 0,
            "widthPixels": 720,
            "heightPixels": 440
          }
        }
      }
    }
  }
]
```

## Minimal Line Chart Shape

Use this for trends over dates or other ordered domains.

```json
[
  {
    "addChart": {
      "chart": {
        "spec": {
          "title": "Weekly Active Users",
          "basicChart": {
            "chartType": "LINE",
            "legendPosition": "BOTTOM_LEGEND",
            "domains": [
              {
                "domain": {
                  "sourceRange": {
                    "sources": [
                      {
                        "sheetId": 123456789,
                        "startRowIndex": 0,
                        "endRowIndex": 13,
                        "startColumnIndex": 0,
                        "endColumnIndex": 1
                      }
                    ]
                  }
                }
              }
            ],
            "series": [
              {
                "series": {
                  "sourceRange": {
                    "sources": [
                      {
                        "sheetId": 123456789,
                        "startRowIndex": 0,
                        "endRowIndex": 13,
                        "startColumnIndex": 1,
                        "endColumnIndex": 2
                      }
                    ]
                  }
                },
                "targetAxis": "LEFT_AXIS"
              }
            ],
            "headerCount": 1
          }
        },
        "position": {
          "overlayPosition": {
            "anchorCell": {
              "sheetId": 123456789,
              "rowIndex": 0,
              "columnIndex": 5
            }
          }
        }
      }
    }
  }
]
```

## Minimal Pie Chart Shape

Use this only for a small categorical breakdown.

```json
[
  {
    "addChart": {
      "chart": {
        "spec": {
          "title": "Channel Mix",
          "pieChart": {
            "legendPosition": "RIGHT_LEGEND",
            "domain": {
              "sourceRange": {
                "sources": [
                  {
                    "sheetId": 123456789,
                    "startRowIndex": 0,
                    "endRowIndex": 6,
                    "startColumnIndex": 0,
                    "endColumnIndex": 1
                  }
                ]
              }
            },
            "series": {
              "sourceRange": {
                "sources": [
                  {
                    "sheetId": 123456789,
                    "startRowIndex": 0,
                    "endRowIndex": 6,
                    "startColumnIndex": 1,
                    "endColumnIndex": 2
                  }
                ]
              }
            },
            "threeDimensional": false
          }
        },
        "position": {
          "overlayPosition": {
            "anchorCell": {
              "sheetId": 123456789,
              "rowIndex": 0,
              "columnIndex": 4
            }
          }
        }
      }
    }
  }
]
```

## Update Chart Content

Use `updateChartSpec` when the chart type, data ranges, title, legend, or axis config should change.

```json
[
  {
    "updateChartSpec": {
      "chartId": 9001,
      "spec": {
        "title": "Weekly Active Users",
        "basicChart": {
          "chartType": "LINE",
          "legendPosition": "BOTTOM_LEGEND",
          "domains": [
            {
              "domain": {
                "sourceRange": {
                  "sources": [
                    {
                      "sheetId": 123456789,
                      "startRowIndex": 0,
                      "endRowIndex": 13,
                      "startColumnIndex": 0,
                      "endColumnIndex": 1
                    }
                  ]
                }
              }
            }
          ],
          "series": [
            {
              "series": {
                "sourceRange": {
                  "sources": [
                    {
                      "sheetId": 123456789,
                      "startRowIndex": 0,
                      "endRowIndex": 13,
                      "startColumnIndex": 1,
                      "endColumnIndex": 2
                    }
                  ]
                }
              },
              "targetAxis": "LEFT_AXIS"
            }
          ],
          "headerCount": 1
        }
      }
    }
  }
]
```

## Move Or Resize A Chart

Use `updateEmbeddedObjectPosition` separately from chart-spec edits.

```json
[
  {
    "updateEmbeddedObjectPosition": {
      "objectId": 9001,
            "newPosition": {
        "overlayPosition": {
          "anchorCell": {
            "rowIndex": 4,
            "columnIndex": 6
          },
          "offsetXPixels": 40,
          "widthPixels": 840,
          "heightPixels": 520
        }
      },
      "fields": "anchorCell(rowIndex,columnIndex),offsetXPixels,widthPixels,heightPixels"
    }
  }
]
```

## Common Failure Modes

- Picking a chart type before inspecting the table shape
- Wiring the wrong domain column or mismatching domain and series lengths
- Forgetting `headerCount` and then getting surprising inferred labels
- Treating `updateChartSpec` like a tiny patch instead of a full spec replacement
- Mixing chart-spec rewrites and layout moves into one confusing edit step

## Official References

- Chart samples: https://developers.google.com/workspace/sheets/api/samples/charts
- Charts reference: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/charts
- Requests reference: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request
- Batch update guide: https://developers.google.com/workspace/sheets/api/guides/batchupdate
