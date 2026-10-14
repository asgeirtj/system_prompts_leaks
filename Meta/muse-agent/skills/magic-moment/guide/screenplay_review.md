# Review the exact build

Run `/opt/hatch/skills/magic-moment/mm validate <screenplay.json>`. Read the normalized screenplay at `~/workspace/.output/<name>/resolved_screenplay.json`. Copy the returned fingerprint into `~/workspace/.output/<name>/script_review.json` only after reviewing that version.

Write this review shape, with one claim row for every content beat's zero-based index. Omit typing and reaction beats from the claim rows.

```json
{
  "fingerprint": "value returned by validate",
  "verdict": "pass",
  "claims": [{
    "beat": 0,
    "source_span": "exact supporting source words and time",
    "actor": "who acted",
    "action": "what happened",
    "tense": "past, ongoing, planned, or offered",
    "evidence": "source message or artifact path and relevant state",
    "depiction": "what appears; quote, paraphrase, capture, or illustration"
  }],
  "source_coverage": "Explain where each important source claim appears, including claims deliberately left in narration."
}
```

Check speaker attribution, source support, temporal meaning, component choice, and timing for every bubble and visual. Reject invented instructions, approvals, successful syncs, statistics, and gallery sample copy. Check the complete story in source order. Fix the screenplay, revalidate, and review the new fingerprint after any change. The CLI enforces fingerprint freshness and review structure; it does not independently judge your claims.

Run `/opt/hatch/skills/magic-moment/mm render <screenplay.json>`. Run `/opt/hatch/skills/magic-moment/mm inspect <screenplay.json>` and read every generated contact sheet. Inspect the exact returned video at phone scale. Check the opening, each visual's initial and final states, every transition, taps, the creator's concluding words, and the appended close. Check for tiny text, clipping, duplicate messages, overlapping labels, replayed actions, and coverage of the creator's face. Listen for intelligible source audio. Do not add background music unless the active request explicitly requires it.

Review visual quality separately from factual correctness. At 360px video width,
check that the focal content reads without pausing. Reject repeated heading-and-row
cards when the story has a calendar, route, chart, or artifact to show. Reject
an artifact reduced to an unreadable thumbnail, audit labels in the artwork,
or old cards obscuring the next scene. Compare every card's rendered states
with the scene plan and revise weak compositions before passing the layout
review. Check the full heading and every status label against the card edges.
For each artifact reveal, identify the result the viewer can read at phone
scale. Reject the reveal when only its title is legible.
Record what you saw, including the visual focus and readability, in each
checked-state observation. A valid hash proves identity, not quality.

Write `~/workspace/.output/<name>/layout_review.json` with `output_sha256` copied from the render manifest, `verdict: "pass"`, and `checked_states` containing one `{ "time": 1.1, "observation": "what you inspected" }` row for every time returned by `mm inspect`. Record failures and repair them before passing. Render again after any repair; do not post-process the checked MP4.

Run `/opt/hatch/skills/magic-moment/mm publish <screenplay.json>` after both reviews pass. Deliver only its `DONE` path. Publication checks the source, assets, screenplay, review, and final output digests. Keep the run manifest as the provenance record.
