---
name: debug-optimize-lcp
description: Guides debugging and optimizing Largest Contentful Paint (LCP) using Chrome DevTools MCP tools. Use this skill whenever the user asks about LCP performance, slow page loads, Core Web Vitals optimization, or wants to understand why their page's main content takes too long to appear. Also use when the user mentions "largest contentful paint", "page load speed", "CWV", or wants to improve how fast their hero image or main content renders.
---

## What is LCP and why it matters

Largest Contentful Paint (LCP) measures how quickly a page's main content becomes visible. It's the time from navigation start until the largest image or text block renders in the viewport.

- **Good**: 2.5 seconds or less
- **Needs improvement**: 2.5–4.0 seconds
- **Poor**: greater than 4.0 seconds

LCP is a Core Web Vital that directly affects user experience and search ranking. On 73% of mobile pages, the LCP element is an image.

## LCP Subparts Breakdown

Every page's LCP breaks down into four sequential subparts with no gaps or overlaps. Understanding which subpart is the bottleneck is the key to effective optimization.

| Subpart                       | Ideal % of LCP | What it measures                               |
| ----------------------------- | -------------- | ---------------------------------------------- |
| **Time to First Byte (TTFB)** | ~40%           | Navigation start → first byte of HTML received |
| **Resource load delay**       | <10%           | TTFB → browser starts loading the LCP resource |
| **Resource load duration**    | ~40%           | Time to download the LCP resource              |
| **Element render delay**      | <10%           | LCP resource downloaded → LCP element rendered |

The "delay" subparts should be as close to zero as possible. If either delay subpart is large relative to the total LCP, that's the first place to optimize.

**Common Pitfall**: Optimizing one subpart (like compressing an image to reduce load duration) without checking others. If render delay is the real bottleneck, a smaller image won't help — the saved time just shifts to render delay.

## Debugging Workflow

Follow these steps in order. Each step builds on the previous one.

### Step 1: Record a Performance Trace

Navigate to the page, then record a trace with reload to capture the full page load including LCP:

1. `navigate_page` with `pageId` to the target URL.
2. `performance_start_trace` with `pageId`, `reload: true` and `autoStop: true`.

The trace results will include LCP timing and available insight sets. Note the insight set IDs from the output — you'll need them in the next step.

### Step 2: Analyze LCP Insights

Use `performance_analyze_insight` to drill into LCP-specific insights. Look for these insight names in the trace results:

- **LCPBreakdown** — Shows the four LCP subparts with timing for each.
- **DocumentLatency** — Server response time issues affecting TTFB.
- **RenderBlocking** — Resources blocking the LCP element from rendering.
- **LCPDiscovery** — Whether the LCP resource was discoverable early.

Call `performance_analyze_insight` with `pageId`, the insight set ID, and the insight name from the trace results.

### Step 3: Identify the LCP Element

Use `evaluate_script` (with `pageId`) and the **"Identify LCP Element" snippet** found in [references/lcp-snippets.md](references/lcp-snippets.md) to reveal the LCP element's tag, resource URL, and raw timing data.

The `url` field tells you what resource to look for in the network waterfall. If `url` is empty, the LCP element is text-based (no resource to load).

### Step 4: Check the Network Waterfall

Use `list_network_requests` to see when the LCP resource loaded relative to other resources:

- Call `list_network_requests` with `pageId` filtered by `resourceTypes: ["Image", "Font"]` (adjust based on Step 3).
- Then use `get_network_request` with `pageId` and the LCP resource's request ID for full details.

**Key Checks:**

- **Start Time**: Compare against the HTML document and the first resource. If the LCP resource starts much later than the first resource, there's resource load delay to eliminate.
- **Duration**: A large resource load duration suggests the file is too big or the server is slow.

### Step 5: Inspect HTML for Common Issues

Use `evaluate_script` (with `pageId`) and the **"Audit Common Issues" snippet** found in [references/lcp-snippets.md](references/lcp-snippets.md) to check for lazy-loaded images in the viewport, missing fetchpriority, and render-blocking scripts.

## Optimization Strategies

After identifying the bottleneck subpart, apply these prioritized fixes.

### 1. Eliminate Resource Load Delay (target: <10%)

The most common bottleneck. The LCP resource should start loading immediately.

- **Root Cause**: LCP image loaded via JS/CSS, `data-src` usage, or `loading="lazy"`.
- **Fix**: Use standard `<img>` with `src`. **Never** lazy-load the LCP image.
- **Fix**: Add `<link rel="preload" fetchpriority="high">` if the image isn't discoverable in HTML.
- **Fix**: Add `fetchpriority="high"` to the LCP `<img>` tag.

### 2. Eliminate Element Render Delay (target: <10%)

The element should render immediately after loading.

- **Root Cause**: Large stylesheets, synchronous scripts in `<head>`, or main thread blocking.
- **Fix**: Inline critical CSS, defer non-critical CSS/JS.
- **Fix**: Break up long tasks blocking the main thread.
- **Fix**: Use Server-Side Rendering (SSR) so the element exists in initial HTML.

### 3. Reduce Resource Load Duration (target: ~40%)

Make the resource smaller or faster to deliver.

- **Fix**: Use modern formats (WebP, AVIF) and responsive images (`srcset`).
- **Fix**: Serve from a CDN.
- **Fix**: Set `Cache-Control` headers.
- **Fix**: Use `font-display: swap` if LCP is text blocked by a web font.

### 4. Reduce TTFB (target: ~40%)

The HTML document itself takes too long to arrive.

- **Fix**: Minimize redirects and optimize server response time.
- **Fix**: Cache HTML at the edge (CDN).
- **Fix**: Ensure pages are eligible for back/forward cache (bfcache).

## Verifying Fixes & Emulation

- **Verification**: Re-run the trace (`performance_start_trace` with `pageId` and `reload: true`) and compare the new subpart breakdown. The bottleneck should shrink.
- **Emulation**: Lab measurements differ from real-world experience. Use `emulate` to test under constraints:
  - `emulate` with `pageId`, `networkConditions: "Fast 3G"` and `cpuThrottlingRate: 4`.
  - This surfaces issues visible only on slower connections/devices.
