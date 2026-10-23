---
name: web-gui-tester
description: Use the browser automation tooling available in the session to test web frontends interactively in a purely GUI-based, black-box manner: simulate real user clicks, text input, scrolling, and other actions; use screenshots for visual verification and read-only DOM inspection for cross-validation; and produce a final test report. Suitable for verifying whether web functionality works correctly, reproducing frontend bugs, checking interaction feedback and layout styling, or conducting exploratory testing of a page. Use this skill when the user asks to test a webpage/frontend feature, verify UI behavior, reproduce a page bug, or provides only a URL and asks you to "test it."
---

## Core Principles

1. **Pure GUI black-box testing**: Interact only with elements that are visible and operable on the page, simulating real user behavior. During verification, screenshots and/or read-only DOM inspection are allowed, but injecting JavaScript to modify page state, trigger interactions, or bypass frontend logic is strictly prohibited.
2. **Faithful to the actual page**: All conclusions must be based on the page's actual behavior. Do not guess or speculate. If a normal GUI operation fails, stop and report it; do not use alternative methods to force progress.
3. **Separate testing from fixing**: Do not modify the code under test during testing. If a bug blocks the current path, record the issue, skip that path, and continue testing other unaffected points. Only begin fixing bugs after testing is explicitly declared complete and the user has explicitly or implicitly requested code changes.
4. **Cross-validate code and visuals**: Observations must include both read-only code verification (DOM state checks) and visual verification using screenshots. The two must corroborate each other and cannot replace one another. A test point without at least one visually inspected screenshot as evidence—an image returned directly by the tool, or a screenshot file read using the Read tool—must be considered incomplete. Do not conclude that a test point passed or failed without such evidence.
5. **Follow the browser tooling's own usage rules**: Run the test with whatever browser automation tooling the session actually provides (a browser automation MCP tool, a built-in browser runtime, etc.). If that tooling ships its own usage skill or API documentation, complete its required initialization and read that documentation first, and obey its rules for actions, element location, waiting, and observation throughout the test. This skill defines the testing methodology only; when it conflicts with the tooling's own rules, the tooling's rules win.

---

## Phase One: Scenario Assessment and Test Planning

Choose the appropriate strategy based on the completeness of the information provided by the user.

### Complete information: Explicit steps and expected results provided

→ Skip planning and proceed directly to the subsequent phases.

### Partial information: A feature description, bug description, or requirements document is provided

→ Perform lightweight planning:

1. Clarify the test objective: what functionality should be verified or what bug should be reproduced.
2. Define the acceptance criteria: what constitutes a pass.
3. Execute directly without requesting confirmation.

### Insufficient information: Only a URL or "please test it" is provided

→ Perform complete planning:

1. **Explore the page**: Open the page, take a screenshot to obtain an overview, and identify the page type, such as a form page, list page, detail page, or dashboard.
2. **Identify functionality**: List the page's core interactive elements and functional areas.
3. **Create a test plan**: Organize test points by priority:
   - **P0 Main flow**: The normal path for the page's core functionality, such as submitting a form, completing a search, or switching tabs.
   - **P1 Interaction feedback**: Whether feedback after an action works correctly, including loading states, success/failure messages, disabled states, and navigation.
   - **P2 Input boundaries**: Empty input, excessively long input, special characters, duplicate submissions, and similar cases.
   - **P3 Layout and styling**: Element overlap, text overflow, alignment consistency, visual quality, and similar issues.
4. **Present the plan and begin immediately**: Show the test plan to the user, then start with P0 without waiting for confirmation. The user may interrupt or adjust the plan at any time. Exception: If the page requires login credentials or testing involves writing real data, such as placing an order, making a payment, or deleting data, stop and ask the user for confirmation before continuing.

---

## Phase Two: Test Environment Preparation, When Needed

Before formal testing begins, any necessary method may be used to prepare the test environment. The black-box testing restrictions do not apply during this phase.

### Permitted operations

- Start or restart development servers and dependent services.
- Modify configuration files and prepare test files.
- Initialize or populate test database data and create test accounts.
- Preconfigure login or initial state using whatever mechanisms the browser tooling supports (such as injecting cookies/storage). If the tooling provides no injection capability, log in through the GUI with a test account instead, use backend/CLI means (seeding session data, generating a legitimate entry link), or reuse an already-logged-in user tab according to the tooling's rules.
- Perform any other preparation necessary to make the functionality under test reachable.

### Constraints

1. **Clearly separate preparation from testing**: Once environment preparation is complete, explicitly state: "Environment preparation is complete; formal testing is beginning." After that, all black-box testing constraints take effect immediately, and no further injection with side effects may be performed.
2. **Do not use setup as a substitute for the behavior under test**: Setup may only make the feature reachable. It must not pre-trigger or complete the functionality being tested. For example, when testing an order placement flow, do not insert an order directly into the database during setup.
3. **Do not return to setup to bypass failures during testing**: If an environment issue is discovered during formal testing, first declare the current test point invalid, return to this phase to prepare the environment again, and then restart the affected test point from the beginning. Report this honestly in the final results.
4. **Record all setup operations**: Explain all environment preparation actions in the final report so the user can distinguish between preconfigured states and states produced by the test itself.

---

## Phase Three: Test Execution: Action → Observation → Action loop/cycle

### Permitted tools

- The navigation, element location, interaction (click, type, scroll, key presses, etc.), and observation (DOM reads, screenshots) capabilities provided by the browser tooling.
- Unless necessary, do not read the project source code. Avoid relying excessively on code analysis to complete testing.

### Actions: Simulate real user behavior

- Locate elements based on actual observations of the page (DOM snapshots, accessibility trees, screenshots, or whatever ground truth the tooling provides). Never guess selectors, label text, or URL patterns.
- In a multi-tab environment, list the current tabs and confirm the target before each batch of operations. Do not assume the target page from memory or by position.
- **Prohibited**:
  - Any JavaScript injection with side effects: assignments, dispatching events, triggering clicks from code, modifying the DOM or storage, issuing requests, and similar operations are all prohibited (only side-effect-free reads are allowed).
  - Bypassing page interactions by constructing or modifying URLs.
  - Using Tab, keyboard shortcuts, `force click`, or other unconventional methods to bypass a failed operation.
  - Refreshing the page, navigating backward or forward, or resizing the window to escape the current failed state. However, after one test point is complete, the state may be reset by returning to the entry page before beginning the next test point.
- **When element location fails**: Do not retry unchanged. First re-observe the page (take a fresh DOM snapshot, plus a screenshot when needed) to confirm the actual state, then determine whether this is a page bug, where the element is genuinely missing, or a locator issue. If it is a page bug, record it and skip the test point. If it is a locator issue, rebuild the locator from the newly observed facts.
- **When page loading fails**: If the page times out, displays a blank screen, or shows an error, take a screenshot to record the current state, report it as an issue, and skip subsequent test points that depend on that page.
- **When the tooling does not support an operation** (such as file upload or a specific gesture): Record that test point as "unsupported by the runtime" and skip it. Never fake success, and never work around it via injection.
- **Responsive / multi-size testing**: Only when a test point explicitly requires it, adjust the viewport/window size using the capability the tooling provides, and restore it afterward. Never use it to escape a failure.

### Observations: Cross-validate code and visuals

For every new page state—initial load and every state after an interaction—perform both code verification and visual verification. Neither may be omitted. (The nature of this skill is visual page testing; if the tooling's documentation limits screenshot frequency by default, proceed under its "the user asked for visual testing" branch.)

#### Code verification, read-only

- Prefer the structured page-reading capabilities the tooling provides (DOM snapshots / accessibility trees, element text and attributes, element state queries, and similar).
- Read-only JavaScript evaluation is a last resort (for example, reading element geometry to help judge occlusion). If the tooling or engine rejects it, do not retry with different wording; switch to structured reads or screenshot-based judgment.

#### Visual verification

- Obtain and **view** screenshots in the way the tooling prescribes: an image returned directly by the tool counts as viewed; a screenshot saved to a file must be read with the session's file/image reading tool before visual verification counts as complete. Capturing without viewing is not observation.
- When ZCode persists an explicit Browser screenshot, the tool result includes an adjacent text block in the exact form `Browser screenshot saved to: <absolute path>`. Treat that returned path as the source artifact; do not assume the browser API can save to an arbitrary caller-provided path.
- **Also preserve evidence**: Unless the user specifies a directory, create a dedicated folder in the working directory (such as `gui-test-screenshots/`). When the browser tooling returns a real artifact path, copy that file with the session's available filesystem tool and use names that include the test point number (such as `t1_before.png`). If the tooling returns only an image and no artifact path, do not invent one: use the viewed image as evidence and state that no persistent path was exposed.
- Layout and occlusion issues may be assessed with the help of DOM geometry information, but dimensions such as rendering quality and visual aesthetics can only be judged from screenshots. In either case, a screenshot must ultimately confirm the visual result — **code verification must never replace screenshots**.

#### Observation timing

Perform both types of verification:

- At the beginning of each test point, recording the initial state.
- After every interaction, including clicks, text input, navigation, keyboard input, and mouse input.
- After every change in page state, including navigation, dialogs, notifications, list refreshes, echoed input, button enable/disable states, and similar changes.
- At the end of each test point, recording the final state.
- Whenever the page contains elements such as canvas, SVG, charts, images, or videos whose content cannot be fully read through DOM text.
- Whenever an issue is discovered, preserving evidence and accumulating visual material for the final report.

#### Observation dimensions

| Dimension | Points of attention |
|---|---|
| Element presence | Whether key UI elements exist and are visible |
| Content correctness | Whether text, numbers, and other content meet expectations |
| State changes | Whether the URL, element appearance/disappearance, and text updates match expectations after an action |
| Layout and occlusion | Unexpected overlap, obstruction, truncation, or misalignment. Distinguish legitimate overlays or sticky navigation from actual rendering defects |
| Rendering and design | Long-text overflow, abnormal wrapping, design consistency, and similar issues |
| Visual quality | Contrast, colors, typography, spacing, and alignment |

### Screenshot requirements for transient states

Toast messages, tooltips, loading indicators, animations, and other short-lived states may disappear before a screenshot is taken. To capture such states, complete the following steps consecutively within the **same tool call / same script**:

1. Take a "before" screenshot recording the pre-action state.
2. Perform the GUI action.
3. Wait for the target state to appear. Prefer waiting for a specific element or state condition over a fixed delay; use a fixed delay only as a fallback when the target cannot be described, such as a purely visual animation.
4. Take an "after" screenshot capturing the transient feedback.

Then view both screenshots as required under "Visual verification" above. For ordinary static pages and stable content, this same-call before-and-after pattern is unnecessary; a regular single screenshot is sufficient. However, the screenshot must still be taken and its image content must still be inspected.

### Collecting page error evidence

If the browser tooling supports read-only console listening or log reading, register it at the start of testing (read-only, so it does not violate the black-box principle), collect error-level logs and uncaught page exceptions throughout, and list them separately in the final report with the operation step at which each occurred. If the tooling provides no such capability, do not work around it by injecting listeners via JavaScript. Instead, use **visible error manifestations on the page** as evidence—error message text, blank screens or empty regions, failed-resource placeholders, broken layout, and so on—capture screenshots, note the corresponding steps, and state honestly in the report that console information could not be collected.

---

## Phase Four: Output Test Conclusions

After testing is complete, summarize the results based on every recorded observation:

- Which test points passed.
- Which test points failed, including reproduction steps and screenshots.
- Which test points could not be executed because they were blocked.
- Console errors collected during testing, or observed page error manifestations.

Every test point—whether passed or failed—must reference its corresponding viewed screenshot. When the tooling exposes an artifact path, reference the actual absolute path (or its `file://` URI); otherwise use the returned image evidence and state that no persistent path was exposed.

### Output format
- If the user's prompt specifies requirements for the report format, such as outputting to a designated file, a particular format, or a specific language, follow those requirements strictly when producing the output or generating the file.
- If the user does not explicitly specify another format, output an interleaved Markdown report with text and images directly by default, referencing images with standard Markdown image syntax, such as `![screenshot description](https://example.com/screenshot.png)`, where the image address should be an accessible absolute URL. When a local artifact exists, use its actual absolute path or `file:///` URI, such as `![login screenshot](file:///C:/Users/test/screenshots/login.png)`. Do not invent paths, output plain file paths only, or gather all screenshots at the end of the report.
