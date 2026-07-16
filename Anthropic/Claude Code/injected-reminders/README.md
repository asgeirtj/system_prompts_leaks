# Injected reminders

Model-facing prompts that Claude Code wraps in a `<system-reminder>` and injects into the
turn when a feature or mode fires — not registered as any command's prompt, and not invoked
by typing `/name`. This is the third prompt channel (alongside skills and slash-command
prompts); it's the one that's easy to miss, since these prompts have no command entry.

| File | Fires when |
|---|---|
| `teammate.md` | a session joins an agent team (team-coordination instructions) |
| `remote-plan.md` | a remote/cloud planning session is triggered |
| `plan-multiagent.md` | plan mode runs the multi-agent implementation-plan flow |
| `non-interactive.md` | the session runs in non-interactive / print mode |
| `container-restart.md` | the container restarted and background tasks were stopped |
| `model-switched.md` | the session model is changed (`/model`) |
| `brief-mode.md` | brief mode is enabled (output redirected through a tool) |

Captured verbatim from the Claude Code 2.1.211 binary. Runtime data slots use their real
semantic names (e.g. `${agentName}`, `${model}`, `${stoppedTasks}`).
