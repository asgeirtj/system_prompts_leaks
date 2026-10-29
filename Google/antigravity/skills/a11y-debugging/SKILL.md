---
name: a11y-debugging
description: Uses Chrome DevTools MCP for accessibility (a11y) debugging and auditing based on web.dev guidelines. Use when testing semantic HTML, ARIA labels, focus states, keyboard navigation, tap targets, and color contrast.
---

## Core Concepts

**Page Targeting**: Page-scoped tools (`take_snapshot`, `list_console_messages`, `evaluate_script`, `press_key`, `take_screenshot`, `lighthouse_audit`, etc.) require a `pageId` parameter. Retrieve available page IDs using `list_pages` or from `new_page`.

**Accessibility Tree vs DOM**: Visually hiding an element (e.g., `CSS opacity: 0`) behaves differently for screen readers than `display: none` or `aria-hidden="true"`. The `take_snapshot` tool returns the accessibility tree of the page, which represents what assistive technologies "see", making it the most reliable source of truth for semantic structure.

**Reading web.dev documentation**: If you need to research specific accessibility guidelines (like `https://web.dev/articles/accessible-tap-targets`), you can append `.md.txt` to the URL (e.g., `https://web.dev/articles/accessible-tap-targets.md.txt`) to fetch the clean, raw markdown version. This is much easier to read!

## Workflow Patterns

### 1. Automated Audit (Lighthouse)

Start by running a Lighthouse accessibility audit to get a comprehensive baseline. This tool provides a high-level score and lists specific failing elements with remediation advice.

1.  Run the audit:
    - Set `mode` to `"navigation"` to refresh the page and capture load issues.
    - Set `outputDirPath` (e.g., `/tmp/lh-report`) to save the full JSON report.
2.  **Analyze the Summary**:
    - Check `scores` (0-1 scale). A score < 1 indicates violations.
    - Review `audits.failed` count.
3.  **Review the Report (CRITICAL)**:
    - **Parsing**: Do not read the entire file line-by-line. Use a CLI tool like `jq` or a Node.js one-liner to filter for failures:
      ```bash
      # Extract failing audits with their details
      node -e "const r=require('./report.json'); Object.values(r.audits).filter(a=>a.score!==null && a.score<1).forEach(a=>console.log(JSON.stringify({id:a.id, title:a.title, items:a.details?.items})))"
      ```
    - This efficiently extracts the `selector` and `snippet` of failing elements without loading the full report into context.

### 2. Browser Issues & Audits

Chrome automatically checks for common accessibility problems. Use `list_console_messages` to check for these native audits:

- `types`: `["issue"]`
- `includePreservedMessages`: `true` (to catch issues that occurred during page load)

This often reveals missing labels, invalid ARIA attributes, and other critical errors without manual investigation.

### 3. Semantics & Structure

The accessibility tree exposes the heading hierarchy and semantic landmarks.

1.  Navigate to the page.
2.  Use `take_snapshot` to capture the accessibility tree.
3.  **Check Heading Levels**: Ensure heading levels (`h1`, `h2`, `h3`, etc.) are logical and do not skip levels. The snapshot will include heading roles.
4.  **Content Reordering**: Verify that the DOM order (which drives the accessibility tree) matches the visual reading order. Use `take_screenshot` to inspect the visual layout and compare it against the snapshot structure to catch CSS floats or absolute positioning that jumbles the logical flow.

### 4. Labels, Forms & Text Alternatives

1.  Locate buttons, inputs, and images in the `take_snapshot` output.
2.  Ensure interactive elements have an accessible name (e.g., a button should not just say `""` if it only contains an icon).
3.  **Orphaned Inputs**: Verify that all form inputs have associated labels. Use `evaluate_script` with the **"Find Orphaned Form Inputs" snippet** found in [references/a11y-snippets.md](references/a11y-snippets.md).
4.  Check images for `alt` text.

### 5. Focus & Keyboard Navigation

Testing "keyboard traps" and proper focus management without visual feedback relies on tracking the focused element.

1.  Use the `press_key` tool with `"Tab"` or `"Shift+Tab"` to move focus.
2.  Use `take_snapshot` to capture the updated accessibility tree.
3.  Locate the element marked as focused in the snapshot to verify focus moved to the expected interactive element.
4.  If a modal opens, focus must move into the modal and "trap" within it until closed.

### 6. Tap Targets and Visuals

According to web.dev, tap targets should be at least 48x48 pixels with sufficient spacing. Since the accessibility tree doesn't show sizes, use `evaluate_script` with the **"Measure Tap Target Size" snippet** found in [references/a11y-snippets.md](references/a11y-snippets.md).

_Pass the element's `uid` from the snapshot as an argument to `evaluate_script`._

### 7. Color Contrast

To verify color contrast ratios, start by checking for native accessibility issues:

1.  Call `list_console_messages` with `types: ["issue"]`.
2.  Look for "Low Contrast" issues in the output.

If native audits do not report issues (which may happen in some headless environments) or if you need to check a specific element manually, use `evaluate_script` with the **"Check Color Contrast" snippet** found in [references/a11y-snippets.md](references/a11y-snippets.md).

### 8. Global Page Checks

Verify document-level accessibility settings often missed in component testing using the **"Global Page Checks" snippet** found in [references/a11y-snippets.md](references/a11y-snippets.md).

## Troubleshooting

If standard a11y queries fail or the `evaluate_script` snippets return unexpected results:

- **Visual Inspection**: If automated scripts cannot determine contrast (e.g., text over gradient images or complex backgrounds), use `take_screenshot` to capture the element. While models cannot measure exact contrast ratios from images, they can visually assess legibility and identify obvious issues.
