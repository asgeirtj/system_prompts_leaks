# Latency Optimization - Cutting Time per Completed Task

> **If you arrived via `/claude-api latency-optimize`:** this is the right file. Anything the user wrote after the subcommand is their request - a path, a change they want to try, a target, a question - so start from it rather than asking again; a plain-words request that led here is read the same way. Act on the request instead of summarizing this guide back to them. The goal is a shorter wait the user can trust, or a straight answer to what they asked, not a document about latency.

The six ground rules below are fixed, because they protect the result. Everything else - which changes to look at, how deep to go, how often to check in, what form the answer takes, when to stop - is the user's call. Someone who wants one question answered, one idea tried, a list of options, a link to the right page, or an unattended search is each using this guide as intended. Take the answer from what they asked; where they didn't say, do the sensible thing, say what you assumed, and carry on. Fit the work to how their project already tests and measures things.

**Ground rules.** They hold however the user wants to work.

1. **No change is called a win until the project's eval shows quality held and a measurement shows the wait fell, on this workload.** Caching, streaming and limits included: every workload differs. "Adds no cost" is about dollars, not about answers: no change is free, safe or unable to change answers until the eval says so. Without an eval, changes are proposals and timings are labeled "quality not checked".
2. **Compare within one run.** Time the current setup beside the change, on the same tasks, from the same client - never against an earlier number, because service speed drifts by the hour.
3. **Say "can't tell" when the difference is inside the noise**, and "no changes recommended" when that is the finding. Both are results.
4. **A request for changes is already a yes to edit; spending and committing each need a yes of their own.** "Make it faster", an idea to try or "find what you can" lets you edit the working tree without asking again: uncommitted, one change at a time or each as its own patch, so each can be reverted alone. A bare subcommand, a question, a request for links or "change nothing" doesn't: describe the diff and offer it. With the user away, leave the application's files as they were: make and time each change in a copy of the project in a temporary directory this session can already write to, not on a new branch, and bring every change back as a patch file, timing code included. Keep settings that are only being measured in a test runner or behind a flag, and don't commit or switch branches without asking. An edit is a proposal until it is measured. Nothing billed runs without a yes; a budget they named covers every run inside it and nothing beyond it. A yes to a sibling guide only starts it: its sign-offs and billed runs keep their own yes.
5. **Facts that can change come from a page fetched in this session** - availability, parameters, headers, limits, prices - not from this guide or from memory. Each lever names its row in `shared/live-sources.md`, and a fetched page wins over this guide.
6. **Seconds, quality and cost are reported together.** Where a result depends on paying more, show beside it what the changes that add no cost give on their own.

> **Talking to the user.** This guide is your execution plan, not a script to narrate. Keep user-facing messages short and outcome-focused: what you looked at or measured, the wait before and after in seconds, what it cost in quality or dollars, what you'd try next, a path or link to open. Don't walk the user through which step you're on, which files you're writing, or internal bookkeeping unless they ask. Follow the ground rules, don't recite them. Say what a number means for the people waiting ("the slowest 1 in 10 replies take 14 s"), and use an abbreviation such as TTFT or p90 only if the user used it first, or beside its plain meaning as in the restrictions questions. One concise update per change measured is enough; put tables and detail in a report file when the work produces one, not the chat. When you need a decision - the cost limit, which result to apply - use the `AskUserQuestion` tool rather than free-text prose: batch the decisions you need into one call - the restrictions questions in a first reply, otherwise usually one - and give each two to four concrete options with your recommendation listed first and labelled "(Recommended)" (the restrictions questions use "(Default)"); don't add your own "Other" option - the tool appends a free-text one automatically. Write what you found first, in the reply, then make the call. If `AskUserQuestion` isn't available (headless runs), fall back to one short question at a time; if the user said not to wait, state your assumption and carry on.

**Where this workflow sits**: `cost-optimize` (`shared/cost-optimization.md`) is the sibling for spend; when both matter, carry both columns in every table. "Start from what the user asked" says when to hand over to `build-eval`, `prompt-audit`, `hillclimb` or `preserved-thinking-migration`.

**Files beside this one.** Three reference files and a script sit beside this guide. Read one when you need it, not before.

| You need | Read |
|---|---|
| What a lever is, when it suits, what it risks, which docs page to fetch | `shared/latency-optimization/levers.md`, at that lever's heading |
| Once something is going to be timed: what to log, percentiles, comparing two versions, the probe | `shared/latency-optimization/measuring.md` |
| One request shape timed without running the app | `shared/latency-optimization/latency_probe.py` (how to run it: `shared/latency-optimization/measuring.md`, "The probe - timing one request shape") |
| Many changes weighed against each other on an eval | `shared/latency-optimization/search.md` |

---

## What a wait is made of

Latency is judged per completed task, on the wait the application's users actually feel. Four measures name where a wait comes from:

- **Time to first token (TTFT)** - how long after a request is sent the response starts, even when the first token is thinking. It is a floor that depends on the model, plus the time to read whatever part of the prompt isn't cached.
- **Time to first visible output** - how long before the first output a person or the application can use arrives: the first text, or the start of a tool call. When the model thinks first, it comes only once that thinking is done, whatever the display setting, so it can be many seconds later than TTFT.
- **Time to finish** (some call it TTLT) - how long until the response is complete. For an agent, the wait that matters is the whole task: every call in the loop, plus everything between them.
- **Output speed**, in tokens per second (OTPS) - how fast the response arrives between the first token and the last, thinking included.

**"TTFT" is used both ways.** Here it means the first token of any kind; many people use it for the first output after thinking, which this guide calls time to first visible output. When a user says it, see from their code or logs which of the two they time.

A task's wall-clock time decomposes, approximately, as

> **task time = calls × time to first token + output tokens ÷ output speed + everything else**

where everything else is what happens outside the model: tool execution, the network, queues, a compaction, a rate-limit retry, the application's own processing. So there are five ways to shorten a task: **fewer calls**, **a shorter time to first token**, **fewer output tokens** (thinking included, whether or not it is displayed), **faster output**, or **less time outside the model**. The equation is first-order, so it sets the order, not the verdict - a prefetch that delays the first token, or a smaller model that finishes later, shows up only in measurement.

**No lever here is free** (ground rule 1): caching's gain in seconds can be too small to see, a display setting can delay the first text, and a loop change can move seconds either way. Where the project has no eval, `/claude-api build-eval` builds one.

## Start from what the user asked

Take everything the request and the repository already say before asking anything. **From the request:** what is in scope, any change or target they named, how involved they want to be, anything they ruled out. **From the code:** where the Claude API is called; who or what waits on it; the model and settings in use; whether it streams and caches; the platform, since which levers are available differs by platform; whether there is an eval or test suite; whether calls are already timed. Where the project runs on a framework such as the Agent SDK or Managed Agents, the framework sets many of these levers, so say which ones the code controls. Say only the assumptions your answer depends on, in passing: they are not a block of their own, and not things to confirm.

**The shape of a good first reply:** what you found, or the answer to what they asked, in their words; then what you are doing next, or would do, and what it costs; then, last, what only they can decide. At most about 300 words; a list of options is a line each. Promise no seconds before something is timed.

**Read first, ask last.** Reading code and logs, fetching pages and working out where the time goes cost the user nothing and need no yes: do them before asking anything. In a terminal, a turn that ends on a question stops everything until they reply, so a default helps only if you act on it. Writing in their repository (timing code, candidate diffs) is only for users who asked for changes: ground rule 4 says who that is.

Users arrive anywhere between "I know exactly what I want to try" and "find whatever you can". Pick the lightest response that serves the request. These are starting points, not modes to announce, and people move between them mid-conversation: follow them.

| The user... | Do this |
|---|---|
| typed the bare subcommand | Don't open with questions. Do the reading and the profile first: read the code that calls the API and any timing logs, work out what people wait for and where the time goes, and come back with what you found and the two or three changes that fit, with what each risks and what measuring them would take. Describe the changes; don't make them yet (ground rule 4). Close by saying, in one plain sentence, that timing them spends real API money, with the expected cost, and asking for approval. If no code calls the Claude API, say so and ask which code they mean. |
| said "make it faster", in whatever words | The same, except that they asked for changes: make them, as ground rule 4 says, rather than asking whether to. A change that costs money is proposed with its price, not written in, until the user has chosen a cost limit that covers it. |
| named a change or an idea ("try caching and a smaller model") | That is the scope. Read those entries in `shared/latency-optimization/levers.md`, fetch their pages, say in a sentence or two whether each fits this code and what it can break, and go to "Try one change". Use the metric, percentile and numbers they gave. Mention another lever only where the time is somewhere their idea can't reach, or where their idea costs money and changes that add no cost move the same term: once, after theirs. |
| asked a question ("is fast mode worth it for us?", "we already stream and cache, what's left?") | Answer it for this code: the lever's entry, its fetched page, and what the code or logs show. The first sentence says whether it's likely worth measuring here, and why - not a verdict on something unmeasured. Put cost beside gain. After the answer, in a sentence, name at most two other changes: for a lever that costs money, ones that add no cost and move the same term (for fast mode, fewer output tokens), so that the paid one isn't the only answer; where the time is mostly somewhere their question doesn't reach, ones that reach it. For "what's left?", the other changes are the answer: list those that fit, a line each, ending with any paid lever that fits, marked as costing more. Don't re-teach what they already do, but check from the code or logs that it works (cache reads above zero, say) before looking past it. Change nothing, and start no workflow. Close with one offer to measure it, with a price; the cost-limit question comes with that offer, only if they take it. |
| wants documentation or options only ("just list the levers", "links are all I need") | Give exactly that: the options that fit their workload, usually a handful, a line each with what it risks, from "Workload shape -> lever"; or the links from `shared/live-sources.md` for the levers that fit, the **Reduce Latency** row first, with a few words each, leaving out any whose page doesn't load. No assumptions block, no questions, no edits, no runs, no plan, no closing offer. Then stop. |
| said to go on without them ("find what you can, I'm out for two hours, keep it under fifty dollars") | Ask nothing: nobody is there. A budget they named is consent up to that budget, and a time they named is a limit too. Say briefly what you'll do, which credential variable and base URL the runs use, and what they'll find. Assumptions go in the report; changes follow ground rule 4. **With an eval**, run the measured search, cut to fit (`shared/latency-optimization/search.md`, "Price it, and hold back the final re-run"): a small budget buys directions with rough sizes, so say so. **With a budget and no eval**, spend it timing the changes most likely to matter, plus the cheapest quality check the project allows (old and new outputs side by side on a sample of real inputs); label every result "quality not checked", and report directions, not wins. **With no budget**, do everything unbilled and leave the paid part as one step ready to approve. A budget for measuring is not a cost limit per task: unless they named one or said speed at any price, the limit is no extra cost ("What to ask, and when" says what that lets in; for a search, `shared/latency-optimization/search.md`, "Agree the plan"). |
| gave a target ("p90 under 10 s") | Take the metric and percentile from their words, check that the data can show that percentile (`shared/latency-optimization/measuring.md`, "Percentiles and how many tasks they need"), and start from the changes that move it. Say plainly whether each result meets it; when one does, whether to go further is their call. |
| has no eval | Say so once, plainly, and offer `/claude-api build-eval` once; on a yes, read `shared/evals/build-eval.md` and carry on with it in this session. The profile, the options and proposed diffs don't need one. List first the options least likely to change the answers (none is safe unchecked), and mark the ones that most need a quality check. Ground rule 1 holds: nothing is called a win, and no seconds are quoted as a gain unless measured. If they can't build one now, suggest the cheapest check they would accept (old and new outputs side by side, say) and respect the answer. Whether to ship an unchecked change is their decision: make the diff if they ask, and the "quality not checked" label travels with the diff, the report and any commit message. |
| runs traffic nobody waits on | Say so, and point to `cost-optimize` and the **Batch Processing** row. |
| asks whether the prompt itself can be shorter or cleaner | Answer for this code first: what the prompt holds, what could go, and which part of the wait a shorter prompt moves (the Input tokens entry in `shared/latency-optimization/levers.md`). Where the prompt text itself is the lever, run the `prompt-audit` subcommand (`shared/prompt-audit.md`) on that prompt as part of this answer: its pattern tables and keep list are the reference for instructions that are dated, repeated or contradict each other. Read only and ask nothing: none of its billed checks, and not its full report or diff. Fold its findings into the answer briefly - where, which pattern, what you'd do - and describe each edit like any other change here: a proposal until ground rule 1 is met. |
| has settled the model and effort and wants to work on prompt wording | Answer for this code first: where wording can shorten the wait, and where it can't (the Output tokens entry in `shared/latency-optimization/levers.md`). Then offer `/claude-api hillclimb` (goal "Cut latency") once: it tries wordings against the project's eval. On a yes, read `shared/evals/eval-hillclimb.md` and carry on with it in this session. With no runnable eval, the "has no eval" row comes first. |
| says caching isn't working, or suspects the code changes earlier turns | Read the loop and say what you find: whether a cache breakpoint is set, and whether anything edits, trims or reorders earlier messages, `system` or `tools` between calls. If nothing does, say so. If something does, say where, and offer `/claude-api preserved-thinking-migration` once. On a yes, read `shared/preserved-thinking-migration.md` and carry on with it in this session. |

## What to ask, and when

**Up front: restrictions, and little else.** Beyond the restrictions questions, a first reply carries none or one decision, counting each thing the user has to decide and not each numbered item, and only what the request and the repository leave open. It goes last, after what you found, and no reading, fetching or profiling waits on it: state the default and start. Money is the exception: the default for a spend is always "nothing billed". An offer to measure is a plain sentence. Now and then, ask which workload they mean.

**Ask about restrictions once, as multiple choice.** After the findings in the first reply, make one `AskUserQuestion` call with up to four questions. A request to approve a spend comes after the answers, priced on them, and ends the turn: printed ahead of the call, it never gets a reply.

Use these questions and options as written, with the first option labelled "(Default)":

- **Can cost per task go up?** *No extra cost*: Total cost per task stays at or below today's. Paid options count only if savings elsewhere cover them. *Up to double today's cost*: Total cost per task stays within twice today's. *No cost limit*: Latency is the priority, whatever it costs per task.
- **How much can quality drop?** *No drop*: Tests every change that fits. Only keeps those that score at least as well as today on your eval, allowing for normal run-to-run noise. *Allow a quality drop*: Also keeps faster changes that score lower, as a smaller model or lower effort might. Reports each one's score and time beside today's. You pick what to apply. With no eval, skip this question and say instead: "No eval, so quality can't be checked. I'll label results 'quality not checked'."
- **Which latency metric matters most?** *Time to last token, TTLT*: How long until the full task is finished, including every model call and tool run. *Time to first output, TTFT*: How long until the first text or tool call appears, after any thinking. Best when someone watches it stream. Put the one that fits this application first; the second is this guide's time to first visible output.
- **Which requests?** *Typical, p50*: The middle request: half are faster, half slower. *Slow, p90*: The slowest 1 in 10. *Slowest, p99*: The slowest 1 in 100. Needs many tasks to measure reliably.

Leave out any question the request already answers, and any the code settles beyond doubt. A user can state a numeric target or anything off limits in the free-text answer. Don't ask if the user wants documentation only or has gone away. If they asked a question, including "what can I do?", answer it first and in full, and ask only once they want something measured or changed; where the tool isn't available, state the defaults and carry on.

**What "no extra cost" means.** The limit applies to total cost per task, not to each change. A paid lever may be tried under it when it is paired with savings that could bring the total back to today's cost or lower, such as a smaller model or fewer output tokens. Try only the most promising pairings, inside the approved testing budget. A pairing counts only if its measured total stays within the limit and quality holds. Otherwise, describe the lever with its price.

**When limits conflict.** If little can be gained within the user's limits, or a target can't be met within them, say so plainly and show what relaxing each limit would buy, measured where the budget allowed it and otherwise labeled an estimate. Never relax a limit on your own: that is the user's call.

**When an answer doesn't fit the data.** Use the user's choice, and say plainly what can and can't be shown: a p99 from a few dozen tasks is only a hint, and first-output timing means little in an app that doesn't stream until it does.

**Defaults, stated as assumptions.** The wait that usually matters, by kind of application:

| Kind of application | The wait that usually matters |
|---|---|
| A chat or agent whose user wants the finished result | The whole task's time |
| A voice turn, or a chat that streams | Time to first visible output (for voice, the first text: a tool call isn't speech) |
| A machine caller with a deadline | The whole call at a high percentile, against the deadline |
| A job with a finish time | The whole job's wall-clock time at production's concurrency |

The rest: the typical wait (the median) and no target, unless they spoke of slow outliers, a deadline or a target.

The two tables below list moments, not a questionnaire: most conversations reach two or three of them.

**Ask, because it needs their yes:**

| When | Ask | If unanswered |
|---|---|---|
| Before the first billed run | Timing changes spends real API money: state the expected cost (from the logs' or the code's token counts and the fetched **Pricing** row; "estimated" is an acceptable first answer) and get the user's approval before running it. Offer this in one plain sentence at the end of the reply, not as a menu or a clickable question. If they approve, recommend the cheapest run that can answer the question and state in one line what will run, how many requests, roughly how long, and the credential variable and base URL it will use, checked against the application's own config or code, since the shell may hold Claude Code's own. A user who already named a budget gets only that line. For several runs, get one budget approved, not a yes per run. An unattended user gets the same details in the plan you state before they leave, and if the code doesn't settle which credential and base URL the application uses, that run doesn't happen. If the user declines the spend, carry on with estimates. | Nothing billed |
| When a lever that costs money is about to be measured (fast mode, pre-warming, a longer cache duration, keep-alives, hedged requests, concurrent subagents, a larger model or a higher effort level) | The cost question above, if it is still unanswered, with today's cost per task and what the lever would add, from its fetched page. If its limit is already set, ask nothing more: say whether the lever fits, with its price. | No extra cost. Paid levers are still described with their price, as "above your cost limit" (where the limit is this default and not theirs, the label says so), not dropped |
| At the end, with the numbers | Which result to apply | Nothing applied |

**State as an assumption and carry on; ask only if the code makes it doubtful:**

| What | Assume |
|---|---|
| Anything that looks owned or pinned (a prompt someone owns, a model pinned by contract) | Left as it is, and named with the first change you propose |
| The quality bar, when a change that can alter answers is about to be judged | The answer to the quality question; unanswered, its default: no worse than today, within the noise. Where a drop is allowed, the floor is a number the user gave, else the eval's passing score |
| The worst acceptable value of a second wait they watch (the first visible output, say, while the whole task is being shortened), when a candidate moves it the wrong way | No worse than today |
| How often to check in, when the work will run longer than one round | Until done |

**Fetching.** Fetch a lever's row in `shared/live-sources.md` before stating its availability, a parameter, a limit or a price, and the **Pricing** row before any dollar figure. Fetch the pages you need in one batch, alongside reading the code, not one at a time. A bare list of options states none of these, so it needs no fetch; a list of links checks only that each page loads. If a fetch fails, say so. Where the lever's entry names another file of this skill for those facts (`shared/prompt-caching.md`, say), use it and label its facts "cached, not verified". Otherwise state no figures: size the change as largest / medium / small. When the user is exploring, asks what's left, or wants a search, also scan for levers newer than this guide (`shared/latency-optimization/levers.md`, "Levers this file doesn't name").

## Find where the time goes

Three sources, cheapest first:

- **The application's own timing logs, unbilled**: per-call timestamps and `usage` objects, rolled up per task. If the repository shows none, say in one line that the user can share logs for real numbers, as an aside rather than a question, and don't wait for it; timing code you add goes in the eval's runner, or behind a flag where the app has no logging of its own. How to read them: `shared/latency-optimization/measuring.md`, "Reading a profile through the equation".
- **The code, unbilled too**, and the only source for the structural facts no log shows. Read the request-building code and the agent loop for what each call sends and whether it is cached, how many calls a task makes and what happens between them, what the model writes (thinking included), and what the user sees meanwhile. The left column of "Workload shape -> lever" is the checklist.
- **A timed baseline run, billed**, so it waits for a yes.

**Offer streaming where it fits.** If the code doesn't stream and someone watches the response arrive, offer streaming among the changes you propose, saying that it shortens the wait people feel more than the total time. Don't raise it for a caller nobody watches.

**Keep different kinds of traffic apart.** Where the code has more than one, such as an interactive path and a nightly job, profile, rank and report each separately: one blended number misleads. With one kind, say nothing about this.

**Name the largest term of the equation, with the evidence.** An estimate must not look like a measurement: seconds come only from timing; otherwise size a change as largest / medium / small (`shared/latency-optimization/measuring.md`, "Sizing a change before measuring it").

**Where the complaint is slow outliers, first find out why the slow tasks are slow**: the typical wait and the slow tail respond to different levers (`shared/latency-optimization/measuring.md`, "Match the change to the percentile").

## Workload shape -> lever

Most levers won't earn a place on a given workload: a short list with reasons beats a complete one, and the user's own interest is reason enough to put a lever on it or leave one off. A paid lever that fits keeps its line, marked as costing more, with its price wherever prices are being stated (from the fetched **Pricing** row): hidden is as wrong as pushed. Each name in brackets begins a heading in `shared/latency-optimization/levers.md`.

| Where the wait is | Reach for | Skip it or watch out when |
|---|---|---|
| A long prompt read again on every call | Prompt caching, static content first (Prompt caching); then trim or defer what the task doesn't use (Input tokens) | On a short prompt the gain in seconds can be too small to see, even where the cost saving is large; anything dynamic above the breakpoint reads cold |
| The first request after a quiet spell | Pre-warming, a longer cache duration, keep-alives (Prompt caching) | All three are billed; steady traffic or a short prefix gains nothing |
| Many model calls in one loop | Prefetch what the application already knows, return more per call, move steps to code, programmatic tool calling (Agent-loop efficiency) | A prefetch can delay the first visible output; bigger pages add input tokens |
| A long, growing conversation uploaded again on every call | Message threads, on top of caching (Message threads) | One-call tasks; code that rewrites history; a workload that needs context editing or compaction |
| Time between calls: slow tools | Run independent read-only calls concurrently, start them as they finish streaming, cache repeats, add timeouts (Agent-loop efficiency) | Tools with side effects or an order; near-instant tools |
| Independent subtasks run one after another | Subagents side by side, each with its own model and effort (Agent-loop efficiency) | Each reads its own context, so cost can rise; requests sent together don't share a cache |
| Long visible output | An output shape, structured outputs, no commentary between tool calls (Output tokens); then faster output, which costs more (Fast mode) or changes the model (Model selection) | A shape can cut content the task needs; in an agent, shorter replies change what happens next |
| Thinking is most of the output | Lower effort, per message where turns differ (Effort); no thinking at all, as the steepest trade (Thinking off) | A direct capability trade; often moves the typical wait more than the slow tail |
| Silence before the first visible output | Streaming, the thinking display, a status line or a spoken holding phrase (What the user sees while waiting); no thinking up front (Thinking off) | They change how long the wait feels more than how long it is; a display setting can delay the first text |
| A model larger than the task needs | Model and effort, swept together on the eval (Model selection, Effort) | A faster model isn't automatically a faster task; moving is a migration |
| A few tasks far slower than the rest | Find out why first ("Find where the time goes"): limits and signals for long work, hedged requests for variance, retry settings, rate-limit headroom and compaction off the user's path for stalls (Limits, retries and hedges) | A stop that fires costs an answer; a hedge adds a second attempt's cost for each task that reaches the deadline |
| A job that must finish sooner | Independent tasks run concurrently, several items per request (Agent-loop efficiency) | Rate limits become the bound; packing changes what the model reads |
| Nobody is waiting | Not this workflow: `cost-optimize` and the **Batch Processing** row | |

## Try one change

- **Read its entry and fetch its page** (ground rule 5).
- **Pick the cheapest route that can see it**: the whole eval for anything that changes what the model sees or writes across a task; one request shape, with the probe, for caching, a shorter prompt or a per-call setting; the logs for changes that act on the shape of traffic; a count on recorded runs for a limit (`shared/latency-optimization/measuring.md`, "The cheapest route that can see a change"). A timing says nothing about quality, so a change timed on one request still meets the eval before it is called a win.
- **Run the current setup and the changed one in the same run**, on the same tasks, interleaved, from a client that sees what production sees, with the cache warm (`shared/latency-optimization/measuring.md`, "Comparing two versions").
- **Enough repeats to see the noise.** On the eval, run the current setup twice: the gap between its two runs is the noise. A difference inside it is "can't tell", which isn't "no change". Where the budget can't hold that on the whole eval, use a slice of it, and call the result a direction, not a number.
- **Report before and after, as ground rule 6 says**, with how many tasks and runs stand behind them. One run is indicative, and say so.
- **Several changes:** each alone against the current setup, then the ones that helped together, since effects don't simply add. If many levers compete, or model and effort are in play, offer `shared/latency-optimization/search.md`.

## What to hand back

Match the form to the request: a paragraph for a question, links for links, a short before-and-after for one change, a report file for anything with tables.

**Whenever a lever that costs money was measured, lead with two results side by side**: the best at no more than today's cost, and the best within the user's cost limit. Each shows seconds, quality, cost per task and how many runs stand behind it, and under each, what every kept change contributes: its own measured ratio where each change was measured alone, labeled so; after a search, how the result moves when that change alone is removed. No billed run is made just to fill in the report. The first shows what the changes give with no money added; the gap between the two is what the extra dollars buy. Where one configuration is both, say so; where a target was given, say whether each result meets it. Recommend one and say what would change the choice; the user decides.

**Report skeleton** (section order - keep the rest flexible):

- **Today's speed** - from logs, or "not measured yet"; a timed run measures it beside each change
- **Results**
- **What was assumed** - scope, the wait and percentile, quality bar, cost limit, platform, where and when the baseline was measured, pages opened and when
- **Where the time goes**
- **What was tried** - the options looked at, and what happened with each
- **What's left, and the next step**

**Changes come as one diff per change**, so each change's effect can be told apart, each tagged *measured* (timed, and checked on the eval) / *proposed* / *quality not checked* (timed at most), and committed only on the user's word.

## Failure modes to avoid

These are the ways latency work tends to go wrong. You have latitude in how you run the process above; you do not have latitude to fall into these.

- **Interrogating.** Asking what the request or the code already answers, asking everything up front, or packing several decisions into one numbered item.
- **Offering a default, then waiting for an answer.** If a default is good enough to offer, act on it: no reading, fetching or profiling waits on a reply. Only a spend waits.
- **Running the whole procedure at someone who asked one question or brought one idea**, or steering them off it. Answer the question; try their idea first, and if the time is somewhere it can't reach, show that with a number.
- **Narrating the machinery.** Step names, file names, or this guide's working words in the chat.
- **Calling a change free or safe.** "Adds no cost" is about dollars, not about answers (ground rule 1). Say "least likely to change the answers", and what would check it.
- **Leading with the paid lever.** A faster, dearer configuration reported without the no-extra-cost result beside it hides what the other changes did.
- **Hiding what wasn't tried**, or padding the list with what doesn't matter. Report the handful of things that bear on the decision, and say what is untested.

## Sources and live references

Each lever's page is the `shared/live-sources.md` row named in its entry in `shared/latency-optimization/levers.md`.

The published cookbook: [Latency optimization on the Claude API](https://platform.claude.com/cookbook/latency-optimization-latency-optimization).
