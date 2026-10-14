# Writing a good deck — the long form

SKILL.md has the checklist. This page explains the reasons behind it. Read this page if the user argues with a design choice, asks for a kind of deck the checklist does not cover (like a keynote or a training deck), or asks for speaker notes. The cross-family content rules that every appifact follows are at the end of this page.

## Writing a good deck

There is no house look. The fonts are the ones you put in `<head>` (see fonts.md). The palette is the hex color codes you choose for the brief.

- **One idea per slide.** One big statement slide is better than three bullet-point-ish slides. It is better to have several short slides than one crowded slide.
- **128px edge margins** are the standard. Use `padding:128px` on the section. Pinned elements start 128px from an edge, unless you have a reason to do something else.
- **Respect your type scale.** Choose four or five font sizes for the deck and use them again and again. Use eyebrows (24–28px, all caps, extra letter spacing, accent color) for labels. Use headings to make statements. Use 40–48px for agenda-level points. Use 28–32px for sentences. Never use less than 24px.
- **Change backgrounds on purpose.** Use the dark color from the palette for the opening and closing slides. Use the light color for the main content. Use the accent color for one statement slide: the single number or sentence you want people to remember. Always set `background` explicitly on every section.
- **Width discipline.** Flow text inside the margins is 1664px wide. That is too wide for body text. Put sentences in a column that is 800–1000px wide. Use `width:960px`, or put a `flex:1` column next to something else. Display lines work best at about 1400px wide. The other limit is the longest word (see format.md § Text). Count characters before you choose how many columns to use.
- **Vertical space budget.** The slide is 1080px tall. Nothing shrinks to fit, and an over-full slide squeezes its boxes (a squeezed table cuts off the lines that no longer fit), so you must do the math for tall content. Inside the 128px margins, you have 824px of height. Here is how to budget it:
  - A two-line heading at 96px with line-height 1.1 ≈ 210px.
  - A gap: 48px.
  - Each table row ≈ 2.1 × the font-size for each line of text in a cell. At 32px font, one row ≈ 70px.
  - 9 rows ≈ 630px. That does not fit under the heading above.
  - A cell with two lines counts twice.
  - A card body = lines × font-size × line-height + padding.
  - Never set a fixed `height` on a text box that is smaller than this total. Leave the height out. The build can only estimate overflow, and it reports that as a note.
  - If the content is too tall: use 24–28px font for tables, or split the slide.
- Keep decks under about 50 slides. Each slide is one file. The markup is tiny, so a deck's size is mainly its images. Refer to images by path so they upload as assets (separate files), not inline in the slide. Use one image file more than once instead of using several crops.

### You are a presentation designer

Think like a consultant or executive preparing boardroom material. Focus on:

- Clarity
- Narrative flow
- Back-of-the-room readability

The subset is deliberately not the web. Each slide is a fixed 1920×1080 page, designed like a poster. Each slide should make sense on its own.

Only ask what you cannot figure out on your own (how long the deck should be, and who it is for, if the request does not hint at them). A topic and an occasion are enough to start a draft.

When the user gives a font size, it is in **points**. Convert it: `px = pt × 2` (so "36pt" = 72px). This matches the PPTX export.

### Outline and titles first

Write the outline first. The slide titles alone should tell the story. It is like a table of contents.

Write the full title sequence before any slides, in ONE grammatical style:

- Short textbook-style topic titles, all capitalized (like "Market Research", "Engagement Overview", "Team Structure"), or
- Action titles — short phrases (like "Asia is our largest market…", "…but Eastern Europe has the highest potential for growth").

Read just the titles. A person should understand the flow from only the titles.

SHARE the outline in chat as a list of only the titles, before you start the slides (or while you make them). Do not wait for approval unless the request was unclear.

Avoid Claude-isms — titles that sound like an AI wrote them:

- Titles that "deliver the verdict"
- Titles that are too dramatic
- Titles that create fake tension ("It's not X. It's Y.")
- Heavy reframing
- Faux-insight titles ("The magic moment")

A title INTRODUCES the slide. It is not the speaker's punchline.

### Less text, more structure

AVOID PUTTING TOO MUCH TEXT ON SLIDES. Decide which parts should be:

- Tables
- Diagrams
- Quotes
- Images
- Card rows
- Big numbers

Mix up the look of the slides. Use full-image slides, different backgrounds, big numbers, quotes, tables, and some text. Balance the slides. Avoid slides that are a short block of text hanging under the heading with nothing below, or mostly empty — spread the body down the slide (see "Compose like a slide designer" below), don't center the column.

Use parallel design:

- Section headers look the same.
- Elements that repeat sit in the same place; the heading at the same height on every content slide.
- Slides of the same kind use the same markup (padding, gap, sizes).

### Label diagrams in deck type, not inside them

See layout.md § Labels over an image. The rule in one sentence: Put the artwork in the image file. Put the labels as real text over the image.

### Commit to the system up front

Say out loud the system you will use:

- A layout for each type of slide (section headers, title slides, content slides, image slides)
- Variety and rhythm on purpose

On slides with a lot of text, commit to the user's imagery or to structure (a table, a card row, a big number).

Do not use web-level density (14–16px body text). The smallest text should be 24px. Nothing enforces this — but if the text only fits at 20px, there is too much text.

### Speaker notes (`<aside>`)

Only add speaker notes if the user asks for them. If they do, the deck becomes visual-first and the notes carry the script.

Write the notes like a conversation — full scripts of what the presenter will actually say out loud, not bullet points.

Put one `<aside>` element in each section. Always put the `<aside>` last in the section.

Because the notes carry the story, take text off the slides. Use large figures, quotes, full-bleed images, diagrams, and one-line headlines instead. Do NOT put paragraphs on the slides.

If a slide has a lot of text, you have put the script on the slide. The script should be in the notes, not on the slide.

### Compose like a slide designer, not a web designer

There is no review pass after the build, so decide each slide's composition as you write it.

A statement or title slide with open space below is correct.

But a CONTENT slide whose column stops at 60% of the height reads as unfinished.

Spread out the column on purpose. You can:

- Fill the whole height. Use `justify-content:space-between` or put a `flex:1` spacer before the last row. The heading stays at the top margin, at the same height as on the deck's other content slides, so it does not hop when the viewer flips through them.
- Center the content, on a slide with no heading above its body (a statement, a quote). Use `justify-content:center`. Never center a column with a heading above its body: the column's height then sets where the heading lands, differently on every slide.

Plan out the `gap` so the blocks span the 824px.

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

