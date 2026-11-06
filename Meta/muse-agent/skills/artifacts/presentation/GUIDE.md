# Presentations

- A deck is authored as one standalone HTML file per slide plus a shared `deck.css` and a `deck.json` manifest. It is assembled and gated deterministically, then exported, as PPTX by default.

- The per-slide sources under `.src/slides/` are the editable truth for every revision. Slide IDs never renumber.

## Follow these rules on every slide

- Use sentence case everywhere, stat labels included. Never use `text-transform: uppercase` or `letter-spacing` on any text.

- Leave out slide furniture. Pills, subtitles, summary lines, eyebrows, kickers, badges, chips, tags and captions do not belong anywhere on a slide.

- Make the cover the deck title over its hero image and nothing else.

## Read what the task needs

- For a new deck, read the [build workflow](/opt/muse/skills/documents/presentation/references/workflow.md) and the references it names. For a change to an existing deck, read the [editing guide](/opt/muse/skills/documents/presentation/references/editing.md) and the references it names.

- Read [visual planning](/opt/muse/skills/documents/presentation/references/visual.md) to resolve the StylePlan.

- Read the shared [chart guide](/opt/muse/assets/artifacts/references/charts.md) for slides that plot data, and the shared [map guide](/opt/muse/assets/artifacts/references/maps.md) for slides that show a place or a map.

## Use the bundled scripts

- `/opt/hatch/bin/hatch-slide-style` compiles the StylePlan. Never build a deck on a substitute plan you invented.

- `/opt/muse/assets/artifacts/scripts/embed_deck_fonts.mjs` subsets the theme's webfonts and embeds them into `deck.css`. A font that will not download produces a warning, never a blocked deck.

- `/opt/muse/assets/artifacts/scripts/assemble_deck.mjs` validates the slide files against the manifest, enforces CSS scoping and writes the combined document. A non-zero exit means the deck cannot ship.

- `/opt/muse/assets/artifacts/scripts/render_audit.mjs` renders the slides and runs the deck gates. The workflow names its flags.

- `/opt/muse/assets/artifacts/scripts/build_pptx.py` exports the validated slide images as the PPTX and carries each slide's title into its speaker notes as accessibility text. The rebuild path after edits in the app keeps those notes.

- For `/opt/muse/assets/artifacts/scripts/build_pptx.py`, install `python-pptx`: `python3 -m pip install --break-system-packages python-pptx`. The system requires that flag, and `-m pip` targets the interpreter the script runs under.

## Verify before delivery

- Run the gates, then read every slide image fresh before returning a link. The [artifact verification guide](/opt/muse/assets/artifacts/references/verification.md) lists what to look for.
