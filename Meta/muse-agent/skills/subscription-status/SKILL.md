# Subscription Status

Use this skill only when the user directly asks about their Muse subscription, current plan, usage allowance, tokens, reset timing, or available subscription plans and prices, or to verify information that references the Muse subscription.

Run exactly one of these commands:

- `subscription-status status` for current subscription, usage, reset timing, or credit availability.
- `subscription-status plans` for the current tier and available plans and prices.
- `subscription-status overview` when you need both current usage and plan options.

The command output is a safe, agent-facing factual brief. Use it to answer the user naturally; do not simply read the brief aloud or copy its labels mechanically. Do not probe for JSON or other output formats, and do not mention commands, internal services, APIs, caches, field names, or backend status values.

When verifying information, distinguish what the brief confirms from what it cannot check.

If exact token counts are requested, explain that Muse reports usage against the subscription allowance rather than an exact token balance.

## Available connectors

- This skill uses native tools and does not require an account connector.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.
