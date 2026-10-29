# LCP Debugging Snippets

Use these JavaScript snippets with the `evaluate_script` tool to extract deep insights from the page.

## 1. Identify LCP Element

Use this snippet to identify the LCP element and get raw timing data from the Performance API.

```javascript
async () => {
  return await new Promise(resolve => {
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      resolve({
        element: last.element?.tagName,
        id: last.element?.id,
        className: last.element?.className,
        url: last.url,
        startTime: last.startTime,
        renderTime: last.renderTime,
        loadTime: last.loadTime,
        size: last.size,
      });
    }).observe({type: 'largest-contentful-paint', buffered: true});
  });
};
```

## 2. Audit Common Issues

Use this snippet to check for common DOM-based LCP issues (lazy loading, priority).

```javascript
() => {
  const issues = [];

  // Check for lazy-loaded images in viewport
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      issues.push({
        issue: 'lazy-loaded image in viewport',
        element: img.outerHTML.substring(0, 200),
        fix: 'Remove loading="lazy" from this image — it is in the initial viewport and may be the LCP element',
      });
    }
  });

  // Check for LCP-candidate images missing fetchpriority
  document.querySelectorAll('img:not([fetchpriority])').forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.width * rect.height > 50000) {
      issues.push({
        issue: 'large viewport image without fetchpriority',
        element: img.outerHTML.substring(0, 200),
        fix: 'Add fetchpriority="high" to this image — it is large and visible in the initial viewport',
      });
    }
  });

  // Check for render-blocking scripts in head
  document
    .querySelectorAll(
      'head script:not([async]):not([defer]):not([type="module"])',
    )
    .forEach(script => {
      if (script.src) {
        issues.push({
          issue: 'render-blocking script in head',
          element: script.outerHTML.substring(0, 200),
          fix: 'Add async or defer attribute, or move to end of body',
        });
      }
    });

  return {issueCount: issues.length, issues};
};
```
