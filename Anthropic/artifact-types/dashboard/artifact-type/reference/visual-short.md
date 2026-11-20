# Visual short

A Visual short is a dashboard that plays, for people who would rather watch than read. It tells one finding in a few chapters on one stage, with nothing around it. Each chapter is a drawing that builds while a caption says what it shows, and the whole piece runs a minute or two. It works when one idea is on screen at a time and each mark arrives with the words that name it.

`artifact-type/reference/visual-short-skeleton.md` (HTML and CSS) and `artifact-type/reference/visual-short-script.md` are working code for what follows. Read both before you write, and start from them; what is left is the piece itself.

## Chapters

The script finds elements by class name and pairs them in order: each `.vs-ch` with one `.vs-cap`, one `.vs-mk` and one scene. An empty `.vs-say` in each chapter keeps a row under the headline for the caption to lie over. Without it the caption covers the drawing. A chapter's label names its `.vs-mk` button and, on a wide stage, shares a line with the controls, so every chapter, the title too, has a short one.

The first chapter is the title, which says what the piece is, the period it covers and how long it runs. The piece rests on it, whole, and a thumbnail shows it too. It plays only when someone presses Play or picks a chapter, with the voice or without: motion nobody asked for distracts, and no voice can start before a press. What is faded in the last chapter stays faded, since it stays up when the piece ends.

A waiting chapter is faded with `opacity`, since under `display: none` its drawings measure 0 wide and its marks go unchecked. It is also `aria-hidden` and takes no pointer. None of that stops the keyboard, so nothing in a chapter takes focus: no link, control or `tabindex`.

The dashboard pauses the piece when someone opens Sources, picks a figure there or comments, and has each chapter stand whole while they edit by hand, so the script has no pause of its own for these.

## Drawings and motion

The dashboard compares each rendered mark that names one value with its data, at any opacity and at any moment, so such a mark holds its real value from the first draw. Drawings are made whole, and scenes only style them, but for a number that counts up: that is an unmarked `aria-hidden="true"` copy, a drawing of its own, laid over the marked one, which shows again once the count ends; `count` in the script does this.

Each chapter is a function of its own time `t` in seconds, whole at `t` = `Infinity`, so it can be held, replayed or jumped to. A CSS animation, a transition or a timer can't be, since the engine doesn't know of it. A scene takes each time from `cue(i, word)`, the moment the caption reaches that word, so motion follows the words and, where there is one, a voice's pace. With no voice, a chapter lasts a second for every 15 characters of its caption, plus one. Under `prefers-reduced-motion` the script draws each drawing whole and only the fade moves, while the sentences take their turns. Motion written anywhere but in `scenes` would still play.

A scene sets state such as `class` and `style`, and writes no text or element outside a drawing. Any text or element written under `#dash-root` has the dashboard check every mark again, so a drawing's text is written only when it changes, as `write` in the script does.

The stage is a container, so sizes inside it are in `cqi` (`max(14px, 2cqi)`). Nothing above the page is one, so outside `.vs` `cqi` is the window's. `.vs-draw` is a container of both its sizes. Inside it `cqh` and `cqi` are 1% of its height and width and `1em` is the size of the labels on the marks, and a drawing sized from those fills it, where a fixed number of pixels doesn't. The skeleton sizes only the caption and the drawing. A headline that your CSS doesn't size is 14px, smaller than the caption on a wide stage. `max(18px, 3.4cqi)` suits it, 12cqi a big number and `max(11px, 1.3cqi)` the source line. The longest bar leaves room for its value.

Values are labeled on their marks. Where they don't all fit, the chart gets axis numbers. Every chart gets a tooltip, inside its drawing. A bar or dot painted with `background` vanishes in forced colors unless it has `forced-color-adjust: none` and a system color there, as the skeleton's chapter marks have.

## Captions

Each sentence is its own `.vs-s` span and shows alone, in a row two lines high (three on a narrow stage). One that needs more lines lies over the drawing; under about 100 characters it doesn't.

Captions are hidden by `opacity` alone, so that a screen reader and a voice still get every word. Both lose the words under `display: none`, `visibility: hidden`, `hidden` or `aria-hidden`, and under `display: none` or `hidden` a figure in the caption goes unchecked too. A sentence the data rules out is the one that gets `hidden`: the script leaves it out of the timing and a voice doesn't read it.

Every number in a caption is marked and filled from the data. Words in the HTML reach everyone who opens the dashboard and never change, while each reader's page runs a live query with that reader's own access, unless someone shares its connector. A typed number could show a figure to someone with no access to it, or contradict their own, and it would go stale. A word that turns on the data (up, down, more) is filled too, from a `dash.calc`. What you type is the gist, which holds whatever the numbers turn out to be. A Visual short usually tells of a period that has ended, and unless its queries pin their dates, the numbers move on and the words don't. A certified query keeps its mark whatever its filters are set to, and loses it if its call changes. So its date is pinned by its date filter's value in `dash/params`, which the page first runs with unless a script sets another. One with no date filter can't be pinned, but a query of your own beside it can, and isn't certified.

By default a caption rounds its figures while the stage shows the exact ones. A mark that shows $100 for 102.08 differs from its data, so the rounding is a `dash.calc` and the caption's mark names it (`said` in the script). A calc can return words too ("almost half"), which the dashboard can't check.

## What makes a good one

Suggestions, which give way to what the person asks for.

**The piece.** On the title, the one figure the story turns on can stand under a headline, and how long the piece runs is worked out from the captions, not typed, so it stays true as they change. The last chapter is what to do next, and reads best ending with every mark at full strength, since it stays up. The stage stands alone: tiles, filters, tabs, tables or text around it pull the eye from what is playing.

**A chapter's frame** is the same each time, so only the content changes: a small uppercase label for the part of the story, a one-sentence headline that states the finding and not the topic, one drawing, and a small muted source line (measure, who, dates).

**The drawing** is the one that shows the sentence. A share of people: a 10 by 10 grid of dots that fills, then recolors. A total: one big number that counts, with what made it up beside it. A comparison: horizontal bars from zero, slightly rounded. A gap between two: two bars and a bracket naming the gap. A run of chapters that are all bars is a sign another drawing would fit somewhere. It fills its box, which is most of the stage: bars share its height, each row 100cqh over their number with some air around the bar, and stay bars where they are few; columns stand its full height, less their labels; a dot grid is the largest square it holds, `min(100cqh, 100cqi)` a side. What can't fill the box sits in its middle.

**How marks arrive.** Bars grow from zero, a value fades in once its bar lands, dots come in a quick wave. Quick and eased out (`d3.easeCubicOut`) feels right; camera moves, 3D and bounce pull the eye from it. Marks are `--cds-chart-muted` first, with one accent color on what the sentence is about. To focus, fade the rest rather than add a color, since another color reads as another meaning.

**The words.** A caption is one paragraph of a few short sentences, since a chapter lasts as long as its caption. It is written as if said aloud, with no symbols a voice would trip on, and each sentence reads well around a filled figure. The figure is rounded as a person would say it ($100 for 102.08, 1,900 for 1,937), with "about" before it where it helps. A caption can also leave the number out and let the stage show it.

## The voice

Some readers have a voice that reads the captions; many don't, and the piece plays whole without it. It reads only the captions, so each caption says what its chapter shows. The skeleton marks them to be read, and `lang` on their holder, `.vs-caps`, names the language they are written in. Whatever else is in it is read aloud too, and words in `[brackets]` are shown but not said, so a caption has none. The skeleton's controls and script already follow the voice: read `artifact-type/reference/read-aloud.md` before you change either.

## Telling the person

The person will want to know that Play starts the piece, and how long it runs. A reply mentions the voice only if the person asked to listen.

## A retired player

A page whose `.vs-controls` holds a `data-read-play` button has a player that is no longer made. Whenever you change such a page and it stays a Visual short, read the skeleton and the script, swap in their controls, CSS and engine, and keep the page's chapters, captions, calcs, `fmt`, drawings and `scenes`.
