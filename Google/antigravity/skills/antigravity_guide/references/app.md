# Antigravity 2.0 Reference

Antigravity 2.0 is a desktop Electron application that can launch and monitor
agents on your machine. It provides a unified platform to orchestrate agent
activities independently of an IDE.

## 1. Unified Interface Surfaces

### Left-hand Sidebar

-   **New Conversation**: Start a new chat session with the agent.
-   **Projects**: Manage and switch between different workspaces or
    repositories.
-   **Scheduled Tasks**: Define, monitor, and run recurring background tasks
    (cron) and one-time delayed timers.
-   **Skills & Customizations**: View and manage active skills, rules, plugins,
    and MCP servers.
-   **Settings**: Configure application preferences, model selection, and
    permissions.

### Chat Canvas

The main panel for direct agent interaction, planning, and task execution.

-   **Slash Commands**: Type `/` to invoke built-in workflows. Slash commands
    trigger specialized agent behaviors or launch dedicated subagents. Each
    slash command has a description in the menu.
-   **@ Mentions**: Type `@` to open the mention menu and attach context
    directly to your message. Supported categories include files and folders,
    previous conversations, terminal sessions, rules, and MCP servers/tools.
-   **Media Uploads**: Drag-and-drop or paste images and files into the chat
    canvas to share them with the agent. Uploaded media is included as context
    for the current message.

## 2. Agent Settings & Permissions

The **Settings** sidebar provides global and project-level controls for agent
behavior, security, and permissions.

### Global Settings

These settings apply across all projects and conversations:

-   **Model Selection**: Choose the active Gemini model (e.g., Gemini Flash,
    Gemini Pro, Gemini Next).
-   **Tool Execution Policy**: Controls whether terminal commands require
    approval before running (`always-proceed`, `request-review`, `strict`,
    `proceed-in-sandbox`).
-   **Terminal Sandbox**: Run agent commands inside a restricted sandbox
    environment for added security.
-   **Non-Workspace File Access**: Controls whether the agent can read or write
    files outside the current workspace root (`allow`, `ask`, `deny`).
-   **Internet Access Policy**: Controls whether the agent can make network
    requests (`allow`, `ask`, `deny`).
-   **Permission Grants**: Define global allow/deny rules for specific files,
    commands, and URLs.
-   **Command Allowlist / Denylist**: Specify terminal commands that are always
    permitted or always blocked.
-   **Browser Allowlist**: Restrict which domains the agent's browser tools can
    navigate to.
-   **Artifact Review Mode**: Controls when the agent asks for artifact review
    (`always-proceed`, `agent-decides`, `asks-for-review`).
-   **Notifications**: Enable system notifications on task completion.
-   **Appearance**: Theme mode and conversation width.
-   **App Settings**: Keep computer awake, run in background, and auto-check
    for updates.

### Project-Level Settings

Each project can override a subset of global settings. Project-level settings
take priority over their global counterparts when a project is active:

-   **File Access Policy**: Override the non-workspace file access policy for
    this project.
-   **Internet Access Policy**: Override the internet access policy for this
    project.
-   **Sandbox Mode**: Enable or disable terminal sandboxing per project.
-   **Auto-Execution Policy**: Override the tool execution policy for this
    project.
-   **Artifact Review Mode**: Override artifact review behavior per project.
-   **Permission Grants**: Define project-scoped permission grants that apply
    only within the project's workspace.

## 3. Further Reading

For all other questions, search the live documentation at  
`https://antigravity.google/docs`.
