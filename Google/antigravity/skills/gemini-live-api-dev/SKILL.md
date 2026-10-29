---
name: gemini-live-api-dev
description: Use this skill when building real-time, bidirectional streaming applications with the Gemini Live API, or migrating legacy Live models (2.0/2.5/3.1) to Gemini 3.8 Live. Covers WebSocket-based audio/video/text streaming, voice activity detection (VAD), background reasoning (extended thinking), asynchronous function calling, session management, ephemeral tokens, live transcription, and live translation. SDKs covered - google-genai (Python), @google/genai (JavaScript/TypeScript).
---

# Gemini Live API Development Skill

## Overview

The Live API enables **low-latency, real-time voice and video interactions** with Gemini over WebSockets. It processes continuous streams of audio, video, or text to deliver immediate, human-like spoken responses and background reasoning.

Key capabilities:
- **Bidirectional audio streaming** — real-time mic-to-speaker conversations
- **Background reasoning (extended thinking)** — multi-step background reasoning with spoken conversational fillers
- **Live streaming transcription** — real-time speech-to-text with interim and finalized streams
- **Video streaming** — send camera/screen frames alongside audio
- **Text input/output** — send and receive text within a live session
- **Audio transcriptions** — get text transcripts of both input and output audio
- **Voice Activity Detection (VAD)** — automatic server VAD, client-side Hybrid VAD, and manual Push-to-Talk
- **Asynchronous function calling** — non-blocking tool execution while audio continues streaming
- **Full-session client content** — inject and update conversation turns mid-stream
- **Session management** — context compression, session resumption, GoAway signals
- **Ephemeral tokens** — secure client-side authentication

> [!NOTE]  
> The Live API connects directly via **WebSockets**. For WebRTC support or simplified integration, use a [partner integration](#partner-integrations).

## Models

### Current Models (Use These)

- `gemini-3.8-live` — Default option for most low-latency voice agent experiences and real-time dialogue without reasoning delays. Supports interleaved reasoning, asynchronous function calling by default (`behavior: NON_BLOCKING`), and full-session client content updates.
- `gemini-3.8-live-extended-thinking` — High-reasoning audio-to-audio model recommended when higher background reasoning is required during live interactions. Processes background reasoning and async tool calls (`behavior: NON_BLOCKING` required) while streaming continuous spoken conversational fillers; lifecycle managed via `interaction_status` (`IN_PROGRESS` vs `IDLE`).
- `gemini-3.5-transcribe-live` — Real-time streaming speech-to-text with interim hypotheses, finalized transcripts, smart formatting, and Hybrid VAD.
- `gemini-3.5-live-translate-preview` — Real-time speech-to-speech streaming translation across 70+ languages.

> [!WARNING]  
> **Legacy Models (`gemini-3.1-flash-live-preview`, `gemini-2.5-flash-native-audio-*`, `gemini-live-2.5-flash-preview`, `gemini-2.0-flash-live-001`)**: Read [`references/migration.md`](references/migration.md) for breaking protocol changes (`behavior: "NON_BLOCKING"`, `thinking_level`, `interaction_status`, `send_client_content`).

## SDKs

- **Python**: `google-genai` >= `2.3.0` — `pip install -U google-genai`
- **JavaScript/TypeScript**: `@google/genai` >= `2.3.0` — `npm install @google/genai`

> [!WARNING]  
> Legacy SDKs `google-generativeai` (Python) and `@google/generative-ai` (JS) are **deprecated**. Never use them.

## Partner Integrations

To streamline real-time audio/video app development, use a third-party integration supporting the Gemini Live API over **WebRTC** or **WebSockets**:

- [LiveKit](https://docs.livekit.io/agents/models/realtime/plugins/gemini/) — Use the Gemini Live API with LiveKit Agents.
- [Pipecat by Daily](https://docs.pipecat.ai/guides/features/gemini-live) — Create a real-time AI chatbot using Gemini Live and Pipecat.
- [Fishjam by Software Mansion](https://docs.fishjam.io/tutorials/gemini-live-integration) — Create live video and audio streaming applications with Fishjam.
- [Vision Agents by Stream](https://visionagents.ai/integrations/gemini) — Build real-time voice and video AI applications with Vision Agents.
- [Voximplant](https://voximplant.com/products/gemini-client) — Connect inbound and outbound calls to Live API with Voximplant.
- [Firebase AI SDK](https://firebase.google.com/docs/ai-logic/live-api?api=dev) — Get started with the Gemini Live API using Firebase AI Logic.

## Audio Formats

- **Input**: Raw PCM, little-endian, 16-bit, mono. 16kHz native (will resample others). MIME type: `audio/pcm;rate=16000`
- **Output**: Raw PCM, little-endian, 16-bit, mono. 24kHz sample rate.

> [!IMPORTANT]  
> Use `send_realtime_input` / `sendRealtimeInput` for all real-time streaming user input (audio, video, **and text**). On Gemini 3.8 models, `send_client_content` / `sendClientContent` is supported across the full session lifecycle with explicit roles (`user` or `model`) to inject conversation context (`turn_complete=true` unconditionally interrupts active generation).

> [!WARNING]  
> Do **not** use `media` in `sendRealtimeInput`. Use the specific keys: `audio` for audio data, `video` for images/video frames, and `text` for text input.

---

## Quick Start

### Authentication

#### Python

```python
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")
```

#### JavaScript

```js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: 'YOUR_API_KEY' });
```

### Connecting to the Live API

#### Python
```python
from google.genai import types

config = types.LiveConnectConfig(
    response_modalities=[types.Modality.AUDIO],
    system_instruction=types.Content(
        parts=[types.Part(text="You are a helpful assistant.")]
    )
)

async with client.aio.live.connect(model="gemini-3.8-live", config=config) as session:
    pass  # Session is active
```

#### JavaScript
```js
const session = await ai.live.connect({
  model: 'gemini-3.8-live',
  config: {
    responseModalities: ['audio'],
    systemInstruction: { parts: [{ text: 'You are a helpful assistant.' }] }
  },
  callbacks: {
    onopen: () => console.log('Connected'),
    onmessage: (response) => console.log('Message:', response),
    onerror: (error) => console.error('Error:', error),
    onclose: () => console.log('Closed')
  }
});
```

### Sending Text

#### Python
```python
await session.send_realtime_input(text="Hello, how are you?")
```

#### JavaScript
```js
session.sendRealtimeInput({ text: 'Hello, how are you?' });
```

### Sending Audio

#### Python
```python
await session.send_realtime_input(
    audio=types.Blob(data=chunk, mime_type="audio/pcm;rate=16000")
)
```

#### JavaScript
```js
session.sendRealtimeInput({
  audio: { data: chunk.toString('base64'), mimeType: 'audio/pcm;rate=16000' }
});
```

### Sending Video

#### Python
```python
# frame: raw JPEG-encoded bytes
await session.send_realtime_input(
    video=types.Blob(data=frame, mime_type="image/jpeg")
)
```

#### JavaScript
```js
session.sendRealtimeInput({
  video: { data: frame.toString('base64'), mimeType: 'image/jpeg' }
});
```

### Receiving Audio and Text

> [!IMPORTANT]  
> A single server event can contain **multiple content parts simultaneously** (e.g., audio chunks and transcript). Always process **all** parts in each event to avoid missing content.

#### Python
```python
async for response in session.receive():
    content = response.server_content
    if content:
        # Audio — process ALL parts in each event
        if content.model_turn:
            for part in content.model_turn.parts:
                if part.inline_data:
                    audio_data = part.inline_data.data
        # Transcription
        if content.input_transcription:
            print(f"User: {content.input_transcription.text}")
        if content.output_transcription:
            print(f"Gemini: {content.output_transcription.text}")
        # Interruption
        if content.interrupted is True:
            pass  # Stop playback, clear audio queue
```

#### JavaScript
```js
// Inside the onmessage callback
const content = response.serverContent;
if (content?.modelTurn?.parts) {
  for (const part of content.modelTurn.parts) {
    if (part.inlineData) {
      const audioData = part.inlineData.data; // Base64 encoded
    }
  }
}
if (content?.inputTranscription) console.log('User:', content.inputTranscription.text);
if (content?.outputTranscription) console.log('Gemini:', content.outputTranscription.text);
if (content?.interrupted) { /* Stop playback, clear audio queue */ }
```

---

## Background Reasoning (Extended Thinking)

Use `gemini-3.8-live-extended-thinking` when your voice agent must evaluate complex data, plan multiple steps, or handle long-running tools. The model speaks natural conversational fillers (e.g. *"Checking flight options now..."*) while executing asynchronous tools in the background.

Key requirements:
- **Thinking config**: Set `thinking_config=types.ThinkingConfig(thinking_level="low")` (`"minimal"` | `"low"` | `"medium"` | `"high"`).
- **Non-blocking tools**: All function declarations **must** set `behavior="NON_BLOCKING"`. Synchronous blocking mode is not supported and returns an error.
- **Lifecycle tracking (`interaction_status`)**: Do **not** rely on `turn_complete=True` alone to detect turn completion. Monitor `message.interaction_status` (Python) / `message.interactionStatus` (JS):
  - `"IN_PROGRESS"`: Server is reasoning, speaking conversational fillers, or waiting for async tool responses.
  - `"IDLE"`: Server has completed all background reasoning and tool calls; session is ready for user input.

See [`references/migration.md`](references/migration.md) and the [Thinking in Live API Guide](https://ai.google.dev/gemini-api/docs/live-api/thinking.md.txt) for complete Python and JavaScript implementation examples.

---

## Live Translation (Gemini Live Translate)

The Live API supports real-time, low-latency streaming translation of speech (audio) across 70+ languages. For full details on options and capabilities, see the [Live Translate Guide](https://ai.google.dev/gemini-api/docs/live-api/live-translate.md.txt).

### Model
- `gemini-3.5-live-translate-preview` — The recommended translation model for all Live Translate use cases.

### Configuration (`TranslationConfig`)

To enable translation, specify a `TranslationConfig` object inside your live session setup:

- **Python SDK**: Configure the connection using `translation_config` on `LiveConnectConfig`:
  ```python
  config = types.LiveConnectConfig(
      response_modalities=[types.Modality.AUDIO],
      translation_config=types.TranslationConfig(
          target_language_code="es",  # Target language code (e.g. es, fr, pl)
          echo_target_language=True,
      ),
      input_audio_transcription=types.AudioTranscriptionConfig(),
      output_audio_transcription=types.AudioTranscriptionConfig(),
  )
  ```
- **Raw WebSockets**: Place `translationConfig` inside `generationConfig`:
  ```json
  {
    "setup": {
      "model": "models/gemini-3.5-live-translate-preview",
      "generationConfig": {
        "responseModalities": ["AUDIO"],
        "translationConfig": {
          "targetLanguageCode": "es",
          "echoTargetLanguage": true
        }
      }
    }
  }
  ```

---

## Live Streaming Transcription (Gemini Live Transcribe)

The Live API supports real-time streaming speech-to-text over WebSockets with low-latency interim hypotheses, finalized transcripts, and Hybrid VAD. For full details, see the [Live Transcription Guide](https://ai.google.dev/gemini-api/docs/live-api/live-transcribe.md.txt) and [Colab Cookbook](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_started_transcribe.ipynb).

### Model
- `gemini-3.5-transcribe-live`

### Modes
- `smart`: cleans up filler words, resolves inline self-corrections, and structures formatting.
- `verbatim` (default): exact word-for-word transcript.

### Python
```python
config = types.LiveConnectConfig(
    response_modalities=["TEXT"],
    input_audio_transcription=types.AudioTranscriptionConfig(),
)

async with client.aio.live.connect(model="gemini-3.5-transcribe-live", config=config) as session:
    # Stream audio
    await session.send_realtime_input(audio=types.Blob(data=chunk, mime_type="audio/pcm;rate=16000"))
    # Hybrid VAD: notify turn end on client-detected silence for zero latency
    await session.send_realtime_input(audio_stream_end=True)
```

### JavaScript
```javascript
const session = await ai.live.connect({
  model: 'gemini-3.5-transcribe-live',
  config: {
    responseModalities: ['text'],
    inputAudioTranscription: { mode: 'smart' }
  },
  callbacks: {
    onmessage: (msg) => {
      if (msg.serverContent?.interimInputTranscription) {
        console.log('Interim:', msg.serverContent.interimInputTranscription.text);
      }
      if (msg.serverContent?.inputTranscription) {
        console.log('Final:', msg.serverContent.inputTranscription.text);
      }
    }
  }
});

session.sendRealtimeInput({ audio: { data: chunkBase64, mimeType: 'audio/pcm;rate=16000' } });
session.sendRealtimeInput({ audioStreamEnd: true }); // Hybrid VAD
```

### Raw WebSockets
```json
{
  "setup": {
    "model": "models/gemini-3.5-transcribe-live",
    "generationConfig": {
      "responseModalities": ["TEXT"],
      "speechConfig": {
        "voiceConfig": {}
      }
    },
    "inputAudioTranscription": {
      "mode": "smart"
    }
  }
}
```

---

## Limitations

- **Response modality** — Only `TEXT` **or** `AUDIO` per session, not both. Native audio models output audio (`response_modalities=["AUDIO"]`); enable `output_audio_transcription` if you need text transcripts.
- **Audio-only session** — 15 min without compression
- **Audio+video session** — 2 min without compression
- **Connection lifetime** — ~10 min (use session resumption)
- **Context window** — 128k input tokens / 64k output tokens
- **Code execution / URL context** — Not supported

## Upgrading & Migration

For step-by-step migration checklists and protocol deltas when upgrading from `gemini-3.1-flash-live-preview`, `gemini-2.5-flash-native-audio-*`, or `gemini-2.0-flash-live-001` to **Gemini 3.8 Live** or **Gemini 3.8 Live Extended Thinking**, read [`references/migration.md`](references/migration.md).

## Best Practices

1. **Use headphones** when testing mic audio to prevent echo/self-interruption
2. **Enable context window compression** for sessions longer than 15 minutes
3. **Implement session resumption** to handle connection resets gracefully
4. **Use ephemeral tokens** for client-side deployments — never expose API keys in browsers
5. **Use `send_realtime_input`** for real-time user input (audio, video, text). Use `send_client_content` with explicit `user`/`model` roles to inject context turns mid-stream
6. **Send `audioStreamEnd` / `audio_stream_end`** (Hybrid VAD) when the mic is paused or user finishes speaking
7. **Clear audio playback queues** on interruption signals (`interrupted: true`)
8. **Process all parts** in each server event — events can contain multiple content parts
9. **Monitor `interaction_status`** (`IN_PROGRESS` vs `IDLE`) when using `gemini-3.8-live-extended-thinking` rather than relying on `turn_complete` alone

## Documentation Lookup

### When MCP is Installed (Preferred)

If the **`gemini_search_docs`** tool (or **`search_docs`**) is available, use it as your **only** documentation source:

1. Call `gemini_search_docs` with your query (or use `gemini_get_doc` to retrieve a specific doc path)
2. Read the returned documentation
3. **Trust MCP results** as source of truth for API details — they are always up-to-date.

> [!IMPORTANT]  
> When MCP tools are present, **never** fetch URLs manually. MCP provides up-to-date, indexed documentation that is more accurate and token-efficient than URL fetching.

### When MCP is NOT Installed (Fallback Only)

If no MCP documentation tools are available, fetch from the official docs index:

**llms.txt URL**: `https://ai.google.dev/gemini-api/docs/llms.txt`

This index contains links to all documentation pages in `.md.txt` format. Use web fetch tools to:

1. Fetch `llms.txt` to discover available documentation pages
2. Fetch specific pages (e.g., `https://ai.google.dev/gemini-api/docs/live-session.md.txt`)

### Key Documentation Pages

> [!IMPORTANT]  
> Those are not all the documentation pages. Use the `llms.txt` index to discover available documentation pages

- [Live API Overview](https://ai.google.dev/gemini-api/docs/live.md.txt) — getting started, raw WebSocket usage
- [Thinking in Live API](https://ai.google.dev/gemini-api/docs/live-api/thinking.md.txt) — background reasoning, conversational fillers, interaction_status, non-blocking tools
- [Model Card: Gemini 3.8 Live](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-live) — default low-latency voice agent model & migration guide
- [Model Card: Gemini 3.8 Live Extended Thinking](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-live-extended-thinking) — high-reasoning voice model & upgrading guide
- [Live Transcription](https://ai.google.dev/gemini-api/docs/live-api/live-transcribe.md.txt) — real-time speech-to-text, interim hypotheses, smart formatting, and Hybrid VAD
- [Live Translate](https://ai.google.dev/gemini-api/docs/live-api/live-translate.md.txt) — configuration options and capabilities for translation
- [Live API Capabilities Guide](https://ai.google.dev/gemini-api/docs/live-guide.md.txt) — voice config, transcription config, VAD configuration, media resolution
- [Live API Tool Use](https://ai.google.dev/gemini-api/docs/live-tools.md.txt) — function calling (sync and async), Google Search grounding
- [Session Management](https://ai.google.dev/gemini-api/docs/live-session.md.txt) — context window compression, session resumption, GoAway signals
- [Ephemeral Tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens.md.txt) — secure client-side authentication for browser/mobile
- [WebSockets API Reference](https://ai.google.dev/api/live.md.txt) — raw WebSocket protocol details
- [Migration & Upgrading Guide](references/migration.md) — step-by-step checklists and code examples for Gemini 3.8 Live and Extended Thinking

## Supported Languages

The Live API supports 70 languages including: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Hindi, Arabic, Russian, and many more. Native audio models automatically detect and switch languages.
