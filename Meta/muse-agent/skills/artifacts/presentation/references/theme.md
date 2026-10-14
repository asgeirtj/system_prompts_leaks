---
description: The theme JSON design system stored under ~/workspace/themes/, its schema, and how to generate or apply a theme.
---

# Theme schema and generation

A theme is a small JSON design system stored under `~/workspace/themes/`. The artifact builder's
theme decision lives in `/opt/hatch/skills/artifacts/pdf/references/visual.md`; read this file when generating or applying
a theme.

## Theme file schema

Each theme JSON has two blocks: `ui` (document styling) and `visual` (image-generation guidance). Example:

```json
{
  "name": "Paper & Ink", "mode": "light",
  "ui": {
    "colors": { "bg": "#FAF9F6", "surface": "#F5F0EB", "text": "#1A1A1A", "accent": "#3D3229", "textMuted": "#8B7355", "danger": "#9B2C2C", "success": "#16A34A", "warning": "#D97706" },
    "font": "Georgia, 'Times New Roman', serif", "fontSans": "system-ui, sans-serif",
    "radius": { "card": "6px", "button": "4px" },
    "shadows": { "md": "0 1px 3px rgba(61,50,41,.08)" },
    "notes": "Editorial, bookish. Uppercase headers, thin dividers, generous whitespace."
  },
  "visual": {
    "style": "1970s vintage film photography", "mood": "warm, nostalgic",
    "lighting": "golden hour", "palette": "warm golds, sun-bleached pastels",
    "texture": "35mm film grain", "references": "Slim Aarons",
    "orientation": "landscape", "filter": "contrast(1.05) saturate(0.85) sepia(0.1)"
  }
}
```

### `ui` block fields

| Field | Purpose |
|-------|---------|
| `colors` | Full palette: bg, surface, borders, text, accent, textMuted, and semantic colors (danger, success, warning) |
| `font` / `fontSans` / `fontMono` | Typography stacks for body, UI, and code |
| `fontWeight` | Weight mapping for headings, body, and labels |
| `radius` | Border-radius tokens per element type |
| `shadows` | Box-shadow tokens (or "none" for flat themes) |
| `notes` | Theme personality and special component patterns |

Maintain a 4.5:1 minimum contrast between text and background.

### `visual` block fields

| Field | Purpose | Examples |
|-------|---------|---------|
| `style` | Art direction | "3D Pixar render", "watercolor", "vintage film" |
| `mood` | Emotional tone | "cozy and warm", "dark and mysterious" |
| `lighting` | Light direction | "golden hour", "dramatic chiaroscuro" |
| `palette` | Image color guidance | "jewel tones", "neon on black" |
| `texture` | Surface quality | "clean digital", "film grain" |
| `references` | Style references | "Wes Anderson", "Studio Ghibli" |
| `orientation` | Default image orientation | "landscape", "square", "vertical" |
| `filter` | CSS filter applied to `<img>` tags | "contrast(1.05) sepia(0.1)" or "none" |

## Generating a theme

1. **Infer the `ui` block**: colors, fonts, and shapes matching the vibe. Ensure a 4.5:1 minimum contrast. Pick light or dark mode.
2. **Infer the `visual` block**: art style, mood, references, CSS filter.
3. **Save** to `~/workspace/themes/<kebab-case-name>.json`.
4. **Confirm**: "I created 'Wes Anderson': pastel pinks, Futura, cinematic film stills. Want me to use this?"

Capture the *feel* (color temperature, density, typography personality), not an exact layout clone.

## Applying a theme (builder side)

- **Fonts render offline.** Map every theme font to an installed local family (verify with `fc-list`) before using it in CSS. Do not rely on Google Fonts imports or Microsoft fonts; see `/opt/hatch/skills/artifacts/pdf/references/workflow.md` for reliable local families.
- **Imagery.** When generating hero or illustrative imagery with `media.generate_image`, build prompts from the `visual` block (style, mood, lighting, palette, references), set `output_dir` to `artifact_media_dir`, and apply the theme's `filter` to the embedded images.
