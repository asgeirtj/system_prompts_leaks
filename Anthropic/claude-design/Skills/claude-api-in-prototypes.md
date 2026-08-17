# Claude API in prototypes

Your HTML artifacts can call Claude via a built-in helper. No SDK or API key needed.

```html
<script>
(async () => {
  const text = await window.claude.complete("Summarize this: ...");
  // or with a messages array:
  const text2 = await window.claude.complete({
    messages: [{ role: 'user', content: '...' }],
  });
})();
</script>
```

Calls default to `claude-haiku-4-5` with a 1024-token output cap. The body may also set `model` (haiku/sonnet families only), `max_tokens` (up to 32000), `system`, `tool_choice`, and client `tools` — standard Messages API shapes, except each tool also carries `run: async (input) => string` and the helper executes tool calls in-page and loops (max 8 model calls), resolving with the final text. Handler throws become is_error tool_results. Server tools (web search etc.) are rejected; no streaming; rate-limited 15 calls/minute per user, loop iterations included. Shared artifacts run under the viewer's quota.
