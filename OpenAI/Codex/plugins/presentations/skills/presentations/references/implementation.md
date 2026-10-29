# Local presentation implementation

Read before creating or editing a local PPTX. Do not modify this skill's files while making a deck.


## Runtime and paths

Call `load_workspace_dependencies`. Use its Node.js executable, Node.js packages, override binaries and Python executable as `RUNTIME_NODE`, `RUNTIME_NODE_MODULES`, `RUNTIME_BIN_DIR` and `RUNTIME_PYTHON`. Do not install substitutes or modify the bundled dependencies.

Set `SKILL_DIR` to this skill's absolute directory, `workspaceDir` to the task directory, `TMP_DIR` to a private build subdirectory, and `FINAL_PPTX` to a new file in a separate output subdirectory. Create both directories before export. For bare imports in authored `.mjs` files, link `node_modules` inside the build directory to `RUNTIME_NODE_MODULES`. Run modules with `RUNTIME_NODE`; plain `.mjs` files cannot contain TypeScript annotations or JSX syntax.

The finalizer checks the draft and writes the final PPTX. Both files must be inside `workspaceDir`. It will not overwrite an existing output, and its validation report must stay outside the output directory. Use a new output filename for each revision. If the user requests another destination you have permission to write to, validate locally first, then copy the file there unchanged. Never overwrite the source unless explicitly requested.

- Immediately before the first create/edit authoring command, run `mark_artifact_operation_started.mjs` successfully exactly once using the command below. Do not run it for read-only work. For edits, replace `create` with `edit`; adjust the expected count and output format to match the requested outputs. Run from the skill directory as a standalone command, without shell-variable expansion.
  ```bash
  node container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format pptx
  ```

## Typography and geometry

Keep template fonts and slide dimensions. Otherwise choose suitable available fonts and a 16:9 slide size. `resolvePresentationFont()` uses fonts discovered in the supplied runtime; pass `fontFamily` for an explicit choice or `availableFonts` for an independently verified list. It does not assume a fallback font is installed. Before creating the deck, list the fonts in the finalization font policy: `reference` for fonts from a PPTX/PDF reference, `user_request` for fonts the user named, or `design` for fonts you chose. Without a policy, the finalizer imposes no default font requirement.

Set fonts for shape and table text, and separately for chart titles, axes, legends and data labels. `applyPresentationChartFont(chart, {fontFamily})` sets chart defaults without adding a title. Keep intended font pairings and any additional fonts needed for other writing systems.

Geometry and numeric `fontSize` use CSS pixels at 96 DPI; `fontSizePt` uses points. Structured run sizes accept strings such as `"20pt"`. Native paragraph indentation is a documented exception: follow `references/native_bullets.md` in the installed skill. Do not copy small raw indentation numbers from older examples.

Use `artifact_tool_docs/API_QUICK_START.md` for runnable JavaScript and `artifact_tool_docs/api/API_DOCS.md` for the objects you need. These paths are relative to the installed skill. Put source citations in the relevant slide's speaker notes. Export a draft in the private build directory, then follow `references/finalization.md` for validation and delivery.
