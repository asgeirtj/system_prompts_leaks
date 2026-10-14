# Ask before you build

Only with the `AskUserQuestion` tool and a person there to answer;
otherwise (a headless run, an agent caller, "just make it") do what SKILL.md
says: decide, build, and state your assumptions in one line.

Read what they gave you first. A brief that still leaves two or more
result-changing decisions open earns ONE `AskUserQuestion` call of at most 4
questions before your first write; one point you can default, a full brief
or a small revision earns none.

Write the questions from their material, not from a form: name what you
read ("your notes cover four things"), the tension or gap in it, and the
decision that would most change what you build, most decisive first — a
question only someone who read their brief could ask. Never ask what the
chat already answers; default what the setting implies and say so; stock
intake questions (audience? length? screens or prototype?) only for a
genuinely empty brief.

The options are the real work: 2–4 concrete directions for THIS piece
("lead with the reorg", not "narrative"), each differing on an axis you can
name, never shades of one idea; labels of a few words that carry the
choice; a `description` of a few words, omitted where the tool marks it
optional; your pick first, marked "(Recommended)", none on questions of
fact. `"multiSelect": true` by default, since people answering are often
still exploring; `false` only when the options exclude each other (one
length, one format). No "Other" or "you decide" options (the card adds
"Other" itself), and no question whose only answer is free text.

Tag every call `"metadata": {"source": "artifact-questions"}`.

Treat the answers as decisions and restate them in your one-line
assumptions; whatever they leave to you, decide and say what you picked.
One more round (at most 4 new questions) only if they ask for more (in
chat or under "Other") or an answer opens a question you could not have
asked before; otherwise build. Never re-ask.

## Questions for a canvas

Ask what the page, app or PRD they gave you leaves open for THIS
design: which job the screen does first when it could do several, who
lands on it, what in their product to reuse or break from, which
differences between artboards would help them choose. They name a product
but attached nothing? Ask for it (a link, a screenshot) rather than design
blind. Nothing to match and no look implied? Offer two or three concrete
directions, or let 2–4 low-fi artboards ask it. Screens or prototype: settle
by signal (SKILL.md); with none, pick one and say so.

Say they linked their app's Projects page — dense 13px tables, a "New
project" button top-right, an Import from GitHub flow two tabs over in
Settings — and asked for "a better empty state for teams with no projects
yet". A well-formed call:

```json
{"questions": [
  {"question": "New project already sits top-right and Import from GitHub lives in Settings. What should the empty state push people toward?", "header": "Main path", "multiSelect": true, "options": [
    {"label": "Starter templates (Recommended)", "description": "Three cards fill the empty table"},
    {"label": "Import from GitHub", "description": "The Settings flow surfaces here"},
    {"label": "Invite teammates", "description": "An inline invite field"},
    {"label": "New project, centered", "description": "The existing button, moved center"}]},
  {"question": "The page is all-business (tight tables, no illustration anywhere in the app). What may the empty state add?", "header": "Feel", "multiSelect": true, "options": [
    {"label": "Stay in system (Recommended)", "description": "Your table's type, one line icon"},
    {"label": "One warm moment", "description": "A small illustration, only here"},
    {"label": "A sample row", "description": "A faint example project row"}]},
  {"question": "A new team hits two more empties right after this one (Members, API keys). Cover them so they read as a set?", "header": "Scope", "multiSelect": false, "options": [
    {"label": "Projects only (Recommended)", "description": "Three artboards of this screen"},
    {"label": "All three empties", "description": "One direction carried across them"}]}],
 "metadata": {"source": "artifact-questions"}}
```
