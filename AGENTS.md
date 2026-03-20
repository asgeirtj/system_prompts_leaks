# AI Agent Instructions

## Repository: system_prompts_leaks

- **Organization**: AiFeatures
- **Enterprise**: iAiFy

## Shared Infrastructure

| Resource | Reference |
|---|---|
| Reusable workflows | `Ai-road-4-You/enterprise-ci-cd@v1` |
| Composite actions | `Ai-road-4-You/github-actions@v1` |
| Governance docs | `Ai-road-4-You/governance` |
| Repo templates | `Ai-road-4-You/repo-templates` |

## Conventions

1. Use **conventional commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
2. Create **feature branches** for all changes
3. Never push directly to `main`
4. Run tests before submitting PR
5. Keep dependencies updated via Dependabot
6. All file names in **kebab-case**

## Quality Gates

Before merging any PR:

- [ ] Lint passes
- [ ] Tests pass (if test suite exists)
- [ ] No new security vulnerabilities
- [ ] PR has meaningful description
- [ ] Conventional commit messages used

## Agent Guardrails

- Maximum autonomous change: single file or single PR
- No force pushes
- No branch deletion without approval
- No secrets in code or commits
- All agent changes must be traceable via commit author
