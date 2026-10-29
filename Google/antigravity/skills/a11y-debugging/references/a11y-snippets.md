# Accessibility Debugging Snippets

Use these JavaScript snippets with the `evaluate_script` tool.

## 1. Find Orphaned Form Inputs

Finds form inputs that lack an associated label (no `label[for]`, `aria-label`, `aria-labelledby`, or wrapping `<label>`).

```js
() =>
  Array.from(document.querySelectorAll('input, select, textarea'))
    .filter(i => {
      const hasId = i.id && document.querySelector(`label[for="${i.id}"]`);
      const hasAria =
        i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
      return !hasId && !hasAria && !i.closest('label');
    })
    .map(i => ({
      tag: i.tagName,
      id: i.id,
      name: i.name,
      placeholder: i.placeholder,
    }));
```

## 2. Measure Tap Target Size

Returns the bounding box dimensions of an element. Pass the element's `uid` from the snapshot as an argument to `evaluate_script`.

```js
el => {
  const rect = el.getBoundingClientRect();
  return {width: rect.width, height: rect.height};
};
```

## 3. Check Color Contrast

Approximates the contrast ratio between an element's text color and background color. Pass the element's `uid` to test against WCAG AA (4.5:1 for normal text, 3:1 for large text).

**Note**: This uses a simplified algorithm and may not account for transparency, gradients, or background images. For production-grade auditing, consider injecting `axe-core`.

```js
el => {
  function getRGB(colorStr) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match
      ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
      : [255, 255, 255];
  }
  function luminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  const style = window.getComputedStyle(el);
  const fg = getRGB(style.color);
  let bg = getRGB(style.backgroundColor);

  const l1 = luminance(fg[0], fg[1], fg[2]);
  const l2 = luminance(bg[0], bg[1], bg[2]);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    color: style.color,
    bg: style.backgroundColor,
    contrastRatio: ratio.toFixed(2),
  };
};
```

## 4. Global Page Checks

Checks document-level accessibility settings often missed in component testing.

```js
() => ({
  lang:
    document.documentElement.lang ||
    'MISSING - Screen readers need this for pronunciation',
  title: document.title || 'MISSING - Required for context',
  viewport:
    document.querySelector('meta[name="viewport"]')?.content ||
    'MISSING - Check for user-scalable=no (bad practice)',
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'Enabled'
    : 'Disabled',
});
```
