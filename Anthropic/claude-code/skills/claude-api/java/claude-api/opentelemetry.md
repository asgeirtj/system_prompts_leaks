# OpenTelemetry Tracing - Java

Code for the steps in `shared/opentelemetry.md`. Read that file first: it covers what to check before adding tracing, the install table, the option table, content modes, API tracing and its destinations, and the span reference.

## Register a tracer provider

This example prints each span to the console. Register the tracer provider before the first call that should be traced.

```java
var tracerProvider = SdkTracerProvider.builder()
    .addSpanProcessor(SimpleSpanProcessor.create(LoggingSpanExporter.create()))
    .build();
OpenTelemetrySdk.builder()
    .setTracerProvider(tracerProvider)
    // Built in code, OpenTelemetry for Java registers no propagator either.
    .setPropagators(ContextPropagators.create(W3CTraceContextPropagator.getInstance()))
    .buildAndRegisterGlobal();

var client = AnthropicOkHttpClient.fromEnv();
// ... make calls ...
tracerProvider.close();
```

## Configure the SDK

```java
// A client reads the environment variables only when built with fromEnv(). The system
// properties anthropic.openTelemetry, anthropic.openTelemetryTracesContentMode and
// anthropic.openTelemetryTracesMaxContentBytes take precedence over the environment.
// Start from OpenTelemetryOptions.fromEnv() to keep the options fromEnv() read.
var envOptions = OpenTelemetryOptions.fromEnv();
var client = AnthropicOkHttpClient.builder()
    .fromEnv()
    .openTelemetry(envOptions.toBuilder()
        .tracerProvider(tracerProvider)
        .traces(envOptions.traces().toBuilder()
            .contentMode(OpenTelemetryContentMode.CONTENT)
            .build())
        .build())
    .build();
var quietClient = AnthropicOkHttpClient.builder().fromEnv().openTelemetry(false).build();

// Conversation ID in the request options of one call.
var message = client.messages().create(params, RequestOptions.builder()
    .openTelemetry(OpenTelemetryRequestOptions.builder().conversationId("conv_42").build())
    .build());
```

## Connect API spans to your own traces

Call the SDK from inside one of your own spans, so your span contains the SDK span, which contains the API span.

```java
Span span = tracer.spanBuilder("summarize_issues").startSpan();
try (Scope scope = span.makeCurrent()) {
    // ... send the session event ...
} finally {
    span.end();
}
```

Without the SDK (raw HTTP or another client), inject the active span's trace context into the request headers:

`W3CTraceContextPropagator.getInstance().inject(Context.current(), requestBuilder, HttpRequest.Builder::header)`
