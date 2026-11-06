---
description: Resolving user-provided visual direction into the style plan for slide decks.
---

# Presentation visual planning

- Follow the visual direction in `verbatim_request` and the parent conversation. The StylePlan you resolve below turns it into the deck's design.

- Make each visual choice because it fits this deck, not because it is the easiest template. Watch for the generic defaults: one accent color everywhere, a single font doing all the work, no difference between title and body, and emoji used as icons.

## Resolve the StylePlan

- Resolve the StylePlan before authoring a new deck. First resolve the slide count with the rule in the [build workflow](workflow.md).

- Derive one stable kebab-case ID per slide from the planned content, grounded in the verbatim request and the content supplied in the requesting conversation. Put `cover` first and `closing` last.

- Write strict JSON to `project_dir/.src/style-plan-input.json` with `title`, `brief` and `slide_ids`. The brief is the verbatim request plus any explicit visual direction from the parent conversation.

- Run `/opt/hatch/bin/hatch-slide-style plan --input <file>` with the exact path of that file. Never put the title or brief in shell arguments.

- Write the command's JSON output unchanged to `project_dir/.src/style_plan.json`. It is the deck's `style_plan`.

- A StylePlan is required. If resolution fails, report the build failure instead of inventing a substitute plan.

- On a deck edit, keep the existing `.src/style_plan.json` unless the user asks for a re-theme. For a re-theme, run the same command with the existing deck title, the requested direction and the existing slide IDs, then replace the saved plan with the new output.

- The resolved `style_plan` is the sole styling authority. Take every color, font, layout and lockup from it. Never restyle the deck directly from the request text, the parent conversation or a saved document theme.

## Keep the deck one designed system

- Prefer image-led layouts, strong hierarchy and concise text over paragraph-heavy slides.

- Avoid generic corporate slides, stock-looking compositions, decorative filler and repeated title-plus-bullets layouts.

- Take every color from the StylePlan's `--slide-*` variables (`--slide-bg`, `--slide-fg`, `--slide-primary`, `--slide-accent`, `--slide-muted`) and give every slide the same background, so the deck reads as one system rather than a mix of themes.

- Give every deck real imagery: a cover hero and images on content slides, never an empty image box or a "visual goes here" placeholder. The one exception is a brief that is intentionally image-free, handled in step 6 of the workflow.

- Keep each image relevant to the claim beside it. Omit an image rather than use a mismatched one.

- Never place unstyled text over a photo. Use a scrim, a panel, a mask or a split layout for contrast.

- Keep text readable at presentation distance with a clear hierarchy of title, body, stat number and stat label. There is no section-label tier, so a section's point goes in its heading.

- Read [authoring](authoring.md), [the design system](design-system.md) and [image direction](image-directive.md) for the detailed slide rules. The workflow and editing guides own planning, validation and export.

- When a delivered deck has a reported visual problem, re-render the affected slides to PNG and read them before changing the source. Do not guess at a layout or styling defect without visual evidence.
