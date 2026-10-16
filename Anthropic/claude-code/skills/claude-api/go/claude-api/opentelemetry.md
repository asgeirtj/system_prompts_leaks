# OpenTelemetry Tracing - Go

Code for the steps in `shared/opentelemetry.md`. Read that file first: it covers what to check before adding tracing, the install table, the option table, content modes, API tracing and its destinations, and the span reference.

## Register a tracer provider

This example prints each span to the console. Register the tracer provider before the first call that should be traced.

```go
exporter, err := stdouttrace.New(stdouttrace.WithPrettyPrint())
if err != nil {
    panic(err)
}
provider := sdktrace.NewTracerProvider(sdktrace.WithSyncer(exporter))
defer provider.Shutdown(ctx)
otel.SetTracerProvider(provider)
// OpenTelemetry for Go registers no propagator by default; without this the
// SDK sends no traceparent header and API spans cannot join the trace.
otel.SetTextMapPropagator(propagation.TraceContext{})

client := anthropic.NewClient()
```

Go imports: `go.opentelemetry.io/otel`, `go.opentelemetry.io/otel/exporters/stdout/stdouttrace`, `go.opentelemetry.io/otel/propagation`, and `sdktrace "go.opentelemetry.io/otel/sdk/trace"`.

## Configure the SDK

```go
client := anthropic.NewClient(
    option.WithTracerProvider(provider),
    option.WithOpenTelemetryTracesContentMode(option.OpenTelemetryContentModeContent),
)
quietClient := anthropic.NewClient(option.WithoutOpenTelemetry())

// Conversation ID as a request option of one call.
message, err := client.Messages.New(ctx, params, option.WithOpenTelemetryConversationID("conv_42"))
```

## Connect API spans to your own traces

Call the SDK from inside one of your own spans, so your span contains the SDK span, which contains the API span.

```go
ctx, span := otel.Tracer("my-service").Start(ctx, "summarize_issues")
defer span.End()
// ... pass this ctx to the SDK call ...
```

Without the SDK (raw HTTP or another client), inject the active span's trace context into the request headers:

`propagation.TraceContext{}.Inject(ctx, propagation.HeaderCarrier(req.Header))`
