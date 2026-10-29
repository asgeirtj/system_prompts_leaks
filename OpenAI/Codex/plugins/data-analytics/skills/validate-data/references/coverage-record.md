# Deep-review coverage record

Keep one compact JSON record in the review's working notes, outside the delivered app and publication source. Generate its inventory from actual scoped components, controls, major claims, comparisons and required questions; an absent required view remains a question unit. Declare the ten categories in [deep review](deep-review.md#record-honest-coverage), marking inapplicable categories with reasons.

Build this record from calculation output, existing review notes and parallel reviewers' evidence as work proceeds. Do not spend the review transcribing an exhaustive subcheck checklist. A check may bundle related obligations when one evidence result establishes all of them; split checks when their outcomes or change dependencies differ. Keep missing observations explicit. One batched calculation or shared source check may serve several components only with an actual component-to-result mapping; retain each component in its category total. Counts of queries, source rows or browser calls do not replace component counts.

Use this shape; the example is illustrative and does not assert a real check:

```json
{
  "version": 1,
  "artifact": { "identity": "dashboard-id", "revision": "snapshot-and-source-hash", "view": "Overview; all accounts" },
  "categories": [
    {
      "id": "value-accuracy", "label": "SQL/value accuracy", "applicable": true,
      "assessment": "The eligible-population definition still needs inspection."
    }
  ],
  "units": [
    {
      "id": "activation-rate", "label": "Activation rate", "kind": "component",
      "revision": "inputs-logic-definition-and-view-identity",
      "categories": {
        "value-accuracy": {
          "checks": [
            { "id": "eligible-denominator", "state": "unverified", "evidence": [] }
          ],
          "findings": []
        }
      }
    }
  ]
}
```

Kinds are `component`, `claim`, `question`, `comparison` and `control`. Category IDs are locally stable names. Use `unverified`, `passed` or `failed` for the planned checks on each unit/category. Passing/failing observations require nonempty `evidence` references and their inspected unit `revision`. Evidence points to actual query/calculation notes, governing passages, source bindings, observed states or final screenshots as appropriate. It must establish the applicable requirements; a source title, successful build or clicked control is not acceptance. Category `assessment` contains the concise, evidence-backed judgment for the public table, including consequential limitations.

Omitting category `inventoryComplete` preserves the existing meaning: the listed items declare the complete scoped inventory. If the applicable inventory itself is incomplete, set `inventoryComplete: false` and provide `reason` describing the gap. This is separate from incomplete checks on an otherwise known inventory. The helper retains the number of listed items internally, displays the public denominator as `unknown`, and marks overall coverage partial. An applicable category with no listed items is allowed only when its inventory is explicitly incomplete.

Use a reproducible unit revision derived from the inputs, definition, computation and relevant view/presentation. Preserve the overall artifact revision and the mapping that justifies reuse. On a relevant change, update the unit revision and invalidate affected checks. Do not replace their revision labels without rechecking. Unaffected units may retain their successfully inspected revision. Keep earlier evidence in the working notes when updating current observations.

Findings have stable `id` and `status: "open" | "fixed"`. An open finding must identify demonstrated failures through `checkIds` referencing evidenced failed checks in that unit/category, or carry its own nonempty `evidence` array and inspected `revision`. A suspicion without evidence is a question to investigate, not an observed defect. Current or stale demonstrated failures remain visible until verified repair. Fixed findings list `checkIds` identifying all checks needed to verify that repair's affected result. A repair becomes fixed only after those checks pass against the current revision; until then it remains open even if edits were applied. Other unresolved checks or defects on the same unit remain visible without undoing a verified independent repair. Update failed observations after verifying a repair, retaining before/after evidence. Resolve policy choices from evidence or user input rather than changing definitions to make counts pass.

Run `node <validate-data>/scripts/summarize-coverage.mjs <coverage.json>` for the internal counts, or add `--scorecard` for the public three-column table: **Category | Observed defects | Assessment**. The public format omits declared-unit, checked/applicable and unverified columns.

`Observed defects` displays `# bad / # total`: distinct scoped items with a demonstrated unresolved defect divided by the category's total applicable items, or `# bad / unknown` when the inventory is incomplete. Count an item once in a category even if it has several defects; a demonstrated defect on a partially checked item still counts. Verified repairs leave the numerator only after current passing observations resolve the affected result. N/A displays as `N/A`, never `0 / 0`. A `0 / N` means no observed remaining defects; it is not a claim that all N items passed. The renderer requires a real assessment for every applicable category and automatically appends inventory limitations and named incomplete/stale evidence gaps (with remaining names retained in the internal record).

The helper rejects duplicate units/checks, missing evidence references, empty applicable categories and premature fixed states. It preserves internal checked, passed, unresolved and repaired counts. Categories overlap; never sum them into an accuracy percentage. The helper cannot prove inventory completeness or the truth/sufficiency of evidence—reconcile these with the artifact and requested questions.

Before final handoff, compare the record with the latest source and rendered observations. Save named gaps and remaining work if a real source, tool, decision or budget limit prevents completion. Resume from this record; do not invent retrospective counts or restart unchanged checks. Readiness remains a separate analytical judgment from coverage completeness.
