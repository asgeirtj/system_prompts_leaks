---
name: openai-platform-api-key
description: 'Use when Codex is asked to build, run, test, debug, or configure an OpenAI-backed or provider-unspecified AI app, UI, script, CLI, generator, or tool, especially requests phrased only as "using AI" or generators driven by forms/user input; also use for OPENAI_API_KEY or sk-proj setup. Treat this as the credential gate: inspect safely, ask reuse-vs-new before API work, and never expose plaintext.'
---

# OpenAI API Key

Use this skill only in Codex local/app sessions. Create keys through the secure OpenAI Platform connector, keep plaintext out of normal tool output, and write secrets only to a confirmed local destination.

## When To Use

Use this skill as the credential gate for API-backed work, not as the app, docs, or frontend implementation skill.

Use it when:

- The user asks for an OpenAI API key, `OPENAI_API_KEY`, or an `sk-proj` key.
- Codex will build, implement, run, test, debug, or configure an app, script, CLI, generator, UI, or tool that calls the OpenAI API, even before a live request and even if a usable key already exists.
- The user asks Codex to build, implement, run, or configure an app, script, CLI, generator, or tool that uses AI to produce outputs from user input.
- The user asks for an AI-powered app or UI that generates output from one or more input fields, forms, prompts, files, or other user-provided values.
- The user says "using AI" in an app/script/build request and does not name a different provider.

Do not use it when:

- The user only wants documentation, citations, model or API guidance, conceptual explanation, or code examples without asking Codex to build, run, configure, or debug an API-backed artifact.
- The user asks for a static frontend, visual mockup, design concept, or placeholder UI with no API-backed behavior.
- The user only asks Codex to write a one-off output directly and no app, script, generator, or API-backed tool is being built or run.
- The user names a different AI provider for the artifact.

If API access is needed and no usable key is found, offer secure key provisioning instead of leaving only placeholder docs or manual setup steps.

## Coordination With Implementation Skills

When another implementation skill also applies, run this skill first only to inspect credentials safely and send the credential decision message. Until reuse-existing-key vs create-new-key is resolved, it outranks design-first and implementation-first flows, including `build-web-apps:frontend-app-builder`; do not design UI, choose architecture, inspect API examples, write code, or run smoke tests. After the user answers, hand off to the appropriate implementation, docs, or frontend skill.

## Safety Rules

- Never request, print, summarize, quote, or paste a plaintext API key.
- Never inspect credentials with commands that can print secret values, such as `cat .env*`, `grep OPENAI_API_KEY .env*`, or `rg OPENAI_API_KEY .env*`. Use silent exit-status checks or redacted summaries only.
- Use the Platform connector `open_codex_api_key_setup` tool when it is available. Do not send local workspace paths, env-file paths, or target arrays to the picker.
- Do not use the ChatGPT-only browser/widget `_start_api_key_setup` flow from Codex.
- Only pass public JWK material (`kty`, `n`, `e`) to the connector.
- Before creating a key or writing any secret, obtain explicit confirmation. Prefer the hosted Platform picker plus local destination confirmation when it is available; if it is unavailable, fall back to a typed local destination question, then wait.
- Prefer ignored or untracked env files. In git repos, avoid tracked targets unless the user explicitly confirms that choice.
- The local helper may handle plaintext in memory and write it to the confirmed file. Its stdout/stderr must not include the key.
- When decrypting in a repo, pass the repo root as `--workspace`; the helper refuses symlink targets and targets outside that workspace.
- Keep user-facing messages concise. Unless the user asks or a failure requires it, say only that Codex will create the key securely and write it to the confirmed env file.
- Do not narrate deterministic mechanics such as helper discovery, encryption, decryption, RSA, JWKs, ciphertext, temporary files, cleanup, permissions checks, or redacted verification unless an error requires user action.
- Report only safe metadata: path, env var name, key name, org/project names, and whether an existing env var was updated.

## Mandatory First Step

Before editing, testing, running, debugging, or configuring any code that calls the OpenAI API:

1. Inspect for a usable `OPENAI_API_KEY` without printing it.
2. Unless the user explicitly asked for a new key, ask whether to reuse an existing key or create a new one. If none exists, ask whether to create one.
3. Stop until the user answers.

This applies even if:

- a usable key already exists
- no live API call will be made
- no secret will be written
- the task is "just create a script"

Finding an existing key is not permission to proceed. It only changes the question you ask.

The credential decision is a hard stop. Before the user answers, do not create directories, scaffold files, draft implementation plans, wire API-dependent code, run smoke tests, or give placeholder/manual key setup instructions. The only allowed pre-gate work is safe repo convention discovery and credential presence checks that do not print secrets.

## Credential Decision Messages

Required progress updates before or during credential inspection may be brief and limited to saying that Codex is checking credentials or opening secure key setup. They must not describe implementation plans, architecture, file choices, local destination details, or credential conclusions before the credential decision or picker handoff.

After inspecting credentials, the next substantive user-facing message must be the credential decision message. Do not send another substantive message before this decision.

Use one of these branches:

- Existing usable key found, and the user did not explicitly ask for a new key: make clear that the OpenAI API will power the app, script, or project, say that an existing usable `OPENAI_API_KEY` was found without revealing it, then ask whether to reuse that key or create a new one.
- No usable key found: make clear that the OpenAI API will power the app, script, or project, say that no usable `OPENAI_API_KEY` was found, then ask whether to create one securely.
- User explicitly asked for a new key: skip the reuse question and open the Platform picker directly when available.

After sending the credential decision message, stop until the user answers.

## Workflow

1. Inspect before acting:
   - look for a usable key without printing secret values in the current environment and likely local env files such as `.env.local`, `.env`, and ignored framework-specific env files
   - inspect env files only with no-output checks that reveal presence/absence, never with commands that echo matching lines or whole files
   - check README/setup docs, `OPENAI_BASE_URL`, and framework env docs for repo conventions separately from secret-bearing env files
   - prefer ignored or untracked env files; avoid tracked targets unless the user explicitly confirms that choice
   - default to `.env.local` and `OPENAI_API_KEY` when no stronger convention exists
2. Based on that inspection:
   - for tasks that will call the OpenAI API, when asking this up-front question, mention that the OpenAI API will power the app, script, or project before mentioning whether an existing key was found in the environment or local env files
   - if the user explicitly asked for a new key, no reuse decision is needed
   - otherwise, before building, implementing, running, testing, debugging, or configuring an app or script that calls the OpenAI API, ask up front whether to reuse an existing usable key or create a new one
   - if no usable key exists, ask whether to create one before building the rest of the app
   - ask this up front even before any live request; after asking, stop without adding an app plan, file list, code sketch, manual `OPENAI_API_KEY` instructions, or fallback placeholder setup
   - do not silently reuse a detected key for implementation, verification, smoke tests, or other live requests just because the user did not ask about credentials
   - treat requests to create or configure a key as ambiguous unless the user says they want a new key
   - if the user chooses reuse and a persistent file write is still needed, confirm the destination file/env var before writing
3. When creation is the chosen path, confirm the destination file/env var before writing. If the user has not already explicitly asked for a new key, ask whether to create one first.
   - Prefer the hosted Platform picker:
     - use `tool_search` to load `open_codex_api_key_setup`
     - call `open_codex_api_key_setup` directly with no arguments (`{}`). Do not send a key name, local paths, workspace arguments, or target arrays. The picker collects the key name, organization/project, and expiration, and sends a later widget-authored follow-up with the confirmed key name, selected opaque ids, and optional `expires_in_seconds`
     - after `open_codex_api_key_setup` returns without an error, end the current turn immediately and wait for the widget-generated follow-up prompt. Do not inspect or interpret the launch payload, search for connector contract details, run local-save steps, make another tool call, or send any non-empty user-facing message, including a picker-open confirmation, in that turn
   - After the widget follow-up, or if the picker tool is unavailable or fails before the widget opens, choose the best local env-file target from repo conventions, defaulting to `.env.local` and `OPENAI_API_KEY`.
   - Use `tool_search` to load the OpenAI Developers MCP `confirm_openai_api_key_local_destination` tool. If available, call it with the absolute workspace root, the recommended env-file target, and `OPENAI_API_KEY`. The form shows the recommended location and lets the user replace it before continuing.
   - If the local destination tool returns `approved`, use its returned `targetPath` exactly and do not ask a second destination question. If it is declined or canceled, stop.
   - If the local destination tool is unavailable, ask exactly one short question and stop: `Save the new key to <path>? Reply yes to continue, another workspace-relative env-file path to change it, or decline.` If the user declines, stop; otherwise use the confirmed path.
   - Silently check whether the selected target is tracked. If it is tracked, stop and obtain explicit confirmation that a secret will be written there. In this local fallback, do not claim the user selected an explicit organization/project target.
4. After confirmation, run the app tool preflight:
   - use `tool_search` to load `create_encrypted_openai_api_key`
   - if missing and `tool_suggest` is available, suggest installing connector `connector_2de447f3f15448ebab48783d7e4f5d81`
   - if unavailable or auth fails, ask the user to connect OpenAI Platform from `/apps` or the `$` app picker, then retry `tool_search` after they finish
5. Run `prepare`, keep `private_key_path`, and send only `recipient_public_key_jwk` to the connector.
6. Call `create_encrypted_openai_api_key` with the confirmed key name plus the picker-confirmed `organization_id` and `project_id` when the picker path was used. In the text-only fallback, omit those fields so the connector preserves its default organization/project behavior.
   - Forward the widget-confirmed `expires_in_seconds` unchanged. Its absence means Never: omit the argument, including for older widget follow-ups. Do not send `0`.
   - If creation fails, explain the returned error and stop. Do not automatically retry or change any of the user's confirmed inputs.
7. Run `decrypt` with the encrypted ciphertext, confirmed target path, env var name, and repo root as `--workspace`.
8. Verify by running the relevant project command when practical. Do not reveal or inspect the secret value directly.

## Helper

Use the helper by absolute path. `prepare` creates the temporary private key file plus a request JSON containing only the public JWK and requested key name:

```bash
node "<plugin root>/scripts/openai-platform-api-key.mjs" prepare --name "Codex"
```

After the connector returns `encrypted_api_key.ciphertext`, decrypt and write the key locally:

```bash
node "<plugin root>/scripts/openai-platform-api-key.mjs" decrypt \
  --private-key "<private key path from prepare>" \
  --ciphertext "<encrypted_api_key.ciphertext from connector result>" \
  --target "<confirmed env file path>" \
  --workspace "<repo root>" \
  --env-name OPENAI_API_KEY
```

The decrypt command updates or appends the env var, prints only safe write metadata, and refuses symlink or out-of-workspace targets.

## References

- `references/evals.md`: trigger and routing eval cases for this skill.
