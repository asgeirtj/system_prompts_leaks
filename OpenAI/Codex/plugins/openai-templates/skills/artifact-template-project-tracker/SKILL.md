---
name: artifact-template-project-tracker
description: "Create a spreadsheet using the Project Tracker template and its retained reference file. Use when the user selects or names Project Tracker. Manage workstreams, tasks, owners, status, priority, dates, launch pulse, and a Gantt schedule."
---

# Project Tracker

Create a new spreadsheet from this template. Keep the reference file unchanged.

## Workflow

1. Read `artifact-template.json` and resolve its paths relative to this skill directory.
2. Identify the prompt-advertised preinstalled spreadsheet capability. Use the available resource or filesystem tool to open its advertised resource, plugin, skill, or file target, then follow its reference/template workflow with the retained file. If no such capability can be identified and read, say it is unavailable and stop; do not recreate or install it.
3. Treat the user's prompt and available sources as the content input. Do not invent facts merely to fill a template slot.
4. Clone or import the reference instead of replacing its visual system with generic defaults.
5. Render and verify the finished spreadsheet, then return the final artifact.

## Fidelity

Preserve sheet structure, formulas, names, number formats, dimensions, tables, charts, validation, conditional formatting, and frozen panes.

User instructions control requested content and explicit deviations. The retained reference controls layout and formatting where the user has not requested a change.
