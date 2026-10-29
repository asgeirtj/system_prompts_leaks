# Data context authoring

Read this reference when creating or maintaining data definitions is requested, including supplied definitions the user wants saved during context setup. Missing data definitions or merely linking an existing provider do not invoke it. Use the transitions below for one review and finalization of the requested result, including working preferences when present.

## Purpose and definition boundary

Create an inspectable, source-backed account of how a coherent data area should be interpreted. Keep metric definitions, entity distinctions, filters, dimensions, table and dashboard authority, reporting-area rules and ordering, query patterns, and caveats here. General analysis preferences, visual design, and generic reference resources must not absorb those data definitions.

New data definitions belong under Data Context in the same SKILL.md as working guidance for the same audience. Use Entities, Metrics, Filters, Dimensions, Pitfalls, and Open Questions subsections, followed by Sources, with the actual definitions and source inventory in that file. Link original evidence without moving the guidance into additional files. Use one frontmatter block and preserve the meaning and applicability of each rule. Definitions-only requests need no empty working-style sections. Follow the parent's [Prepare either draft](../SKILL.md#prepare-either-draft) for audience boundaries and existing context reuse.

Reuse an applicable canonical data-context skill or provider before creating another copy. Preserve its identity, owner, and source; link to the actual entry point. Update existing data context only within the requested change and authorized editable source. A canonical reporting dashboard's role and priority belong in Sources, alongside the relevant table grains, join keys, and freshness limits. That authority alone does not establish a presentation preference; supported style guidance follows the parent workflow's style guidance.

Introduce the flow and expert review once at S1. Use the [parent's Prepare either draft naming rules](../SKILL.md#prepare-either-draft) for new identities; do not ask a destination or packaging question. Preserve already-reviewed layouts and reference paths during updates or packaging; do not silently migrate existing combined or separate skills. Keep deferral history in task notes or conversation, never finalized runtime files.

For legacy combined inputs, recognize an existing `Data Semantic Layer` heading as the definitions section. Preserve approved headings, skill names, external provider identities, and reference paths when maintaining or packaging those inputs; use `Data Context` for newly generated headings and titles. This naming convention does not migrate existing installations.

Use the quoted copy verbatim with resolved placeholders. Follow the [parent's elicitation and visible-instruction rules](../SKILL.md#principles), including for direct entry here. Group related, independently answerable questions with the necessary context above them, following the parent's input-handoff rules. When/Next notes and conditional labels are execution guidance, not spoken copy. Reuse answered questions and source evidence.

## Data-context workflow states

### S1 · Introduce the data context and establish its domain

When: creating or maintaining data definitions was requested. Reuse known identity, data/workflow coverage, intended audience, and sources. Inspect an already identified applicable data-context skill or provider first. If it covers the request without changes, retain its entry point and return to the combined review, or report the existing entry point for a request for data definitions only; do not recreate or reinstall already available data context. For new context, follow [P2](../SKILL.md#p2--choose-an-approach) for unresolved references and scan direction, then [P1A](../SKILL.md#p1a--clarify-intended-audience-when-needed) if intended audience is unclear. For updates, clarify only new ambiguity. Continue in the resolved layout without repeating intake.

Introduce this flow once:

> Data context captures the definitions and exceptions that help an analyst use your data correctly. Useful inputs include:  
>  
> - Metric definitions: formulas, populations, units, and time windows.  
> - Entities and relationships: what records represent, IDs, table grain, and joins.  
> - Filters and dimensions: agreed segmentation and time rules.  
> - Trusted sources: canonical tables, dashboards, and reviewed query examples.  
> - Known caveats: freshness, exclusions, changes in tracking, and misleading comparisons.  
>  
> I'll inspect the available sources and check the relevant unresolved topics with you. A data scientist or domain expert is best placed to verify the definitions and exceptions.

These are optional examples of helpful inputs, not required fields or a mandatory questionnaire. Reuse known sources and domain, research first, and verify only relevant unresolved topics, grouping related questions where useful.

If the domain is missing:

> What data or reporting area should this data context cover?

If the domain is clear:

> I'll put the definitions, filters, dimensions, pitfalls, open questions, and sources for {domain} in clear tables under Data Context, alongside any working guidance for the same audience.

If updating existing data context:

> I'll review {existing skill} and update the parts affected by {requested change}.

Next: S2.

### S2 · Get a starting source

When: no useful source has been supplied and no accepted scan can find a starting source. Reuse P2's references/scan answer; when a scan was requested, begin bounded source discovery from the known domain instead of requiring the user to provide a seed. Ask only if neither route supplies enough direction.

> What is the best starting source for {domain}, or which of these details can you provide directly?

If sources are already available:

> I'll start with {sources} and follow relevant links to resolve important gaps.

Next: S3.

### S3 · Research and build the source inventory

For new context, apply [P2's research choice and additional-pass offer](../SKILL.md#p2--choose-an-approach), including after direct entry here with supplied sources. Reuse any answer and honor source-only restrictions. Inspect supplied material while the optional offer is pending; broader research waits for acceptance. Then follow [the source inventory contract](#build-and-maintain-the-source-inventory) and [durable evidence guidance](#inspect-durable-evidence) within that scope without another routine question.

When supplied sources include a reporting example for the requested workflow, follow [Interpret reporting examples](../SKILL.md#interpret-reporting-examples), even after direct entry here. Carry useful working guidance into the same context skill and review; do not treat an earlier definitions-only route as a user restriction. Rendered labels that change metric interpretation belong in Data Context; presentation conventions belong in the applicable working-guidance sections of that same file.

> I'll inspect the available sources, record what each supports, and separate verified facts from gaps or conflicts before asking you to review them.

After a scan finds new useful sources, use the parent's [Review scan discoveries](../SKILL.md#review-scan-discoveries) checkpoint before incorporating their findings into the context draft. Show the source links and what they would add, then wait for the user's selection. Reuse already supplied or accepted sources without another selection. Resume here with the chosen evidence; source acceptance does not resolve factual conflicts or replace expert verification. Routine verification within accepted sources and scheduled upkeep follow their existing scope.

After source selection, when required:

> The sources support {coverage}. I found {important gaps or conflicts}. I'll show the relevant findings with the questions that need your input.

Next: the first relevant S4 topic. Skip irrelevant or already-resolved topics. Use S3A for consequential access gaps, S3B for conflicts, and S5 for corrections, skips, or pauses; do not turn the topics into a mandatory questionnaire.

### S3A · A source is inaccessible

When: a source needed for a consequential claim cannot be read.

> I couldn't access {source}, which is needed to verify {claim}. How would you like to proceed?

Options:

- Provide the source content
- Use the available sources
- Add it later

If proceeding with available sources:

> I'll keep the data context within what the available evidence supports and leave that claim unresolved.

If no usable evidence remains:

> I don't have enough source material to create useful data context yet. I've kept the source plan in the task notes so we can resume later.

Return to parent Review when working preferences remain to review; otherwise report the deferral and stop. Do not create an empty data-context skill or index as a completed result.

### S3B · Sources conflict

When: two sources disagree about a consequential definition or authority.

> {Source A} says {claim A}, while {source B} says {claim B}. Which should govern {specific use case}?

If the expert cannot resolve it:

> I'll record the conflict and keep the disputed claim out of authoritative guidance until it can be resolved.

Continue with supported material, or defer as in S3A if the conflict blocks useful work.

### S4A · Verify domain and source authority

> The sources establish {domain and source hierarchy}, with {important limitation}. What needs correcting?

Possible concise options when appropriate:

- Confirm
- Correct it
- Skip this topic

Incorporate the answer before moving on. Reporting-dashboard roles and ordering stay in the data context.

Next: S4B or the next relevant unresolved topic; after the last topic, S6.

### S4B · Verify entities and relationships

Use only when entity, table, or join rules are relevant and there is evidence to review.

> For {entity}, I found {meaning, grain, and key relationships}. What needs correcting?

If the evidence is missing:

> I couldn't verify {specific entity or relationship}. What source or clarification should I use?

Do not require the expert to complete an entire warehouse catalog.

Next: S4C or the next relevant unresolved topic; after the last topic, S6.

### S4C · Verify metrics, filters, and dimensions

> The documented definition of {metric} is {definition}, using {population, time rules, and filters}. What needs correcting?

Use the same pattern for other relevant metrics or filters. Group a few related questions when each has enough evidence and context to answer independently; resolve dependent questions in order.

If the user supplies a new definition:

> I've recorded your clarification for {metric}, with its scope and source. {Next relevant question, if any}

If the clarification conflicts with governed evidence, use S3B rather than silently choosing.

Next: S4D or the next relevant unresolved topic; after the last topic, S6.

### S4D · Verify query patterns

Use only when a reviewed query or query pattern is relevant.

> This query pattern answers {question} using {tables, filters, and joins}. What should change before it is saved as guidance?

If the SQL was inspected but not executed:

> The SQL has been reviewed but not run; I'll preserve that distinction.

Do not execute a query just to make the data context appear complete.

Next: S4E or the next relevant unresolved topic; after the last topic, S6.

### S4E · Verify caveats and related references

> I found {freshness limits, comparability issues, or interpretation caveats}. What else should an analyst know before using this data?

For data context covering reporting sources only:

> I've mapped {reporting questions} to {the relevant source roles}. What should change in that mapping?

Keep dashboard authority and reporting hierarchies here, not in general context fields.

Next: S4F or the next relevant unresolved topic; after the last topic, S6.

### S4F · Verify coverage and open questions

> This data context covers {verified coverage}. {Unresolved claims} remain outside authoritative guidance. What needs changing before final review?

Real limitations of useful data context may remain beside the relevant facts. Do not convert missing data context or a setup deferral into runtime prose.

Next: S6 once the useful content is reviewed.

### S5 · Acknowledge a correction and continue

After any expert correction:

> I've updated {specific change}. {Next relevant question or related group}

If the user skips a topic:

> I'll leave that topic out and continue with {next relevant topic}.

If the user pauses the whole process:

> I've saved the work so far at {draft location}. We can resume the review when you're ready.

Do not imply an unanswered question was verified.

### S6 · Write the data-context file

Once useful source-backed content exists, read the complete [single-file template and review checks](#write-one-concise-data-context-file) before writing; recover any portion omitted by a truncated read. No extra approval question.

> I'll organize {data-context skill name} into concise tables in one file, with sources beside the definitions.

When working preferences for the same audience also exist:

> I'll keep the working guidance and these definitions in the same skill and review them together.

When personal preferences accompany shared definitions, keep them in separate user-owned context and name that destination in the combined review.

For newly authored domain context, put the tables beneath Data Context in the combined skill, with one frontmatter block. For reporting guidance reusing company definitions, follow [P5's structure choice](../SKILL.md#p5--add-data-context): a source pointer can suffice, and genuine report-specific differences use a compact scoped section. During ordinary maintenance of an approved older layout, describe the actual section and reference files being updated.

Only create useful context. For a domain dictionary, apply the template's scoped absence statements where a required category has no supported entries; remove unused placeholders and authoring notes. Next: S7.

### S7 · Final review

Run the [content and structure checks](#review-checks), then use [P4's concise content summary and draft handoff](../SKILL.md#p4--present-the-editable-draft) for the whole context. Link the complete file so the user can review its tables without opening supporting files. Name any separate personal destination and distinguish it from shared content. Save and validate the requested files now; the user can review them at their convenience. Do not require a review reply, specific word, or additional approval to complete the draft request.

> The draft is ready at {context SKILL.md and any separately scoped personal context}. {Concise content summary and applicable review/install guidance from P4.}

The draft request is complete at this handoff. Requested edits return to S5 or the affected topic. An installation or packaging request, including an existing request, proceeds to S8 using its actual authorization without another review gate. Honor no-install constraints. For [Source upkeep](#source-upkeep), retain the agreed automatic-update scope or explicit review-only requirement.

### S8 · Finalize and hand back

> I'll apply your last edits, check the tables and source links, and save the final data context.

After actual completion, show the combined context SKILL.md in the supported sidebar editor, or provide it inline/linked when unavailable. Identify any separate personal destination or preserved existing layout accurately. Use [P7's completion handoff](../SKILL.md#p7--context-ready), including its concise summary of the finalized content. Describe the actual result; do not claim files are open until the editor action succeeds.

Identify the definitions and working guidance in the combined skill and its intended audience. Describe existing external dependencies and any separately scoped personal context accurately.

Use [packaging and sharing](packaging-and-sharing.md) once for the requested installation or file-only outcome and report how to use and share the actual result. Do not claim warehouse deployment, installation, or a refresh automation unless it actually occurred.

## Start with a coherent domain

Reuse the supplied data/workflow coverage, explicit applicability limits, and sources. Organize one coherent product, business, metric, source, or reporting area at a time. Infer that organizing domain from clear supplied context while preserving the parent's other applicable guidance; ask only when the answer materially changes the investigation or output. A topic, company, or team name establishes subject matter, not intended audience; use [P1A](../SKILL.md#p1a--clarify-intended-audience-when-needed) for that conditional clarification. Do not ask for an organizational level to establish the domain. Separate unrelated domains unless the user requests shared data context.

Proceed when the user supplies a useful starting point: a maintained model or metric document, namespace, reviewed SQL, verified dashboard, report, notebook, repository, or relevant owner discussion. Use authorized source access; availability alone does not authorize creating data context. Do not repeat intake that is already answered.

An explicit source-audit or planning-only request stops at the inventory and next-source recommendation; S2/S3A handle missing evidence.

## Build and maintain the source inventory

Before investigating, list the supplied sources, their intended contribution, access state, and missing high-value source types. Update the inventory as each source is inspected. For new or reformatted data context, save the concise inventory in the same SKILL.md's Sources section. Preserve the inventory location during ordinary maintenance of an approved existing layout. For planning-only work, keep it in conversation or task notes. Keep raw exports and crawl logs outside the generated context.

Use the [Sources table](#write-one-concise-data-context-file) for source type, exact locator, what it supports, authority, inspection status/date, and consequential limits. Put missing evidence and unresolved conflicts in Open Questions, linking the affected rows. Keep meaningful coverage and access limits in the opening; do not repeat an investigation log.

Use **Limited** for one useful source with important gaps; **Directional** when multiple source types agree but gaps remain; **Strong** when authoritative definitions or transformation code and corroborating table/dashboard evidence support the key facts; **Conflicted** when important definitions disagree; **Blocked** when a required source or permission is unavailable. These describe evidence coverage, not approval to treat an inference as a definition.

Never claim a source was inspected merely because its link was found. Distinguish supplied, inspected, inaccessible, missing, conflicting, and rejected or lower-confidence sources. Keep exact canonical locators and known source-access requirements. Do not store credentials, raw sensitive data, row-level examples, or copied transcripts.

## Source upkeep

Use [P7's optional offer](../SKILL.md#p7--context-ready) after useful Data Context is finalized and verified sources can be read again without another upload. Skip the offer for preferences-only context, incomplete drafts, snapshot-only sources, existing upkeep jobs, and scheduled runs. A declined or unanswered offer leaves the completed context ready to use and creates no job. Existing scheduled runs enter [Check and apply changes](#check-and-apply-changes) directly. A request to check sources once uses those run rules without scheduling.

### Set up after opt-in

Accepting P7's offer gives standing permission to apply verified, unambiguous updates within the scope below. An explicit request to keep context updated gives the same permission. Do not present a choice between review and automatic updates or ask for that permission again. Silence gives no permission. Preserve an explicit request to review changes before applying them, including that restriction in an existing task; do not convert it to automatic updates.

Reuse the offered or established check frequency, or P7's default when none was supplied, and the user's timezone. Use sensible host defaults for unspecified timing details. Ask only for information still necessary to schedule safely that cannot be inferred, through the parent's required-input rules. A one-time check request does not authorize a recurring task.

Record the owned canonical source, exact affected skills and references, allowed changes, existing expert overrides and authority rules, and authorized local refresh or file-only outcome. If the user cannot edit an existing shared skill/provider, offer monitoring and proposals for its maintainer.

Use available native scheduling tools and their current contracts; inspect existing jobs and update a matching job instead of duplicating it. Follow host task-type rules, including Codex's heartbeat default when applicable. Do not assume cloud-task support or invent scheduler commands. Verify that the scheduled runtime can read the sources and reach the intended context or proposal destinations. If scheduling is unavailable, explain that limitation without claiming activation or changing the completed context.

Persist a runnable prompt with the canonical context paths, source locators and access prerequisites, cadence, agreed automatic-update scope or explicit review-only restriction, permitted destinations, preserved overrides, authority rules, and comparison baseline or source revisions when available. Include the run contract below; task history alone is insufficient. Keep scheduling, comparison state, and notification settings with the host task outside distributed runtime files. Retain the accepted baseline separately from last inspection so unaccepted proposals never become active guidance. Preserve source provenance in the context and keep the applied diff and prior version or backup outside the distributed package so an update can be adjusted or undone. After successful tool readback, confirm how often checks will run, that every update will be summarized, and that uncertain changes will be brought back to the user. Honor any explicit review-only restriction in that confirmation.

### Check and apply changes

On each run, read the latest canonical context and recorded source inventory, then re-read the relevant sources. Compare data meaning: definitions, entities, joins, filters, authority, query patterns, and caveats. Routine KPI values and unrelated source edits are not context changes. Preserve working preferences, personal overlays, expert corrections, and established authority. Flag conflicts or uncertain changes for review instead of replacing those decisions. An inaccessible source does not justify deleting its guidance or claiming it unchanged.

- **Automatic updates after opt-in:** Standing permission authorizes only verified, unambiguous changes within the recorded scope. Validate the candidate's evidence, content, and links before applying it; leave active context intact if validation fails. Re-read the destination before applying and rebuild the change if it has changed. Apply to the owned source, then use the supported local refresh only when authorized. Preserve file-only outcomes. Propose everything outside that scope; do not repeat review for covered changes.
- **If review was explicitly requested:** Prepare the complete relevant diff. Save proposals outside the active context and installation; leave both untouched until the user accepts. Apply accepted edits through S7/S8 without repeating resolved intake.

Follow [packaging and sharing](packaging-and-sharing.md#choose-a-durable-source) for source ownership and recovery. Never edit managed installation caches directly. Shared-source changes need versioned distribution through the supported route; upkeep alone authorizes neither publication nor recipients' installations, and installed copies do not automatically synchronize.

After every applied update, give a concise dated summary in the task with what changed (before and after where useful), why, the supporting sources, and a link to the updated context. Tell the user they can ask to adjust or undo it. Automatic updates must remain visible even when no approval was needed. If the user adjusts or reverses an update, preserve that direction in the upkeep scope so the next run does not silently undo their correction. Report an applied source change separately from a failed or unavailable installation refresh. For proposed or uncertain changes, state what needs the user's input. Compare proposals and failures with the last reported state so unchanged pending items do not trigger repeat notifications. Checks that make no changes and find no new issue stay quiet; avoid rewriting runtime files just to record a check.

## Inspect durable evidence

Make a bounded read-only source pass using the domain's names, metrics, namespaces, and model paths. Favor transformation code and tests, maintained metric documents, and verified owner-reviewed dashboards over query history or informal discussion. Source authority, applicability, and recency matter; preserve conflicts and resolve them with the expert instead of silently choosing.

- **Models and documents:** Read formulas, entity definitions, filters, exclusions, time rules, lineage, tests, and stated authority. Inspect enough surrounding logic to capture intermediate aggregation.
- **Tables and metadata:** Capture fully qualified identifiers, row grain, keys, partitions, freshness, ownership, and deprecation. Start with metadata and SQL text; avoid broad scans or raw-row collection.
- **Dashboards, reports, and reviewed queries:** Inspect underlying SQL, parameters, filters, dimensions, grouping, metric hierarchy, business ordering rules, and source tables. Distinguish canonical reporting authority from an example implementation. Read supplied SQL before considering execution; do not call unexecuted SQL tested.
- **Owner clarifications and existing data context:** Capture concise attributed corrections and canonical links. Treat historical use or discussion as evidence of use, not automatic metric authority. If an expert correction conflicts with a governed definition, record the conflict and needed resolution.

Use the available tool suited to the source. If access is missing, record it and accept supplied documents or SQL, or defer in task notes. Do not configure infrastructure or install connectors as a side effect of documenting data definitions. Execute a safe aggregate check only when it resolves a concrete concern through the applicable access/query workflow.

Keep inferred hypotheses in unresolved working notes. Do not save them as authoritative runtime definitions without expert verification and supporting provenance. Document real coverage limits and unresolved source conflicts beside the affected facts; keep setup deferrals and follow-up history out of runtime files.

## Write one concise data-context file

Create data context only when useful, source-backed facts exist and an applicable canonical skill or provider does not already cover the request. Preserve suitable existing identities; resolve names and frontmatter descriptions with [Prepare either draft](../SKILL.md#prepare-either-draft). Adapt the template description to the actual domain and intended uses; keep individual metrics and source details in the body.

For new context or a requested reformat, the entire data context lives in its SKILL.md: definitions, source inventory, necessary query/join notes, pitfalls, and open questions. Do not generate a separate index, metric catalog, source inventory, or evidence file. Original sources remain links for verification; they do not replace the concise definitions here. Plugin manifests, README installation instructions, and skill UI metadata may accompany the file but must not hold data definitions needed to understand it.

Choose the applicable structure using [P5](../SKILL.md#p5--add-data-context). This full template is for substantive domain definitions, including a personal analytical domain; it is not required for reporting preferences that reuse existing definitions. For those, keep source-use rules and only actual report-specific metric differences. Omit Data Context if those source-use rules are sufficient, and omit inapplicable category headings rather than filling them with reporting artifacts or absence statements.

For substantive domain definitions, use the six category headings below in this order, then Sources. In a combined skill, insert these beneath Data Context at heading level 3, retaining the combined skill's frontmatter, title, applicability, and working sections. The standalone template below is for definitions-only output; do not insert a second frontmatter block or title into a combined skill. Keep Entities, Filters, and Dimensions distinct: entities are the things modeled, counted, or joined in the analytical domain (not report artifacts or source contracts used by the workflow), filters select eligible records, and dimensions describe grouping attributes. Use one short row per meaningful concept, with concrete definitions rather than links to another catalog. Preserve each rule's source-specific applicability. Column wording can be shortened to fit, but retain the information needed to use the definition correctly.

Compose the initial draft using [Write clearly from the first draft](../SKILL.md#write-clearly-from-the-first-draft): keep a short opening and concrete, self-contained definitions in the tables. The table is the data dictionary, not an overview that sends the reader elsewhere for the meaning. Preserve eligibility, activity criteria, calculations, windows, and consequential exceptions in the relevant row. Use short sentences and enough columns to separate those facts clearly. Supporting query, join, or source-history notes can follow in the same section; link the original query for its full text.

For a category with no supported entries, retain its heading and give one honest, scoped sentence instead of an empty table or invented fact, such as "No additional pitfalls were identified in the inspected sources." An unresolved relevant definition belongs in Open Questions. If nothing remains unresolved, say "No unresolved definition questions from this review." These describe coverage of a useful context, not a claim of exhaustive certainty. Do not create an otherwise empty context just to fill this structure.

```markdown
---
name: context-{team-slug}-{topic-slug}
description: "Use {domain} data context when analyzing that domain or preparing related reports and dashboards."
---

# context-{team-slug}-{topic-slug}

Use for {questions, domain, and intended audience}.

More-specific applicable context takes precedence for working conventions; levels to the left take priority.

Individual > Team > Business unit > Company > Default

<!-- AUTHORING: Bold the established level and append "(this skill)". -->

- **Coverage and authority:** {Verified coverage, governing source, and important limits.}
- **Access and review:** {Known access requirements, responsible expert when known, and review date.}

## Entities

| Entity | Meaning and boundary | ID / grain | Source |
| --- | --- | --- | --- |

## Metrics

| Metric | Definition and population | Numerator | Denominator | Unit / time window | Sources / caveats |
| --- | --- | --- | --- | --- | --- |

## Filters

| Filter | Rule and scope | Exceptions | Source |
| --- | --- | --- | --- |

## Dimensions

| Dimension | Meaning / values | Applies to | Source |
| --- | --- | --- | --- |

## Pitfalls

| Pitfall | What to do | Source |
| --- | --- | --- |

## Open Questions

| Open question | Why it matters | Who or what can resolve it |
| --- | --- | --- |

## Sources

| Source | Use and authority | Checked / limits |
| --- | --- | --- |
```

For rates, identify the numerator and denominator in the metric row. A count can use a dash for an inapplicable denominator. Preserve population, aggregation, units, window, and time zone in that row. Define terms such as eligible, active, verified, or revenue proxy using the supported selection rules and scope; do not replace a precise definition with these labels. If an upstream rule is unknown, state that limitation instead of inventing it. Keep material caveats and historical population changes in the row. Supporting relationships, implementation detail, and source-history notes can follow under the relevant category. Use short named links or clickable in-file source IDs with exact locators in Sources. Distinguish datasets, dashboards, documents, and code, and preserve fully qualified table identifiers and supported joins. Do not imply a linked or inaccessible source was inspected, or an unexecuted query was tested.

When substantive domain definitions and working guidance are included for the same audience, keep these category tables beneath Data Context in that same skill. A reporting context that reuses them needs only the source pointer and any genuine scoped metric differences. Preserve an existing canonical provider and its access prerequisites instead of creating a duplicate. Ordinary maintenance or packaging preserves an approved existing layout unless the user requests restructuring.

### Review checks

Before presenting a new or reformatted draft, read the actual output and verify:

- The structure matches the content owned here. A domain dictionary has Entities, Metrics, Filters, Dimensions, Pitfalls, and Open Questions in order, followed by Sources, with concise tables or truthful scoped absence statements. Reporting guidance that reuses company definitions has no forced dictionary: a source pointer suffices, with a compact section only for genuine report-specific differences. Never invent an entity such as "weekly report" just to fill the template.
- The rows contain usable definitions, not just topic summaries or links. Entity rows do not mix in segmentation attributes; filter rows state eligibility/selection logic; dimension rows explain grouping attributes. Preserve source-specific counting keys, populations, units, and time rules.
- All saved data guidance and the source inventory are in that one file. Read it as a reviewer: no other generated file is needed to understand a definition, exception, or unresolved question. Source links and any in-file anchors resolve, and important rules retain evidence.
- As part of the normal content review, check that each row is readable and actually defines its term or metric. A reviewer must be able to identify who or what counts, the calculation, window, and consequential qualifications without following a summary to a separate note. Keep supporting details in the same file. Compare against evidence or the prior draft before removing anything. Fix only identified problems; do not add a separate readability stage or automatic whole-file rewrite. Recheck affected content after corrections; successful package or link validation alone does not establish content quality or readability.

## Finish or defer

Read back the expert's corrections and source inventory, keep actual conflicts visible, and apply the [review checks](#review-checks). Confirm the new definitions and working guidance for one audience are in one skill, using complete tables for domain definitions or a compact section for report-specific differences, with their sources. For an existing canonical skill or provider, retain its actual pointer and lightweight available information. Preserve approved layouts during ordinary maintenance and packaging.

While editing working preferences without data context, keep the data-context placeholder until finalization. When finalizing without supplied or created data context, remove the entire Data Context section and any empty scaffolding; no text about missing definitions, pending expert review, deferrals, or substitute dashboards remains. A deferred request for data definitions only creates no empty skill or working-preferences wrapper.

Use S7 for the completed draft handoff, with working guidance when present, and S8 for requested installation or packaging. Use [packaging and sharing](packaging-and-sharing.md) to prepare and validate the requested files, honoring no-install and requested destinations; do not wait for a separate draft-review acknowledgement. Creation implies neither warehouse deployment nor a recurring refresh, automation, or external write.
