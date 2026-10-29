# Adoption and retention operating review

This optional substantial example preserves the reviewed synthetic fixture and useful report composition from report PR #1273100 at `652c8e5ea767`. It is not the default starter, a required outline, or a universal business-data schema.

The report combines a conversion trend, growth-driver bridge, segment diagnostics, account risk, and separately labeled actual/forecast evidence. Its executive and technical variants share five reviewed sources and the current public components, rich editor, source drawer, chart controls, and optional section ordering. The technical variant also includes the reviewed account-level evidence table.

## Question and reasoning

The operating question is: **Is adoption on track, what accounts for the latest movement, and where should the existing retention follow-up concentrate?** The five sources answer different parts of that question:

- Six weekly observations establish the current position and comparison: 12,480 active accounts, 480 above the reporting-week target, with activation up 0.6 percentage points. The rate source does not contain the numerator and denominator needed to explain why activation changed.
- The recorded bridge reconciles 455 activation additions + 220 expansion additions − 165 churn losses = 510 net accounts. Churn absorbs 24.4% of gross additions. This explains the accounting movement, not the causal effect of an intervention.
- Every segment grows, but Search has 33.7% of active accounts and 45.6% of recorded at-risk users. Its 88% retention is six percentage points below Studio. Growth alone would therefore miss the retention priority.
- Three named accounts carry elevated source risk tiers. Meridian Signals and Lighthouse Query account for 135 of their 175 at-risk users. The follow-up list uses the source's existing actions; it does not invent an owner, deadline, remedy, or probability of churn.
- The next-week projection is 13,060, or 580 above the latest actual. The supplied 12,000 target belongs to the current reporting week. A future target and forecast-calibration method are unavailable, so the report does not claim a verified next-week plan beat or turn the fixture's confidence field into a calibrated probability.

The composition follows that reasoning: a short operating summary; history and activation charts to establish the movement; a reconciled waterfall to explain it; paired segment charts to locate the tension between size and retention; named-account risk and recorded actions; and a separately labeled scenario. Seven charts remain because they answer different parts of this particular question, not because substantial reports require seven charts. Executive and technical versions use the same evidence; technical mode adds inspectable rows and the forecast-method limitation.

## Build

From the canonical `templates/data-app/base` directory, with its dependencies installed:

```sh
node examples/reports/adoption-retention/build.mjs
node examples/reports/adoption-retention/build.mjs --technical
node examples/reports/adoption-retention/build.mjs --local-preview
node examples/reports/adoption-retention/build.mjs --local-preview --output-root /absolute/new/report-directory
```

Each command copies the current starter to a fresh system-temporary directory, installs only this example's authored report/CSS and fixture there, runs the normal integrity check and production build, and prints the absolute HTML path. The source fixture stays byte-for-byte identical to the published checkpoint; only the temporary snapshot's surface/audience changes. No generated HTML or build output belongs in Git.

For canonical-template maintainer QA only, use `--local-preview` when serving the compiled HTML over loopback, including the in-app browser. It verifies the canonical runtime first, then passes the temporary project path as a one-build Vite definition so existing local actions can identify the artifact. This private preview contains a local path: do not publish or distribute it. The normal build remains the export/publication build and does not embed that path. Ordinary generated-artifact delivery follows the shared Data App Contract.

The optional output directory keeps a preview outside system-temporary storage and must not already exist. This example generates no annotations: its previous growth, activation, and retention labels repeated comparisons already available in the figures. An annotation now requires additional sourced context absent from the chart, not a quota of callouts. Existing saved copies of the three original labels are retired by matching their IDs and original wording. Unrelated saved annotations, custom wording, explicit empty annotation lists, and other chart edits remain intact. The report's prose and reviewed fixture are unchanged.

Use the example's sections or chart compositions selectively. For a different question, author a different report with its own reviewed data; do not preserve this story merely because it is available.
