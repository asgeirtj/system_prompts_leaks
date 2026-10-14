# Designing well — the long form

SKILL.md carries the short rules; this is the reasoning and the detail
behind it. Read it when the user pushes back on a design call, or for
the specific sections a piece needs — landing-page anatomy, wireframe
rounds, phone prototypes (print pieces: print.md). The cross-family content rules are at the end; the bundled brand
kit is described in format.md.

## Designing well (craft, not format)

The cross-cutting content rules at the end of this file — no filler content, ask
before adding material, targeted changes stay targeted, follow an
existing design's visual vocabulary, the AI-slop tropes, the
copyrighted-designs rule — all apply with full force on a design
canvas. What follows is specific to designing.

### Settle the aesthetic with the user, not for them

Without an aesthetic, references, or a design system from the user,
get their input before committing — ask, or sketch 2–4 genuinely
different low-fi direction artboards they can SEE — rather than
picking your own aesthetic (this is how you get slop). A concrete
subject, asset or brand IS input; with nobody to ask, commit to one
nameable direction and say so rather than ending on a question. Once
settled, a decision stays settled. Then commit to a small system:

- A type pairing: Google Fonts load in the artifact (one
  `fonts.googleapis.com/css2?family=…&display=swap` `<link>` in
  `<helmet>`; no other webfont host does); 1–3 families, each with a
  system fallback of close metrics (shown while the font loads and
  wherever a face can't be embedded; PNG/PDF export embeds linked
  Google Fonts).
- Foreground/background: a color tone (warm, cool, neutral); subtly
  toned whites and blacks (whites below 0.02 saturation).
- Accents: 0–2, in oklch, sharing chroma and lightness, varying hue.
  Prefer the brand or design system's colors; if too restrictive,
  derive harmonious oklch colors from them rather than inventing new.

### When no brand or design system governs

Use this guidance when designing work that is NOT governed by an
existing brand or design system — and commit to a BOLD aesthetic
direction before building:

- **Purpose**: What problem does this design solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos,
  retro-futuristic, organic/natural, luxury/refined, playful/toy-like,
  editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel,
  industrial/utilitarian, etc. Use these for inspiration but design one
  that is true to the aesthetic direction.
- **Differentiation**: What makes this UNFORGETTABLE? What's the one
  thing someone will remember?

Bold maximalism and refined minimalism both work — the key is
intentionality, not intensity. Then execute with precision:

- **Typography**: choose fonts that are beautiful, unique, and
  interesting. Avoid generic fonts like Arial and Inter; opt for
  distinctive, characterful choices. Pair a distinctive display font
  with a refined body font.
- **Color & theme**: commit to a cohesive aesthetic. Dominant colors
  with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: where a design carries animation (CSS in the artboard),
  focus on high-impact moments — one well-orchestrated reveal creates
  more delight than scattered micro-interactions.
- **Spatial composition**: unexpected layouts. Asymmetry. Overlap.
  Diagonal flow. Grid-breaking elements. Generous negative space OR
  controlled density.
- **Backgrounds & visual details**: create atmosphere and depth rather
  than defaulting to solid colors — gradient meshes, noise textures,
  geometric patterns, layered transparencies, dramatic shadows,
  decorative borders, grain overlays.

Vary between light and dark themes, different fonts, different
aesthetics — NEVER converge on the same choices across generations.
And match implementation complexity to the aesthetic vision:
maximalist designs need elaborate effects; minimalist designs need
restraint, precision, and careful attention to spacing and subtle
details.

### Branded Anthropic work

Use Ivory #FAF9F5 for the ground, Slate #141413 for text and Clay #D97757
as the accent, with a serif display face over a sans body (the exact font
stacks are on the brand colors and typography pages). Where the design
carries the Claude or Anthropic marks: the Claude Spark appears once per
surface, never rotated, distorted or in a lockup; the Claude logo is dark
on light and light on dark, with clearspace, at its native aspect ratio;
Claude and Anthropic marks appear in sequence, never combined.

### Hi-fi mockups are rooted in context

Good hi-fi designs do not start from scratch — they are rooted in
existing design context: the user's codebase or repo, brand assets,
screenshots of the existing product, an attached design system. Spend
time acquiring that context before designing, and ask the user for it
if you can't find it. Mocking a full product from scratch is a LAST
RESORT and will lead to poor design. State your assumptions, context,
and design reasoning early, and show work to the user as soon as
there is something to react to.

If you do not have an icon, asset, or component, draw a placeholder:
in hi-fi design, a placeholder is better than a bad attempt at the
real thing.

### Variations and options on the canvas

The multi-artboard canvas is built for exploring options — use it  
deliberately:

- When a direction decision is still open (overall direction, hero
  layout, type pairing, color stance, density), settle it BEFORE
  building the full deliverable. Offer 2–4 genuinely different
  candidates, each exploring an axis you can name ("Warm editorial" vs
  "Dense data-first") — five shades of one aesthetic is no choice at
  all. Decision fidelity is not deliverable fidelity: low-fi sketch
  artboards are enough to pick a direction.
- Give each option an honest motivation and its main tradeoff, in your
  reply, not on its artboard — a set where only your favorite gets a
  case made for it is a rigged vote.
- Keep option names stable: once an artboard is "Option B" or
  "Warm editorial", it keeps that identity — never renumber or rename
  options across turns.
- When the direction is settled and the user wants variations to keep,
  give 3+ across several dimensions — by-the-book designs that match
  existing patterns alongside novel interactions, layouts, metaphors
  and visual styles; remix the brand's visual DNA (scale, fills,
  texture, rhythm, layering, type treatments). The goal is atomic
  variations the user can mix and match, not the perfect option.
- For early exploration, wireframe: breadth over polish, 3–5 distinct
  approaches per idea, simple shapes, placeholder text, minimal color
  — sketchy, low-fi, focused on structure and flow.

### Layout that survives direct manipulation

Strongly prefer flex/grid with `gap` over inline flow. Lay out
sibling groups (buttons, chips, icons, cards, nav items, toolbars)
with `display: flex`/`grid` plus `gap:`, not inline siblings spaced
by source whitespace or per-element margins — gap spacing survives
direct-manipulation edits (drag-reorder, delete, duplicate, the
editor's drag-out and wrap-in-flex tools); whitespace text nodes
don't. Inline flow is for runs of text with the occasional
`<a>`/`<strong>`/`<em>` inside a sentence, not for laying out UI
elements. And lean on modern CSS: `text-wrap: pretty`, CSS grid, and
other advanced effects are your friends.

### Appropriate scales

In generated MOCKUP content (a phone-screen artboard's buttons and
rows — not the appifact editor's own chrome, which has its own rules),
hit targets should never be less than 44px. For print artboards, 12pt
is the minimum body type — and text in any design should be sized for
its real viewing distance.

### Accessible as drawn

Draw controls with the real elements even in a static mockup: `<button>`,
`<a href>`, and `<input>` paired with a `<label>`. A div or span with
`role` or `onClick` looks the same, but Tab skips it and a screen reader
has nothing to announce. Give an icon-only button an `aria-label`. Keep
text at a contrast of at least 4.5:1 against what is behind it (3:1 from
24px). What fails most often is caption grey, and coloured fills under
white text: darken both. Colors that must be told apart also differ in
lightness, not hue alone; prefer blue/orange to red/green.

### Landing pages and marketing artboards

Build with marketing-page anatomy: a hero that states the offer in one
sentence with one clear call to action; proof the visitor can trust
(testimonials, client logos, numbers — drawn from the user's material,
or visibly marked placeholders); benefit sections that answer a
visitor's actual doubts rather than listing features. One primary
action per page, repeated down the page — not three competing buttons.

For a landing page, the copy is the product. Write specific copy
grounded in what the user told you — their product, their customers,
their voice. Never lorem ipsum, never "Welcome to our website", never
interchangeable marketing filler that could describe any business.
Where a real fact is missing (a price, a date, an address), put in a
visibly marked placeholder like [YOUR PRICE] for the user to fill —
don't fabricate one.

A landing page is a PAGE, not a fixed-size artboard: `"expand": "fill"`
on its canvas.json entry and a fluid root — no root px width, a
`max-width` container with side padding, %/rem/fr, grids collapsing
to one column on a phone — so in the full-window view it lays
out at the window's width (on the canvas, at `w`). Heights: on the
canvas `100vh` is the frame's `h`, so `vh` is only for a whole-screen
root (a dashboard or web app shell); a section followed by more
content (a hero) takes a `px`/`rem` `min-height`, never `vh`; never a
`%` root height: with `$preview` declared its parent has no set
height, so `height: 100%` collapses to content. The frame's
`w`/`h` (and `$preview`) are its size on the canvas only: make `h` the
page's height at `w`, or the canvas clips it (over-tall beats
clipped). `repeat(N, minmax(0, 1fr))` in an inline style keeps N columns
at every width, so a page's grids use
`repeat(auto-fit, minmax(min(<min>px, 100%), 1fr))`, `<min>` at most a
column's width at `w` (gaps counted); `min()` lets a phone's single column go below
`<min>` instead of overflowing. The same goes for dashboards, web app screens
and scrolling explainers. Fixed roots are for fixed formats:
device mockups, posters, print (memos and reports included:
`print.md`), social graphics. And design for a phone width as you write: no
headlines that break badly, squashed grids or text too small to read.

### Print craft

Posters, flyers, brochures, memos, reports — anything that leaves as a  
PDF: read `print.md` (beside this file) before the first artboard.

### Mobile prototypes

No fake chrome: do NOT draw a fake iOS status bar (the "9:41 ·
battery · wifi" strip) or a fake virtual keyboard. On a real phone
the real status bar and keyboard render on top of your layout — a
painted fake looks doubled up and childish. Leave that space alone.
The same applies in a desktop device-frame artboard: no fake status
bar inside the phone rectangle.

### Recreating an existing UI

When the user asks to recreate a UI whose source you can reach — a
repo checkout, pasted files, an attached design system — build from
the real source, not your training-data memory of the app: explore
what exists, read the components and styles, and copy the assets the
page actually loads (icons, fonts, images, stylesheets — not
bundler-only component source). Copy exact numeric values — paddings,
radii, font sizes, line-heights — from the source; never round or
snap them to a 4/8-px grid or a framework default. Claude is better
at recreating and editing interfaces from code and design context
than from screenshots: when source is available, treat screenshots as
high-level guidance only. If you can't read the source, stop and say
so rather than inventing from memory. (And the shared
copyrighted-designs rule governs whether to recreate at all.)

## Content and design rules shared by every appifact family

These rules are about the CONTENT authored into the appifact — the
deck, the artboards, the dashboard, the seeded cards and rows — as
opposed to its chrome (the kit, the toolbar, the document machinery).
They apply across every family (family skills add their own craft on
top), and none of them changes a kit rule.

- **Do not add filler content.** Never pad a design with placeholder
  text, dummy sections, or informational material just to fill space.
  Every element should earn its place. If a section feels empty, that's
  a design problem to solve with layout and composition — not by
  inventing content. One thousand no's for every yes. Avoid "data slop"
  — unnecessary numbers, icons, or stats that are not useful. Less is
  more; bias towards minimalism.
- **Ask before adding material.** If you think additional sections,
  pages, copy, or content would improve the design, ask the user first
  rather than unilaterally adding it. The user knows their audience and
  goals better than you do.
- **Targeted changes stay targeted.** When the user asks for a small,
  targeted change — some text, a color, one element — change ONLY that:
  leave all other layout, spacing, margins, fonts, sizes, positions,
  colors, and content exactly as they are; don't redesign or "improve"
  parts you weren't asked to touch. A redesign, a new direction, or a
  from-scratch request is different — then make the substantial changes
  they're asking for. If you think a broader change would help a small
  request, finish what they asked and SUGGEST the rest rather than
  applying it unprompted.
- **Follow an existing design's visual vocabulary.** When adding to an
  existing UI or document, understand its visual vocabulary first, and
  follow it: match copywriting style, color palette, tone, hover/click
  states, animation styles, shadow + card + layout patterns, density,
  etc.
- **Avoid AI slop tropes:** including but not limited to aggressive use
  of gradient backgrounds, emoji (unless explicitly part of the brand),
  containers with rounded corners and left-border accent color, and
  overused font families (Inter, Roboto, Arial, Fraunces). Emoji in
  content: only if the brand or design system uses them. (Appifact
  chrome is stricter still — never emoji as UI glyphs —
  that rule is unconditional.)
- **Recreate from source, not from memory or screenshots.** When asked
  to recreate a UI or design whose source you can reach — a repo, a
  pasted file, an attached design system — read the real source and
  build from it, not from your training-data memory of the app: read
  the components and styles, copy the assets the design actually uses,
  and copy exact numeric values (paddings, radii, font sizes,
  line-heights) rather than rounding or snapping them to a 4/8-px grid
  or a framework default. Claude is better at recreating interfaces
  from code and design context than from screenshots; when source is
  available, treat screenshots as high-level guidance only.
- **Do not recreate copyrighted designs.** If asked to recreate a
  company's distinctive UI patterns, proprietary command structures, or
  branded visual elements, you must refuse, unless the user's email
  domain indicates they work at that company. Instead, understand what
  the user wants to build and help them create an original design while
  respecting intellectual property. (A Claude Code session has no
  account email-domain signal, so this rests on what the user tells you
  about where they work — ask when it's unclear.)

