---
name: magic-moment
metadata: { "includeInPrompt": false }
description: Make a "magic moment" video — turn a creator's talking-head recording into a vertical video preserving the source narration where their Muse story replays through artifacts and brief exchanges synced to their voiceover — bubbles, typing, emoji reactions, real widgets and pages, message sounds, closing Muse lockup finisher. Use whenever a user with talking-head or selfie footage wants it turned into a shareable clip of their Muse story — "make a magic moment", "turn this video of me into...", "add the chat over my video", "retell what Muse did for me" — even if they never say the words "magic moment".
---

# Magic Moment

The build is a guided pipeline; read the guides in order and follow them
exactly — this file is only the map.

1. `guide/story_and_canon.md` — transcribe the clip, ground every beat in
   the real work this VM actually did, and lock the fact sheet.
2. `guide/conversation_shape.md` — choose the exchanges and artifact reveals that carry the story.
3. `guide/visuals.md` — plan and preview the visuals. Match the component
   to the narrated action and give the actual artifact room to be seen.
4. `guide/screenplay.md` and `guide/timeline.md` — assemble beats.
5. `guide/screenplay_review.md` — the review gate before any render.

The look is owned by `reference/design.md` (doctrine) and
`reference/design-system/muse-moments-kit.html` (product components).  
Use `reference/visual-storytelling.md` for diagram composition and motion. Card mechanics: `reference/card-spec.md`; renderer  
contracts: `reference/overlay-spec.md`.

Tools: `./mm transcribe | validate | preview | render | inspect | publish | webshots | snap | avatar |
example`. Run `./mm webshots` first on any browser story: it copies the
browser's own captures of the pages it drove. Read and crop from them
before you rebuild those pages for the browser beat. `./mm snap`
captures artifacts and live pages.

## Component index

This index names every component in the kit so you can find one by capability.
Grep the label in  
`/opt/hatch/skills/magic-moment/reference/design-system/muse-moments-kit.html`  
and copy that component's markup, which is the source of truth for the look;
`/opt/hatch/skills/magic-moment/reference/design.md` owns how to copy, scale,
and adapt it. The kit's foundations (palette, type, rules) and its
thread-chrome section are renderer-drawn reference, not components to pick.

- Artifacts & documents
  - `web artifact · finished (hero)`: a page Muse built, as its real screenshot.
  - `fullstack app · resting (icon card, figma space icon)`: the app Muse built, at rest before the tap.
  - `fullstack app · tapped (a legit full web app)`: the tap beat that opens that app full screen.
  - `file card · shipping widget replica`: a document Muse produced, with the real file in the preview well.
  - `slides card · shipping widget replica`: a slide deck Muse produced.
  - `user upload chip · shipping replica`: a file the user uploaded, on the user side of the thread.
  - `completion card`: work finished when no other component covers what Muse did.
  - `external link · shipping widget replica`: a link Muse sent, unfurled with its hero and host.
- Media
  - `generated image · renders as-is`: an image Muse generated, on its own image beat.
  - `generated video · renders as-is`: a video Muse generated, on its own video beat.
  - `image picker · mobile canonical (2×2 + quote-reply)`: the user picking one of several generated images.
  - `music · found and playing`: a track or mix Muse found or made, playing.
  - `media library · organized`: photos or media Muse sorted into groups.
- Browser & shopping
  - `browser · rebuilt journey (one card, tap by default)`: a site Muse drove; author the browser beat's pages rather than copying this markup.
  - `skill task · status chip (no browser involved)`: a skill or connector did the work instead of the browser.
  - `web search · citations`: an answer Muse sourced from the web, with its citations.
  - `shopping results · shipping widget replica`: products Muse found, as the in-bubble result grid.
  - `purchase · order placed (canonical figma)`: an order Muse placed.
  - `browser · activity island (canonical figma)`: browser work in flight, as the floating glass island.
- Trust & security
  - `connect an account · in-chat link + disclosure sheet (canonical figma)`: the user connecting an account Muse needs.
  - `secure storage · log in details (figma canonical)`: the log-ins already held in secure storage.
  - `secure storage · add log in details (figma canonical)`: saving a new log-in to secure storage.
  - `sentinel · approval card (figma canonical)`: Muse asking permission before a sensitive action.
  - `secure form fill`: Muse filling a card number or password from secure storage.
- Communication
  - `texting on your behalf · message thread (send animates)`: a text Muse sent for the user, in a real message thread.
  - `email · triage + draft ready`: an inbox Muse triaged, with a draft waiting.
  - `email · draft in the real gmail composer (send animates)`: an email Muse drafted and sent from the Gmail composer.
  - `phone call · live + outcome`: a call Muse placed, live and then its result.
  - `audio pill · shipping widget replica`: a voice memo or audio clip in the thread.
- Automation & ambient
  - `scheduled tasks · agent list (canonical figma)`: the tasks Muse runs on a schedule.
  - `standing watch · ambient guardian`: Muse watching something over days, such as a price.
  - `proactive nudge · text_with_button replica`: an unprompted nudge with one call to action.
  - `option widget · dashed choices (shipping replica)`: the user picking one of several written choices.
  - `letter · shipping widget replica`: a letter Muse wrote.
  - `idea card · shipping widget replica`: one idea Muse surfaced, with its preview and its pill. `From your calls` is this card's meta line, not a component of its own.
  - `morning brief · feed edition (canonical figma)`: the morning feed edition Muse published. `Your day` and `Heads up` are section headers inside it, not components of their own.
  - `ideas · idea rows (canonical figma)`: the ideas list, with one row being chosen.
- Personal intelligence
  - `memory · recalled from weeks ago`: Muse acting on something the user said weeks earlier.
  - `memory · person page (markdown doc, product design)`: a person's memory page and its open threads.
  - `goals · goals surface (canonical figma)`: the user's goals list, with a subgoal checking off.
  - `goals · tracking check-in (canonical figma)`: a check-in on a habit Muse tracks.
  - `calendar · conflict resolved`: a calendar conflict Muse moved.
  - `device sync · flowing in`: the user's device data syncing in.
- Work & analysis
  - `deep research · multi-source report`: a multi-source report Muse researched.
  - `uploaded file · analyzed`: a document the user uploaded and Muse read.
  - `data analysis · chart from a spreadsheet`: numbers Muse charted from a spreadsheet.
  - `long thread · digest`: a long thread Muse condensed into decisions.
- Meta-capabilities
  - `subagents · fanning out in parallel`: work Muse ran across several helpers at once.
  - `wallet · muse wallet screen (canonical figma)`: the wallet screen and its payment methods.
  - `wallet · purchase approval (canonical figma)`: the user approving a purchase Muse is about to make.
  - `title card · chapter divider (canonical figma)`: a full-bleed chapter divider between story sections.
