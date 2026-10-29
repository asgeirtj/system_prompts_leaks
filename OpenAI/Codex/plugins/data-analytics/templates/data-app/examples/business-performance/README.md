# Business performance

Reference for a business owner investigating growth, adoption, economics, retention, and customer movement. **Northstar** is a fictional B2B workflow platform with seat subscriptions and usage billing across Workspace, Automations, and API—not OpenAI or customer data. A weekly review is one use, not a required layout.

## Composition

| Tab | Question | Supporting views |
| --- | --- | --- |
| Overview | How are we performing, and where should I investigate? | Four combined outcome/trend cards; product scorecard; account movers |
| Revenue & economics | What contributes to growth and gross profit? | Subscription/usage mix; product margin; reconciled revenue bridge; segment economics; financial history |
| Adoption | Do customers activate and deepen use? | Activation cohorts; product reach and intensity; seat utilization |
| Retention | Which paid cohorts remain customers? | Cohort table with maturity gaps; explicit retained/lost customer drill-down |
| Customers | Where is concentration, and what is happening at an account? | Searchable portfolio; populated account detail; concentration and product mix |

This is one composition, not a required tab, chart, or KPI count. Borrow only the questions supported by reviewed evidence.

## Scope and exploration

- Native tabs keep independent viewer-local filters. Overview, Revenue, Adoption, and Customers have population/date filters and tab-wide interval/comparison controls. Retention uses population filters, with cohort entry and observation cutoff in its section; activity dates do not redefine cohort membership.
- A section breakdown controls both segment-economics views. The account selector controls only Account detail; its title remains generic. Keep a valid explicit account—including a lost account—or default to an active revenue-producing account without broadening scope.
- Ordinary tab navigation restores its browsing filters. Explicit exploration transfers only destination-declared filters/focus and offers Back. Account/cohort focus is personal, not shared presentation or public URL data.
- Chart marks use the shared hover → anchored actions-only card. A named action performs drill-down; clicking away or Escape resumes hover. Table rows open the existing account or product detail, excluding embedded controls and text selection.
- Cohort hover shows retention, retained/total customers, and measurement date. Clicking only opens actions. **View customers** commits the population, clears stale status/search, and focuses the existing table; **Back to cohorts** restores the originating cell and scroll position. Initial detail stays populated without preselecting a cell. Unobserved cells are inert, not zero.

Use the public components from the reference resolved by the prepared project's `AGENTS.md` workflow. Cards, sizing, typography, menus, sources, date presets, sticky behavior, tooltips, loading skeletons, and axis formatting belong to the shared runtime. The authored cohort table owns its metadata columns and domain-specific navigation, not a second popover implementation.

## Fit and adaptation

Read [data-contract.md](data-contract.md) before adapting calculations.

- Omit distinct-account metrics and entity exploration without account-level evidence.
- Omit paid cohorts without contract history; omit utilization without identities and entitlements; omit margin without costs.
- Use targets only when supplied for the same period, population, and unit. Missing comparisons remain unavailable; an earlier available observation is not automatically the prior period.
- Revenue movements must reconcile. The bridge omits zero movements; the adjacent evidence table retains them as $0. Contributions are not causal explanations.
- Trailing-28-day NRR retains its own definition when optional prior-period display is toggled. Headline and trend endpoint agree; source rows include both comparison windows.
- For a business with consumer subscriptions, enterprise seats, and API usage, map them separately; they have different populations, units, costs, and retention definitions.
- Prefer another composition for cohort-first, queue-first, or entity-first work. Never copy fictional rows, source labels, or targets into a real-data dashboard.

## Fixture and performance

`fixtures/generate.mjs` exports a deterministic `fixture()`; preparation materializes only that selected fixture into the new project's `src/data.json`. Do not check in generated JSON or HTML. The synthetic roster defines expected contract-days, including zero-use days, independently from activity rows.

Domain calculations run in an example-owned inline Worker for the large account-day fixture. The engine caches global period/population/grain results separately from account and breakdown details; comparison is presentation-only. Local pending states replace affected blocks, not the tab.

The default offline build bundles the local `?worker&inline` import into the self-contained HTML; no source-build exception or dependency installation is needed. Preserve off-main-thread execution and the scoped loading/cache lifecycle for this workload. Borrowing the overview/drill-down pattern does not require copying the full analytics engine or Worker; choose execution strategy for the actual reviewed workload.
