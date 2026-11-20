# Reading a dashboard aloud

The dashboard can read a page aloud in Claude's voice, for some readers only. Many have no voice, and a page can't turn it on. So a page works without it, and shows anything about listening (words, an icon, a caption) only while the dashboard says there is a voice.

Reading aloud suits prose meant to be read from the first word to the last, so a Letter is marked to be read. The other shapes in `artifact-type/reference/design-defaults.md`, a Scroll story too, are marked only when the person asks to listen, and a shape with a file of its own says there whether it is. The prose on a page of tiles and charts is often one line, which the eye has had before a voice says it, and the tiles and charts themselves make no sense heard. So asked to listen to such a page, give it something worth hearing, such as a summary of two or more short paragraphs at the top, and mark that.

## What is read

The words inside the one element marked `data-read` are read, in order, a paragraph at a time. Tables, controls and hidden parts are skipped, and an `<svg>` or `role="img"` is read by its `aria-label` unless a `<figure>` around it has words.

`lang` on that element (`lang="en"`, `lang="pt-BR"`) names the language its words are written in, whoever reads the page. Where the voice has that language it goes by it. Without `lang` the language is guessed for each part, and a short part can be said in the wrong one. A paragraph or step in another language has a `lang` of its own. Where nothing around a part has one, the `lang` in `dash/meta` counts.

`data-read-step` on a part makes it one step, read as one, and the dashboard brings it toward the middle of the view.

A page whose `data-read` element holds one part, such as a single paragraph, or has steps outside a `data-read-stage`, is read only if it has a `data-read-play` or `data-read-sound` button of its own. Otherwise it is told there is no voice, and nothing says so to you. So a Scroll story that someone asked to listen to has `data-read` on its column of chapters, `data-read-step` on each chapter, and a `<button data-read-play>Listen</button>` above the first.

## The controls

Where there is a voice, the dashboard draws a Listen button just above the `data-read` element, and a player in its place once it is pressed. The page has no player, no script for one and no `speechSynthesis`, which would bring another voice beside Claude's. A `data-read-play` button of the page's own, wherever it stands, starts the reading instead, and the dashboard sets its `hidden`, so that it shows only where a press would do something. The page never sets that itself, and has nothing around the button (a bar, a rule, a margin) that looks empty while it is hidden.

`#dash-root` has `data-dash-read="ready|reading"` while the page can be read aloud, and `data-dash-read="unavailable"`, or none yet, otherwise. It changes while the page is open, so anything about listening is shown by CSS that tests it, and stands outside the `data-read` element, or it is read aloud too:

`#dash-root:not([data-dash-read="ready"], [data-dash-read="reading"]) .hear { display: none }`

## A page that moves with the reading

While a reading is open, `#dash-root` has `data-dash-read-phase="starting|playing|paused|ended"`, and the `data-read-step` being read, or read last, has `data-dash-read-now`. Both go when it closes. Sound is heard only while the phase is `playing`, so motion that keeps time with it tests for that, and not for `paused`. CSS or a `MutationObserver` on `#dash-root`, with `subtree`, can follow both.

- With no voice, before Listen is pressed, and before the first step is reached, no step has the stamp. A rule that fades the others is under `#dash-root:has([data-dash-read-now])`, or it would fade them all.
- The words read are those on the page when the reading starts. A step that at that moment is `hidden` or under `display: none`, `visibility: hidden` or `aria-hidden="true"` isn't read; one faded with `opacity` is.
- Steps stay the same elements, in the HTML and outside every drawing. One made again gets the stamp only if it has an `id`.

`data-read-play="ch2"` starts the reading at the step whose `id` is `ch2`, or moves a reading there, which can take about a second.

For an animation that stays in place and shows the reading's place itself, `data-read-stage` on the `data-read` element or one around it stops the dashboard tinting the words and scrolling to each step. The button and the player then stand just below the `data-read` element, in its bottom margin.

## A piece that keeps its own controls

A piece that plays by itself, with the voice or without, can keep one set of controls for both. Code that a shape's own file gives you may already do all of this, though an older stored piece may not, so this part is for a change to that code, or for a piece written without it.

Three attributes on the page's own buttons make that one set of controls.

- `data-read-sound`, on the speaker, tells the dashboard that the page has its own controls, so it draws none. The speaker is the reader's switch: the dashboard works it and hides it where there is no voice. It keeps the speaker's `aria-pressed`, over anything the page writes there, and CSS can draw the two icons by it. Beside a `data-read-pause` or `data-read-move` it is on at first; alone it is off, and a press starts the reading.
- `data-read-pause` is on Play and Pause. While a reading is open, a press pauses or resumes the voice, or reads again from the top once all is read.
- `data-read-move` is on Back, Next and each chapter's mark. While a reading is open, a press takes the voice to the top of the step that has `aria-current="true"` and plays it, from a pause too.

No voice starts before the reader has clicked or pressed a key in the page. With the speaker on, Play, Back, Next or a chapter's mark starts it at the step that has `aria-current="true"`. If none does, Play reads from the top and a move reads nothing.

The dashboard hears a press at `#dash-root`, after the button's own `onclick`, and reads `aria-current` then, so a handler on `document`, or one that moves `aria-current` later or calls `stopPropagation()`, leaves the voice behind. The dashboard doesn't hide the `data-read-pause` and `data-read-move` buttons, and with no reading open and the speaker off or hidden their presses are the page's alone.

**One clock.** The phase appears just after the press that brings the voice, so a handler that finds none works the page's own clock. While there is a phase the voice keeps time: handlers show the chapter and move `aria-current`, and start or stop no clock. With a speaker on the page, a reading that is refused (a toast says so) or cut short just ends: the phase goes with no `ended` first, and `ended` comes in a reading only once all has been read. Whenever the phase goes, the page's script carries on without the voice from the same place, playing if the phase was `starting` or `playing` and paused otherwise. At every `ended` the script stops its clock, draws what is up whole and leaves it so.

**Stopping the voice.** While there is a phase the speaker is the reader's way to stop the voice, so the page keeps it in place: no `display: none`, `visibility: hidden` or `hidden`. It may fade as a video's controls do if any move of the pointer over the piece, any tap on it and Tab bring it back.

**When something else has the page.** While the piece plays, by either clock, the page keeps the class `vs-playing` on an element that holds the `data-read-pause` button, and takes it off at once when it stops. By that the dashboard knows to pause it while comments or a dialog is open, and as Sources opens or a figure is picked there: it pauses the voice, or presses that button if no reading is open. The page has no pause of its own for these.

**While a reader edits by hand.** The voice ends, and the dashboard pauses the piece as above. A piece on a `data-read-stage` that has played is told `ended` with no reading open, as the edit starts and whenever it plays. That lasts one microtask, so only a `MutationObserver` on `#dash-root` sees it, and what the script then draws whole is what they edit. The step on the stage that has `aria-current="true"` then shows all its sentences, except any that are `hidden`.

## Your reply

Say nothing of listening in your reply, and don't offer it, unless the person asked to listen. Many readers have no voice, and the person may be one of them, so it promises what they won't find. If they asked, say only that a Listen button, or the page's speaker, shows for readers who have read-aloud, which may not yet include them.
