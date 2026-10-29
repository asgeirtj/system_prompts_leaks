# Largest Contentful Paint (LCP) Breakdown

LCP measures the time from when the user initiates loading the page until the largest image or text block is rendered within the viewport. To provide a good user experience, sites should strive to have an LCP of 2.5 seconds or less for at least 75% of page visits.

## The Four Subparts of LCP

Every page's LCP consists of these four subcategories. There's no gap or overlap between them, and they add up to the full LCP time.

| LCP subpart                   | % of LCP (Optimal) | Description                                                                                                                                                              |
| ----------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Time to First Byte (TTFB)** | ~40%               | The time from when the user initiates loading the page until the browser receives the first byte of the HTML document response.                                          |
| **Resource load delay**       | <10%               | The time between TTFB and when the browser starts loading the LCP resource. If the LCP element doesn't require a resource load (e.g., system font text), this time is 0. |
| **Resource load duration**    | ~40%               | The duration of time it takes to load the LCP resource itself. If the LCP element doesn't require a resource load, this time is 0.                                       |
| **Element render delay**      | <10%               | The time between when the LCP resource finishes loading and the LCP element rendering fully.                                                                             |

## Why the Breakdown Matters

Optimizing for LCP requires identifying which of these subparts is the bottleneck:

- **Large delta between TTFB and FCP**: Indicates the browser needs to download a lot of render-blocking assets or complete a lot of work (e.g., client-side rendering).
- **Large delta between FCP and LCP**: Indicates the LCP resource is not immediately available for the browser to prioritize or the browser is completing other work before it can display the LCP content.
- **Large resource load delay**: Indicates the resource is not discoverable early or is deprioritized.
- **Large element render delay**: Indicates rendering is blocked by stylesheets, scripts, or long tasks.
