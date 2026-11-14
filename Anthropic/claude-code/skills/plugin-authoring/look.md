# A look

A look changes how a session draws in the desktop and mobile apps. It's data: a mod sends it once with `$.theme.set`, and the app draws it from then on. `examples/look.ts`, beside this file, is a whole look. Copy it and change the colors.

`$.theme.set({ colors, backdrop, overrideColorScheme })` names the whole theme, so a later set replaces it. Send everything in one call, from `session.start`. `$.theme.clear()` clears any mod's theme, so call it only when the person asks.

The terminal and editors draw no look, and `isDrawn: false` with its `reason` says why nothing draws. `isDrawn: true` says only that a client that draws themes is attached. Permission prompts always keep the app's own look.

## colors

A theme is about 100 colors in each mode, under design-system names you can't guess, and a wrong name paints nothing and says nothing. So don't write one by hand. A mod can't import the design system, so copy `make-colors.js` and `make-colors.d.ts` from this skill's folder into the mod's `hooks/` folder, leave them as they are, and call `makeColors`:

```ts
const { theme, problems } = makeColors({
  label: 'Paper',
  roles: { accent: '#2f5d8c', danger: '#b3392f', success: '#4e7d3a', warning: '#a86f14', pro: '#6d4f94' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#efe6d3',
        'surface-1': '#f4ecdc',
        'surface-2': '#faf5e9',
        'text-primary': '#2a241d',
        'text-secondary': '#544a3d',
        'text-muted': '#6a5f50',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1f1a15',
        'surface-1': '#28221b',
        'surface-2': '#312a22',
        'surface-3': '#3a3229',
        'text-primary': '#f0e7d7',
        'text-secondary': '#cfc4b2',
        'text-muted': '#aca08d',
      },
    },
  },
})
await $.theme.set({ colors: theme })
```

Every color is six-digit hex.

- **Anchors**, in each mode: `surface-0` (the page) and `text-primary` are required, then `surface-1` (cards), `surface-2` (panels), `surface-3` (menus), `text-secondary` and `text-muted`. In both modes `surface-0` is the darkest surface and each later one is as light or lighter, so in light mode the cards sit lighter than the page. `text-primary` is the strongest text. In light mode `surface-2` and `surface-3` must match if you give both. An anchor you leave out is filled in from the ones you give. These names go to `makeColors` alone: `colors` itself holds other names, which you never write.
- **Roles**: `accent`, `danger`, `success`, `warning` and `pro`, one color each. The design system keeps its hue and sets the lightness. `roles` covers both modes, and a mode's own `roles` replaces one in that mode. Code is colored from these: keywords from `accent`, strings from `success`, literals from `pro`, names from `danger`, variables from `warning`.
- **`git`**, inside a mode beside `gray`, such as `light: { git: { added: '#2d8a4e' } }`: `added`, `removed`, `modified`, `merged`, `closed`, `conflicting` and `draft`. `makeColors` throws on a `git` at the top level.
- A mode, role or git color you leave out stays the app's.
- `codeTheme: { light, dark }` names the code highlighting theme for each mode, such as `{ dark: 'nord' }`, and `contrast: 'more'` asks for stronger borders and focus rings.

`makeColors` throws on a color it can't use, saying what to change. It lists contrast in `problems` and stops for nothing. Work until no line starts `Desktop won't paint this theme`, because Desktop then ignores the whole theme. The usual cause is a dark-mode `surface-3` too light for `text-muted` or a role's text, so keep it close to `surface-0`. The other lines are under the design system's own bar and still paint, so stop there: an empty list isn't the goal, and the design system's own colors don't reach it. Copy the file again when the build updates, since an old copy falls behind.

For a look that serves both modes, give both halves and leave out `overrideColorScheme`. For one made for a single mode, such as a dark scene, give that half with `only: 'dark'`, and a surface then acts as if `overrideColorScheme` named it.

## A moving scene

Most looks need none. A scene is the one thing in a look that moves. `backdrop: { scene, glass? }` names it, and a hook draws it, and can read `e.props.scene`:

```tsx
on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
  if (e.surface !== 'desktop' && e.surface !== 'mobile') {
    return next(e)
  }

  const { Svg } = $.ui.resolve(e)

  return <Svg source={SCENE} alt="A slow tide coming in" isInteractive />
})
```

Give the Svg a `viewBox` and `preserveAspectRatio="xMidYMid slice"` so it fills any screen, keep it under 131,072 characters, and animate with CSS inside its own `<style>`. It runs no script and loads nothing. `glass` is `{ blur, tint, opacity }`, a raw-colored veil over it, or `false`.

### Any screen

A scene's box changes with the device, from a tall phone to a wide window, and on a phone on its side the bars leave little room. One SVG can fit them all. Give the root `preserveAspectRatio="xMidYMid slice"` for loose art that can be cropped. For a subject that has to stay in view, pin it with a nested `<svg>` with its own `preserveAspectRatio`, such as `xMaxYMax meet` for a corner, or move it with `@media` rules in the scene's `<style>`. A media rule reads the scene's own box, not the device, so a wide column on a tablet counts as landscape too. Keep the subject away from the middle, where the words sit, and the foot, where the message box sits.

## A still ground

`backdrop` can also be still, with no hook: `{ color }`, `{ gradient }`, `{ vector }` or `{ image }`. For any other pattern, draw a scene. A color in one is raw, or a palette name such as `surface-0`, which follows the mode. A surface counts it in the look, so `isDrawn` answers for it the same way.

`image` is a JPEG or PNG in the mod's folder, such as `{ image: { source: 'harbour.jpg' } }`, at most 1 MiB and 4096 on a side. Save a photo about 2560 wide as a JPEG: a camera's original is too big. A surface fills the screen with it, centred, so keep what matters in the middle. To tile one instead: `{ image: { source: 'tile.png', size: [64, 64], repeat: true } }`.

## What good looks like

- **Tint the grays.** Take every surface from the look's hue and keep neighbors close, a few percent of lightness apart, so a card reads as paper on paper. Leave pure black and white to looks that are about them.
- **Words come first.** Keep `text-primary` at 7:1 or better on each surface and `text-muted` at 4.5:1 on `surface-0` and `surface-2`. Passing `problems` is a floor, not the aim.
- **Keep meaning.** `danger` stays a red, `success` a green and `warning` an amber, tuned toward the look. Five seeds of one hue also flatten code.
- **Both modes, unless the idea can't.** Make dark a second version of the idea, such as lamp-lit paper, and not an inversion.
- **Your own art.** Take the spirit of a place or an era, never a company's logo, artwork or font.

A mod's tests don't paint, so ask the person to look in both modes, with a long code block and at a larger text size.

## What fails with no error

The engine checks only shape and size, so these load and draw nothing:

- A `colors` key that isn't a design-system name, such as `background`, or an anchor such as `surface-0` written straight into `inputs`. `checkColors(colors)`, from `make-colors.js`, names each one.
- A `backdrop` scene with no `ui.render` hook on `Backdrop`.

`claude plugin validate` doesn't look inside a look. Run `tsc -p <mod folder>`, and annotate a look kept in a constant as `ThemeSetArgs`, or it widens to `string`.
