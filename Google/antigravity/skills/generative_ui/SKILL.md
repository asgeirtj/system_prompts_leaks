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

1.  **Create the HTML Artifact**: Use `write_to_file` to save a self-contained
    `.html` file (using Tailwind CSS and inline JavaScript) to the artifact
    directory. Set `UserFacing: true` in `ArtifactMetadata`.
2.  **Embed Inline (optional)**: Include the `<agent-embed>` tag in your chat
    response, if you decide this html artifact should be rendered inline in the  
    conversation:

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

*   **Use Provided Theme Variables**: The iframe injects the app's semantic
    design-system tokens, so widgets automatically match the host theme and the
    user's custom colors. Surfaces (`--background`, `--content`, `--card`,
    `--sidebar`), borders (`--border`), text (`--foreground`,
    `--muted-foreground`, `--placeholder`), and accents
    (`--primary`/`--primary-foreground`, `--secondary`/`--secondary-foreground`,
    `--accent`) are all available. Typography is applied for you on the document
    body — you do not need to set a font, and never use sub-12px micro-text
    (`text-[10px]`, `text-[11px]`, or CSS `font-size` below `12px`; keep
    `text-xs` / `12px` as the minimum floor unless the user asks).
*   **Text & Surface Colors**: Use semantic variables (`bg-[var(--card)]`,
    `text-[var(--foreground)]`, `text-[var(--muted-foreground)]`)
    instead of hardcoded dark/light utility classes (e.g., `bg-slate-900`,
    `text-white`) to ensure high contrast across both light and dark themes.
*   **Do Not Declare Local Fallbacks on `:root`**: Never define local color
    fallbacks on `:root` in a `<style>` block; the host environment manages
    theme variables dynamically.
*   **HTML Boilerplate Template**: Recommended base template:

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
    </head>
    <body class="bg-transparent text-[var(--foreground)] antialiased p-5">
      <div class="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-xl p-5 shadow-sm">
        <h2 class="text-[var(--foreground)] font-semibold text-lg">Title</h2>
        <p class="text-[var(--muted-foreground)] text-sm">Description</p>
        <!-- Interactive content goes here -->
      </div>
    </body>
    </html>
    ```

*   **General styling**: Aim for a clean, premium aesthetic. For `<canvas>`,
    check `document.documentElement.classList.contains('light')` to adapt
    colors.

## Deciding on Placement (Inline vs. Standalone)

**Default to artifact only** — reference the HTML artifact in your response and
let the user open it in the side pane. Consider inlining when the widget is
compact (comfortably under 500px tall) and directly illustrates the surrounding
explanation (e.g., a small educational widget, plot, or diagram). Larger, more
complex content (data dashboards, simulations, app prototypes) should stay
artifact-only. Always follow the user's explicit preference if stated.

## Designing Inline Widgets (Cards & Transparency)

When embedding inline in chat (`<agent-embed>`), style widgets as native chat  
components:

*   **Transparent Root Background**: Always set `<body class="bg-transparent  
    ...">` so the widget blends seamlessly into the chat container.
*   **Card-Based Layouts**: Wrap inline content and controls in a card container
    (as shown in the Boilerplate Template above) to provide elevation and
    prevent loose text in light mode.
*   **Standalone Artifacts**: For full-page side-pane artifacts (like
    dashboards), use a solid background (e.g., `bg-[var(--background)]`).

## Sizing Inline Embeds

For inline embeds, it is important to think **small and compact**.

Inline embeds only have a **500px** height viewport. Past that the widget
scrolls inside a small box and the user sees only a fragment of what you built,
so don't build inlined widgets that are too tall.

*   **Do not set a `height` attribute on `<agent-embed>`.** It is ignored.
*   **Think compact** Think carefully about designing something that is compact
    and fits nicely inline in the chat height budget.
*   **If the idea genuinely needs more room, make it a standalone artifact.** A
    scrolling inline widget is usually wrong — full-height in the side pane
    beats cropped in the chat.

After generating the artifact, consider whether it is sufficiently compact to be
useful inline and adjust if needed.

> [!IMPORTANT] Never size an inline widget relative to the viewport: no  
> `h-screen`, `min-h-screen`, `100vh`, or `height: 100%` on a top-level  
> container. The frame's viewport is derived from your content, so these feed  
> themselves and the widget collapses to a sliver. Use padding for breathing  
> room instead.
