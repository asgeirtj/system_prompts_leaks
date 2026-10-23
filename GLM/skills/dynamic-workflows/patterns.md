# Dynamic workflow patterns

A catalogue of orchestration shapes. Each entry states when the shape is right, then shows
it written correctly. Interfaces are elided where they are obvious — your script must
define every type it names.

The snippets here are **fragments, not runnable scripts**: they name types and subagents that
the surrounding prose leaves to you. Complete scripts live in `examples.md`.

**Start with the pipeline shapes.** Most scripts have more than one stage, and the stages
should work at the same time, each item moving on as soon as it is ready (SKILL.md §7). #10
chains stages that map one to one inside one fan-out; #11 streams items between stages through
channels; #12 adds a feedback loop from a later stage to an earlier one. The other shapes are
the pieces those pipelines are built from.

For the API surface itself, read SKILL.md §16. For the reasoning behind these choices, read
the rest of `SKILL.md`.

---

## 1. Fan-out / fan-in over a glob

**When:** the same independent question about every file in a set, and you want them
answered at once.

```ts
phase("Find the files to audit");
const paths = await files.glob("src/**/*.ts");
log(`fanning out over ${paths.length} files`);

phase("Security-audit each file independently");
// The report below needs every verdict, so this join is the right one.
const verdicts = await Promise.all(
  paths.map((p) =>
    agent(`auditor-${p}`).ask<Verdict>(`Security-review ${p}. Report only real issues.`),
  ),
);

phase("Report the files that failed");
return verdicts.filter((v) => !v.approved).map((v) => ({ path: v.path, reason: v.reason }));
```

A fresh subagent per path is the point: the questions are unrelated, so there is nothing to
share and everything to parallelize. Do not hoist `agent(...)` above the `map`.

The name carries the path because subagent names must be unique within a run: `agent("auditor")`
inside the `map` would create one subagent per file all claiming the same name, which is rejected
at compile time. `` `auditor-${p}` `` is also what lets a revised re-run (`AmendWorkflow`) keep
the verdicts for files whose question did not change. Anonymous — `agent()` — is legal too,
and starts every file with an empty context.

**Narrow before you fan out.** A glob over a large repository is a large fan-out. If only
some files can possibly matter, find them first:

```ts
const hits = await files.grep("dangerouslySetInnerHTML", "src/**/*.tsx");
const paths = [...new Set(hits.map((h) => h.path))];
```

`files.grep` rejects rather than truncating when it overruns its cap, so a pattern that is
too broad fails loudly instead of handing you a partial file list to fan out over.

---

## 2. Changed-file review sweep

**When:** reviewing work in progress rather than the whole tree.

```ts
phase("Find the work in progress");
let paths: string[];
try {
  paths = await git.changedFiles("origin/main");
} catch {
  paths = await files.glob("src/**/*.ts");
}

phase("Review each changed file for bugs");
const reviews = await Promise.all(
  paths.map((p) => agent(`reviewer-${p}`).ask<Review>(`Review ${p} for correctness bugs.`)),
);
```

Every `git` call rejects outside a repository or with no `git` available, so the `try`/`catch`
with a `files.glob` fallback is the idiom, not defensive padding.

When the reviewer needs the change rather than the file, hand it the diff — but per path, so
no single prompt carries the whole changeset:

```ts
const perFile = await Promise.all(
  paths.map(async (p) => {
    const patch = await git.diff("origin/main", p);
    return agent(`reviewer-${p}`).ask<Review>(`Review this change to ${p}:\n\n${patch}`);
  }),
);
```

`git.diff` is capped and rejects rather than truncating, so narrow it to a path when the
whole-workspace diff would be large.

Then confirm before you report — per file, as each review lands, not after all of them. The
reviewer that raised a finding does not get to confirm it — a subagent asked to check its own
work grades generously — so each finding goes to a fresh confirmer that reproduces it from the
evidence alone and is told not to fix anything. Chaining the confirmers inside the same
callback means the slowest reviewer holds up only its own file:

```ts
phase("Review each changed file and confirm its findings as they land");
const confirmed = (
  await Promise.all(
    paths.map(async (p) => {
      const review = await agent(`reviewer-${p}`).ask<Review>(`Review ${p} for correctness bugs.`);
      return Promise.all(
        review.findings.map(async (finding, index) => {
          const check = await agent(`confirmer-${p}-${index}`).ask<Confirmation>(
            `Reproduce this finding from its evidence alone. Do not edit any file.\n${JSON.stringify(finding)}`,
          );
          const reported = { ...finding, status: check.reproduced ? "verified" : "unconfirmed" };
          report(reported);
          return reported;
        }),
      );
    }),
  )
).flat();
```

What fails confirmation is kept and labelled, not dropped. The review fan-out above and this
one are the same shape written twice for exposition; in a real script write only this one.

---

## 3. Planner ↔ reviewer loop

**When:** the first attempt at something is rarely right, and a critic can say why.

```ts
const planner = agent("planner", "You write concrete, minimal implementation plans.");
const reviewer = agent("reviewer", "You find the flaw in a plan. Approve only when you cannot. You never edit files.");

let feedback = "none";
for (let round = 0; round < 5; round++) {
  phase("Draft a plan for the change");
  const plan = await planner.ask<Plan>(`Plan the change. Previous critique: ${feedback}`);
  phase("Critique the plan until it holds");
  const review = await reviewer.ask<Review>(`Critique this plan:\n${JSON.stringify(plan)}`);
  if (review.approved) return plan;
  log(`round ${round + 1} rejected: ${review.feedback}`);
  feedback = review.feedback;
}
```

Both subagents are created **once, outside the loop**. That is what makes the loop cheap: each
keeps its accumulated context across rounds, so the planner remembers what it already tried
and the reviewer remembers what it already objected to. Creating them inside the loop throws
that away every round and pays full price for it.

The reviewer's persona says it never edits files: that is what keeps it critiquing the plan
instead of quietly "fixing" it. When critiquing the plan is reading a string, it simply never
opens a file; when the plan is about code, tell it to read the code — a reviewer that has not
opened the files can only judge whether the plan is coherent, not whether it is right.

By the last round the persistent reviewer is anchored on its own earlier objections. Put the
final plan in front of eyes that have seen nothing else, and ask for failures rather than  
approval:

```ts
phase("Independent review of the final plan");
const second = await agent("independent-reviewer", "You review plans and never edit files.").ask<Review>(
  `You have not seen this plan before. Read it against the codebase. What would break it, and what is missing?
${JSON.stringify(plan)}`,
);
if (!second.approved) feedback = second.feedback;
```

---

## 4. Judge panel: independent, or calibrated

**When:** a finding needs a second opinion. Two shapes, and the difference matters.

**Independent** — N fresh contexts, each blind to the others. Use for a majority vote,
where correlated judges would defeat the purpose:

```ts
phase("Judge the finding from three angles");
// A majority needs every vote, so the join waits for all three.
const votes = await Promise.all(
  ["correctness", "security", "does-it-reproduce"].map((lens) =>
    agent(`judge-${lens}`)
      .ask<Verdict>(`Judge this finding through the ${lens} lens. Try to refute it:\n${claim}`),
  ),
);
const survives = votes.filter((v) => !v.refuted).length >= 2;
```

Giving each judge a distinct lens beats three identical refuters: diversity catches failure
modes that redundancy cannot.

**Calibrated** — one context that sees every item, so its verdicts are consistent with each
other. Use for ranking and severity, where "high" has to mean the same thing twice:

```ts
phase("Rank every finding on one scale");
const triage = agent("triage", "You rank findings on one consistent scale across a whole batch.");

const ranked: Ranked[] = [];
for (const finding of findings) {
  ranked.push(await triage.ask<Ranked>(`Rank: ${JSON.stringify(finding)}`));
}
```

The `for`/`await` is deliberate here — asks on one subagent queue FIFO anyway, so writing it as
a `Promise.all` would only hide the serialization, not remove it.

A queue is not a barrier, though. The calibrated subagent does not need the whole batch in
hand before it starts: feed it each item as the stage before produces it (from inside that
stage's fan-out callback, SKILL.md §11) and its verdicts stay consistent while the pipeline
keeps moving.

Either way, a judge's verdict is a judgement, not a reproduction: a finding that survived the
panel still enters the report as `unconfirmed` unless a confirmer or a `world.run` check
reproduced it.

---

## 5. Loop until approved, with a real escape

**When:** a bounded loop that must still return something useful when it runs out of rounds.

```ts
let best: Attempt | undefined;
for (let round = 0; round < 6; round++) {
  phase("Attempt the fix");
  const attempt = await worker.ask<Attempt>(`Attempt the fix. Prior failure: ${lastError ?? "none"}`);
  phase("Check whether it actually passes");
  const check = await checker.ask<Check>(`Does this pass? ${JSON.stringify(attempt)}`);
  if (check.passed) return { attempt, rounds: round + 1, converged: true };
  best = attempt;
  lastError = check.reason;
}
return { attempt: best, rounds: 6, converged: false };
```

Return the shape that says **whether it converged**, not just the result. A caller that
cannot tell "approved on round two" from "gave up after six" will treat the second as the
first. Never let the loop fall off the end returning nothing.

---

## 6. Staged handoff with typed results

**When:** each stage narrows or transforms what the next one works on, and the last stage
needs everything the one before it produced.

```ts
phase("Survey which modules touch auth");
const survey = await agent("surveyor").ask<Survey>("List the modules that touch auth.");
log(`${survey.modules.length} modules in scope`);

phase("Analyse each module for auth bypasses");
// The write-up deduplicates across modules, so it needs every analysis at once.
const analyses = await Promise.all(
  survey.modules.map((m) =>
    agent(`analyst-${m.path}`).ask<Analysis>(
      `Analyse ${m.path} for auth bypasses. Purpose: ${m.purpose}`,
    ),
  ),
);

phase("Write the findings up for the engineer who fixes them");
const synth = agent("synthesist", "You write findings up for an engineer who will fix them.");
return synth.ask<Writeup>(`Write these up, deduplicated:\n${JSON.stringify(analyses)}`);
```

Each stage's result is the next stage's input, and the type argument is what makes the
handoff safe — `survey.modules.map` only compiles because `Survey` says what came back.

Note the shape of the last call: a single synthesis subagent gets everything at once, because
deduplicating across findings is exactly the job that needs to see all of them. Do not
parallelize a stage whose whole purpose is cross-item comparison.

The converse holds too. The analysis stage maps one to one onto the survey's modules, so if a
per-module check followed it, that check would belong inside the same callback as the
analysis — not behind a second `Promise.all` (shape 10). Reserve the barrier for the stage
that needs everyone.

---

## 7. Bounded discovery

**When:** the work has no natural size — "find the bugs" rather than "check these twelve
files."

```ts
const MAX_ROUNDS = 6;
const found: Bug[] = [];
const seen = new Set<string>();

for (let round = 1; round <= MAX_ROUNDS; round++) {
  phase("Hunt for bugs not already found");
  const batch = await agent("hunter").ask<Bugs>(
    `Find bugs not already in this list: ${JSON.stringify([...seen])}`,
  );
  const fresh = batch.bugs.filter((b) => !seen.has(`${b.path}:${b.line}`));
  if (fresh.length === 0) break; // dry: stop, the remaining rounds would only repeat

  for (const bug of fresh) {
    seen.add(`${bug.path}:${bug.line}`);
    report(bug);
    found.push(bug);
  }
  log(`${found.length} found after round ${round}`);
}
return found;
```

Two guards, and you need both: the round cap keeps the loop from running forever when the
hunter keeps finding things, and the dry check stops it once the hunter stops finding anything
new. The cap is a knob you pick and amend in the script — the harness enforces no node limit,
so a loop without one only ends when the user cancels the run. Deduplicate against everything  
**seen**, not against everything kept — dedup against the kept list makes rejected findings
reappear every round and the loop never converges.

---

## 8. Salvage by report

**When:** always, in any run long enough to fail partway.

```ts
// Wrong: forty tasks of work, and a failure on task twelve returns nothing.
const results: Result[] = [];
for (const item of items) results.push(await worker.ask<Result>(`Handle ${item.id}`));
return results;

// Right: each result is published the moment it exists.
phase("Handle each item and publish as it lands");
const results: Result[] = [];
for (const item of items) {
  const result = await worker.ask<Result>(`Handle ${item.id}`);
  report(result);
  results.push(result);
}
return results;
```

Reported items are delivered with the completion notification on errored and stopped runs
as well as successful ones, and they are recorded, so a resumed run does not re-emit them.
The return value only survives if the script reaches its `return`; reported items survive
regardless. Report findings, not chatter — there is a per-run item cap, and overrunning it
fails the run.

The same call can feed a picture. Tag the item with a preset artifact id —
`report(result, "progress")` — and it lands both in the run's results and on the chart,
table, metrics or board of that name, live as the loop goes (SKILL.md §10).

A `try`/`catch` around a single task turns one **logic** failure — a subagent result that
failed validation, a gate that did not pass, a world read over its cap, an artifact publish
whose file is missing — into a partial result instead of a dead run. It is not for provider
errors: model-side errors never reach the script. Transient ones (rate limits, overload,
network errors, timeouts, unknown provider errors) are retried by the runtime without limit;
deterministic ones (sign-in expired, model not in the plan, quota cap) stop the whole run as
`stopped` so the user can fix the cause and resume it. A retry loop around an ask for their
sake is dead code. The one model-adjacent error a script can catch is `ContextLimit`: the
ask itself was too large for the model even after compaction, and the fix is a smaller ask.

```ts
for (const item of items) {
  try {
    report(await worker.ask<Result>(`Handle ${item.id}`));
  } catch (error) {
    log(`skipped ${item.id}: ${String(error)}`);
  }
}
```

---

## 9. Gated verifier loop (world.run)

**When:** the stopping condition is machine-checkable — a build, a proof checker, a test
suite — and a subagent's claim of success is not worth trusting.

```ts
const prover = agent("prover", "You repair the proof. Fix exactly what the checker reports.");

phase("Write the first proof attempt");
await prover.ask<Attempt>(`Prove the open theorem in ${FILE}.`);
let clean = false;
for (let round = 1; round <= 8; round++) {
  phase("Check the file with the fast checker");
  const check = await world.run("lake", ["env", "lean", FILE], { timeoutMs: 600_000 });
  clean = check.exitCode === 0 && !check.stderr.includes("sorry");
  if (clean) break;
  log(`round ${round}: checker rejected`);
  phase("Repair what the checker rejected");
  await prover.ask<Attempt>(`The checker rejected the file:\n${check.stderr}\nRepair ${FILE}.`);
}
if (!clean) return { proved: false };

phase("Build the whole project once before handing over");
const build = await world.run("lake", ["build"], { timeoutMs: 1_800_000 });
return { proved: build.exitCode === 0 };
```

The subagent does the open-ended work; the script does the judging, and the judgment is not
delegable. `world.run` executes the checker for real, so "verified" is never a claim — only
an exit code. A nonzero exit is a **value**, which is why the loop reads `check.exitCode`
and feeds `check.stderr` forward instead of catching anything; rejections are reserved for
the world failing to answer (spawn failure, timeout, output over the cap), and a
`try`/`catch` around the call is how a script chooses a fallback for those.

Two tiers, and the difference is the whole point. The per-file checker is the fast tier: it
answers in seconds, so it drives the rounds. It is not the verdict — `lake env lean` exits
0 on a proof that still says `sorry` and only warns on stderr, which is why the loop reads
stderr too. The whole-project build is the strong tier: it is what the request was about,
and it runs once at the end even though the fast tier already said yes. Pick both tiers by
reading the repository — the README's "run this to verify" line, the `Makefile`, the
`package.json` scripts — never from habit; the strongest check the repository offers for
what the user asked is the one that decides (SKILL.md §5).

The command name is a compile-time literal by rule — the user approves the script's command
set at confirmation — so interpolate paths, flags and round numbers into the **args**,
never into the command. Compare shape 5: same loop, but there the checker was a subagent;
prefer this shape whenever a real command can render the verdict.

---

## 10. Per-item pipeline

**When:** two or more stages map one to one — a hunter per file and a confirmer per finding,
a migrator per file and a checker per file — and nothing in the later stage needs to see the
whole earlier stage.

```ts
phase("Hunt for bugs in each file and confirm them as they are found");
const confirmed = (
  await Promise.all(
    paths.map(async (p) => {
      const hunt = await agent(`hunter-${p}`).ask<Hunt>(`Hunt for correctness bugs in ${p}.`);
      return Promise.all(
        hunt.bugs.map(async (bug, index) => {
          const check = await agent(`confirmer-${p}-${index}`).ask<Confirmation>(
            `Reproduce this bug from its evidence alone. Do not edit any file.\n${JSON.stringify(bug)}`,
          );
          const reported = { ...bug, status: check.reproduced ? "verified" : "unconfirmed" };
          report(reported);
          return reported;
        }),
      );
    }),
  )
).flat();
```

One join, at the end, where the report needs every item. Compare the two-barrier version —
`Promise.all` over the hunters, then `Promise.all` over the confirmers — which starts no
confirmer until the slowest hunter is done and leaves the concurrency slots idle in between.
The cache identity of a revised re-run is unchanged: each subagent is still named and asked in
the same order.

One phase covers the whole pipeline, named for what it does to each item. Do not put a marker
per stage inside the callback: the run has one current phase, and concurrent callbacks
re-entering two markers out of order would stamp each other's steps.

When one item failing should cost one item, catch inside the callback (examples #3) or use
`Promise.allSettled` and read each outcome; a rejection inside a plain `Promise.all` rejects
the join and the siblings with it.

## 11. Streaming pipeline with channels

**When:** items should flow to the next stage as they are produced, and the shape is one
chaining (#10) cannot write: a pool of K shared workers serving a stage, a producer still
finding items while consumers work, a later stage sending work back (#12), or stages you want
to read as separate blocks. Each stage is a
`future` whose body opens with its own phase marker; a `channel` carries items between two
stages; the producing stage owns the `close()` in a `finally`.

```ts
const leads = channel<Lead>("leads");
const facts = channel<Fact>("facts");
const checked: Checked[] = [];

const seed = future(async () => {
  phase("Decide what to look into");
  try {
    const plan = await agent("planner").ask<{ questions: string[] }>(`List the questions to answer about ${topic}.`);
    for (const question of plan.questions) leads.send({ question });
  } finally {
    leads.close();
  }
});

const research = future(async () => {
  phase("Research each question");
  try {
    await Promise.all(
      Array.from({ length: RESEARCHERS }, async (_, k) => {
        // One context per worker, hoisted out of the loop: a name is minted once per worker,
        // and what one worker learnt on an earlier question is there for its next.
        const researcher = agent(`researcher-${k + 1}`);
        for await (const lead of leads) {
          const found = await researcher.ask<Research>(`Research: ${lead.question}`);
          found.facts.forEach((fact, index) => facts.send({ ...fact, id: `${lead.question}-${index + 1}` }));
        }
      }),
    );
  } finally {
    facts.close(); // a failed researcher still ends the stream for the verifiers
  }
});

const verify = future(async () => {
  phase("Check each fact as it arrives");
  await Promise.all(
    Array.from({ length: VERIFIERS }, async (_, k) => {
      const verifier = agent(`verifier-${k + 1}`);
      for await (const fact of facts) {
        const verdict = await verifier.ask<Verdict>(`Check: ${JSON.stringify(fact)}`);
        checked.push({ ...fact, ...verdict });
        report({ ...fact, ...verdict });
      }
    }),
  );
});

// Start every stage first, then join all of them once. No await between the two: while the
// script awaits one stage, a failure in another has no listener and surfaces as an unhandled
// rejection instead of failing the run with its error.
await Promise.all([seed, research, verify]);

phase("Write the report from the checked facts");
const summary = await agent("writer").ask<string>(`Write up:\n${JSON.stringify(checked)}`);
```

Three stages, three markers, one join. The writer comes after the join, not on a channel: it
needs every checked fact, so a shared array and the join is the right hand-off there. A
channel where the next stage should start early; a join where it cannot.

The pools here (`researcher-1…3`, `verifier-1…4`) share a context across the items each
worker happens to receive, which is what you want when the items must be judged on one scale
or when what was learnt on one item helps with the next. The price is cache locality on a
revised run: which item lands on which worker depends on timing, so an amendment that changes
one upstream item shifts the assignment and misses the cache for the whole pool. When the items
are independent and you expect to amend, spawn a fresh, item-named subagent per item inside the
`for await` instead — a `future` pushed into an array and joined before the stage ends
(examples #6).

## 12. Feedback loop with a counted close

**When:** a later stage sends work back to an earlier one — a verifier that doubts a fact asks
for more research on it. The feedback channel has no single producer who knows when it is
done, so the script counts open work items and closes the channel when the count hits zero. A
depth field on each item bounds the loop.

```ts
const leads = channel<Lead>("leads");
const facts = channel<Fact>("facts");
// Open work items: every lead sent and not yet researched, every fact sent and not yet judged.
// The feedback channel closes when this reaches zero, and nobody else may close it.
let open = 0;
function finished(): void {
  open -= 1;
  if (open === 0) leads.close();
}

for (const question of seeds) {
  open += 1;
  leads.send({ question, depth: 0 });
}

const research = future(async () => {
  phase("Research each lead");
  try {
    await Promise.all(
      Array.from({ length: WORKERS }, async (_, k) => {
        const researcher = agent(`researcher-${k + 1}`);
        for await (const lead of leads) {
          const found = await researcher.ask<Research>(`Research: ${lead.question}`);
          // Invariant 1: count every child BEFORE finishing the parent, so `open` never
          // touches zero while work is still being produced.
          found.facts.forEach((fact, index) => {
            open += 1;
            facts.send({ ...fact, id: `${lead.question}-${index + 1}`, depth: lead.depth });
          });
          finished();
        }
      }),
    );
  } finally {
    // Invariant 2: a researcher sends facts only from inside its loop, so this close runs after
    // the last researcher has left the loop and nothing can send to `facts` any more.
    facts.close();
  }
});

const verify = future(async () => {
  phase("Check each fact, and send doubts back for more research");
  const checks: Promise<void>[] = [];
  for await (const fact of facts) {
    checks.push(
      future(async () => {
        const verdict = await agent(`verifier-${fact.id}`).ask<Verdict>(`Check: ${JSON.stringify(fact)}`);
        if (verdict.holds) passed.push(fact);
        else if (verdict.followUp !== undefined && fact.depth < MAX_DEPTH) {
          // This fact is still open, so `open` is at least 1 and `leads` cannot have closed:
          // the follow-up is counted before the fact that produced it is finished.
          open += 1;
          leads.send({ question: verdict.followUp, depth: fact.depth + 1 });
        } else rejected.push(fact.claim);
        finished();
      }),
    );
  }
  await Promise.all(checks); // the stage is done when its checks are, not when `facts` closes
});

await Promise.all([research, verify]);
```

Why the count closes `leads` and nothing else can: an item is finished only after every item
it produced has been counted, so `open` reaches zero exactly once, when the last item of the
last generation has been judged and produced nothing. The researchers then leave their loops,
the research stage closes `facts`, the verify stage's `for await` ends, and its join settles.
Forget the increment-before-finish order and `open` can hit zero with a follow-up about to be
sent — `leads.send` then throws `ChannelClosed`. Forget the join over `checks` and the stage
ends early with verdicts still running; the deadlock detector cannot see that one, because
nothing is parked. Forget the depth bound and two subagents can keep each other busy forever.

## 13. Model routing

**When:** the user asked for cheaper or faster models where they are enough, and one subagent
can tell which requests need the strong model. A router on the light model answers with a
typed key; code maps the key to a model the script declared. The router never writes a model
name, so it can only pick among models the user approved in the window.

<!-- compile -->
```ts
// Every model the run can use, declared once; names come from ListModels.
const MODELS = {
  light: model("GLM-5.3-Flash"),
  strong: model("GLM-5.3$high"),
};

interface Route {
  /** "strong" only when the request needs multi-step reasoning or careful writing. */
  tier: "light" | "strong";
}

interface Reply {
  answer: string;
}

const questions: string[] = ["Rename the config key in the README", "Explain the retry design"];

// Routing and answering map one to one, so each question goes to its answerer the moment
// its route is decided; the one join is for the return, which needs every answer.
phase("Route each question to the model it needs and answer it there");
const replies = await Promise.all(
  questions.map(async (question, index) => {
    const route = await agent(`分诊-${index + 1}`, { model: MODELS.light }).ask<Route>(
      `Would answering this well need the strong model? ${question}`,
    );
    return agent(`答复者-${index + 1}`, { model: MODELS[route.tier] }).ask<Reply>(question);
  }),
);
return replies.map((reply) => reply.answer);
```

A fixed choice needs no table: `agent("评审员", { model: "GLM-5.3-Flash" })`. Keep the table at
the top of the script: an amend changes a model in one place, and the finished work of a
subagent whose model changed is still reused — its next live ask runs on the new model.

---

## 14. Growth by tail holes

**When:** the task is complicated enough that its workflow cannot be planned from the request
— the next step depends on what the last one found. Write what is known and end the script
with a tail hole. The script then grows by nesting: each fill is the statements of the
innermost body, does one step, and ends in the next tail hole; the last fill returns.
(`SKILL.md` §15; the complete chain with its fill files is `examples.md` #7.)

```ts
// 0. The seed, submitted with CreateWorkflow.
phase("盘点仓库顶层目录");
const survey = await agent("勘察员").ask<Survey>("列出顶层目录，各用一句话说明作用。");
return await hole<Guide>("第1步：决定导览结构", `盘点：${JSON.stringify(survey.dirs)}`);
```

```ts
// 1. The effective script after the first FillWorkflowHole: the hole gained a body
//    that does one step and leaves the next hole. Only the body's statements were sent.
return await hole<Guide>("第1步：决定导览结构", `盘点：…`, async () => {
  phase("分章并行撰写初稿");
  const drafts = await Promise.all(
    survey.dirs.map((d) => agent(`写手·${d.path}`).ask<Chapter>(`写「${d.path}」一章：${d.purpose}`)),
  );
  return await hole<Guide>("第2步：审读与交付", `${drafts.length} 章初稿已就绪`);
});
```

```ts
// 2. After the second fill: the chain closes with a value. Each hole's site id comes
//    from its name, so ids stay short at any depth; the timeline shows one head per step.
return await hole<Guide>("第1步：决定导览结构", `盘点：…`, async () => {
  /* step 1 as above; `survey` and `drafts` are in scope below */
  return await hole<Guide>("第2步：审读与交付", `…`, async () => {
    phase("独立审读并修订");
    const critique = await agent("审读员").ask<string>(`只凭文本挑毛病：${JSON.stringify(drafts)}`);
    const chapters = await agent("修订编辑").ask<Chapter[]>(`按意见修订：${critique}\n${JSON.stringify(drafts)}`);
    return { title: "仓库导览", chapters, notCovered: [] };
  });
});
```

The rules that make a chain work: every hole name is unique across the whole effective
script, so name each step for what it does (`第N步：…`), never the same name twice; the prompt
carries the progress the next author needs (counts, titles, what failed), because it is the
only channel for values; results live in bindings (`survey`, `drafts`), which every inner
body reads, so nothing needs re-asking; a step may open phases, create subagents, fan out and
gate with `world.run` like any script. The chain ends when a fill returns instead of leaving
a hole. A restart resumes the chain where it waited, with the finished steps replayed from
the journal.

---

## 15. A stage shaped by discovery

**When:** the survey decides the *topology* of the next stage, not just its inputs — how many
reviewers, fanned out or sequential, which check gates them. The survey's value goes to the
script as data; the fill writes the stage.

```ts
phase("剖析热点");
const hot = await agent("剖析员").ask<Hotspots>("找出最慢的三个模块，说明各自的耦合。");
const reviews = await hole<Review[]>("怎么审查这些热点", `热点：${JSON.stringify(hot.modules)}`);
phase("汇总");
return await agent("汇总员").ask<Report>(`汇总审查结果：${JSON.stringify(reviews)}`);
```

A fill written once `hot` says two modules are independent and one is shared by both: the
independent pair reviewed in parallel, the shared one by a calibrated reviewer that has seen
the other two reviews, then a bounded fix-and-recheck loop gated by the project's own test
command. None of that topology was knowable before the survey.

```ts
phase("并行审查独立模块");
const [a, b] = await Promise.all(
  hot.modules.slice(0, 2).map((m) => agent(`审查员·${m.path}`).ask<Review>(`审查 ${m.path}：${m.coupling}`)),
);
phase("在前两份审查的基础上审查共享模块");
const shared = hot.modules[2];
const reviewer = agent("共享模块审查员", "你在别人的审查基础上工作，只找他们没看到的问题。");
let review = await reviewer.ask<Review>(`已有审查：${JSON.stringify([a, b])}\n现在审查 ${shared.path}`);
for (let round = 1; round <= 3 && review.findings.length > 0; round += 1) {
  const fix = await world.run("pnpm", ["test", "--", shared.path]);
  if (fix.exitCode === 0) break;
  review = await reviewer.ask<Review>(`测试仍失败：${fix.stderr}\n复审 ${shared.path}`);
}
return [a, b, review];
```

Contrast with a plain subagent ask: had the survey only said *which* modules to review, the
script could have fanned out over `hot.modules` itself and no hole was needed.

---

## 16. A remedy the plan could not enumerate

**When:** a gate fails and the fix may need phases and subagents nobody planned. If the
remedies were known — retry, narrow, skip — the script would hold a `Remedy` value and an
`if`; the hole is for the case where the remedy is a piece of workflow decided with the
failure in hand.

```ts
phase("跑完整测试");
const gate = await world.run("pnpm", ["test"], { timeoutMs: 1_800_000 });
if (gate.exitCode !== 0) {
  await hole<void>("测试没过怎么办", `退出码 ${gate.exitCode}：\n${gate.stderr.slice(0, 2000)}`);
}
phase("交付");
return await agent("报告员").ask<Report>("写交付报告。");
```

A fill after a flaky-looking failure: a bisect over the last commits by `world.run`, a
second opinion from a fresh subagent on whether the failure is real, and — only if it is —
a fixer loop bounded by three rounds. A fill after a clear failure is one fixer and one
recheck. The script did not have to guess which, and the user sees the remedy as phases of
its own under the hole's head.
