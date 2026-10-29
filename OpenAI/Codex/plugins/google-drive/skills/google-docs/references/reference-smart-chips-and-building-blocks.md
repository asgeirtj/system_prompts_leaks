# Smart Chips, Dropdowns, and Building Blocks

Read when inserting or editing native chips or dropdowns, adapting building blocks, or creating calendar-backed meeting notes.

All write examples below are Google Docs API request objects passed in the connector's `batch_update_document.requests` array. Names such as `insertDate` and `insertDropdown` are request types, not standalone connector tools. Read back results with the connector's `get_document` tool.

## Smart chips

| Chip | Readback element | Insert request | Required source |
| --- | --- | --- | --- |
| Date | `dateElement` | `insertDate` | Timestamp and display format |
| Person | `person` | `insertPerson` | Verified email |
| Google resource | `richLink` | `insertRichLink` | Supported resource URL |

Use chips when requested or when matching an existing field. Find them in paragraph `elements`; text-search helpers may not match their displayed labels. Use returned ranges and properties for edits and verification, not the label alone.

Example requests (replace indexes, tab IDs, and source values before use):

```json
[
  {"insertDate": {
    "location": {"index": 100, "tabId": "TAB_ID"},
    "dateElementProperties": {
      "timestamp": "SOURCE_TIMESTAMP", "locale": "en",
      "dateFormat": "DATE_FORMAT_MONTH_DAY_YEAR_ABBREVIATED",
      "timeFormat": "TIME_FORMAT_DISABLED"
    }
  }},
  {"insertPerson": {
    "location": {"index": 101, "tabId": "TAB_ID"},
    "personProperties": {"email": "SOURCE_EMAIL"}
  }},
  {"insertRichLink": {
    "location": {"index": 102, "tabId": "TAB_ID"},
    "richLinkProperties": {"uri": "SOURCE_RESOURCE_URL"}
  }}
]
```

- These inserted chips occupy one UTF-16 code unit each. To replace a chip's payload, delete its returned element range and insert the replacement; use `updateTextStyle` only for formatting. This rule does not apply to dropdowns.
- For dates, omit output-only `displayText`; supply `timeZoneId` only when the chosen time format requires it.
- At most 10 `insertPerson` requests fit in one batch. For more people, split batches and refresh indexes and revision guards.
- For new Google file chips, [canonicalize_google_workspace_url.mjs](../scripts/canonicalize_google_workspace_url.mjs) separates the file URL from a tab/range/slide deep link. Keep any useful deep link separately rather than losing that destination.
- Verify element types and the intended timestamp, email, or URI through `get_document`. HTML export does not prove native chip preservation.

## Dropdowns

Pass dropdown request objects to the connector's `batch_update_document` tool. Example `requests` for creating a definition and inserting it into an empty paragraph:

```json
[
  {"createDropdownDefinition": {
    "tabId": "TAB_ID",
    "dropdownDefinition": {
      "dropdownDefinitionId": "kix.statusdemo",
      "dropdownDefinitionProperties": {"title": "Status", "options": [
        {"optionId": "dropdownItem.draft", "displayValue": "Draft"},
        {"optionId": "dropdownItem.done", "displayValue": "Done"}
      ]}
    }
  }},
  {"insertDropdown": {
    "location": {"index": 1, "tabId": "TAB_ID"},
    "dropdownDefinitionId": "kix.statusdemo",
    "selectedOptionId": "dropdownItem.draft"
  }}
]
```

Replace the tab and insertion index from readback; use a definition ID unique within that tab. Retain the returned instance `dropdownId`. To change its selection, use a fresh revision guard and:

```json
{"updateDropdownProperties": {
  "tabId": "TAB_ID", "dropdownId": "DROPDOWN_ID_FROM_READBACK",
  "dropdownProperties": {"selectedOptionId": "dropdownItem.done"},
  "fields": "selectedOptionId"
}}
```

To change options, use `updateDropdownDefinitionProperties` with `dropdownDefinitionId`, `tabId`, the complete `dropdownDefinitionProperties.options` list, and `fields: "options"`. This replaces the list for every dropdown sharing the definition: preserve unrelated option IDs and colors. Removing a selected option requires `selectedOptionIdReplacements` mapping it to a retained option. See the [API schema](https://docs.googleapis.com/$discovery/rest?version=v1) for field details.

Verify `elements[].dropdown.dropdownProperties.selectedOptionId` and `displayValue` after writes. Read the tab's `dropdownDefinitions` to verify its option IDs, labels, and colors. If the connected version omits this field, treat the option list as unavailable. Do not reconstruct an existing option list from its selected label or overwrite options you cannot inspect. A definition created in this task can use its retained creation reply and subsequent updates, with revision guards. The optional read helper cannot recover omitted fields.

## Building blocks

A collection of labels and table cells does not prove a native building block was created. Copy an existing native exemplar when the result requires controls or containers that available tools cannot create. Edit supported ranges around those controls and state any unsupported requested change.

A private-use Unicode glyph may indicate an opaque control, but does not prove dropdown identity, options, or selection. Use native dropdown properties when present; preserve controls whose semantics cannot be inspected.

## Calendar-backed meeting notes

For a complete request sequence, including empty items and declined-attendee styling, see [Meeting notes](reference-meeting-notes-direct.md).

1. Resolve the requested event using connected Calendar tools and the user's timezone. Use its actual title, time, link, attendees, and response statuses; do not reconstruct those fields from memory.
2. Read the destination and any peer meeting-notes block. Compose supported date/person/resource chips, headings, text, and lists to match that structure. This does not prove parity with every UI-only building-block feature.
3. Style only the meeting heading as a heading; keep attendees, labels, and note/action paragraphs in the peer body style. Apply bullets or supported checkboxes only to item paragraphs, not labels or separators.
4. When matching an empty UI Meeting notes block, retain an empty note bullet, a blank separator, an empty action-item checkbox, and a trailing blank paragraph. Otherwise use the requested content rather than adding placeholders.
5. If matching declined-attendee strikethrough, scope it to the attendee chip/name and clear it from adjacent spaces and newlines so it does not leak.
6. Read back the chips, list metadata, styles, and tab placement. Refresh attendee insertion indexes before a second batch; check for duplicates and unintended empty list items.
