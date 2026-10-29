# Deck Scope Verification

Use this guidance whenever the task reads, edits, migrates, translates, or structurally updates more than one slide.

## 1. Build the authoritative slide checklist first

- Use `get_presentation` or `get_presentation_text` to capture every slide in scope in order before the first write.
- Record the ordered slide numbers, slide object IDs, and a short title or role for each slide.
- Do not infer coverage from object ID numbering. Google Slides IDs can skip values, and a missing numeric pattern does not mean the slide is absent.
- If a deck read is truncated or incomplete, re-read narrower spans until the full in-scope checklist is explicit.

## 2. Edit in bounded spans

- Work in one explicit slide or one small contiguous span at a time.
- State the first and last slide in the current span before writing.
- Do not start the next span until the current span has been verified.

## 3. Verify every span before advancing

- Re-read the edited slide or edited span immediately after the write.
- Confirm the intended change landed on the last slide in the span, not just the first one. This catches skipped middle or trailing slides.
- If a slide in scope is still unchanged, untranslated, unmigrated, or structurally stale, fix it before moving on.
- When the task depends on visual structure, pair the post-write read with thumbnails.

## 4. Reconcile the deck before calling it done

- Compare the final deck state against the checklist from step 1.
- Confirm that no slide in scope was skipped, duplicated, or left in a mixed old/new state.
- For transformed-copy workflows, confirm the source deck stayed unchanged and the copied deck contains the full requested coverage.
