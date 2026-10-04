---
description: Resolving user-provided visual direction into the style plan for slide decks.
---

# Presentation Visual Guidance

User-provided visual direction in `verbatim_request` or the parent conversation
is authoritative. Before styling, take one pass against generic defaults:
make each visual choice because it fits this deliverable, not because it
is the easiest template (one accent everywhere, a single font doing all
the work, no hierarchy between title and body, emoji as icons).

- Resolve the StylePlan before authoring a new deck. First resolve the slide
  count using the rule in `workflow.md`, then derive one stable
  kebab-case id per slide from the planned content (grounded in the verbatim
  request and the requesting conversation's supplied content), with `cover` first and `closing` last. Write strict JSON to
  `project_dir/.src/style-plan-input.json` containing `title`, `brief`, and
  `slide_ids`. The brief is the verbatim request plus any explicit visual
  direction from the parent conversation.
- Run `/opt/hatch/bin/hatch-slide-style plan --input` with the exact input file
  path you wrote as its argument. Never put the title or brief in shell
  arguments. The command's JSON output is the deck's `style_plan`; write it
  unchanged to `project_dir/.src/style_plan.json`. A StylePlan is required: if
  resolution fails, report the build failure instead of inventing a substitute
  plan.
- On a deck edit, keep the existing `.src/style_plan.json` unless the user asks
  to re-theme it. For a re-theme, run the same command with the existing deck
  title, the requested direction, and the existing slide ids, then replace the
  saved plan with the command's JSON output.
- The resolved `style_plan` is the sole styling authority. Take every color,
  font, layout, and lockup from it; do not restyle the deck directly from
  the request text, the parent conversation, or a saved document theme.
- Prefer image-led layouts, strong hierarchy, and concise text. At most ~5 bullets or 3-4
  cards per slide; avoid paragraph-heavy slides.
- Avoid generic corporate slides, stock-looking compositions, decorative filler, and repeated
  title-plus-bullets layouts.
- No slide furniture: pills, subtitles, summary lines, eyebrows, kickers, badges, chips, tags,
  and captions do not belong anywhere on a slide. Do not put a small label or section eyebrow
  (e.g. a `3 — The Problem` line) above a heading; put the point in the heading itself.
- The cover is the deck title over its hero image and nothing else: no subtitle, tagline, date
  or source line, kicker, pill, stat box, or button. Save the details for the content slides.
- Never shrink text to fit. Body, bullet, and card text stay 16-18px and never drop below
  14px; only short stat labels may sit at 11-13px. If content does not fit at these sizes,
  cut it or split it across slides rather than shrinking the text or tightening spacing.
- Use one theme across the whole deck: take every color from the StylePlan `--slide-*`
  variables (`--slide-bg`, `--slide-fg`, `--slide-primary`, `--slide-accent`, `--slide-muted`)
  rather than raw hex, and give every slide the same background. The deck should read as one
  designed system, not a mix of themes.
- One idea per slide, and cut rather than cram. Put the slide's point in the heading as a
  claim, highlight at most 3 metrics, and keep a content slide to about 5 bullets or 3-4
  cards. Give each fact one home (do not repeat a chart's numbers as stat cards too; `/opt/hatch/skills/artifacts/references/charts.md` owns charts). When the
  source has more than fits at full size, leave most of it off the slides; a slide with less
  content reads better and lets the text breathe.
- Do not place unstyled text directly over photos. Use scrims, panels, masks, or split layouts
  for contrast.
- Keep text readable at presentation distance. Use clear hierarchy: title, body, stat number,
  stat label. There is no section-label tier; a section's point goes in its heading.
- **Sentence case everywhere** (including stat labels). Never use `text-transform:uppercase`
  or `letter-spacing` on any text.
- Prevent overlap and clipping. Prefer reducing content over shrinking fonts.
- Every deck carries real imagery, a cover hero and images on content slides, and never an
  empty image box or "visual goes here" placeholder, unless the brief is intentionally
  image-free (step 6).
- Keep images relevant to the adjacent claim. Omit an image rather than using a mismatched one.
- Do not invent facts, dates, metrics, citations, or source names; ground every claim in
  the verbatim request and the requesting conversation's user-stated facts.
- Read `authoring.md`, `design-system.md`, and
  `image-directive.md` for the detailed visual contract. The slide
  workflow and editing references own planning, validation, and export
  mechanics.

If a delivered deck has a reported visual problem, re-render the affected pages
to PNG and read them before changing the source. Do not guess at layout or
styling defects without visual evidence.
