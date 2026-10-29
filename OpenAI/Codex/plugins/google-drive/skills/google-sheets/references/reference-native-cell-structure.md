# Native Cell And Table Consistency

Read before extending populated rows or columns.

## Reference-Follow Creation

Use the source path that preserves native structure.

- Native Google Sheets reference: make a copy of the workbook or specified sheet(s) in a new spreadsheet first.
- Spreadsheet file reference (`.xlsx`, `.xls`, `.ods`, `.csv`): follow the local spreadsheet/template-follow workflow, import as native Google Sheets, then inspect the imported destination and repair native structures the file format or import did not carry over.

For a native Google Sheets copy only:

1. Run Inspect And Classify below on the source before edits.
2. Verify the destination spreadsheet is new and distinct from the source.
3. Trim the copied sheet to the requested rows and columns with `deleteDimension`, preserving source order and the header row.
4. If further edits are required, use `batch_update`; do not use values-only rewrites for structured cells.
5. After trimming, pasting, or row/column edits, run the table metadata probe in `./reference-batch-update-recipes.md`. A copied table passes only when `tables[].range` covers the final used rectangle; remember end indexes are exclusive (`A:O` needs `endColumnIndex: 15`). If it misses any used row or column, update its range before final answer. Recreate it only when no copied table exists or the copied table cannot be updated.  
   Preserve reference data validation and its visual presentation, including chip and checkbox styles.
6. Verify the written range with the same metadata fields and `./reference-visual-quality.md`.

The copy-trim/table-range steps above do not apply to imported spreadsheet-file references. For those, run Inspect And Classify on the imported destination, then repair missing native structures with the import and batch-update references.

## Inspect And Classify

From grounded reads, compare the nearest complete exemplar with a peer and the populated edge. Read `userEnteredValue,effectiveValue,formattedValue,dataValidation,chipRuns,userEnteredFormat`. Classify each field as literal, formula, validation-backed, writable chip, read-only rich link, or formatting-only. Expand conflicting samples; ask or stop if the schema remains ambiguous.

Classify chips by meaning, not type or row subject. Treat a resource as shared when the user says so, its header and label identify a shared resource, or peers use the same URI. With only one exemplar, do not copy it if its label, URI, or surrounding cells tie it to that row. Preserve and verify shared URIs; overwrite writable row-specific chips. Never copy row-specific or unclassified read-only chips: copy safe structure, then leave blank, ask, or block. A valid URI does not prove correct semantics.

## Write

Use the native-row recipe in `./reference-batch-update-recipes.md`. Preserve copied values intentionally or overwrite them in the same complete-row call. Insert dimensions first, apply the policy to columns, and never use a values-only `appendCells`.

## Connector People-Chip Limit

The Google Drive connector accepts at most 10 people-chip rows per `batch_update_spreadsheet` call; this is not a Sheets API limit. For destination rows `[start, end)`:

1. Generate ordered, disjoint chunks `[i, min(i + 10, end))`; send one complete-row call per chunk.
2. Read back that range with `userEnteredValue,formattedValue,dataValidation,chipRuns,userEnteredFormat`; advance only on a full match.
3. Never replay verified ranges or advance after a mismatch. If its fix is deterministic and scoped, repair the unverified chunk once and re-read it; otherwise stop and report its range and state.

## Deterministic People Resolution

People chips require an email. Use authoritative sources provided or implied by the request. Accept an email only for one unique exact identity. When order is unspecified, preserve source order or sort by normalized display name and stable ID.

Never synthesize an address. If an email is missing or ambiguous, write the source name as plain text and report the affected cells.

## Verify Native Metadata

Read every written range with `get_spreadsheet_cells` and apply `./reference-visual-quality.md`. Verify:

- validation matches and values satisfy it
- people chips contain `chipRuns[].chip.personProperties.email`
- writable and shared chips contain planned `chipRuns[].chip.richLinkProperties.uri`
- no unclassified read-only URI was copied
- formulas remain in `userEnteredValue.formulaValue` with adjusted references
- formatting matches and no stale row-specific input remains
- source dropdown option colors remain visible when the reference uses colored dropdown chips

Repair when safe or report the blocker. Display text alone does not prove native consistency.
