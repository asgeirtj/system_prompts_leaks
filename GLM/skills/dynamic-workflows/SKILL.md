---
name: dynamic-workflows
description: "Use when writing, debugging, or resubmitting a dynamic-workflow script for the CreateWorkflow tool: choosing subagent topology, typing subagent results, fanning out over files or git, gating loops on world.run commands, testing pieces with EvalWorkflowSnippet, planner-reviewer loops, confirming findings before reporting them, report() salvage, the report shape a run returns, publishing artifacts the user opens, leaving typed holes to fill mid-run, and handling a backgrounded run."
when_to_use: "Only for CreateWorkflow scripts. A single delegation or a few independent lookups belong to the Agent tool instead."
---

# Writing dynamic workflows

This skill is the whole authoring contract for `CreateWorkflow`. The tool descriptions are
short on purpose; the facade the compiler checks against, the rules a script must satisfy and
the fields each tool takes are in §16, and `CreateWorkflow`, `AmendWorkflow`, `FillWorkflowHole`,
`SaveWorkflow` and `EvalWorkflowSnippet` refuse to run until this skill has been loaded. The
rest is the judgment layer: how many subagents a request deserves, which of them should share
a context, what each one should hand back, and how to keep the run's work from dying with the
run.

Two names collide in this codebase. `CreateWorkflow` is the dynamic-workflow tool and the
only one this skill is about. The legacy `Workflow` tool and `/expert` are a different,
older feature that happens to share the word.

## The bar: first-class, expert-level work

A workflow exists to produce first-class, expert-level work — the deliverable a senior
practitioner would hand over after doing the job properly, not a faster draft of what one
reply could have said. A user who asks for a workflow is paying for that depth, and every
choice in this skill serves it: enough subagents to actually cover the ground, fresh eyes
on every plan and every draft (§3), an independent confirmation of every finding,
deterministic checks wherever a command can decide, and a report that says what was
verified, what was not, and what it all means.
Depth is measured by what is at stake, not by how many subagents re-read the same work:
verification goes where a wrong claim would cost the user something, and each piece of work
gets the one check that decides it. When a shortcut and the expert's way disagree, take the
expert's way; trim the work only when the task is small, and trim the checking when a wrong
claim costs little or a command has already decided it.

## 1. Is this the right tool, and how big should it be?

| The request | The tool |
| --- | --- |
| One thing delegated to one agent | `Agent` |
| A few independent lookups, nobody reading anybody's answer | `Agent`, in parallel |
| Anything else the user did not name a workflow for, however many steps it needs | `Agent`, or do it yourself |
| The user said "use a workflow" / "使用 workflow" / "用工作流" — any phrasing naming workflow as the means | `CreateWorkflow`, mandatory, even if `Agent` would have done or one reply could answer |

**Only an explicit request starts a workflow.** A workflow begins with `/workflow` or with
the user naming workflow/工作流 as the means, never with your own judgement that a task
looks orchestration-shaped. Results feeding later steps, a bounded loop, a branch on a typed
result — those are shapes the script is good at once one has been requested, not reasons
there should be one. Delegate with `Agent` or do the work yourself.

**An explicit request is binding.** Once the user names workflow/工作流 as the means, the
routing question is closed — not `Agent`, not inline, not "too small for a workflow"; what
remains is only how big the script should be, and the smallest task gets a small workflow.

An explicit workflow request is a request for depth, and the bar above is the measure.
Default to the thorough shape — a fresh subagent per unit of work, a deterministic gate
wherever a command can decide, an independent confirmation of every finding the user will
act on as fact (§10) — sized to the stakes: a bug the user will fix on your word gets a
confirmer; a poem or a survey gets a reader at most. Every task is a full model session, so
put sessions where they raise confidence, not where they repeat each other: "review the
changed files" wants a reviewer per file plus a confirmer per finding; "write me twenty
poems" wants twenty poets and no confirmers.

**Write only as much of that shape as you know for sure.** Where a later stage depends on
what an earlier one finds, write up to that point, end in a hole (§15), and let the findings
write the rest. Guessing a topology is not depth.

## 2. Subagent topology

This is the decision that separates a good script from a bad one. It is made twice: now,
for what the request already tells you, and at a hole (§15), for what only the run can tell
you. This section is about the first, in four parts.

**Fresh subagent per item, or one shared subagent?** Every `agent()` call creates a new context.
Sharing a context means sharing the *variable*:

```ts
// Independent: each judge sees only its own item. Runs concurrently.
items.map((i) => agent(`judge-${i.id}`).ask<Verdict>(`Judge ${i.id}`));

// Calibrated: one context sees every item in sequence, so its later verdicts are
// consistent with its earlier ones. Asks on one subagent queue FIFO — this serializes.
const judge = agent("judge", "You rank consistently across a whole batch.");
items.map((i) => judge.ask<Verdict>(`Judge ${i.id}`));
```

Independent is right for unrelated items; shared is right when the answers must be
consistent with each other, at the price of serialization. Hoisting the `agent()` call out
of a loop for tidiness turns a fan-out into a queue, and nothing rejects that script.

**A name is an identity, and it has to be unique.** No two subagents in one run may share a
non-empty name — a duplicate fails the run. One fixed name inside a fan-out is a duplicate
per item, so write `` agent(`judge-${i.id}`) ``; the compiler catches the literal form, a
name built at run time costs you the run. Anonymous is always safe.

Names are worth giving anyway: a **revised** re-run finds its cache by them (§13),
importing every ask whose instructions did not change at zero tokens. Anonymous subagents
start empty.

**Persona, frozen at creation.** A persona stacks on the harness's own subagent contract —
citing `path:line`, never reporting a check it did not run, saying what it could not do,
escalating instead of faking — so write the role and the standard of judgement and leave
those rules out. Every subagent has the same tools; what it may do with them is said in the
ask: a reviewer that must not touch the code is told "do not edit any file".

**Per-subagent model**, only when asked or a light tier is obvious (judges, routers):
`agent("judge", { model: "GLM-5.3-Flash" })`, ids from `ListModels`. A literal or a `model()`
ModelRef; to route, map the router's typed key to a `model()` table (`patterns.md` #13).

**Where each item goes next.** A run with more than one stage is a pipeline: an item leaves
its stage as soon as it is done, and the next stage takes it while the rest are still being
worked on. Decide this at every hand-off when you lay out the topology, and let a stage wait
for all of its items only where the next step needs every one. §7 says how to write each case.

**Loops.** Bound every loop with a round cap, and carry the feedback forward:

```ts
let feedback = "none";
for (let round = 0; round < 5; round++) {
  const plan = await planner.ask<Plan>(`Plan the fix. Previous critique: ${feedback}`);
  const review = await reviewer.ask<Review>(`Critique this plan: ${JSON.stringify(plan)}`);
  if (review.approved) return plan;
  feedback = review.feedback;
}
```

Reuse the same two subagents across rounds: a subagent asked again keeps its context, so
round five is cheap. Reuse costs freshness — by round three the reviewer is anchored on its
own critique — so add an independent one at the end (§3).

**No nesting.** Subagents cannot call `CreateWorkflow`; model a big sub-task as more subagents
here.

## 3. Fresh eyes

The author of a plan or a draft cannot see its gaps, because they filled them while
writing. A reader with a separate context has no such fill, so the gaps show. That is the
whole method, and it applies at every stage *inside* the workflow where something is
drafted — a plan, a fix, a finding, the final report. It pays most on plans, which are
cheap to critique and expensive to execute wrongly.

Four rules make the eyes actually fresh:

- **Separate context, not a second opinion from the same head.** An independent reader is a new
  `agent()` that has seen nothing but the draft. Every planner–reviewer loop keeps a
  persistent reviewer for continuity (§2), and then puts the final draft in front of a
  reviewer that has never seen an earlier round.
- **Ask for failures, not approval.** "Is this good?" gets a yes. "What would break this?
  What is missing? Restate the plan in your own words" gets findings. Write the ask so
  that approving takes evidence and objecting is the easy move.
- **Give the eyes the same evidence.** A reviewer judging a plan about code from its text
  alone can only judge coherence: tell plan reviewers to read the files the plan touches,
  and not to edit them.
- **Give a prose deliverable an independent read.** When the deliverable is text nothing else
  checked — a guide, an analysis — hand it, before the script returns, to a reader-proxy
  subagent asked what is unclear, what the text fails to support, and what the user will ask
  next; then fix those. Say it judges from the text alone — checking claims is a confirmer's
  job. A report whose
  findings were each confirmed (§10) has had its eyes; add no reader on top.

Three cautions. Correlated reviewers add little — same model, same prompt, same blind spots
— so give each a distinct lens. Bound it: one deliverable gets one mechanism — a plan a
reviewer who reads the code, findings a confirmer, prose a reader; two is the ceiling, with
a reason you can say. And these rules are about the subagents *inside* the script, not a gate
on submitting it: read your own script once against the request, and at every `Promise.all`
ask whether the next step needs every item; where it does not, pipeline it (§7). The
confirmation window then puts the plan in front of the user.

## 4. Typed results

Pass a type argument to `ask` whenever your control flow will branch on the answer; leave it
off when you just want prose back. The type must be an interface or type alias you write in
the script.

**JSDoc on a property becomes the field description the subagent actually reads.** This is the
cheapest quality lever in the whole surface and the easiest to skip:

```ts
interface Finding {
  /** Workspace-relative path the problem is in. */
  path: string;
  /** One sentence: what is wrong, not how to fix it. */
  problem: string;
  /** How much it matters. Reserve "high" for data loss or a crash. */
  severity: "low" | "medium" | "high";
}
```

Without the comments you get whatever the subagent guessed `severity` meant.

Keep results narrow: a result crosses a schema boundary and gets interpolated into the next
prompt, so a wide one costs tokens twice. **Pass paths, not file contents** — a subagent has
its own file tools; a stringified 4000-line file spends tokens on what it could have read.

## 5. Getting the world in

`files.glob` and `git.changedFiles` are how a script learns what to fan out over; both are
executed by the harness, recorded, and replayed on resume.

Caps **reject rather than truncate** (§16.2), so narrow the pattern instead of fanning out
over a silently partial view. Reads are catchable, so a coarser fallback is a `catch` —
which `git` needs, since every `git` call rejects outside a repository:

```ts
let paths: string[];
try {
  paths = await git.changedFiles("origin/main");
} catch {
  paths = await files.glob("src/**/*.ts");
}
```

Reach for `files.read` or `files.grep` only when the *script itself* must shard or branch on
content; reading files is subagent work.

**`world.run` is the deterministic gate.** When a check is fixed and machine-checkable — the
build passes, the proof checks, the tests are green — run it as code and branch on the exit
code, instead of asking a subagent to run it and trusting the claim:

```ts
const check = await world.run("lake", ["build"], { timeoutMs: 1_800_000 });
if (check.exitCode !== 0) feedback = check.stderr;
```

A nonzero exit code is a **value**, not an exception: read `exitCode` and carry `stderr`
forward as the next round's feedback, with no `catch`; rejections are for the world failing
to answer (spawn failure, timeout, output over the cap). The command name must be a
compile-time string literal, because the user approves the script's command set at
confirmation: interpolate paths, flags and round numbers into the **args array**, never into
the command. Open-ended editing belongs to a subagent; `world.run` is for checks your
control flow branches on.

**Choose the gate before you write it.** A gate decides exactly as much as the check it
runs. Before the first `world.run`, find out what checks the repository has — `package.json`
scripts, `Makefile` targets, the CI config, the README's "run this to verify" line — and
rank them by how much they decide: a unit suite decides less than an end-to-end suite, which decides less than
the acceptance command the README names, and none decides a performance request the way
the bench does. Then build the gate in two tiers: the fast tier may drive a loop's rounds;
the **strongest** tier the request implies decides the exit and runs for real at least once
before the final `return`, even when the fast tier said yes. Give a slow tier the
`timeoutMs` it needs; a faster substitute is a different check.

```ts
phase("Fix until the unit tests pass");
for (let round = 1; round <= 5; round++) {
  const unit = await world.run("npm", ["test"]);
  if (unit.exitCode === 0) break;
  await fixer.ask(`The unit tests failed:\n${unit.stderr}\nFix them.`);
}

phase("Run the end-to-end suite once before handing over");
const e2e = await world.run("npm", ["run", "e2e"], { timeoutMs: 1_800_000 });
const verified = e2e.exitCode === 0;
```

A check that exists in the repository and did not run is not "not covered"; it is
unverified work (§10).

## 6. Test the pieces before you commit

A workflow script is final at submit. The fixed logic inside it does not have to be: run it
through the `EvalWorkflowSnippet` tool first (§16.6), synchronously and without persisting
anything. What passed there pastes into the workflow verbatim. Send the snippet
as `code`, or as `path` to a file holding it — the second try then costs an `Edit`.

Snippet work is the non-subagent part: what a glob really returns, whether a grep pattern
overruns its cap, how `world.run("lean", ...)`'s stderr parses, whether a gate predicate does
what you meant. A snippet has `files.*`, `git.*`, `world.run` and `log`, but no `agent()`.
Once you know which check decides the result (§5), run it once here too: that shows its
output, whether it exits nonzero as you assumed, and how long it takes — the `timeoutMs` you
write, not a guess.

## 7. Pipeline by default; join only where the next step needs every item

A workflow with more than one stage should run like a pipeline: every stage works at the
same time, and each item moves on the moment it is ready. A reviewed file goes to its
confirmer while the other files are still being reviewed; a fact goes to its checker while
the researchers are still reading. Write it this way wherever the next step can take items
one at a time, which is nearly every hand-off. Let a stage wait for all of its items only
where the next step needs every one: a deduplication across files, a ranking on one scale, a
synthesis. Those are the barriers, and a script has few of them.

`Promise.all` is a join, and a join is a barrier: nothing after it starts until the slowest
item before it has landed. Parallelism comes from *not awaiting yet*:

```ts
// Concurrent: nothing is awaited until the join.
const all = await Promise.all(
  paths.map((p) => agent(`reviewer-${p}`).ask<Review>(`Review ${p}`)),
);

// Serial: each await blocks the next call. Only write this when you mean it.
for (const p of paths) results.push(await agent(`reviewer-${p}`).ask<Review>(`Review ${p}`));
```

**Decide, at every hand-off, how an item leaves its stage:**

| The next step takes | The stages | Write |
| --- | --- | --- |
| one item at a time | one to one: a reviewer per file, a confirmer per finding, a migrator per file and a checker per file | the stages chained per item inside one fan-out, one join at the end |
| one item at a time | a pool of shared workers serves a stage; items are still being found while the next stage works; a later stage sends work back; the stages read better as separate blocks | a `channel` between the stages, a `future` per stage |
| every item at once | deduplication, a ranking on one scale, a synthesis, the final report | a join, with a comment saying what needs every item |

**Chaining.** When two stages map one to one, a barrier between them makes every worker of
the second stage wait for the slowest worker of the first while the run's concurrency slots
sit idle. Chain the stages per item inside the fan-out instead, and join once at the end:

```ts
// One join: each file's findings go to their confirmers the moment its review lands
// (two Promise.all — review every file, then confirm every finding — is the barrier).
const confirmed = (
  await Promise.all(
    paths.map(async (p) => {
      const review = await agent(`reviewer-${p}`).ask<Review>(`Review ${p}`);
      return Promise.all(
        review.findings.map((f, i) => agent(`confirmer-${p}-${i}`).ask<Confirmation>(`Reproduce: ${JSON.stringify(f)}`)),
      );
    }),
  )
).flat();
```

A shared, calibrated subagent is not a barrier: asks on it queue first in, first out, so feed
it each item as it lands and it stays consistent while the pipeline keeps moving (§11).

One rejection inside `Promise.all` rejects the whole join and the sibling results with it.
When one bad item should cost one item, catch inside the callback (examples #3) or use
`Promise.allSettled` and read each outcome.

**Channels.** Chaining covers stages that map one to one. It cannot write a stage served by a
pool of shared workers, a producer still finding items while consumers work, stages laid out
as separate blocks, or a feedback loop to an earlier stage. For those, a `channel<T>()`
carries items between two stages and each stage is a `future(async () => { … })`. An item
sent into the channel is taken by the next stage at once, by a worker that is waiting for it
or by a new one started for it:

```ts
const facts = channel<Fact>("facts");
const verified: Fact[] = [];

const research = future(async () => {
  phase("Research the topic from each angle");
  try {
    await Promise.all(
      angles.map(async (angle) => {
        const found = await agent(`researcher-${angle}`).ask<Research>(`Research ${angle}.`);
        for (const fact of found.facts) facts.send(fact);
      }),
    );
  } finally {
    facts.close(); // the producer side owns the close; a failed researcher still ends the stream
  }
});

const verify = future(async () => {
  phase("Check each fact as it arrives");
  await Promise.all(
    [1, 2, 3].map(async (k) => {
      const verifier = agent(`verifier-${k}`);
      for await (const fact of facts) {
        const verdict = await verifier.ask<Verdict>(`Does this hold? ${JSON.stringify(fact)}`);
        if (verdict.holds) verified.push(fact);
      }
    }),
  );
});

await Promise.all([research, verify]); // start every stage, then join once
```

The rules, in the order the code reads:

- **A stage is a future.** Its marker first, then the workers (a `Promise.all` over K
  `for await` loops on the input channel), then the output's `close()` in a `finally`. Start
  every stage, then join all of them once with `Promise.all`, with no `await` between: while
  you await one stage, a failure in another has no listener and surfaces as an unhandled
  rejection instead of failing the run with its error.
- **A channel where the next stage should start before the previous one ends; a join where it
  needs every item.** Never a channel between two stages that need a barrier.
- **A new subagent per item inside a consumer is a `future` inside the `for await`**, pushed
  into an array and joined before the stage ends (examples #6); without that join the stage
  ends when the channel closes with checks still running, and nothing reports it.
- **A cycle is counted.** A feedback channel (a verifier sends a doubtful fact back for more
  research) has no single producer who knows when it is done, so keep one count of open work
  items: increment *before* finishing the item that produced the new work, close the feedback
  channel when the count hits zero, bound the loop with a depth field on the item
  (`patterns.md` #12).
- **Pools trade cache reuse for consistency.** A pool of shared workers (`verifier-1…3`
  above) judges on one scale, but which item lands on which worker depends on timing, so an
  amendment that changes one upstream item misses the cache for the whole pool; a fresh
  `verifier-${fact.id}` per item misses only itself. `send` never waits (the buffer is
  unbounded); a channel nobody can send to any more fails the run as `ChannelDeadlock`.

**Keep the data flow visible.** The harness recovers the dependency graph by reading your
code before it runs: plain variables, template interpolation, destructuring and small local
helpers are traced exactly; a result stashed in a container or behind an indirection earns a
diagnostic.

## 8. Group the run into named phases

Phases are required. The user experiences a workflow through its phase graph: the
confirmation dialog is drawn one node per phase, and thirty step cards is a dialog nobody
reads. Cover the whole script — every stage gets a `phase("...")` marker at its head; the
arrows between phases are inferred:

<!-- compile -->
```ts
interface Attempt {
  /** One sentence: the optimization this round is trying. */
  approach: string;
}

/** Total nanoseconds the bench reports, or Infinity when it printed none. */
function benchNanos(output: string): number {
  const match = /time:\s*([\d.]+) ns/.exec(output);
  return match?.[1] === undefined ? Number.POSITIVE_INFINITY : Number(match[1]);
}

phase("Measure today's baseline");
const baseline = await world.run("cargo", ["bench"], { timeoutMs: 1_800_000 });
const target = benchNanos(baseline.stdout);
const optimizer = agent("optimizer");

let winner = "none";
for (let round = 1; round <= 3; round++) {
  phase("Make one improvement");
  const plan = await optimizer.ask<Attempt>(
    `Round ${round}. Baseline timings:\n${baseline.stdout}\nMake one improvement.`,
  );

  phase("Check that the tests still pass");
  const check = await world.run("cargo", ["test"]);
  if (check.exitCode !== 0) continue;

  phase("Measure whether it is actually faster");
  const bench = await world.run("cargo", ["bench"], { timeoutMs: 1_800_000 });
  if (bench.exitCode === 0 && benchNanos(bench.stdout) < target) {
    winner = plan.approach;
    break;
  }
}

phase("Collect the final numbers");
const head = await world.run("git", ["rev-parse", "HEAD"]);
return { approach: winner, commit: head.stdout.trim() };
```

Five nodes, with an arrow back from the bench to "Make one improvement" — and still five
when the real script grows to thirty steps: the user sees the story instead of a wall of
cards.

The unit tests are the fast tier that drives the rounds; the bench is the check the request
was about, and it decides every round that survives them, not once at the start (§5).

**Write the names for the user, not for the graph.** A phase name is a short natural
phrase saying what this stage accomplishes for the user, written in the language the
user is speaking in this session — "Research each changed file in parallel",
"汇总并产出最终报告" (§9). Names are compile-time string literals, so you cannot number
rounds by interpolation, and should not want to: two markers with the same name are one
node, so a loop body stays one box across its rounds.

**Put the marker where the steps are.** A marker claims the rest of the block it sits in,
nested blocks and inlined helper calls included, so mark the block where the `ask` and
`world.run` calls actually live.

**Not inside a concurrent fan-out callback.** Twenty `map(async …)` callbacks re-entering
`phase("Review")` out of order would count every re-entry as a round. A per-item pipeline
(§7) is one phase named for what it does to each item, with the markers at the top level
around it.

**One marker at the head of each stage's future.** Concurrent stages written as futures (§7)
each open their body with their own `phase("...")`. Stamping is lexical — a step gets the
phase the analyzer places it in, not the marker the engine passed last — so two stages
running at once keep their own steps; still no marker in the per-item callback or the
`for await` body.

**Every phase must contain at least one `ask` or one `world.run`.** Plain script logic —
reading `args`, shaping a prompt, building the `return` — shows no progress, so it is not a
stage: fold it into the phase before or after it, and open none for the setup at the top,
the `return` at the bottom, or a branch that only narrates with `report` and `log`.

## 9. Write for the user

Six things you write are read by the user, not by the script: phase names, subagent names,
`log` lines, artifact titles and the markdown you publish, the four report fields, and any
question a subagent escalates. Write each one as you would tell a colleague across the desk
what is happening: what the work is, in the user's words and language. The machinery —
fan-out, gate, node, stage, pipeline — is yours, not theirs, and so is the numbering.

| Read by the user | Write | Not |
| --- | --- | --- |
| Phase name | Review each changed file / 逐个检查改动的文件 | Fan-out review stage / 文件评审阶段 |
| Phase name | Check that the tests still pass / 确认测试仍然通过 | Gate: test verification / 执行测试验证任务 |
| Subagent name | Code reviewer / 代码评审员 | reviewer_2 / 节点3 |
| Subagent name | Benchmark runner / 跑基准测试的人 | runner / 子代理A |
| Phase name | Independent review of the final plan / 请没看过方案的人再审一遍 | Cold read of the plan / 冷读方案 |
| Subagent name | Independent reviewer / 独立评审员 | cold-reviewer / 冷眼评审 |
| `log` line | Reviewing 12 changed files / 正在检查 12 个改动的文件 | Fan-out sized: n=12 / 扇出阶段初始化完成 |
| Report conclusion | Two of the twelve files have real bugs, both in the parser. / 12 个文件里有 2 个有真问题，都在解析器里。 | The workflow executed successfully and produced findings. / 工作流已成功执行并生成结果。 |
| Artifact title | Review report / 评审报告 | report-artifact-v1 / 产物输出 |
| Escalation question | Should the threshold be 94 rather than 96? / 阈值应该是 94 而不是 96 吗？ | Requesting clarification regarding gate configuration parameters / 请求对门控配置参数进行澄清 |

The method names in this skill — fresh eyes, independent read — are idioms for you, not
words for the user: in Chinese that is 独立复核 or 换人复审, never 冷读 or 冷眼.
The language travels through your asks: findings and summaries are written by subagents
answering the ask you wrote, so write asks in the user's language, or say which language to
answer in; otherwise a Chinese report arrives wrapping English findings.

## 10. Verify, report, deliver

`log(...)` is narration for the human watching the run: after a fan-out is sized, at the top
of each loop round.

**Verify before you report, in proportion to what a wrong claim costs.** Verification
exists to buy down the cost of the user acting on something false, so it goes where that cost
is real: a bug they will fix, a security claim, a number they will quote, a fact a decision
rests on. Each finding of that kind is confirmed independently before it reaches the user: a
second subagent that reproduces the finding from its evidence alone — reading the code,
running a check when one decides it, never editing — or a `world.run` command when one can
decide. The reviewer that found it does not confirm it. A finding that fails confirmation
is **kept and labelled** `unconfirmed`, never silently dropped — a real issue the confirmer
could not reproduce is still worth a human's eyes, and the label tells the user "seen" from
"suspected".

Three things that look like verification and are waste. A confirmer on a finding a
`world.run` already decided: the exit code is the confirmation; record the command in
`verified`. A confirmer on work nobody will act on as fact — poems, brainstormed options, a
first-draft survey — which gets at most one independent read (§3). A suite run three times
because the hunter, the confirmer and the gate each ran it: a gate runs once, by the script,
and the asks say so ("the script runs the full suite after you; do not run it yourself").

**Gate at the task's scale.** `verified` names the commands that actually decided the
result, and the reader holds them against what they asked for. A unit suite in `verified`
and the end-to-end suite in `notCovered` is an unverified deliverable with a disclosure
attached. `notCovered` is for what *could not* be checked — no test exists, the environment
lacks the tool, the check needs something only the user has — never for a check that exists
and was skipped because it is slow. If the strongest check the request implies exists and
did not run, the run is not done: run it, or say in `conclusion` that the work is unverified
and why (§5).

**Salvage by report.** `report(...)` is not `log`: reported items are delivered with the
completion notification **even when the run fails**, which is how a run that dies on its
twelfth task keeps eleven tasks' worth of work. Report each finding the moment it lands —
after its confirmation, with its status — rather than accumulating an array to return at the
end: the array is what you lose. Items are recorded, so a resumed run never shows one twice.

**Deliver a report.** The script's final `return` is the handoff the main agent presents,
in the order below; what the user themselves keep is the artifact of the next section.
Return this shape (copy the interfaces; they compile as-is) rather than a bare array:

<!-- compile -->
```ts
interface Finding {
  /** Workspace-relative path, with a line when it applies: "src/a.ts:42". */
  where: string;
  /** One sentence: what is wrong, or what was found. */
  what: string;
  /** What showed it: the lines read, or the command and the output that proved it. */
  evidence: string;
  /** "verified" when an independent subagent or a deterministic check confirmed it; "unconfirmed" when confirmation failed or was not attempted. */
  status: "verified" | "unconfirmed";
  /** How much it matters. Reserve "high" for data loss, a crash, or a wrong result. */
  severity: "low" | "medium" | "high";
}
interface WorkflowReport {
  /** Two or three sentences answering what the user asked for. */
  conclusion: string;
  findings: Finding[];
  /** What the run checked and how: the commands it ran, the files it covered. */
  verified: string[];
  /** What the run did not look at or could not check, and why. */
  notCovered: string[];
}

const result: WorkflowReport = {
  conclusion: "Nothing was reviewed: this snippet only shows the shape.",
  findings: [],
  verified: [],
  notCovered: ["everything — no subagent ran"],
};
return result;
```

Each field has a reader. `conclusion` is the answer to what the user asked. `findings` carry
their evidence and their status, so the user can tell what was seen from what was suspected.
`verified` says what this run actually checked and how — the commands it ran, the files it
covered. `notCovered` says what it did not look at and why, which is the difference between
"we found nothing" and "we looked nowhere". Write all four in the language the user is
speaking in this session.

**Deliver artifacts.** The `return` is read by the main agent, which retells it. `artifact.*`
is the other channel: things the *user* opens, shown as cards beside the run while it is
still going and kept after it ends. Two habits:

- **Every run publishes its deliverable.** When the user asked for a thing — a webpage, a PDF
  — a subagent writes it into the workspace and returns the path ("write it to `out/…` and
  return the path" belongs in the ask), and the script publishes it with `artifact.file`;
  until it does, nothing the run left in the workspace exists for the user. When the user
  asked for an answer — findings, a review — the `return` is the compact handoff and the
  deliverable is the long form of the same facts: markdown built from the values the return
  is built from, published once, at the end. The exception is a run whose whole answer is a
  line. With more than one artifact, mark the deliverable `{ primary: true }`: the completion
  card, the run pane and the notification lead with it. One primary per run.
- **A dashboard is for the person watching the run.** Declare one when the run has state worth
  watching while it runs — the key number after each round, which items are done or failed:
  metrics or a chart for a number, a table or board for items with a status. Declare it once
  at the top, then tag the items you already report: `report(item, "perf")`. It is a
  projection of that stream, so it grows live and survives a resume. A run that is over
  before anyone would look needs none.

**Show what matters.** Two tests decide what earns a card: would the user open it on its
own (else it is a section of the deliverable), and does it repeat another artifact (a CSV and
a table of its rows, a report and a copy of it — one of each pair is noise). The common run
publishes one deliverable, one dashboard when there is something to watch, and further files
only when a subagent produced something else a person opens.

Ids and the report tag are compile-time string literals: what a run can publish is fixed
when the user approves the script, and an id assembled at runtime is a compile diagnostic.
Publishing an id a second time mints the next version and keeps the old one.

**A rejected publish is a repair opportunity, not an error to swallow.** Content publishes
reject catchably — the file is missing, the path escaped the workspace, the bytes are over the
cap — and the honest response is to hand the gap back to a subagent and publish again, rather
than let a run end with nothing the user can open:

<!-- compile -->
```ts
interface RoundOutcome {
  /** 1-based round number. */
  round: number;
  /** Query latency in milliseconds, measured after this round's change. */
  queryMs: number;
  /** One sentence: what this round changed. */
  change: string;
}

const TARGET_MS = 20;
artifact.chart("perf", {
  title: "Query latency by round",
  x: { field: "round", label: "Round" },
  y: { field: "queryMs", label: "ms" },
  baseline: { field: "target" },
});

phase("Optimize until the bench meets its target");
const optimizer = agent("optimizer", {
  system:
    "You speed up a JSONL query engine: change one thing, measure it, and write the profile " +
    "of the query path to out/profile.html.",
});
const rounds: RoundOutcome[] = [];
for (let round = 1; round <= 3; round += 1) {
  const outcome = await optimizer.ask<RoundOutcome>(
    `Round ${round}: make the query faster, then measure it.`,
  );
  rounds.push(outcome);
  report({ ...outcome, target: TARGET_MS }, "perf");
  if (outcome.queryMs <= TARGET_MS) break;
}

phase("Hand the user the profile and the write-up");
try {
  await artifact.file("profile", "out/profile.html", { title: "Query profile after the last round" });
} catch {
  const profiler = agent("profiler");
  await profiler.ask("out/profile.html is missing. Profile the query path as it stands and write the profile there.");
  await artifact.file("profile", "out/profile.html", { title: "Query profile after the last round" });
}
const latest = rounds[rounds.length - 1]?.queryMs ?? 0;
await artifact.markdown(
  "report",
  [
    `# Query latency: ${latest}ms against a ${TARGET_MS}ms target`,
    "",
    ...rounds.map((r) => `- Round ${r.round}: ${r.queryMs}ms — ${r.change}`),
  ].join("\n"),
  {
    title: "Optimization report",
    description: `What each of the ${rounds.length} rounds changed and what it bought.`,
    primary: true,
  },
);

return {
  conclusion: `Latency landed at ${latest}ms against a ${TARGET_MS}ms target.`,
  verified: ["each round's latency was measured by the subagent that made the change"],
  notCovered: ["memory use; only query latency was measured"],
};
```

One `report` call feeds both surfaces: the tagged item lands on the chart *and* in the run's
results. Three cards, none repeating another: the chart is what the user watched, the profile
is what a person opens, the report is what they keep; the CSV the bench wrote stays in the
workspace, since its rows are the chart's points.

## 11. A complete example

The complete review workflow that used to sit here — a reviewer per changed file, triage
through one shared subagent that is fed as reviews land, a confirmer per kept finding chained
inside the same callback, one join for the cross-file deduplication — is
`${ZCODE_SKILL_DIR}/examples.md` §5; §7 and §10 carry its rules. The open-ended form — a
seed that surveys and ends in a tail hole, grown fill by fill — is `examples.md` #7 (§15).

## 12. Anti-patterns

| What you wrote | What it costs you |
| --- | --- |
| One subagent hoisted out of a fan-out for tidiness | The fan-out became a FIFO queue (§2) |
| One fixed name for every subagent in a fan-out | A literal duplicate fails compile, a computed one kills the run; name per item or stay anonymous (§2) |
| A fresh subagent each loop round | Round five re-learns what round four knew, at full price (§2) |
| An unbounded `while` | The run dies on a cap instead of finishing (§2) |
| Findings accumulated in an array, returned at the end | A failure on the last task loses them all; `report` as you go (§10) |
| A whole file interpolated into a prompt | Tokens spent on what the subagent's own tools read; pass the path (§4) |
| A wide `files.grep` with no glob | The call rejects; there is no partial result (§5) |
| A subagent asked to run the tests and say if they passed | A session paid for what `world.run` decides as code, and a claim it can fake (§5) |
| A `world.run` command name built at run time | Compile fails: the command is a literal; runtime values go in the args array (§5) |
| The gate written from habit, or only the unit tests gated | The project named a stronger check; survey its checks, and run the strongest one before `return` (§5) |
| A workflow submitted to see whether a parse function works | A full run for what `EvalWorkflowSnippet` answers now (§6) |
| An unguarded `.find()` / `.match()` result or optional property | Compile fails under `strict`; plain `items[i]` needs no guard (§16.3) |
| `Date.now()` / `Math.random()` / `fetch` / `fs` | Compile fails: a replayable run cannot contain them |
| An `await` per item in a loop with no ordering need | Serial wall-clock for concurrent work (§7) |
| A stage that waits for the whole previous stage though it handles items one at a time | Every worker of the second stage waits for the slowest of the first while slots idle; chain per item, or use a channel (§7) |
| A join with no comment saying what needs every item | On the next revision nobody can tell the barrier from a habit; say why, or pipeline it (§7) |
| A channel nobody closes | `ChannelDeadlock`; the producing stage closes it in a `finally` (§7) |
| An `await` between starting the stage futures and joining them | A stage failing while you await another has no listener: an unhandled rejection, not a failed run; start all, then join once (§7) |
| A shared pool where per-item names were wanted | One changed upstream item misses the cache for the whole pool (§7) |
| Phases or subagents named after the machinery ("fan-out", "文件评审阶段", "节点3"), or no markers | A graph that says nothing about the work, or thirty cards (§8, §9) |
| A reviewer asked "is this good?" | It approves; ask what would break it (§3) |
| A reviewer loop, a final reviewer, a confirmer and a reader on one deliverable | Four sessions re-reading one piece of work; one mechanism, two with a reason (§3) |
| Findings reported unconfirmed, or a slow existing check put in `notCovered` | The user cannot tell "seen" from "suspected", or verified from skipped (§10) |
| A confirmer on a finding `world.run` already decided, or the suite run by hunter, confirmer and gate | One check paid three times; the exit code is the confirmation (§10) |
| A bare array returned, or nothing published | The main agent improvises the handoff and the user keeps nothing; return the report shape and publish the deliverable (§10) |
| A CSV and a table of its rows, or a dashboard nobody watches | Cards that are noise (§10) |
| A persona that says only "make the check pass" | Faking is the obedient reading of an impossible gate; tell it to escalate (§14) |
| A tunable constant interpolated into an ask | Amending it rewrites every such prompt and re-pays everything downstream (§13) |
| A wrong run left to finish, or stopped and left | `AmendWorkflow` it now, while it runs (§13) |
| A revised script pasted inline after a diagnostic | Twenty thousand tokens re-streamed to change one line; `Edit` the named file and pass `path` (§13) |
| A hole for what an `if` or a subagent could decide, or one in a fan-out callback | A run parked on you for nothing; the fan-out case does not compile (§15) |

## 13. After you submit

Compilation happens first. **Diagnostics mean nothing ran**, and they name the file your
script is in: an inline `script` is written under `.zcode/workflow-drafts/` before it is
compiled and the response hands you the path; a `path` submission is that file already. Each
diagnostic reads `{path}:L{line}:C{column} {message}`, counted in the file.  
**Edit that file and resubmit with `path`. Do not paste the script inline again**: the
`Edit` costs a few lines; the re-stream costs twenty thousand tokens and may stall the
provider. (If the response names no file, resubmit inline.)

On a clean compile the run starts in the background and you get a run ID. **Do not poll it.**
The completion notification arrives on its own with the final return value and every
reported item. Do other work, unless the user asked you to wait.

When you genuinely need to look at a run:

- `TaskOutput` blocks until a run *this session started* finishes: the waiting tool.
- `GetWorkflowRun` is an instant snapshot; use it when you must not block, or for a run
  another session owns, which `TaskOutput` cannot see.
- `ListWorkflowRuns` enumerates the project's runs, including other sessions'.

Read the terminal state precisely. A run ends in exactly one of three states:

- **completed** — the script returned.
- **errored** — the script itself failed (an uncaught throw, a cap it overran, an artifact
  whose source file was missing). Replaying it would fail the same way, so
  `ResumeWorkflowRun` refuses it; edit the run's script file, which the notification names,
  and resubmit it with `AmendWorkflow` and `path`.
- **stopped** — resumable as-is with `ResumeWorkflowRun`. The `<stop-reason>` says why:
  `user` (leave it alone unless they ask), `model` (you stopped it), `interrupted` (the
  owning process exited; resume it), or `provider` (a deterministic model-side error —
  sign-in expired, quota cap; the `<error>` block names the fix — resolve it with the user,
  then resume). A fifth state, `superseded`, is a run you amended away: not resumable, no
  notification.

Reported items come back on errored and stopped runs too. A run with a "waiting for
provider" badge is retrying a provider error (§16.3), not broken; after twenty minutes you
get one stall notification, and it still needs nothing from you.

**When the script itself was wrong, do not start over.** Any run — errored, stopped,
completed, or still running — can be superseded: edit the run's script file and call
`AmendWorkflow` with `run_id` and that `path`. The new run imports the old one's finished
work, matched per named subagent along its sequence of asks, so every step you did not touch
settles from cache and only the changed part runs (the boundary is in §16.4). This is the
move after a `ScriptError`, a bad prompt, or a completed analysis that needs one more stage.
Two things make the cache hit: names that stay the same, and asks whose instructions stay
byte-identical (an upstream change cascades downstream).

**Every run remembers its script file, so a revision is an `Edit`.** The terminal
notification names that path and `GetWorkflowRun` reports it as `scriptPath`, so the script
never has to live in your context: compaction may have dropped the text you sent, the file
on disk has not moved. Edit it in place and pass `path`; pass `script` only for something
genuinely new. A `path` whose bytes still equal what the run ran is refused as
`script_unchanged` — your `Edit` did not land — with nothing stopped and nothing created.

**Editing a draft asks nothing.** `.zcode/workflow-drafts/` is machine-owned and
git-ignored, so an `Edit` under it opens no confirmation window; the window still stands
between the file and the run, so fix the file freely and let the submission be what the
user answers.

**Repair a run while it is still going.** The same call works before the run ends, and the
earlier the cheaper. When a run is heading the wrong way, do not wait for it and do not stop
it first: call `AmendWorkflow` on it. The tool stops the predecessor, waits for it to settle,
imports everything that settled before the stop at zero cost, and starts the revision — one
call, no `TaskStop`, no polling. The old run shows as "superseded" and sends no notification;
the result you get back names both runs.

The cascade rule has a converse that decides whether revisions are cheap or ruinous.
Interpolating an upstream **result** into a prompt is safe: on resume it replays
byte-identical, so the prompt does too. Interpolating a script **constant** is the opposite
bet — constants are what an amendment tunes, and every ask whose text mentions one forfeits
its cache when you tune it, plus everything downstream:

```ts
// ✗ Amending PASS_THRESHOLD (say 96 → 94) rewrites this text, so the resumed run
//   misses cache at the first revision and re-pays every ask after it.
draft = await writer.ask<Draft>(
  `Scored ${review.score}; passing needs ${PASS_THRESHOLD}. Revise: ${JSON.stringify(review.comments)}`,
);

// ✓ Only replayed upstream values and the fact that the branch was taken; amending
//   the threshold now moves only where the loop exits, and earlier rounds settle from cache.
draft = await writer.ask<Draft>(
  `The review did not pass. Address each comment: ${JSON.stringify(review.comments)}`,
);
```

Keep the tunable knobs — thresholds, round caps — in the script's control flow, where
amending them is free, and out of ask text, where it is a cache purge. A subagent rarely
needs the number; it needs the verdict and the feedback.

## 14. When a subagent escalates

Every subagent can escalate a blocking question to you while the run is going; nothing in
the script switches this on. It exists for the one thing a script cannot design around: a
subagent walled in by something not its fault — a gate it cannot pass (capped at 95 against
a threshold of 96), two instructions no single output satisfies, a fact only whoever started
the run knows. With no way to ask, it has two moves left, both bad: grind until the round
cap, or fake its way past.

**What reaches you.** A notification arrives mid-run carrying the run, the subagent, the
question with whatever evidence the subagent attached, and a globally unique question id shaped
like `dwfq-...`. Only the subagent that asked is parked, and only on that one call: its
siblings, the script's control flow and the run's status all carry on unchanged. Nothing
times out on its behalf either — it waits until you answer or until the run is cancelled. So
you need not drop what you are doing, but you cannot leave it unanswered.

**Then decide which of two things is true.**

- The question **has an answer** — a clarification, one missing fact, a tradeoff only you can
  call. Answer it with `ResolveWorkflowQuestion` and that `question_id`. Your text becomes
  the result of the subagent's own call, verbatim, and it continues its turn from there. Not
  sure? Read the run with `GetWorkflowRun`, or put the question to the user with
  `AskUserQuestion` — then come back and answer, because nothing answers in your place.
- The **script** is what is broken — a gate no output can pass, control flow routing work to
  the wrong subagent. No sentence fixes that. Edit the run's script file and call
  `AmendWorkflow` on it with that `path` (§13); it stops the run for you. The escalation is
  what makes that amendment cheap: the ask that escalated never settled, so it sits exactly
  past the cache boundary — everything before it imports from the old run at no token cost,
  and it re-runs against the fixed script.

**If the notification never arrives**, `GetWorkflowRun` lists what a run still owes you:
the questions under `pendingQuestions`, ids included, and the holes it is waiting at (§15).
That snapshot is the way to check on a run you suspect is waiting on you.

**Write personas that make honesty the cheap move.** A persona that says "make the check
pass" and stops there leaves faking a pass as the obedient reading. One sentence closes that
off: *"If a check is impossible to pass, or your instructions contradict each other, escalate
and say so plainly rather than working around it."*

One ask gets three escalations; the fourth comes back as an ordinary result telling the
subagent to proceed on its own best judgement — a guard against chatter.

## 15. Holes: growing the workflow as the run learns

`hole<T>()` is the other mid-run request — §14 is the subagent's, this one is yours. A
script is what you know for sure; a hole is where knowing stops. Any phase whose subagents,
asks or gate you would have to guess is a hole: write the part before the guess, end it in
`hole<T>()`, and the run's findings write the rest. A workflow whose shape the request fixes
has no holes, and that is fine too.

A subagent returns a **value**; a hole returns **code**. Ask a subagent when the script
already knows what to do with the answer and only the data is missing. Leave a hole when
what is missing is the rest of the workflow — which phases come next, which subagents exist,
what each is told, what gate runs. *If you could write the code now and only the data is
missing, it is not a hole.*

| The unknown is… | Use |
| --- | --- |
| an answer the script knows how to consume | a subagent ask; fresh eyes if it is a judgment (§3) |
| a branch among outcomes you can enumerate now | a typed result and an `if` or a loop, in the script |
| what the remaining workflow should be, knowable only from findings | a hole |
| a question a subagent hits mid-task that only the run's owner can answer | escalation (§14) |

Subagents run without you, in parallel; a hole parks one branch until you take a turn. Spend
holes on shape, never on answers.

Three forms; `T` is always written out:

```ts
const plan = await hole<Plan>("决定分组", `最慢的模块是 ${survey.slowest}`); // decide, then continue
return await hole<Guide>("第1步：决定导览结构", `盘点：${JSON.stringify(survey)}`); // tail: the rest is not written yet
const plan = await hole<Plan>("决定分组", `…`, async () => { /* filled: the body stands in for the hole */ });
```

- **The name is a phase name.** A literal, unique among the script's holes and phase markers
  (nested fills included), in the user's language: it labels the station, the notification and
  the fill file. `T` is the contract the body is checked against.
- **The prompt is the one channel for values.** Interpolate what the decision needs; the
  fill reads values there and types from the code.
- **The body sees every binding declared before the hole, none after**, and may leave holes
  of its own.
- **Filled once, run per reach.** A hole in a loop or a helper is filled once and its body
  runs each iteration with that iteration's bindings. Never inside a fan-out callback (`.map`
  or another array-method body): the fill would be owed while the items already run.

### Grow by tail holes — the default for a task whose shape is not known upfront

When the request does not tell you the workflow — a repository to understand before the
work can be planned, a bug whose next step depends on what the last one found — do not
guess the topology. Write the part you know and end the script with a tail hole. The script
then grows by **nesting**: each fill is the statements of the innermost body, does one step,
and ends in the next tail hole, until one returns instead.

```ts
// 0. The seed you submit: what is known, then a typed gap.
phase("盘点仓库顶层目录");
const survey = await agent("勘察员").ask<Survey>("列出顶层目录，各用一句话说明作用。");
return await hole<Guide>("第1步：决定导览结构", `盘点：${JSON.stringify(survey.dirs)}`);
```

```ts
// 1. After the first fill: the hole has a body — one step, then the next hole.
return await hole<Guide>("第1步：决定导览结构", `盘点：…`, async () => {
  phase("分章并行撰写初稿");
  const drafts = await Promise.all(
    survey.dirs.map((d) => agent(`写手·${d.path}`).ask<Chapter>(`写「${d.path}」一章：${d.purpose}`)),
  );
  return await hole<Guide>("第2步：审读与交付", `${drafts.length} 章初稿已就绪`);
});
```

```ts
// 2. After the second fill: the chain closes with a value, which is the run's result.
return await hole<Guide>("第1步：决定导览结构", `盘点：…`, async () => {
  /* step 1 as above; `survey` and `drafts` are in scope below */
  return await hole<Guide>("第2步：审读与交付", `…`, async () => {
    phase("独立审读并修订");
    const critique = await agent("审读员").ask<string>(`只凭文本挑毛病：${JSON.stringify(drafts)}`);
    const chapters = await agent("修订编辑").ask<Chapter[]>(`按意见修订：${critique}`);
    return { title: "仓库导览", chapters, notCovered: [] };
  });
});
```

You send only the innermost statements; the tool splices them in and rewrites the draft
with the effective script, so the draft you read before the next fill is the script that is
running. The chain's rules: a fresh name per step (`第N步：<what it does>`; a repeated name
is a 9012); the prompt is the progress ledger; results stay in bindings (`survey`, `drafts`),
because every inner body sees the ones around it; a step may add phases, subagents and
holes of its own. The timeline grows to the right, one head per step. This is the normal
way to run a task whose shape only appears as the work proceeds, not a fallback.

### A stage shaped by discovery

The survey's *value* goes to the script as data; the fill writes the *topology* of the next
stage, which the survey decided: three reviewers or one, fanned out or sequential, which
check gates them.

```ts
const hot = await agent("剖析员").ask<Hotspots>("找出最慢的三个模块，说明各自的耦合。");
const reviews = await hole<Review[]>("怎么审查这些热点", `热点：${JSON.stringify(hot.modules)}`);
```

A fill for two independent modules and one shared one: two reviewers in a `Promise.all`,
a calibrated reviewer over the shared module, then a bounded fix-and-recheck loop — none of
it writable before `hot` was known.

### A procedure decided at first sight, run every round

```ts
for (const failure of failures) {
  const triage = await hole<Triage>("每个失败怎么分诊", `第一个失败：${failure.name}\n${failure.output}`);
  report(triage);
}
```

Filled at the first failure, the body runs for every one after with that round's `failure`.  
The fill is a *procedure* — which subagent to send, what to ask, when to mark `unconfirmed`  
— not an answer about one failure; that would be a subagent ask inside the loop.

### A remedy the plan could not enumerate

```ts
const gate = await world.run("pnpm", ["test"]);
if (gate.exitCode !== 0) {
  await hole<void>("测试没过怎么办", `退出码 ${gate.exitCode}：\n${gate.stderr.slice(0, 2000)}`);
}
```

If the remedies were known, the script would hold a `Remedy` value and an `if`. The hole is
for when the fix may need phases and subagents nobody planned — a bisect, a second opinion,
a rollback — decided with the failure in hand.

### Propose, judge, then build

```ts
const proposals = await Promise.all([1, 2, 3].map((k) => agent(`方案${k}`).ask<Proposal>("提一个方案。")));
const pick = await agent("评委").ask<Pick>(`选最好的一个：${JSON.stringify(proposals)}`);
return await hole<Outcome>("按选定方案施工", `选中：${JSON.stringify(proposals[pick.index])}`);
```

The judge is a subagent, because choosing is a value; the hole writes the stage that builds
the winner, whose shape depends on what won.

**Not a hole:** a verdict, a summary, a choice among options, an answer per item — those are
subagent asks — and any branch an `if` over a typed result can express.

**Filling one.** The notification carries the run, the hole's site id (`hole#21b40fca`), its name
and type, the prompt with its values in, the draft's path and the hole's line, and the phases
before and after. Then:

1. Read the draft around the line: the body is compiled where the hole stands and sees what
   is declared above it.
2. Write only the statements — no `hole(...)` call, no arrow — returning a value of `T`, or
   ending in a new tail hole when the next step is not known yet; rehearse fixed logic in
   `EvalWorkflowSnippet` first (§6).
3. Call `FillWorkflowHole` with `run_id`, `hole_id` and `script` (or `path`, §16.7). The run
   grows by the body and goes on; the response names the phases added and the draft, now
   holding the effective script, for any later `AmendWorkflow`.
4. Diagnostics mean nothing was spliced and the hole still waits: edit the fill file the
   response names and resubmit with `path`, never paste it again (§13). A line in the
   draft's file is the run's recorded script: `AmendWorkflow`, not a draft edit.

A fill that throws at run time rejects at the site and ends the run errored unless caught;
amend the draft as usual. Full scripts: `patterns.md` #14–#16, `examples.md` #7.

## Going deeper

- `${ZCODE_SKILL_DIR}/patterns.md` — the topology catalogue. Its index puts the pipeline
  shapes first: per-item chaining, streaming through channels, a feedback loop with a counted
  close. Then fan-out/fan-in, review sweeps, planner-reviewer loops, judge panels, staged
  handoffs, bounded discovery, `world.run`-gated verifier loops, model routing, and the hole
  shapes (growth by tail holes, a stage shaped by discovery, a remedy hole). Read it when you
  know the shape you want and want it written correctly.
- `${ZCODE_SKILL_DIR}/examples.md` — complete worked scripts, including a two-subagent
  adversarial prove/disprove loop and a repository guide grown step by step through tail
  holes. Read one when you want to see a whole script's arc.

## 16. Tool reference

The five authoring tools — `CreateWorkflow`, `AmendWorkflow`, `FillWorkflowHole`,
`SaveWorkflow` and `EvalWorkflowSnippet` — carry short descriptions on purpose, and each refuses
to run until this skill has been loaded in the session. This section is the part of their
contract that the descriptions do not carry: the facade the compiler checks against, the
rules a script must satisfy, and the fields each tool takes. Read it before writing or
revising a script; the compiler holds you to it.

### 16.1 `CreateWorkflow`

Typechecks the script; on a clean compile asks the user to confirm and starts the run in the
background; you are notified with the script's final `return` value when the run settles.
Compilation errors come back as diagnostics, counted in the script's file (§13).

**Three sources; pass exactly one.**

- `script`: a one-off workflow written inline. It is saved to a file under
  `.zcode/workflow-drafts/` and the result names that file, compiled or not; revise it by
  editing the file and resubmitting with `path` (§13).
- `saved`: a workflow saved in this project or globally, by name —
  `saved: { name: "pr-review", args: { pr: "123" } }`; arguments are validated against its
  declaration before anything runs. Check `ListSavedWorkflows` before writing one from
  scratch: a saved workflow the user kept beats a rebuilt one. Running a saved workflow
  is the one call that does not need this skill loaded.
- `path`: a script file on disk, relative to the working directory or absolute — normally
  the file a previous result named. Pass `args` alongside it when the file declares
  arguments in its `/* zcode-workflow` block.

Either way the user confirms the run, and the confirmation shows the actual script.

**Fields.**

- `name`: a short label for the run in the user's language ("PR review", "代码评审").
  Always pass it for an inline script; it labels the run everywhere and names its draft
  file. It defaults to the saved workflow's name.
- `max_concurrency`: an upper bound on how many subagents work at once. Set it only when
  the user asks to limit parallelism — never as a reaction to provider rate limits or
  errors, which the runtime already adapts to.
- `subagent_model`: the model the subagents run on, as `providerId/modelId` or a bare model
  id (optionally `$reasoningLevel`). Set it only when the user asks for a specific model;
  pass the name they used, and if the tool cannot resolve it, pick from the ids it lists or
  `ListModels`. You stay on the session model either way.

This tool starts a new run. To change a run that exists — errored, completed, stopped or
still running — call `AmendWorkflow` (§13, §16.4), never `CreateWorkflow` again.

### 16.2 The facade

Every script and snippet is checked against these declarations. They are the same constant
the compiler is fed, so what you read here is what typechecks. The block uses `declare`
because it is the host's ambient API description — do not imitate it; your script defines
plain interfaces and never uses `declare`.

<!-- facade-dts:start -->
```ts
/** The pending result of one ask. Await it, or pass it to Promise.all with others. */
declare interface Node<T> extends PromiseLike<T> {}

/** A model declared with model(). */
declare class ModelRef { private constructor(); private readonly modelRef: never }

/**
 * Declare a model subagents may run on: "modelId" or "providerId/modelId", optional "$level".
 * String literal only (checked at launch); choose among ModelRefs at run time.
 */
declare function model(id: string): ModelRef;

/** Persona of a subagent, fixed when agent() creates it. Every subagent has the same working tools. */
declare interface AgentPersona {
  /** System prompt describing the actor's role. */
  system?: string;
  /** Model id literal or ModelRef; omitted = the run's subagent model. */
  model?: ModelRef | string;
}

/**
 * A subagent: one conversation that keeps its context across asks. Asks issued while it is
 * busy wait their turn, first in, first out.
 */
declare interface Agent {
  /**
   * Give the subagent one task. With a type argument, the answer is a value of type T,
   * validated against a schema built from it: T is an interface you define in this script
   * with a plain "interface" declaration (no "declare" modifier). Without one, the answer is
   * the subagent's final reply text.
   */
  ask<T = string>(instructions: string): Node<T>;
}

/**
 * Create a subagent. Every call starts a new, empty conversation; to share one, share the
 * returned value. A non-empty name is an identity: unique within the run (a literal duplicate
 * is a compile error, a computed one fails the run) and the key AmendWorkflow matches cached
 * work by. Unnamed subagents are allowed and never reuse cached work.
 */
declare function agent(name?: string, persona?: string | AgentPersona): Agent;

/**
 * The run's arguments. For a saved workflow they are validated against its declared
 * arguments, with defaults filled in, before the run starts; an inline script or a snippet
 * gets {}. Always defined; the values are unknown, so narrow them (String(args.target), a
 * typeof guard).
 */
declare const args: Readonly<Record<string, unknown>>;

/** Emit a progress message to the user. */
declare function log(message: string): void;

/**
 * Publish one intermediate result while the run is going; returns nothing. Items are
 * recorded: a resumed run never shows one twice, and they reach the completion notification
 * even when the run fails. The item must be JSON-serializable (plain objects, arrays, strings,
 * numbers, booleans, null); functions, class instances, Date and promises are compile
 * errors. Caps fail the whole run, not the call: 65,536 items per run, 1 MiB per serialized
 * item, 1 GiB per run.
 *
 * artifactId routes the item to a dashboard: a compile-time literal naming a preset
 * (artifact.chart / table / metrics / board) whose declaration has executed by then. The
 * item becomes one point, row, tile value or card there and still lands in the run's
 * Results. A tag naming nothing, or a file/markdown artifact, fails the run.
 */
declare function report(item: unknown, artifactId?: string): void;

/** A published artifact version: the id it was published under, and which version this call minted. */
declare interface ArtifactRef { id: string; version: number }
/** Card metadata every artifact kind accepts. */
declare interface ArtifactOptions {
  /** Shown as the card title; defaults to the id. In the user's language. */
  title?: string;
  /** A sentence or two, shown beside the title when this artifact is the run's primary. */
  description?: string;
  /** The run's deliverable: the card and the run pane lead with it. At most one id per run; once set it stays set for later versions. */
  primary?: boolean;
}
declare interface ArtifactFileOptions extends ArtifactOptions {
  /** Overrides the type sniffed from the extension ("application/pdf", "text/html", …). */
  contentType?: string;
}
/** One value taken from a reported item: a dot path into the item ("timing.after"). */
declare interface ArtifactField { field: string; label?: string; unit?: string }
declare interface ChartSpec extends ArtifactOptions {
  type?: "line" | "bar" | "scatter";        // default "line"
  x: ArtifactField;
  y: ArtifactField | ArtifactField[];        // several = several series
  scale?: "linear" | "log";                  // y axis, default "linear"
  /** A reference value drawn as a horizontal rule, taken from the first item that has the field. */
  baseline?: ArtifactField;
}
declare interface TableSpec extends ArtifactOptions {
  columns: ArtifactField[];
  /** Field that identifies a row; a later item with the same key replaces the row. Absent = append-only. */
  key?: string;
}
declare interface MetricsSpec extends ArtifactOptions {
  /** Each tile shows the value from the latest item that has the field. */
  metrics: ArtifactField[];
}
declare interface BoardSpec extends ArtifactOptions {
  /** Field identifying a card; a later item with the same key moves/updates the card. */
  key: string;
  /** Field holding the card's column. */
  status: string;
  /** Column order. Items whose status is not listed land in a trailing "other" column. */
  columns: string[];
  /** Field for the card title (default: the key) and extra fields shown on the card. */
  cardTitle?: string;
  detail?: ArtifactField[];
}
/**
 * Publish what the user keeps: cards beside the run, kept after it ends. Every id is a
 * compile-time string literal (non-empty, at most 64 characters of [A-Za-z0-9_.-]) and is
 * used with one member only.
 * - CONTENT (file, markdown) are effects: async, resolve to an ArtifactRef, and reject
 *   catchably (missing file, not a file, outside the workspace, over the cap, or no artifact
 *   store in this host).
 *   Bytes are copied at publish time; republishing an id mints the next version and keeps
 *   the old ones.
 * - PRESET (chart, table, metrics, board) are declarations: synchronous and void, drawn from
 *   the items tagged report(item, "<id>"). Declare each once, at the top level; an identical
 *   re-declaration is a no-op, a different or malformed spec fails the whole run.
 * Caps: 32 ids per run, 16 versions per id, 20 MiB per file, 256 KB per markdown, 120
 * characters of title and 500 of description.
 */
declare const artifact: {
  /** Publish a workspace file, path resolved as in files.read(). The type comes from the extension unless opts.contentType sets it. */
  file(id: string, path: string, opts?: ArtifactFileOptions): Promise<ArtifactRef>;
  /** Publish markdown text the script composed. */
  markdown(id: string, content: string, opts?: ArtifactOptions): Promise<ArtifactRef>;
  /** Declare a chart fed by report(item, id): each tagged item is one point. */
  chart(id: string, spec: ChartSpec): void;
  /** Declare a table fed by report(item, id): each tagged item is one row. */
  table(id: string, spec: TableSpec): void;
  /** Declare a metric tile row fed by report(item, id): each tile shows the newest value it has. */
  metrics(id: string, spec: MetricsSpec): void;
  /** Declare a board fed by report(item, id): each tagged item is a card, placed by its status field. */
  board(id: string, spec: BoardSpec): void;
};

/**
 * Mark the start of a phase: a named group of the steps that follow, drawn as one node on
 * the graph the user approves. Presentation only: it starts, waits for and returns nothing.
 * Required. The name is a non-empty compile-time literal and the call a standalone
 * statement. A marker covers every step from it to the end of the block it stands in
 * (nested blocks and inlined helpers included); two markers with the same name are one
 * phase. Every phase contains at least one ask or world.run.
 */
declare function phase(name: string): void;

/**
 * A typed gap: code you write later, once an earlier step's findings are in. When the run
 * reaches an unfilled hole, that branch waits while you write the body (FillWorkflowHole);
 * the rest of the run keeps going. prompt is the message you will receive, so interpolate
 * the values the decision needs. The body runs in the hole's place, sees the bindings
 * declared before it, and returns the hole's value. The filled form passes the body last.
 */
declare function hole<T>(name: string, prompt?: string): Promise<T>;
declare function hole<T>(name: string, body: () => Promise<T>): Promise<T>;
declare function hole<T>(name: string, prompt: string, body: () => Promise<T>): Promise<T>;

/** One matching line found by files.grep. */
declare interface GrepMatch {
  /** Workspace-relative path of the file the match was found in. */
  path: string;
  /** One-based line number of the match. */
  line: number;
  /** The full text of the matching line. */
  text: string;
}

/**
 * Read-only views of the workspace. Each result is recorded, so a resumed run gets the same
 * answer back instead of reading again. There is no write: writing is a subagent's task.
 */
declare const files: {
  /** Workspace-relative paths matching a glob, sorted. Over 2000 files the call rejects. */
  glob(pattern: string): Promise<string[]>;
  /** Read one workspace file as UTF-8 text. Size-capped. */
  read(path: string): Promise<string>;
  /**
   * Search contents with a ripgrep-compatible regex, optionally narrowed by a glob over
   * paths ("*.ts", "src/**"); one entry per matching line. Over 2000 matches or 256KB of
   * results the call rejects.
   */
  grep(pattern: string, glob?: string): Promise<GrepMatch[]>;
};

/** The working tree's status, as reported by git.status(). */
declare interface GitStatus {
  /** Current branch name; absent when HEAD is detached. */
  branch?: string;
  /** True when nothing is staged, modified, or untracked. */
  clean: boolean;
  /** Workspace-relative paths staged for the next commit. */
  staged: string[];
  /** Workspace-relative paths modified in the working tree but not staged. */
  unstaged: string[];
  /** Workspace-relative paths git does not track (honouring .gitignore). */
  untracked: string[];
}

/** One commit, as reported by git.log(). */
declare interface GitCommit {
  /** Full commit hash. */
  hash: string;
  /** First line of the commit message. */
  subject: string;
  /** Author name. */
  author: string;
  /** Author date, ISO 8601. */
  date: string;
}

/**
 * Read-only git views, recorded like files.* so a resumed run gets the same answer back; no
 * call can write. A base names a single ref (no ".." ranges). Paths are workspace-relative, and
 * changes outside the workspace are not reported; git.log alone is repository-wide. Caps
 * reject rather than truncate: diff at 512KB, log at 100 commits. Outside a git repository,
 * or without git, every call rejects catchably.
 */
declare const git: {
  /**
   * Workspace-relative paths that changed. With no base: files modified against HEAD, plus
   * untracked files. With a base ref: tracked files whose current state differs from that
   * ref, uncommitted edits included, untracked files not.
   */
  changedFiles(base?: string): Promise<string[]>;
  /**
   * Unified diff against base (default HEAD). Covers the whole workspace unless you
   * narrow it to one workspace-relative path.
   */
  diff(base?: string, path?: string): Promise<string>;
  /** The current working-tree status, for the workspace. */
  status(): Promise<GitStatus>;
  /** The most recent commits, newest first. Default 20, maximum 100. */
  log(count?: number): Promise<GitCommit[]>;
};

/** The outcome of one world.run command, including nonzero exits. */
declare interface WorldRunResult {
  /** The process exit code. Nonzero is a normal, returned outcome — branch on it. */
  exitCode: number;
  /** Captured stdout (UTF-8). Capped at 256KB; over the cap the call rejects. */
  stdout: string;
  /** Captured stderr (UTF-8). Same cap and rejection semantics as stdout. */
  stderr: string;
}

/**
 * Run a command. Each call runs once and its result is recorded: a resumed run reuses the
 * recorded result instead of running the command again. A completed process RESOLVES,
 * nonzero exit included; the promise rejects (catchably) only on spawn failure or timeout
 * (default 300000ms, timeoutMs overrides, no upper cap). cmd is a compile-time string
 * literal, shown to the user at confirmation. Fixed argv, never a shell: no pipes,
 * redirection or expansion. cwd is the workspace. Node builtins are reachable as
 * world.run("node", ["-e", code]).
 */
declare const world: {
  run(cmd: string, args?: string[], opts?: { timeoutMs?: number }): Promise<WorldRunResult>;
};

/**
 * A stream of typed items between two stages: one stage send()s, another drains it with
 * for await. Unbounded, first-in-first-out, each item to exactly one receiver.
 */
declare interface Channel<T> extends AsyncIterable<T> {
  /** Enqueue one item; synchronous, never waits. Throws ChannelClosed after close(). */
  send(item: T): void;
  /**
   * End the stream: receivers get the remaining items, then their loops exit. Idempotent.
   * A channel nobody closes fails the run as ChannelDeadlock, naming it, once nothing in
   * flight could send to it again.
   */
  close(): void;
}

/**
 * Create a channel. The name labels the deadlock message; it is not an identity. A receiver
 * on an empty, open channel waits until a send or the close.
 */
declare function channel<T>(name?: string): Channel<T>;

/**
 * Run an async block as a concurrent stage. It starts immediately, not when awaited, and
 * returns its promise.
 */
declare function future<T>(body: () => Promise<T>): Promise<T>;
```
<!-- facade-dts:end -->

### 16.3 Rules the compiler and the analyzer enforce

- Plain TypeScript. Define result types with a plain `interface Foo { ... }` or
  `type Foo = ...` and pass them as `ask<T>` type arguments.
- Compiled under `strict` with `noUncheckedIndexedAccess` off: indexing an array or record
  (`items[i]`) needs no guard. `.find()`, `.match()`, `Map.get()` and optional properties
  still yield `T | undefined` / `null` and must be guarded before use.
- Never use the `declare` modifier: the script is compiled inside a function body, where
  ambient declarations are illegal. No `export` statements — the workflow's output is its
  final `return`. No `import` statements.
- Top-level `await` and a final `return <value>` are allowed; the returned value is exactly
  what the completion notification carries.
- No Node or web APIs: `process`, `fetch`, `fs` do not exist and fail typechecking.
- `world.run` executes a real command. Its first argument must be a compile-time string
  literal — the script's command set is shown to the user at confirmation — so interpolate
  runtime values into the args array, never into the command name. A nonzero exit code
  comes back as a value, not an exception (§5).
- `hole<T>()` (§15): explicit type argument; a literal name of at most 128 characters,
  unique among the script's holes and phase markers; the call awaited and written inline;
  outside every array-method fan-out callback (a `for...of` body is fine); the body reads no
  binding declared after the hole. All of these are diagnostic 9012.
- Phases are required (§8): cover the whole script with `phase("...")` markers, one at the
  head of each stage. The name is a compile-time string literal and the call is a standalone
  statement; the marker claims the rest of its enclosing block, nested blocks and inlined
  helper calls included, so a marker inside an `if` covers that branch only. Two markers
  with the same name are one phase, which is how a retry loop stays two nodes instead of
  per-round sprawl. Every phase contains at least one subagent `ask` or one `world.run`;
  plain script logic between two asks is not a stage, so do not open a phase for the setup
  at the top or the `return` at the bottom.
- Subagent names: the name you pass to `agent("...")` is the card the user sees, so write
  it for the user in the session's language (§9). It is also an identity: unique within the
  run, and the key an amended run matches its cached results by. Keep names stable across
  revisions, and give duplicates in a loop their own computed names.
- Artifact ids and the `report` tag are compile-time literals; one id belongs to one
  artifact kind; at most one artifact carries `primary: true`; a preset artifact is declared
  at the top level, not inside a loop, callback or branch (§10), and a fill's body is where
  its hole stands. Publishing rejects catchably when the file is missing or too large.
- Model-side errors never reach the script. Rate limits, overload, network errors and
  timeouts are retried by the runtime without limit while it adapts the fan-out; a
  deterministic one (expired sign-in, model not in the plan, quota cap) stops the run as
  `stopped` for the user to fix and resume. Write no retry loops or `try`/`catch` for
  provider errors; reserve them for logic failures — a result that failed validation, a gate
  that did not pass, a world read over its cap, a missing artifact source, or a
  `ContextLimit` (the ask outgrew the model's context even after compaction: split it).
- `channel`, `future`, `Channel.send` and `Channel.close` are facade callables: call them
  directly (9001 applies to a stored or aliased call); a channel value itself may be stored
  or passed freely. `send` after `close()` throws
  `ChannelClosed`, catchable. Stalls fail the run, never time out: `ChannelDeadlock` when
  receivers wait on channels nothing can send to any more (naming each), `ScriptStalled` when
  some other promise can never settle.
- The final `return` is the model-facing result; artifacts are the user-facing deliverable.
  Never put the same content in both.
- On diagnostics, edit the file the result names and call the tool again with `path`; never
  paste the script a second time.

### 16.4 `AmendWorkflow`

Revises an existing run: it starts a new run that supersedes the old one and imports its
finished work as a cache, so only what you changed is paid for again. §13 has the cache
rules and the repair-while-running move. It works on any run of this project — completed,
errored, stopped or still running; a running predecessor is stopped and superseded in the
same call, so never `TaskStop` it first and never rewrite it from scratch with
`CreateWorkflow`. To continue a stopped run unchanged, use `ResumeWorkflowRun` instead.

**Fields — every field you omit keeps the predecessor's value.**

- `run_id` (required): from a `CreateWorkflow` or `AmendWorkflow` result, a notification,
  `GetWorkflowRun` or `ListWorkflowRuns`.
- `path` or `script`, never both. `path` is the usual form: the errored notification and
  `GetWorkflowRun` name the run's script file — edit it in place and pass the same path
  back, so a revision costs one `Edit` instead of a second copy of the whole script. A file
  whose bytes you did not change is refused (`script_unchanged`) unless the call also
  changes `max_concurrency` or `subagent_model`; nothing is stopped and nothing is created.
  `script` carries a whole revised script inline, written against the same facade and rules;
  it is saved to a draft file the result names, so the next revision can go back to `path`.
  Omit both to keep the predecessor's script byte for byte and change only the settings
  below; its finished work still replays from the cache.
- `name`: a new display label; defaults to the predecessor's.
- `max_concurrency`: omit to keep the predecessor's limit, pass `null` to remove it, pass a
  number to change it (only when the user asks). A call carrying nothing but `run_id` and
  `max_concurrency`, against a run that is still going, retunes that run in place instead of
  starting a new one: same run, nothing stopped, nothing re-run.
- `subagent_model`: omit to keep the predecessor's choice, pass `null` to put the subagents
  back on the session model, pass a model id to change it (only when the user asks).
  `ListModels` lists the ids.

Changing only a setting on a running run still stops it; what it had in flight runs again in
the new run, except that a named subagent whose unfinished ask you did not change picks that
ask up where it left off instead of starting it over.

**How the cache works.** Named subagents are matched by name across the two scripts; each
one's asks are matched in order by byte-identical instructions. A match settles from the
recorded result at zero tokens; a changed or added ask runs live. The cache stays open until a
live subagent makes its first write to the workspace (or a live `world.run` executes): from
that moment, cached world reads and cached asks whose subagent had read or run something
would describe a workspace that no longer exists, so they run live too. Asks that only
answered keep settling from the cache. Editing an ask's text is how you force it to run
again; keep names stable and keep tunable constants out of ask text (§13).

On diagnostics nothing was stopped and nothing was started; fix the file the result names
and call again with `path`.

**Confirmation.** A run this session started (through `CreateWorkflow`, a previous
`AmendWorkflow` or the workflows hub) is amended without a confirmation window, even while
it is running. A run the user stopped, or a run another session started, asks the user
first. The result names the run that was superseded (if one was stopped) and the new run's
id. The superseded run sends no notification of its own; the new run notifies when it
settles. Do not wait for it or poll it with `TaskOutput`.

### 16.5 `SaveWorkflow`

Saves a script with its metadata so it can be run again by name — through `CreateWorkflow`'s
`saved` source, discovered with `ListSavedWorkflows`. Project definitions go in
`.zcode/workflows/<name>.dwf.ts`, committed with the repository; global definitions go in
`~/.zcode/workflows/<name>.dwf.ts` and are available from every project on this machine.

**When to call it.**

- Never unsolicited. Saving writes a file into the user's repository; that is their
  decision, not yours.
- When a workflow you just built looks reusable — it would plausibly run again with
  different inputs — suggest saving it in prose, one sentence naming what you would save and
  why, then stop and wait. Call `SaveWorkflow` only after the user agrees, or when the user
  asks directly ("save this workflow", "保存这个工作流"). A one-off script tailored to a
  single question is not worth suggesting.

**Fields.**

- `name`: a file-safe identifier (letters, digits, dot, dash and underscore). Saving over an
  existing name replaces that workflow, and the confirmation says whether the file is new or
  an overwrite: reuse a name to update, pick a new one for a variant.
- `description` (required) and `whenToUse`: written for a reader who has not seen this
  conversation. `description` shows up wherever the workflow is listed.
- `scope` (required, no default): `project` when the script references this repository's
  files, commands, conventions or layout; `global` when it depends on nothing in the
  project.
- `script` or `script_path`, never both. `script_path` saves a draft a `CreateWorkflow` or
  `AmendWorkflow` result named without re-emitting it; a `/* zcode-workflow` block in that
  file is dropped, because the metadata comes from this call's fields. `script` is the body
  only — no metadata block.
- `args`: name exactly the values that would change between runs — a PR number, a
  directory, a depth. Each declaration gives a `type` (`string`, `number`,
  `boolean`, or `json` for anything else), and optionally a `description`, `required: true`
  and a `default`; every future call is validated against them.

The saved file is valid TypeScript: a `/* zcode-workflow` block of YAML metadata, then the
script verbatim. The script is typechecked by the same compiler as `CreateWorkflow`, before
the user is asked; diagnostics mean nothing was written. The rules in §16.3 apply, phases
included — future callers did not see this conversation, so the phase names are all they
get.

### 16.6 `EvalWorkflowSnippet`

Compiles and runs a small snippet synchronously against the same compiler, sandbox and
world-read execution path a real run uses, and returns the result in the tool call. Nothing
persists: no journal rows, no background task, no run. It is the test bench of §6, for the
fixed logic of a script or of a hole's body; it is not for orchestration.

- `code` or `path`, never both: the snippet inline, or a file holding it, read whole with no
  metadata handling.
- `timeoutMs`: the wall clock for the whole snippet in milliseconds; default 60000, at most  
  600000.
- The snippet facade is the `args`, `log`, `files`/`git`, `world.run`, `channel` and `future`
  parts of the block in §16.2; `agent()`, `report()`, `artifact.*`, `hole()` and the `phase`
  marker are the only absentees — they do not exist here and
  fail typechecking. The language rules are a script's: plain interfaces, top-level `await`, a
  final `return <value>`. The returned value is serialized into the result, so return a
  summary, not a dump; over 256KB fails the call. `log(...)` lines come back in order. A
  snippet that contains `world.run` asks the user for confirmation before running. On
  diagnostics nothing ran: fix the snippet and call again.

### 16.7 `FillWorkflowHole`

Writes the body of a hole a run is waiting at (§15). It starts nothing: the run keeps its id,
journal and subagents, and the effective script — the run's script with the body spliced in —
is what a resume replays, an amend revises and `SaveWorkflow` keeps.

- `run_id` and `hole_id` (required): from the notification or `GetWorkflowRun`; the hole id
  is the site id (`hole#21b40fca`), not the name.
- `script` or `path`, never both: the body's statements only. An inline `script` is written to
  a fill file under `.zcode/workflow-drafts/` before it is compiled and the result names it;
  `path` is usually that file after an `Edit`, and bytes equal to the last rejected attempt
  are refused as `fill_unchanged`.

The body is compiled where the hole stands, against the whole script; a diagnostic is anchored
to the file it falls in — the fill file inside the body, the run's draft outside it — and on
diagnostics nothing is spliced. A body may name only the models the run was launched with; any
other model is diagnostic 9011 — to add one, amend the run.
`hole_not_waiting` means the run is not in flight or not
waiting at that hole (filled, not yet reached, unknown id); resume a stopped run first and the
hole asks again. A body may end in a new tail hole instead of returning (§15). On success the
response names the phases added and the run's draft, rewritten in place with the effective
script. Confirmation follows the amend rule (§16.4): this session's run fills without a
window; otherwise the window shows the new stations and the `world.run` commands the body
adds.
