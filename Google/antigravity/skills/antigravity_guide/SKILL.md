---
name: antigravity-guide
description: Provides a comprehensive guide, quick reference, and sitemap for Google Antigravity (AGY), including the Antigravity CLI (agy), Antigravity 2.0, Antigravity IDE, Python SDK, slash commands, keybindings, and customizations (skills, rules, MCP, sidecars). Activate this skill when the user asks questions about how to use, configure, or customize Antigravity, AGY, the agy CLI, the Antigravity IDE, or Antigravity 2.0.
---

# Google Antigravity (AGY) Guide & Sitemap

Google Antigravity is an AI-first development platform. Depending on which
surface the user is asking about, you **MUST** read the corresponding
subdocumentation in the `references/` directory of this skill:

## 1. Surfaces Sitemap (Offline Subdocs)

-   **Antigravity CLI (`agy`)**: [references/cli.md](references/cli.md)
    -   Pointers to the authoritative public CLI docs for slash commands,  
        features, settings, and best practices.
-   **Antigravity IDE**: [references/ide.md](references/ide.md)
    -   Covers the standalone AI-first IDE, sidebar chat panels, and inline code  
        lenses.
-   **Antigravity 2.0**: [references/app.md](references/app.md)
    -   Covers the parallel desktop application, left-hand sidebar, chat canvas,  
        and the HTML Auxiliary Pane (Subagents, Background Tasks, Artifacts,  
        Files Changed, Terminals).
-   **Antigravity SDK**: [references/sdk.md](references/sdk.md)
    -   Covers the public Python SDK  
        (https://github.com/google-antigravity/antigravity-sdk-python) for  
        programmatic agent leasing, orchestration APIs, and custom tool  
        exposing.

--------------------------------------------------------------------------------

## 2. Smart Hybrid Retrieval: When to Fetch Live Docs

The offline subdocs provide excellent quick references. However, if the user
asks for the latest updates, advanced Vertex AI integrations, or complex setups
not covered here, you **MUST** dynamically fetch the live page from the official  
sitemap:

<!-- LINT.IfChange(sitemap) -->

-   **Main Documentation Home**: `https://antigravity.google/docs`
-   **Skills**: `https://antigravity.google/docs/skills`
-   **Rules**: `https://antigravity.google/docs/rules-workflows`
-   **Hooks**: `https://antigravity.google/docs/hooks`
-   **Plugins**: `https://antigravity.google/docs/plugins`
-   **Sidecars**: `https://antigravity.google/docs/sidecars`
-   **Model Context Protocol (MCP)**: `https://antigravity.google/docs/mcp`
-   **Browser Automation & Testing**:  
    `https://antigravity.google/docs/ide/browser`
-   **Agent Permissions & Security**:  
    `https://antigravity.google/docs/permissions`
-   **Terminal Sandbox**: `https://antigravity.google/docs/sandbox`
-   **Changelog & Release Notes**: `https://antigravity.google/changelog`
-   **Troubleshooting & Support**: `https://antigravity.google/support`  
    <!-- LINT.ThenChange(//depot/google3/third_party/gemini_coder/agent_ui_toolkit/dev/appVariant/externalAppVariant.ts:custom_links) -->
