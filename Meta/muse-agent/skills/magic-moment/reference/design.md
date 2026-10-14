# Design Spec — the Muse Moments Kit is the design system

Use `/opt/hatch/skills/magic-moment/reference/design-system/muse-moments-kit.html`
for product components, fonts, and palette. Preserve the anatomy of recognizable
product controls. Adapt informational layouts to the narrated action using  
`/opt/hatch/skills/magic-moment/reference/visual-storytelling.md`.

Use one outer surface per card. Preserve meaningful inner structure: calendar
cells, chart marks, route lines, media viewports, and selected states. Flatten
only redundant decorative containers. Do not flatten a calendar into bullet
points or a chart into a list of numbers.

## The look is the Muse product's own

The kit mirrors the shipping Muse clients: native and simple, mostly
typographic. Hierarchy comes from font weight and size plus the text
color ramp — primary `#111112`, secondary `rgba(0,4,9,.59)`, tertiary
`rgba(0,7,17,.37)` — never from decoration. The rules that keep a card
reading as the product:

- Flat surfaces only. Cards are a solid fill (`#FFFFFF`, or `#111112`
  for a deliberate dark card) with 22-24px corners at kit scale. NO
  borders, NO side strokes, NO box-shadows, NO elevation anywhere; the
  product's card components do not even have a shadow parameter. Rows
  separate with 1px hairlines at `rgba(0,0,0,.06-.10)`, never with
  outlined boxes.
- Color is rare and means something. Use one accent family per
  card: accent `#0064D4` (tint `rgba(0,100,212,.08)`), success
  `#25B159` fills / `#008200` text, error `#C01F37`. Everything else is
  the neutral ramp. Repeat the accent on related marks to show a relationship.
- Uppercase micro-labels (11px kit scale, 600, `.08em` tracking,
  tertiary color) are the section-header idiom inside cards.
- Chips, pills, and buttons are fully rounded (`border-radius:999px`)
  with low-alpha tint fills, never outlines. The primary button is a
  black `#111112` pill with white text; the `#0064D4 → #4553E4`
  gradient pill (the mobile canonical blue-indigo-650 stops) is for
  primary actions on product-parity cards and at most one hero moment
  elsewhere.
- Messages live in bubbles, radius ~18-22 at kit scale, canonical
  default chat theme: outgoing (user) `#CBE5FF` with `#111112` text,
  incoming (Muse) white with `#111112` text — the same bubbles the
  renderer draws for the thread itself.

## Fonts: one face, three narrow exceptions

Optimistic AI is THE face. Every piece of text on every card — titles,
body, captions, timestamps, counts, meta lines, badges — is Optimistic
AI at weights 400, 500, or 600, sized on the ramps this file names.
Meta and timestamps are NOT mono: they are Optimistic AI captions
(12/16 or 11/13) in secondary or tertiary color, exactly like the
shipping clients. The only sanctioned departures:

- **Optimistic Mono** appears where the product itself uses it and
  nowhere else: the scheduled-list group headers (13px SemiBold
  uppercase — the one mono moment in the UI), file paths and
  extension labels (`memory/people/mom.md`, "PDF"-style technical
  labels may also stay AI), and genuinely masked/tabular values
  (`•••• 4412`). A mono timestamp, count, or caption is
  off-language.
- **MuseLetterCaveat** exists ONLY inside the letter card (its
  handwriting title and byline). Never elsewhere.
- **Real-product recreations keep their own stack**: the Gmail
  composer renders in Gmail's sans, an artifact's interior uses the
  artifact's own fonts, a real screenshot is whatever it is. The
  Muse faces govern the Muse chrome around them.
- Weights above 600 appear only where a canonical trace demands them
  (the connect sheet's 22/32 Bold name, Caveat's 700 letter title).

All faces ship in `/opt/hatch/skills/magic-moment/assets/fonts/` and
are registered by the renderer, so kit markup renders as designed with
no font stack changes.

## Artifact cards are portraits, not templates

When the story's artifact exists — a page or app the user actually
built — the artifact card shows THAT artifact, not the kit's skeleton.
FIRST capture it for real: `./mm snap <its entry html> --run <name>`
renders the artifact's own document (relative assets and all) through
the capture browser and saves a true screenshot — crop it per
`reference/card-spec.md` and put it in the viewport, exactly what the
product would show. When the artifact cannot render the narrated state (missing session
data, server-only state, or missing assets), fall back to reading its code and recreating
its real design inside the viewport — its actual name, its own colors
and typography, its real layout and content, shrunk to a believable
mini-render. The kit's artifact
components fix only the anatomy around the viewport (browser chrome,
title row, actions); everything inside the viewport is
the user's app, uniquely designed per what they created. Two videos
about two different apps must show two visibly different apps; a
skeleton or generic mock where a real artifact exists is a failed
card (and for a live page, a real screenshot crop beats any
recreation). The Muse design language governs the card around the
viewport; the artifact's own look governs the inside — same rule as
the browser card's site viewport.

## Product-parity components copy the product exactly

These kit components are traced from the canonical mobile design and specification Figma files for Muse, not composed from the palette: the Sentinel approval card
(centered, gradient Allow), the secure
storage pair (log-in details list + add sheet), the connect pair
(in-chat `#0064D4` Medium link line + the r38/58 disclosure sheet),
the avatar options grid, the Goals surface (hairline list with the
concentric-dot section header, checkbox rows, activity rail; a goal
checking off gets the product's SMALL confetti burst on the checkbox
— box fills, ~6 tiny particles pop outward once and fade, title
drops to the 37% done tint — the kit's checked subgoal row is the
timed reference), the  
Feed edition (kicker/headline newspaper rows), Ideas rows (44px wash
squircle chip, dividers inset 72), the scheduled-tasks agent list
(Optimistic Mono uppercase group headers, 64px icon-tile rows),
shopping (compact product card, inline product chips, more-like-this
minis, the "Order placed" status chip), Muse
Wallet (tableview screen + the purchase-approval HITL card), the
browser activity island (glass 308×60 with the screenshot deck), and
the black full-bleed Title Card chapter divider.
Preserve their recognizable controls and change only the supported facts.
Retain inner geometry that explains the interaction. Remove redundant outer
wrappers when embedding a full screen in a card. Their anatomy IS the
product, and inventing a different vault, wallet, or approval layout
ships a screen that does not exist. Canonical quirks these surfaces
carry (product truth outranks the palette defaults): app surfaces sit
on `#FCFCFC`, not white or wash; the tertiary tier is
`rgba(0,7,17,.37)` for icons/times/disabled; feed links are
`#1793FF`; scheduled group headers are the one Optimistic Mono
moment in the UI; payment/connect sheets are r38-top; and — on FLOATING
chat-layer surfaces only (the approval card, the
disclosure sheet) — the product's soft elevation (`0 3px 9px
rgba(0,0,0,.02), 0 10px 50px rgba(0,0,0,.10)`). In-card content
stays flat everywhere else.

## Shipping widget replicas outrank composed cards

Chat moments should look like the widgets Muse ACTUALLY renders,
not like cards in the same palette. The kit's "shipping widget
replica" components are traced from the web client's own renderers —
copy them verbatim and change only the facts:

- **File/artifact card**: 320px, radius 16, hairline border, a 40px
  file-type icon beside a 13/18/600 name over the UPPERCASED
  extension in tertiary, then a 16:9 preview well (bottom corners
  only) split off by a 1px inset top hairline. The preview is the
  real document. Slides variant: wider, amber 40px icon tile,
  "Slides · N". User uploads: the 256px chip, accent-tinted tile.
- **Shopping results**: the grid lives INSIDE the assistant bubble
  (white radius-22, 14px padding) — borderless tiles, square image
  on wash radius-12, "brand · domain" caption, 2-line 12/16/600
  name, price with struck original.
- **Dashed choices**: the option widget is a transparent stack of
  radius-6 DASHED-border buttons (chosen goes solid, losers dim to
  50%). Choose-an-image moments (avatar looks, generated options)
  use the MOBILE picker anatomy, not the web one: a white radius-22
  card holding a bare 2×2 grid of radius-8 images — no in-card
  title, no dashed tiles, no confirm button — and the pick plays as
  a user click that answers by QUOTE-REPLY: the touch ring lands on
  a tile, it dips, then "↩ You replied to `<agent>`" lands
  right-aligned above the chosen image as its own bubble with the
  black "Option N" corner chip. The kit's "image picker · mobile
  canonical" card is the timed reference. The dashed seam also
  ends text_with_button: prose in the bubble shell, then a
  full-bleed footer CTA behind a dashed top hairline.
- **Letter**: warm paper gradient (#fbf6ec→#f1e7d3), Caveat
  handwriting title in #a4623f, a 5°-rotated emoji stamp, three grey
  fake-text bars, an optional −3° photo sticker with a tape strip.
  Theme-independent; the single most recognizable Muse card.
- **Idea card**: radius-24 bordered card, 16:9 preview, 16/22/600
  title, 14/20 secondary description, an UPPERCASE tertiary meta
  line with a 4px dot separator, and the accent radius-14 "Let's do
  it" pill with the wand glyph.
- **External link**: radius-16 bordered unfurl, hero capped ~208px,
  the hand-drawn globe tile when bare, "siteName · host" footer,
  trailing external arrow. **Audio**: the 280px fully-round pill —
  32px play circle on wash, 3px waveform bars (played = accent,
  unplayed = 20% black), tabular m:ss. **Browser**: the renderer
  draws this card itself (shell, address bar, touring cursor, click
  ring, page swap) from the rebuilt pages on the browser beat, so
  there is no markup here to copy and no "Take over" pill ("Browser
  cards rebuild the real page" owns the full rule).

Widget replicas use the client's own type ramp (16/22 body, 14/20,
13/18, 12/16, 11/13) rather than the mobile 17/22 ramp the bubbles
use — that mismatch is faithful, not a bug. Scaling: ×3.75 is the
minimum and the CANVAS is the ceiling — a card's outer width never
exceeds the 1240px body (the capture crops anything wider, shearing
borders and corners without a validator error). When a replica's
largest line lands under the validator's 56px dominant floor at
×3.75 (the 13px file-card name, the 14px link title), scale the
INNER metrics — type, paddings, icons, radii — uniformly by
56 ÷ largest-px, and pin the outer width to fill the 1240px canvas
instead of scaling past it: the card reads like the product at a
large accessibility text size. Never inflate one line alone; a
single bumped size breaks the anatomy the floor exists to protect. The client's card
entrance is a spring pop (scale .8→1); approximate it with a ~.35s
overshoot cubic-bezier when a widget card enters mid-video.

Never invent system or security chrome. The product has no "Muse
is driving" pill, no "Vault" badge, and no "Encrypted token sent"
caption — copy like that reads as fake UI and is banned. Browser
presence is expressed only by the browser beat's rebuilt pages and
the activity island; credential moments use the canonical secure-storage
surfaces with, at most, the plain "Filled from secure storage"
caption; encryption and token mechanics never render as UI copy at
all — the security story is told by the approval card, not by
badges.

## Placeholders never ship

Every media slot in the kit — image and screenshot blocks — is a
neutral striped block carrying `data-ph="image"` or
`data-ph="screenshot"`. A copied component keeps
that attribute until you fill the slot, and `validate` REJECTS any card
that still carries one (or the striped/dashed look without it). Before
a card ships, every slot is either filled with real media or removed:

- Screenshots and photos: real material from the thread, a crop per
  `reference/card-spec.md`, or generated media through its own beat.
  Generated avatar media counts as real media only when the moment is
  literally about the avatar (the avatar-generation celebration card);
  no other card carries an avatar.
- A slot with nothing real to fill it gets removed, and the card
  re-balanced — a placeholder in a final video is a failed build.

Local `file://` images are the one non-inline resource cards may
reference; network fetches stay banned.

## Scale kit markup to the 1240px canvas

Kit components are authored around a 330px card width; our canvas is a
1240px-wide body. When you copy a component, multiply every px value in
it (font sizes, paddings, radii, widths, heights) by 3.75 and round.
A kit 11px label becomes 41px; a 13px body line becomes 49px; a 17px
title becomes 64px; a 16px inner padding becomes 60px. Scaling
everything by the same factor is what preserves the kit's proportions;
scaling only the text is what makes cards look inflated.

## One card per component, flat inside, nothing bare on the video

Every component is exactly one solid card: a single filled, rounded
surface from the kit palette, sitting on the creator's footage.
Everything inside that card lies flat on its surface — text rows,
icons, labels — with chips, tabs, badges, and buttons as the only
inner elements that carry their own small fills. Two failure modes,
both banned:

- The double card: a padded, rounded, filled panel inside the card (a
  message shown as a filled bubble, a highlight row in a tinted box).
  Show the message as a flat row instead: sender label, the text, a
  small status chip.
- Bare content: any text or element sitting directly on the video with
  no card under it. Footage is a busy background; content without a
  solid surface reads as broken and washes out on light clothing.

The validator enforces all three edges: a surface on the page body is
rejected (the kit page's display chrome never ships), a card-sized
filled element inside another filled element is rejected, and visible
text with no filled surface anywhere above it is rejected.

Anatomy for a conversation preview: one card. A header row ("Reply to
Angel"), each message as a flat row — bold sender label, then the
text, the draft distinguished by an accent-colored label or a small
chip ("draft ready"), never by wrapping it in its own filled bubble. A
digest or confirmation is the same shape: one card, flat rows, chips
for state.

## Breathing room

After scaling, give content slightly more air than the kit default:
inner padding of at least 64px on every side at 1240px width, and keep
text and controls clear of the rounded corners (nothing within the
corner radius arc). A cramped corner is the first thing that reads as
machine-generated.

## Card motion

Leave card entry, exit, and movement through the thread to the renderer.
Do not add CSS fades, entrance transforms, or exit animations to the whole
card. Keep card text readable. Animate controls and label changes only to
depict an interaction supported by the source, following the interaction
guidance below.

## Browser cards rebuild the real page

A browser beat depicts Muse driving a website, and you build the pages
it shows. Ground the beat before you author a page. `./mm webshots`
lists the browser tool's own action captures with each one's page URL
and timestamp, and `./mm webshots --run <run> --copy N [--url-contains
<site>]` pulls the newest captures into the run directory alongside a
`webshots.json` holding their true URLs. Run it first on any browser
story, and run it early, because the capture store is
garbage-collected. Check `~/workspace/your_files/` and the parent
conversation's attachments for the same material. Read those captures
for the site's real layout, the story's real item, and its real price.
Rebuild the pages from what you read. When no capture survives on this VM,
`./mm snap <https url>` re-visits the live page through the cell's
egress and screenshots it, so you can source the same details from
that.

Author one browser beat per journey: `{"type": "browser", "address":
"rei.com", "reference": ["<run>/webshot_00_www.rei.com.png"], "pages":  
[{"html": "<page 1>", "click": "#add-to-cart"}, {"html": "<page 2>"}],  
"start": 12.0, "end": 22.0}`. Give the beat at
least two pages, because a journey with one page has nowhere to go.
Set `"address"` to the real site's domain, as one string for the whole
journey or as a list matching `pages` one to one. Name the captures your
pages rebuild from in `"reference"`, as one path or a list of paths. The
validator rejects a browser beat that names no `"reference"` or names a
path that does not exist. The run's provenance record lists the captures
you rebuilt from. With no capture and no live snap you have no
`"reference"`, and therefore no browser beat. Present the tool that did
the work instead, per the last paragraph of this section. Do not split
one journey into a card per page.

Rebuild each page as a simplified version of a page the browser really
drove. Give it that site's own layout, header, colors, and font stacks,
per this file's "Real-product recreations keep their own stack" rule.
Cut it down to the elements the story needs: the header, the item, its
price, and the control the cursor presses. Simplified means fewer
sections than the real page. It does not mean lower fidelity in the
sections you keep. Do not put placeholder
stripes, gray boxes, or lorem text on a page; the skeleton ban covers
rebuilt pages too.

Write each page with its reference capture open. Work from what the
capture shows, not from what you remember about the site. Reproduce
that page's anatomy exactly as the capture shows it: the header lockup,
the nav labels, the breadcrumb, the layout proportions, the type scale
and weights, and the button copy. Sample the page's colors out of the
capture with PIL, including the background washes, the brand accents,
and the sale or CTA colors. Do not guess a brand's colors from memory.
Someone who uses the site should recognize the rebuilt page at a
glance.

Put the story's real item on the page. Its name, its price, and its
image come from the trajectory you just read. Crop the item's image out
of a real capture with PIL per
`/opt/hatch/skills/magic-moment/reference/card-spec.md`, and reference
the crop in the page markup by absolute `file://` path. Crop the site's
logo lockup out of the capture the same way and place it by absolute
`file://` path; a redrawn logo reads as a knock-off. The capture
engine loads no external URLs, so a web image URL renders as a broken
box. Every specific on a page (a price, a product name, a time, a code)
comes from your fact sheet, and the validator lints page text with the
same rule it applies to bubbles and cards.

Author each page as a fixed desktop viewport: `body` width 1240px with
640px of visible height, the aspect of the browser's own ~1919×992
captures. Content below 640px is cut, the way a real browser folds a
page.

Give every page except the last a `"click"`: a CSS selector naming the
element the cursor presses to reach the next page, like
`"#add-to-cart"`. The renderer measures that element's rendered box on
the page you wrote, lands the cursor on its center, pulses the click
ring there, and swaps to the next page. A selector that matches nothing
fails the render with the selector named. An element whose center sits
below the 640px fold fails the render too. A `[x_frac, y_frac]` pair is accepted
when no selector names the spot you want pressed.

The renderer owns every bit of motion on a browser beat: the shell, the
address bar, the touring cursor, the click ring, and the load-flash
page swap, across the whole 5.0 to 20.0 second beat. Do not write
`@keyframes` into a page, because the renderer captures each page as
one still. Browser beats tap by default, so the session plays at stage
size where the cursor work reads on a phone;
`/opt/hatch/skills/magic-moment/guide/visuals.md` owns the tap rule.

Do not put a "Take over" pill or any other invented affordance on a
browser card. When a skill or connector did the work instead of the
browser (Duffel for flights, a search API, any tool), present that tool
as itself with the skill task status chip (the canonical 316×64 chip
naming the skill, progressing to done, in the kit) or the plain thread.
Author no browser beat for that moment.

Interactive components PLAY their interaction. Anything with a
button or a choosable row shows one press: the touch ring lands
first — the same `#0064D4` ring the driving card's cursor clicks
with (a ~30px circle, 2.5px border over `rgba(0,100,212,.14)`,
scaling in and fading over ~0.6s), centered on the control ~0.3s
before the dip, so the viewer sees WHAT got pressed — then a ~0.3s
dip (`scale(.85-.96)` and back), then the consequence — the send button
dips and the draft lands as a sent bubble, Allow dips and resolves
to "Allowed ✓" while Deny fades, an option tile dips and takes the
selection ring while the others dim, a checkbox dips before it
fills. The kit's composer, Gmail, approval, connect, add-login,
avatar-grid, ideas, fullstack-app, goals, feed-heart, music,
completion, and browser-island cards are the timed references —
copy their grammar. One press per card; label swaps use two
stacked layers cross-fading (never text morphs); everything is
`1 forwards` so the card plays once and holds the resolved state. A
card full of buttons where nothing ever gets pressed reads as a
mockup, not a product.

The press finishes its story. Author the touch ring, the dip, and the
resolved state as finite animations
(`animation: <name> 4s ease-in-out 1 forwards`), not `infinite`. A
control that keeps re-pressing itself reads as a stuck robot. A card
whose animations are all finite plays once and holds its final frame; a
card that mixes a finite narrative with looping ambience captures both on one timeline through the beat endpoint. The finite action stays complete while the ambient animation continues.

Tap sparingly on cards that are not browser beats: one or two beats per
video, reserved for the payoff
(`/opt/hatch/skills/magic-moment/guide/visuals.md` owns the rule).

## The full-screen Muse finisher

Let the renderer append the Muse close after the source footage. Do not author an ending card or avatar header. Keep authored beats within the source duration and preserve the concluding narration.

## Mechanics (machine-enforced, unchanged by the kit)

- Author at `body` width 1240px; card height under ~600px — or ~1100px
  on a `"tap": true` beat, where tall is what makes the growth land
  (`render_html` rejects taller than the beat's budget). Do not set
  body height, and keep the body itself bare: the card surface lives
  on the component's root element, never on the page body (the
  validator rejects it).
- Inline CSS only; no JavaScript; no external fetches (local `file://`
  images for filled media slots are the one exception); no headless
  browser renders.
- Font sizes in px only. Floors after scaling: nothing under 32px, and
  every card's largest rendered line at least 56px (`validate` rejects
  violations; only sizes the markup actually uses count).
- Every specific (name, price, code, time) needs source evidence in your
  fact sheet; the validator lints the card's visible text with the same
  rule as bubbles.
- Generated images and videos render as-is through their own beat
  types; the kit frames the moment around real media, never a synthetic
  stand-in for it.

Components in the kit, by section (plus a thread-chrome reference
section at the top — bubbles, chips, typing — which the renderer draws
itself and you never author):

- Artifacts & documents: web artifact (finished hero), fullstack app
  (two states: resting = the app's beveled space icon + name in a
  small card, exactly the Figma icon idiom; tapped = the tap effect
  fills the chat window with the LEGIT full web app — its own
  chrome, sections, and state, recreated from the real app or
  captured with `./mm snap`, never a widget-sized summary), finished
  files (one card per kind), completion card, sharing (link out,
  someone opens). There is no build/loader card anymore — an
  artifact enters the story finished (the hero's real screenshot);
  show the work through the browser card or the thread, never a
  progress skeleton.
- Media: generated image, generated video, avatar generation
  (celebration), music (found and playing), media library (organized).
  Generated images and videos render as-is; the kit frames the moment
  around them, never a synthetic stand-in.
- Browser & shopping: live browser control (progress + proof),
  browser activity island (canonical glass row), web search
  (citations), shopping (compact product card, inline chips,
  more-like-this, canonical), purchase (order-placed status chip,
  canonical).
- Trust & security: connect an account (in-chat link + disclosure
  sheet, canonical), secure storage pair (canonical), sentinel (the
  product approval card), secure form fill (card number, password).
- Communication: texting on your behalf (a real message thread —
  contact header, date stamp, grouped bubbles, and the composer bar
  with the + circle, rounded-full field, and one send button; the
  send plays and the sent bubble lands in the thread),
  email triage, email draft (the legit Gmail compose window with its
  blue Send), phone call (live + outcome), voice (listening state).
- Automation & ambient: scheduled tasks (agent list, canonical),
  standing watch (ambient guardian), proactive (unprompted nudge),
  morning brief (feed edition, canonical), ideas (idea rows,
  canonical).
- Personal intelligence: memory (recalled from weeks ago), person
  page (markdown memory doc, product design), goals surface +
  tracking check-in (canonical hairline lists), calendar (conflict
  resolved), device sync (flowing in).
- Work & analysis: deep research (multi-source report), uploaded file
  (analyzed), data analysis (chart from a spreadsheet), long thread
  (digest).
- Meta-capabilities: subagents (fanning out in parallel), wallet
  (Muse Wallet screen + purchase approval, canonical), title card
  (chapter divider, canonical).
