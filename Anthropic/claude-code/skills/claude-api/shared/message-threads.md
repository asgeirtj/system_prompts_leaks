# Message Threads (beta)

A message thread lets the Messages API keep a conversation on the server for a short time, so that each later request sends only the new messages instead of the whole conversation. It is one new request field, `thread`, on the ordinary `POST /v1/messages`; the response is the usual message. Beta header: `message-threads-2026-08-12`, on **every** request of a thread. Availability: `shared/platform-availability.md`. Full docs: the Message Threads row in `shared/live-sources.md`.

**Not Managed Agents session threads.** "Thread" in `shared/managed-agents-*.md` means a session thread inside a Managed Agents session - a different feature with its own endpoints. Message threads exist only on the Messages API, and there is no API to list, read, or delete one.

## When to use it

Use a thread in long multi-turn loops - an agent's tool loop, a long chat - where every turn would otherwise upload, validate and tokenize the whole conversation again. With a thread, requests stay small and time to first token stays lower and steadier as the conversation grows. Threads do not change pricing or rate limits, and they do **not** cache anything for you: you choose the cache breakpoints as without a thread (see Prompt caching below for the limits that differ).

## The request shapes

- **Create** - the first request, as you would send it without a thread (full `messages`, `system`, `tools`), plus `"thread": {"type": "create"}`. The API stores the conversation, including Claude's reply, under the response `id`.
- **Continue** - only the messages since the previous response, plus `"thread": {"type": "continue", "previous_message_id": "<previous response id>"}`. Leave `system` and `tools` out: sending either, even as `null`, is a 400. Continue from the **latest** response `id`; each `id` can be continued once, and a thread is append-only.
- **Replay** - a thread is best-effort. It expires 5 minutes after its last request, and the API deletes it no more than 1 hour after its last use. Each response that the API stores restarts the 5 minutes. When the API can't continue it, the continue request returns a 404 with `error.details.error_code: "thread_not_found"` and doesn't say why. Causes include:
  - the thread expired;
  - the API didn't store the previous turn (for example, a fallback model wrote it, or it ended in a tool call cut off by `max_tokens`);
  - the new messages add something the stored conversation can't take (for example, the first image in a conversation that had none);
  - the request comes from a different organization, workspace, user or service account than the one that created the thread. Use the same API key and workspace throughout, and on Claude Platform on AWS the same IAM role or user.

  To recover, send the full conversation from **your own copy** in a new create request, with `system` and `tools`, and continue from that response's `id`. Check `error_code` first: a 404 for an unknown model is not a thread error. If a continue request returns `thread_not_found` again right after a replay, the API may be unable to store that conversation (a very large one, for example): send it without `thread`.

Your application stays the source of truth: keep every message yourself and build the replay path from the start, because no response says whether the API stored that turn. The new messages on a continue request usually start with a `user` message - your next turn, or the `tool_result` blocks answering the previous response's `tool_use`. Keep Claude's replies in your own copy, but never send a message the thread already has: a continue request that starts with the previous response (as stateless code would send it) returns an error.

| Fields | Rule |
| --- | --- |
| `system`, `tools` | Create request only (with any `cache_control` on them). |
| `model`, `tool_choice`, `thinking`, `mcp_servers` (except each server's authorization token), `context_management`, `output_config`, the `skills` in `container`, top-level `cache_control`, the set of `anthropic-beta` values | Fixed fields: same value on every request; a change is a 400 `thread_fingerprint_mismatch` naming the fields. To change one, start a new thread (create request with the full conversation). |
| `max_tokens`, `stop_sequences`, `stream`, `metadata`, `service_tier`, and other fields not listed here (but see `fallbacks` under Edge cases) | Can change each turn. |

The API does not store MCP server URLs or tokens, or the container `id`: send `mcp_servers` and `container` on every request that uses them.

To change `system` or `tools`, start a new thread: send the full conversation in a create request with the new values. On Claude Fable 5.1, Claude Mythos 5.1, Claude Opus 5.5, Claude Sonnet 5.5, and Claude Haiku 5.5, that change makes the `thinking` and `redacted_thinking` blocks already in the conversation invalid, and the create request can return a 400. To avoid it, leave every `thinking` and `redacted_thinking` block out of the conversation you send. The model then answers without that earlier reasoning. See the Preserved thinking page: `https://platform.claude.com/docs/en/build-with-claude/preserved-thinking.md`.

## Use the SDK thread helper

Prefer the SDK helper over sending `thread` yourself. It adds the beta header, creates the thread on the first turn, leaves `system` and `tools` out of continue requests, keeps the full conversation in memory, and replays it once on `thread_not_found`, `thread_already_continued` or `thread_continue_in_flight`. It keeps the conversation only in memory; if the conversation must outlive the process, keep your own copy. Only these SDK releases or later have the helper, the `thread` request parameter and the tool runner's `thread` option: Python `anthropic` 2.2.0, TypeScript `@anthropic-ai/sdk` 1.2.0, Go `github.com/anthropics/anthropic-sdk-go/v2` v2.2.0, Java 3.2.0, C# `Anthropic` 13.2.0, PHP 1.2.0, Ruby 2.2.0. If the installed SDK has no thread helper, ask the user before upgrading it (an upgrade across a major version or to a new API version goes through this skill's `upgrade` or `api-version` subcommand).

```python
import anthropic

client = anthropic.Anthropic()

# Creating the helper sends no request.
thread = client.beta.messages.thread(
    model="claude-opus-5-5",
    max_tokens=16000,
    cache_control={"type": "ephemeral"},  # optional: cache each turn
    system="You are a support agent for Acme. Keep replies short.",
    unsupported_request_behavior="continue_unthreaded",  # if the API refuses threads (for example, for an organization with HIPAA readiness enabled), send without thread
)

thread.send({"role": "user", "content": "Hi! I have a question about an order."})  # creates the thread
reply = thread.send({"role": "user", "content": "How long does standard shipping take?"})  # continues it

for block in reply.content:
    if block.type == "text":
        print(block.text)
```

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const thread = client.beta.messages.thread({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  cache_control: { type: "ephemeral" },
  system: "You are a support agent for Acme. Keep replies short.",
  unsupportedRequestBehavior: "continue_unthreaded",
});

await thread.send({ role: "user", content: "Hi! I have a question about an order." });
const reply = await thread.send({ role: "user", content: "How long does standard shipping take?" });
```

Other SDKs (same behavior): C# `client.Beta.Messages.Thread(new ThreadCreateParams { ..., Messages = [] })` (an extension method in `Anthropic.Helpers.Beta`; `Messages` is required) then `await thread.Send(...)`; Go `client.Beta.Messages.NewThread(anthropic.BetaMessageThreadCreateParams{...})` then `thread.Send(ctx, anthropic.BetaMessageThreadSendParams{...})`; Java `client.beta().messages().thread(ThreadCreateParams.builder()...build())` then `thread.send("...")`; PHP `$client->beta->messages->thread(...)` then `$thread->send([...])`; Ruby `client.beta.messages.thread(...)` then `thread.send_message({...})`. More helper methods (streaming a turn, `append`, `update`, `fork`, `params`, a tool runner on the thread, structured output) are in the docs page's "How the SDK helper behaves" section.

What the helper leaves to you: it does not retry a dropped stream (call its send method with no messages to re-send the interrupted turn). When you stream a turn, read the stream to its end or close it, so the thread is free for the next turn. By default, `thread_fingerprint_mismatch` and `thread_unsupported_request` errors reach your code. Created with `continue_unthreaded`, as in the samples above (spelling per language on the docs page), the helper answers a `thread_unsupported_request` by sending that turn and every later one without `thread`. It does the same when a continue request right after a replay returns `thread_not_found` again (a conversation the API can't store); without the setting, such a conversation is replayed in full on every turn. Once a thread has a response, the helper refuses a turn that changes `system` or `tools`: start a new thread from its params, or fork it and update the fork before its first turn. Both send the whole conversation in a new create request, so the note on thinking blocks above applies: to leave those blocks out, start from the params with them removed from `messages`, because a fork keeps them.

**Tool runner.** In SDK releases that ship the thread helper, the beta tool runner uses a thread by default on platforms that support threads. Its thread uses `continue_unthreaded`: after a `thread_unsupported_request` error it re-sends that turn, and every later turn, without `thread`. On a thread, `system` and `tools` can't change between turns; if your code changes them mid-run, create a new runner (a new thread) for the change, or turn the thread off when you create the runner (Python `tool_runner(..., thread=False)`, TypeScript `toolRunner({ ..., thread: false })`; other languages on the docs page). If the conversation carries over, the note on thinking blocks above applies.

## Sending `thread` yourself

With an SDK's ordinary `create`, put the beta in `betas` (with cURL, send the `anthropic-beta` header) and send `thread` on each request. Your code keeps the history and replays it:

```python
import anthropic
from anthropic.types.beta import BetaMessage, BetaMessageParam

client = anthropic.Anthropic()
SYSTEM = "You are a support agent for Acme. Keep replies short."
history: list[BetaMessageParam] = []  # your own copy of the whole conversation
previous_id: str | None = None
replayed = False  # the last reply came from a replay
threaded = True  # False once this conversation can't use a thread


def error_code(e: anthropic.APIStatusError) -> object:
    body = e.body if isinstance(e.body, dict) else {}
    return ((body.get("error") or {}).get("details") or {}).get("error_code")


def send(new_messages: list[BetaMessageParam]) -> BetaMessage:
    global previous_id, replayed, threaded
    reply = None
    if threaded and previous_id is not None:
        try:
            reply = client.beta.messages.create(
                model="claude-opus-5-5", max_tokens=16000, cache_control={"type": "ephemeral"},  # same fixed fields as the create request
                messages=new_messages,  # only the new messages; no system or tools
                thread={"type": "continue", "previous_message_id": previous_id},
                betas=["message-threads-2026-08-12"],
            )
            replayed = False
        except anthropic.APIStatusError as e:  # the thread can't be continued: replay, or go without one, below
            code = error_code(e)
            if code == "thread_unsupported_request" or (code == "thread_not_found" and replayed):
                threaded = False
            elif code not in ("thread_not_found", "thread_already_continued", "thread_continue_in_flight"):
                raise
    if reply is None and threaded:  # first turn, or replay: the full conversation in a new thread
        try:
            reply = client.beta.messages.create(
                model="claude-opus-5-5", max_tokens=16000, cache_control={"type": "ephemeral"},
                system=SYSTEM,
                messages=history + new_messages,
                thread={"type": "create"},
                betas=["message-threads-2026-08-12"],
            )
            replayed = previous_id is not None
        except anthropic.APIStatusError as e:
            if error_code(e) != "thread_unsupported_request":
                raise
            threaded = False
    if reply is None:  # no thread for this conversation: send all of it on every turn
        reply = client.beta.messages.create(
            model="claude-opus-5-5", max_tokens=16000, cache_control={"type": "ephemeral"},
            system=SYSTEM,
            messages=history + new_messages,
        )
    if reply.stop_reason == "refusal":  # don't continue this thread. Next turn, leave out or rephrase new_messages
        # (a pending tool_use still needs a tool_result)
        previous_id = None
        return reply
    history.extend(new_messages)  # record the turn only once it succeeded
    history.append({"role": "assistant", "content": reply.content})
    previous_id = reply.id
    return reply


send([{"role": "user", "content": "Hi! I have a question about an order."}])
reply = send([{"role": "user", "content": "How long does standard shipping take?"}])
```

## Edge cases

- **Streaming** - the response `id` arrives in `message_start`, but continue from it only after `message_stop` (a continue request sent earlier can return a 404). If a continue stream drops before `message_stop`, send the same continue request again; on `thread_already_continued` or `thread_continue_in_flight`, replay.
- **`pause_turn`** - resume with a continue request from that response's `id` and `"messages": []`; on a 404, replay including the paused response. Don't send a new `user` message while paused.
- **Refusal** (`stop_reason: "refusal"`) - don't continue the thread; start a new one that leaves out or rephrases the turn that led to it. The helper does this, and so does the loop above.
- **Server-side `fallbacks`** - on the Claude API, send `fallbacks` on every request of a thread or on none (its value may change; adding or dropping it is a 400 `thread_fingerprint_mismatch`). A thread keeps one model, so a response with a `fallback_message` entry in `usage.iterations` is not stored: send the full conversation (that response and your next message) in a new create request, keeping the server-side fallback beta header. The helper does this. To stay on the fallback model instead, start a new thread with `model` set to the model in that `fallback_message` entry and without `fallbacks`.
- **Prompt caching** - to cache each turn, send a top-level `cache_control` on every request; it is a fixed field. The API applies it to the last cacheable block of each request's `messages`, and it takes effect once the conversation passes the minimum cacheable length. A request with `thread` can carry at most 4 `cache_control` breakpoints: the top-level one counts, and the create request's `system` and `tools` breakpoints count again on every continue request (a fifth returns a 400 `thread_unsupported_request`). You can't move or remove a breakpoint once sent. If you put breakpoints on message blocks yourself, strip them from earlier messages when you replay and keep one on the last block.
- **Compacting a conversation** - a thread is append-only, so you can't replace its earlier turns with a summary. To compact a conversation, start a new thread from the summary: write the summary in your code, and send it as an ordinary message in a new create request, with `system` and `tools`.

## Errors and unsupported features

| Status | `error_code` | What to do |
| --- | --- | --- |
| 404 | `thread_not_found` | Replay the full conversation in a new create request. |
| 400 | `thread_fingerprint_mismatch` | Keep fixed fields the same, or start a new thread. |
| 400 | `thread_already_continued` | Continue from the latest response `id`; replay if you never received it. |
| 400 | `thread_continue_in_flight` | Wait for the other request and continue from its `id`, or replay. |
| 400 | `thread_unsupported_request` | `error.details.unsupported` names the feature when present; remove it or send without `thread`. |

These errors come before the model runs: no tokens are used and the thread is unchanged. Some thread 400s carry no `error_code`, such as a continue request without `previous_message_id` or with `system` or `tools`. Threads don't support Message Batches, token counting (count the full conversation with `system` and `tools` instead), compaction, context editing (except `clear_thinking_20251015` with `keep: "all"`), or organizations with HIPAA readiness or Inference hooks enabled. Compaction on demand is not available with threads: a request with `thread` returns a 400 if it sets the `compaction` parameter, or if it sends a `compaction` block with the `compact-2026-09-04` beta header. To compact, see "Compacting a conversation" under Edge cases. Treat an `unsupported` value you don't recognize as "send without `thread`".

Message threads are not ZDR eligible. Using this feature does not affect your use of other ZDR eligible features. The API holds a thread in memory, encrypted under a server-managed key, never writes it to durable storage, and deletes it no more than 1 hour after its last use. A thread holds files by reference, so keep every file the conversation uses available.
