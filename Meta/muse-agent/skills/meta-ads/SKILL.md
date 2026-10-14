---
name: "meta_ads"
title: "Meta Ads"
description: "Create, write, or manage Meta ads and assets: ad copy, campaigns, spend, reports, audiences, catalogs, product feeds, feed refresh schedules, experiments, and policy. Always load for any request to create or write an ad, or to advertise a product or service, even when no platform is named; this includes sensitive or restricted categories. Always load for any question asking what a Meta, Facebook, or Instagram advertising policy means, allows, prohibits, or requires, including a standalone policy-definition question with no account context. Those questions must use ads_policy_tool, never browser search or memory. Load for a specifically named catalog or feed with an upload or refresh-schedule request; use Ads reads to resolve ownership before writing. Generic unnamed feeds need context. Whether an image, claim or piece of copy may be used in an ad is ALWAYS a Meta Ads task — 'can I use this in an ad', 'is it allowed', 'is this against policy', and any rights, likeness, celebrity, logo or trademark question about advertising with an image, including a follow-up about one just generated. Those are ads-policy questions, not general legal ones. An ad request uses the campaign workflow unless explicitly only an image or organic post."
icon: "meta_ads"
metadata: { "includeInPrompt": true }
---

# Meta Ads

## Purpose
Use this skill for any Meta Ads read or write. The live catalogue covers
accounts, campaigns, reporting, audiences, datasets, catalogs, experiments,
policy, and help. A bare request to create or design an ad enters the complete
campaign controller unless the advertiser explicitly asks only for a standalone
image asset or organic post. The controller owns full-research versus explicit
guided planning and every approval boundary; do not restate that flow here.

**Ad spend belongs here.** "How much did I spend", "what did it cost", "where did
the budget go" and "break down my spend" are Meta Ads questions whenever an ad
account, campaign, ad set or ad is in play — route them to this skill, not to a
bank or card connector, which sees money leaving an account and knows nothing
about delivery. Only reach for a financial connector when the user is asking
about their bank, card, or business finances rather than their advertising.
Discover availability with `list-tools --names-only`, inspect selected tools
with `describe-tool`, and invoke them with `call-tool`, including
`ads_creative_upload_media` for new media.

## Policy questions: mandatory route

Treat any question about what a Meta, Facebook, or Instagram advertising policy
means, allows, prohibits, or requires as a Meta Ads task, even when it names no
account, campaign, or ad. Load `references/policy.md`, pass the user's policy
question to `ads_policy_tool`, and call it before answering.
Browser search, a public policy page, and model memory are not substitutes for
the canonical tool result. If the tool is unavailable or returns `N/A`, say the
policy could not be confirmed instead of answering from another source.

## Resolve the owning system before routing

Route on the object and its context, not on a generic noun. `catalog`, `feed`,
`product`, and `audience` do not by themselves mean Meta Ads. They may belong
to a storefront, a content feed, another commerce system, or Meta Ads.

Treat the request as Meta Ads when at least one of these establishes ownership:

- the user says Meta Ads, Facebook/Instagram advertising, Ads Manager,
  Commerce Manager, an ad account, campaign, ad set, ad, or dynamic ads;
- the object is Ads-specific, such as a Meta Pixel/dataset, Custom Audience,
  product set used for ads, or an Ads delivery setting; or
- the current conversation or a read-only Meta Ads lookup has already resolved
  the named object or id inside the user's Meta Ads account.

A specific catalog or product-feed name or id **must load this skill first** for
read-only ownership resolution, even when the user did not say Meta Ads. The
same is true for a specifically named feed when the request concerns its upload
or refresh schedule, for example "change my Shopify nightly feed to refresh
hourly." Use the required Ads list/read chain to look for that exact object
before searching cron jobs, hooks, tracking items, reminders, or local scripts;
those surfaces are not substitutes for an Ads product-feed lookup. One unique match
establishes Ads ownership; only then may an Ads write be proposed. If no object
matches, or more than one object could be the target, ask one short
disambiguating question and do not write. A platform-like word in a name, such
as `Shopify`, is part of the supplied name and does not prove the feed belongs
to that external platform.

When only a generic noun is present and ownership is still unclear, ask one
short disambiguating question, such as whether they mean their Meta Ads product
feed or another feed. Do not mutate either system while it is ambiguous. After
an object is resolved to Meta Ads, do not hand it to a generic Feed or commerce
tool, and do not silently fall back to another system when an Ads capability is
unavailable.

## References

Advertising is a domain where a fluent, confident, wrong answer costs the
advertiser money. These files carry the rules that stop that. Read the ones the
task touches **before** answering, not after drafting.

| Read this | When |
|---|---|
| `references/safety.md` | **Always.** Ten HARD boundaries: audience guidance, PII, proposal vs execution, Special Ad Category, policy sourcing. |
| `references/account-scope.md` | Any question about an account, catalog, audience, feed, or experiment — which is nearly all of them. **Especially when the question names none**: deciding whether to ask, or to carry one forward from an earlier turn, is what this file governs. |
| `references/evidence.md` | Any answer that reports a number, or that has to describe something missing. |
| `references/analysis.md` | Why, trend, ranking, comparison, or recommendations based on existing delivery performance. |
| `references/response-style.md` | Reporting, analysis, or metric-definition answers. Campaign-stage references own campaign presentation. |
| `references/tool-routing.md` | Reads not already routed by the active campaign-stage reference, especially catalogs, datasets, audiences, experiments, and analysis levels. |
| `references/policy.md` | Before any `ads_policy_tool` call, any question about what Meta's ad policies allow or prohibit, and any general advertising how-to. |
| `references/campaign-creation.md` | Start here for a complete new campaign. This short controller identifies the first incomplete stage; do not preload its later-stage references. |
| `references/campaign-planning.md` | Only while a complete campaign still needs identity resolution, a product brief, research, recommendations, hierarchy, full-plan approval, or an optional strategy artifact. |
| `references/campaign-guided.md` | Only when the advertiser explicitly requests step-by-step planning. |
| `references/campaign-delivery-compatibility.md` | While settling objective/optimization after destination and tracking are known, again on exact arguments before final review, and before adding an ad set to an existing campaign. |
| `references/campaign-targeting.md` | Only when campaign planning must resolve a non-country place, interest, or language into a canonical targeting object. |
| `references/campaign-budget.md` | Only when a proposed campaign is ready for budget pricing or its pricing inputs changed; full research loads it from planning after those inputs stabilize. |
| `references/campaign-creative.md` | Only when preparing or approving any campaign creative, including image, video, carousel, boosted-post, and partnership-ad formats. |
| `references/campaign-execution.md` | Only when preparing the final review, collecting its exact approval, creating the paused hierarchy, presenting its immediate handoff, or recovering partial creation. |
| `references/campaign-handoff.md` | Only after the advertiser selects a post-create delivery or editing action. |
| `references/campaign-manual-setup.md` | When a write was rejected as not available for this ad account — by a tool result, or quoted by the advertiser from an earlier attempt — or the advertiser asks to set the campaign up themselves in Ads Manager. Read it before explaining that rejection. |
| `references/writes.md` | Before executing a standalone create, update, activate, pause, delete, connect, or upload. Complete campaigns load it only when their staged references direct. |

## Tooling
Use `exec` to run the installed binary directly:

```sh
/opt/hatch/bin/meta-ads-cli <subcommand> [options]
```

**HARD invocation boundary:** run every Meta Ads command as its own `exec` tool
call. Never combine Meta Ads commands with a newline, `&&`, `;`, a pipe, or a
wrapper such as `cd`, `env`, `timeout`, or `bash`. That includes `| head` and
`| python3`: results over 128 KiB already come back as an `output_file`
(below), and `describe-tool --input-only` returns just the schema, so there is
nothing to truncate or parse inline. In particular, the complete
command string for the first protected account lookup must be exactly:

```sh
/opt/hatch/bin/meta-ads-cli call-tool --name ads_get_ad_accounts
```

The runtime directly spawns and attests that installed binary. A combined or
wrapped command requires a shell and intentionally cannot open the trusted
professional-consent presentation.

### Connection management and diagnostics

```sh
/opt/hatch/bin/meta-ads-cli status
/opt/hatch/bin/meta-ads-cli disconnect-url
```

`status` currently includes the full tool catalogue. Reserve it for connection
diagnostics; do not use it for normal capability discovery.

When the user asks to disconnect, disable, or turn off Meta Business access,
run `disconnect-url` as its own `exec` call. When the response contains
`disconnect_url`, share exactly
`[Disconnect Meta Business Manager](<disconnect_url>)`, without also pasting
the raw URL. The link opens Hatch's standard connector disconnect confirmation;
do not claim access was removed until the user confirms there. Never use the
retired `disconnect` command, which belonged to connector OAuth.

### MCP operations

```sh
/opt/hatch/bin/meta-ads-cli list-tools --names-only
/opt/hatch/bin/meta-ads-cli describe-tool --name <tool>
/opt/hatch/bin/meta-ads-cli describe-tool --name <tool> --input-only
/opt/hatch/bin/meta-ads-cli call-tool --name <tool> --agent-output --arguments-json '<json-object>'
/opt/hatch/bin/meta-ads-cli estimate-budget <typed plan flags>
/opt/hatch/bin/meta-ads-cli render-campaign-summary --summary-json '<json-object>'
/opt/hatch/bin/meta-ads-cli render-campaign-success --success-json '<json-object>'
/opt/hatch/bin/meta-ads-cli render-chart --chart-json '<json-object>'
```

Before any `estimate-budget` invocation, read `references/campaign-budget.md`;
its typed flag grammar is complete. Never substitute `--help` or raw MCP-schema
arguments.

The three render commands are local and credential-free. Pass each returned
`widget.kind` and `widget.data` to `widget.create` unchanged; never replace the
payload with hand-authored HTML or a placeholder. `render-chart` returns an
`html_file` card plus a `full_view.path`, not a link to include in prose.
`--chart-json` accepts exactly these keys and rejects any other:  
`{"type":"line"|"bar","title":"…","metric":"…","unit":"currency"|"percent"|"number","currency":"USD","x_labels":["…"],"series":[{"name":"…","values":[…]}],"reference":{"label":"…","value":…}}`;  
`currency` (the account's ISO code) is required with `unit: "currency"` and
rejected with any other unit; `reference` is optional, and `name` is required
when there are two or more series.

Status, discovery, and tool-call responses over 128 KiB return `output_file`,
`output_bytes`, and `output_format: "json"` instead of the inline response.
`output_file` contains the complete original JSON. Read or query that file in a
separate tool call, selecting only the fields or array slice needed; do not
print the entire file back through `exec`. Small responses keep their usual
shape. The file is temporary and need not survive a restart.

`ok` still describes the Ads operation. If `output_available: false` is
returned, output delivery failed even if the operation succeeded. Do not repeat
an Ads write solely to recover its result; check the resulting Ads state first.

### Placement-specific image generation

For campaign images, follow `references/campaign-creative.md` and run the
Ads-owned wrapper as a standalone command:

```sh
/opt/hatch/bin/meta-ads-cli creative generate-image --placement <feed|story|reel> --prompt '<text>' --output-dir workspace/your_files
```

The wrapper owns placement ratios and output validation. Repeat `--prompt` for
ordered constraints; add `--source-image <path>` only to adapt that accepted
image. Use `local_path` for review and retain `media_handle` when returned.
After approval, upload with that handle, or the exact `local_path` as `file`
when no handle exists, then use only the returned Ads reference.

New media reaches Ads only through `ads_creative_upload_media`. Asset selection,
source precedence, returned references, and approval ordering live in  
`references/campaign-creative.md`.

There is one endpoint. Do not pass `--endpoint`: a shipped build rejects any host
but the default, so an override does not reach a different server — it fails, and
the failure reads to the advertiser as Meta Ads being down.

`--arguments-json` accepts one object matching the live schema. Omit it when the
schema needs no arguments; the CLI supplies `{}`.

## Auth
New connections use the in-Hatch consent flow and the linked Facebook account.
Each Meta Ads operation executes inside WWW as that linked Facebook viewer; no
Facebook access token enters the Hatch VM.

Scopes: `ads_read`, `ads_management`, `instagram_basic`, `pages_show_list`, `business_management`, `catalog_management`.

## First-use setup flow

Discover compact names, then call the Ads operation the user requested. Do not
ask the user to connect a generic Meta Ads connector and do not produce a
`/connectors/connect/meta_ads` link. Meta Ads uses the linked Facebook identity
and the first-party professional-consent flow; legacy connector OAuth is
retired.

If a command result has `error_reason: PROFESSIONAL_CONSENT_REQUIRED`, Hatch
is showing the Meta Business Manager consent card. For a blocked Ads request,
respond with one short, user-facing sentence: "To connect your Meta Ads and
professional account analytics, please review the Meta Business Manager
connector and enable its access." Do not mention internal terms such as
professional-account consent, tool calls, blocked requests, or automatic
resume. Do not retry the tool or ask the user to say "try again"; successful
consent automatically resumes the exact blocked request.

If a command result has `error_reason: FACEBOOK_ACCOUNT_LINK_REQUIRED` or its
error begins with `FACEBOOK_ACCOUNT_LINK_REQUIRED:`, this is not the
professional-consent flow. Tell the user that Meta Business requires a linked
Facebook account and include the exact `next_action.url` (or the URL in the
error) as a clickable link labeled **Open Meta Accounts Center guidance**. Do
not replace that URL, show a connector card, or imply that consent was granted.
Stop the Ads workflow until the user links the account, then retry their
original request.

Do not reconnect for HTTP 400, Graph `code 100` / `subcode 33`, JSON-RPC
errors, rollout errors, or tool-discovery failures. A remote failure is a
failure to report, not an absence of connection — `references/evidence.md`
governs how to say it.

## Discovery-first workflow

**Tool execution begins with discovery.** Do not assume tool names, shapes, or
availability from memory — the server catalogue is gated per tool and evolves.
A tool remembered as missing, failing, or not rolled out gets the same fresh
check as any other. For a new
campaign, follow `references/campaign-creation.md` and load its planning stage
before asking a genuinely missing decision;
do not narrate the workflow before asking for a genuinely missing decision.
Names in `references/tool-routing.md` are the intent map, not a guarantee of
availability: confirm each against `list-tools --names-only` and inspect its
descriptor before calling it. Say you cannot do something rather than calling a
tool that is not there.

1. **List tool names once per conversation**: run
   `/opt/hatch/bin/meta-ads-cli list-tools --names-only` as a standalone `exec`
   call. Reuse that successful result across later turns in the same
   conversation. Refresh it after a failed operation, a CLI/skill update, or a
   signal that capabilities changed. Do not re-list before every call. Wait for
   this result before issuing
   any `call-tool`; do not fan discovery and execution out in parallel.
2. **Resolve the owning system, then match the user's intent to a tool** using
   the rules above and `references/tool-routing.md`. A generic noun is not
   enough to choose Meta Ads; a resolved Meta Ads object must not be handed to
   a lookalike tool elsewhere.
   Before a generic `call-tool`, run `/opt/hatch/bin/meta-ads-cli describe-tool
   --name <tool>` for each selected current-stage tool and reuse it while that
   schema remains current in the conversation.
   Use `--input-only` when the operation is already selected and only its
   argument contract is needed. The typed budget command validates its live
   schema internally, but read the estimator's input-only descriptor first so
   objective, optimization, and result enums are current. Independent
   descriptor commands may run together, but do not fetch later-stage create
   schemas early.
   If discovery is incomplete, truncated, unreadable, or lacks a required tool,
   stop rather than guessing a schema or probing with any write.
   If `list-tools --names-only` or `describe-tool` is rejected, stop and report
   an installed CLI/skill version mismatch. Do not substitute `status`, bare
   `list-tools`, or `--help`; scrape a truncated catalogue; inspect eval files;
   guess flags; or probe availability or argument shapes through `call-tool`
   with a real, guessed, or fabricated name.
3. **Resolve only missing prerequisite IDs**: reuse an ID the user supplied or a
   successful Ads call already established in this conversation. For a read-only
   specialized tool, pass an explicit `ad_account_id` directly; do not call
   `ads_get_ad_accounts`, `ads_get_ad_entities`, or `ads_get_field_context` merely
   to verify or prepare it. If a required ID is missing, resolve it with the
   relevant list tool. For an unresolved account, call
   `/opt/hatch/bin/meta-ads-cli call-tool --name ads_get_ad_accounts` in its own
   `exec` call (the empty arguments object is implicit). Do not add quotes, JSON
   arguments, prefixes, suffixes, or other commands to this invocation. Writes
   still require the account and target-object verification described in
   `references/writes.md`. Never guess an ID — a guessed ID usually returns
   another object's data rather than an error. It
   is the first protected account operation, not the first discovery command:
   compact discovery and its exact descriptor fetch still precede it.
4. **Call the tool**: append `--agent-output` to normal calls and build the JSON
   strictly from the selected tool's `input_schema`; do not add undeclared
   fields. Omit `--arguments-json` when the schema requires no fields. Preserve
   the exact first-account command above without `--agent-output`.
   When a schema exposes `advertiser_request`, use the advertiser's complete
   current multi-turn wording: the original request plus their later
   refinements and selections, not only the latest reply or your summary.
   If the CLI returns `tool_not_exposed`, do not retry with spelling variants or
   a fabricated name: choose a confirmed exposed fallback or report the missing
   capability. If it returns `tool_catalogue_unavailable`, stop and report that
   live Ads capabilities could not be checked.
5. **Consume output directly**: use the returned JSON. Report errors faithfully;
   a failed call is unavailable evidence, not a finding.
6. **Cite named Ads entities**: call `ads.resolve_entities` once before every
   response that mentions an ad account, campaign, ad set, or ad from Ads tool
   results. Include every such entity with the exact returned name and ID. For
   campaigns, ad sets, and ads, also include the returned owning ad account ID.
   Copy each returned citation marker exactly into the response. Do this even
   if the user did not ask for links. If the resolver is unavailable or an
   entity is missing a required ID, mention it without a citation. Do not
   invent names or IDs.

Before the first call, privately inventory every requested result and action. For each one:
select and describe the tool, resolve IDs and current state, obtain any required
approval, execute once, and verify the authoritative result. Before answering,
check that every requested part is either supported by retrieved evidence or
has one precise limitation statement.

The complete intent map, list/detail rules, and argument guidance live only in
`references/tool-routing.md`; do not duplicate them here.

## Write and destructive actions

Read `references/writes.md` before changing an account and
`references/campaign-execution.md` for complete campaigns. Safety owns what an
approval permits and what may be claimed after a write.

## Operating Rules

1. **Never print access tokens or the `client_secret`.**
2. **Do not invent IDs** — ad account, campaign, ad set, ad, catalog, audience, dataset, pixel, page, creative, or Instagram account IDs must come from a tool response or the user's message. If you don't have an ID, call the appropriate list/discover tool first.
3. **Explain, then invoke the write.** When the requested action is fully
   specified, supply the sentence that makes it meaningful and call the tool in
   the same response. The runtime approval card is the confirmation boundary;
   do not replace it with a yes/no chat question. `references/writes.md`.
4. **Respect the schema.** Send only fields declared in the tool's `input_schema`. Do not guess at field names.
5. **Report errors faithfully.** Include the JSON-RPC error `code` and `message`, or the MCP `isError` result body when present. Do not silently retry destructive calls. A failed tool is not a finding — see `references/evidence.md`.
6. **Stay within the requested scope.** Agreement to one change does not authorize unrelated changes.
7. **Make every progress claim match tool evidence.** No write call means the
   action has not started. A pending approval means it is waiting for the
   user's decision, not staged, queued, or underway. A refusal or cancellation
   means no change was made. An error means the action failed. Use completed
   past tense only for the exact fields and objects a successful write result
   proves changed.
8. **Do not turn task observations into persistent state.** Existing memory may
   inform stable business facts under the planning rules, but never write or
   update memory from an Ads workflow. Tool availability, rollout or gating,
   errors, account eligibility, and every Ads object, status, metric, or other
   tool result are live state that changes between conversations. Memory or a
   prior conversation holding one is unverified: never skip or shortcut
   discovery or a read because of it, and fetch it again in this conversation. Never use `MEMORY.md`, `AGENTS.md`, a
   persistence API, workspace files, skill files, or other local state as a
   campaign ledger. A read-only Ads request permits only reads; user-requested
   output artifacts are the sole exception.
9. **Never fabricate a metric value.** Report only figures a tool returned, and never compute, average, or extrapolate one. `references/evidence.md` and `references/response-style.md` carry the detail.
10. **Never state what a Meta ad policy says without retrieving it this turn, and read `references/policy.md` before any `ads_policy_tool` call.** Pass the user's policy question as `query`; the tool resolves it against the current live catalogue.
11. **Never claim readiness from credential presence alone.** Say Meta Ads is connected and ready only after `meta-ads-cli status` returns `authenticated: true` together with a `tools` catalogue.
12. **Never invent an audience.** Do not infer age, gender, geography,
    interests, exclusions, or lookalikes from business or account context.
    Broad Advantage+ Audience is the default. Verified evidence may support
    expandable suggestions within it; strict narrowing remains
    advertiser-initiated. `references/safety.md` rule 1.
13. **Decline without a verdict.** When copy, creative, or a claim cannot be
    used, say what you will not build and what safe alternative you can build;
    do not make a legal conclusion. `references/safety.md` rule 8.
14. **Editing a live object pauses it.** Except for a rename,
    `ads_update_entity` force-pauses an ACTIVE campaign, ad set, or ad. State
    that consequence before the write. `references/writes.md` has the details.
15. **Resolve non-country targeting.** A city, neighbourhood, region, ZIP,
    language, or interest becomes executable targeting only after
    `ads_targeting_search` returns its canonical object. Never invent or widen
    one. `references/campaign-targeting.md` has the campaign flow.
16. **No image is pre-cleared.** Inspect the actual selected image after
    generation or retrieval, not only its prompt, filename, or metadata. Screen
    recognizable third-party likenesses, logos, wordmarks, trade dress,
    characters, and artwork even when unnamed or introduced by the model.
    Advertiser-owned or licensed material remains usable; ask when provenance is
    unclear. Preserve AI provenance and never present generated media as a real
    person, place, or product. `references/campaign-creative.md` has the full
    preparation flow.
17. **A picture makes claims.** Treat seals, badges, ratings, certification
    marks, and on-image figures like written claims; an advertiser's stated fact
    is sufficient sourcing. Never originate a proof signal they did not mention
    or draw an approximation of a real seal, award, or rating mark. Generation
    redraws a source image rather than compositing an authentic mark, so ask for
    finished authorized creative when that mark must appear. Do not turn an
    explicitly unwritten claim into imagery; ordinary visual style is not a
    claim. State what the image asserts before creative approval.
18. **Generated creative is not available for every advertiser.** For an ad in
    one of these categories — social issues, elections or politics; housing,
    employment, or financial products and services; healthcare;
    pharmaceuticals; education; alcohol; gambling — generate no part of the
    creative: no image, and no primary text, headline, description or in-image
    words, in a creative plan or anywhere else. They supply the picture and the
    words; you still do the objective, audience, budget, build, analysis and
    policy work, which is most of it. Their own copy and their own image are
    theirs to use, checked as usual. Which category applies is set by WHAT IS
    BEING ADVERTISED, not by who the advertiser is or which industry they
    serve: a charity asking for donations to fund its own services is not
    social-issue content, though the same charity is in the category once the
    ad argues a social or political issue or leans on a named law, bill,
    election or policy fight, and that holds when the ask is only a donation;
    an agency or vendor selling to a regulated industry is not in it. Say the generator is not
    available for this ad; never say or imply that Meta policy or Meta's rules
    prohibit it, because they do not.
    `references/campaign-creative.md` has the detail.
    `references/safety.md` rule 8 applies.
19. **Create widgets and options before the message that shows them.** Text
    written before a tool call is commentary, which the advertiser never sees.
    When a response shows a widget or options, make its `widget.create` and
    `muse.create_options` calls before writing that message. Then write the
    final response in one piece: the explanation, question, or result, with
    each returned `embed_token` placed where its widget belongs and an options
    token last. A response whose only visible text is a token shows buttons
    with no question.
