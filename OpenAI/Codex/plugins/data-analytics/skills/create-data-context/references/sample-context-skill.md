---
name: context-{team-slug}-{topic-slug}
description: "Use {topic} context when {applicable data work within the intended domain or workflow}."
---

# context-{team-slug}-{topic-slug}

<!-- AUTHORING: Replace the frontmatter placeholders using [Prepare either draft](../SKILL.md#prepare-either-draft). Describe the domain/workflow invocation boundary without enumerating metrics or source contents; preserve personal-use and workflow limits that affect activation. Use the supplied data/workflows, explicit applicability limits, and intended audience established through [P1A](../SKILL.md#p1a--clarify-intended-audience-when-needed). Preserve suitable existing names and approved applicability when updating. Keep explicitly personal preferences in their own context when preparing a team plugin. For the same audience, keep useful definitions and working sections together, choosing the structure through [P5](../SKILL.md#p5--add-data-context). Source-use rules can remain with reporting guidance; a separate Data Context section is optional. Follow [Prepare either draft](../SKILL.md#prepare-either-draft) for audience boundaries and existing context reuse. -->

<!-- AUTHORING: Compose directly using [Write clearly from the first draft](../SKILL.md#write-clearly-from-the-first-draft). Use short action bullets; put detailed typography, palette, layout, or export specifications in clearly labeled notes beneath the relevant rule. Preserve exact values and scope; supported inferred style belongs directly in the draft for normal review. Do not compress several rules into one paragraph merely to reduce line count. -->

- **Applies to:** {Data, products, data workflows, intended users, and any explicit applicability limits.}

More-specific applicable context takes precedence for working conventions; levels to the left take priority.

Individual > Team > Business unit > Company > Default

<!-- AUTHORING: Bold the established level and append "(this skill)". -->

## Design and visual style

Use when creating dashboards, reports, or charts. Scope conventions to the primary artifact and audience where useful. Carry relevant visual preferences into exports, adapting layout and interactions to the destination's capabilities.

<!-- AUTHORING: Search: Start with supplied official references or the company's official website for its maintained brand/design guide. Read specifications for colors/tokens, fonts and usage, layout, imagery/icons, and charts. For audience-specific additions, inspect maintained team dashboards, reports, presentations, and Slack for explicit guidance or consistent patterns. -->

- **Look and feel:** {Official guide URL plus a compact, cited quick reference of documented colors/tokens, typography, and design rules; supported audience-specific visual conventions with evidence; explicit user preferences.}

<!-- AUTHORING: Search: Inspect key team dashboards, reports, presentations, and relevant Slack threads for explicit guidance or recurring writing/layout patterns for the intended audience. Look for short representative passages and concrete layouts. -->

- **Primary output conventions:** {Explicit user preferences and supported, distinctive audience-specific layout/writing conventions for the primary artifact; compact grounded style examples and adjacent source citations, including inspected slide/page locations when applicable.}

## Workflow behavior and user interaction

Use when deciding how to collaborate with the user, clarify intent, and offer checkpoints during data work.

<!-- AUTHORING: User input only: do not infer question, collaboration, or checkpoint preferences from prior work. -->

- **Clarification and checkpoints:** {User-provided preferences for questions, collaboration, and checkpoints before expanding scope or producing a substantial artifact.} An explicit request for a report already establishes the intended deliverable.

## Analysis best practices

Use when choosing an analysis approach or managing query scope and cost. Use applicable data context for definitions and source authority.

<!-- AUTHORING: Use user-provided or already-approved preferences only; omit this field when unused. Do not infer analytical methods from nearby examples or prior work. -->

- **Analysis approach:** {User-provided preferences for analytical methods, comparisons, uncertainty, or depth, with their applicable data-work scope.}

<!-- AUTHORING: User input, or search maintained warehouse/domain guidance for an explicit durable query limit. Do not infer a budget from past investigations. -->

- **Query scope and cost:** Respect {directly documented company/domain query budget or user-provided review threshold, with source}. Before reaching it or materially expanding the agreed scope, explain what additional evidence could change the answer and ask before proceeding. Reuse completed evidence while it remains valid.

## Data Context

<!-- AUTHORING: For substantive domain definitions, insert the category tables and Sources from [data-context authoring](data-context-authoring.md#write-one-concise-data-context-file) here at heading level 3, without a second title or frontmatter block. Keep the concrete definitions and their source inventory in this SKILL.md. If an existing canonical skill/provider covers the request, reference its actual entry point with coverage/access prerequisites instead of copying definitions. For reporting guidance that reuses company definitions, the pointer can live in Source and output rules and this section can be removed. If actual report-specific metric differences exist, replace this scaffold with a short Report-specific definitions or exceptions section containing only those differences, their scope, sources, and uncertainties. Do not fill entity/metric/filter/dimension tables with report structure or routine workflow rules. Remove this section if no additional definitions are needed. -->

{Concrete definitions and sources, or the actual existing data-context skill/provider reference. Apply these definitions when interpreting the named metrics; working-style preferences do not redefine them.}

## Connectors and third-party integrations

Use when a non-obvious integration or export choice affects the current task.

<!-- AUTHORING: User input by default. If access paths actually overlap or conflict, search maintained connector or data-owner guidance for which path is authoritative for that workflow. -->

- **Preferred tools:** {Non-obvious preferred connector/access path, applicable workflow, and reason or specific restriction.}

<!-- AUTHORING: User input, or search supplied/current export documentation for a non-obvious constraint or workflow relevant to the requested output. -->

- **Export options:** {Non-obvious export constraint or workflow, or explicit user-preferred destination; applicable output types and source when relevant.}

## Final checks, rules, and guidelines before sharing

<!-- AUTHORING: User input, or targeted search in supplied or domain-owner guidance for a specific constraint or exception affecting this output or audience. Do not search for generic sharing policy. -->

- **Company-specific additions:** {Specific non-obvious rule or exception, when it applies, how it changes the output or sharing workflow, and its verified source or explicit user instruction.}
