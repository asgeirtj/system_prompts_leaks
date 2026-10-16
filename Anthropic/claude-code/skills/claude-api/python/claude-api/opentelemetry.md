# OpenTelemetry Tracing - Python

Code for the steps in `shared/opentelemetry.md`. Read that file first: it covers what to check before adding tracing, the install table, the option table, content modes, API tracing and its destinations, and the span reference.

## Register a tracer provider

This example prints each span to the console. Register the tracer provider before the first call that should be traced.

```python
from anthropic import Anthropic
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor

provider = TracerProvider()
provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)

client = Anthropic()
message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}],
)
```

## Configure the SDK

```python
# Use a specific tracer provider and record content.
client = Anthropic(
    open_telemetry={"tracer_provider": provider, "traces": {"content_mode": "content"}}
)

# Turn spans off for one client.
quiet_client = Anthropic(open_telemetry=False)

# Conversation ID for one call. with_options() returns a copy of the client and
# REPLACES the whole option, so start from client.open_telemetry.
message = client.with_options(
    open_telemetry={**client.open_telemetry, "conversation_id": "conv_42"}
).messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}],
)
```

## Connect API spans to your own traces

Call the SDK from inside one of your own spans, so your span contains the SDK span, which contains the API span.

```python
from opentelemetry import trace

tracer = trace.get_tracer("my-service")

with tracer.start_as_current_span("summarize_issues"):
    client.beta.sessions.events.send(
        session.id,
        events=[{"type": "user.message", "content": [{"type": "text", "text": "Summarize the open issues"}]}],
    )
```

Without the SDK (raw HTTP or another client), inject the active span's trace context into the request headers:

```python
import os

from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

headers = {
    "x-api-key": os.environ["ANTHROPIC_API_KEY"],
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
}
TraceContextTextMapPropagator().inject(headers)  # adds traceparent for the active span
```
