# Color Palette System

> Color is the skeleton of design. Unified, restrained, systematic. Garish = amateur.

---

## Cascade Palette System (V2 — Preferred)

The cascade palette enforces one iron law: **Area ∝ 1/Saturation**.  
The larger the colored area, the lower its saturation must be.

### Tier System

| Tier | Area % | S Cap | Roles |
|------|--------|-------|-------|
| **XL** | >50% | ≤ 0.08 | `page_bg`, `section_bg` |
| **L** | 20-50% | ≤ 0.15 | `card_bg`, `table_stripe` |
| **M** | 5-20% | ≤ 0.30 | `header_fill`, `cover_block` |
| **S** | 1-5% | ≤ 0.50 | `border`, `icon` |
| **XS** | <1% | ≤ 0.75 | `accent`, `accent_secondary` |

### How It Works

One base hue → 12 roles + 4 semantic colors. Cover, body, and charts all pull from the same palette:

```
palette.cascade
  ├── cover subset  (page_bg, header_fill, cover_block, accent, text_primary...)
  ├── body subset   (page_bg, section_bg, card_bg, table_stripe, border...)
  ├── chart subset  (accent as series_1, accent_secondary as series_2, ...)
  └── semantic      (success, warning, error, info — all low-sat)
```

No orphan colors. No "cover finished, now pick new colors for body" drift.

### Usage

```bash
# Via design_engine.py
python3 "$PDF_SKILL_DIR/scripts/design_engine.py" palette-cascade --intent cold --mode minimal

# Via pdf.py (auto-derives intent from title)
python3 "$PDF_SKILL_DIR/scripts/pdf.py" palette.cascade --title "2025年度报告" --format reportlab

# Formats: summary (default) | json | css | reportlab
```

### Output Formats

- **summary**: Human-readable table with tier/role/hex/saturation
- **json**: Full structured data (roles, cover, body, charts, semantic, meta)
- **css**: CSS custom properties ready for HTML/Playwright
- **reportlab**: Python code ready to paste into ReportLab scripts

---

## Core Iron Rules

### 1. One Document, One Color Family

**Not one color — one color family.**

- After choosing the primary color, all secondary, accent, and background colors must be derived from it
- Derivation methods: lightness shift, saturation shift, micro hue adjustment (within ±15°)
- **Forbidden** to have unrelated colors in the same document

```
Primary       → Headings, key data, primary buttons
Secondary     → Primary lightness ±15-25%
Accent        → Primary hue ±10-15°, for highlights/warnings
Neutral       → Gray series for body text, not conflicting with primary
Background    → Pure white / primary at opacity 3-8%
```

### 2. Color Count Limits

| Element Type | Max Colors | Notes |
|-------------|-----------|-------|
| Entire document | 4-5 | Primary + secondary + accent + neutral + background |
| Single component (card/table) | 2-3 | Don't give each card a different color |
| Charts / data visualization | Same-family gradient | Differentiate by opacity/lightness, not different hues |
| Tags / badges | 1 color + text color | No rainbow tags |

### 3. Absolutely Forbidden Color Fills

The following are automatic failures:

- ❌ 4 cards using 4 completely different colors (red/blue/green/purple)
- ❌ Alternating table rows in different colors (blue row/pink row)
- ❌ Rainbow-colored pie charts/bar charts
- ❌ Each section with a different theme color
- ❌ Gradient transitioning from warm to cool tones (red → blue)

---

## Color Generation Rules

### Deriving a Full Palette from Primary

```
Given primary H(hue) S(saturation) L(lightness):

Primary:         hsl(H, S, L)           — Headings, key elements
Dark variant:    hsl(H, S, L-15%)       — Hover, borders, icons
Light variant:   hsl(H, S-10%, L+25%)   — Tag backgrounds, light fills
Ultra-light bg:  hsl(H, S-20%, 96%)     — Section backgrounds, card base
Accent:          hsl(H+15, S, L)        — Warnings, highlights (micro hue shift)
```

### Example: Deriving from a primary color

> ⚠️ The hex values below are **examples only**. In production, use `palette.cascade` or `palette.generate` to compute the full palette from intent.

```css
:root {
  --c-primary:    #2d5a87;   /* Primary (from palette.cascade) */
  --c-primary-d:  #1e3d5c;   /* Dark variant */
  --c-primary-l:  #5a8ab8;   /* Light variant */
  --c-primary-bg: #f0f4f8;   /* Ultra-light background */
  --c-accent:     #2d6a87;   /* Accent (hue +10°) */
  --c-text:       #333;      /* Body text */
  --c-text-muted: #888;      /* Secondary text */
  --c-border:     #e0e4e8;   /* Border lines */
}
```

---

## Multi-Element Differentiation Strategies

When distinguishing multiple sibling elements (e.g., multiple cards, categories), **don't use different colors — use these approaches instead**:

### Strategy A: Same Hue, Different Lightness
```css
.card-1 { background: hsl(220, 40%, 95%); }  /* Lightest */
.card-2 { background: hsl(220, 40%, 90%); }
.card-3 { background: hsl(220, 40%, 85%); }
.card-4 { background: hsl(220, 40%, 80%); }  /* Darkest */
```

### Strategy B: Same Color, Different Opacity
```css
.item-1 { background: rgba(30, 58, 95, 0.06); }
.item-2 { background: rgba(30, 58, 95, 0.12); }
.item-3 { background: rgba(30, 58, 95, 0.18); }
.item-4 { background: rgba(30, 58, 95, 0.24); }
```

### Strategy C: Primary + Whitespace + Lines
```css
/* Differentiate by border color/weight/style, uniform white background */
.card-1 { border-left: 3px solid var(--primary); }
.card-2 { border-left: 3px solid var(--primary-l); }
.card-3 { border-left: 3px solid var(--primary-d); }
```

### Strategy D: Icons / Numbering (Not Color)
```css
/* All cards same color, differentiated by icons, numbers, or layout variation */
```

---

## Gradient Usage Rules

### Allowed Gradients
- **Same-family gradient**: `linear-gradient(135deg, var(--c-primary), var(--c-primary-l))` — hue difference < 20°
- **Lightness gradient**: `linear-gradient(180deg, #fff, #f5f5f5)` — pure lightness change
- **Primary to transparent**: `linear-gradient(90deg, var(--c-primary), transparent)` — for decorative lines

### Forbidden Gradients
- ❌ Warm-to-cool crossover: `linear-gradient(#ff6b6b, #4ecdc4)`
- ❌ More than 3 colors: `linear-gradient(red, yellow, green, blue)`
- ❌ Neon gradients: Any high-saturation gradient
- ❌ Gratuitous gradients: Gradients added purely for "looks nice" without purpose

---

## Preset Palettes (Ready to Use)

### Business Blue
```
#1a365d → #2a5298 → #4a7ac7 → #dce6f5 → #f5f8fc
```

### Warm Gray
```
#2d2d2d → #5a5a5a → #8a8a8a → #e8e8e8 → #f9f9f9
```

### Forest Green
```
#1a3c2a → #2d6b4a → #4a9a6a → #d5ead8 → #f2f8f4
```

### Terracotta Red
```
#5c2018 → #8a3828 → #b85a48 → #f0d8d0 → #faf4f2
```

### Indigo Purple
```
#2d1b4e → #4a2d7a → #6a4aaa → #ddd0f0 → #f5f2fa
```

---

## Quick Check

```
□ How many colors does the entire document use? (Target ≤ 5)
□ Can every color be traced back to the primary?
□ Are there any colors that "suddenly appear" without derivation?
□ Are sibling elements rainbow-colored?
□ Gradient endpoint hue difference < 20°?
□ If you remove all color and look at grayscale only, is the hierarchy still clear?
```
