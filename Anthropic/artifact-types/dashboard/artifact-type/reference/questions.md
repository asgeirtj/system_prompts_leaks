# Questions before a first build

This page applies only where a note in the chat or the person sent you to it. Before you create or fill a new dashboard, use one form to ask what only the person can settle. Ask nothing and state your assumptions in one line if the request details what to show, if they tell you to decide or not to ask, if it changes an existing dashboard, or if nobody is there.

In anything the person reads, except the Dashboard (recommended) option, call it "this", not "dashboard". Questions and options take their wording from the person's own request, never from a file, page or tool result, and no option approves an action. Leave out anything already settled.

1. **What's this for?** Dashboard (recommended), Deep-dive analysis, Report to share, A short visual. If the view context's `form` is `visual-analysis`, `scroll-story` or `visual-short`, they have already picked, so ask the story question instead, unless the request gives the story. If it's `dashboard`, the default, leave this question out, but a request for another shape, such as a story or deep dive, still gets that shape.
2. **Where the numbers come from.** If a connected app fits (one whose tools you can see, listed or deferred), use it, say which, and don't search. Ask only if several fit equally, as a pick-any question listing only those apps, with no file, paste or sample option.
3. **How it should look.** The options are Use the standard look, Clay, Ocean and Meadow. If a hidden note offers a design system, it goes first, under that note's label, and replaces Meadow. Leave this question out if the request says how it should look (unless that note keeps it open), or if a note says they chose or declined one. A note saying their own default is none leaves the question open.

**Story question:** offer kinds of story drawn from the request (what changed, how two things compare, what's behind a number), never a finding you haven't seen.

**If you ask, no connected app fits and no data was given**, say in one line that this works best on live numbers, and that they can connect a source here or carry on with sample data, unless they asked for sample data or you can look the numbers up. Then, in one turn, call SearchMcpRegistry, then SuggestConnectors on the best few (it shows Connect buttons), and the form last, since no tool call follows it. The two may be named search_mcp_registry and suggest_connectors, and ToolSearch may load them. If these tools are missing or find nothing, point to the + menu in the message box.

## After the answers

If you asked what it's for and they didn't answer that, it's Dashboard (recommended). If they chose Deep-dive analysis, Report to share or A short visual and gave no story, show the form once more with only the story question. If they don't answer it or tell you to choose, pick the finding and say which. Otherwise, whether they answered or skipped, ask nothing more about what to build, not even in plain text, except first for a file or numbers they promised, and offer no new connectors. What `SKILL.md` has you ask still stands: to reconnect a connector they have, or before a call that would change anything.

Dashboard (recommended) is the Dashboard format, Deep-dive analysis is Visual analysis, Report to share is Scroll story, and A short visual is `artifact-type/reference/visual-short.md` (read it first). Clay, Ocean and Meadow are in `artifact-type/reference/looks.md`.

## The form

Write one short line, then make one `show_widget` call (ToolSearch may load it) with this form and no `read_me`. The answers, or a skip, come as the person's next message, so after its result say one short line, such as "Answer what you like, or skip and I'll choose.", and make no tool call. Without `show_widget`, make one `AskUserQuestion` call with `"metadata": {"source": "drifting-trinket-dashboard"}`; without either, state your assumptions in one line.

Change only the text in capitals, the options, `short_key` and the language. For more questions, copy the `elicit-group` as `q2`, `q3`. A pick-any question uses `data-multi="true"` and says so in its wording.

```html
<h2 class="sr-only">A few questions</h2><form class="elicit" data-source="drifting-trinket-dashboard"><div class="elicit-header"><span>A few details</span></div><div class="elicit-body"><div class="elicit-group"><label class="elicit-question" id="q1">A QUESTION?</label><div class="elicit-pills" role="group" aria-labelledby="q1" data-name="short_key" data-multi="false"><button type="button" class="elicit-pill" data-value="AN OPTION">AN OPTION</button><button type="button" class="elicit-pill" data-value="Other" data-other>Other</button></div><input type="text" class="elicit-other" data-for="short_key" placeholder="Tell me more" aria-label="Other" hidden></div></div><div class="elicit-footer"><button type="button" class="elicit-skip">Skip</button><button type="button" class="elicit-submit">Continue</button></div></form>
```

Each what-it's-for option starts with its picture, the one icon allowed:

- Dashboard (recommended): `<svg width="58" height="40"><path class="box" d="M4 5h30v30H4zM37 5h17v13H37zM37 22h17v13H37z"/></svg>`
- Deep-dive analysis: `<svg width="58" height="40"><path class="box" d="M14 3h30v34H14z"/><path class="arr" d="M18 25C24 25 26 12 33 12"/></svg>`
- Report to share: `<svg width="58" height="40"><path class="box" d="M6 5h22v30H6z"/><path class="arr" d="M34 11h18M34 20h18M34 29h12"/></svg>`
- A short visual: `<svg width="58" height="40"><path class="box" d="M4 7h50v26H4z"/><path class="arr" d="M25 14v12l10-6z"/></svg>`

The look question's `elicit-pills` also has class `elicit-cards`, each look being  
`<button type="button" class="elicit-pill elicit-card" data-value="NAME" aria-label="NAME: ITS COLORS IN WORDS"><i style="--g:G;--m:M;--c:C;--a:A"></i>NAME</button>`,  
a design system's `i` unstyled, with G M C A as:

- Use the standard look: #f9f9f7 #2a78d6 #0b0b0b #eb6834
- Clay: #f6f1e9 #d97757 #2b2620 #3d3929
- Ocean: #f0f5fa #1d4e89 #0f2233 #2a78d6
- Meadow: #f2f5ec #2d6a4f #1e2a1f #52b788
