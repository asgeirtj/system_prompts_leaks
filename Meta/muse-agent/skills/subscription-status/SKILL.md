---
name: "subscription_status"
description: "Answer questions about the user's Muse subscription, plan, usage, tokens, reset timing, or available plans and prices, or verify information that references the Muse subscription."
metadata: { "includeInPrompt": true }
---

# Subscription Status

Use this skill only when the user directly asks about their Muse subscription, current plan, usage allowance, tokens, reset timing, or available subscription plans and prices, or to verify information that references the Muse subscription.

Run exactly one of these commands:

- `subscription-status status` for current subscription, usage, reset timing, or credit availability.
- `subscription-status plans` for the current tier and available plans and prices.
- `subscription-status overview` when you need both current usage and plan options.

The command output is a safe, agent-facing factual brief. Use it to answer the user naturally; do not simply read the brief aloud or copy its labels mechanically. Do not probe for JSON or other output formats, and do not mention commands, internal services, APIs, caches, field names, or backend status values.

When verifying information, distinguish what the brief confirms from what it cannot check.

If exact token counts are requested, explain that Muse reports usage against the subscription allowance rather than an exact token balance.
