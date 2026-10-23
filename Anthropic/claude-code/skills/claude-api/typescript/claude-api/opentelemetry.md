# OpenTelemetry Tracing - TypeScript

Code for the steps in `shared/opentelemetry.md`. Read that file first: it covers what to check before adding tracing, the install table, the option table, content modes, API tracing and its destinations, and the span reference.

## Register a tracer provider

This example prints each span to the console. Register the tracer provider before the first call that should be traced.

```typescript
import Anthropic from "@anthropic-ai/sdk";
import {
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";

const provider = new NodeTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});
// register() also installs the context manager, which lets SDK spans nest under your spans.
provider.register();

const client = new Anthropic();
const message = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude" }],
});
```

## Configure the SDK

```typescript
const client = new Anthropic({
  openTelemetry: { tracerProvider: provider, traces: { contentMode: "content" } },
});
const quietClient = new Anthropic({ openTelemetry: false });

// Conversation ID in the request options of one call.
const message = await client.messages.create(
  { model: "claude-opus-5-5", max_tokens: 1024, messages: [{ role: "user", content: "Hello, Claude" }] },
  { openTelemetry: { conversationId: "conv_42" } },
);
```

## Connect API spans to your own traces

Call the SDK from inside one of your own spans, so your span contains the SDK span, which contains the API span.

```typescript
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("my-service");

await tracer.startActiveSpan("summarize_issues", async (span) => {
  try {
    await client.beta.sessions.events.send(session.id, {
      events: [{ type: "user.message", content: [{ type: "text", text: "Summarize the open issues" }] }],
    });
  } finally {
    span.end();
  }
});
```

Without the SDK (raw HTTP or another client), inject the active span's trace context into the request headers:

`new W3CTraceContextPropagator().inject(context.active(), headers, defaultTextMapSetter)` (`@opentelemetry/core`, `@opentelemetry/api`)

After the SDK setup, offer setting up Claude API tracing where `shared/opentelemetry.md` -> SDK tracing vs API tracing says to, if you didn't already.
