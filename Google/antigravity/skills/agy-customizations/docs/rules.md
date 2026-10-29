# Workspace Rules

Rules are guidelines and constraints that the agent must follow when operating
within specific directories. They are useful for enforcing coding styles, API
usage restrictions, or safety protocols.

## Rule Locations

The system automatically discovers and applies rules from the following  
locations:

*   **Directory-Based Rules (`GEMINI.md` / `AGENTS.md`)**: Placed directly in
    any directory. The system walks up from the current working directory to the
    repository root and loads these files. They apply to the directory they
    reside in and all its subdirectories.

## Rule Format

Rules are written in Markdown. Standalone `GEMINI.md` / `AGENTS.md` files do not
support frontmatter and are always active for their directory scope.

## Rule Merging and Deduplication

*   Rules are automatically deduplicated. Even if a rule is discovered via
    multiple paths (e.g., inherited from parent directories), it is only applied
    once per conversation.
*   If a rule is defined in a plugin, it is loaded when the plugin is enabled.

## Size Limits and Context Budget

*   **Per-File Limit (`24 KB` / `24,000` bytes)**: Each rule file is capped at
    24,000 bytes (after expanding `@[label](path)` includes) and truncated on
    line boundaries when over the cap.
*   **Aggregate Rules Budget (`20,000` tokens)**: Always-on and global rules
    share a dedicated 20,000-token rules budget (`defaultRulesBudget`),
    separate from the customization budget for skills, workflows, subagents,
    and MCP tools. Over-budget rules are demoted from full inline text to file
    path pointers so the agent can read them on demand. Rules shipped by
    builtin plugins are exempt from this budget and are always inlined in
    full.
