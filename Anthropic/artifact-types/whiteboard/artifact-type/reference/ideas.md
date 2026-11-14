# Offering ideas for a board

**Read the board fresh before anything here** (`get` `board/meta`, `list` `elements` with `query: {limit: 1000}`), however you last saw it; if you have just done so, don't repeat it. People add to a board while you are away: one that you made or left empty may be full by now. If it is still empty there is nothing to offer options for: say so in a sentence, change nothing, and say what you would put on it first if the chat or its title shows what it is for; if not, ask what it is for, as SKILL.md says to ask.

Otherwise, when the person asks what you would do with the board, what could come next, or for options for what is on it, offer an idea: a small mark on the board, shown to them alone, that opens into your sentence and a menu of 2 to 4 options. Pointing at an option shows it on the board, to them alone; a click puts it on the board, for everyone; a second click takes it off, while it is still ticked. In that turn change nothing on the board (no element, `board/meta`, claim or comment), and ask them nothing, by a form, a question tool or in words: the options are the question. A plain order ("group these", "add three risks") and an ask for content to put on the board ("ideas for the offsite") are not this kind of ask: carry them out as ever. Never offer an idea unasked.

Write ONE document, in the person's private corner of this board's store, which nobody else can read: `set` `data/users/me/idea`.

```jsonc
{ "says": "Two of these risks have no owner yet.",
  "about": ["e2", "e4"],
  "read": [ { "id": "e2", "type": "note", "x": 0, "y": 300, "w": 180, "h": 180, "color": "yellow", "size": "body", "text": "SSO slips", "tilt": -2, "author": "Priya", "authorId": "u_41" },
            { "id": "e4", "type": "note", "x": 400, "y": 300, "w": 180, "h": 180, "color": "pink", "size": "body", "text": "Docs late", "tilt": 1.5, "author": "Jonas", "authorId": "u_77" },
            { "id": "e1", "type": "text", "x": 0, "y": 240, "text": "Risks (draft)", "size": "large", "color": "ink" } ],
  "options": [
    { "label": "Give both an owner", "why": "clear who acts; the names are my guesses",
      "edits": [ { "id": "e2", "text": "SSO slips\nOwner: Priya" }, { "id": "e4", "text": "Docs late\nOwner: Jonas" } ] },
    { "label": "Set the open ones apart", "why": "what needs a decision stands out; the heading goes",
      "edits": [ { "id": "i1", "type": "container", "x": -24, "y": 596, "w": 628, "h": 228, "text": "No owner yet" },
                 { "id": "e2", "y": 620 }, { "id": "e4", "y": 620 }, { "id": "e1", "remove": true } ] } ] }
```

The example shows the form, not what to offer: what suits this board is yours to find.

- `says`: one plain observation about their work, not about you and not a question, at most 160 characters.
- `about`: the ids of what the idea is about: its mark stands by them. Left out, the mark stands by what the options touch.
- `read`: every element that some edit changes or removes (not the arrows that go with a removal), as you have just read it: its `id` and its whole document, every field copied. They may open the idea hours later. When they click an option, the page compares each element with this copy and skips edits to anything changed since; a field that you leave out counts as changed, so that edit is skipped too. Leave alone any element too large to copy.
- `options`: 2 to 4. `label`: all they read of an option, so it must say what the option is for, as a headline would, at most 60 characters, each different. `why`: the gain and the price, a few words each, at most 160; it isn't shown, but screen readers read it out.
- `edits`: what a click on the option does, at most 60 edits and 24 KB per option. Each is one of three:
  - **a new element**: `type`, its fields as SKILL.md gives them (but no `href`), and a new `id`: `i` and a number above every `i` number on the board, a different one in every option. A shape, section, text, arrow, pen line, table, drawing or embed, with at most 4 embeds per option. An arrow may join new and old ids.
  - **a change**: the `id` of an element on the board, and only the fields that change, out of `x`, `y`, `w`, `h`, `text`, `label`, `size`, `textAlign`, `wrap`, `color`, `stroke`, `hollow`, `kind`, `dash`, `head`, `heads`, `from`, `to`, `fromSide`, `toSide`, `bends` (`null` drops a field). A table's cells, an embed's html and a picture's src can't be changed.
  - **a removal**: `{"id": …, "remove": true}` and nothing else. Its arrows go with it.  
  One bad edit, a change with a field that is not listed, or an id named twice in one option's edits loses that whole option.
- The document and its options hold no other field, and the whole document stays under 64 KB. Every option starts from the board as you have just read it, not from the option before it.

Options are there to widen the person's thinking, so make them differ widely, each another kind of thing: a flow they can click through, a drawing (made as SKILL.md says), notes turned into a diagram or a table. Several may be on at once, so what one option adds stands clear of what the others add. A click on one option takes off any other that changes the same element, so make such options clearly different. Make each whole and tidy, and put the likeliest first.

The page removes the document once they clear the idea, after 30 minutes in sight unless their menu is open, or at once if it cannot read it. If an idea of yours is still up, `get` it and `set` again with its version (`if_version`): yours takes its place. `delete` withdraws it. Either takes effect once their menu is shut, and leaves on the board what they have clicked. If they answer in the chat instead ("go with the first"), do that work on the board, unless a click has already done it, and `delete` the idea.

Reply in a sentence or two, saying that an idea is waiting at its mark on the board. Don't list its options.

If the write is refused for any other reason than a missing version (from some chats only the board's owner can write), don't try again, and write it nowhere else: say so in a sentence, and give the options in words.
