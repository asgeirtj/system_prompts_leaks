# Browser agent support (WebMCP)

WebMCP makes the page's existing actions and state directly available as tools for browser agents. It is optional: add it when this materially helps the requested workflow; interactivity alone does not require it.

Register tools client-side through `document.modelContext`; they are available only while the page is open. ChatGPT supports the imperative registration API; feature-detect it for other browsers. Add tools after the initial implementation, without delaying the first meaningful preview.

## Register Real Actions

Register tools once in the client lifecycle and use an `AbortSignal` for cleanup. Each tool has a stable `name`, a description, a JSON Schema `inputSchema`, and an `execute` function; `title` and `annotations` are optional. Use the project's WebMCP types when available, or this minimal registration type:

```ts
type WebMcpRegistry = {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      execute(input: unknown): unknown | Promise<unknown>;
    },
    options?: { signal?: AbortSignal },
  ): void | Promise<void>;
};
```

The example uses application helpers with these signatures; implement them through the same validation, action, and state update used by the visible interface:

```ts
declare function validateInput(input: unknown): { id: string };
declare function completeTask(input: { id: string }): Promise<{ id: string }>;
declare function reportRegistrationError(error: unknown): void;
```

Inside the client lifecycle:

```ts
const registry = typeof document === "undefined" ? undefined :
  (document as Document & { readonly modelContext?: WebMcpRegistry }).modelContext;
if (typeof registry?.registerTool !== "function") return;
const lifecycle = new AbortController();

try {
  void Promise.resolve(registry.registerTool({
    name: "complete_task",
    description: "Mark the selected task complete.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
    async execute(input: unknown) {
      const task = await completeTask(validateInput(input));
      return { id: task.id, completed: true };
    },
  }, { signal: lifecycle.signal })).catch(reportRegistrationError);
} catch (error) {
  reportRegistrationError(error);
}
return () => lifecycle.abort();
```

Validate runtime input even when `inputSchema` is present. Return concise JSON-serializable results after the action and visible state finish updating. Tool registration failures should leave the ordinary interface usable. Prefer batched actions where useful, and do not add speculative tools.

Names must distinguish opening or preparing a flow from completing its action. `readOnlyHint` describes tools that do not modify state; `untrustedContentHint` marks external or user-generated output. These annotations are hints, not authorization controls.

## Verify

Use the selected [environment](../SKILL.md) for browser access. In a supported WebMCP context, confirm registration, call a tool with valid input, and read back the resulting application state. Check an invalid input or expected failure without corrupting state. Source inspection, builds, and UI clicks alone do not verify the WebMCP interface.

If no permitted, supported browser context is available, report WebMCP verification as unavailable. Block publishing only when the user explicitly requested WebMCP support; otherwise continue.
