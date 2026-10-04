---
description: Editing an existing deck in place, from its artifact slug, without rebuilding from scratch.
---

# Slide deck editing

How to change a deck the user already has, in place, without rebuilding from scratch. You are
given the deck's `<artifact-slug>` and the change request; work on the existing deck at the
`project_dir` your build task names. That is `~/workspace/your_files/<artifact-slug>/` for an
ordinary deck, and the goal's own `files/` directory for a goal document.

## Load first (always)

The deck's source is per-slide under `.src/slides/` (`workflow.md` step 5). Read only what the
change needs:
- `.src/slides/deck.json`: the deck's slides in order. Read this first — it tells you which file
  is which slide.
- `.src/slides/deck.css`: the theme (`:root` tokens) and every shared rule, plus the theme's
  `@font-face` rules holding the font bytes, at the end of the file. Edit the rules above those
  faces. Leave the faces themselves alone.
- `.src/slides/<id>.html`: only the slide(s) you are about to change. Each holds one
  `<section class="slide">` with its images embedded as `data:` URIs.
- `.src/deck_plan.md`: title, audience, narrative arc, slide list.
- `.src/style_plan.json`: archetype, palette, fonts, per-slide `layout_plan`, and `lockups`.
- `meta.json`: the deck's title and the exact set of output formats it was promoted to.

On a deck with per-slide source, do **not** read or edit `.src/index.html`. It is assembled from
the files above, so reading it costs the whole deck's bytes to change one slide, and an edit there
is discarded by the next assemble. (A legacy deck has no per-slide source, so its `index.html` is
the only copy of the slides; the rebuild below reads it on purpose.)

**A deck with no `.src/slides/`, or one whose `.src/slides/` assemble refuses for a reason that
predates your edit** (most often a slide whose `<section>` id does not match its manifest id, which
the old splitter could produce), has no per-slide source you can edit in place: rebuild it in the current format through `workflow.md`, keeping the slug and carrying the
project's own material forward so it stays the same deck (`deck_plan.md` for the arc and slide
list, `style_plan.json` for the theme and layouts, not re-resolved, `.src/media/` for imagery,
and the old `index.html` for each slide's content). Apply the requested change as part of the
rebuild and say the deck was rebuilt, since that re-authors slides the user did not ask about.
Everything below is for a deck that has per-slide source.

Never author a fresh deck from the brief on an edit; mutate the deck that already exists. When
you rewrite or add a slide body, author it per `authoring.md` + `design-system.md` (layout
classes, lockup grid, type scale) exactly as a fresh build, so it matches the surrounding deck.

## Apply the change by intent

- **Change or retopic a slide** ("change slide 3 to X", "fix the last slide"): resolve the slide
  number to an id through `deck.json`'s order (slide 1 = first entry), then edit only that
  `<id>.html`. Touch no other slide file, and leave `deck.json` alone.
- **Shorten** ("cut it to 5 slides", "tighter"): shortening removes slides — keep the strongest
  points and the narrative arc and drop the weakest whole slides, carrying the survivors'
  content and existing imagery through unchanged (reuse their existing media; do not regenerate,
  re-source, or re-resolve the style plan). Remove each dropped slide's entry from
  `deck.json` and delete its `<id>.html`; the survivors' files and ids do not change. Never
  invent filler to pad a deck out. Only rewrite a slide's copy when the user also asks to
  re-tighten it ("make it punchier").
- **Extend or add** ("add a slide on X"): write a new `<id>.html` that reuses the deck's existing
  layouts and `lockups` — give it a `layout` already used by a sibling of the same kind — and
  insert its entry in `deck.json` at the position it belongs. Give it a short stable
  `kebab-case` `id` for what it is about (per `workflow.md` step 5) and leave every existing
  slide's `id` and file exactly as they are: ids name slides for the rest of the deck's life, so
  never renumber them to match a new position.
  Do not re-run the style CLI to place it; that re-resolves the whole theme and would drift the
  deck's current one. Add imagery only where an image illustrates the new slide's content, per
  `image-directive.md` and `authoring.md`'s restraint rule; a table, stat, or comparison slide
  stays image-free.
- **Re-theme** ("make it darker", "more minimal", "a different vibe"): resolve a fresh
  `StylePlan` for the new direction through `visual.md`. Apply it exactly, and
  entirely inside `deck.css` — swap the `:root` `css_variables` for the new plan's — then
  overwrite `.src/style_plan.json` so the saved plan and the `:root` block stay in sync. You do
  not touch the fonts by hand. The `:root` tokens name the new families, and step 7's embed replaces
  the previous theme's bytes on its own. Leave the `@font-face` block at the end of `deck.css`
  exactly as it is, and never write a font URL back in. Never hand-pick colors or fonts yourself;
  the palette is the resolved plan's. Keep
  every slide's content and layout, so the slide files stay untouched. The deck's photos were
  graded to the old palette (per `image-directive.md`), so a hue shift (not just lighter/darker)
  leaves image slides looking off. If the cover hero was **generated**, regenerate it to the new
  palette and re-embed it in its slide file; if it is a **sourced real image** (a logo or photo
  from the image-search skill), never regenerate it: keep the image and its per-slide
  `--hero-scrim-color` sampled from the image (`design-system.md`), and re-tune only the
  surrounding `:root` palette from the resolved plan. Tell the user the other photos keep their
  prior grade (offer to regenerate the generated ones).
- **Anything else** (reorder, swap one image, resize): apply the minimum edit and leave the rest
  as is. Reorder = move the entry in `deck.json`, every slide file unchanged. Image swap =
  re-source a real subject with the image-search skill, or regenerate a concept image per
  `image-directive.md`, then re-embed its `data:` URI in its own file. Aspect-ratio change is global: update `@page` and `.slide` in `deck.css`, then re-run
  the overflow audit.

## Keep the theme unless asked

For a content edit (change, shorten, add), do **not** re-resolve the style plan or touch the
`:root` block: keep the deck's existing palette and fonts. Only a re-theme request changes the
theme. Silently restyling a content edit is a bug.

## Re-assemble, re-validate and re-export

**Re-assemble first** (`workflow.md` step 7). Your edit changed the deck's source, so
`.src/index.html` is stale until `assemble_deck.mjs` runs, and everything below reads that file:

```sh
SLUG="<artifact-slug>"
# `project_dir` comes from your build task. A goal document is built under
# that goal's `files/` directory, so a hardcoded `your_files` path is wrong.
# `project_dir` comes from your build task. Write its leading `~/` as
# `$JARVIS_HOME/`: the shell leaves a tilde literal inside quotes, so
# `"~/workspace/..."` builds into a directory literally named `~`.
SRC="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>/.src"
bun run "/opt/hatch/skills/artifacts/scripts/embed_deck_fonts.mjs" --slides "$SRC/slides"
bun run "/opt/hatch/skills/artifacts/scripts/assemble_deck.mjs" \
  --slides "$SRC/slides" \
  --out "$SRC/index.html"
```

The embed step is a no-op unless the deck's fonts or characters changed, so it is cheap on a
content edit and it is what re-fonts a re-theme.

Then run the full `workflow.md` validation loop (steps 8-9) exactly as a fresh build — gate on the
render report (`ok`, `fonts.missing`, `overflow`), read every `.src/validate` PNG, up to 3
iterations; don't shortcut it to a single pass (a re-theme swaps fonts, so `fonts.missing`
matters). On every edit here, a re-theme included, drop `--require-restraint` from the step-8
commands: the probe reads every slide, including ones this edit must leave alone. Fix furniture,
uppercase, and tracking only on the slides you did edit. Drop `--require-generated-imagery` too,
unless this edit regenerated imagery: an existing sourced or chart-only deck has no sidecar to
satisfy it, so keeping the flag leaves a finished edit no legal move. `workflow.md` states the
rule. Mention the untouched slides only if you
actually saw those styles there; a deck built under the gate carries none. Each iteration edits the
slide source and re-assembles before re-rendering. Then
re-export only the formats the deck already has (from `meta.json` `outputs`) via `workflow.md`'s
promote step (step 10) — not a hardcoded PPTX — and recompute `meta.json` per step 11. After a
structural edit (shorten/add), also sync the slide list in `deck_plan.md` and the `layout_plan`
entries in `style_plan.json` to the final deck — metadata only, leave the palette and fonts as
they are. The deck keeps its slug and its links.
