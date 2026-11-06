---
description: The theme JSON design system stored under ~/workspace/themes/, its schema, and how to generate or apply a theme.
---

# Theme schema and generation

- A theme is a small JSON design system stored under `~/workspace/themes/`. The builder decides which theme a document uses through the [PDF visual guide](/opt/muse/skills/documents/pdf/references/visual.md). Read this file to generate or apply a theme.

## Theme file schema

- Each theme has two blocks: `ui` for document styling and `visual` for image-generation guidance. For example:

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

### The ui block

- The `ui` block holds these fields:
  - `colors` is the full palette: background, surface, borders, text, accent, muted text and the semantic colors danger, success and warning.
  - `font`, `fontSans` and `fontMono` are the typography stacks for body, interface and code.
  - `fontWeight` maps weights for headings, body and labels.
  - `radius` holds border-radius tokens per element type.
  - `shadows` holds box-shadow tokens, or "none" for a flat theme.
  - `notes` describes the theme's personality and any special component patterns.

- Keep at least 4.5:1 contrast between text and background.

### The visual block

- The `visual` block guides generated imagery:
  - `style` sets the art direction, such as "3D Pixar render", "watercolor" or "vintage film".
  - `mood` sets the emotional tone, such as "cozy and warm" or "dark and mysterious".
  - `lighting` sets the light, such as "golden hour" or "dramatic chiaroscuro".
  - `palette` guides image color, such as "jewel tones" or "neon on black".
  - `texture` sets the surface quality, such as "clean digital" or "film grain".
  - `references` names style references, such as "Wes Anderson" or "Studio Ghibli".
  - `orientation` sets the default image orientation: "landscape", "square" or "vertical".
  - `filter` is a CSS filter applied to `<img>` tags, such as "contrast(1.05) sepia(0.1)", or "none".

## Generate a theme

- Infer the `ui` block from the requested vibe: colors, fonts and shapes, light or dark mode, and at least 4.5:1 contrast.

- Infer the `visual` block: art style, mood, references and a CSS filter.

- Write the generated theme to `project_dir/.src/theme.json`.

- When the user asked to keep the theme, also save it to `~/workspace/themes/<kebab-case-name>.json`, where later documents find it.

- Capture the feel, meaning color temperature, density and typographic personality, not an exact copy of a layout.

## Apply a theme

- Fonts must render offline, so map every theme font to an installed local family verified with `fc-list` before using it in CSS. Do not rely on Google Fonts imports or Microsoft fonts. The [PDF workflow](/opt/muse/skills/documents/pdf/references/workflow.md) lists reliable local families.

- Build hero and illustrative image prompts for `media.generate_image` from the `visual` block (style, mood, lighting, palette and references), pass `artifact_media_dir` as `output_dir`, and apply the theme's `filter` to the embedded images.
