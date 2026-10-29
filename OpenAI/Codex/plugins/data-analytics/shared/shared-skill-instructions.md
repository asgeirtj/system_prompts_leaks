# Shared Data Skill Instructions

Apply these instructions to every Data workflow, including a focused skill invoked directly. Apply the index's runtime gate before source discovery when that gate governs the request. Use the fast path in the initial dependency check below, and revisit discovery only for a material source gap or changed access.

Preserve the user's selected task, source restrictions, and requested output as evidence and connections become available. The focused skill owns the analysis and deliverable. Source setup does not authorize sending, sharing, publication, or source-system writes beyond the user's request.

## Dependency resolution

Each skill describes how relevant usage categories can help its workflow. Infer the necessary sources from the user's question and available evidence; do not search every listed category or require every provider. Named dependencies and category labels in [.codex-plugin/plugin.json](../.codex-plugin/plugin.json), under `extensions["com.openai"].dependencies`, are discovery hints, not an exhaustive catalog or proof of installation, connection, or access.

`isRequired: false` marks a provider as optional for plugin installation; the task may still require its capability. When providers are alternatives for the same source need, one suitable provider is enough. Resolve additional sources when the answer depends on distinct evidence they hold.

### Initial dependency check

**Keep the routine tool-availability check to one or two quick checks, then start useful work.** When the needed capabilities are available and no concrete material gap is apparent, proceed without manifest reads, Plugin Management, suggestion-history checks, installation inventories, or plugin searches. No setup narration is needed. If the light check reveals a missing required source or a materially useful optional integration, follow the discovery and installation-offer steps below while continuing supported work; that gap-resolution work is separate from the routine check.

1. **Check the relevant tools once.** Use the request, supplied evidence, and tool definitions already present to check the expected source capabilities, including deferred tools and custom MCPs. If a lookup is needed, batch the relevant capabilities into one targeted tool lookup; use a second only to resolve a remaining uncertainty. Stop once coverage is clear, without scanning unrelated tools or checking every skill category. Let the first useful source read or query also verify access; do not add a separate connectivity probe. Tool availability is enough to try that operation, not proof it will succeed. An installed badge alone does not establish access. Read the chosen provider's instructions as required.
2. **For a concrete gap, rank the missing sources by impact.** Use the user's question, source restrictions, skill categories, and available context to identify integrations that would improve the answer most. Prioritize access to original evidence needed for the requested claims, then meaningful gains in coverage, freshness, or interpretation. Include plausibly useful optional sources even before their contents are confirmed, with a concrete reason each could help; do not search merely because another category is listed. A known need can justify discovery before a connector fails.
3. **Offer up to six of the highest-impact options together.** Discover eligible providers for those gaps using the guidance below, then present one combined installation offer with a brief purpose for each source and a distinction between required access and optional enrichment. Use fewer than six when fewer would help; if existing access is sufficient and no integration would materially improve the result, proceed without an offer.
4. **Proceed with what is available.** Installation suggestions are non-blocking. Continue the supported analysis and deliver a useful answer at the confidence and scope the evidence allows, making material limitations clear. Do not wait for optional installations or a response to the offer. Pause only claims or actions that require missing access, following the setup policy below; if no useful work can be grounded, explain the required source and yield for setup. Incorporate newly confirmed connections without restarting intake.

Reuse source decisions and access results within the current task; loading another Data skill or receiving a follow-up does not require another check. Revisit only the affected source when a new evidence need, access failure, or connection change makes the prior decision insufficient. Do not persist a separate dependency cache.

### Find the authoritative source

Choose sources by authority for the particular claim, not convenience or which connector answers first. Trace secondary mentions to the original evidence: follow a Slack post's metric link to its governing query, table, or dashboard; follow a summary's citation to the source document. Read the original through an authorized tool when available and retain its provenance. A Slack post mentioning a metric is a discovery lead, not a substitute for the accessible source of that metric. Do not stop at a secondary mention when a targeted lookup can find the original.

Verify selected schemas and coverage through relevant source reads, reusing current-task findings. Resolve conflicting evidence by source ownership, directness, and fitness for the question, including differences in definition, grain, and freshness. Record material disagreements and explain which source controls the answer.

For actual business or product metrics, resolve Data Warehouse access or an already available governed, warehouse-backed metric source. Verify the definition, population, grain, period, and freshness before reporting the measurement. BI and product analytics can expose authoritative metric evidence; verify its origin and scope rather than assuming every dashboard or summary is authoritative. Messages and documents can explain changes without establishing the underlying measurements.

For questions about a named system's contents, use that system. A Slack-channel summary requires the Slack plugin or an already authorized tool reading Slack itself; Teams messages or second-hand notes do not establish what was said in Slack. Honor explicit source restrictions. If originals are unavailable, say what could not be verified and distinguish attributable commentary from established facts.

Requests explicitly scoped to an uploaded CSV, spreadsheet, pasted query result, or Slack export can proceed from that evidence. Keep the answer within its scope and date; do not imply a fresh warehouse or Slack read. Conceptual metric design, generic product questions, and explicitly requested sample data do not require live company data merely because a category is mentioned.

### Discover and offer useful integrations

A suitable authorized capability satisfies the need without installing a more canonical plugin. Built-in web research, local authoring, and Sites need no extra integration when already available. Discover integrations for the gaps identified in the initial check.

When an integration is missing, read and follow the **Plugin Management skill** (`$plugin-management`) when available for general discovery, eligibility, and connection handling. Data's explicit policy below takes precedence over that skill's generic recommendations about how many plugins to suggest: offer up to six relevant integrations together. If that skill is unavailable, use the exposed tools; if the tools are also unavailable, use the older-client fallback below.

#### Efficient Data category resolution

- **Prefer the local manifest.** Reuse known candidates or read this plugin's [.codex-plugin/plugin.json](../.codex-plugin/plugin.json), using `extensions["com.openai"].dependencies` and each entry's `categories` for relevant provider hints. This reflects the loaded build; a server lookup may resolve a different published release. The manifest does not establish current eligibility or source access.
- **Search by the needed category or capability first.** Translate the skill's usage categories into concise queries such as `Meeting Notes`, `Documents`, or `Data Warehouse`, with `limit: 10`. Use provider names when the user or source context identifies a particular system, or to refine a gap. Search distinct needs in parallel and combine the useful results into one offer. The current tool has no `usageCategory` filter: these are text queries, multiple terms match alternatives, and category labels are not guaranteed indexed terms. Include suitable workspace and curated providers beyond the manifest.
- **Refine only a gap.** Workspace matches can precede canonical global providers. If a named provider is missing from a full result page, make a focused query or increase the limit within the exposed maximum (currently 50). Refine empty or noisy results with provider/capability synonyms. Choose an actual reader of the required source, not a demo or workflow that merely mentions it. An empty search does not prove unavailability.
- **Check eligibility and history.** Apply Plugin Management's eligibility rules and exclude installed or pending plugins. Before selecting the set, use returned `suggestion_history` and current-task choices to [judge whether to re-prompt](#use-plugin-history-when-re-prompting). Do not stop at the first eligible match when several sources could materially help.
- **Offer up to six together.** For Data workflows, make one combined installation offer containing up to **six eligible plugin IDs** whenever multiple integrations are applicable or plausibly useful. Collect their exact IDs or accepted marketplace references before calling `suggest_plugins`, then put the selected set in a single `plugin_ids` array. Include required sources and useful optional context together, with a concrete role for each integration. If more than six qualify, select the six most useful for the current task. One call per turn limits the number of calls, not the number of IDs in that call; do not turn a valid batch into serial single-plugin prompts. Honor higher-priority instructions and any lower limit in the active tool schema or enforced by the service. If search-returned IDs are required, search the selected dependency names first.

Use `get_plugin_dependencies` only when the local manifest is unavailable or server-side dependency metadata would help. It reads the server's effective release, not local files; even a `name@marketplace` reference can resolve the globally listed plugin by name. When returned, `plugin_dependencies` maps `category_ids` to `plugin_id`; legacy `dependencies` and `unresolved_apps` describe app mappings. Empty legacy mappings do not establish that named dependencies are absent, and null `is_installed` means unknown.

Example calls use `plugin_management` as the namespace; use the actual exposed names and exact references from current context or discovery. Run these only when missing sources justify discovery:

```javascript
// For business context that could span documents and meeting records:
await Promise.all([
  plugin_management.search_plugins({query: "Meeting Notes", limit: 10}),
  plugin_management.search_plugins({query: "Documents", limit: 10}),
]);
// After eligibility checks, one offer for relevant sources, including optional context:
// Resolve these variables to exact accepted references; include up to six eligible IDs.
// Use a smaller set if the active tool imposes a lower limit.
plugin_management.suggest_plugins({plugin_ids: [documentsPluginId, meetingNotesPluginId, knowledgePluginId]});
```

For one missing provider, search it directly, for example `search_plugins({query: "Snowflake", limit: 10})`. An eligible exact recommendation can avoid another lookup when the schema accepts it. Explain what the proposed set unlocks in one sentence and continue independently supported work while the user chooses what to install. Check the result for rejected or unresolved candidates; submission is not installation.

For example: "Connect Drive for source documents, and optionally Notion for decision records and ChatGPT Meetings for discussion context; choose the sources you use." Use this kind of combined offer when the task and workspace make those sources plausible, without claiming they contain the needed evidence before reading them.

Ask which provider the user uses only when the answer determines where their evidence lives. Do not choose by manifest order or request every alternative warehouse. Follow the provider's instructions and use a known accessible scope. Ask for the smallest catalog, database, or schema scope only when the connector requires it and context or discovery cannot resolve it.

#### Use plugin history when re-prompting

Use returned `suggestion_history` and the current conversation to avoid repetitive offers. Counts and timestamps show prior offers; only an explicit refusal or `last_outcome: "dismissed"` confirms a decline. Use judgment based on priority, recent offers, and what has changed: be conservative with optional enrichment, while missing P0 evidence, such as warehouse access needed for the requested metrics, may justify asking again. Honor explicit "don't ask again" and source exclusions, and avoid repeatedly asking within the same request.

When re-prompting, briefly acknowledge the prior offer or confirmed decline and explain its importance now: "I suggested warehouse access earlier; this question needs live metrics, so connecting it would let me verify the answer." Ground that acknowledgment in the available history and continue supported work.

#### Wait for required connector setup

Suggestions do not establish installation or connection. After offering a plugin for required source access, treat setup as pending until a tool result or user response establishes otherwise. An immediately returning suggestion tool, elapsed time, or no response does not mean installation was declined or failed. If an existing authorized connector already supports the needed operation and scope, use it; otherwise pause work that depends on the missing access.

Do not switch to computer use, browser UI, browser-provided tools, or scraping to read that source while installation or connection is pending. For example, after offering Google Drive for a complete file listing, wait for connector access instead of opening Drive in a browser. A declined or failed installation does not itself authorize that fallback either; use browser or computer access as an alternative to the connector only when the user explicitly chooses that route.

Continue useful work that does not depend on the pending connection, such as analyzing supplied evidence or preparing the analysis structure. If no independent work remains, explain which connection is needed and yield for setup. Do not busy-poll installation or abandon the source requirement to keep working. Apply this waiting behavior to both new suggestions and legacy installation requests.

Track each integration separately within a combined offer. Resume the work a confirmed connection enables without waiting for optional integrations in the same set. Declining optional context does not block an answer supported by the available evidence; required source access still follows the waiting policy above.

When setup completes or the user returns, refresh tool discovery and verify the needed source with a small relevant read-only operation before resuming dependent work. Scope success claims to the operation and source actually checked, including material limits or pagination. An empty result means no data was visible in that scope; it does not by itself establish a connection failure. A successful table listing verifies metadata access, not permission to query the required tables or availability of the needed metrics. Resume the same task without restarting intake; do not assume installation automatically wakes a completed task.

### Continue with supported evidence

Proceed with a useful medium-confidence answer when the available authoritative evidence supports it and material limitations can be explained. Distinguish observations from interpretations; do not demand exhaustive sources or maximal confidence. Offer missing integrations that would strengthen the answer while continuing independent work.

Medium confidence is a qualitative judgment about interpretation or coverage, not permission to invent measurements, denominators, quotations, or unread source contents. Pause only results or actions that require missing evidence or access. Complete supported portions and identify what remains unresolved; if nothing useful can be grounded, explain the source requirement and next step. An optional installation offer does not make the underlying evidence requirement optional.

### Older clients and unresolved access

If a higher-priority tool instruction requires a smaller set despite a larger array schema, honor it and describe the conflict accurately. Do not claim that the app technically supports only one installation because instructions restrict suggestions or allow only one call per turn. Report an enforced batch limit only when the active schema or a tool response establishes it. Do not bypass per-turn call limits with repeated offers.

When the new suggestion surface is unavailable, use `list_available_plugins_to_install` or client-provided recommendations and `request_plugin_install` if exposed. Follow their actual schemas and restrictions: older tools may require a specifically requested provider and an unsuccessful tool search before listing or installation. Do not use that restricted path for unsolicited optional enrichment. Use only exact compatible returned IDs. These requests can block on elicitation; `user_confirmed` does not imply `completed` or verified source access. Use whichever discovery capabilities are available and continue independently supported work when the client permits it.

If no viable match is found, discovery is unavailable, or setup fails, explain: "I couldn't find or connect a suitable integration through the available tools. Check the Plugins tab for a [category/provider] integration. If none is available, ask your workspace admin to enable one or grant access to your existing source." For a known failed provider, point to its plugin page. Installation cannot bypass an admin restriction.

Continue grounded work and offer the smallest useful authoritative export or upload when it can satisfy the request. If no usable evidence remains, offer uploaded data or a clearly labeled synthetic demo; use the demo only if the user selects it, and do not present it as an answer to their real-data question.
