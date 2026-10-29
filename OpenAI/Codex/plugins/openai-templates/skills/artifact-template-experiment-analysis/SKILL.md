---
name: artifact-template-experiment-analysis
description: "Create a document using the Experiment Analysis template and its retained reference file. Use when the user selects or names Experiment Analysis. Analyze experiments with hypotheses, methodology, results, interpretation, limitations, and next steps."
---

# Experiment Analysis

Create a new document from this template. Keep the reference file unchanged.

## Workflow

1. Read `artifact-template.json` and resolve its paths relative to this skill directory.
2. Identify the prompt-advertised preinstalled document capability. Use the available resource or filesystem tool to open its advertised resource, plugin, skill, or file target, then follow its reference/template workflow with the retained file. If no such capability can be identified and read, say it is unavailable and stop; do not recreate or install it.
3. Treat the user's prompt and available sources as the content input. Do not invent facts merely to fill a template slot.
4. Clone or import the reference instead of replacing its visual system with generic defaults.
5. Render and verify the finished document, then return the final artifact.

## Fidelity

Preserve page setup, sections, styles, lists, tables, headers, footers, and recurring page elements.

User instructions control requested content and explicit deviations. The retained reference controls layout and formatting where the user has not requested a change.
