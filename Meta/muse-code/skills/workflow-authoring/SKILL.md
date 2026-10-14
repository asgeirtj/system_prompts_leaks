---
name: workflow-authoring
description: Use when authoring a non-trivial Workflow for research, review, migration, or other multi-agent work, especially when the task needs multiple evidence sources, verification, or synthesis.
user-invocable: false
---

# Workflow Authoring

Load this reference exactly once per parent session before the first non-trivial Workflow.
After a successful load, reuse that result for later Workflow authoring.
Do not call `read_skill` again after validation errors or for retries and resumes.
Select exactly one profile section from the active Workflow guidance.
Never mix symbols across profiles, and never use a call that the active
ToolSpec does not advertise.

## Shared research contract

A fixed batch count never proves completion. Scale the number and diversity of
children to the request, then stop on evidence state or an explicit caller or
runtime boundary.

For a review of a change the user has already identified, first take stock inline
of which files it touches and how large it is, then size the workflow to that
list: a small change gets a few focused children plus one verify vote, not the
full research shape.

Discovery pointers are not inspected evidence when the relevant body is
readable. Require each research child to open every implementation or test body
it cites before `submit_result` when readable; search and grep output only
locate candidates. Back every assigned claim with inspected evidence or name
it as unresolved. Ask research children for
`complete:boolean`, `evidence:string[]`, and `unresolved:string[]`. Handle the
V2 spill marker below before checking for missing data. For inline results,
treat a profile-specific unsuccessful result envelope, missing or wrong-typed
data, `complete !== true`, or nonempty `unresolved` as incomplete.

Never use data from an unsuccessful envelope as evidence or a gap disposition.
Critic unavailability is a synthesis note, never a research gap. Preserve
compact evidence, provenance refs, and every unresolved item in synthesis.
Synthesize from compact `result.data`, not from uninspected summaries. Disclose
omitted scope.

Use independent verification when a claim has materially different failure
modes. Repeating the same prompt is not independent coverage.

Keep these reusable patterns when they fit the request:

- Multi-angle sweep: split initial researchers across genuinely different
  evidence surfaces, such as implementation, tests, design records, and
  operational traces; different role names do not increase coverage when they
  use the same search plan.
- Adversarial verification: give a skeptic a concrete falsification target for
  each material claim; retain only claims that survive inspected counterevidence,
  and mark an unavailable or invalid verdict unresolved.
- Judge panel: for an open solution space, generate candidates from different
  angles, score them against explicit criteria with independent judges, and
  synthesize the winner with useful runner-up ideas by provenance ref.
  A failed or invalid judge is not an affirmative vote.

## V2 spilled child results

Schema-valid `submit_result` custom data above 4096 canonical UTF-8 bytes
(excluding `notes`) is accepted and stored in full. Exactly 4096 bytes stays
inline. An oversize result arrives with `dataSpilledForSize: true`,
`submittedPayloadBytes`, `submittedPayloadChars`, and `ref`, with no inline
`data`. Size facts describe the full canonical submission, including non-null
`notes`; they are not the custom-only spill measurement.

Scripts MUST carry `dataSpilledForSize`, both size facts, and `ref` through to
their returned results. Preserve the envelope, or copy those fields explicitly
as in the V2 examples below. Never collapse a result to `data ?? null`. You
MUST NOT treat a spilled result as empty or failed, or repeat completed work
merely because inline data is absent. Continue to respect the envelope's actual
status and errors. Submission completion does not prove that uninspected
evidence is complete; preserve existing unresolved gaps.

No script-side or parent-side API currently returns the full value. The full
submission is retained under its `ref` in durable session storage and exposed
through the MSP subagent view. Repeating a result observation or passing the
ref to another child supplies no lossless fetch; ref context is bounded.

Ask children to keep custom data under 4096 canonical bytes. When file tools
are available, write large artifacts (test modules, reports) to files and
return paths plus a compact summary. Otherwise split the work or ask for a
compact schema. Report a spilled submission as complete but large, include its
`ref` and size facts, say where the full submission is retained, and disclose
that its contents remain uninspected by this Workflow. Do not claim a file was
written unless the child actually returned that artifact path.

## Two convergence rules

Open-ended discovery and a known evidence gap are different jobs. Do not apply
one loop rule to both.

### Example: open discovery

Maintain `seen` and `dryRounds` in deterministic Workflow state. In each round,
ask complementary finders for items not already in `seen`. Add every reported
item to `seen` before judging it:

- deduplicate against all seen items, including rejected findings;
- If a round adds any fresh item, reset the dry count to zero;
- if it adds none, increment the dry count; and
- After two consecutive dry rounds, stop discovery.

A caller limit, capacity boundary, or runtime budget may stop it earlier; that
stop is partial unless all requested scope is covered.

### Example: explicit gap follow-up

Track the lineage of each concrete unresolved gap.

- Dispatch exactly one focused follow-up for that gap lineage.
- After that attempt, carry the narrowed, reworded, or still-unresolved descendant unchanged into synthesis.
- Do not make its new wording look like a new gap and dispatch it again.

### Example: verification and omitted scope

For a claim involving behavior, abuse resistance, and a reported failure:

- use separate correctness, security, and reproduction lenses;
- give each verifier a distinct falsification target;
- State omitted scope for top-N, sampling, no-retry, capacity, caller limit, and runtime budget boundaries; and
- never describe a bounded sample as exhaustive.

## Workflow API V1

The API is available as bare globals - agent, parallel, pipeline, phase, log,
args, budget - and through the legacy host object. Use the V1 globals or their
`host` aliases described by the active ToolSpec. Read caller input from
`host.args`, the only advertised caller-input spelling.
For example, fan out independent research with `host.parallel(` and use
`host.agent` for the critic, one gap follow-up, and final synthesis:

```javascript
export default async function workflow(host) {
  const evidenceSchema = {
    type: "object",
    required: ["complete", "evidence", "unresolved"],
    properties: {
      complete: { type: "boolean" },
      evidence: { type: "array", items: { type: "string" } },
      unresolved: { type: "array", items: { type: "string" } },
    },
  };
  const compact = (result, scope, missing = `${scope}: missing complete evidence result`) => {
    const failed = result === null || result.error_kind;
    const data = !failed && result.data && typeof result.data === "object" ? result.data : null;
    const evidence = !failed && Array.isArray(data?.evidence) ? data.evidence.filter(Boolean) : [];
    const declared = !failed && Array.isArray(data?.unresolved) ? data.unresolved.filter(Boolean) : [];
    const complete = data?.complete === true && evidence.length > 0 && declared.length === 0;
    return {
      scope,
      ref: result?.ref ?? null,
      complete,
      evidence,
      unresolved: complete ? [] : (declared.length ? declared : [missing]),
    };
  };

  const reports = await host.parallel([
    { input: "Inspect the implementation body; return complete/evidence/unresolved.", schema: evidenceSchema },
    { input: "Inspect the tests; return complete/evidence/unresolved.", schema: evidenceSchema },
  ]);
  const compactReports = reports.map((result, index) => compact(result, `primary-${index}`));
  const synthesisNotes = [];
  const critic = await host.agent({
    input: `Find concrete gaps in this compact evidence: ${JSON.stringify(compactReports)}.`,
    schema: evidenceSchema,
  });
  const criticData = critic !== null && !critic.error_kind && critic.data && typeof critic.data === "object" ? critic.data : null;
  const criticEvidence = Array.isArray(criticData?.evidence) ? criticData.evidence.filter(Boolean) : [];
  const criticUnresolved = Array.isArray(criticData?.unresolved) ? criticData.unresolved.filter(Boolean) : [];
  const criticHasUsableDisposition = (criticData?.complete === true && criticEvidence.length > 0 && criticUnresolved.length === 0)
    || criticUnresolved.length > 0;
  const compactCritic = criticHasUsableDisposition
    ? compact(critic, "critic")
    : (synthesisNotes.push("completeness critic unavailable"), { scope: "critic", ref: critic?.ref ?? null, complete: true, evidence: [], unresolved: [] });
  const open = [...compactReports, compactCritic].flatMap((report) => report.unresolved);
  const firstGap = open[0];
  const followup = firstGap ? await host.agent({
    input: `Resolve this exact gap once, or return it unchanged: ${firstGap}`,
    schema: evidenceSchema,
  }) : null;
  const followupReport = firstGap ? compact(followup, firstGap, firstGap) : null;
  const all = followupReport ? [...compactReports, compactCritic, followupReport] : [...compactReports, compactCritic];
  const unresolved = firstGap ? [...open.slice(1), ...followupReport.unresolved] : open;
  const evidence = all.flatMap((report) => report.evidence.map((value) => ({ source: report.scope, ref: report.ref, value })));
  const refs = [...new Set(all.map((report) => report.ref).filter(Boolean))];
  const synthesis = await host.agent({
    input: `Synthesize only this compact evidence: ${JSON.stringify({ evidence, refs, unresolved, notes: synthesisNotes })}`,
    schema: evidenceSchema,
  });
  const synthesisFailed = synthesis === null || synthesis.error_kind;
  const synthesisData = !synthesisFailed && synthesis.data && typeof synthesis.data === "object" ? synthesis.data : null;
  const synthesisUnresolved = Array.isArray(synthesisData?.unresolved) ? synthesisData.unresolved.filter(Boolean) : [];
  const synthesisComplete = synthesisData?.complete === true
    && Array.isArray(synthesisData.evidence)
    && synthesisData.evidence.length > 0
    && synthesisUnresolved.length === 0;
  if (!synthesisComplete) synthesisNotes.push("synthesis unavailable or incomplete");
  return { status: unresolved.length || synthesisUnresolved.length || synthesisNotes.length > 0 ? "partial" : "complete", ref: synthesis?.ref ?? null, unresolved: [...unresolved, ...synthesisUnresolved], notes: synthesisNotes };
}
```

Wrap the shared discovery and gap-lineage state machine around these calls when
the request needs it. Use compact structured results and refs; follow the V1
ToolSpec for schemas, budgets, isolation, failures, and return shape.

## Diagnostic Workflow API V2

Keep each V2 `input` within 4096 UTF-8 bytes, including task text and refs.
Deferred commands also obey their whole-command size limit. The refs below
request bounded prior-result context; inspect needed bodies and return
`complete: false` with unresolved gaps if required evidence is unavailable.
Refs do not carry lossless `result.data` or parent-local gap state. Include
known unresolved items and synthesis notes as essential compact context.

The diagnostic script surface is exactly Agent, Phase, Pipeline, ParallelGroup,
WorkflowCommandError, log, args, and budget. This profile is fresh-run and
terminal-only. Use deferred work inside the diagnostic containers for
parallelism, then read immutable results:

```javascript
const evidenceSchema = {
  type: "object",
  required: ["complete", "evidence", "unresolved"],
  properties: {
    complete: { type: "boolean" },
    evidence: { type: "array", items: { type: "string" } },
    unresolved: { type: "array", items: { type: "string" } },
  },
};
const synthesisNotes = [];
const spilledResults = [];
const recordSpill = (result, scope) => {
  if (result?.dataSpilledForSize !== true) return false;
  spilledResults.push({
    scope, ref: result.ref, status: result.status, ok: result.ok, error: result.error,
    dataSpilledForSize: result.dataSpilledForSize,
    submittedPayloadBytes: result.submittedPayloadBytes,
    submittedPayloadChars: result.submittedPayloadChars,
  });
  synthesisNotes.push(`${scope}: large submission retained at ${result.ref} in session storage / MSP subagent view; contents uninspected.`);
  return result.status === "completed" && result.ok === true && result.error == null;
};
const group = await ParallelGroup.start({
  members: [
    Agent.defer.start({ input: "Inspect the implementation body; return complete/evidence/unresolved.", schema: evidenceSchema }),
    Agent.defer.start({ input: "Inspect the tests; return complete/evidence/unresolved.", schema: evidenceSchema }),
  ],
});
const reports = await group.result();
const fromAttemptOutcome = (outcome, scope) => {
  if (outcome?.kind !== "attempt" || !outcome.result?.ref) {
    return { scope, ref: null, complete: false, evidence: [], unresolved: [`${scope}: no completed attempt result`] };
  }
  const result = outcome.result;
  const ref = outcome.result.ref;
  if (recordSpill(result, scope)) {
    return { scope, ref: result.ref, complete: false, evidence: [], unresolved: [] };
  }
  const data = result?.data && typeof result.data === "object" ? result.data : null;
  const terminalOk = result.status === "completed" && result.ok === true && result.error == null && data !== null;
  const evidence = terminalOk && Array.isArray(data.evidence) ? data.evidence.filter(Boolean) : [];
  const declared = terminalOk && Array.isArray(data.unresolved) ? data.unresolved.filter(Boolean) : [];
  const complete = terminalOk && data.complete === true && evidence.length > 0 && declared.length === 0;
  return {
    scope,
    ref,
    complete,
    evidence: terminalOk ? evidence : [],
    unresolved: complete ? [] : (declared.length ? declared : [`${scope}: no completed attempt result`]),
  };
};
const compactReports = reports.map((outcome, index) => fromAttemptOutcome(outcome, `parallel-${index}`));
const pipeline = await Pipeline.start({
  items: reports,
  stages: [{
    title: "Check",
    run: ({ item, index }) => {
      if (item?.kind !== "attempt" || !item.result?.ref) {
        return { complete: false, evidence: [], unresolved: [`parallel-${index}: missing result ref`] };
      }
      return Agent.defer.start({ input: `Verify the evidence behind ${item.result.ref}; return complete/evidence/unresolved.`, schema: evidenceSchema });
    },
  }],
});
const checked = await pipeline.result();
const checkedReports = checked.map((item, index) => {
  if (item?.kind !== "completed" || !item.output?.ref) {
    return { scope: `pipeline-${index}`, ref: null, complete: false, evidence: [], unresolved: [`pipeline-${index}: not completed`] };
  }
  if (recordSpill(item.output, `pipeline-${index}`)) {
    return { scope: `pipeline-${index}`, ref: item.output.ref, complete: false, evidence: [], unresolved: [] };
  }
  const data = item.output.data && typeof item.output.data === "object" ? item.output.data : null;
  const outputOk = item.output.status === "completed" && item.output.ok === true && item.output.error == null && data !== null;
  const evidence = outputOk && Array.isArray(data.evidence) ? data.evidence.filter(Boolean) : [];
  const declared = outputOk && Array.isArray(data.unresolved) ? data.unresolved.filter(Boolean) : [];
  const complete = outputOk && data.complete === true && evidence.length > 0 && declared.length === 0;
  return {
    scope: `pipeline-${index}`,
    ref: item.output.ref,
    complete,
    evidence: outputOk ? evidence : [],
    unresolved: complete ? [] : (declared.length ? declared : [`pipeline-${index}: missing structured output`]),
  };
});
const unresolved = [...compactReports, ...checkedReports].flatMap((report) => report.unresolved);
const refs = [...compactReports, ...checkedReports].map((report) => report.ref).filter(Boolean);
const evidence = [...compactReports, ...checkedReports].flatMap((report) => report.evidence.map((value) => ({ source: report.scope, ref: report.ref, value })));
const critic = await Agent.start({ input: `Inspect relevant bodies and find concrete gaps in reports ${refs.join(" ")}. Known unresolved items: ${JSON.stringify(unresolved)}. Return complete/evidence/unresolved; set complete:false and name unresolved gaps when evidence is unavailable.`, schema: evidenceSchema });
const gaps = await critic.latestAttempt.result();
const criticSpilled = recordSpill(gaps, "critic");
const criticData = gaps?.data && typeof gaps.data === "object" ? gaps.data : null;
const criticTerminalOk = gaps?.status === "completed"
  && gaps?.ok === true
  && gaps?.error == null
  && criticData !== null;
const criticGaps = criticTerminalOk && Array.isArray(criticData.unresolved) ? criticData.unresolved.filter(Boolean) : [];
if (criticTerminalOk && Array.isArray(criticData.evidence)) {
  evidence.push(...criticData.evidence.filter(Boolean).map((value) => ({ source: "critic", ref: gaps.ref, value })));
}
const criticComplete = criticTerminalOk
  && criticData?.complete === true
  && Array.isArray(criticData.evidence)
  && criticData.evidence.length > 0
  && Array.isArray(criticData.unresolved)
  && criticData.unresolved.length === 0;
if (!criticComplete && criticGaps.length === 0 && !criticSpilled) {
  synthesisNotes.push("completeness critic unavailable");
}
const open = [...unresolved, ...criticGaps];
const firstGap = open[0];
let gapResult = null;
let gapDescendants = [];
if (firstGap) {
  const resolver = await Agent.start({ input: `Resolve this exact gap once, or return it unchanged: ${firstGap}`, schema: evidenceSchema });
  gapResult = await resolver.latestAttempt.result();
  recordSpill(gapResult, firstGap);
  const gapData = gapResult?.data && typeof gapResult.data === "object" ? gapResult.data : null;
  const gapTerminalOk = gapResult?.status === "completed"
    && gapResult?.ok === true
    && gapResult?.error == null
    && gapData !== null;
  const reportedDescendants = gapTerminalOk && Array.isArray(gapData.unresolved) ? gapData.unresolved.filter(Boolean) : [];
  if (gapTerminalOk && Array.isArray(gapData.evidence)) {
    evidence.push(...gapData.evidence.filter(Boolean).map((value) => ({ source: firstGap, ref: gapResult.ref, value })));
  }
  const gapComplete = gapTerminalOk
    && gapData?.complete === true
    && Array.isArray(gapData.evidence)
    && gapData.evidence.length > 0
    && reportedDescendants.length === 0;
  if (!gapComplete) gapDescendants = reportedDescendants.length > 0 ? reportedDescendants : [firstGap];
}
const finalUnresolved = firstGap ? [...open.slice(1), ...gapDescendants] : open;
const synthesisRefs = [...refs, gaps?.ref, gapResult?.ref].filter(Boolean);
const synthesisAgent = await Agent.start({
  input: `Synthesize reports ${synthesisRefs.join(" ")} using inspected bodies only. Preserve this known state: ${JSON.stringify({ unresolved: finalUnresolved, notes: synthesisNotes })}. Keep unavailable-critic notes separate from research gaps. Inspect relevant bodies as needed; preserve unresolved items and omitted scope. Set complete:false when needed evidence is unavailable.`,
  schema: evidenceSchema,
});
const synthesis = await synthesisAgent.latestAttempt.result();
const synthesisSpilled = recordSpill(synthesis, "synthesis");
const synthesisData = synthesis?.data && typeof synthesis.data === "object" ? synthesis.data : null;
const synthesisTerminalOk = synthesis?.status === "completed"
  && synthesis?.ok === true
  && synthesis?.error == null
  && synthesisData !== null;
const synthesisGaps = synthesisTerminalOk && Array.isArray(synthesisData.unresolved) ? synthesisData.unresolved.filter(Boolean) : [];
const synthesisComplete = synthesisTerminalOk
  && synthesisData?.complete === true
  && Array.isArray(synthesisData.evidence)
  && synthesisData.evidence.length > 0
  && synthesisGaps.length === 0;
if (!synthesisComplete && !synthesisSpilled) synthesisNotes.push("synthesis unavailable or incomplete");
return { status: finalUnresolved.length || synthesisGaps.length || synthesisNotes.length > 0 ? "partial" : "complete", ref: synthesis?.ref ?? null, reports: synthesisRefs, spilledResults, unresolved: [...finalUnresolved, ...synthesisGaps], notes: synthesisNotes };
```

Wrap the shared discovery and gap-lineage state machine around these calls when
needed. Do not invent durable control or recovery methods in this profile.

## Live Workflow API V2

Budget the complete caller-supplied `input` or `message` string to at most
4096 UTF-8 bytes before runtime-added prior-result context. This applies to
`Agent.start`, `agent.followup`, and `agent.send`. Count task text, JSON syntax,
evidence, refs, and unresolved items together; JavaScript `string.length` is
not a UTF-8 byte count.

Build critic and synthesis handoffs as a short task and accessible `result.ref`
tokens plus only essential compact context. The runtime adds bounded context
for those refs; children must inspect needed bodies and return `complete: false`
with unresolved gaps when required evidence is unavailable.
Refs do not carry lossless `result.data` or parent-local gap state. Include
known unresolved items and synthesis notes as essential compact context.
Keep every unresolved item unchanged in workflow state and in the final outcome.
If essential context will not fit, split work within the remaining budget or
disclose the omitted scope; do not truncate JSON or silently drop gap lists.

The live Workflow API V2 surface in this activation slice is the Agent and
AgentAttempt path. Start each independent worker, then observe the exact
attempt. Use a follow-up only for an explicit gap lineage that has not already
received one:

```javascript
const evidenceSchema = {
  type: "object",
  required: ["complete", "evidence", "unresolved"],
  properties: {
    complete: { type: "boolean" },
    evidence: { type: "array", items: { type: "string" } },
    unresolved: { type: "array", items: { type: "string" } },
  },
};
const synthesisNotes = [];
const spilledResults = [];
const recordSpill = (result, scope) => {
  if (result?.dataSpilledForSize !== true) return false;
  spilledResults.push({
    scope, ref: result.ref, status: result.status, ok: result.ok, error: result.error,
    dataSpilledForSize: result.dataSpilledForSize,
    submittedPayloadBytes: result.submittedPayloadBytes,
    submittedPayloadChars: result.submittedPayloadChars,
  });
  synthesisNotes.push(`${scope}: large submission retained at ${result.ref} in session storage / MSP subagent view; contents uninspected.`);
  return result.status === "completed" && result.ok === true && result.error == null;
};
const agent = await Agent.start({ input: "Inspect the implementation body; return complete/evidence/unresolved.", schema: evidenceSchema });
const tests = await Agent.start({ input: "Inspect the tests; return complete/evidence/unresolved.", schema: evidenceSchema });
const workers = [agent, tests];
const reports = await Promise.all([
  agent.latestAttempt.result(),
  tests.latestAttempt.result(),
]);
const compact = (result, scope) => {
  if (recordSpill(result, scope)) {
    return { scope, ref: result.ref, complete: false, evidence: [], unresolved: [] };
  }
  const data = result?.data && typeof result.data === "object" ? result.data : null;
  const terminalOk = result.status === "completed" && result.ok === true && result.error == null && data !== null;
  const evidence = terminalOk && Array.isArray(data.evidence) ? data.evidence.filter(Boolean) : [];
  const declared = terminalOk && Array.isArray(data.unresolved) ? data.unresolved.filter(Boolean) : [];
  const complete = terminalOk && data.complete === true && evidence.length > 0 && declared.length === 0;
  return {
    scope,
    ref: result?.ref ?? null,
    complete,
    evidence: terminalOk ? evidence : [],
    unresolved: complete ? [] : (declared.length ? declared : [`${scope}: missing complete evidence result`]),
  };
};
const compactReports = reports.map((result, index) => compact(result, `primary-${index}`));
const primaryRefs = compactReports.map((report) => report.ref).filter(Boolean);
const evidence = compactReports.flatMap((report) => report.evidence.map((value) => ({ source: report.scope, ref: report.ref, value })));
const primaryGaps = compactReports.flatMap((report) => report.unresolved);
const critic = await Agent.start({
  input: `Inspect relevant bodies and find concrete gaps in reports ${primaryRefs.join(" ")}. Known unresolved items: ${JSON.stringify(primaryGaps)}. Return complete/evidence/unresolved; set complete:false and name unresolved gaps when evidence is unavailable.`,
  schema: evidenceSchema,
});
const criticResult = await critic.latestAttempt.result();
const criticSpilled = recordSpill(criticResult, "critic");
const criticData = criticResult?.data && typeof criticResult.data === "object" ? criticResult.data : null;
const criticTerminalOk = criticResult?.status === "completed"
  && criticResult?.ok === true
  && criticResult?.error == null
  && criticData !== null;
const criticGaps = criticTerminalOk && Array.isArray(criticData.unresolved) ? criticData.unresolved.filter(Boolean) : [];
if (criticTerminalOk && Array.isArray(criticData.evidence)) {
  evidence.push(...criticData.evidence.filter(Boolean).map((value) => ({ source: "critic", ref: criticResult.ref, value })));
}
const criticComplete = criticTerminalOk
  && criticData?.complete === true
  && Array.isArray(criticData.evidence)
  && criticData.evidence.length > 0
  && criticGaps.length === 0;
if (!criticComplete && criticGaps.length === 0 && !criticSpilled) {
  synthesisNotes.push("completeness critic unavailable");
}
const open = [...primaryGaps, ...criticGaps];
const gapOwner = compactReports.findIndex((report) => report.unresolved.length > 0);
const firstGap = gapOwner >= 0 ? compactReports[gapOwner].unresolved[0] : (criticGaps[0] ?? null);
const gapAgent = gapOwner >= 0 ? workers[gapOwner] : critic;
const gapDescendants = [];
let followupRef = null;
if (firstGap) {
  const followupAttempt = await gapAgent.followup({ input: `Resolve this exact gap once, or return it unchanged: ${firstGap}` });
  const followupResult = await followupAttempt.result();
  recordSpill(followupResult, firstGap);
  followupRef = followupResult?.ref ?? null;
  const data = followupResult?.data && typeof followupResult.data === "object" ? followupResult.data : null;
  const followupTerminalOk = followupResult?.status === "completed"
    && followupResult?.ok === true
    && followupResult?.error == null
    && data !== null;
  const reportedDescendants = followupTerminalOk && Array.isArray(data.unresolved) ? data.unresolved.filter(Boolean) : [];
  if (followupTerminalOk && Array.isArray(data.evidence)) {
    evidence.push(...data.evidence.filter(Boolean).map((value) => ({ source: firstGap, ref: followupResult.ref, value })));
  }
  const descendants = reportedDescendants.length > 0 ? reportedDescendants : [firstGap];
  const followupComplete = followupTerminalOk
    && data?.complete === true
    && Array.isArray(data.evidence)
    && data.evidence.length > 0
    && reportedDescendants.length === 0;
  if (!followupComplete) gapDescendants.push(...descendants);
}
const unresolved = firstGap ? [...open.slice(1), ...gapDescendants] : open;
const synthesisRefs = [...primaryRefs, criticResult?.ref, followupRef].filter(Boolean);
const synthesis = await Agent.start({
  input: `Synthesize reports ${synthesisRefs.join(" ")} using inspected bodies only. Preserve this known state: ${JSON.stringify({ unresolved, notes: synthesisNotes })}. Keep unavailable-critic notes separate from research gaps. Inspect relevant bodies as needed; preserve unresolved items and omitted scope. Set complete:false when needed evidence is unavailable.`,
  schema: evidenceSchema,
});
const final = await synthesis.latestAttempt.result();
const finalSpilled = recordSpill(final, "synthesis");
const finalData = final?.data && typeof final.data === "object" ? final.data : null;
const finalTerminalOk = final?.status === "completed"
  && final?.ok === true
  && final?.error == null
  && finalData !== null;
const finalUnresolved = finalTerminalOk && Array.isArray(finalData.unresolved) ? finalData.unresolved.filter(Boolean) : [];
const finalOk = finalTerminalOk
  && finalData?.complete === true
  && Array.isArray(finalData.evidence)
  && finalData.evidence.length > 0
  && Array.isArray(finalData.unresolved)
  && finalData.unresolved.length === 0;
if (!finalOk && !finalSpilled) synthesisNotes.push("synthesis unavailable or incomplete");
return { status: unresolved.length || finalUnresolved.length || synthesisNotes.length > 0 || !finalOk ? "partial" : "complete", ref: final?.ref ?? null, spilledResults, unresolved: [...unresolved, ...finalUnresolved], notes: synthesisNotes };
```

Check `dataSpilledForSize` first. For inline results, read structured child
data from `result.data`, including `data.unresolved`; the top-level result
object is only the envelope. To stop a whole launched run
from the parent conversation, call `work_stop` with `work_id` set to the
`workId` from the launch result when that tool is available. `interrupt()` stops
only one live child attempt: check `agent.latestAttempt.getStatus()` and call
`agent.latestAttempt.interrupt()` before awaiting
`agent.latestAttempt.result()`. After `result()` resolves, the attempt is
terminal.

For later-owner recovery, invoke the Workflow tool with the returned
`scriptPath` and `resumeFromRunId`; do not add those fields to the script API.
Wrap the shared discovery and gap-lineage state machine around the Agent calls,
and preserve unresolved descendants unchanged at the final boundary.
