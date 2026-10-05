---
name: sheets-artifact
description: "Use when creating, editing, or inspecting a spreadsheet or workbook (Excel, Google Sheets, or CSV), or when the task calls for a reusable budget, model, tracker, or structured data the user can sort, calculate, or update. Also use for questions that require inspecting an existing workbook; not for quick arithmetic or a small one-off table in chat unless requested as a spreadsheet."
---

# Spreadsheet Artifacts

Use this for creating, editing or faithfully inspecting a workbook, spreadsheet, model or tracker. A small one-off table or simple calculation can usually stay in chat. A question about an existing workbook does not authorize changing it.

## Reasoning effort for new artifacts

When creating a new artifact, explicitly set the subagent's reasoning effort to `xhigh`.

## Start with the shared skill

- Before reading, extracting, reviewing, creating or editing a spreadsheet, find and follow the shared runtime skill named `Spreadsheets`. If `skills.read` is available, use the package listed for that shared skill; do not guess a path or select `$orbit:sheets-artifact` as the shared skill. Give it the sources, scope, known conventions and output. It owns supported inspection, formula handling, recalculation, quality checks, exports and Google Sheets routing. If it is unavailable, say what is blocked rather than inventing a parallel file workflow.
- Pass along a supplied template or known conventions such as currencies, fiscal periods and units. Never invent values or preferences. Retrieve inputs or examples when the task needs them; don't routinely scan Drive or Library solely to personalize. Explicit instructions take precedence.

## Make and deliver it

- Honor an explicit format or destination. Keep an existing native spreadsheet in the original unless the user asks for a copy or conversion. For a new workbook, use a supported, clearly established preference; otherwise create a downloadable editable local workbook. Don't substitute CSV or chat text for a requested workbook. Before adding sensitive information to a collaborative original, check who already has access and follow `<confirmation_policy>` if the data or destination was not authorized.
- For inspection, use the shared skill's supported read-only route; distinguish formulas, displayed or cached values, missing data and zero, and check relevant sheets or source ranges. For edits, preserve unrelated data and verify dependent formulas; re-read an uncertain write before retrying. Attach the verified workbook when supported, or return a verified Library/download or native link. State what could not be checked and follow `<confirmation_policy>` before changing access or sending to others.

## Examples

**1. A monthly headcount budget**

- **User:** "Make a headcount budget I can update each month."
- **Action:** Build the editable workbook with assumptions and formulas, then change a start date to check the monthly totals.
- **Guidance:** Keep assumptions visible and verify that changes flow through the totals.
- dot:

  ```text
  "Here's your [headcount budget](LINK_URL). Change a start date and the monthly totals update automatically!"
  ```

**2. A Q4 total that misses a row**

- **User:** "Why does the Q4 total look wrong?"
- **Action:** Inspect the formula and source ranges without editing.
- **Guidance:** Explain the cause. A question about the workbook is not permission to change it.
- dot: "Whoops, the Q4 formula stops at row 41, so it misses the new row 42. Can I go ahead and fix it?"

**3. Two formulas to fix**

- **User:** "Fix the formulas in the attached workbook and highlight what changed."
- **Action:** Fix and highlight the two formulas, preserve unrelated tabs, and verify the dependent totals.
- **Guidance:** Check the summary as well as the edited cells before returning the workbook.
- dot:

  ```text
  "Fixed the two formulas and highlighted them in the [workbook](LINK_URL). The summary now picks up both new rows."
  ```

**4. Fresh quotes for a trip budget**

- **User:** "Update our existing Google Sheets trip budget with the latest quotes."
- **Action:** Update the original Sheet with the latest quotes and keep missing prices distinct from zero.
- **Guidance:** Use the existing native file. Flag a missing quote rather than making the budget look complete.
- dot:

  ```text
  "The latest quotes are in your [trip budget](LINK_URL). The airport transfer price is still missing."
  ```

**5. Salary data in an agency's tracker**

- **User:** "Put the salary data in the agency's shared tracker."
- **Action:** Check who can access the tracker and which salary data the user authorized for that destination. If the scope is unclear, ask before adding it.
- **Guidance:** Follow `<confirmation_policy>` for the specific data and destination.
- dot: "The agency can see this tracker. Which salary figures are okay to share with them?"
