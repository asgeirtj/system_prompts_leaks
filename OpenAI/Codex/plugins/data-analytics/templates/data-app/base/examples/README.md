# Development gallery

`templates/data-app/examples/` owns the golden dashboard catalog, authored implementations, fixtures, and evidence contracts. The shared app preparer adapts that code when creating a dashboard. This `base/examples/` directory hosts the Vite preview routes: dashboard entries import those canonical implementations and generated fixtures rather than maintaining copies. It also contains Component Lab and optional finished report references. It is excluded from prepared apps.

Browse the references at `/examples/`. Component Lab includes the focused chart-annotation fixture.

One Vite server serves the tracker and every example. Start the existing data app dev server from the `base` directory, then open:

`http://127.0.0.1:4180/examples/`

Each example has its own URL path on that same port. The gallery groups the examples and provides a copy-address button for each one.

## Authoring examples

Examples are optional guidance, not the default dashboard/report or a second required starter. Keep component examples small and focused on one reusable pattern. Compose the actual application in `src/content/` using the public API described in `../AGENTS.md`.

### Source-backed report prose

```jsx
import { ReportSection, RichNarrative, useDataApp } from "../../data-app-public.jsx";

export function Finding() {
  const { visible, reviewedRows } = useDataApp();
  if (!visible("finding")) return null;
  return <ReportSection id="finding" title="What changed" queryId="observations"
    queryIds={["observations", "context"]}
    sourceRowsByQuery={{ observations: reviewedRows("observations"), context: reviewedRows("context") }}>
    <RichNarrative id="finding:body" value="Write the finding and its limitations here." />
  </ReportSection>;
}
```

Replace the illustrative query IDs and prose with the current artifact's evidence. Use `showHeading={false}` if the Markdown owns its heading. A single-source section needs only `queryId`. Sections, summaries, ordering, metrics, and charts are optional. More substantial report compositions belong in `examples/reports/`, with their own reviewed fixtures and example-specific checks.

## Finished report references

For a focused shared visual pattern, see [chart annotations](component-lab/chart-annotations/README.md).  
It runs the same reviewed benchmark, event, range, and point references in a report and a dashboard.

The runnable report in `src/content/report/` is a short operating readout: performance against plan, a reconciled account-growth explanation, and a supported retention follow-up. It is deliberately complete rather than a set of empty headings. Replace it for a different question.

Each reference explains its question, evidence, reasoning, and composition choices. Consult the closest example after deciding what the current analysis needs; borrow useful techniques, not its business story or section list.

- [Adoption and retention operating review](reports/adoption-retention/README.md): a substantial five-source report with executive/technical variants, growth drivers, segment and account diagnostics, and a separately qualified scenario.
- [Activation diagnostic](reports/activation-diagnostics/README.md): a methods-focused report using pooled rates, file-quality checks, an exact rate-versus-mix decomposition, sensitivity checks, and reproducible calculations.
- [Contextual chart annotations](reports/contextual-stories/README.md): three fictional cases with exact operational, one-time billing, and monitoring-coverage records that add facts absent from the plotted measures.
- [Delivery diagnostic](reports/delivery-diagnostic/README.md): a synthetic business decision with a concise conclusion, competing explanations, chart cards with contextual annotations, expandable evidence, and scoped task links. It uses the report's shared visual defaults rather than a separate demo theme.

The adoption and activation references leave ordinary comparisons unannotated. Use zero annotations when the chart already conveys the finding and no additional sourced context changes its interpretation.
