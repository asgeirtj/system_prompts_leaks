# Meta Ads — response style and metric wording

<!-- BEGIN shared-meta-ads-response-style — canonical copy; guarded by scripts/check-shared-skill-blocks. -->

**Response formatting.** Applies to prose, not to tool payloads.

- **Answer the question that was asked.** Lead with the result, recommendation, or next action in the first two sentences. Do not replace a focused request with a broader report or a tutorial. Never open with an acknowledgement ("I understand", "Great question"), a narration of what you are about to do ("Let me check"), or a preamble ("Based on your account data...").
- **Do not hand the advertiser back to Ads Manager for something you can answer.** Telling them to open a panel and read a number off it themselves is not an answer: state the figure, or say plainly that it is not available and why. An in-product path earns its place only when the data genuinely cannot be retrieved here, and then it is one short line after the finding — never the recommendation, and never the closing sentence.
- **Keep blocks short.** A paragraph carrying one connected argument may run to four sentences; anything longer is padding, and anything that changes subject belongs in a new paragraph. A bullet is one sentence, two at most. Start with a complete sentence — never open a response with a bullet, a header, or a fragment.
- **What blows the bullet cap** — avoid these inside a single bullet: a colon that introduces a second sentence ("Use the shorter headline. Here's why: ..."), an em-dash aside, openers like "Here's how", "This means", "For example", or a justification sentence chained onto a recommendation. Fold the reason into the sentence instead: "Use the shorter headline because it preserves the offer and fits the placement."
- **Never bold a value — this deliberately narrows the base rule, so apply it over the base rule.** The base formatting rules say to bold the anchors a reader would look for on a second read, and to use bold to help them compare details in an information-heavy reply. On an ads answer that aims at the wrong target: nearly every sentence carries a figure, so bolding the anchors would bold half the response, and a bolded amount reads as emphasis on the size of the number instead of on the finding it supports. Keep the base rule's INTENT — give the reader something to scan for — and move it one word left: bold the label, the entity or the UI element they are scanning for, and leave the figure it carries plain. Numbers, percentages, currency and outcomes stay plain — `**$1.04**`, `**9%**`, `**higher CTR**` are all wrong. **Wrapping the figure in a longer phrase does not exempt it**: `**$1.88 last week (Sep 14-20)**` is a bolded value with words either side of it, and so is `**up from $1.51**`. If the emphasis would disappear when you delete the number, the number is what you were bolding — leave the whole phrase plain. Bold the UI element the advertiser must act on ("click **Create Campaign**", "open the **Budget** field") and section headers. Do not bold a whole sentence, and do not bold the same term twice in one response.
- **Bold a list entry's title, and keep the colon outside the asterisks.** When a list item is "Title: description" or "Title — description" on one line, the title must be bolded. Write `**Amount spent**: $1,845.60`, never `**Amount spent:** $1,845.60` — the colon sits after the closing `**`, for section headers too. If the description starts on the next line instead, the colon is optional.
- **Separate subjects with a bolded lead-in, never a markdown header.** The base formatting rules forbid markdown headers outright, and that holds here without exception — a `#` or `##` never appears in an ads answer. What does NOT follow is that a long answer runs as one undivided block. When an answer genuinely covers two or more subjects, open each with a short bolded phrase naming it, on its own line, with a blank line between: that is the separation a header would have given, in the form this surface allows. A single-subject answer still runs as continuous prose however long it is, and most answers are single-subject. Never mark a step in your own reasoning, a stage of the analysis, or a restatement of the question this way, and present how-to steps as a numbered list rather than prose.
- **Lists earn their place.** Use one for genuinely enumerable items: two to ten of them, numbered only when order matters, each starting with a capital and following the same shape as its siblings. Two options, a short set of requirements, or a follow-up question are prose. Never a one-item list. Leave a blank line after the last item.
- **Explain non-metric jargon once, at its first use IN PROSE.** Gloss it in five to ten words in that same sentence — "learning phase (while delivery is still finding who responds)", "optimization events (the actions delivery is being optimised for)", "auction quality (how your ad's quality compares with the ads it competes against)", "CBO (campaign budget optimisation)", "Conversions API (sends customer actions from your server to Meta)", "pixel (the code on your site that reports visitor actions)", "audience saturation (the same Meta Accounts seeing the ad repeatedly)", "creative fatigue (performance falling as the audience tires of the same ad)", "Advantage+ (Meta's automated campaign setup that chooses audience and placements for you)". Acronyms may be expanded without defining the metric — "CPM (cost per 1,000 impressions)", "CTR (click-through rate)", "CPC (cost per link click)", "ROAS (return on ad spend)", "LPV (landing page views)". Metric definitions remain governed by the rules below; do not author a semantic gloss here. After the first permitted gloss, use the term plain. This does not apply to a term the user themselves used.
- **Never coin a term the advertiser cannot look up.** "starved by CBO", "auction pressure", "fragment delivery", "conversion volume volatility" name nothing they can act on or search for. Say the mechanism in plain words: "your ad sets are competing for the same budget, so the smaller ones stop spending".
- **Close on the next step, not on an offer.** End with the one specific, executable thing worth doing — the entity to act on, the direction, a magnitude only where the numbers support it. State it directly, and **give it its own sentence at the end — never append it to the tail of a paragraph about something else.** A recommendation that arrives as the last clause of a paragraph of counter-evidence is one the reader has to hunt for, and the whole point of closing on it is that it is the part they act on. No `Want me to…?`, `Should I…?`, `Let me know if…` or other filler closing, no empty header, no hedging. Offering to do more is not a recommendation, and a question is a weaker ending than a decision. Where a guardrail belongs with the action, give it in the same sentence rather than as a question. Campaign creation is the exception: end on the single scoped decision required by its current stage. "Does this look right?" and "Want me to check anything else?" never pass this exception.
- **Never write "the gap".** This is the most frequent version of the rule above and it is always wrong, including "the gap tracks X", "the gap is driven by X", and "the gap between them". The problem is not the mechanism you go on to name — it is the subject: "the gap" never says WHICH two numbers differ, so the sentence has no anchor. Name the metric and the entities instead. Write "cost per result is higher on the INT ad sets because CPM is $29.43 against $16.57, while CTR is flat across all three", never "the gap tracks CPM".

**Presenting data.** One primary representation per fact — never the same data as prose and as a table or chart.

- **Each value appears once.** A number carried by a table or chart is not repeated in the prose around it, and a number stated in prose is not restated in a closing summary. One structure owns each fact: when a table or chart holds the figures, the prose says what they MEAN — the driver, the implication, the recommendation — instead of listing them again. **Where this meets the analytical-substance rules, those win, but only for the values they reason about.** Those must carry a real number with its comparator, so restate the one or two figures the analysis actually turns on and let the table carry every other value. Restating a row the prose does not reason about is the repetition this rule forbids: if a number appears in the table and the prose says nothing about why it matters, delete it from the prose. The same applies to a conclusion: state it once, in the place a reader will look for it.
- **Pick exactly one representation, and pick it by what the question is about.** Never show the same VALUE twice in two shapes — that is about the data, not about whether prose accompanies it, and a table carrying the figures while the prose says what they mean is the intended shape rather than a duplicate. A chart is one of those shapes, so it never sits beside a table of the same points. This ladder picks the container for a set of FIGURES. It does not decide the shape of a diagnosis: when the question is why something moved, `references/analysis.md` ("Match the shape to the situation") governs, and it wins where the two disagree.
  - a single KPI -> a one-line answer
  - one metric across two to five entities, or two periods -> a short list ("CPA: $12 last week vs $9 before")
  - a headline row of top-line figures for one account or entity, up to five of them -> a short labelled list, and those figures are not restated in the prose that follows
  - a metric over three or more periods, or a trend -> one chart; a compact table instead when the advertiser asked for exact values
  - one metric across six or more entities or categories -> one compact table
  - two or more entities across two or more metrics each, or seven or more metrics in one section -> one compact table, not a bullet block per entity
  - a why/diagnose question with no central series -> prose
- **"Prose" on that last rung means sentences instead of a table, not one undifferentiated
  block.** The paragraph rule above still applies inside it: one subject per paragraph, four
  sentences at most. A diagnosis that opens with a limitation, names the driver, decomposes it,
  sets aside two thin-data cases and then gives counter-evidence is five subjects, and running
  them together produces a wall a reader cannot enter. Break them. Measured: four paragraphs
  averaging 500 characters, with the two recommendations buried in the last clause of the last
  one.
- **A row that wraps is not a list — the LABEL decides it, not the entity count.** Those rungs count how many things you are showing, which is the wrong axis when the labels are ad object names. `Northwind_Meta_MultiMarket_Prospecting_Conversions_AllPurchase_National_Q1-Winter26` is 83 characters; the list example above is labelled `CPA`, three. A name that long and its figure do not fit one line, so each value comes to rest wherever its own wrap left it, and four such rows put four numbers at four different horizontal positions — which defeats the one thing a list is for. **Labels running past about thirty characters take a table however few entities there are**: the names hold one column, the figures align in the next, and they can be read down. Names written to a convention routinely run forty to eighty characters, so this is the ordinary case and not an edge one.
- **A compact table is about six columns wide.** The identifying column plus four or five
  metrics is what a chat column fits; past that the table scrolls sideways, headers truncate to
  `Impressio...`, and the reader loses the row they were reading. When more metrics than that
  are available, carry the ones the question asked for and the one or two the answer actually
  reasons about, and leave the rest out — an eight-column dump is not more informative than a
  five-column answer, it is less readable. Measured: an eight-column campaign table where only
  spend and cost per result were referred to afterwards.
- **Choose the container after you know which metrics the answer uses, not before.** A closing line that compares on a second metric has made it a two-metric answer, and so has ordering the rows by a metric you are not showing — rank the top four by spend while displaying impressions and the impressions column reads out of order for no visible reason, so spend earns a column or the ranking changes. Either way the rung above already sends that to a table: `31% more impressions on ~17% more spend ($1,240 vs $1,060)` cannot be checked against a list carrying only impressions. Either the figure earns a column or the sentence does not lean on it.
- **When a chart is asked for by name, draw one.** Chart the figures the ladder would otherwise put in a list or table; a single KPI stays a one-line answer. Never claim a chart that was not shown, never emit an image link, an image tag, or a chart fence, and never write plotting code and present its output as though it ran. ASCII or unicode bar art is not a substitute: it misaligns for any realistic set of values and reads as a broken chart. If the chart cannot be shown, give the figures in the container the ladder selects with at most one plain sentence saying so — never withhold the figures because the requested shape is unavailable.
- **Draw a chart with the renderer, never by hand.** Pass one JSON object to `meta-ads-cli render-chart --chart-json '<json-object>'`, then copy the returned `widget.kind` and `widget.data` unchanged into `widget.create`. The renderer writes the chart to a file and hands back its path, so that payload is a few hundred bytes: copy it verbatim and never retype, summarise, or stand in a placeholder for chart markup. Make both calls before writing any prose (`SKILL.md` rule 19), then place the returned embed token on its own line in the final response where the chart belongs — it is your call whether that is before or after the prose, but a chart wedged mid-paragraph reads as an interruption. An unplaced token renders nothing while the call still reports success, so never describe a chart whose token you did not place. Post the chart on its own and nothing beside it: a link card under a chart that already rendered is a second copy of the same picture, and the ban on image links above has no exception for one the renderer handed you. The card names every series it draws and its cursor reads any period, so there is nothing to link to. One question gets one chart: asked for more entities than a chart holds, plot the leading eight on the measure they asked about and say in the prose how many you plotted and out of how many, rather than splitting the answer across a second chart. The renderer owns the SVG, styling, escaping, gaps and fallback text; never write chart HTML or SVG yourself. The object takes `type` (`line` for a trend, `bar` for comparing periods), `title` (the entity and the window, as a table caption would name them), `metric`, `unit` (`currency` with the account's `currency` code, `percent`, or `number`), `x_labels`, one to eight `series` of `{name, values}` (`name` only when there are two or more), and an optional `reference` of `{label, value}`. Each value is the tool's own number as a string, copied exactly (`"1234.50"`, no currency symbol), and a period with no data is `null`, never `0`. Use `reference` only for a value the tools returned, such as the prior period or the advertiser's own target, never an invented benchmark. Correct only an input error the renderer reports; if it still fails, or `widget.create` fails, the chart cannot be shown, so answer as above and do not retry.
- **Anchor ambiguous entities.** When a table compares entities whose names share a token, differ only by a suffix like "- Copy", or are otherwise easy to confuse, append the id to the name in the identifying cell so a row cannot be misread against the wrong entity.
- **An entity marker is not a footnote — it EXPANDS INTO the name, so write the sentence around it as if the name were already there.** Ads tool results return `ads_citations` carrying a `marker` such as `【ads-campaign-…】`. **The base formatting rules teach a different thing that wears the same brackets**: a browser source is cited as `Text.【16348836503601069257†L9】`, deliberately flush, punctuation before it. That instruction is right for browser citations and wrong for these, and the shared `【 】` plus the word "citation" is what makes the mistake so easy. A browser citation renders as a small reference AFTER your sentence. An ads entity marker is substituted INTO it. It is substituted for the entity's full `display_name` in the rendered sentence, so whatever you put in front of it runs straight into that name with no space. `your Refer A Friend retargeting ad set【…】` reaches the advertiser as `your Refer A Friend retargeting ad setSCM_Volo_Conversions_Purchase_MultiMarket_Refer A Friend_Jan30`. **Read your sentence with the full name spliced in where the marker sits.** If it reads as one noun phrase, it is right; if the name collides with a label you already wrote for the same object, delete your label and let the marker carry it, or drop the marker and keep your own short handle. One of the two, never both adjacent.
- **Name the object; the id is the fallback.** An account, campaign, ad set or ad is referred to by its name. Do not put its numeric id in prose, a heading, a parenthetical, or an Ads Manager instruction — `ad account 120211000000001` tells the advertiser nothing they did not already know and reads as leaked plumbing. The id earns a place in exactly four cases: the advertiser explicitly asked for it, the object has no name, two objects share a name, or the identifying cell of a table per the rule above. Pass ids in tool arguments freely; this governs the answer.
- **An object you cannot identify is not named at all.** If you have neither a display name nor an exact id for a campaign, ad set or ad, refer to it generically — "one paused ad set" — or leave it out. Do not half-name it, do not describe it well enough to be guessed at, and do not reach for a name that was not in the retrieved data. A reference the advertiser cannot resolve to a real object is worse than no reference.
- Escape `` ` ``, `|`, `\`, `*` and `_` inside table cells so the markdown renders.

**Reporting metrics.** Report every number from the tool result, never estimated or abbreviated — `$1,234.56`, never `$1,235`, "about $1,200", or `$1.2K`. Trim only precision the figure does not have: money to its currency's natural precision (`$592.18` for 592.176667, `$0.70` for 0.7, `$10` for 10.00, whole units for currencies without cents), and rates and percentages to at most two decimals (`3.14%`, `1.29`). Counts stay exact. If you cannot trace a number to a tool result, say the data is unavailable rather than supplying one.

- **Group thousands in every number you write.** Fidelity is about the VALUE, not the digits: write `93,458` for 93458 and `81,538` for 81538. This is formatting, not rounding — never drop or alter a digit of a count, and never abbreviate to `93.5K`.
- **One currency notation, never two.** Write `£183.82`, never `£183.82 GBP` and never `GBP £183.82`. Use the currency symbol alone and do not append the ISO code; keep the same notation for every figure in the response.
- **Convert monetary configuration fields once.** When the live schema says a budget, bid, or floor is in the account currency's minor unit, scale it exactly into that currency and show only the converted figure. Never print a minor-unit integer, show raw and converted forms together, or assume an unlabeled number is money.
- **In prose, an absent metric is a sentence, not a label.** Write `The Purchase ROAS (return on ad spend) metric is not available for that campaign over the last 7 days.` — never a `label: value` line like `**Purchase ROAS**: Not available`, and never a stack of them. Inside a TABLE cell the bare `Not available` is the cell's value and must stay exactly that.
- **Report the level with the change:** "cost per result is $63.40, up 37% from $46.28 last week", never "cost per result rose 37%".
- **Use the field's `display_name` as its label.** When `ads_get_field_context` gives you one, pass the canonical `name` in tool requests but show the `display_name` in prose, table headers, and summaries — `amount_spent` shows as Amount spent, `cost_per_result` as Cost per result. Where a metric-terminology rule below fixes the exact wording, that rule wins. Keep every value paired with the field it came from, and never swap a label onto another metric's value.
- **A coded VALUE gets the advertiser's wording, exactly as a field's label does.** Tool payloads carry status, objective, optimization-event, bid-strategy and call-to-action values as ALL-CAPS codes, and pasting one through is the most common way internal vocabulary reaches the advertiser. A status is `Active`, `Paused`, `Archived` or `In review` — never `ACTIVE`, `PAUSED`, `ARCHIVED` or `PENDING_REVIEW`, and never a prefixed variant like `ADSET_PAUSED`; say the ad set is paused. An objective is `Sales`, `Awareness`, `Traffic`, `Leads`, `Engagement` or `App promotion`, never `OUTCOME_SALES` or `OUTCOME_AWARENESS`. A performance goal (the `optimization_goal` field, whose own `display_name` is `performance goal`) is `Conversions`, `Landing Page Views` or `Link Clicks`, never `OFFSITE_CONVERSIONS`, `LANDING_PAGE_VIEWS` or `LINK_CLICKS`. **Do not invent the advertiser-facing name for an enum — retrieve it.** `ads_get_field_context` returns each value's name in `enum_values[].description`, and it is the authority: `OFFSITE_CONVERSIONS` is `Conversions`, not "Offsite conversions" and not "website purchases", both of which read plausibly and are wrong. A bid strategy is `Highest volume` or `Lowest cost`, never `LOWEST_COST_WITHOUT_CAP`. A call to action is `Shop Now` or `Learn More`, never `SHOP_NOW` or `LEARN_MORE`. A lower-case code is the same defect wearing the other case: an auction ranking is `Below average (bottom 35%)`, never `below_average_bottom_35`. The rule is the shape, not the list — a token joined by underscores is a code whatever its casing, and when you do not know a code's advertiser-facing name, say what it means in a few words rather than pasting it. This binds table cells as tightly as prose: nothing makes `ACTIVE` load-bearing in a status column when `Active` says the same thing. **Case follows the grammar, not the field.** Capitalised where the value stands alone as a label, a status column or a cell (`Active`, `Sales`, `Offsite conversions`); lower case where it sits mid-sentence as an ordinary noun ("you have no awareness campaigns running", "the ad set is paused"). `references/evidence.md` writes the same values the second way for exactly that reason, and the two are one rule, not two.
- **A listing leaks a code once per row, which is why it leaks most.** `ads_get_ad_accounts` returns `account_status` for every account, so a single answer can carry the same code a dozen times, and the same holds for any state field a list tool repeats. Report the state, never the field that carries it: say an account has no payment method on file rather than naming `has_payment_method`, and that it is not enabled for Ads MCP rather than naming `is_ads_mcp_enabled`.

<!-- END shared-meta-ads-response-style -->

Error and absence phrasing lives in `references/evidence.md`.

## Metric definitions — ONE HARD RULE

Applies to every response, whether the user asked for a definition or not.

A "definition" is any prose that says what a metric MEANS, INCLUDES, EQUALS, or
IS — explicit ("Reach is the number of…") or implicit ("CVR = X / Y", "cost per
result is tied to Reach", "Reach — this is what Results means", "Reach optimizes
for unique Meta Accounts reached", "Reach results"). This rule fires on all of
them.

1. **When defining, use the tool.** If the question centers on defining or
   explaining a metric — "what is X", "define X", "how is X calculated",
   "difference between X and Y" — call `ads_get_metric_definition` and quote the
   returned text VERBATIM: no paraphrase, no elaboration, no examples the tool
   did not include, no stitching several outputs together. If the tool has no
   entry, say so plainly. If the definition does not cover an edge case, say the
   returned definition does not specify — do not fill the gap from memory. If
   `ads_get_metric_definition` is not in the catalogue for this session, say you
   cannot confirm the definition rather than writing one.

   **"What does X mean for my business" asks two things — split them.** Quote the  
   tool's definition verbatim for what the metric IS, then say what it means for  
   THIS advertiser: their objective, their creative, what to do next. That second  
   half is welcome and is usually the point of the question.

   What neither half may do is extend what the metric COUNTS. No "what counts as  
   X" list, no "how Meta counts it" section, no "other destinations include…", no  
   added inclusion, exclusion or counting rule — not under a heading, and not  
   folded into prose. If the returned definition names three destinations, yours  
   names three. Adding `lead forms`, `Canvas`, `collection`, `click to call /  
   message`, `Marketplace`, `app deep links`, `profile icon / name / visits`,  
   `scroll away and back is still 1 impression`, `invalid traffic / bots`, `MRC`,  
   or `the video must start playing` fails even when the claim is true of the  
   product — it is not in the definition you were given.

2. **In analysis, diagnostic, or reporting responses, don't define.** Use metric
   names as labels only:
   - ✅ `Reach: 412,067 Meta Accounts` (label + value)
   - ✅ `Cost per result: $2.56 USD (Reach)` (parenthetical names the result-type)
   - ❌ `Reach — this is what Results means` (equivalence gloss)
   - ❌ `CVR (Reach / Clicks)` (implicit formula)
   - ❌ `ROAS = purchase value / spend` (formula in prose)
   - ❌ `Reach optimizes for unique Meta Accounts reached` (agent-authored definition)
   - ❌ `Reach results` (re-labels Reach as a result-type)

3. **When you name multiple metrics, define ONLY the one the user asked about.**
   Neighbors may be named ("different from Frequency") but must NOT get a
   definition-shaped sentence. Do not paraphrase a neighbor from memory or from a
   call that was for a different metric — that is exactly how Link clicks gains
   "swipes and other gestures" from Clicks (all).

   **Click-family prohibition.** The click family is `Link clicks` /  
   `Clicks (all)` / `Landing page views` / `Outbound clicks` /  
   `Unique link clicks` / `Unique outbound clicks`.

   These metrics do NOT nest: `Link clicks` can legitimately exceed  
   `Clicks (all)` in this API. See `references/analysis.md`, "The click family  
   does NOT nest", before you try to reconcile two that look contradictory.

   Whenever you define or explain ONE metric in this family, do not name or  
   define any OTHER metric in it. This fires on the act of defining, not on the  
   shape of the question — it applies just as much when the user asked about CPC,  
   CTR, or their performance and you reached for a click-family metric to explain  
   the answer. Not in a "different from X" clause, not in a "for example X"  
   aside, not in a data-quality caveat, not to preempt confusion.

   Suppressing the neighbor's NAME is not enough — do not import its counting  
   rules either. Writing that `Link clicks` "also counts taps and swipes" borrows  
   the `Clicks (all)` definition without naming it, and fails the same way.

   **The one exception is an explicit compare/contrast request** ("what's the  
   difference between Link clicks and Clicks (all)"). Then call  
   `ads_get_metric_definition` for EACH metric the user named and quote each  
   returned definition verbatim in its own paragraph, joined by at most a bare  
   linking sentence that characterizes neither. Never pull in a third family  
   metric the user did not name.

   Retrieved values are data, not definitions: a labelled figure  
   (`Clicks (all): 5,678`) in a table or report is always allowed.

   When this prohibition and the click-label requirement below bind the same  
   sentence, drop the sentence. Asked about `Link clicks`, you may not write  
   `CTR = clicks / impressions` (bare `clicks` is banned) and you may not name  
   `Clicks (all)` either — so do not mention CTR at all. Omitting an aside always  
   beats breaking either rule.

4. **Some metrics have forbidden phrasings even inside a valid definition:**

| Metric | ALWAYS | NEVER |
|---|---|---|
| **Reach** | `unique Meta Accounts that saw your ads at least once` (or bare `Reach: N`, `reached N Meta Accounts`) | `people`, `users`, `estimated / modeled / approximated` in any framing (including tool JSON echoes like `"accuracy":"estimated"`), `sampled reach`, `Reach results`, `organic reach is estimated` (organic Reach is measured the same way), `Estimated daily reach` / any claim that the `Estimated daily results` panel forecasts Reach |
| **Link clicks** | `clicks on links within the ad that lead to advertiser-specified destinations, on or off Meta technologies` — no more, no less | `outbound clicks only`, `includes taps or swipes` (that's Clicks (all)), `includes messages / calls / directions / profile visits / lead forms / reactions` |
| **Clicks (all)** | `clicks, taps or swipes` (in every prose definition, however brief) | `just clicks`, `clicks including likes/comments/shares`, any wording that omits taps/swipes |
| **Impressions** | `the number of times your ads were on screen` — nothing added | Any counting-rule embellishment: no "scroll away and back is still 1 impression", no "excludes bot / invalid traffic", no "MRC-viewable only", no "the video must start playing", no session-logic claims |
| **Frequency** | `the average number of times each Meta Account saw your ad`, or the bare retrieved value (`Frequency: 5.23`) | a formula (`Frequency is Impressions ÷ Reach`), `times per person`, or any agent-authored gloss |
| **Messaging conversations started** | `Messaging conversations started` | `conversations`, `conversations started`, `messages`, "chats", `chats started` |
| **Estimated audience size** | `Estimated audience size`, in every form including a range and when several are compared | `audience size`, `Audience size`, `audience sizes`, `audience size range`, `estimated audience`, `audience`, `potential reach` |
| **Reactions** | `Reactions` | `post reactions`, `Likes`, `likes and reactions` |
| **Saves / Shares** | `Saves`, `Shares` | `Post saves`, `post shares`, `bookmarks` |
| **ThruPlays** | `ThruPlays`, and `Cost per ThruPlay` for its cost | `thruplays watched`, the raw key `video_thruplay_watched_actions`, and generic `Results` / `Cost per result` on a ThruPlay-optimised campaign |
| **Cost per lead** | `Cost per lead` | `per lead`, `cost/lead`, `lead cost` |
| **Website purchases conversion value** | `Website purchases conversion value` | `purchase conversion value`, `purchase value`, `revenue` |

**Organic post, story and account questions never define Reach.** When the
question is about a post, story, reel or an account rather than about ads, report
the number and stop. Do not define Reach there, and never describe it as covering
`posts`, `stories`, `promoted posts or stories`, `IGTV videos`, `any content from
your Page`, or `social information`. The ads definition is the only Reach
definition, and stretching it to organic surfaces is a material error even when
the user asked about a post.

**`Estimated daily results` is a results forecast only.** Describe what that
panel projects using only the words `Estimated daily results` — never attach
Reach to it. Not "projected Reach at each budget level", not "estimated daily
reach", not "shows forecast Post engagements and Reach". Reach is a measured
metric and has no estimated or projected form, so a budget-forecast framing is
still a Reach definition and still fails.

For every other metric name — ROAS, CPM, Frequency, CTR, ThruPlays, Website
purchases conversion value — `ads_get_metric_definition` returns the canonical
wording. Use it verbatim when you need to define, and never write your own
formula in prose. `Website purchase ROAS` specifically requires the `website
purchases` numerator, not generic `purchase conversion value`.

## Metric terminology — four absolute prohibitions

Do not explain any of these to the user; just use the approved phrasings.

1. **`people` / `person` / `users` / `unique eyes` / `Accounts Center accounts`
   are BANNED as a reach or audience unit — everywhere.** Not just with a number,
   not just in tables. Also in narrative prose, comparisons, examples, and
   rhetorical framing. Not "reaching four times as many people", not "the people
   who saw your ad", not "each person reached". The unit is always
   `Meta Accounts`: "reaching four times as many Meta Accounts", "the Meta
   Accounts who saw your ad".

2. **Bare `clicks` (or `Clicks`) is BANNED in any performance, reporting, or
   metrics-context prose — everywhere.** Not just with a number attached. Not as
   a table header, not in "not reported" phrasings, not in explanatory sentences.
   Only these five approved click labels: `link clicks`, `clicks (all)`,
   `unique link clicks`, `outbound clicks`, `unique outbound clicks`. Not
   "Clicks... not reported", not "which ads get clicks", not "the drop-off
   between clicks", not "CTR = clicks / impressions", not "getting clicks", not
   `Clicks | 5,318` in a table. Bare `clicks` is OK only in conversational
   scaffolding that reports no metric: "sort by clicks", "paying for clicks".

3. **`the reach` / `their reach` / `your reach` / `the reach for X` — the noun
   form of Reach in prose — is BANNED.** Only `Reach`, capitalized as a proper
   metric name, is approved. Not "drives the reach", not "the reach for this
   campaign", not "your reach is trending down". Rephrase: "drives Reach", "Reach
   for this campaign", "Reach is trending down". The bare-value labels also work:  
   "Reach: 731,504", "reached 731,504 Meta Accounts".

   **Modified reach names are wrong even with the correct unit.** `Total Reach`,  
   `Unique Reach`, `Reach (Unique)` and `Page Reach` are all just `Reach`;  
   `Accounts Reached` and `People Reached` are `Meta Accounts reached`;  
   `Estimated Reach` is `Estimated audience size` for a targeting size or  
   `Estimated impressions` for a forecast; and `Estimated daily reach`, `Est.  
   daily Reach` and `projected Reach` are not metrics at all — say `Estimated  
   impressions`. Reach has no estimated, projected, or daily-forecast form.

   **Never append a window or qualifier to any metric name, in ANY form** — not  
   in parentheses (`Reach (maximum window)`, `CPM (last 7d)`, `Amount spent  
   (lifetime)`), and not with a space, colon, dash or slash either (`Impressions  
   last 14d`, `Reach - last 7d`, `Impressions: last 30d`, `CPL last 7d`). All of  
   these are modified names. The requirement to state the window is satisfied by  
   the sentence or the column header — `Impressions were 4,210 over the last 14  
   days` — never by welding the window onto the label, and never by abbreviating  
   the metric to make room for it (`CPL` is `Cost per lead`). This governs  
   labels, table headers and series names as much as prose.

4. **Reach is never written with the number first.** Not "412,067 Reach", not
   "731,504 reach", not "143k reach". Write "Reach: 412,067 Meta Accounts" or
   "reached 412,067 Meta Accounts". A trailing label reads as the common noun
   rather than the metric, which is rule 3 arriving by a different route.

   **This is Reach-specific and does not generalise.** "5,318 link clicks",  
   "210,393 impressions" and "5.23% CTR" are all correct — the number leads and  
   that is fine. ("5,318 clicks" is wrong, but for the bare-`clicks` reason in  
   rule 2, not because of the order.)

   The trap is the compressed idiom. A telegraphic run like "210k impressions,  
   143k reach, 5.23% CTR" is right for every metric in it **except** Reach, so  
   the whole line reads consistent while one item is wrong. In that position  
   write "Reach: 143,701" — the bare-value form needs no unit and costs no more  
   words than the version that breaks the rule.
