# Theme

Themes provide default fonts, named colors, and text style tokens.

## Default Font

```ts
presentation.theme.defaultFont = "Aptos";
```

New presentations default to Aptos. Set `defaultFont: string` once during setup
to choose the theme's Latin heading and body font. Shape text with no explicit
`typeface` inherits the theme; a local `typeface` overrides it. The choice persists with
the presentation. Imported presentations retain their existing font schemes;
changing `defaultFont` preserves language-specific font mappings.

## Color Scheme

```ts
presentation.theme.colorScheme = {
  name: themeName,
  themeColors,
};

const hexMap = presentation.theme.hexColorMap;
```

`themeColors` maps every theme color name to a color config value. Assigning
`presentation.theme.colorScheme` replaces the active scheme, so provide the
full map.

## Color Scheme Inline Type

```ts
type ThemeColorName =
  | "accent1" | "accent2" | "accent3" | "accent4" | "accent5" | "accent6"
  | "bg1" | "bg2" | "tx1" | "tx2" | "dk1" | "lt1" | "dk2" | "lt2"
  | "hlink" | "folHlink";

type ColorSchemeConfig = {
  name: string;
  themeColors: Record<ThemeColorName, ColorConfig>;
};
```

## Theme Colors In Content

```ts
const shape = slide.shapes.add({
  geometry,
  position,
  fill: themeColorName,
  line: { style: lineStyle, fill: lineColor, width: lineWidthPx },
});
```

## Text Styles

```ts
const styles = slide.theme.textStyles({
  [styleName]: textStyleConfig,
});
```

## Cookbook

```ts
// Business/product palette.
presentation.theme.colorScheme = {
  name: "Product Editorial",
  themeColors: {
    accent1: "#2563eb",
    accent2: "#0f766e",
    accent3: "#f59e0b",
    accent4: "#dc2626",
    accent5: "#7c3aed",
    accent6: "#16a34a",
    bg1: "#ffffff",
    bg2: "#f8fafc",
    tx1: "#0f172a",
    tx2: "#475569",
    dk1: "#000000",
    dk2: "#1e293b",
    lt1: "#ffffff",
    lt2: "#e2e8f0",
    hlink: "#2563eb",
    folHlink: "#7c3aed",
  },
};
```

```ts
// Use theme tokens in content so later theme changes flow through.
slide.background.fill = "bg1";
shape.fill = "accent1";
shape.text.style = { color: "tx1" };
```
