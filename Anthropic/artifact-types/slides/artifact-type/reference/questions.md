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

## A deck's questions come from its source

Ask what the material leaves open, in its own terms: which thread leads
and what gets cut, what the room should do after it (decide, approve,
just know), whose voice the slides carry. Default what the setting implies
("staff meeting" → their leads, about 8 slides): audience and length are
questions only for an empty brief, the look only when no brand was given,
as two or three concrete directions. A missing number is a bracketed
placeholder, not a question.

Say they pasted their Q3 planning notes — hiring paused through Q4,
Platform and Growth merging under one lead, usage billing launching Sept
22, the SDK beta "sometime in October", three open questions at the end —
and wrote "deck for Thursday's eng staff meeting". A well-formed call:

```yaml
{"questions": [
  {"question": "Your notes give the reorg, the hiring pause and both launches equal weight. What should Thursday lead with?", "header": "Lead", "multiSelect": true, "options": [
    {"label": "The reorg (Recommended)", "description": "Launches framed as its first work"},
    {"label": "The two launches", "description": "Reorg and pause as staffing context"},
    {"label": "The hiring pause", "description": "Team-by-team impact first"}]},
  {"question": "The notes end on three open questions (backfills, on-call for the merged team, SDK pricing). What is Thursday for?", "header": "The ask", "multiSelect": true, "options": [
    {"label": "Decide them there (Recommended)", "description": "One slide per question, your proposal"},
    {"label": "Heads-up", "description": "One closing slide, owners and dates"},
    {"label": "Works as a pre-read", "description": "Denser slides that stand alone"}]},
  {"question": "The notes are blunt ("we over-hired in Q2"). Keep that voice on the slides?", "header": "Voice", "multiSelect": false, "options": [
    {"label": "Keep it blunt (Recommended)", "description": "Your phrasing, on the slides"},
    {"label": "Soften it for the room", "description": "Blunt lines move to speaker notes"}]}],
 "metadata": {"source": "artifact-questions"}}
```
