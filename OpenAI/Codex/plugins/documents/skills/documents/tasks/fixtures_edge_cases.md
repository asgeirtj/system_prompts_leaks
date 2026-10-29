# Repro Fixtures for Edge Cases (Tracked Changes, Watermarks)

## Goal
Generate small deterministic `.docx` fixtures that exercise known tricky OOXML patterns so you can test helper scripts without hand-editing XML.

## Why this is useful
- Tracked changes and watermarks are frequently the source of "looks wrong" issues.
- Reproducing them manually is slow and error-prone.
- A standard fixture makes smoke tests and future debugging much faster.

## Generate fixtures
```bash
python scripts/make_fixtures.py --outdir fixtures
```
Produces:
- `fixtures/tracked_changes_fixture.docx`
- `fixtures/watermark_fixture.docx`

Or generate a single fixture:
```bash
python scripts/make_fixtures.py --outdir fixtures --only tracked
python scripts/make_fixtures.py --outdir fixtures --only watermark
```

## How to use fixtures
### Tracked changes
```bash
python scripts/accept_tracked_changes.py fixtures/tracked_changes_fixture.docx --mode report
python scripts/accept_tracked_changes.py fixtures/tracked_changes_fixture.docx --mode accept --out accepted.docx
python render_docx.py accepted.docx --output_dir out_accepted
```

### Watermarks
```bash
python scripts/watermark_audit_remove.py fixtures/watermark_fixture.docx --mode report
python scripts/watermark_audit_remove.py fixtures/watermark_fixture.docx --mode remove --contains DRAFT --out no_watermark.docx
python scripts/render_and_diff.py fixtures/watermark_fixture.docx no_watermark.docx --outdir diff_watermark
```

## Render → PNG review checklist
- Tracked-changes fixture: redlines appear in the original, and are gone in the accepted output
- Watermark fixture: `report` finds watermark-like VML; removal yields zero hits; headers remain intact
