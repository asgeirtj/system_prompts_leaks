# OpenCode

OpenCode picks its system prompt **per model**, not once per product. Driving the same binary against seven models on 2026-09-02 and 09-03 produced **three** distinct templates, not seven.

| File | Models that produce it | Characters | Tools |
| --- | --- | --: | --: |
| `opencode.md` | `big-pickle`, `ling-3.0-flash-fin`, `mimo-v2.5`, `nemotron-3-ultra`, `nemotron-3.5-lightning` | 9,622–9,656 | 11 (`opencode-tools.json`) |
| `opencode-muse-spark-1.2.md` | `muse-spark-1.2` | 10,250 | 11 (`opencode-muse-spark-1.2-tools.json`) |
| `opencode-gpt-5.6-sol.md` | `gpt-5.6-sol` | 10,334 | 9 (`opencode-gpt-5.6-sol-tools.json`) |

**Why only three files for seven models.** The first five differ from each other in exactly one line — *You are powered by the model named …* — and send a byte-identical tool set. Adding five near-duplicates would have added noise rather than information, so they are represented by the existing `opencode.md`, which is that template.

The other two are genuinely different documents:

- **Muse Spark** opens differently (`You are OpenCode, a coding agent … powered by Muse Spark`) and uses the responses dialect.
- **GPT-5.6-Sol** is a third template entirely (`You are OpenCode, You and the user share the same workspace…`), and its tool set swaps `edit` and `write` for `apply_patch` — nine tools instead of eleven.

So both the prompt *and* the wire format are chosen per model. Diffing the three files shows it directly.

## Provenance

Recorded off the wire by a local proxy while the binary ran unmodified — this is what OpenCode sent, which is not necessarily byte-identical to what its source tree renders. OpenCode is MIT-licensed and its prompt templates live upstream in `packages/opencode/src/session/prompt.ts` and neighbours; for anything where the source is the better authority, upstream is.

Machine-identifying strings are replaced with placeholder tokens; nothing else is reworded or reordered.

- Source archive, with the capture method recorded per artifact: <https://github.com/Continuum-AI-Corp/OrcaPromptVault> (`OpenCode/`)
- Capture tool: <https://github.com/Continuum-AI-Corp/OrcaReplay>
- Upstream project: <https://github.com/anomalyco/opencode>
