# Verifying a server/API change

The handle is `curl` (or equivalent). The evidence is the response.

## Pattern

1. Start the server (background, with a readiness poll - see below)
2. `curl` the route the diff touches, with inputs that hit the changed branch
3. Capture the full response (status + headers + body)
4. Compare to expected

## Lifecycle

If there's a run-skill it handles this. If not:

```bash
<start-command> &> /tmp/server.log &
SERVER_PID=$!
for i in {1..30}; do curl -sf localhost:PORT/health >/dev/null && break; sleep 1; done
# ... your curls ...
kill $SERVER_PID
```

No readiness endpoint? Poll the route you're about to test until it
stops returning connection-refused, then add a beat.

## Worked example

**Diff:** adds a `Retry-After` header to 429 responses in `rateLimit.ts`.
**Claim (PR body):** "clients can now back off correctly."

**Inference:** hitting the rate limit should now return `Retry-After: <n>`
in the response headers. It didn't before.

**Plan:**
1. Start server
2. Hit the rate-limited endpoint enough times to trigger 429
3. Check the 429 response has `Retry-After` header
4. Check the value is a positive integer

**Execute:**
```bash
# trigger the limit - 10 fast requests, limit is 5/sec per the diff
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/api/thing; done
# -> 200 200 200 200 200 429 429 429 429 429

# capture the 429 headers
curl -si localhost:3000/api/thing | head -20
# -> HTTP/1.1 429 Too Many Requests
# -> Retry-After: 12
# -> ...
```

**Verdict:** PASS - `Retry-After: 12` present, positive integer.

## What FAIL looks like

- Header absent -> the diff didn't take effect, or you're not actually
  hitting the 429 path (check the status code first)
- Header present but value is `NaN` / `undefined` / negative -> the
  logic is wrong
- You got 200s all the way through -> you never triggered the changed
  path. Tighten the request burst or check the rate limit config.
