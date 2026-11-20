# A look

A look changes how a session draws in the desktop and mobile apps. It's data: a mod sends it once with `$.theme.set`, and the app draws it from then on. `examples/look.ts`, beside this file, is a whole look. Copy it and change the colors.

`$.theme.set({ colors, backdrop, overrideColorScheme, sound, style })` names the whole theme, so a later set replaces it. Send everything in one call, from `session.start`. `$.theme.clear()` clears any mod's theme, so call it only when the person asks.

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

`makeColors` throws on a color it can't use, saying what to change. It lists contrast in `problems` and stops for nothing. Work until no line starts `Desktop won't paint this theme`, because Desktop then ignores the whole theme. The usual cause is a dark-mode `surface-3` too light for `text-muted` or a role's text, so keep it close to `surface-0`. The other lines are under the design system's own bar and still paint, so stop there: an empty list isn't the goal, and the design system's own colors don't reach it. Copy the file again when the build updates, since an old copy falls behind. On Desktop, a color the design system renames keeps its value, and your page and text colors keep reaching surfaces, text and fills. An update can still retire a color, change which gray a surface reads, or trip the contrast check above, so rerun `makeColors` when you copy the file. A color added later shows the app's own until you remake the theme.

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

Give the Svg a `viewBox` and `preserveAspectRatio="xMidYMid slice"` so it fills any screen, keep it under 131,072 characters, and animate with CSS inside its own `<style>`. Keep it pure vector, with no embedded pictures or fonts, or the engine refuses it and says what to take out. Keep comments plain: `<!-- sky -->` between tags, with no `<` or `--` in it, and `/* sky */` in a style. The engine reads their words too, so a word such as `href` in one is still refused, as are a bare `&` in a CSS one and CDATA. Keep a CSS comment to plain words, since one that holds `word(` or `@word` can leave the scene still or undrawn. To use a picture, redraw it as SVG. Keep motion slow: a scene that flashes or is too heavy is held still, as it is on surfaces with no gate. On `desktop` a scene can read the mode with `@media (prefers-color-scheme: dark)` or `light-dark()` and still move, and it gets the mode the app shows, a look's own included, whatever `color-scheme` it sets for itself. `glass` is `{ blur, tint, opacity }`, a raw-colored veil over it, or `false`.

For a person who asked for reduced motion, `desktop` draws the scene with its animation taken out, so make it look finished that way: give each moving part a resting place and opacity in the plain markup. A scene redrawn on a timer holds still for them too, until the redraws stop for five seconds.

### A scene that answers the pointer

For water, light or particles that follow the pointer, wrap the Svg in a `Shader`, which plays a shader file on the GPU. To change the scene when the person clicks it, hook `ui.pointer`. The types hold the rules, so read them before you write one: `ShaderProps` (a whole theme, and when the Svg shows alone), `'ui.pointer'`, and the `claude-code/shader` module (the language). `claude plugin validate` prints each shader's cost, or the line it refuses.

A shader can answer a press with no hook. Each press comes as a new pointer, so loop over `pointers` and start the splash in a `buffer` on the frame a pointer has `down` 1 and `age` 0, at `turn` 0 if the buffer repeats. Don't skip pointers with a small `age` there, or read `pointer(0)` alone. With no buffer, draw the splash from `age`, which runs on for up to a second after the press lifts. A press over the app counts too, with `over` 1, while `ui.pointer` hears only clicks on the bare backdrop.

A shader that keeps flashing freezes, then stops, and its Svg shows. A spot flashes when it swings between lighter and darker, or between two colors, more than three times a second. It's too much when flashing spots within any 340 by 256 points add up to a patch about 100 points a side, or less in a small window, even if they're thin or scattered. A light scene gets there with a smaller change of color than a dark one, and one shader file plays in both. Each ring or crest that crosses a spot is one flash there, so two rings a press already flash at two clicks a second, and a field of overlapping waves flashes all the time. So keep the wake narrow but easy to see, send out one bold ring a press, and have both gone within a second.

### Any screen

A scene's box changes with the device, from a tall phone to a wide window, and on a phone on its side the bars leave little room. One SVG can fit them all. Give the root `preserveAspectRatio="xMidYMid slice"` for loose art that can be cropped. For a subject that has to stay in view, pin it with a nested `<svg>` with its own `preserveAspectRatio`, such as `xMaxYMax meet` for a corner. A scene can also move it with `@media` rules in its `<style>`, which read the scene's own box, not the device, so a wide column on a tablet counts as landscape too. On `desktop` a scene with size queries, `@container` or viewport units still moves, and it is stretched while its box is resized, then laid out again. On `mobile` it may draw still, so fit a scene that has to move there with `preserveAspectRatio` and nested `<svg>`s. Keep the subject away from the middle, where the words sit, and the foot, where the message box sits.

## A still ground

`backdrop` can also be a ground, with no hook: `{ color }`, `{ gradient }` or `{ vector }`. For any other pattern, draw a scene. A color in one is raw, or a palette name such as `surface-0`, which follows the mode. A surface counts it in the look, so `isDrawn` answers for it the same way.

## Sound

`sound: { ambience?, cues? }` gives a look a sound, which the desktop app plays once the person presses the speaker in the session's title bar. It's numbers, never a file: layers of tones and noise that the app makes itself. `ThemeSound` in the types has an example, every field's range and the moment each cue plays.

- `ambience` plays while the person uses the window, and stops for a prompt, dictation, a voice call or a reply read aloud. Each of its layers is a `drone` or a `scatter`. The person can turn it off and keep the cues.
- `cues` are short sounds that the app plays by itself: `send`, `tool`, `compact`, `done`, `ask`, `error` and `click`. A mod can't trigger one.
- To change the mood, set the theme again. A new ambience fades in, and an unchanged one keeps playing.
- `$.theme.set` throws on a sound out of range or too costly, saying what to change, and sets nothing. A build that doesn't take `sound`, such as an older one, throws too, so catch that and set the look again without it.

Keep it quiet and sparse, since it plays for hours beside someone's work, and don't imitate a system chime. `isDrawn` says nothing of sound and a mod's tests play none, so ask the person to listen.

## Style

`style` restyles the conversation's own rows in the desktop app: bubbles, shapes and type, with no `ui.render` hook. The words stay the app's text, so selecting, copying, finding, Markdown and screen readers keep working. Don't draw a message as an `Svg` to change how it looks. `ThemeStyle` in the types has every field's range.

| Part | What it is | Type | Box | `rotate` |
| --- | --- | --- | --- | --- |
| `Text` | The words of both kinds of message | yes | no | no |
| `Heading` | Headings in a message | yes | no | no |
| `UserMessage` | The person's bubble | yes | yes | yes |
| `AssistantMessage` | Each run of words in a reply | yes | yes | yes |
| `ToolUse` | A tool call's row | `color` and `fontFamily` alone | yes | no |

Every length is a plain number of points.

- **Type**: `color`, `fontFamily`, `fontSize` (11 to 28), `fontWeight` (`regular`, `medium`, `semibold`, `bold`), `italic`, `letterSpacing` (-1 to 4) and `lineHeight` (12 to 48 and no less than `fontSize`, so `24`, never `1.5`). `fontFamily` is a list of one generic font, such as `['serif']`: `sans`, `serif`, `mono`, `code` or `cursive`.
- **Box**: `backgroundColor`, `fill`, `radius` (0 to 64, one or four), `borderColor`, `borderWidth` (0 to 8), `shadow` (`{ x, y, blur, color }`, drawn fainter if it reaches the next row, or `'none'`) and `padding`, `paddingX`, `paddingY` or one side (0 to 48).
- `fill` is `{ gradient }` or `{ vector }`, as a still ground's is, drawn over `backgroundColor` and inside the radius and border.
- A vector's `slice` makes a shape that fits any message, such as a torn edge, tape or a speech tail. The corners draw once, a `viewBox` unit to a point unless `size` scales the drawing. The edges and middle stretch, or tile with `repeat`. Put each ornament inside a corner's slice, and fill the middle. The drawing replaces the radius and the border, and `shadow` follows its outline. It replaces `backgroundColor` too, unless the words are under 3:1 on a color of the drawing or on what lies behind it: then `backgroundColor` goes over the drawing, under the words alone, so give one that matches the middle.
- `rotate` is -3 to 3 degrees. A tall message tilts less, and one in a view laid out as a chat feed doesn't tilt. Give a message a list of up to 4 rules for variety: each message takes one and keeps it.

With no `color` set, words turn black or white to suit a raw `backgroundColor`, so give one beside a `fill`. A color name such as `surface-1` follows light and dark, and a raw color doesn't. For message colors that differ by mode, add `bg-user-message`, `text-user-message`, `bg-assistant-message` or `text-assistant-message` to `colors.inputs.light` and `.dark`, after `makeColors`, which doesn't take them. They color the messages with no `style` at all, a message's own rule wins, and any rule may name them.

```ts
const cork = { backdrop: { color: '#b98a5a' }, overrideColorScheme: 'light' } as const
const note: ThemeMessageRule = { color: '#2b2416', radius: 2, padding: 16, shadow: { y: 3, blur: 8, color: '#0005' } }

try {
  await $.theme.set({
    ...cork,
    style: {
      Text: { fontFamily: ['cursive'], fontSize: 17, lineHeight: 26 },
      UserMessage: [
        { ...note, backgroundColor: '#fde68a', rotate: -1.5 },
        { ...note, backgroundColor: '#fbcfe8', rotate: 1 },
      ],
      AssistantMessage: {
        ...note,
        backgroundColor: '#fbf6e9',
        paddingTop: 28,
        fill: { vector: { viewBox: 96, slice: 40, paths: [
          { d: 'M0 8H96V84L84 96H0Z', color: '#fbf6e9' }, // paper, one corner folded
          { d: 'M84 96V84H96Z', color: '#e0d6bd' },
          { d: 'M8 2L38 0L39 16L9 18Z', color: '#f5d77ecc' }, // tape
        ] } },
      },
      ToolUse: { color: '#2b2416', backgroundColor: '#fff8', radius: 6, paddingX: 8 },
    },
  })
} catch (error) {
  $.ui.log(String(error))
  await $.theme.set(cork)
}
```

`$.theme.set` throws on a value out of range, saying what to change, and sets nothing. A build that doesn't take `style`, such as an older one, throws too, so catch that and set the look again without it, as above.

Permission prompts, questions, code blocks and the message box keep the app's look, and a new style waits while a prompt or question shows. The person's accessibility settings win, and the app tells them so: an accessibility font wins over the style's family, weight, slant and spacing, and higher contrast draws plain rows. The mod is told nothing. The style's font draws over the Serif and System choices in Settings, and printing draws plain rows too. A rule whose words are under 3:1 on what lies behind them, in the mode showing, draws in the app's own colors, and the other rules still draw. Every color of a `fill` counts as behind them, and the four message colors are held to that too. Over a backdrop, a still ground included, any color can lie behind a row, so a text color needs an opaque enough fill under it: give the message or tool row a `backgroundColor` that is solid or nearly so. `isDrawn` says nothing of this check, so ask the person to look.

## What good looks like

- **Tint the grays.** Take every surface from the look's hue and keep neighbors close, a few percent of lightness apart, so a card reads as paper on paper. Leave pure black and white to looks that are about them.
- **Words come first.** Keep `text-primary` at 7:1 or better on each surface and `text-muted` at 4.5:1 on `surface-0` and `surface-2`. Passing `problems` is a floor, not the aim.
- **Keep meaning.** `danger` stays a red, `success` a green and `warning` an amber, tuned toward the look. Five seeds of one hue also flatten code.
- **Both modes, unless the idea can't.** Make dark a second version of the idea, such as lamp-lit paper, and not an inversion.
- **Your own art.** Take the spirit of a place or an era, never a company's logo, artwork or font.

A mod's tests don't paint, so ask the person to look in both modes, with a long code block and at a larger text size.

## What fails with no error

These load and draw nothing:

- A `colors` key that isn't a design-system name or one of the four message colors, such as `background`, or an anchor such as `surface-0` written straight into `inputs`. `checkColors(colors)`, from `make-colors.js`, names each one.
- A `backdrop` scene with no `ui.render` hook on `Backdrop`.
- A scene whose answer the engine refuses, such as an Svg holding `<image>`. `$.theme.set` still answers `isDrawn: true`, and only the debug log says why, unless the mod's folder hot-reloads.

`claude plugin validate` doesn't look inside a look. Run `tsc -p <mod folder>`, and annotate a look kept in a constant as `ThemeSetArgs`, or it widens to `string`.
