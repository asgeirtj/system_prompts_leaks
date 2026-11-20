# Authoring a good design system — the rules

SKILL.md has the checklist; these are the rules behind it. A design
system exists so later agents can build on the brand — author it from
the brand's REAL sources (codebase, attached files, decks, guidelines).

- **The README is usage rules for a consuming agent** — the page shows
  it as the brand book. Imperative sentences that NAME tokens, styles
  and assets ("Set body copy in `body`; `ink` on `surface-100`; Clay
  only for Claude's own voice"). No title (the page carries the
  system's name), no provenance, build notes or "next steps" — those go
  in your reply. Its length tracks the source: a files-only drop earns
  a few bullets; a real codebase or guide earns sections with the
  brand's own examples — content fundamentals (tone, casing, I/you,
  emoji or not; quote real copy), visual foundations (color, type,
  spacing, imagery, motion, states, borders, shadows, radii, layout),
  iconography (which icon system, format, emoji or glyphs). Never pad.
- **Assets are copied, never approximated.** No logo in the sources ⇒
  set the name in plain type and note the absence; never draw or
  reconstruct a real company's mark from memory, never rebrand with an
  identity the user didn't provide. Copy the brand's own icons (font,
  sprite, SVGs); if truly unreachable, substitute the closest match and
  FLAG it under Iconography.
- **The source defines the inventory.** Tokens: the source's real names
  and values, in its order. Components: exactly the families the source
  defines — no "usual" extras (Toast, Avatar…) unless listed under
  "Intentional additions" with a reason; only a from-scratch or
  guidelines-only brand gets a standard set. Enumerate the FULL
  inventory first, track against it, build all of it; if you stop,
  report exactly what remains and ask — never end silently incomplete.
- **Exact values from real sources.** The source beats any library it
  resembles (shadcn, MUI…); copy paddings, radii, sizes and line-heights
  exactly — 5px stays 5px, no snapping to a grid. Code is truth,
  screenshots are lossy guidance; previews recreate, never reinvent. If
  reads fail partway, say what you did and didn't read — never invent
  names, structure or values.
- **Read a big system by path.** A `read` with no `path` can be refused for a
  big system: read each file you need by `path`. That copies just that file,
  so your folder holds only what you have read. Where the index has a
  `source.map`, that file lists the system's files as they were moved.
- **One source for every value.** In a clean-up, a value that goes into
  `tokens.json` is REMOVED from the stylesheets the previews load, so a
  value changed on the page wins; what the page will not declare under
  the same `--name` stays. That remakes the stylesheet, and a person's
  sheet is no exception: its old self moves aside whole first (Move
  aside, below). The page writes `tokens.css` only when
  someone saves: where the system has no `tokens.css` of its own, write
  the first yourself, laid out as `format.md`'s "tokens.css as
  compiled", its first line `/* <title> — generated from tokens.json */`
  (the page takes over only a file whose first comment ends with those
  words). A page that opens a system synced by `/design-sync` never saves it,
  so each sync writes the file, laid out the same. Where a system's components wrap themselves in an element the
  tokens are declared on, the page's values cannot reach inside: their
  values still go into `tokens.json`, remove nothing, and tell the user
  an edit on the page will not change those previews.
- **No stale `manifest.json`.** A clean-up REMOVES the old
  `manifest.json`, never rewrites it: it lists paths that are gone, and
  the page writes no new one until a person saves an edit.
- **Move aside what a person made.** A clean-up deletes only three
  RECORDS: the old `project/manifest.json`, `project/migration-map.json`
  and `project/publish-progress.json`; a file of one of those names at
  any other path is a person's. Any other file leaves its path only by a
  MOVE: ONE call that sends the file at a free path (no file there, no
  other file sent there), exactly as your last `read` gave it (copy it,
  never retype it), and `null`s the old path.
  A file goes under `project/archived/` ONLY in the very call that
  `null`s or rewrites its old path, never as a copy sent ahead (a
  `null` counts as a file of its call: a tool that takes 16 holds 8
  MOVEs, so make more calls).
  IF YOUR TOOL REMOVES NOTHING (you cannot send it a `null`, or it
  refused a call for its `null`, which saves nothing of that call):  
  SEND NOTHING UNDER `project/archived/`, and make no copy for it. A
  file that would move aside just stays where it is. The one exception
  is a stylesheet you rewrite at its own path: its old text goes aside
  in that call. A MOVE to a file's place in `format.md` (not one to
  `archived/`) only SENDS the file there, and the old path keeps an OLD COPY. The
  rest of the clean-up is the same, every new file the format wants
  included (`components/bundle.css` too). The three records stay and go
  in NO list below: the page writes `manifest.json` anew at the next
  save, reads neither of the others, and shows a person no way to
  delete any of them.
  A file that goes as it is
  to the place `format.md` gives it moves there. A file you would
  otherwise remove (a card you split or remade, where it sits or on its
  way to its place; an HTML page of colour, type, spacing or radius
  specimens) moves ASIDE, to `project/archived/` + its path under
  `project/` (`project/preview/a.html` to
  `project/archived/preview/a.html`). So does a stylesheet, whole, before values are lifted out
  of it: ONE call sends the old file aside and the new one at its path.
  In `README.md` repair paths, cut the section the migration appended
  at its end ("## Moved to Claude" or "## Migrated from …"), and add;
  cut or reword nothing else. Leave no file that stays linking a path
  you emptied; the migration's own notes under `assets/notes/` (or
  `docs/`) are neither moved nor re-pointed.
  A file that cannot
  move (no free path; the call stays refused) stays where it is: name
  it.
  YOUR LAST MESSAGE has three lists; an empty one says "none".  
  DELETED: only what a call really removed (a refused `null` deleted
  nothing). MOVED ASIDE: each file now under `archived/`. SAFE TO
  DELETE, once the person has checked the result: each file you moved
  aside; each old copy, with the path that now holds the same bytes;
  each page you remade, with what replaced it; `_ds_manifest.json`,
  which nothing reads. EVERY one of those is in the list, or it stays
  for good with nobody told. Nothing else goes in it: a file that is the only copy of what it holds stays and is
  not offered (component sources, the migration's notes, `_ds_bundle.js`
  while no file is at `components/bundle.js`). A person's stylesheet at
  its own path is NEVER in the list: only its old text, once you have
  moved that aside. A tool that removes files offers to
  delete that list (list the system's files first: some tools remove
  only what the session has listed or read). One that cannot says that anyone who can
  edit the system can delete those files under Files on its page, a
  whole folder at once only where the list holds all of it. What `archived/`
  held before is never moved or offered for deletion. A specimen page
  moves aside only once every colour, size and `--name` it shows is in
  `tokens.json` with the same value (search the specimen page for `#`,
  `rgb`, `hsl`, `lch`, `lab`, `px`, `em`, `%` and `var(--`). An HTML
  page of logos or icons is no specimen page: remake it as a preview at
  `components/<Comp>/preview.html`, then move the old page aside like
  any card. Never move aside a file that a kept file still links to,
  unless a new file takes its path or those links are re-pointed.
- **A usage note on every token and asset** saying where it is used (a
  single-ink SVG's note names its ink — `<img>` can't inherit color).
- **Legible in every theme.** A text color's usage note names the grounds
  it reads on ("Body copy on `surface` and `surface-raised`"), and each
  such pair holds at least 4.5:1 contrast (WCAG 2; 3:1 for text 24px+ or
  bold 19px+, and for any border, focus ring, icon or other mark that
  carries meaning) in EVERY theme — check the later themes' values, not
  only the first's. What the component previews and `bundle.css` paint
  meets the same floor. Colors you choose (a brand from scratch, a
  preview's own styling, the focus ring) simply meet it: a dark theme that
  lightens an accent usually wants dark text on it, so give such a fill an
  `on-…` token rather than literal white, and make a focus ring you choose
  solid, at least 3:1 on every surface it lands on, stated under visual
  foundations. A real source's pair that misses stays exact — say so in
  its note rather than quietly re-tinting the brand.
- **Accessibility asks have fixed meanings.** A *high-contrast theme* is
  an ADDED theme, never a re-tint of the brand's own: every text color at
  least 7:1 on the grounds its note names (4.5:1 for text 24px+ or bold
  19px+; WCAG AAA), and surfaces and controls set apart by borders that
  meet 3:1, not by shade alone. *Color-blind-safe status colors*: each
  status carries a word or icon too, and success and danger are never a
  green and a red told apart by hue alone — either they differ in
  lightness by at least 3:1 between themselves, or success leaves the
  red–green axis toward blue (an orange danger beside a plain green does
  not count). A real source's green and red that miss this stay exact:
  the safe pair goes in an ADDED theme beside the brand's own, as the
  high-contrast theme does, and their usage notes say which theme is
  safe. No brand hues to keep ⇒ start from Okabe & Ito's set, darkened
  where it is text. A *check* for either lists the failing pairs per
  theme, each with a proposed fix, before editing anything. That is what
  each ask means on its own — the user's explicit instructions take
  precedence over these definitions, and a real source's own colors stay
  exact, as above. The skill's `samples/seazar/` is a worked example of
  all of this (inside a system, its tokens are
  `artifact-type/reference/sample-seazar-tokens.json`).
- **Guidelines say what the consumer provides** (props, children,
  container, data) plus when to use it and the do/don'ts.
- **Seed real substance:** every theme filled where it differs, the type
  scale wired to the brand's real font files, a live preview AND a
  README per component.
- **Avoid AI tropes** unless the source truly has them: bluish-purple
  gradients, emoji as decoration, rounded cards with a coloured
  left-border accent, filler stats, overused fonts (Inter, Roboto…).
  No filler content; a targeted change stays targeted; never recreate a
  company's proprietary UI for someone who doesn't work there.
