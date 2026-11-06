# Space SDK icons

The SDK carries only the icon renderer: `Icon`, `createIcon`, the glyph types,
and `renderIconSvg` for inline markup. Icon geometry is never part of this
package.

A template whose builds own icons (Muse) lets client code import icons by name
from `@space/icons`. The artifact build resolves each name against the shipped
icon set and writes `client/.generated/icons.ts` with only those glyphs, built
on these primitives:

```tsx
import { SettingsIcon, HomeWght700Glyph, HomeWght400Glyph } from "@space/icons";
import { createIcon } from "@hatch/space-sdk/icons";

<button aria-label="Settings"><SettingsIcon size={20} decorative /></button>;
const HomeIcon = createIcon({ 400: HomeWght400Glyph, 700: HomeWght700Glyph }, 400);
```

- `<Name>Icon` renders weight 400; `<Name>Wght300Icon` ... `<Name>Wght700Icon`
  pick a weight. `<Name>Glyph` and `<Name>Wght<N>Glyph` export the glyph data,
  for `createIcon` or a component that takes an icon as a prop.
- Logos and product marks take a `Brand` prefix (`BrandGithubIcon`).
- Sizes are 12/16/20/24/32/40/48 CSS pixels and icons inherit `currentColor`.
  Icons are decorative by default; a meaningful standalone icon takes a
  non-empty `label`, and an icon-only button owns its name.

See `scripts/assets/xmds-icons/README.md` for how names resolve.
