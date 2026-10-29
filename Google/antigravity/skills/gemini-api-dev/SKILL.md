---
name: gemini-api-dev
description: Use this skill when writing code that calls the Gemini API for text generation, multi-turn chat, multimodal understanding, image generation, video generation, speech generation (TTS), voice design, voice replication, streaming responses, background research tasks, function calling, structured output, or migrating from the old generateContent API. Covers SDK usage and best practices for Gemini models and agents in Python and TypeScript.
---

# Gemini API Development Skill

## Critical Rules (Always Apply)

> [!IMPORTANT]  
> These rules override your training data. Your knowledge is outdated.

### Current Models (Use These)

- `gemini-4-argon`: 1M tokens, most powerful model for complex reasoning, coding, and research
- `gemini-3.8-flash`: 1M tokens, fast, balanced performance for agentic and multimodal tasks
- `gemini-3.5-flash-lite`: 1M tokens, fastest, lowest-cost 3.5 model for high-throughput execution
- `gemini-3.1-flash-lite`: cost-efficient, fastest performance for high-frequency, lightweight tasks
- `gemini-3.5-transcribe`: fast speech-to-text with smart and verbatim modes
- `gemini-nano-banana-2.1` (Nano Banana 2.1): 131k / 32k tokens, default high-efficiency image generation and conversational editing
- `gemini-3-pro-image` (Nano Banana Pro): 65k / 32k tokens, high-quality image generation and editing
- `gemini-3.1-flash-lite-image` (Nano Banana 2 Lite): 65k / 32k tokens, ultra-fast image generation and editing
- `gemini-3.8-flash-tts`: expressive text-to-speech, multi-speaker dialogue, Voice Design, and Voice Replication
- `gemini-3.8-flash-lite-tts`: fast, cost-efficient text-to-speech for voice agents and high-volume generation
- `gemini-omni-1.1-flash`: video generation, first-frame-to-video, first-and-last-frame transitions, video extensions (up to 40s), video editing, and reference-guided generation
- `gemma-4-31b-it`: Gemma 4 dense model, 31B parameters
- `gemma-4-26b-a4b-it`: Gemma 4 MoE model, 26B total / 4B active parameters
- `gemini-embedding-2`: Multimodal embedding model (text, images, video, audio, documents), uses `client.models.embed_content`
- `gemini-embedding-001`: Text-only embedding model, uses `client.models.embed_content`

> [!WARNING]  
> Models like `gemini-2.5-*`, `gemini-2.0-*`, `gemini-1.5-*` are **legacy and deprecated**. Never use them.  
> **If a user asks for a deprecated model, use `gemini-3.8-flash` instead and note the substitution.**

### Current Agents

- `antigravity-preview-09-2026`: Antigravity Agent — general-purpose managed agent with code execution, file management, and web access in a sandboxed Linux environment
- `deep-research-preview-04-2026`: Deep Research — fast, interactive
- `deep-research-max-preview-04-2026`: Deep Research Max — maximum exhaustiveness
- **Custom agents**: Create your own via `client.agents.create()`

### Current SDKs

- **Python**: `google-genai` >= `2.30.1` → `pip install -U google-genai`
- **JavaScript/TypeScript**: `@google/genai` >= `2.29.1` → `npm install @google/genai`

> [!NOTE]  
> SDK versions ≥ 2.0.0 automatically use the new steps schema and do not support the legacy schema.  
> Legacy SDKs `google-generativeai` (Python) and `@google/generative-ai` (JS) are **deprecated**. Never use them.

## Important Additional Notes

- **Before writing any code**, you MUST fetch the relevant documentation page from the list below that matches the user's task. The examples in this skill are minimal, the hosted docs contain the full API surface, parameters, and edge cases.
- Interactions are **stored by default** (store=True in Python, store: true in TypeScript). Paid tier retains for 55 days, free tier for 1 day.
- Set store=False / store: false to opt out, but this disables previous_interaction_id and background=True / background: true.
- `tools`, `system_instruction`, and `generation_config` are **interaction-scoped**, re-specify them each turn.
- **Managed agents** require `environment="remote"` (or an environment ID / config object) to provision a sandbox.
- **Migrating from `generateContent`**: Read `references/migration.md` for the scoping, checklist, and before/after code examples. Always confirm scope with the user before editing.
- **Model upgrades**: Drop-in, swap the model string. Deprecated models (`gemini-2.0-*`, `gemini-1.5-*`) must be replaced, see `references/migration.md`.
- **Migrating to Gemini 3.8 Flash or Gemini 3.5 Flash-Lite**: Read `references/migration.md` for the scoping and checklist.
- **Migrating to Gemini 3.8 TTS (`gemini-3.8-flash-tts` / `gemini-3.8-flash-lite-tts`)**: Read `references/migration.md` for breaking changes from `gemini-3.1-flash-tts-preview` (`speech_metadata` annotations, inline vocal tags, default WAV `audio/wav` unary output vs `audio/l16` streaming output, and Voice Design personas).
- **Migrating to Gemini Nano Banana 2.1 (`gemini-nano-banana-2.1`)**: Read `references/migration.md` for upgrading from `gemini-3.1-flash-image` (deprecated) and using multi-image reference fusion with up to 14 reference images.

## Quick Start

### Python
```python
from google import genai

client = genai.Client()

interaction = client.interactions.create(
    model="gemini-3.8-flash",
    input="Tell me a short joke about programming."
)
print(interaction.output_text)
```

### JavaScript/TypeScript
```typescript
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({});

const interaction = await client.interactions.create({
    model: "gemini-3.8-flash",
    input: "Tell me a short joke about programming.",
});
console.log(interaction.output_text);
```

## Response Helpers

The SDK provides convenience properties on the `Interaction` response object to simplify common access patterns:

| Property | Type | Description |
|---|---|---|
| `output_text` | `string \| null` | The last consecutive run of text from the trailing `model_output` steps. Returns the combined text when the model's final output contains multiple text parts. |
| `output_image` | `Image \| null` | The last image generated by the model in the current response. Returns an object with `data` (base64) and `mime_type`. |
| `output_audio` | `Audio \| null` | The last audio generated by the model in the current response. Returns an object with `data` (base64) and `mime_type`. |

## Stateful Conversation

### Python
```python
interaction1 = client.interactions.create(
    model="gemini-3.8-flash",
    input="Hi, my name is Phil."
)
# Second turn — server remembers context
interaction2 = client.interactions.create(
    model="gemini-3.8-flash",
    input="What is my name?",
    previous_interaction_id=interaction1.id
)
print(interaction2.output_text)
```

### JavaScript/TypeScript
```typescript
const interaction1 = await client.interactions.create({
    model: "gemini-3.8-flash",
    input: "Hi, my name is Phil.",
});
const interaction2 = await client.interactions.create({
    model: "gemini-3.8-flash",
    input: "What is my name?",
    previous_interaction_id: interaction1.id,
});
console.log(interaction2.output_text);
```

## Deep Research Agent

Use `deep-research-preview-04-2026` for fast research or `deep-research-max-preview-04-2026` for maximum exhaustiveness. Agents require `background=True`.

### Python
```python
import time

interaction = client.interactions.create(
    agent="deep-research-preview-04-2026",
    input="Research the history of Google TPUs.",
    background=True
)
while True:
    interaction = client.interactions.get(interaction.id)
    if interaction.status == "completed":
        print(interaction.output_text)
        break
    elif interaction.status == "failed":
        print(f"Failed: {interaction.error}")
        break
    time.sleep(10)
```

### JavaScript/TypeScript
```typescript
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({});

// Start background research
const initialInteraction = await client.interactions.create({
    agent: "deep-research-preview-04-2026",
    input: "Research the history of Google TPUs.",
    background: true,
});

// Poll for results
while (true) {
    const interaction = await client.interactions.get(initialInteraction.id);
    if (interaction.status === "completed") {
        console.log(interaction.output_text);
        break;
    } else if (["failed", "cancelled"].includes(interaction.status)) {
        console.log(`Failed: ${interaction.status}`);
        break;
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
}
```

Advanced features: collaborative planning, native visualization, MCP integration, file search, multimodal inputs. See [Deep Research docs](https://ai.google.dev/gemini-api/docs/deep-research.md.txt).

## Managed Agents

Managed agents run inside a sandboxed Linux environment hosted by Google. Fetch the [Managed Agents Quickstart](https://ai.google.dev/gemini-api/docs/managed-agents-quickstart.md.txt) before writing agent code.

### Antigravity Agent

The Antigravity agent (`antigravity-preview-09-2026`) is the general-purpose managed agent. It can execute code (Bash, Python, Node.js), manage files, browse the web, and use Google Search. It uses `gemini-3.8-flash` by default and also supports `gemini-4-argon` via `agent_config={"type": "antigravity", "model": "gemini-4-argon"}`. See [Antigravity Agent docs](https://ai.google.dev/gemini-api/docs/antigravity-agent.md.txt) for capabilities, tools, multimodal input, and pricing.

#### Python
```python
from google import genai

client = genai.Client()

interaction = client.interactions.create(
    agent="antigravity-preview-09-2026",
    input="Write a Python script that generates the first 20 Fibonacci numbers and saves them to fibonacci.txt. Then read the file and print its contents.",
    environment="remote",
)

print(f"Environment ID: {interaction.environment_id}")
print(interaction.output_text)
```

#### JavaScript/TypeScript
```typescript
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({});

const interaction = await client.interactions.create({
    agent: "antigravity-preview-09-2026",
    input: "Write a Python script that generates the first 20 Fibonacci numbers and saves them to fibonacci.txt. Then read the file and print its contents.",
    environment: "remote",
});

console.log(`Environment ID: ${interaction.environment_id}`);
console.log(interaction.output_text);
```

### Custom Agents

See [Building Custom Agents docs](https://ai.google.dev/gemini-api/docs/custom-agents.md.txt).

#### Python
```python
agent = client.agents.create(
    id="code-reviewer",
    base_agent="antigravity-preview-09-2026",
    system_instruction="You are a senior code reviewer. Check every file for bugs, style issues, and security vulnerabilities.",
    base_environment={
        "type": "remote",
        "sources": [
            {
                "type": "repository",
                "source": "https://github.com/my-org/backend",
                "target": "/workspace/repo",
            }
        ],
    },
)

# Invoke — each call forks the base environment
result = client.interactions.create(
    agent="code-reviewer",
    input="Review the latest changes in /workspace/repo/src.",
    environment="remote",
)
print(result.output_text)
```

#### JavaScript/TypeScript
```typescript
const agent = await client.agents.create({
    id: "code-reviewer",
    base_agent: "antigravity-preview-09-2026",
    system_instruction: "You are a senior code reviewer. Check every file for bugs, style issues, and security vulnerabilities.",
    base_environment: {
        type: "remote",
        sources: [
            {
                type: "repository",
                source: "https://github.com/my-org/backend",
                target: "/workspace/repo",
            }
        ],
    },
});

const result = await client.interactions.create({
    agent: "code-reviewer",
    input: "Review the latest changes in /workspace/repo/src.",
    environment: "remote",
});
console.log(result.output_text);
```

Manage agents with `client.agents.list()`, `client.agents.get(id=...)`, and `client.agents.delete(id=...)`.

## Streaming

Set `stream=True` to receive incremental server-sent events. Each stream follows: `interaction.created` → (`step.start` → `step.delta`(s) → `step.stop`)+ → `interaction.completed`.

### Python
```python
for event in client.interactions.create(
    model="gemini-3.8-flash",
    input="Explain quantum entanglement in simple terms.",
    stream=True,
):
    if event.event_type == "step.delta":
        if event.delta.type == "text":
            print(event.delta.text, end="", flush=True)
    elif event.event_type == "interaction.completed":
        print(f"\n\nTotal Tokens: {event.interaction.usage.total_tokens}")
```

### JavaScript/TypeScript
```typescript
const stream = await client.interactions.create({
    model: "gemini-3.8-flash",
    input: "Explain quantum entanglement in simple terms.",
    stream: true,
});
for await (const event of stream) {
    if (event.event_type === "step.delta") {
        if (event.delta.type === "text") {
            process.stdout.write(event.delta.text);
        }
    } else if (event.event_type === "interaction.completed") {
        console.log(`\n\nTotal Tokens: ${event.interaction?.usage?.total_tokens}`);
    }
}
```

For streaming with tools, thinking, agents, and image generation see the full [Streaming guide](https://ai.google.dev/gemini-api/docs/streaming.md.txt).



## Documentation Lookup & Pages

### When MCP is Installed (Preferred)

If the **`gemini_search_docs`** tool (or **`search_docs`**) is available from the Gemini Docs MCP server (`https://gemini-api-docs-mcp.dev`), use it as your **only** documentation source:

1. Call `gemini_search_docs` with your query (or use `gemini_get_doc` to retrieve a specific doc path)
2. Read the returned documentation
3. **Trust MCP results** as source of truth for API details — they are always up-to-date.

> [!IMPORTANT]  
> When MCP tools are present, **never** fetch URLs manually. MCP provides up-to-date, indexed documentation that is more accurate and token-efficient than URL fetching.

### When MCP is NOT Installed (Fallback)

For Gemini API documentation, refer to `https://ai.google.dev/gemini-api/docs/llms.txt` for all canonical docs.

**You MUST fetch the matching page below before writing code.** These hosted docs are the source of truth for parameters, types, and edge cases — do not rely solely on the examples above.

**Core Documentation:**
- [Interactions API Overview](https://ai.google.dev/gemini-api/docs/interactions.md.txt)
- [Quickstart](https://ai.google.dev/gemini-api/docs/quickstart.md.txt)
- [Text Generation](https://ai.google.dev/gemini-api/docs/text-generation.md.txt)
- [Streaming](https://ai.google.dev/gemini-api/docs/streaming.md.txt)
- [Tokens](https://ai.google.dev/gemini-api/docs/tokens.md.txt)
- [API Keys](https://ai.google.dev/gemini-api/docs/api-key.md.txt)

**Tools & Function Calling:**
- [Function Calling](https://ai.google.dev/gemini-api/docs/function-calling.md.txt)
- [Google Search](https://ai.google.dev/gemini-api/docs/google-search.md.txt)
- [Code Execution](https://ai.google.dev/gemini-api/docs/code-execution.md.txt)
- [URL Context](https://ai.google.dev/gemini-api/docs/url-context.md.txt)
- [File Search](https://ai.google.dev/gemini-api/docs/file-search.md.txt)
- [Tool Combination](https://ai.google.dev/gemini-api/docs/tool-combination.md.txt)
- [Computer Use](https://ai.google.dev/gemini-api/docs/computer-use.md.txt)
- [Maps Grounding](https://ai.google.dev/gemini-api/docs/maps-grounding.md.txt)

**Generation & Output:**
- [Structured Output](https://ai.google.dev/gemini-api/docs/structured-output.md.txt)
- [Thinking](https://ai.google.dev/gemini-api/docs/thinking.md.txt)
- [Thought Signatures](https://ai.google.dev/gemini-api/docs/thought-signatures.md.txt)
- [Image Generation](https://ai.google.dev/gemini-api/docs/image-generation.md.txt)
- [Image Understanding](https://ai.google.dev/gemini-api/docs/image-understanding.md.txt)
- [Video Generation & Editing (Omni Flash)](https://ai.google.dev/gemini-api/docs/omni.md.txt)
- [Speech Generation (TTS)](https://ai.google.dev/gemini-api/docs/speech-generation.md.txt)
- [Voice Design](https://ai.google.dev/gemini-api/docs/voice-design.md.txt)
- [Voice Replication](https://ai.google.dev/gemini-api/docs/voice-replication.md.txt)
- [Music Generation](https://ai.google.dev/gemini-api/docs/music-generation.md.txt)
- [Embeddings](https://ai.google.dev/gemini-api/docs/embeddings.md.txt)

**Multimodal Understanding:**
- [Audio](https://ai.google.dev/gemini-api/docs/audio.md.txt)
- [Audio Transcription](https://ai.google.dev/gemini-api/docs/transcribe.md.txt)
- [Video Understanding](https://ai.google.dev/gemini-api/docs/video-understanding.md.txt)
- [Document Processing](https://ai.google.dev/gemini-api/docs/document-processing.md.txt)

**Files & Context:**
- [Files](https://ai.google.dev/gemini-api/docs/files.md.txt)
- [File Input Methods](https://ai.google.dev/gemini-api/docs/file-input-methods.md.txt)
- [Long Context](https://ai.google.dev/gemini-api/docs/long-context.md.txt)
- [Caching](https://ai.google.dev/gemini-api/docs/caching.md.txt)
- [Media Resolution](https://ai.google.dev/gemini-api/docs/media-resolution.md.txt)

**Agents:**
- [Agents Overview](https://ai.google.dev/gemini-api/docs/agents.md.txt)
- [Managed Agents Quickstart](https://ai.google.dev/gemini-api/docs/managed-agents-quickstart.md.txt)
- [Antigravity Agent](https://ai.google.dev/gemini-api/docs/antigravity-agent.md.txt)
- [Agent Environments](https://ai.google.dev/gemini-api/docs/agent-environment.md.txt)
- [Agent Hooks](https://ai.google.dev/gemini-api/docs/agent-hooks.md.txt)
- [Agent Credentials](https://ai.google.dev/gemini-api/docs/agent-credentials.md.txt)
- [Building Custom Agents](https://ai.google.dev/gemini-api/docs/custom-agents.md.txt)
- [Deep Research](https://ai.google.dev/gemini-api/docs/deep-research.md.txt)

**Advanced Features:**
- [Latest Model (Gemini 4 Argon)](https://ai.google.dev/gemini-api/docs/latest-model.md.txt)
- [Background Execution](https://ai.google.dev/gemini-api/docs/background-execution.md.txt)
- [Flex Inference](https://ai.google.dev/gemini-api/docs/flex-inference.md.txt)
- [Priority Inference](https://ai.google.dev/gemini-api/docs/priority-inference.md.txt)

**API Reference:**
- [API Reference](https://ai.google.dev/static/api/interactions.md.txt)
- [OpenAPI Spec](https://ai.google.dev/static/api/interactions.openapi.json)
- [May 2026 Breaking Changes Migration Guide](https://ai.google.dev/gemini-api/docs/interactions-breaking-changes-may-2026.md.txt)

## Data Model

An `Interaction` response contains `steps`, an array of typed step objects representing a structured timeline of the interaction turn.

### Step Types

**User steps:**
- `user_input`: User input (text, audio, multimodal). Contains `content` array.

**Model/server steps:**
- `model_output`: Final model generation. Contains `content` array with `text`, `image`, `audio`, etc.
- `thought`: Model reasoning/Chain of Thought. Has `signature` field (required) and optional `summary`.
- `function_call`: Tool call request (`id`, `name`, `arguments`).
- `function_result`: Tool result you send back (`call_id`, `name`, `result`).
- `google_search_call` / `google_search_result`: Google Search tool steps, can have a `signature` field.
- `code_execution_call` / `code_execution_result`: Code execution tool steps, can have a `signature` field.
- `url_context_call` / `url_context_result`: URL context tool steps, can have a `signature` field.
- `mcp_server_tool_call` / `mcp_server_tool_result`: Remote MCP tool steps.
- `file_search_call` / `file_search_result`: File search tool steps, can have a `signature` field.

### Content types (inside `content` array on `model_output` and `user_input` steps)
- `text`: Text content (`text` field, plus optional `annotations` such as `{"type": "speech_metadata", "speaker": "...", "style": "..."}` for TTS)
- `image` / `audio` / `document` / `video`: Content with `data`, `mime_type`, or `uri`

### Streaming Event Types

| Event | Description |
|---|---|
| `interaction.created` | Interaction created; includes metadata. |
| `interaction.status_update` | Interaction-level status change. |
| `step.start` | A new step begins. Contains step `type` and initial metadata. |
| `step.delta` | Incremental data for the current step. Contains a typed `delta` object. |
| `step.stop` | The step is complete. Contains `index`. |
| `interaction.completed` | Interaction finished. Contains final `usage`. |

### Delta Types

| Delta Type | Parent Step | Description |
|---|---|---|
| `text` | `model_output` | Incremental text token. |
| `audio` | `model_output` | audio chunk (base64). |
| `image` | `model_output` | image chunk (base64). |
| `thought_summary` | `thought` | thinking summary text. |
| `thought_signature` | `thought` | Opaque signature for thought verification. |

**Status values:** `completed`, `in_progress`, `queued`, `requires_action`, `incomplete`, `failed`, `cancelled`

## Gemini Live API

For real-time, bidirectional audio/video/text streaming with the Gemini Live API (`gemini-3.8-live`, `gemini-3.8-live-extended-thinking`, and `gemini-3.5-transcribe-live`), install the **`google-gemini/gemini-live-api-dev`** skill. It covers WebSocket streaming, voice activity detection, background reasoning (extended thinking), asynchronous function calling, session management, ephemeral tokens, and more.
