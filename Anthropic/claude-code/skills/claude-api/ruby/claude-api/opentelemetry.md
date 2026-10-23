# OpenTelemetry Tracing - Ruby

Code for the steps in `shared/opentelemetry.md`. Read that file first: it covers what to check before adding tracing, the install table, the option table, content modes, API tracing and its destinations, and the span reference.

## Register a tracer provider

This example prints each span to the console. Register the tracer provider before the first call that should be traced.

```ruby
require "anthropic"
require "opentelemetry/sdk"

OpenTelemetry::SDK.configure do |config|
  config.add_span_processor(
    OpenTelemetry::SDK::Trace::Export::SimpleSpanProcessor.new(
      OpenTelemetry::SDK::Trace::Export::ConsoleSpanExporter.new
    )
  )
end

client = Anthropic::Client.new
```

## Configure the SDK

```ruby
client = Anthropic::Client.new(open_telemetry: {tracer_provider: OpenTelemetry.tracer_provider, traces: {content_mode: :content}})
quiet_client = Anthropic::Client.new(open_telemetry: false)

message = client.messages.create(
  model: "claude-opus-5-5",
  max_tokens: 1024,
  messages: [{role: "user", content: "Hello, Claude"}],
  request_options: {open_telemetry: {conversation_id: "conv_42"}}
)
```

## Connect API spans to your own traces

Call the SDK from inside one of your own spans, so your span contains the SDK span, which contains the API span.

```ruby
tracer.in_span("summarize_issues") do
  # ... send the session event ...
end
```

The Ruby method for sending session events is `client.beta.sessions.events.send_`.

Without the SDK (raw HTTP or another client), inject the active span's trace context into the request headers:

`OpenTelemetry::Trace::Propagation::TraceContext.text_map_propagator.inject(headers)`

After the SDK setup, offer setting up Claude API tracing where `shared/opentelemetry.md` -> SDK tracing vs API tracing says to, if you didn't already.
