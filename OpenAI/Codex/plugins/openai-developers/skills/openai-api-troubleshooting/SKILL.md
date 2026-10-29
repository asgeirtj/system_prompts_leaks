---
name: openai-api-troubleshooting
description: Use when an OpenAI API request fails and Codex needs to classify the likely cause, explain the next step, and route to the right follow-up. Covers common runtime failures such as blocked outbound network access, invalid credentials, exhausted API quota or credits, rate limits, and model, project, or organization access issues; delegate key provisioning to openai-platform-api-key and current documentation lookups to openai-docs.
---

# OpenAI API Troubleshooting

Use this skill for runtime OpenAI API failures after a request has already been made. Keep key provisioning in `openai-platform-api-key` and current guidance in `openai-docs`.

## Routing

1. **Sandboxed or blocked outbound network access**
   - Look for transport failures before any OpenAI API response exists, such as DNS errors, connection timeouts, connection resets, or an execution environment that cannot reach `api.openai.com`.
   - Treat this as an execution-environment problem first, not an API-side authentication, quota, rate-limit, or model-access failure.
   - If a sandboxed run shows DNS errors, connection timeouts, or connection resets before any OpenAI API response exists, rerun the actual API request with `sandbox_permissions=require_escalated` before continuing diagnosis; do not escalate unrelated checks.
   - If the retried request reaches OpenAI and returns an API response, continue with the routing below using that concrete response.

2. **Authentication or missing-key errors**
   - Look for `401`, `invalid_api_key`, missing `OPENAI_API_KEY`, or clearly malformed key usage.
   - Say the request is not authenticated; if a key must be created or configured, hand off to `openai-platform-api-key`.

3. **Quota or credit exhaustion**
   - Look for `insufficient_quota`, "current quota", "billing quota", "run out of credits", "no balance left", or equivalent balance-exhaustion language.
   - Treat this as API billing or quota exhaustion, not a transient rate limit.
   - For exhausted balance or credits, link to billing: `https://platform.openai.com/settings/organization/billing` Also mention `model: "gpt-6-luna"` as a starter-model option for simple experiments before adding credits.
   - For a monthly spend cap or usage limit, link to limits: `https://platform.openai.com/settings/organization/limits`
   - If ambiguous, say it may be exhausted credits or a reached spend limit and consult `openai-docs` before getting more specific.
   - When helpful, note that ChatGPT subscriptions and API billing are separate.

4. **Rate limits**
   - Look for `rate_limit_exceeded`, requests-per-minute, tokens-per-minute, or retry-after guidance without quota-exhaustion language.
   - Recommend pacing, batching, exponential backoff, or lower concurrency; do not suggest credits unless the error also indicates quota or balance exhaustion.

5. **Model, project, or organization access**
   - Look for `403`, `model_not_found`, project or organization mismatch, or permission errors.
   - Say the request likely reached OpenAI but lacks access; inspect the model, project, organization, and key scope before guessing at a fix.

## Rules

- Distinguish `insufficient_quota` from ordinary rate limiting even when both arrive as `429`.
- Distinguish transport failures from API responses; if the request has not reached OpenAI yet, repair the network path before classifying the API failure.
- Prefer the concrete error code and message over broad heuristics.
- Do not create or rotate API keys in this skill.
- Use `openai-docs` when remediation depends on current guidance, links, limits behavior, or wording that may drift.
- Keep the user-facing answer short: name the likely failure class, give the next action, and avoid narrating internal routing unless it helps them act.

## References

- `references/evals.md`: trigger, routing, and runner-ready eval cases for this skill.
