---
name: artifact_presentation
metadata: { "includeInPrompt": false }
description: Build or revise a slide deck (pptx by default; pdf or html on request). Use whenever a build task's artifact kind is presentation, or the user asks for a deck, slides, or a presentation. Covers per-slide HTML authoring, the StylePlan theme system, font embedding, deck assembly, render gates, and the PPTX export.
---

# Slide-deck artifacts

A deck is authored as one standalone HTML file per slide plus a shared
`deck.css` and a `deck.json` manifest, assembled and gated deterministically,
then exported. The per-slide sources under `.src/slides/` are the editable
truth for every future revision; slide ids never renumber.

Three rules hold on every slide, before any reference is read. **Sentence case
everywhere** (including stat labels). Never use `text-transform:uppercase` or
`letter-spacing` on any text. No slide furniture: pills, subtitles, summary
lines, eyebrows, kickers, badges, chips, tags, and captions do not belong
anywhere on a slide. The cover is the deck title over its hero image and
nothing else.

| Task | Read first |
|---|---|
| New deck | `/opt/hatch/skills/artifacts/presentation/references/workflow.md` plus the references it names |
| Edit an existing deck | `/opt/hatch/skills/artifacts/presentation/references/editing.md`, plus the references it names |
| Design and layout | `/opt/hatch/skills/artifacts/presentation/references/visual.md` |
| Theme generation or application | `/opt/hatch/skills/artifacts/presentation/references/theme.md` |
| Slides that plot data | `/opt/hatch/skills/artifacts/references/charts.md` (shared) |
| Slides that show a place or a map | `/opt/hatch/skills/artifacts/references/maps.md` (shared) |

## Scripts

| Script | What it does |
|---|---|
| `/opt/hatch/bin/hatch-slide-style` | Compiles the StylePlan; a deck is never built on an invented substitute plan |
| `/opt/hatch/skills/artifacts/scripts/embed_deck_fonts.mjs` | Subsets and embeds webfonts into deck.css; a font that will not download warns, never blocks |
| `/opt/hatch/skills/artifacts/scripts/assemble_deck.mjs` | Validates slide files against the manifest, enforces CSS scoping, emits the combined document; non-zero exit is unshippable |
| `/opt/hatch/skills/artifacts/scripts/render_audit.mjs` (shared) | Renders slides and runs the deck gates; `workflow.md` names the flags |
| `/opt/hatch/skills/artifacts/scripts/build_pptx.py` | Exports the validated PNGs as the PPTX and carries each slide's title into its speaker notes as best-effort accessibility text; the daemon-side rebuild path preserves those notes after UI edits |

## Verification

Follow `/opt/hatch/skills/artifacts/testing/SKILL.md`: run the gates, then read every
slide PNG fresh before returning a link.
