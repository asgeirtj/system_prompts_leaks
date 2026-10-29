# Meeting Notes Request Example

Pass the complete argument object below to the connector's `mcp__codex_apps__google_drive_batch_update_document` tool. The Google Docs API operations inside `requests` are payloads for that tool, not separate API calls. The later formatting snippets are individual objects to place in its `requests` array.

Read for a concrete calendar-backed meeting-notes request sequence. See [Native features](reference-smart-chips-and-building-blocks.md) for event lookup, chip handling, and preservation guidance.

Before adapting the example:

- Read the selected Calendar event for its title, timestamp/timezone, event URL, attendee emails, and response statuses.
- Read the target tab, revision, insertion range, and peer styles. Use the optional file-backed helper only when it helps inspect a large response.
- Calculate UTF-16 indexes for the actual text and chip sequence. Newlines and inserted date/person/resource chips each occupy one code unit.
- Style only the heading as a heading. Scope bullet and checkbox formatting to item paragraphs; keep labels and separators in the peer body style.

## Skeleton Pattern

This example demonstrates index movement for one attendee, an empty `Notes` bullet, one blank line before `Action items`, an empty action-item checkbox, and one final blank paragraph. Replace every placeholder with connector readback or Calendar event values before calling the connector. Recalculate indexes exactly from the chosen insertion index and actual attendee/note/action counts.

```json
{
  "document_id": "DOC_ID",
  "write_control": {
    "requiredRevisionId": "REVISION_ID_FROM_FRESH_READ"
  },
  "requests": [
    {
      "insertDate": {
        "location": {
          "index": 100,
          "tabId": "t.0"
        },
        "dateElementProperties": {
          "timestamp": "EVENT_START_RFC3339",
          "locale": "en",
          "dateFormat": "DATE_FORMAT_MONTH_DAY_YEAR_ABBREVIATED",
          "timeFormat": "TIME_FORMAT_DISABLED"
        }
      }
    },
    {
      "insertText": {
        "location": {
          "index": 101,
          "tabId": "t.0"
        },
        "text": " | "
      }
    },
    {
      "insertRichLink": {
        "location": {
          "index": 104,
          "tabId": "t.0"
        },
        "richLinkProperties": {
          "uri": "EVENT_HTML_LINK"
        }
      }
    },
    {
      "insertText": {
        "location": {
          "index": 105,
          "tabId": "t.0"
        },
        "text": "\nAttendees: "
      }
    },
    {
      "insertPerson": {
        "location": {
          "index": 117,
          "tabId": "t.0"
        },
        "personProperties": {
          "email": "attendee@example.com"
        }
      }
    },
    {
      "insertText": {
        "location": {
          "index": 118,
          "tabId": "t.0"
        },
        "text": "\n\nNotes\n\n\nAction items\n\n\n"
      }
    },
    {
      "updateParagraphStyle": {
        "range": {
          "startIndex": 100,
          "endIndex": 106,
          "tabId": "t.0"
        },
        "paragraphStyle": {
          "namedStyleType": "HEADING_2"
        },
        "fields": "namedStyleType"
      }
    },
    {
      "updateParagraphStyle": {
        "range": {
          "startIndex": 106,
          "endIndex": 143,
          "tabId": "t.0"
        },
        "paragraphStyle": {
          "namedStyleType": "NORMAL_TEXT"
        },
        "fields": "namedStyleType"
      }
    },
    {
      "createParagraphBullets": {
        "range": {
          "startIndex": 126,
          "endIndex": 127,
          "tabId": "t.0"
        },
        "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"
      }
    },
    {
      "createParagraphBullets": {
        "range": {
          "startIndex": 141,
          "endIndex": 142,
          "tabId": "t.0"
        },
        "bulletPreset": "BULLET_CHECKBOX"
      }
    }
  ]
}
```

If there are more than 10 attendees with email chips, split the attendees across sequential `mcp__codex_apps__google_drive_batch_update_document` connector calls because `insertPerson` is limited per batch. For revision-guarded writes, use the returned revision for the next batch; read again only if required indexes or IDs cannot be reliably derived, or to resolve a conflict or uncertain outcome.

For declined attendees, insert the person chip or name, then apply:

```json
{
  "updateTextStyle": {
    "range": {
      "startIndex": 117,
      "endIndex": 118,
      "tabId": "t.0"
    },
    "textStyle": {
      "strikethrough": true
    },
    "fields": "strikethrough"
  }
}
```

For separator/newline ranges that touch declined attendee chips, explicitly clear leaked strikethrough:

```json
{
  "updateTextStyle": {
    "range": {
      "startIndex": 118,
      "endIndex": 119,
      "tabId": "t.0"
    },
    "textStyle": {
      "strikethrough": false
    },
    "fields": "strikethrough"
  }
}
```

## Verify

Read back native chip types/properties, paragraph styles, list metadata, and target tab. Check for duplicate inserts and unintended empty list items. If a write times out or its result is incomplete, reconcile through readback before retrying.
