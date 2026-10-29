# OpenAI API Troubleshooting Evals

Use this matrix to test both implicit activation and correct failure routing for `openai-api-troubleshooting`.

## 1. Triggering tests

### Should activate

- "My OpenAI API request fails with `ENOTFOUND api.openai.com` from inside a Codex sandbox before any HTTP response comes back. What should I do?"
- "The OpenAI API call times out only inside the execution environment, before I receive an OpenAI response."
- "I get `401 invalid_api_key` when I call the OpenAI API."
- "My request returns `429 insufficient_quota`."
- "My request returns `429 rate_limit_exceeded`."
- "The API returns `403 model_not_found` for the model I configured."

### Should not activate

- "Create an OpenAI API key for this project." (`openai-platform-api-key`)
- "What is the latest Responses API syntax?" (`openai-docs`)
- "Explain the difference between DNS and TCP timeouts." (general networking)

## 2. Routing tests

### T1 - Sandboxed outbound network failure

**Prompt**

```text
I am testing an app that calls the OpenAI API. Inside Codex, the request fails
before any HTTP response with a DNS error while reaching api.openai.com. What
should I do?
```

**Pass criteria**

- Identifies that no OpenAI API response exists yet.
- Classifies the problem as blocked outbound networking or an execution environment issue before any API-side diagnosis.
- Recommends retrying the actual API request with escalated network access when sandboxing is the blocker.
- Does not diagnose invalid credentials, quota exhaustion, rate limiting, or model access before the request reaches OpenAI.

### T2 - Sandboxed outbound network failure during task execution

Use this case for interactive verification of the escalation path. Run it in an interactive Codex session with `-a on-request` and sandboxed execution so the agent can experience the transport failure, request escalation, and rerun the same API request outside the sandbox. A noninteractive `codex exec` run can smoke-check the first half of the flow, but it does not fully validate T2.

**Prompt**

```text
Create a temporary script that attempts one OpenAI API request, run it, and
diagnose the failure. If the request fails before any OpenAI API response with a
DNS error, timeout, or connection reset from a sandboxed run, continue until you
have taken the correct next diagnostic action.
```

**Pass criteria**

- Runs an actual API-request command first without escalating unrelated setup or inspection commands.
- If that command fails before any OpenAI API response with a DNS error, timeout, or connection reset from a sandboxed run, reruns the actual API request with `sandbox_permissions=require_escalated`.
- Does not stop after merely explaining that network access might be blocked.
- After the retried request returns an OpenAI API response, routes based on that concrete response instead of continuing to classify it as a transport failure.

### T3 - Authentication failure

**Prompt**

```text
My OpenAI API request returns 401 invalid_api_key. What should I check next?
```

**Pass criteria**

- Classifies the issue as authentication or missing-key related.
- Points to key configuration or the `openai-platform-api-key` path when a key must be created or configured.
- Does not recommend escalated network access as the primary fix.

### T4 - Quota exhaustion

**Prompt**

```text
My API call returns 429 insufficient_quota and says I have run out of credits.
What does that mean?
```

**Pass criteria**

- Treats the issue as quota or credit exhaustion rather than ordinary rate limiting.
- Mentions the relevant billing or limits follow-up path.
- Does not recommend pacing, batching, or exponential backoff as the main fix.

### T5 - Ordinary rate limiting

**Prompt**

```text
My API call returns 429 rate_limit_exceeded for requests per minute. What should
I do?
```

**Pass criteria**

- Treats the issue as rate limiting rather than exhausted credits.
- Recommends pacing, batching, exponential backoff, or lower concurrency.
- Does not suggest adding credits unless the prompt also indicates quota or balance exhaustion.

### T6 - Model or project access

**Prompt**

```text
My request reaches OpenAI but returns 403 model_not_found for the model in my
config. What should I inspect?
```

**Pass criteria**

- States that the request likely reached OpenAI but lacks access.
- Recommends inspecting model, project, organization, or key scope.
- Does not misclassify the problem as transport failure.

## 3. Runner-ready cases

Use these rows when creating a sheet-backed `skill-eval-runner` experiment.

| ID | Hero Prompt | Assertions |
| --- | --- | --- |
| T1 | `I am testing an app that calls the OpenAI API. Inside Codex, the request fails before any HTTP response with a DNS error while reaching api.openai.com. What should I do?` | should invoke the `openai-api-troubleshooting` skill; should identify a transport or execution-environment failure before any OpenAI API response; should recommend retrying the actual API request with escalated network access when sandboxing is the blocker; should not classify the issue as invalid credentials, quota exhaustion, rate limiting, or model access |
| T3 | `My OpenAI API request returns 401 invalid_api_key. What should I check next?` | should invoke the `openai-api-troubleshooting` skill; should classify the issue as authentication or missing-key related; should route key provisioning or configuration to `openai-platform-api-key`; should not recommend escalated network access as the primary fix |
| T4 | `My API call returns 429 insufficient_quota and says I have run out of credits. What does that mean?` | should invoke the `openai-api-troubleshooting` skill; should distinguish insufficient quota from ordinary rate limiting; should recommend the billing or limits path; should not present pacing or backoff as the main fix |
| T5 | `My API call returns 429 rate_limit_exceeded for requests per minute. What should I do?` | should invoke the `openai-api-troubleshooting` skill; should distinguish ordinary rate limiting from quota exhaustion; should recommend pacing, batching, backoff, or lower concurrency; should not suggest credits unless quota exhaustion is also indicated |
| T6 | `My request reaches OpenAI but returns 403 model_not_found for the model in my config. What should I inspect?` | should invoke the `openai-api-troubleshooting` skill; should identify model, project, organization, or key-scope access as the likely class; should not misclassify the issue as transport failure |

## 4. Manual verification

Use T2 outside `skill-eval-runner`; the runner launches child rollouts without a sandbox boundary, so it is not the right harness for proving the escalation handshake itself.

For a full T2 pass, run the prompt in an interactive Codex session with `-a on-request` and sandboxed execution, then verify this sequence in the trace:

1. The agent runs an actual API request inside the sandbox.
2. The request fails before any OpenAI API response with a transport symptom such as DNS failure, timeout, or connection reset.
3. The agent reruns the same API request with `sandbox_permissions=require_escalated`.
4. The retried request reaches OpenAI, and the agent routes from that concrete API response.

A noninteractive `codex exec` run may still be useful as a smoke check for the first two steps, but do not count it as a full T2 pass if it only explains that escalation would be required.

## 5. Review guidance

- Compare `with_skill_explicit`, `with_skill_implicit`, and `no_skill` arms.
- Treat `with_skill_implicit` as a discoverability test: the exact `openai-api-troubleshooting` skill should be invoked naturally.
- If T1 fails only in `with_skill_implicit`, improve discoverability or trigger language before changing routing guidance.
- If T1 fails in both skill arms, strengthen the transport-failure instructions.
- If T2 stops after explanation instead of rerunning the failed API request, tighten the executable escalation guidance before changing the conceptual routing language.
- If T4 and T5 blur together, tighten the distinction between `insufficient_quota` and ordinary rate limiting.
