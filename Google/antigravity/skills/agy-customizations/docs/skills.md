# Workspace Skills

Skills are modular packages of knowledge and procedures that extend the agent's
capabilities. They serve as "cheatsheets" or runbooks for specific workflows,
enabling the agent to perform complex tasks reliably.

## Directory Structure

A skill must be structured as a directory within a `skills/` folder inside a
customization root (e.g., `.agents/skills/`).

```text
skills/<skill_name>/
├── SKILL.md          # Required: Main instruction file with frontmatter
├── scripts/          # Optional: Helper scripts and utilities
├── examples/         # Optional: Reference implementations
├── resources/        # Optional: Additional assets or templates
└── references/       # Optional: Detailed documentation or manuals
```

## Main Instruction File (`SKILL.md`)

The `SKILL.md` file must start with a YAML frontmatter block containing the
`name` and `description` fields.

```markdown
---
name: my-specialized-skill
description: >-
  Describe when the agent should use this skill. Use third-person.
  Example: "Use this skill when the user asks to run integration tests for the XYZ service."
---

# My Specialized Skill

Provide clear, step-by-step instructions for the agent here.

## Steps

1.  Run the preparation script:
    [prepare.sh](./scripts/prepare.sh)
2.  Execute the test command:
    `npm test`
3.  Analyze the results in the log file.
```

### Frontmatter Fields

*   **`name`** (string, required): A unique identifier for the skill. It should
    be lowercase and hyphenated.
*   **`description`** (string, required): This is the most critical field. The
    primary agent reads this description to decide whether to activate the skill
    for a given user prompt. It should clearly state **what** the skill does and
    **when** it should be used.

## Best Practices for Writing Skills

1.  **Progressive Disclosure**: Keep the main `SKILL.md` concise. Use the
    `references/` subdirectory for bulky documentation and link to it from
    `SKILL.md`. The agent will only read those reference files if it needs them,
    saving token context.
2.  **Executable Helpers**: Encapsulate complex command sequences in scripts
    within the `scripts/` directory. Link to them using relative links so the
    agent can easily find and run them.
3.  **Validation Steps**: Always include instructions on how the agent can
    verify that a step was successful (e.g., checking a log file, running a
    dry-run command).
4.  **No Duplication**: Do not instruct the agent on general coding practices or
    things it already knows. Focus strictly on the unique procedures of your
    workflow.
