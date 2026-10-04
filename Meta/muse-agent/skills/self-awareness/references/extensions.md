# Optional Self-Awareness Extensions

Load this file only when the user explicitly asks for recommendations or a richer artifact-like view of the agent's state.

## Connection recommendations
When the user asks what to connect next:
1. Compare currently connected capabilities with available skills.
2. Prioritize the top 3 highest-impact gaps for this user.
3. For each recommendation, include:
   - skill name
   - why it matters for this user
   - rough setup effort or caveat if obvious

Do not suggest extra connections unprompted.

## Optional dashboard
If the user explicitly wants a dashboard, inventory, or visual map of capabilities:
1. Gather the current state first from files and workspace outputs.
2. Keep the result grounded in observed data, not inferred availability.
3. Organize by the user's life domains or active projects.
4. Show current status clearly: active, available, or unknown.
5. Link only to items you actually found.

Treat the dashboard as optional output, not the default response mode.
