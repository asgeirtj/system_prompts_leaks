# Optional File-Backed Read

Read only when a large connector response is inconvenient to inspect, or a searchable outline/control inventory would help. Ordinary reads and edits use the Docs tools directly.

The bridge calls those same authenticated connector tools and saves the raw response, normalized outline, annotated text, and control inventory. It does not call Google HTTP endpoints directly or use a separate credential setup. It cannot recover missing connector semantics or prove that every control was detected. Private-use glyph detection is a conservative heuristic, not proof of a dropdown.

## Load and invoke

This recipe requires an execution environment with `tools`, `load`, and `store`, plus shell access to the skill files. Set `SKILL_DIR` to the installed skill directory and `WORKSPACE` to task scratch space. If unavailable, continue with direct connector reads.

Load the checked-in bridge once per session. Keep the byte check so truncated source is never evaluated.

```js
const bridgeKey = `google_docs_trusted_read_bridge:${SKILL_DIR}`;
let bridgeSource = load(bridgeKey);
if (!bridgeSource) {
  const bridgePath = `${SKILL_DIR}/host/docs-trusted-read-file-bridge.mjs`;
  const metadata = await tools.exec_command({
    cmd: `/usr/bin/wc -l -c < '${bridgePath}'`,
    workdir: SKILL_DIR,
    login: false,
    yield_time_ms: 30000,
    max_output_tokens: 1000,
  });
  const [reportedLines, expectedBytes] = metadata.output.trim().split(/\s+/).map(Number);
  if (metadata.exit_code !== 0 || !Number.isInteger(reportedLines) ||
      !Number.isInteger(expectedBytes) || reportedLines < 0 || expectedBytes < 1) {
    throw new Error("Could not stat the Docs trusted-read bridge");
  }
  const lineCount = Math.max(1, reportedLines + 1);
  const ranges = Array.from(
    { length: Math.ceil(lineCount / 200) },
    (_, index) => [index * 200 + 1, Math.min(lineCount, (index + 1) * 200)],
  );
  const chunks = await Promise.all(ranges.map(([start, end]) =>
    tools.exec_command({
      cmd: `/usr/bin/sed -n '${start},${end}p' '${bridgePath}'`,
      workdir: SKILL_DIR,
      login: false,
      yield_time_ms: 30000,
      max_output_tokens: 14000,
    })
  ));
  if (chunks.some((chunk) => chunk.exit_code !== 0)) {
    throw new Error("Could not load every Docs trusted-read bridge chunk");
  }
  bridgeSource = chunks.map((chunk) => chunk.output).join("");
  const actualBytes = encodeURIComponent(bridgeSource)
    .replace(/%[0-9A-F]{2}/gi, "_")
    .length;
  if (actualBytes !== expectedBytes) throw new Error("Could not load the complete Docs trusted-read bridge");
  store(bridgeKey, bridgeSource);
}

const trustedReadBridge = new Function(
  `${bridgeSource.replace(/^\s*export\s+/gm, "")}\n` +
  "return { executeDocsTrustedReadToFiles };",
)();
```

Do not emit `bridgeSource` or rich connector results with `text()`.

Use a fresh output directory for each snapshot:

```js
const trustedRead = await trustedReadBridge.executeDocsTrustedReadToFiles({
  documentId: TARGET_DOCUMENT_ID,
  tabId: TARGET_TAB_ID,
  outputDir: `${WORKSPACE}/bridge/trusted-read-01`,
  workspaceRoot: WORKSPACE,
  skillRoot: SKILL_DIR,
  tools,
});
text(JSON.stringify(trustedRead));
```

Pass exactly one of `documentId` or `documentUrl`. `tabId` is optional. Do not use ordinary `import()` inside the standard execution isolate, evaluate the raw wrapper separately, recreate the detector, or stage connector responses through `store()` and `apply_patch`.

## Inspect the result

The result contains target identity/revision, metadata availability, warnings, control counts, and artifact paths/hashes. Read only the relevant files:

| File | Use |
| --- | --- |
| `document-text.md` | Searchable text with paragraph indexes and control annotations |
| `document-outline.json` | Structured paragraph, style, list, and table records |
| `control-inventory.json` | Detected controls, native elements, and ranges |
| `document-result.json` | Full connector response when normalized files omit a needed field |
| `dropdown-result.json` | Provider dropdown metadata, if that capability is available |

Search large files and read bounded sections. Do not insert protected-control annotations into the document. For this file-backed route, let the bridge persist responses directly instead of copying large payloads through model context.

`dropdownControl` means provider metadata identified a dropdown. `opaqueTemplateControl` means a marker or unclassified control was detected; preserve its range without claiming known options or selection. Missing or mismatched-revision dropdown metadata cannot establish exact semantics.

The inventory is advisory, not a write gate. Continue with scoped connector edits supported by the available tools. Use fresh direct reads for follow-up targeting and verification; rerun the helper when its saved scope or revision is no longer sufficient.
