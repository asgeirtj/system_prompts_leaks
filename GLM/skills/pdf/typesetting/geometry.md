# Geometric Anchors

> Create sophisticated visual anchors from the simplest geometric shapes.

---

## What Are Visual Anchors

Visual anchors are **non-functional decorative elements** on a page, used to:
- Break the flatness of text-only / data-only layouts
- Establish a visual center of gravity on the page
- Convey abstract qualities and design intent
- Fill large whitespace areas without adding information noise

**Key principle: Anchors don't need to "look like" anything concrete. The more abstract, the more refined.**

---

## Basic Shape Vocabulary

| Shape | SVG | Mood / Character |
|-------|-----|-----------------|
| Circle | `<circle>` | Wholeness, inclusivity, softness |
| Semicircle | `<path d="M0,50 A50,50 0 0,1 100,50">` | Rising, gradual, metaphorical |
| Triangle | `<polygon>` | Direction, sharpness, modern |
| Rectangle | `<rect>` | Stability, order, architectural |
| Line | `<line>` | Connection, guidance, minimalism |
| Arc | `<path>` + Bézier | Flow, elegance, organic |

---

## Composition Patterns

### Pattern 1: Offset Stacking

Multiple identical shapes, slightly offset, rotated, with decreasing opacity.

```svg
<svg width="120" height="120" viewBox="0 0 120 120" fill="none">
  <!-- Three offset circles -->
  <circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="0.6" opacity="0.15"/>
  <circle cx="60" cy="55" r="35" stroke="currentColor" stroke-width="0.6" opacity="0.25"/>
  <circle cx="70" cy="60" r="35" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>
</svg>
```

**Key points**: Same shape, 3 layers, opacity 0.15 → 0.25 → 0.4, offset 10-15px

### Pattern 2: Scale Contrast

One large shape + a few small shapes as accents.

```svg
<svg width="150" height="150" viewBox="0 0 150 150" fill="none">
  <circle cx="60" cy="60" r="50" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
  <circle cx="115" cy="30" r="8" fill="currentColor" opacity="0.6"/>
  <circle cx="105" cy="50" r="3" fill="currentColor" opacity="0.3"/>
  <circle cx="125" cy="45" r="2" fill="currentColor" opacity="0.2"/>
</svg>
```

**Key points**: Large circle stroke-only (hollow), small circles filled (solid), creating solid-void contrast

### Pattern 3: Grid Intersection

Lines + dots forming nodes at intersections.

```svg
<svg width="100" height="100" viewBox="0 0 100 100" fill="none">
  <line x1="20" y1="0" x2="20" y2="100" stroke="currentColor" stroke-width="0.3" opacity="0.1"/>
  <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" stroke-width="0.3" opacity="0.1"/>
  <line x1="80" y1="0" x2="80" y2="100" stroke="currentColor" stroke-width="0.3" opacity="0.1"/>
  <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" stroke-width="0.3" opacity="0.1"/>
  <line x1="0" y1="70" x2="100" y2="70" stroke="currentColor" stroke-width="0.3" opacity="0.1"/>
  <!-- Intersection points -->
  <circle cx="50" cy="30" r="3" fill="currentColor" opacity="0.5"/>
  <circle cx="20" cy="70" r="2" fill="currentColor" opacity="0.3"/>
  <circle cx="80" cy="70" r="4" fill="currentColor" opacity="0.15"/>
</svg>
```

### Pattern 4: Arc Flow

Bézier curves + endpoint circles, expressing organic flow.

```svg
<svg width="200" height="100" viewBox="0 0 200 100" fill="none">
  <path d="M10,80 C50,10 150,10 190,80" stroke="currentColor" stroke-width="0.6" opacity="0.25"/>
  <path d="M10,85 C60,20 140,20 190,85" stroke="currentColor" stroke-width="0.4" opacity="0.15"/>
  <circle cx="10" cy="80" r="2.5" fill="currentColor" opacity="0.4"/>
  <circle cx="190" cy="80" r="2.5" fill="currentColor" opacity="0.4"/>
</svg>
```

### Pattern 5: Geometric Collage

Intentional combination of different shapes, like an architectural plan.

```svg
<svg width="120" height="120" viewBox="0 0 120 120" fill="none">
  <!-- Rectangular frame -->
  <rect x="10" y="10" width="60" height="60" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
  <!-- Circle breaking the straight lines -->
  <circle cx="70" cy="70" r="30" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
  <!-- Diagonal line cutting through -->
  <line x1="10" y1="10" x2="100" y2="100" stroke="currentColor" stroke-width="0.3" opacity="0.15"/>
  <!-- Small solid triangle as focal point -->
  <polygon points="85,20 95,40 75,40" fill="currentColor" opacity="0.4"/>
</svg>
```

---

## Placement Guide

| Context | Recommended Position | Recommended Size | Pattern |
|---------|---------------------|-----------------|---------|
| Cover | Top-right / bottom-left offset | 120-200px | Offset Stacking, Geometric Collage |
| Chapter divider | Page center | 80-120px | Scale Contrast, Arc Flow |
| Header / footer decoration | Corners | 30-50px | Small offset, single circle + line |
| Whitespace fill | Alongside content | 60-100px | Grid Intersection |

---

## Color Rules

- Anchor color = document primary color from `palette.cascade` output (`--c-accent` or `--c-text`)
- **Use only one color**, layer via opacity (0.1 → 0.5)
- Strokes over fills (solid elements ≤ 30% of total shapes)
- stroke-width range: 0.3-0.8px (ultra-thin lines = refined look)
- **⚠️ All SVG examples below use `currentColor` as placeholder.** When generating actual SVG, replace with the document's primary color from the palette system. NEVER copy `currentColor` literally into production SVG — substitute the actual hex value.

---

## Forbidden

- ❌ Figurative icons (flowers, stars, arrows, or other concrete shapes)
- ❌ Mixing multiple colors
- ❌ Over-complexity (more than 8 shape elements)
- ❌ Symmetric / centered placement (offset creates tension)
- ❌ Thick lines (> 1.5px looks heavy)
- ❌ Shadows / glow effects
