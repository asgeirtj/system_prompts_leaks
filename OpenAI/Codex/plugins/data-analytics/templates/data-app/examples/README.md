# Dashboard references

Read [manifest.json](manifest.json) to find a composition by question, grain, dimensions, and exploration needs, then load only the selected brief, contract, and relevant source. The build-dashboard skill owns selection and adaptation. This catalog is not a layout schema, metric authority, or theme selector. A dashboard composed from scratch is equally valid.

`draft` references are for explicit maintainer development/review, not automatic recommendations. A `golden` entry records human approval of the exact `review.approvedRevision`; keep its date and actual reviewers. Approval makes it eligible for ordinary reference selection, not a claim that every automated, browser, or fresh-generation gate passed. Track remaining verification separately and require renewed review when changing its revision. `deprecated` references remain identifiable but are not recommended. The populated base supplies the default working code, not a required business schema or sample evidence.

From the plugin root, prepare a fresh approved reference preview with:

```sh
node scripts/prepare-data-app.mjs --surface dashboard --output /absolute/new-project --example business-performance
```

Explicit draft previews additionally require `--allow-draft`.

For real-data adaptation, use `--from-reference REFERENCE_ID --snapshot /absolute/reviewed.json` instead of `--example`. This copies the selected golden reference's canonical authored content with the reviewed snapshot, assigns a fresh artifact ID, and never loads its fixture. The CLI returns `needsAdaptation: true`: query bindings and sample-specific content must be adapted before preview or delivery. The build-dashboard skill owns that adaptation workflow. Draft/deprecated references are not eligible for this path; `--allow-draft` is only for sample previews.

The shared helper never installs dependencies, builds, opens a browser, publishes, or changes an existing project. Follow the shared Data app contract for those steps. Sample previews use only their selected fixture. With `--surface dashboard` and neither reference option, it copies the populated base's dashboard code with `needsAdaptation: true`, optionally using `--snapshot /absolute/reviewed.json`; it never copies the base's sample data. Use `--blank` for explicitly requested scratch authoring on the selected surface. It cannot be combined with a reference option. `--example` cannot be combined with `--snapshot` or `--from-reference`.

The populated base, all references, and the blank starter support the normal offline build, including Business Performance's bundled worker. No separate runtime or automatic source-build fallback is required.

Each example owns composition, data requirements, deterministic fixtures, and semantic assertions. A catalog `fixture` may reference compact JSON or a bundled `.mjs` module exporting `fixture()`; large synthetic datasets are generated only for the selected preview, not checked in or shipped as repeated JSON. Use the existing `source.metricDefinitions` in its snapshot for metric definitions; the contract explains applicability and does not duplicate those definitions. Import shared behavior through `src/data-app-public.jsx`. No per-example runtime, dependencies, theme, or App routing.

The catalog and starter live beside the canonical base because they share its runtime. `scripts/prepare-data-app.mjs` handles setup for dashboards and reports; the focused skills own composition and adaptation. These catalog entries provide dashboard references. Plugin-level preparation tests cover copied-runtime integrity; example-local tests own domain semantics. Run both through the plugin's existing test command.

After installing the standalone base's locked dependencies, `npm run test:data-app-examples-build` from the plugin root verifies every catalog reference's standalone build, snapshot hash, sample separation, and server-rendered content, plus a table-only scratch composition. It neither launches a browser nor proves visual/interaction or fresh-model acceptance. The [live-evaluation prompts](../../../tests/live-evals/dashboard-example-prompts.json) cover model choice separately.

## Review questions

- Can a cold reader answer the stated decision and inspect the contributing evidence?
- Do filters, chart edits, source inspection, copy, and exports preserve the same population and units?
- Does the installed package resolve every referenced file from an arbitrary working directory?
- Can a fresh model omit unsupported sections, borrow one or several relevant patterns, or reject all examples?

Do not check in generated HTML, screenshots, model transcripts, or live source data. Preserve user edits and identity when updating existing artifacts; catalog revisions are not artifact migrations.

## Available references

The catalog has six golden analytical references: Business Performance, Infrastructure Capacity, Acme Cloud automation usage, Fleet Operations, Stock Watch (`finance`), and Product Tracker. Each owns one canonical authored implementation, brief and evidence contract. Gallery entrypoints delegate to that implementation; preparation copies it without a separate runtime fork.

The development gallery also includes the main report, Component Lab, and neutral starter. Component Lab demonstrates shared chart capabilities such as funnels.

Add a reference only when it serves a distinct analytical need.
