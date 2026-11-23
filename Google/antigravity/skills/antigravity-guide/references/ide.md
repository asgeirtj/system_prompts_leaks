# Antigravity IDE Reference

Antigravity IDE is a standalone, AI-first integrated development environment
(built on VS Code) that integrates agentic workflows directly into your coding
environment.

> [!NOTE] Antigravity IDE coexists with **Antigravity 2.0**. While the IDE  
> provides an in-editor integrated experience, Antigravity 2.0 offers a parallel  
> desktop application. Both are fully supported and share the same underlying  
> agentic capabilities. See [references/app.md](references/app.md) for details  
> on Antigravity 2.0.

## 1. Core AI Modalities

Antigravity IDE offers three distinct ways to interact with AI, depending on the  
task:

### A. Passive: Antigravity Tab (Autocomplete)

A next-intent prediction experience routed to a single keystroke.

-   **Context-Aware Suggestions**: Proposes insertions, deletions, edits,
    imports, and cursor movements based on surrounding code, open tabs, terminal
    output, and clipboard (optional).
-   **Autocomplete & Supercomplete**: Autocomplete suggests code at the cursor.
    Supercomplete suggests larger diffs (including deletions) in floating
    windows.
-   **Tab to Jump**: Anticipates your next navigation point and lets you jump
    there by pressing `<kbd>tab</kbd>`.
-   **Tab to Import**: Automatically adds necessary imports at the top of the
    file when a new dependency is used.
-   **Controls**: Accept with `<kbd>tab</kbd>`, cancel with `<kbd>esc</kbd>`, or
    accept word-by-word with `<kbd>⌘</kbd>`+`<kbd>→</kbd>` (macOS) /
    `<kbd>Ctrl</kbd>`+`<kbd>→</kbd>` (Linux).

### B. Instructive: Inline Command (`<kbd>⌘</kbd>`+`<kbd>I</kbd>` / `<kbd>Ctrl</kbd>`+`<kbd>I</kbd>`)

An instructive inline modality for localized edits.

-   **Targeted Edits**: Highlight a block of code and press the shortcut to
    refactor, explain, or modify it. The AI will only edit the highlighted
    block.
-   **Code Generation**: Invoke without a selection to generate net-new code at
    the cursor.
-   **Localized Docs**: Highly effective for quickly adding comments,
    docstrings, or localized documentation.

### C. Collaborative: Sidebar Chat & Agent

The most powerful modality for complex, multi-step tasks.

-   **Sidebar Chat**: The primary panel to ask questions, plan features, or
    discuss code.
-   **Agent Mode**: Launches a collaborative, multi-step pair programmer that
    can read/write files, run terminal commands (e.g., build/test), search the
    web, and use MCP tools.
-   **Planning Mode**: Review and refine the agent's step-by-step plan before
    execution.

## 2. Editor UI Integrations

-   **Inline Code Lenses**: Action buttons appearing directly above code symbols
    (classes, functions) allowing you to trigger targeted agent commands (e.g.,
    "Refactor", "Write Tests", "Explain Code") on specific lines.
-   **Visual Diff Overlays**: Inline red/green diff indicators inside your
    editor canvas showing proposed edits, allowing you to review and
    accept/reject changes in-context.
-   **Diagnostic Auto-Fix**: Trigger the agent directly from inline compiler
    errors, lint warnings, or the Problems pane to automatically generate and
    apply fixes.

## 3. Workspace Integration

-   **Workspace-Scoped Customizations**: The IDE automatically discovers and
    respects configurations in the `<project-root>/.agents/` folder, loading
    project-specific rules, custom skills, and plugins.
