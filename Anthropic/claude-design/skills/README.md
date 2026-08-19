# Skills

One folder per skill, each holding a `SKILL.md` with YAML frontmatter and the verbatim prompt text. Extracted from the live environment (reconciled August 19, 2026).

Frontmatter follows the schema this project's own `SKILL.md` uses — `name`, `description`, `user-invocable`, nothing else. The environment serves skills as plain prompt text with no frontmatter of their own, so `name` and `description` are reconstructed from the skill list in the system prompt.

The system prompt and the raw tool schemas live in `claude-design.md` at the project root. Starter component sources live in `starter-components/`.

## Built-in skills

All 19 are user-invocable from the slash menu, in this order:

**Create**

| Skill | Folder |
|---|---|
| Make a deck | `skills/make-a-deck/` |
| Make a doc | `skills/make-a-doc/` |
| Interactive prototype | `skills/interactive-prototype/` |
| Wireframe | `skills/wireframe/` |
| Animated video | `skills/animated-video/` |
| Create design system | `skills/create-design-system/` |
| Frontend design | `skills/frontend-design/` |
| Maps & geography | `skills/maps-geography/` |
| 3D object | `skills/3d-object/` |
| HTML email | `skills/html-email/` |
| Flier | `skills/flier/` |

**Enhance**

| Skill | Folder |
|---|---|
| Make tweakable | `skills/make-tweakable/` |
| Claude API in prototypes | `skills/claude-api-in-prototypes/` |

**Research & data**

| Skill | Folder |
|---|---|
| Web research | `skills/web-research/` |

**Export & handoff**

| Skill | Folder |
|---|---|
| Save as PDF | `skills/save-as-pdf/` |
| Export as PPTX (editable) | `skills/export-as-pptx-editable/` |
| Export as PPTX (screenshots) | `skills/export-as-pptx-screenshots/` |
| Save as standalone HTML | `skills/save-as-standalone-html/` |
| Handoff to Claude Code | `skills/handoff-to-claude-code/` |

## Internal skills

Built in and fetchable, but absent from the system prompt's skill list and the slash menu — Claude invokes these itself, the user never picks them.

| Skill | Folder |
|---|---|
| Hi-fi design | `skills/hi-fi-design/` |
| Options | `skills/options/` |

## Changed in the August 19, 2026 reconciliation

- **Animated video** rewritten for the `animations_v3.jsx` continuous-composition engine (one element tree keyed to an authored clock, `OM_SCENES` / `OM_PLAYBACK` write-back contract, `<Shot>` / `<Captions>`). `animations_v2.jsx` is no longer offered by `copy_starter_component`.
- **Flier** now builds on the `doc_page.js` starter (explicitly paginated single `<section class="page">`) instead of hand-rolled print CSS.
- **Make a doc** rewritten around `doc_page.js` — flowing pages vs fixed sheet, CSS-columns print rules; the old `<main class="doc">` layout/typography guidance is gone.
- **Make a deck** now says to ask with `ask_user` (including a design-system question); the duplicated slide-writing/planning blocks were deduplicated.
- **Save as PDF** adds the `omelette-print-source` provenance stamp, the doc_page rebuild path, and the fixed-canvas page decision.
- **questions_v2** replaced by **ask_user**: 13 question kinds (adds chips, segmented, select, color, user-questions, file-options, design-system, code-source), `prompt` subhead, `follow_up` rounds, decide-for-me and skip semantics.
- System prompt gained **Tool search**, an expanded **GitHub** section (`github.md` receipt file, screen map, one-turn sync), **Additional design guidance**, and the injected **default aesthetic** / **system-info** blocks.
- New tools documented: `github_compare`, `tool_search_tool_bm25`. `connect_github` is now a no-op banner superseded by the code-source question.
- Verified unchanged: Interactive prototype, 3D object, Web research, HTML email, Make tweakable, Claude API in prototypes, Frontend design, Wireframe, both PPTX exports, Create design system, Save as standalone HTML, Handoff to Claude Code, Maps & geography, Hi-fi design, Options.

Removed in earlier reconciliations: **Send to Canva** (dropped from the built-in list), **Canvas** (replaced by Options — `design_canvas.jsx` no longer exists), **Read PDF** (`read_skill_prompt` no longer serves it, though the system prompt's workflow section still mentions invoking it).
