# Presentation Token Reference

This reference covers the Tailwind-like tokens supported by presentation
shapes, text, and JSX. These are presentation tokens, not browser CSS.

## Where Tokens Work

| Surface | Token entry |
| --- | --- |
| Shape/box fill | `fill="sky-500"`, `fill="rose-500/80"` |
| Shape/box line | `line={{ style: "solid", fill: "slate-200", width: 1 }}` |
| Shape/box radius | `borderRadius="rounded-xl"` |
| Image radius | `borderRadius="rounded-2xl"` |
| Shape shadow | `shadow="shadow-md"` |
| Shape/box className | `className="bg-white rounded-xl shadow-sm"` |
| Text className | `className="text-slate-700 text-lg font-bold leading-tight"` |
| Imperative shape | `shape.className = "bg-sky-50 rounded-lg shadow"` |
| Imperative text | `shape.text.style = { className: "text-slate-800 text-xl leading-relaxed" }` |
| Text range | `shape.text.get("Total").className = "text-emerald-600 font-bold"` |

Explicit props override `className` on JSX nodes. For example,
`<box className="bg-slate-900" fill="white" />` uses the explicit `fill`.
`className` is only for visual/text tokens. Use real JSX props for layout:
`width`, `height`, `gap`, `padding`, `align`, and `justify`.

## Decision Table

| Need | Use |
| --- | --- |
| Common shape styling | `className="bg-white rounded-xl shadow-sm"` |
| Exact fill or gradient | `fill="#0f172a"` or `fill="linear(135deg, #fff 0%, sky-100 100%)"` |
| Exact line | `line={{ style: "solid", fill: "slate-200", width: 1 }}` |
| Common text styling | `className="text-slate-700 text-lg font-bold leading-tight"` |
| Exact text style | `style="font: 700 22px Inter; color: #334155; leading: 1.25; wrap: none"` |
| Inline emphasis | `<run textStyle={{ bold: true, color: "sky-600" }}>...</run>` |
| Layout | real props such as `gap={24}`, `padding={{ x: 32, y: 24 }}`, `align="center"` |

## Token Cookbook

Transparent overlay:

```tsx
<shape geometry="rect" width="fill" height="fill" fill="black/45" />
<paragraph className="text-white/80 text-xl">Readable over an image</paragraph>
```

Theme color with a transform:

```tsx
<box fill="accent1+18/90" />
<paragraph style="font: 700 18px Inter; color: tx1-10/85; wrap: none">
  Theme-aware text
</paragraph>
```

`+` lightens, `-` darkens, and `/` sets opacity. The suffix accepts unit
fractions, numbers, or percentages: `accent1+0.18/0.9`, `accent1+18/90`, and
`accent1+18%/90%` are equivalent.

Soft surface with exact line:

```tsx
<box
  fill="slate-50"
  line={{ style: "solid", fill: "slate-200", width: 1 }}
  borderRadius="rounded-2xl"
  shadow="shadow-sm"
/>
```

No fill, visible stroke:

```tsx
<shape
  geometry="ellipse"
  fill="none"
  line={{ style: "dashed", fill: "sky-500/70", width: 2 }}
  width={96}
  height={96}
/>
```

Gradient background plus transparent edge:

```tsx
<box fill="linear(135deg, #ffffff 0%, sky-100 58%, #ffffff/0 100%)" />
```

Radial highlight:

```tsx
<shape
  geometry="ellipse"
  fill="radial(white/80 0%, emerald-200/45 48%, emerald-700/0 100%)"
  width={420}
  height={260}
/>
```

Custom shadow:

```tsx
<box fill="white" borderRadius="rounded-2xl" shadow="2px 7px 19px #000000/17" />
```

Exact text style string:

```tsx
<paragraph style="font: 700 24px Inter; color: #334155; leading: 1.2; wrap: none">
  One-line label
</paragraph>
```

Tokenized text with arbitrary size and leading:

```tsx
<paragraph className="text-slate-950 text-[32px] font-bold leading-[1.12]">
  Precise headline
</paragraph>
```

## Color Tokens

Color tokens can be used directly as fill/color strings or through `bg-*` and
`text-*` class names.

```tsx
<box fill="slate-950" line={{ style: "solid", fill: "slate-700", width: 1 }} />
<box className="bg-sky-50 rounded-xl shadow-sm" />
<paragraph className="text-slate-700 text-lg">Readable text</paragraph>
```

Alpha suffixes are supported:

```tsx
<shape geometry="rect" fill="black/45" width="fill" height="fill" />
<paragraph className="text-white/80 text-xl">Muted overlay text</paragraph>
<box className="bg-rose-500/75 rounded-full" />
```

Theme colors and aliases are supported as color strings:

```tsx
<box fill="accent1" />
<box fill="accent2+20/80" />
<paragraph style="font: 600 18px Inter; color: text1/80; wrap: none">
  Uses the presentation theme text color
</paragraph>
```

Theme names:

```text
accent1, accent2, accent3, accent4, accent5, accent6,
bg1, bg2, tx1, tx2, dk1, dk2, lt1, lt2, hlink, folHlink
```

Aliases:

```text
background1 -> bg1
background2 -> bg2
text1 -> tx1
text2 -> tx2
dark1 -> dk1
dark2 -> dk2
light1 -> lt1
light2 -> lt2
```

Supported color names:

| Family | Tokens |
| --- | --- |
| Neutrals | `slate`, `gray`, `zinc`, `neutral`, `stone` |
| Warm | `red`, `orange`, `amber`, `yellow`, `lime` |
| Green/blue | `green`, `emerald`, `teal`, `cyan`, `sky`, `blue` |
| Violet/pink | `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose` |
| Additional muted sets | `mauve`, `mist`, `olive`, `taupe` |
| Singletons | `black`, `white` |

For palette families, supported shades are:

```text
50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
```

Use `family-shade`, for example `slate-50`, `slate-900`, `sky-500`,
`emerald-700`, or `rose-950`.

Alpha values accept percent-like numbers, percentages, or unit fractions:

```text
sky-500/80
sky-500/80%
sky-500/0.8
black/10
white/65
```

Hex, short hex, RGB, RGBA, and `transparent` are accepted:

```tsx
<box fill="#0F172A/12" />
<box fill="#0F172A1F" />
<box fill="rgb(15 23 42 / 12%)" />
<box fill="rgba(15, 23, 42, 0.12)" />
<shape geometry="rect" fill="transparent" />
```

Use `fill="none"` when the object should have no fill. Use
`fill="transparent"` or `#00000000` when the object should keep an editable
transparent solid fill. Express transparent and no-fill cases with the explicit
`fill` prop.

## Gradient Strings

Gradient fill strings are supported wherever `FillConfig` strings are accepted.  
Use them for editable vector backgrounds and surfaces:

```tsx
<box fill="linear(135deg, #ffffff 0%, sky-100 55%, #ffffff/0 100%)" />
<shape geometry="ellipse" fill="radial(#ffffff 0%, emerald-200 48%, emerald-700 100%)" />
```

`linear(...)` accepts an optional angle first. `radial(...)` is a path gradient.  
Stops use color plus optional offset percentages.

Offsets are optional; when omitted, stops are distributed evenly:

```tsx
<box fill="linear(slate-950, blue-800, sky-400)" />
```

Use explicit offsets when a narrow band or fade matters:

```tsx
<box fill="linear(90deg, black/80 0%, black/36 42%, black/0 100%)" />
<shape geometry="ellipse" fill="radial(accent1+35/55 0%, accent1/12 58%, accent1/0 100%)" />
```

## Shape Class Tokens

Shape and box `className` supports:

```text
bg-*
rounded
rounded-none
rounded-sm
rounded-md
rounded-lg
rounded-xl
rounded-2xl
rounded-3xl
rounded-full
shadow-none
shadow-sm
shadow
shadow-md
shadow-lg
shadow-xl
shadow-2xl
```

Example:

```tsx
<box
  width="fill"
  height={180}
  className="bg-white rounded-xl shadow-md"
  line={{ style: "solid", fill: "slate-200", width: 1 }}
/>
```

Radius values:

| Token | Radius |
| --- | ---: |
| `rounded-none` | `0px` |
| `rounded-sm` | `2px` |
| `rounded` | `4px` |
| `rounded-md` | `6px` |
| `rounded-lg` | `8px` |
| `rounded-xl` | `12px` |
| `rounded-2xl` | `16px` |
| `rounded-3xl` | `24px` |
| `rounded-full` | `9999px` |

Shadow tokens:

```text
shadow-none, shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl, shadow-2xl
```

Custom shadow strings are also supported on `shadow`:

```tsx
<box shadow="2px 7px 19px #000000/17" />
```

## Text Class Tokens

Text `className` supports color, size, weight, italic, and leading:

```tsx
<paragraph className="text-slate-950 text-5xl font-bold leading-tight">
  Large headline
</paragraph>
<paragraph className="text-slate-600 text-lg leading-relaxed">
  Body copy with looser line spacing.
</paragraph>
```

Text sizes:

| Token | Size |
| --- | ---: |
| `text-xs` | `12px` |
| `text-sm` | `14px` |
| `text-base` | `16px` |
| `text-lg` | `18px` |
| `text-xl` | `20px` |
| `text-2xl` | `24px` |
| `text-3xl` | `30px` |
| `text-4xl` | `36px` |
| `text-5xl` | `48px` |
| `text-6xl` | `60px` |
| `text-[32px]` | arbitrary positive pixel size |

Font weight tokens:

| Bold flag | Tokens |
| --- | --- |
| `true` | `font-semibold`, `font-bold`, `font-black` |
| `false` | `font-thin`, `font-extralight`, `font-light`, `font-normal`, `font-medium`, `font-extrabold` |

Font weight maps to a boolean bold flag, not numeric weights. Use only
`font-semibold`, `font-bold`, or `font-black` when the text should be bold. Use
`font-normal` when the text should not be bold. `font-extrabold` maps to the
non-bold side because exact `500`/`600`/`700`/`800` differences are not
preserved.

`italic` sets italic text.

Leading tokens:

| Token | Line spacing |
| --- | ---: |
| `leading-none` | `1` |
| `leading-tight` | `1.25` |
| `leading-snug` | `1.375` |
| `leading-normal` | `1.5` |
| `leading-relaxed` | `1.625` |
| `leading-loose` | `2` |
| `leading-3` through `leading-10` | `12px` through `40px`, converted against current font size |
| `leading-[1.35]` | arbitrary multiplier |
| `leading-[150%]` | percentage multiplier |
| `leading-[28px]` | absolute pixels, converted against current font size |

When using absolute leading such as `leading-7` or `leading-[28px]`, put the
text size token before the leading token in the class string so conversion uses
the intended font size:

```tsx
<paragraph className="text-2xl leading-8">24px text with 32px leading</paragraph>
```

## Direct Props Versus Class Names

Use direct props when a value is part of the object schema:

```tsx
<shape
  geometry="rect"
  fill="emerald-500"
  line={{ style: "solid", fill: "emerald-700", width: 1 }}
  borderRadius="rounded-lg"
  shadow="shadow-sm"
  width={160}
  height={96}
/>
```

Use `className` when grouping common style tokens:

```tsx
<box className="bg-emerald-50 rounded-xl shadow-sm">
  <paragraph className="text-emerald-900 text-xl font-bold leading-tight">
    Compact token styling
  </paragraph>
</box>
```

Use object `style` for exact text settings that tokens do not cover:

```tsx
<paragraph
  style={{
    typeface: "Aptos",
    fontSize: 22,
    color: "slate-700",
    alignment: "center",
    lineSpacing: 1.2,
  }}
>
  Exact text config
</paragraph>
```

Use a compact style string when the exact settings fit on one line:

```tsx
<paragraph style="font: italic 600 20px Aptos; color: slate-700; leading: 1.25; align: center">
  Compact exact text config
</paragraph>
```

Supported text style declarations:

```text
font, size, font-size, family, font-family, typeface,
weight, font-weight, italic, font-style, color, fill,
leading, align, alignment, wrap, underline, inset, insets,
padding, autofit, auto-fit
```

Use `leading`, not `line-height`, in style strings.

## ClassName Scope

The token parser covers visual and text styling. JSX layout props represent
layout utilities such as padding, gap, width, height, flex flow, grid flow,
alignment, and distribution:

```tsx
<row width="fill" height="fill" gap={24} align="center" justify="between" />
<box padding={{ x: 32, y: 24 }} line={{ style: "solid", fill: "slate-200", width: 1 }} />
```

## Source References

- `src/models/presentation/utils/tailwind/*.ts`: token parsers.
- `src/models/presentation/utils/tailwind/tailwind-colors.generated.ts`: full
  color token map.
- `tests/presentation/tailwind-tokens.sanity.spec.ts`: visual token coverage.
