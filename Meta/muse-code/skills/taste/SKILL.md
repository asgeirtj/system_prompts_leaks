---
name: taste
description: Mandatory preflight for web frontend visual design. If available, call read_skill for bundled:taste before the first frontend create or edit tool call whenever creating or visually styling a human-viewed web page, component, app, dashboard, or interactive report. Do not load it for non-visual frontend logic or machine-only HTML. If unavailable, continue without warning. Negative constraints only; user requests and other explicit styles still win.
user-invocable: false
---

# Anti-Slop: Frontend DON'Ts

What NOT to do when designing a UI or page. This is a filter, not a style; it never prescribes a look. Stacking several of the below is what reads as AI-made on sight. Adaptive, so if the user or another skill asks for something specific, do that instead; these are defaults, not overrides.

- purple / indigo / violet accent, or a purple-to-blue hero gradient (the top AI tell)
- `bg-clip-text` gradient headline text
- cream (`#faf8f4`) as the whole-page background
- aurora blobs / glowing colored shadows, or an identical glow on every card
- Inter everywhere, or Geist / Space Grotesk / Instrument Serif / Roboto / Arial as your only identity
- gray-400 / gray-500 body text
- one font weight and size throughout (no hierarchy)
- tracked all-caps micro-kickers above every section
- centered hero of eyebrow pill + headline + two CTAs
- the identical 3-card feature grid with a lucide icon in a rounded square
- an 8+ word, 48px+ headline that says nothing
- bento grid for everything
- the same eyebrow-headline-3cards section repeated back to back
- `rounded-2xl`, or any single radius, on every element
- glassmorphism blur + border + shadow on every surface
- `hover:scale-105` lift on cards
- emoji as feature icons (🚀 ⚡ ✨ 🎯 💡)
- left-border accent cards, a colored border on a rounded element, or cards nested inside cards
- fade-up / slide-up on everything as it scrolls in
- motion that ignores `prefers-reduced-motion`
- scribbly hand-drawn SVG mascots with no purpose
