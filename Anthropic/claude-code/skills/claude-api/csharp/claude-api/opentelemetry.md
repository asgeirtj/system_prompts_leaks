# OpenTelemetry Tracing - C#

Code for the steps in `shared/opentelemetry.md`. Read that file first: it covers what to check before adding tracing, the install table, the option table, content modes, API tracing and its destinations, and the span reference.

## Register a tracer provider

This example prints each span to the console. Register the tracer provider before the first call that should be traced.

```csharp
using Anthropic;
using Anthropic.Core;                      // OpenTelemetryContentMode
using System.Diagnostics;                  // ActivitySource, Activity (the later snippets)
using OpenTelemetry;
using OpenTelemetry.Context.Propagation;   // TraceContextPropagator, PropagationContext
using OpenTelemetry.Trace;

// The SDK emits its spans from the source com.anthropic.sdk.csharp. Add com.anthropic.sdk.csharp*
// instead to include the SDK's clients for cloud platforms.
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("com.anthropic.sdk.csharp")
    .AddConsoleExporter()
    .Build();

AnthropicClient client = new();
```

## Configure the SDK

```csharp
// Record content.
AnthropicClient client = new()
{
    OpenTelemetry = new() { Traces = new() { ContentMode = OpenTelemetryContentMode.Content } },
};

// Turn spans off for one client.
AnthropicClient quietClient = new() { OpenTelemetry = false };

// Set a conversation ID for the calls of one conversation.
var conversation = client.WithOptions(options => options with
{
    OpenTelemetryRequest = new() { ConversationId = "conv_42" },
});
var message = await conversation.Messages.Create(parameters);
```

There is no tracer-provider option in C#: the SDK's spans go to every tracer provider that adds the source `com.anthropic.sdk.csharp`.

## Connect API spans to your own traces

Call the SDK from inside one of your own spans, so your span contains the SDK span, which contains the API span.

```csharp
var source = new ActivitySource("MyService");

using (source.StartActivity("summarize_issues"))
{
    // parameters holds a user.message event.
    await client.Beta.Sessions.Events.Send(session.ID, parameters);
}
```

Add `"MyService"` to the tracer provider with `AddSource`, next to `com.anthropic.sdk.csharp`.

Without the SDK (raw HTTP or another client), inject the active span's trace context into the request headers:

`new TraceContextPropagator().Inject(new PropagationContext(Activity.Current?.Context ?? default, Baggage.Current), request, (carrier, key, value) => carrier.Headers.Add(key, value))`
