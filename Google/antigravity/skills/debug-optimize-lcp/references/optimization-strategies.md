# LCP Optimization Strategies

## 1. Eliminate Resource Load Delay

**Goal**: Ensure the LCP resource starts loading as early as possible.

- **Early Discovery**: Ensure the LCP resource is discoverable in the initial HTML document response (not dynamically added by JS or hidden in `data-src`).
- **Preload**: Use `<link rel="preload">` with `fetchpriority="high"` for critical images or fonts.
- **Avoid Lazy Loading**: Never set `loading="lazy"` on the LCP image.
- **Fetch Priority**: Use `fetchpriority="high"` on the `<img>` tag.
- **Same Origin**: Host critical resources on the same origin or use `<link rel="preconnect">`.

## 2. Eliminate Element Render Delay

**Goal**: Ensure the LCP element can render immediately after its resource has finished loading.

- **Minimize Render-Blocking CSS**: Inline critical CSS and defer non-critical CSS. Ensure the stylesheet is smaller than the LCP resource.
- **Minimize Render-Blocking JS**: Avoid synchronous scripts in the `<head>`. Inline very small scripts.
- **Server-Side Rendering (SSR)**: Deliver the full HTML markup from the server so image resources are discoverable immediately.
- **Break Up Long Tasks**: Prevent large JavaScript tasks from blocking the main thread during rendering.

## 3. Reduce Resource Load Duration

**Goal**: Reduce the time spent transferring the bytes of the resource.

- **Optimize Resource Size**: Serve optimal image sizes, use modern formats (AVIF, WebP), and compress images/fonts.
- **Geographic Proximity (CDN)**: Use a Content Delivery Network to get servers closer to users.
- **Reduce Contention**: Use `fetchpriority="high"` to prevent lower-priority resources from competing for bandwidth.
- **Caching**: Use efficient `Cache-Control` policies.

## 4. Reduce Time to First Byte (TTFB)

**Goal**: Deliver the initial HTML as quickly as possible.

- **Minimize Redirects**: Avoid multiple redirects from advertisements or shortened links.
- **CDN Caching**: Cache static HTML documents at the edge.
- **Edge Computing**: Move dynamic logic to the edge to avoid trips to the origin server.
- **Back/Forward Cache**: Ensure pages are eligible for bfcache.
