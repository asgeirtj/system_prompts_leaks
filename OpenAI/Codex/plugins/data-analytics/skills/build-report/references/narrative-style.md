# Write reports people want to read

Write like an analyst explaining a decision to a colleague. Answer the question directly, connect the evidence into an argument, and explain why it matters. Match the depth to the reader and the decision. These are writing rules, not a required report outline.

These rules control communication, not analytical scope. Do the analysis and keep the evidence, source checks, and material caveats needed for a sound answer. Improve the reading experience by choosing clear conclusions, ordering them around the reader's question or decision, using plain language, and moving nonessential detail into inspectable sources or progressive disclosure; do not make the analysis shallower to make the prose shorter.

## Give the title a story

Default to a clear, narrative title: the strongest supported takeaway, an important tension, or the decision the report informs. Name the subject so the title makes sense on its own. Earn attention with a specific finding, not suspense, inflated language, cleverness, or unsupported claims. A natural sentence is usually better than "Growth analysis," a decorative label, or the user's question repeated verbatim. Read it aloud: if it sounds like compressed analyst shorthand rather than something a colleague would naturally say, replace the abstract phrasing with the concrete observation or implication. Keep a question or neutral description when the answer is genuinely unresolved or the reader needs a formal recurring-report title. Preserve requested wording and saved user edits.

For example, "Adoption is ahead of plan, but Search needs retention work" tells a clearer story than "Product adoption and engagement." "Start with cancellation and refund recovery" is a recommendation, not a claim that the work has shipped or reduced demand. These are examples of title judgment, not reusable findings. Do not turn accounting contributions or correlations into causal headlines. Let the opening add evidence and implications instead of repeating the title.

## Make the argument easy to follow

- Before drafting, identify the audience, the question or decision, the conclusions that matter most, and the evidence or implications needed to make them credible.
- Lead with the strongest supported answer. Use a natural title and headings that help a reader understand the result, method, or open question. Avoid compressed semicolon headlines and labels such as "Analysis," "Key insights," or "Working readout" when they add no information. Omit a subtitle or date line when the opening already supplies that context.
- Write complete, concrete finding headlines and ordinary sentences. Name the product, customer, or behavior instead of hiding it behind business shorthand: prefer "People installed the feature but have not used it" to "Activation opportunity." Preserve a technical term only when it is accurate and useful, and define it when the intended reader may not know it.
- Prefer familiar words, concrete subjects, direct verbs, and active voice where the actor is known. Keep passive voice when the actor is unknown or unimportant; never invent one to satisfy a style rule. Explain a necessary technical term once, where the reader needs it. Put detailed formulas and accounting terminology in methods or source inspection unless they change the decision.
- Give important numbers a comparison and a consequence. When groups differ in size, use a rate with a clear denominator and comparable observation window to compare performance. Keep absolute counts when they help prioritize the size of an opportunity; do not mistake the largest group for the worst-performing one. A finding should explain more than its chart already shows. Do not repeat the same takeaway in the title, opening, metric cards, and section text.
- Build a connected argument rather than a sequence of metric summaries. For a diagnostic question, usually open with the conclusion and strongest supported explanation, then use the evidence sections to establish why the reader should believe it. Put a plausible but untested explanation next to the evidence that motivates it. A status brief or methods-first report can use a different order when that better serves the question.
- Distinguish a recorded decision from the report's recommendation. Attribute an actual decision to its source and owner when known. Name the specific readout, team, or person instead of unexplained references such as "the authors." When no decision has been recorded, introduce the proposal with "**Recommendation:**" or state it directly under a recommendations heading. Avoid "Our recommendation" unless a real, identified group owns it. Use descriptive source links that tell the reader what question, finding, or decision they will find. A date alone is not useful context.
- Keep the answer, strongest evidence, interpretation, and any qualification that changes the conclusion visible in the reading flow. Use progressive disclosure selectively for full calculations, long tables, methods, or investigation plans. Use the existing `src/content/shared/ReportDisclosure.jsx` helper for optional detail, retaining normal body typography instead of shrinking less-important prose. Do not turn every finding into an accordion or automatically open detail in Edit mode. Include reader-visible detail in static exports, and keep disclosed text editable and its sources accessible.
- Use short paragraphs, natural transitions, and real lists for parallel points. Let the idea determine sentence length and structure. Do not force sentence variety or a mechanical fact-then-caveat pattern. Read the passage as a whole and simplify anything that interrupts the argument. Use emphasis sparingly. Do not turn every sentence into a clipped fragment or bold every number.
- Keep a caveat only when it changes the reader's interpretation or action. State it once beside the affected claim. Do not repeatedly announce that a comparison is "observed," "reviewed," "source-backed," or "not causal." Explain the specific uncertainty instead.
- Prefer a useful positive interpretation over a list of things the data cannot prove. Connect the supported finding to the next piece of evidence or the decision it informs. Keep a negative statement when it prevents a material misunderstanding; otherwise move technical qualification into inspectable detail or remove it. Optional hover/focus context may carry exact periods, definitions, or intervals, but must also work on touch and in exports. Never hide a qualification that would reverse the conclusion.
- Distinguish measured contributions from explanations that still need testing. Say what evidence supports a hypothesis, what could also explain the result, and what test would resolve the uncertainty. Do not use a generic disclaimer to avoid an analysis the available evidence can support.
- Write parallel recommendations as real Markdown bullets, usually with a short emphasized opening and one supporting sentence. Explain what is known, what the proposed task adds, and which choice its result could change. Keep the explanation beside the finding without scattering extra to-do lists through the report.
- Make the recommendation understandable without translating abstract strategy language. Name the actual change being considered, the outcome to measure, and the result that would support changing course. If that outcome has no agreed measure yet, say so and make defining it part of the next task. Prefer "test whether the new onboarding flow helps more people finish their first task" to "judge discovery by net useful work."
- Preserve user-authored terminology and requested technical detail. Plain language must not change the metric, conceal a limitation, or erase a meaningful distinction.

## Examples

| Avoid | Prefer |
| --- | --- |
| "Retention improves; expansion remains constrained" | "A larger share of customers stayed, while growth from existing customers remained limited" |
| "Sparse feedback tempers the Feature XYZ case" | "Too few people rated Feature XYZ to be confident it is better" |
| "The highest-retry cohort accounts for a disproportionate share of failure burden" | "Customers who retry most often account for an unusually large share of failures" |
| "The effective share matters more than expansion of the eligible pool in this aggregate bridge" | "Most of the reported increase comes from crediting a larger share of subscription revenue to the product" |
| "The launch is a plausible mechanism, not a measured lift" | "The launch may have helped, but we have not measured how much" |
| "This analysis does not establish causality" | "The two groups may involve different kinds of work" |
| "The decision is to expand the program" when no decision was recorded | "**Recommendation:** Test the program with the groups most likely to benefit" |
| "The original July 20 question" | "The question of whether repeat use reflects new demand" |
| "This cannot tell us what would have happened otherwise" | "The randomized comparison below estimates how much activity the change added" |
| "Review the underlying accounts and investigate retention" | "Contact the accounts with an overdue renewal or a recorded onboarding problem" |

These examples demonstrate voice, not facts to reuse. Choose wording that remains true for the actual evidence.

Keep the inherited readable typography and each editable Markdown unit coherent. A brief and a technical report can use different lengths and structures without adopting different standards for clear writing.

The [report skill](../SKILL.md#choose-useful-next-steps) owns next-step selection and placement; this reference owns wording and presentation examples.
