---
name: generative_ui
description: How to render rich interactive HTML widgets inline in the chat or as standalone artifacts. Use this skill when you want to show the user diagrams, data visualizations, interactive controls, educational walkthroughs, or any rich visual content beyond plain text and markdown.
---

# Generative UI

You can render custom, rich, interactive user interfaces (inline widgets or
larger artifacts) directly in the chat. This is a great way to communicate
complex information to the user, generate rich visualizations, and even create
small interactive experiences for the user.

## Workflow

1.  **Create the HTML Artifact**: Save a self-contained `.html` file (using
    Tailwind CSS and inline JavaScript) directly in the artifact directory using
    your native file-creation tool (not shell or Python scripts, which skip
    `ArtifactMetadata`), with `UserFacing: true` and `RequestFeedback: false` in  
    `ArtifactMetadata`.
2.  **Embed Inline (optional)**: Include the `<agent-embed>` tag in your chat
    response if the HTML artifact should render inline in the conversation:

    ```
    <agent-embed src="file:///<artifact_path>/widget.html"></agent-embed>
    ```

## Constraints & Theming

*   **External Assets & Tailwind CSS**: All external CDNs are blocked by CSP,
    except for one allowlisted gstatic Tailwind dependency that you **CAN** and
    **SHOULD** use to style your artifacts. Include the following script tag in
    your `<head>` to enable Tailwind:

    ```html
    <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
    ```

*   **Provided Container Defaults & Theme Variables**: The iframe container
    already sets `margin: 0`, `padding: 0`, a transparent background,
    `--foreground` text, and `14px` body typography, so you do not need to set a
    `font-family`. Semantic tokens are injected for surfaces (`--background`,
    `--content`, `--card`, `--sidebar`), borders (`--card-border`, `--border`),
    text (`--foreground`, `--muted-foreground`, `--placeholder`,
    `--code-foreground`), accents and status
    (`--primary`/`--primary-foreground`, `--secondary`/`--secondary-foreground`,
    `--accent`, `--link`, `--success`, `--warning`, `--error`), and chart series
    (`--chart-1` through `--chart-6`). Keep `12px` (`text-xs`) as the minimum
    text size unless the user asks otherwise.

*   **Text, Surface & `:root` Rules**: Use semantic variables
    (`bg-[var(--card)]`, `text-[var(--foreground)]`,
    `text-[var(--muted-foreground)]`) instead of hardcoded dark/light utility
    classes (e.g., `bg-slate-900`, `text-white`) for high contrast across both
    light and dark themes. Never declare local color fallbacks on `:root` or
    reference host-internal `var(--vscode-*)` or `var(--app-*)` tokens.

*   **HTML Boilerplate Template**: Recommended flush inline template:

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
    </head>
    <body class="bg-transparent text-[var(--foreground)] antialiased p-0 m-0">
      <div class="py-2 space-y-3">
        <div class="flex items-center justify-between gap-4 pb-2 border-b border-[var(--card-border)] text-xs">
          <label class="text-[var(--muted-foreground)] flex items-center gap-2">
            Concurrency
            <input id="workers" type="range" min="1" max="32" value="8" class="accent-[var(--primary)]" />
          </label>
          <span id="readout" class="font-mono tabular-nums text-[var(--foreground)]">8 workers</span>
        </div>
        <div id="chart" class="w-full"></div>
      </div>
    </body>
    </html>
    ```

*   **Canvas & Live Theme Sync**: For `<canvas>`, adapt colors for both light
    and dark themes via `document.documentElement.classList.contains('light')`
    or `getComputedStyle(document.documentElement)`, and redraw on
    `window.addEventListener('themechange', draw)` so live theme switches update
    canvas colors without resetting state.

## Deciding on Placement (Inline vs. Standalone)

Embed **inline** (`<= 450px` tall) whenever a compact interactive visualization
clarifies the answer better than static prose or Mermaid. Deliver as a  
**standalone** side-pane artifact (`> 450px` tall, no `<agent-embed>`,
referencing the artifact link in your response) when full-page space is needed,
such as multi-tab dashboards, wide tables, or full-screen explorers. Always
follow the user's explicit preference if stated.

## Designing Inline Widgets

*   **Flush Inline Layout (No Outer Card)**: Keep `<body class="bg-transparent
    ... p-0 m-0">` so the widget blends directly into the chat column. Separate
    sections with `border-[var(--card-border)]` dividers instead of wrapping the
    entire widget in an outer `bg-[var(--card)]` card box, and avoid duplicating
    the surrounding chat prose inside the widget.
*   **Standalone Artifacts**: For full-page side-pane artifacts (such as
    dashboards), use a solid page background (e.g., `bg-[var(--background)]`)
    and group panels inside `bg-[var(--card)] border border-[var(--border)]`
    cards.

## Sizing Inline Embeds

For inline embeds, it is important to think **small and compact**.

Inline embeds have an **800px** maximum height viewport (target under **450px**
so the widget fits comfortably in chat without scrolling). Past the cap, the
widget scrolls inside a box and the user sees only a fragment of what you built,
so don't build inlined widgets that are too tall.

*   **Do not set a `height` attribute on `<agent-embed>`.** It is ignored.
*   **Think compact**: Think carefully about designing something that is compact
    and fits nicely inline in the chat height budget.
*   **If the idea genuinely needs more room, make it a standalone artifact.** A
    scrolling inline widget is usually wrong: full-height in the side pane beats
    cropped in the chat.

After generating the artifact, consider whether it is sufficiently compact to be
useful inline and adjust if needed.

> [!IMPORTANT] Never size an inline widget relative to the viewport: no  
> `h-screen`, `min-h-screen`, `100vh`, or `height: 100%` on a top-level  
> container. The frame's viewport is derived from your content, so these feed  
> themselves and the widget collapses to a sliver. Use padding for breathing  
> room instead.
