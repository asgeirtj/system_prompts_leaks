---
name: create-data-context
description: Create, update, or share reusable context for analysis, reports, and dashboards, including tool preferences, look and feel, analysis practices, and data definitions. Use when asked to remember a working instruction for future tasks, save conventions, or maintain existing context.
---

# Create Data Context

Create compact, editable context for how the user wants analysis, reports, and dashboards produced. Context can contain a single tool preference, report or dashboard look and feel, analysis practices, data definitions, or a useful combination. Keep guidance for the same audience in one skill and one plugin; data definitions are optional. Establish what the guidance covers separately from who may receive it. Honor draft-only, source-only, package-only, no-install, and already-reviewed instructions.

## Principles

- Call metric definitions, source maps, and caveats "data context" in user-facing copy. Preserve actual provider names, URLs, and technical identifiers.
- Reuse answered questions, honor plain-text requests, and ask only currently useful unresolved questions. Group a few related, independently answerable blocking questions when that saves a round trip, such as references/scan direction and personal versus shared use. Explain the shared context above the group and each choice where needed. Separate questions whose answer depends on an earlier decision, and honor a request for one question at a time. Prefer a nonblocking elicitation (`request_user_input_async` on Codex when callable and supported), following the host contract. Keep pending questions available where the host supports persistence; do not repeatedly recreate answered or unchanged questions. Use each actual answer before dependent work and continue authorized independent work while waiting.
- Put 1–2 short sentences explaining the current choice or useful inputs immediately above the question inside the elicitation. Use its instruction/description field when supported, otherwise put the explanation before the question in its title. Do not leave essential instructions only in commentary that may collapse. Use P1A's audience explanation once; avoid repeating local-install or sharing disclaimers in the intro and each question.
- Whenever a turn ends awaiting user input, the last final response must contain all currently pending questions, their useful choices or reply instructions, and enough context to answer without expanding progress or finding a form. During initial setup, include the P1 introduction in that final response if it has not yet appeared in a completed turn's final response. This applies even when a form was called or an earlier message was labeled as an answer. Text followed by more tool calls or a later final reply does not satisfy this visible handoff. Finish independent reads first, then send the self-contained final response and yield; if work continues after an earlier question, include the necessary introduction and pending questions again in the last response. Never replace them with "answer the questions above" or a skill-requirement explanation.
- Required choices still need an actual reply before dependent work proceeds. Retain the pending elicitation when the host supports it across turns, with the final-response handoff above regardless of form persistence. If a form is unavailable or renders as ordinary text, ask the pending questions directly in the final response. Do not keep a turn alive just to hold a card open or claim persistence the host does not support. Optional preferences may use a safe fallback; they do not resolve required choices.
- Keep one coherent scope and preserve unrelated context. Save only useful, non-obvious information; omit generic policy/background, installed-tool inventories, and visible capability restatements.
- Apply the intended audience established for each draft or update; use P1A when it is unclear. Keep shared working guidance broadly useful and scoped to the relevant data work or deliverable. Treat optional shared style conventions as defaults that leave room for personal preferences; do not let style preferences redefine metrics or override mandatory policies. Preserve explicit workflow requirements and personal exceptions with their actual scope. Split only when different audiences need different guidance or the user explicitly requests it, never merely because definitions and style are different content types.
- Write preferences as direct model instructions, preserving their meaning and scope without quoting answers or labeling them "explicit user input." Prepopulate facts only with very high-confidence support from current, applicable authoritative sources and adjacent citations. Do not infer analytical methods, query budgets, interaction choices, or tool preferences from nearby examples.
- Keep state, accepted answers, skips, and deferrals in task notes, never the generated skill. Load substantial conditional knowledge only when relevant.
- Use personal memories only when authorized. Present their summary for user review before incorporating them into shared drafts or packages. Exclude secrets, personal details, customer-specific records, and private transcripts from shared context; corroborate recollections before treating them as shared standards.

## Routing and copy

For a concrete instruction to remember or apply in future work, start with [Save a specific preference](#save-a-specific-preference). A single instruction supplies enough initial content; introduce the context skill, offer additional context, and establish its audience before saving it.

For new general context, explain the P1 outcome and input examples once, then enter the first unresolved step, reusing supplied data/workflow coverage, intended audience, approach, content, and reviewed drafts. Select the useful parts from the requested work and supplied material, not the phrase "data context" alone. Requests explicitly limited to definitions enter P5 directly; broader metrics/reporting requests follow [Interpret reporting examples](#interpret-reporting-examples) when examples are supplied, including later in the conversation. Use P2 for references and scan direction, then P1A before audience-dependent drafting when intended audience remains unclear, including direct P5 entry. Existing-context sharing enters H1. Reuse a named or relevant available data-context skill/provider; create a data-context skill when requested or when supplied definitions are to be saved. Missing data definitions alone do not require data-context authoring.

Requests to check saved data context regularly, configure its automatic updates, or run an existing upkeep task enter [Source upkeep](references/data-context-authoring.md#source-upkeep) directly. Reuse the selected context, source inventory, established scope, and any existing schedule; do not restart onboarding. Scheduled runs follow that reference without offering another automation.

Use the response examples for the applicable outcome, adapting their content to the request and actual host capabilities. The When/Next notes and branch labels guide execution and are not spoken.

### Save a specific preference

A concrete request such as "always use my named Snowflake plugin," "remember this dashboard style," or "use this analysis practice in future" supplies the starting instruction. Introduce the same reusable-context concept as general setup, explain what else it can include, and offer to collect relevant information before saving:

> I can save that in a **context skill**—an editable set of instructions for future work. It can include preferred tools, report and dashboard look and feel, analysis best practices, and data definitions.  
>  
> **1. What would you like to include?** Just this instruction, more preferences or examples you provide, or relevant context I find by searching your connected tools?  
>  
> **2. Who is this for?** Your own personal use, or guidance you'd like to share with your team?

Present both unresolved choices together in one intake, with the introduction above them, using the host's supported question surface. Omit a question already answered. Use the answers to retain just the supplied instruction or enter P2/P3 for accepted material or research, and apply P1A's personal/shared boundary before drafting. "My plugin" or "in future" alone does not establish personal scope.

Keep this an actual conversation: a post-completion statement that the user can expand the context later does not deliver the offer above. Once content and audience are established, prepare one compact skill with the supplied instruction and discovery metadata, preserving the actual tool name and scope. If the user keeps only that instruction, omit definitions, generic best practices, source inventories, unrelated preferences, and empty sections. Do not scan without authorization. Discover a named installed plugin only when needed to resolve its identity; saving a preference does not require querying it, connecting it, or claiming its installation/access is verified.

Proceed through P6/P7 without a separate save-or-install confirmation. For personal context, install through the supported local persistence flow and give a natural task prompt that should invoke it implicitly. Shared context can also serve the creator locally; finalize the requested local outcome and highlight that the user can ask later for instructions on sharing it with their team. A shared audience choice alone does not start administrator research or create a distribution handoff. Honor explicit no-install or file-only limits and describe those results as prepared rather than active.

## Parent workflow

### P1 · Explain the outcome and establish coverage

When: starting new general context. Explain the outcome and show the input examples once in a completed turn's final response, even when the user has already provided coverage, links, or files. Include the introduction in the first unresolved input form when supported, but always follow the final-response handoff in Principles when yielding for input. An introduction only in progress, a tool/form result, or an earlier message followed by more work has not been delivered visibly for this purpose. If all inputs are already resolved, continue the work and include a compact explanation of the outcome in the draft-review response; do not add an acknowledgement step just to show the intro. The examples are optional guidance, not a request for more materials or a reason to pause. Ask the final question only when the data or workflows are not already clear; otherwise reuse the supplied coverage and continue to the first unresolved step. Adapt the local-use and plugin wording to an explicit sharing, standalone-skill, or file-only request.

```
I'll help save how you want {the requested work} produced in a context skill—an editable set of instructions for future work. This can include report and dashboard look and feel, analysis best practices, preferred tools, and any data definitions you want reused.
```

Use the known work in the opening; if coverage is missing, ask "What would you like to customize for future work?" For a definitions-only request, focus the examples on definitions and sources. For styling, analysis practices, or tool preferences, explain those outcomes without suggesting that a data dictionary is needed. Include P2's useful input examples once when needed; do not repeat them across the introduction and question. The specific-preference path above uses its shorter introduction and expansion offer.

When both source approach and audience are unresolved, show this introduction above a numbered list containing P2's "Where should I start?" and P1A's "Who is this for?" copy. Finish with the scan expectation below when a scan is offered or accepted:

> If you choose a scan, I'll show you what I find and ask which sources to include.

If a scan is already accepted, use "After the scan" instead of "If you choose a scan." Keep the result in the last final reply as required by Principles. Explain the exact plugin/install outcome at draft review and finalization, when the user chooses to save it; avoid making the opening a description of internal skill packaging.

Use the answer to establish subject matter and applicability, such as a product's metrics or a recurring reporting workflow. Company-wide definitions can be useful to one person. Reuse supplied names and applicability limits; establish intended audience through P1A separately from data/workflow coverage. Actual recipients and distribution are resolved when sharing is requested.

Next: P2 to reuse the supplied references and scan direction or ask for them. Supplied links or files do not by themselves resolve the additional-scan choice.

### P2 · Choose an approach

When: creating context and data/workflow coverage is known. Collect references, rules, and an optional additional scan in one intake. The user can provide references, request a scan, or do both, and can direct which topics, sources, or gaps the scan should cover. Reuse supplied materials and explicit research or source-only instructions. Skip this step for routine targeted updates, approved-context packaging, or scheduled upkeep.

When references and scan choice are unresolved, include this explanation and question in the input form with P1's introduction on its first appearance:

> **Where should I start?** Share instructions or examples you like, or I can scan your connected tools. Report and dashboard designs, style guides, examples of good analysis, preferred tools, and metric definitions can all help. You can suggest what to focus on or skip.

Suggested options when supported:

- Provide references
- Scan for context
- Both

Allow a free-text answer with references and scan direction; do not force a mutually exclusive references-versus-research choice. Respect the host's supported input types: use text input for links, pasted rules, and direction; receive attachments through the normal composer when supported. Do not ask for files through a text-only elicitation.

When sources are already supplied and the scan choice is unresolved, offer once:

> Would you like me to scan your connected tools for additional context related to {data/workflows}, beyond what you've shared? You can also add references or tell me where to focus.

Options:

- Scan for additional context
- Use what I shared

Use a nonblocking elicitation when supported. Inspect supplied material while the optional scan choice is pending. An unanswered scan offer does not authorize broader research or delay a useful draft from available material. "Provide references" alone does not rule out a later additional scan; when those references arrive, use the additional-context offer once unless research was explicitly declined or limited. If neither sources nor a scan request exists, request the missing starting input and use the required-input checkpoint rather than inventing context.

Accept references and direction at any later point without restarting intake. A scan request authorizes a bounded search of available connected tools within the stated coverage; reuse useful supplied references as seeds. Describe only actual connected capabilities; if no relevant connection is available, explain that and use supplied references rather than implying access. If no further direction is supplied, use the established data/workflow scope without another routine question. Honor exclusions and source-only restrictions. After a scan, use [Review scan discoveries](#review-scan-discoveries) before incorporating newly found sources into the draft.

Next: include P1A in the same intake when audience is also unclear and can be answered independently; otherwise ask it next if still unresolved. Reuse any answers already given, then P3A for an accepted scan, P3B for promised references, or draft from available material. Source inspection can continue while an audience answer is pending, but audience-dependent drafting waits for that answer.

### P1A · Clarify intended audience when needed

The specific-preference path includes this audience choice alongside its context-and-input offer. A single supplied instruction can be either personal or shared; establish that choice when unresolved.

When: the intended audience for a draft or update is unclear from the request or the selected existing context. Use two audience categories: personal and shared company context. Treat requests for team or company use as shared, without a team-versus-company follow-up. Reuse explicit personal/shared scope and an existing context's recorded applicability; do not ask again when it is clear. Keep named teams, products, and workflows as applicability limits within shared guidance. Do not turn a team-specific convention into a company-wide requirement or broaden an existing explicit distribution restriction. A company, product, or team name mentioned only as subject matter does not determine audience. In new general setup, ask once coverage is known, alongside reference/scan intake when both can be answered independently; source inspection can proceed while the audience answer is pending. Do not require a company/business-unit/team hierarchy or default unclear preferences to personal use.

> **Who is this for?** Your own use or sharing across your company? For shared context, I'll keep working conventions broadly useful and specific requirements scoped to their relevant workflows.

Options:

- My own use
- Share across my company

Require the user's answer before assigning scope or creating or updating audience-dependent guidance. While waiting, authorized review of supplied sources can continue; keep findings in task notes. A timeout, skipped or dismissed form, backgrounded task, or silence leaves this choice unresolved and never means "My own use." Use the visible checkpoint in Principles when independent work is done. On return, apply the answer to the whole draft and reuse completed source review without restarting intake.

Choosing shared company guidance does not authorize sharing, publication, installation for other people, or changes to their settings. Shared guidance can serve the creator too; it does not imply a separate personal context is needed. Use the audience explanation above once, then apply that scope in the draft. Do not promise that conflicts are impossible or invent a universal precedence system. If a concrete conflict appears, clarify that rule's intended scope during the ordinary review. A reusable data-domain request is a reason to suggest a broader audience, not to assume sharing permission.

If the user requests shared defaults and different personal behavior, reuse any stated differences. If those differences are unclear, ask before assigning preferences to separate files:

> Which preferences should differ for your own work?

Apply the same required-answer checkpoint to unspecified personal exceptions. Keep clarified exceptions in the user's separate context and review both destinations together. For an update, use the selected context's scope unless the requested change introduces an unresolved audience or destination; clarify that before changing the saved guidance. Do not infer scope from pronouns alone or add a per-preference labeling questionnaire.

Next: resume P3A/P3B or the requested definition-authoring/update step with the established sources and scan direction. Use P2 only if references or the scan choice remain unresolved; do not repeat intake.

### Prepare either draft

Follow [Write clearly from the first draft](#write-clearly-from-the-first-draft) while composing the context skill. Use the [annotated context sample](references/sample-context-skill.md) for working guidance and its optional Data Context section. Use [data-context authoring](references/data-context-authoring.md) for concrete definitions, entities, filters, source authority, and caveats. Put both types of content for the same audience in this one SKILL.md, under clearly labeled sections with one frontmatter block. Create only useful sections. Keep working guidance specific to data tasks; do not elicit broad personality or general personalization settings.

Reuse an existing canonical data-context skill/provider rather than copying its definitions; reference its actual entry point and access/installation prerequisites where the source is used. A reporting context can keep that pointer in Source and output rules without a separate Data Context section. Do not create a companion skill merely because a report supplies both metric definitions and style. For explicitly mixed audiences, follow P1A: keep the reviewed shared context together and reuse a separate personal context for the user's actual personal exceptions. Review both destinations together.

Resolve frontmatter before presenting drafts. Begin each generated SKILL.md with valid YAML between `---` delimiters, with `name` matching its skill folder and a nonempty string `description`. Write the description as a short invocation boundary: what context it supplies and when to use it, expressed through the domain and relevant data work. Keep it open-ended within that scope; do not enumerate individual metrics, filters, dimensions, source documents, or implementation details. A source's current contents are not the invocation boundary. Keep metric definitions, coverage gaps, source authority, and resource-specific restrictions in the body. Preserve explicit subject, personal-use, and workflow limits that determine whether to invoke the skill; do not broaden a narrowly requested metric skill to an unrelated domain.

Keep the description to one short sentence that clearly tells the agent when to apply the context. Describe the audience and domain/workflow, not a list of the topics currently saved in the body. For example:

- **Good:** "Use when analyzing product performance or preparing product reports for Acme's Growth Team."
- **Bad:** "Contains activation, retention, conversion, weekly active users, Snowflake tables, and chart colors."

The good example defines when to invoke the skill, including for a relevant question that does not name a saved metric. The bad example inventories contents without a clear invocation boundary. Adapt the example to the actual scope; preserve explicit personal-use and workflow limits. Preserve suitable existing names, full display names, explicit applicability, and approved content when updating or packaging; do not silently merge or split existing skills. Remove AUTHORING comments and template-origin citations; keep evidence for populated claims.

For new names, use `context-{team-slug}-{topic-slug}` for the skill, its single-skill plugin, and their displayed names and titles. The team segment uses the exact established company, team, or person name, preserving meaningful words such as "Team." Use a concise topic or workflow such as "Product Analytics" or "Weekly Reporting"; do not force "Data" into every name. For example, use `context-acme-growth-team-product-analytics` for Acme Growth Team's product analytics context. Reuse an established audience name; if only "my team" or "personal" is known, resolve the actual name before finalizing a new identity rather than inventing one or using a generic scope label. Keep the combined audience/topic slug lowercase ASCII and hyphenated, at most 56 characters (64 including `context-`). If longer or colliding, use its first 47 characters (trim trailing hyphens), a hyphen, and the first eight hex characters of SHA-256 of the full audience/topic, a newline, and its stated coverage. Verify destination identity before reusing a name; never overwrite unrelated context. Preserve suitable existing identities rather than renaming installed skills.

Begin every generated context skill, including a single-preference skill, with a brief applicability statement followed by two lines:

More-specific applicable context takes precedence for working conventions; levels to the left take priority.

Individual > Team > Business unit > Company > Default

Mark the established scope with **bold** and "(this skill)" in the hierarchy line. Keep the explanation and hierarchy once per generated skill, without repeated generic Prefer over / Defer to bullets. Preserve mandatory requirements and authoritative definitions regardless of scope. Reuse the established audience without adding a hierarchy questionnaire.

### Write clearly from the first draft

Use these rules while composing the first draft; do not write a dense version first and schedule a separate readability rewrite. Write for a teammate reviewing the guidance, as well as for the agent that will use it. Lead each entry with the plain-language meaning or action. Use short sentences, descriptive labels, and one rule per bullet. Define unfamiliar abbreviations once; keep exact field names, formulas, units, and identifiers wherever they affect use.

Use tables with enough columns to make the definitions clear; do not optimize for a fixed column count. Each metric row must state the actual counting or calculation rule, population and eligibility, activity criterion, units, and time window, including any exception that changes its meaning. A label such as "eligible active users" is not a definition unless the row explains eligible and active. Keep precise definitions in the table even when they need several short sentences. Use notes below for supporting implementation detail or source history, not as a substitute for the definition. Improve wording and layout without replacing concrete rules with broad summaries. Working Preferences can use concise action bullets and labeled specification notes.

Use short clickable source titles or linked source IDs; keep full locators and inspection details in Sources. Avoid repeating the same caution or source history across several sections: give it one clear home and link to it where needed. Retain distinct source populations, dates, and exceptions even when their wording looks similar. Do not add a summary-only companion file or rely on collapsed UI to make the actual skill readable.

During the normal content review, check the draft against source evidence or the prior version. Preserve every useful definition, formula, population, time rule, exception, uncertainty, source locator, explicit preference, and approval status. Revise only passages with a concrete clarity or accuracy problem; no additional review stage, model call, or whole-file rewrite is required for readability. When revising, shorten sentences and reorganize before deleting content; remove only duplicated or extraneous material with no distinct effect on future work. Judge readability by whether a teammate can find and understand a rule and its qualifications, not by an arbitrary word limit. These drafting rules apply to both data definitions and working preferences.

### Interpret reporting examples

When a context request includes a reporting workflow and the user supplies a deck, report, or dashboard as its example, inspect it for both definitions and useful working-style guidance. Reassess when examples arrive after intake or during definition research; do not remain on a definitions-only path merely because it was selected earlier. Draft supported writing, visual, and output-structure conventions in the same context skill as any definitions owned by that context and review the whole draft together. A reporting example does not require a new data dictionary: reuse company definitions, and capture only genuine report-specific metric differences with their sources and scope. The user need not separately request slide-making or style context. Honor an explicit definitions-only or content-only restriction; a file's format alone does not establish useful preferences.

Use the relevant artifact-reading skill and inspect representative rendered pages/slides as well as text when layout, charts, labels, or formatting matter. Text extraction alone does not establish visual style and can miss eligibility labels or other metric caveats. Cite the inspected page/slide or section for each convention. If visual inspection is unavailable, state that limitation and include only what the available evidence supports. Keep the supplied original read-only unless editing it was separately requested.

Include supported style inferences as direct working instructions in the draft, scoped to this workflow and audience and grounded in the inspected examples. The normal P4 review lets the user accept or change them; do not add special proposal labels, a separate status, or another approval step for inferred style. Preserve explicit user instructions and do not claim the example is an official company standard unless that is established. Do not infer collaboration preferences, analytical methods, query budgets, or tool choices from a presentation. Reuse the established audience and source work, and carry the combined draft to the same review without restarting intake.

### P3A · Research a first draft

When: research was requested or the additional pass was accepted. Follow the sample's field-specific search hints in a bounded pass of authorized, inspected sources for the accepted data/workflow coverage. Start from supplied links and maintained owner hubs; do not run warehouse queries just to fill fields. Link an existing data-context entry point when available. Keep source-use and output rules with the reporting guidance. Route new substantive definitions through P5; use its compact exception format when only report-specific metric differences need documenting. Keep one-off investigation budgets in task notes.

> I'll look for useful context for {data/workflows}, then show you the sources I found and what each could add so you can choose which to include.

If a maintained design guide is found:

> I found {official design guide}. It could provide documented colors, fonts, and key design rules.

If key team materials establish distinctive audience-specific style:

> For {audience}, {sources} use {distinctive writing or visual pattern}. This could guide {relevant output or workflow}.

Ground the style guidance in explicit instructions or a clear pattern in relevant maintained, endorsed, or user-supplied reporting examples, inspected through [Interpret reporting examples](#interpret-reporting-examples). Label representative samples as examples, not source quotations. Popularity alone does not establish a preference, and vendor defaults do not establish intentional visual style. Do not add generic audience advice.

If connectors actually overlap and evidence establishes a more authoritative route:

> {Connectors} overlap for {workflow}. {Source} identifies {access path} as authoritative, which could support {connector} as a default.

If that source is selected, label the draft proposal **Proposed default — verify**, with the inspected authority source beside it. Do not use that branch just because several connectors are installed.

If useful facts were found:

> I found {sources}, which could add {specific definitions or working guidance}. {Important coverage or access limitations, if any.}

If no additional useful facts were found:

> The sources didn't establish useful additional context for this scope. I've left those fields blank rather than adding general background.

Next: Review scan discoveries when new useful sources were found. Otherwise continue with supplied or already-approved material to P5 for definitions or P4 for working guidance; do not ask the user to approve an empty list.

#### Review scan discoveries

When: an initial or additional scan finds useful sources not already supplied or accepted by the user, including scans entered through data-context authoring. Present one compact selection checkpoint before incorporating those sources or their findings into the context draft. This is a review of the completed scan, not a request to run another scan.

Show short linked source titles, what each source contributes, and one or two concrete findings or examples where useful. Flag unread, inaccessible, stale, or conflicting material so a discovered link is not presented as verified evidence. Curate useful candidates instead of listing every search hit. Put the source summary with the question inside the supported input form, or together in the final response when no form can show it; do not leave the evidence only in collapsed commentary.

> I found these additional sources for {data/workflows}: {linked sources, useful findings, and what each would add}. Which would you like me to include?

Options when supported:

- Include all listed sources
- Choose sources or refine the scan
- Skip these sources

Accept a free-text selection or search direction. Wait for the user's actual choice before adding newly found sources or derived guidance to the draft; silence does not select them. While waiting, continue independent work from supplied or previously accepted material and keep candidate findings in task notes. Follow the required-input checkpoint in Principles. Reuse already accepted sources without asking again; permission to scan alone does not mean permission to include every discovery. Honor an explicit instruction to incorporate discoveries without this checkpoint.

After selection, reuse the inspected evidence to draft from the chosen sources, then continue to P5 or P4 without restarting intake or scanning again. If the user refines the search, inspect only the requested additions and show the new candidates. If they skip the discoveries, proceed from available accepted material, or explain the source gap if nothing useful remains. Source selection does not verify disputed definitions or replace the normal final draft review. Routine verification of supplied or accepted sources does not require this checkpoint, and scheduled upkeep retains its own agreed update scope.

### P3B · Collect the user's own context

When: the user chose to provide context and has not supplied it yet. Wait for the answer, then prepare the sample using their content. Research is not required. Keep supplied constraints intact and URLs exact, and identify unread or fictional pointers honestly. Preferences for future analysis do not add questions to this setup flow.

> Think about onboarding a new teammate. How would you like them to analyze information and present the results?  
>  
> You can share report or dashboard look and feel, analysis best practices, preferred tools, examples you like, or data definitions and trusted sources. A single useful instruction is enough to start.  
>  
> Links, files, or pasted examples all work. If there's something you particularly like about an example—its structure, visual style, analytical approach, or level of detail—you can point that out too. A few starting points are enough.

After the answer:

> I'll turn this into one context skill, with clear sections for the definitions and working guidance relevant to this audience.

Do not add a routine question just because a supplied link has not been inspected; ask only if an access or evidence gap prevents the requested work.

Next: check [P2's additional-pass offer](#p2--choose-an-approach) when the research choice remains unresolved, and apply [Interpret reporting examples](#interpret-reporting-examples) to relevant supplied examples. Continue to P5 when definitions should be saved in a data-context skill; otherwise P4. Carry the working guidance forward in the same draft and reuse the supplied domain, sources, and reviewed definitions.

### P4 · Present the editable draft

Save the context draft and use the supported editor. Present its definitions and working guidance together, naming the actual file and any reused external context. For mixed team/personal inputs, show which content belongs in the team plugin and which remains personal. Use the sidebar wording only after opening succeeds; otherwise use the inline fallback. Complete and validate the requested draft files, including placeholder cleanup and usable package structure, before handing them back. Present them for the user to review at their convenience; this is a completed draft handoff, not a required approval checkpoint. Do not conduct a mandatory review questionnaire. If installation or packaging is already explicitly requested, carry out that authorized outcome through P6 without adding a review gate; honor draft-only/no-install constraints.

In the draft handoff, give 2–4 short bullets summarizing the actual draft contents, with at least one bullet per included skill and links to those files. A single saved preference needs only one sentence and its file link. Name concrete instructions, definitions, sources, or consequential caveats that will affect future work; a list of headings such as "format, sources, and definitions" is insufficient. Distinguish newly drafted content from reused context and make consequential uncertainty clear. Cover only what is present; do not add generic benefits or unverified rules. Keep this summary in the visible review response, even when the files are open in the sidebar.

Sidebar editor available:

> Your context draft is ready at {files}. You can edit the included skills in the sidebar.

Inline writing block or Markdown fallback:

> Here are the included skills in your context draft. You can review and edit them here.

For ordinary creation without an installation request, end with:

> Review the draft and let me know if you'd like any changes. When it looks good, you can install it for future use.

Link the saved files and the supported installation instructions for the actual package. Do not require a particular reply, a review-confirmation form, or a keyword to complete the draft task. Do not describe the completed handoff as blocked or awaiting mandatory approval. Keep any installation status factual; suggesting installation is not performing it. If the user asks you to install in ordinary language, use P6. Honor an existing installation request without asking the user to repeat it.

If personal context is also being updated, name its separate destination in the same handoff. An existing shared data-context dependency remains a prerequisite unless its inclusion or installation was authorized.

For file-only or no-install output, use:

> The files are saved at {requested location}. Review them and let me know if you'd like any changes.

When no data definitions are included, you may add:

> You can also add trusted definitions, sources, and caveats with a data expert, now or later.

Next: the draft request is complete. A requested correction goes to P4A; adding definitions goes to P5; an installation or packaging request goes to P6. Source-selection questions and consequential unresolved definition questions retain their own input requirements; this handoff adds no new approval requirement.

### P4A · Keep editing or apply a correction

When: the user edits the draft or requests a change, apply the correction, preserve unrelated content, and check the affected files.

> I've updated {change}. You can review the revised draft at {files}.

Accept ordinary instructions to edit, install, or package the context. If the user only wants time to review, leave the saved draft ready for them; do not ask a new question or require a completion phrase.

### P5 · Add data context

Read [data-context authoring](references/data-context-authoring.md) when creating or maintaining data definitions is requested, including supplied definitions the user wants saved, and follow its first unresolved step. Before drafting, read its complete [single-file template and review checks](references/data-context-authoring.md#write-one-concise-data-context-file), recovering any truncated portion. Merely linking existing data context does not require rebuilding it.

Choose the structure by what the context owns, not by personal versus company audience:

- **Substantive domain definitions:** Put definitions, source inventory, and necessary query/join notes under Data Context in the same SKILL.md as any working guidance for that audience. Use the reference's category tables with lower-level headings and no second frontmatter block.
- **Reporting or working guidance using existing definitions:** Keep the canonical source/provider pointer and access prerequisites in the relevant source-use rules. Omit Data Context when that is sufficient. Do not restate company definitions or create category headings just because the report mentions metrics.
- **Report-specific metric differences:** Add only the supported differences in a short Report-specific definitions or exceptions section, using bullets or a small table. State the changed calculation, population, denominator, or window, its report scope, source, and any uncertainty. Routine display, comparison, and freshness rules remain reporting guidance.

Verify a reused skill or provider's actual entry point before describing it as available. When creating separate shared and personal drafts together, keep planned companion identities in task notes until their files exist; use verified original source pointers in the interim draft. Before finalization, resolve each required companion to its real artifact or available provider and state its installation or access prerequisite accurately. A planned skill name is not an existing dependency.

A weekly report, deck, slide, or shared metric contract is not an entity merely because it is an input or output of this workflow. Entity rows describe things actually modeled, counted, or joined in the analytical domain. Preserve approved existing layouts during ordinary updates or packaging unless restructuring is requested.

For definitions-only requests, create only useful data guidance; do not add empty style sections. Reuse known data/workflows and clarify only consequential gaps in coverage.

When both definitions and working guidance are included:

> I'll keep the definitions and working guidance in one skill, with clear sections. I'll save the draft for {audience} so you can review it.

Next: S1, reusing supplied domain and sources. If the user defers, return to P4 when useful working guidance exists; otherwise explain the remaining source gap. Keep deferrals in task notes, not finalized context. The data-context review includes the whole draft and satisfies P4; do not repeat it.

### P6 · Finalize the context

When: the user requests installation, packaging, or another supported save outcome in ordinary language, including a request already made earlier in the task. No special word or separate review acknowledgement is required. Read back the latest edits, prune unused placeholders, empty fields/headings, and input-origin labels, and follow [packaging guidance](references/packaging-and-sharing.md) for validation and the requested install/file-only outcome. Keep adjacent source citations and useful applicability hints. No extra confirmation question.

For a future-use instruction whose intake selects personal context, complete local installation once the content is settled; do not stop at a draft or ask again whether to install. Explicit draft-only, no-install, or file-only instructions still determine the outcome. A shared audience does not authorize installation for others or distribution; complete the creator's requested local save/install outcome and offer future sharing help in P7.

Normal installation:

> I'll apply your edits, remove unused placeholders and empty sections, and install the finalized context.

File-only or no-install request:

> I'll apply your edits, remove unused placeholders and empty sections, and save the finalized files at {requested location} so you can review and test them.

The skill handles these actions without requiring the user to describe them:

- Without data definitions: remove the optional Data Context section; retain useful working guidance in the context skill.
- With newly authored domain definitions: preserve the complete tables and sources in Data Context within the same skill. For report-specific differences alone, retain only their compact scoped section and sources.
- With an existing data-context skill/provider: keep the actual entry point and lightweight coverage/access information; avoid a duplicate definition copy.
- Without working guidance: omit empty style/workflow sections and package the useful definitions alone.
- With team and personal preferences: include only shared content in the team plugin and preserve the separate personal context.
- Preserve an explicitly requested embedded layout or already-approved combined content.
- Do not retain generic policy, background, installed-tool inventories, or setup deferrals.

Next: P7.

### P7 · Context ready

Include the concise content summary from P4, updated to match the finalized files and any last edits. Report installation or file-only status separately from what the skills contain; do not make the user open files or earlier messages to understand what was saved.

Match the [context handoff template](references/packaging-and-sharing.md#context-handoff-template) to the actual request. After personal installation, confirm the saved instruction and verified availability, link the skill, and give one natural sample task that should invoke it implicitly. The sample must fit the actual description and scope without naming the skill, using `$skill-name`, or saying "use my saved context." For example, a Snowflake tool preference could use "Analyze this Snowflake dataset and summarize the main trends." Present it as a suggested test, not a claim that a separate behavioral test ran. If installation was prohibited, state that it is prepared and introduce the sample with "After installation, try."

For newly created shared context, also highlight: "You can ask me later for instructions on sharing this context with your team." Use the full ZIP and administrator handoff only when sharing or a shareable package was requested. Selecting a shared audience alone does not require those instructions, research, or an extra sharing question now.

For mixed audiences, provide a relevant natural starter per actual skill. Make task-specific working conventions conditional so unrelated data tasks do not inherit report-only rules. Identify an existing data-context dependency as reused, and report any separate personal-context update accurately.

If no useful definitions or preferences were supplied, keep the editable draft for further input and explain that there is not yet useful context to install; do not manufacture empty component skills or claim an installation.

After creating or updating useful Data Context, check [Source upkeep](references/data-context-authoring.md#source-upkeep) for eligibility. When its sources can be revisited and a supported recurring task can access them and the durable context, offer once at the end of this handoff. Use an explicitly requested or clearly established check frequency; otherwise offer weekly checks. Include that frequency in the question:

> Would you like me to check these sources {frequency} and keep this Data Context up to date? I'll tell you what I change and ask you about anything uncertain.

This is optional; completed context does not depend on an answer. An unanswered or declined offer creates no automation. A yes authorizes the scoped automatic updates described in Source upkeep; do not ask the user to choose an update mode or confirm the same permission again. Reuse the offered timing and establish only information still needed to create or update the supported task. Skip the offer during scheduled runs, when upkeep already exists or was offered or declined, for preferences-only context or one-time snapshots, and when the user ruled out automation. No other question is required.

## Sharing an existing context

### H1 · Enter sharing directly

When: the user asks to share an existing context. Follow [packaging and sharing](references/packaging-and-sharing.md); do not restart onboarding. Share the reviewed bundle by default, or only the explicitly requested data-context/working-preferences part with its required references. Personal context outside a team bundle is not implicitly included.

> I'll prepare {context name} as a plugin ZIP for {audience}, with installation instructions and an administrator handoff.

Reuse the established sharing audience and destination; a context file's subject matter or applicability alone does not establish where the user wants to share it. Do not ask users to choose team versus company or enumerate recipients. Ask only for a missing context selection or the company/workspace needed for the handoff:

> Which context would you like to share?

or, in a separate turn if needed:

> Which company or workspace should this be shared with?

### H2 · Package and hand off

Search the available context for a potential ChatGPT administrator as described in [Internal publishing handoff](references/packaging-and-sharing.md#internal-publishing-handoff). Share the person's name and supporting source, adding a caveat if their role or current access is uncertain. Do not jump to IT because formal administrator verification is unavailable. After the package is checked and the lookup is complete, use the [context handoff template](references/packaging-and-sharing.md#context-handoff-template) with actionable upload instructions, a copyable request, and natural starter prompts. Reuse the selected skill and established audience; do not restart general context setup.

Do not send the package or messages on the user's behalf without an explicit request.

For context needed only by today's analysis, use [gather-business-context](../gather-business-context/SKILL.md).
