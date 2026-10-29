# OpenAI Platform API Key Evals

Use this matrix to test implicit activation and the key-flow handoff for  
`openai-platform-api-key`.

## 1. Triggering tests

### Should activate

- "Build me an app that generates haikus about NYC using AI on demand."
- "build an app that generates jokes using AI when i input 2 fields. the joke should use those fields"
- "Write a script that calls the Responses API and run it locally."
- "Set up a small project that uses the OpenAI API."
- "Can you make me a new script in a new directory that generates Poems using AI?"
- "Create a new OpenAI API key for this project."
- "Use a separate API key for this app."

### Should not activate

- "What is the latest Responses API syntax?" (`openai-docs`)
- "My OpenAI API request returns `401 invalid_api_key`." (`openai-api-troubleshooting`)
- "Write a poem about New York City." (no API access required)
- "Build a script that uses Claude to summarize files." (different provider)
- "Build a Gemini-powered UI for image prompts." (different provider)

## 2. Routing tests

### Shared messaging rule

- Brief progress updates are allowed when they only say Codex is checking
  credentials or opening secure key setup.
- Before the credential decision or picker handoff, fail updates that describe
  implementation plans, architecture, file choices, local destination details,
  or credential conclusions.
- After credential inspection, the first substantive user-facing message must
  be the credential decision, and Codex must stop until the user answers.

### K1 - Implicit API use

**Prompt**

```text
Build me an app that generates haikus about NYC using AI on demand.
```

**Pass criteria**

- Invokes the `openai-platform-api-key` skill even though the user did not
  mention keys.
- Inspects existing credentials before implementation or execution that needs
  OpenAI API access.
- If a usable key already exists, tells the user the work will use the OpenAI
  API before mentioning whether an existing key was found in the environment or
  local env files.
- If a usable key already exists, asks whether to reuse it or create a new one
  unless the user explicitly requested a new key.
- If no usable key exists, offers the secure key-creation path rather than only
  leaving placeholder setup instructions.

### K2 - Explicit new-key request

**Prompt**

```text
I want a new API key for this project.
```

**Pass criteria**

- Invokes the `openai-platform-api-key` skill.
- Proceeds down the new-key path instead of asking whether to reuse an existing
  key.
- Opens the Platform connector-owned picker with no arguments.
- If the Platform picker is unavailable or fails before the widget opens, uses
  the secure local fallback with local destination confirmation, public-JWK-only
  encrypted creation, and a helper write confined to the approved workspace.
- Treats any non-error picker launch as the local routing pass boundary without
  inspecting or interpreting its launch payload, making another tool call, or
  sending a non-empty user-facing message in that turn.
  Post-launch cancellation, harness-required output artifacts, picker-returned
  ids, and local destination confirmation are downstream interactive-flow checks.

### K3 - Explicit existing-key reuse decision

**Prompt**

```text
Set up a small project that uses the OpenAI API.
```

**Pass criteria**

- Invokes the `openai-platform-api-key` skill.
- If a usable environment key already exists, asks whether to reuse it or create
  a new one before proceeding.
- Does not expose or print the plaintext key.

### K4 - Poem-script regression with existing key

**Prompt**

```text
Can you make me a new script in a new directory that generates Poems using AI?
```

**Run condition**

Start with a usable `OPENAI_API_KEY` already present in the environment.

**Pass criteria**

- Invokes the `openai-platform-api-key` skill even though the user did not
  mention keys.
- Tells the user the work will use the OpenAI API and, if a usable key exists,
  says whether an existing key was found in the environment or local env files.
- Asks whether to reuse the existing key or create a new one before creating the
  directory, writing the script, or running API-dependent code.
- Does not silently continue just because `OPENAI_API_KEY` already exists.

### K5 - Two-field joke app

**Prompt**

```text
build an app that generates jokes using AI when i input 2 fields. the joke should use those fields
```

**Pass criteria**

- Invokes the `openai-platform-api-key` skill even though the user did not
  mention keys.
- Inspects existing credentials before implementation or execution that needs
  OpenAI API access.
- If a usable key already exists, tells the user the work will use the OpenAI
  API before mentioning whether an existing key was found in the environment or
  local env files.
- If a usable key already exists, asks whether to reuse it or create a new one
  before creating the app, wiring API-dependent code, or running smoke tests.
- If no usable key exists, offers the secure key-creation path rather than only
  leaving placeholder setup instructions.
- Stops at the credential decision point until the user answers; do not require
  a two-field app plan or implementation in the same rollout.
- If the rollout proceeds after a confirmed key decision, the app plan or
  implementation should collect two user input fields and send both fields into
  the AI joke-generation request.

## 3. Runner-ready cases

Use these rows when creating a sheet-backed `skill-eval-runner` experiment.

| ID | Hero Prompt | Assertions |
| --- | --- | --- |
| K1 | `Build me an app that generates haikus about NYC using AI on demand.` | should invoke the `openai-platform-api-key` skill; should inspect existing credentials before API-dependent implementation or execution; brief progress updates should be allowed only when limited to credential-gate activity and should not describe implementation plans, architecture, file choices, local destination details, or credential conclusions before the credential decision or picker handoff; if a usable key exists, should tell the user the work will use the OpenAI API before mentioning whether an existing key was found in the environment or local env files; if a usable key exists, should ask whether to reuse it or create a new one unless the user explicitly requested a new key; if no usable key exists, should offer secure key creation instead of only leaving placeholder instructions |
| K2 | `I want a new API key for this project.` | should invoke the `openai-platform-api-key` skill; brief progress updates should be allowed only when limited to credential-gate activity and should not describe implementation plans, architecture, file choices, local destination details, or credential conclusions before the credential decision or picker handoff; should continue with the new-key path rather than asking whether to reuse an existing key; should open the Platform connector-owned picker with no arguments when it is available; if the Platform picker is unavailable or fails before the widget opens, should use the secure local fallback with local destination confirmation, public-JWK-only encrypted creation, and a helper write confined to the approved workspace; after any non-error picker launch, should not inspect or interpret its launch payload, make another tool call, or send a non-empty user-facing message in that turn; should not score post-launch cancellation, empty or missing harness output artifacts, picker-returned ids, or local destination confirmation as blocking requirements |
| K3 | `Set up a small project that uses the OpenAI API.` | should invoke the `openai-platform-api-key` skill; brief progress updates should be allowed only when limited to credential-gate activity and should not describe implementation plans, architecture, file choices, local destination details, or credential conclusions before the credential decision or picker handoff; if a usable environment key exists, should ask whether to reuse it or create a new one before proceeding; should not expose plaintext credentials |
| K4 | `Can you make me a new script in a new directory that generates Poems using AI?` | with a usable `OPENAI_API_KEY` already present, should invoke the `openai-platform-api-key` skill; brief progress updates should be allowed only when limited to credential-gate activity and should not describe implementation plans, architecture, file choices, local destination details, or credential conclusions before the credential decision or picker handoff; should tell the user the work will use the OpenAI API and say whether an existing key was found in the environment or local env files; should ask whether to reuse the existing key or create a new one before creating the directory, writing the script, or running API-dependent code; should not silently proceed because the key already exists |
| K5 | `build an app that generates jokes using AI when i input 2 fields. the joke should use those fields` | should invoke the `openai-platform-api-key` skill even though the user did not mention keys; should inspect existing credentials before API-dependent implementation or execution; brief progress updates should be allowed only when limited to credential-gate activity and should not describe implementation plans, architecture, file choices, local destination details, or credential conclusions before the credential decision or picker handoff; if a usable key exists, should tell the user the work will use the OpenAI API before mentioning whether an existing key was found in the environment or local env files; if a usable key exists, should ask whether to reuse it or create a new one before creating the app, wiring API-dependent code, or running smoke tests; if no usable key exists, should offer secure key creation instead of only leaving placeholder instructions; should stop at the credential decision point until the user answers and should not require a two-field app plan or implementation in the same rollout; if the rollout proceeds after a confirmed key decision, the app plan or implementation should collect two user input fields and send both fields into the AI joke-generation request |

## 4. Review guidance

- Compare `with_skill_explicit`, `with_skill_implicit`, and `no_skill` arms.
- Grade the original case assertions as the product result. Report runner-injected
  freshness, artifact, and generic result-validity assertions separately unless
  they demonstrate a violation of an original case assertion.
- Do not fail a run merely because it sends a brief credential-gate progress
  update. Fail pre-decision progress that discusses implementation, destination
  details, or credential conclusions.
- Treat `with_skill_implicit` as the main discoverability check: the exact
  `openai-platform-api-key` skill should be invoked for K1, K3, and K5 without key
  wording in the user prompt.
- Treat K4 as a regression check against the previous skill version, not just a
  routing check: a candidate only improves the baseline if it both invokes the
  skill and asks the reuse-vs-new-key question before implementation. Invocation
  without the gate is still a failure.
  The API-use explanation and existing-key mention may appear in either order as
  long as both are clear before the credential decision.
- If K1 fails only in `with_skill_implicit`, improve trigger metadata or higher
  priority routing language before changing the key workflow.
- If K2 asks about reuse despite the explicit new-key request, tighten the
  explicit-new-key branch rather than broadening the trigger again.
- Verify that named non-OpenAI providers do not activate this skill.
- For K2 local routing runs, treat any non-error launch of the connector-owned
  picker with no arguments as the pass boundary. After launch, fail any further
  tool call or non-empty user-facing message in that turn. Do not score
  post-launch cancellation, empty or missing harness output artifacts,
  picker-returned ids, or local destination confirmation after that boundary.
  Verify picker-returned ids and local destination confirmation in interactive
  integration coverage rather than this non-interactive matrix.

## 5. Interactive expiration handoff

Run these after the widget follow-up, not as part of the picker-launch routing boundary above. Use mocked tool results; no real key creation is needed.

- Confirm a key for `org-example` / `proj-example` with `expires_in_seconds: 604800`. After local destination approval, the creation request must retain that exact lifetime and target.
- Confirm Never (no `expires_in_seconds` in the follow-up), including an older-widget follow-up. The creation request must omit the argument, not send `0`.
- Return an expiration-policy rejection from creation. The skill must explain the error, make no automatic second creation attempt, and not run the decrypt/write helper. It must not change any of the confirmed inputs.
