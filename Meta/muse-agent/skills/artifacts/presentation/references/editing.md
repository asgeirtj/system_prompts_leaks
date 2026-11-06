---
description: Revise the existing deck while preserving its identity, content and theme outside the requested change.
---

# Edit an existing deck

- Change the deck the user already has, in place, from its artifact slug. Work in the `project_dir` your build task names: `~/workspace/your_files/<artifact-slug>/` for an ordinary deck, or the goal's own `files/` directory for a goal document.

- Never write a fresh deck from the brief on an edit. Change the deck that already exists.

## Read only what the change needs

- The deck's source is per-slide under `.src/slides/`:
  - `.src/slides/deck.json` lists the slides in order. Read it first, since it tells you which file is which slide.
  - `.src/slides/deck.css` holds the theme's `:root` tokens and every shared rule, with the theme's `@font-face` rules at the end. Edit the rules above those faces and leave the faces alone.
  - `.src/slides/<id>.html` holds one slide each. Read only the slides you will change.
  - `.src/deck_plan.md` holds the title, audience, narrative and slide list.
  - `.src/style_plan.json` holds the archetype, palette, fonts, per-slide `layout_plan` and `lockups`.
  - `meta.json` holds the deck's title and the exact set of formats it was exported to.

- On a deck with per-slide source, never read or edit `.src/index.html`. It is assembled from the files above, so reading it costs the whole deck to change one slide, and the next assembly discards any edit to it.

## Rebuild a deck without usable source

- A deck with no `.src/slides/`, or one whose slides fail assembly for a reason that predates your edit, has no per-slide source to edit in place. The usual cause is a slide whose `<section>` ID does not match its manifest ID.

- Rebuild it in the current format through the [build workflow](workflow.md), keeping the slug and carrying the project's own material forward: `deck_plan.md` for the narrative and slide list, `style_plan.json` for the theme and layouts without resolving them again, `.src/media/` for imagery and the old `index.html` for each slide's content.

- Apply the requested change as part of the rebuild and tell the user the deck was rebuilt, since that re-authors slides they did not ask about.

## Apply the change by intent

- When you write or add a slide body, follow [authoring](authoring.md) and [the design system](design-system.md) exactly as a fresh build would, so it matches the surrounding deck.

- To change or retopic a slide, resolve the slide number to an ID through the order in `deck.json`, where slide 1 is the first entry. Edit only that `<id>.html`, touch no other slide file and leave `deck.json` alone.

- To shorten a deck, keep the strongest points and the narrative, and drop the weakest whole slides. Remove each dropped slide's entry from `deck.json` and delete its file.

- The remaining slides keep their files, IDs, content and existing images unchanged. Do not regenerate or re-source media, or resolve the style plan again. Rewrite a slide's copy only when the user also asks you to tighten it.

- Never invent filler to pad a deck out.

- To add a slide, write a new `<id>.html` that reuses a layout already used by a sibling of the same kind and one of the deck's two lockups. Give it a short, stable kebab-case ID for its subject and insert its entry in `deck.json` where it belongs.

- Leave every existing slide's ID and file exactly as they are, because IDs name slides for the life of the deck. Never renumber them to match a new position, and do not run the style command to place a new slide, since that resolves the whole theme again and drifts the deck.

- Add imagery to a new slide only where an image illustrates its content. A table, stat or comparison slide stays image-free.

- To reorder, move entries in `deck.json` and leave every slide file unchanged.

- To swap one image, re-source a real subject through the [Image Search skill](/opt/muse/skills/image-search/SKILL.md) or regenerate a concept image following [image direction](image-directive.md), then re-embed its `data:` URI in that slide's file.

- An aspect-ratio change is global. Update `@page` and `.slide` in `deck.css`, then rerun the overflow audit.

## Keep the theme unless asked

- A content edit never resolves the style plan again or touches the `:root` block, so the deck keeps its palette and fonts. Silently restyling a content edit is a bug.

- A re-theme request is the only change to the theme. Resolve a fresh StylePlan for the new direction through [visual planning](visual.md) and apply it exactly, entirely inside `deck.css`, by swapping the `:root` `css_variables` for the new plan's. Then overwrite `.src/style_plan.json` so the saved plan and `:root` stay in sync.

- Never hand-pick colors or fonts. The new `:root` tokens name the new families, and the font embedder replaces the previous theme's bytes. Leave the `@font-face` block at the end of `deck.css` as it is and never write a font URL back in.

- Keep every slide's content and layout, so the slide files stay untouched.

- The deck's photos were graded to the old palette, so a change of hue (not just lighter or darker) leaves image slides looking off. If the cover hero was generated, regenerate it for the new palette and re-embed it in its slide file.

- If the hero is a sourced real image, such as a logo or photo, never regenerate it. Keep the image and its `--hero-scrim-color` sampled from the image, and adjust only the surrounding `:root` palette. Tell the user the other photos keep their earlier grade and offer to regenerate the generated ones.

## Assemble, validate and export

- Your edit changed the source, so `.src/index.html` is stale until assembly runs. Assemble before anything else:

```sh
SLUG="<artifact-slug>"
# Your build task names `project_dir`. A goal document is built under that
# goal's `files/` directory, so a hardcoded `your_files` path is wrong.
# Write the leading `~/` of `project_dir` as `$JARVIS_HOME/`: the shell leaves
# a tilde literal inside quotes, so `"~/workspace/..."` builds into a directory
# literally named `~`.
SRC="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>/.src"
bun run "/opt/muse/assets/artifacts/scripts/embed_deck_fonts.mjs" --slides "$SRC/slides"
bun run "/opt/muse/assets/artifacts/scripts/assemble_deck.mjs" \
  --slides "$SRC/slides" \
  --out "$SRC/index.html"
```

- The embed step does nothing unless the deck's fonts or characters changed, so it is cheap on a content edit, and it is what gives a re-theme its new fonts.

- Then run the full validation loop from steps 8 and 9 of the [build workflow](workflow.md) as a fresh build would: gate on the render report, read every rendered slide, and stop after three iterations. Do not shortcut it to one pass, since a re-theme swaps fonts and `fonts.missing` matters.

- Drop `--require-restraint` on every edit, a re-theme included, because the probe reads slides this edit must leave alone. Fix furniture, uppercase and letter spacing only on the slides you edited, and mention untouched slides only if you actually saw those styles there.

- Drop `--require-generated-imagery` unless this edit generated imagery. An existing sourced or chart-only deck has nothing that satisfies it.

- Make each fix in the slide source or `deck.css`, then assemble again before re-rendering.

- Export the formats your brief's `output_format` names, through step 10 of the [build workflow](workflow.md), then recompute `meta.json` through step 11.

- Move any project-root deliverable whose format is not in `output_format` into `project_dir/.src/`, so the root matches `meta.json`.

- After a structural edit such as shortening or adding, sync the slide list in `deck_plan.md` and the `layout_plan` entries in `style_plan.json` to the final deck, without touching the palette or fonts. The deck keeps its slug and its links.
