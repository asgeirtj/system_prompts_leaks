# OpenTelemetry Tracing - PHP

Code for the steps in `shared/opentelemetry.md`. Read that file first: it covers what to check before adding tracing, the install table, the option table, content modes, API tracing and its destinations, and the span reference.

## Register a tracer provider

This example prints each span to the console. Register the tracer provider before the first call that should be traced.

```php
use Anthropic\Client;
use OpenTelemetry\API\Trace\Propagation\TraceContextPropagator;
use OpenTelemetry\SDK\Sdk;
use OpenTelemetry\SDK\Trace\SpanExporter\ConsoleSpanExporterFactory;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$tracerProvider = new TracerProvider(
    new SimpleSpanProcessor((new ConsoleSpanExporterFactory())->create()),
);
Sdk::builder()
    ->setTracerProvider($tracerProvider)
    // Built in code, OpenTelemetry for PHP registers no propagator either.
    ->setPropagator(TraceContextPropagator::getInstance())
    ->buildAndRegisterGlobal();

$client = new Client();
```

## Configure the SDK

```php
// Use a specific tracer provider and record content.
$client = new Client(
    openTelemetry: ['tracerProvider' => $tracerProvider, 'traces' => ['contentMode' => 'content']],
);

// Turn spans off for one client.
$quietClient = new Client(openTelemetry: false);

// Set a conversation ID in the request options of one call.
$message = $client->messages->create(
    maxTokens: 1024,
    messages: [['role' => 'user', 'content' => 'Hello, Claude']],
    model: 'claude-opus-5-5',
    requestOptions: ['openTelemetry' => ['conversationId' => 'conv_42']],
);
```

## Connect API spans to your own traces

Call the SDK from inside one of your own spans, so your span contains the SDK span, which contains the API span.

```php
use OpenTelemetry\API\Globals;

$tracer = Globals::tracerProvider()->getTracer('my-service');
$span = $tracer->spanBuilder('summarize_issues')->startSpan();
$scope = $span->activate();

try {
    $client->beta->sessions->events->send(
        $session->id,
        events: [
            [
                'type' => 'user.message',
                'content' => [['type' => 'text', 'text' => 'Summarize the open issues']],
            ],
        ],
    );
} finally {
    $scope->detach();
    $span->end();
}
```

Without the SDK (raw HTTP or another client), inject the active span's trace context into the request headers:

`TraceContextPropagator::getInstance()->inject($headers)`
