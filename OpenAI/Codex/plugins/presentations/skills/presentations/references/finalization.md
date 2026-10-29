# Validate and deliver

Set runtime paths and fonts as described in `references/implementation.md`. The finalizer reads a draft PPTX, checks it and writes a separate final file. Keep the source and draft unchanged; use a new filename for the output.

## Declare task requirements

Build `requirements` from the actual request and source deck. Omit options that do not apply:

- `explicitTotalSlideCount`: an ordinary N-slide request means N total. Use `requestedContentSlideCount` only when the user explicitly requests N content slides **plus** one cover. Keep the template's slide count when the user requires it.
- `requiredNativeTableOwnerSlides` and `requiredNativeChartOwnerSlides`: slide numbers that must contain editable tables or charts. Use empty arrays when none are required; slide numbers start at 1. The finalizer still checks every chart in the deck.
- `requiredEmbeddedWorkbookChartOwnerSlides`: use only when the original workbook or its formulas must be kept. See [editable tables and charts](native_evidence.md) for use across applications and cases where the user requires an image instead.
- Template coverage options (`sourceTemplatePath`, `requiredTemplateReferenceSlides`, `minimumTemplateCoverageRatio` and associated flags) apply only when the task requires them. Do not invent a percentage of slides to reuse as proof that you followed the template. Always check the source slide dimensions and compare the source and output visually.
- `tableArithmeticContracts`: sums explicitly required by the task. Row and column numbers start at 0; slide and table numbers start at 1. These are required checks. Automatically inferred totals are diagnostics because labels, units and rounding can be ambiguous.
- `materializeLiteralChartWorkbooks`: defaults to `false`. Set it to `true` only when intentionally creating a new workbook snapshot from complete literal chart data. This can be part of authoring a new chart from the supplied data. For an existing chart, make this an explicit repair decision consistent with the user's request, not an automatic response to a failed check. Never substitute a snapshot when source workbook formulas or lineage must be preserved.

Set `fontPolicy` to describe where the fonts came from: `{basis:"design", families:[...]}` for fonts you chose, `{basis:"user_request", families:[...]}` for fonts the user requested, or `{basis:"reference", families:[...], referencePath, referenceSha256}` for fonts from the PPTX/PDF you must match. The reference must actually use those fonts in its text. Use `scriptFonts` for additional fonts needed by other writing systems. Do not claim the user requested fonts you chose. Omitting the policy imposes no default font requirement; it does not verify font availability or authorize replacing template fonts.

## Check the draft and write the final file

This pattern assumes the builder has defined `presentation`, `PresentationFile`, the absolute runtime/task paths, `requirements`, `fontPolicy`, and `expectedSlideSizeEmu` (`"CX,CY"` from the source for template work, or from the intended new canvas). Create the output directory separately from the private build directory.

```js
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { finalizePresentation } = await import(pathToFileURL(
  path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs"),
).href);
const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });
const candidatePath = path.join(stagingDir, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const tableOwners = requirements.requiredNativeTableOwnerSlides ?? [];
const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", expectedSlideSizeEmu,
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    ...tableOwners.flatMap(number => ["--require-native-table-slide", String(number)]),
  ],
  requiredNativeTableOwnerSlides: tableOwners,
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, `${path.basename(FINAL_PPTX)}.validation.json`),
});
```

The finalizer checks the PPTX file structure, declared layout and font requirements, editable chart titles and data, and explicit table arithmetic contracts. It also checks that Artifact Tool can import the file before writing the final output. Workbook snapshot creation requires the explicit option above. A private validation report identifies the final file and records checks and warnings. These checks do not prove the slides look good, the facts are correct or the deck works in PowerPoint or Google Slides.

## Review and repair

Before delivery:

1. Render every final slide.
2. Inspect each slide individually at full size; use a contact sheet only for deck-level flow and consistency. For a small edit, compare changed slides with the originals and scan the whole deck for unintended changes. For template work, compare against the reference, not this skill's design defaults.
3. Fix unintended overlap, clipping, wrapping, broken connectors, unresolved placeholders, inconsistent footers or page markers, and chart/data mismatches. Repair and render again in the authoring workflow. For standalone file authoring, export a new draft and finalize to a new filename.
4. Confirm the deck satisfies the user request and the narrative remains coherent.
5. Verify researched claims and sourced assets are traceable and cite sources when research informed the deck.
