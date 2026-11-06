# @hatch/muse-ui

Components for Muse-template Spaces, designed after the Muse web app's own
(`par-msl/hatch` `app/_components/design_system/` and the mobile tab bar) and
built on Base UI through `@hatch/base-ui`. Builders import them and do not edit
them. This file is the reference for both packages.

```tsx
import { Button, Dialog, IconButton, Menu, TabBar, Toolbar } from "@hatch/muse-ui";
import { HomeGlyph, MoreVertGlyph, SearchGlyph } from "@space/icons";

{/* The title names the open list, never the app. */}
<Toolbar title={list.name} leading={<Toolbar.Back onClick={closeList} />}>
  <Menu trigger={<Toolbar.Button icon={MoreVertGlyph} label="More options" />} align="end">
    <Menu.Item onSelect={rename}>Rename</Menu.Item>
    <Menu.Separator />
    <Menu.Item destructive onSelect={remove}>Delete</Menu.Item>
  </Menu>
</Toolbar>
<Dialog
  title="Rename list"
  open={open}
  onOpenChange={setOpen}
  actions={
    <>
      <Dialog.Close render={<Button variant="secondary">Cancel</Button>} />
      <Button onClick={save}>Save</Button>
    </>
  }
>
  ...
</Dialog>
<TabBar label="Sections" value={tab} onValueChange={setTab}>
  <TabBar.Item value="home" icon={HomeGlyph} label="Home" />
  <TabBar.Item value="search" icon={SearchGlyph} label="Search" />
</TabBar>
```

## Components

Icons are always glyphs from `@space/icons` (`HomeGlyph`, `PlusGlyph`, ...),
passed as props and drawn with `Icon` from `@hatch/space-sdk/icons`. As in the
Muse web app's `HatchIcon`, each glyph sits centered in a box and paints at 75%
of it, because XMDS glyphs fill their viewBox: a 20px box paints 15px, 24px
paints 18px, and 28px paints 21px. Loading spinners take the painted size.

- **`Button`**: `variant` (`primary` default, filled with the accent;
  `secondary`, a neutral fill; `outline`; `plain`, no fill; `destructive`),
  `size` (`"32"`, `"36"` default, `"44"`), `radius` (`full` default or
  `large`, 12px corners), `icon` and `trailingIcon` (20px box, 15px glyph),
  `href` (renders a link) with `external` (new tab,
  `rel="noopener noreferrer"`), `disabled`,
  `loading` with optional `loadingText`. Other button props pass through.
- **`IconButton`**: `icon`, a required `label` (its accessible name),
  `variant` (`plain` default, same five as `Button`), `size` (`"32"`, `"36"`
  default, `"44"`, `"48"`, with 20, 28, 20 and 24px glyph boxes), `disabled`,
  `loading`, `tooltip` with `tooltipDelay` (default 500 ms). The tooltip shows
  on hover and keyboard focus.
- **`Dialog`**: `title`, `description`, children (the scrolling body),
  `actions` (end-aligned along the bottom), `trigger` (a button element) or
  `open`/`defaultOpen`/`onOpenChange`, `size` (`"sm"`, `"md"` default, `"lg"`),
  `closeLabel`, `hideCloseButton`. It is modal: focus moves in, stays in, and
  returns to the trigger; Escape and an outside click close it. `Dialog.Close`
  turns a button into a closing one:
  `<Dialog.Close render={<Button>Done</Button>} />`.
- **`Menu`**: `trigger` (any button element, including `Toolbar.Button` or
  `IconButton`), `side`, `align`, `open`/`defaultOpen`/`onOpenChange`. Items:
  `Menu.Item` (`onSelect`, `icon`, `description`, `destructive`, `disabled`,
  `keepOpen`), `Menu.CheckboxItem` (`checked`/`onCheckedChange`),
  `Menu.RadioGroup` (`value`/`onValueChange`, `label`) with `Menu.RadioItem`
  (`value`), `Menu.Group` (`label`), and `Menu.Separator`. Arrow keys move
  between items and typing jumps to a label.
- **`Toolbar`**: `title`, `leading` (controls before the title), trailing
  children, `label` (defaults to a string `title`), `position` (`sticky`
  default or `static`). The title names the current view or selection, such
  as the open note or "Archive", never the app: Hatch's header above the
  Space already shows its name. Without a title the actions sit at the end on
  their own. Its geometry matches the Muse web app's artifact title
  bar, which sits directly above a Space on desktop: a 60px row, 20px start
  and 12px end padding, 12px gaps in the leading group and 8px between
  actions, so a trailing icon button's center is 30px from the end, under
  Hatch's close button. `Toolbar.Button` takes `label`, an optional `icon`,
  `showLabel`, and `variant`; it is icon-only and labelled when it has an icon
  and no `showLabel`, and uses the same 36px look as `Button` and `IconButton`.
  `Toolbar.Separator` sits in the 8px gaps. Arrow keys move between buttons.
  `Toolbar.Back` is the icon-only back button for `leading`: the 36px plain
  icon button with the Muse web app's back chevron (`chevronLeft`, mirrored in
  right-to-left layouts), labelled "Back" unless you pass `label`, taking
  `onClick` or `href` (a real link). With `Sidebar.Toggle` beside it, Back
  comes first whatever order they are passed in.
- **`TabBar`**: `label` (the navigation landmark's name), `value`/
  `defaultValue`/`onValueChange`, `showLabels` (icons only by default). Each
  `TabBar.Item` takes `value`, `icon` (a 28px box, 21px glyph, as in the
  Muse mobile tab bar) and `label` (the accessible name, and the visible label
  with `showLabels`); the selected one has `aria-current="page"`.
- **`Sidebar`**: a navigation column for apps with lists or sections. Wrap the
  page in `Sidebar.Layout` with a `sidebar` and the content column as
  children; on md and up the sidebar runs the full viewport height on the
  start side and the content column, with its sticky `Toolbar`, scrolls beside
  it. Never put a full-width toolbar above a sidebar. Below md the sidebar
  opens as a modal drawer (Base UI Drawer) from `Sidebar.Toggle`, which sits in
  the toolbar's `leading`; it traps focus, closes on Escape, an outside tap or
  choosing an item, and returns focus to the toggle.

  ```tsx
  <Sidebar.Layout
    sidebar={
      <Sidebar label="Notes">
        <Sidebar.Header>
          <Sidebar.Search label="Search notes" placeholder="Search" value={query} onValueChange={setQuery} />
          <IconButton icon={PlusGlyph} label="New note" onClick={create} />
        </Sidebar.Header>
        <Sidebar.Content>
          {notes.map((n) => (
            <Sidebar.Item key={n.id} label={n.title} icon={NotebookGlyph} trailing={n.date}
              selected={n.id === openId} onClick={() => setOpenId(n.id)} />
          ))}
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Item label="Settings" icon={SettingsGlyph} href="#settings" />
        </Sidebar.Footer>
      </Sidebar>
    }
  >
    <Toolbar title={openNote.title} leading={<Sidebar.Toggle />}>...</Toolbar>
    <main>...</main>
  </Sidebar.Layout>
  ```

  - `Sidebar.Layout`: `sidebar`, children (the content column).
  - `Sidebar`: `label` (the `<nav>` landmark's name and the drawer's).
  - `Sidebar.Header`: a 60px row level with the `Toolbar` row.
  - `Sidebar.Search`: a search field with a required `label`,
    `onValueChange`, and input props.
  - `Sidebar.Content`: the scrolling list; `Sidebar.Footer`: rows pinned below.
  - `Sidebar.Item`: `label`, `icon`, `trailing` (short text or a badge),
    `selected` (`aria-current="page"`), `href` (a link) or `onClick`,
    `disabled`. Choosing it closes the drawer.
  - `Sidebar.Toggle`: the toolbar button that opens the drawer, labelled
    "Open navigation" unless you pass `label`; hidden on md and up.

  It follows the Muse web app's Library sidebar (`LibrarySidebarNav.react.tsx`
  and `nav/`): 240px on the page background with a divider on its end edge,
  12px side padding, 36px rows with 12px corners and 1px between them, a 24px
  icon box (18px glyph), subheadline labels, caption trailing text, and the
  same light fill for hover and the selected row.

Disabled and loading buttons stay focusable and are announced with
`aria-disabled`, but do nothing. Hover and press feedback is immediate with no
scale, and the focus ring shows only for keyboard focus.

## Labels

`Toolbar.Back` ("Back"), `Sidebar.Toggle` ("Open navigation") and the `Dialog`
close button ("Close") have English default labels. In an artifact whose
interface uses another language, pass `label` (`closeLabel` on `Dialog`) in
that language.

## Safe areas

The components carry their own safe-area handling, with the
`tailwindcss-safe-area` utilities the Muse `theme.css` imports, so a Space built
from them meets the `supportsSafeAreas` requirements:

- `Toolbar` draws under the status bar with `pt-safe` and replaces
  `SafeAreaTopScrim`; its 60px row sits below the inset, and its 20px and 12px
  side padding sits on top of the side insets
  (`ps-safe-offset-5 pe-safe-offset-3`).
- `TabBar` is fixed to the bottom with `pb-safe px-safe`. It reserves only its
  52px row in the page, because the SDK root already pads the page bottom by
  the inset.
- `Dialog` is centered inside `pt-safe-offset-4 pb-safe-offset-4
  px-safe-offset-4`, clear of the status bar and the home indicator.
- `Menu` adds the measured insets to its collision padding and scrolls within
  the space left.
- `Sidebar` pads its top, bottom and start edges (`pt-safe pb-safe ps-safe`,
  growing by the start inset so its content stays 240px), inline and in the
  drawer. A `Toolbar` beside it on md and up is away from the screen's start
  edge, so it drops the start inset there and keeps its end inset; on phones,
  where the sidebar is a drawer, it keeps both.

## Styling

Colors are the template's semantic roles (`bg-popover`, `bg-primary`,
`text-foreground`, ...), so the components follow the shell's light/dark and
accent and any `--primary` a Space pins. Type uses the Muse ramp in
`typography.css`. The template's `theme.css` has an `@source` for this
package's `dist/*.js`, so the Space's Tailwind build generates the classes.

`Button` and `IconButton` adapt Dreamer's UI components
(fbcode/third-party/dreamer/clients/web/src/components/ui) to Muse sizing,
type and color roles.

## @hatch/base-ui

`@hatch/base-ui` is every public Base UI 1.9.0 entry point (all exported
subpaths except `internals/*`), unstyled, for anything these components do not
cover. Import a part by its Base UI subpath and style it with the same roles:

```tsx
import { Popover } from "@hatch/base-ui/popover";

<Popover.Root>
  <Popover.Trigger className="rounded-full bg-secondary px-4 py-2">Details</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner sideOffset={6} className="z-50">
      <Popover.Popup className="rounded-2xl bg-popover p-3 text-popover-foreground">...</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

The components import the same package (`@hatch/base-ui/button`, `/tooltip`,
`/dialog`, `/drawer`, `/menu`, `/toolbar`), so a Space that uses both has one
copy of Base UI.

## Packaging

`ts-runtime/build.mjs` builds both packages:

- `dist/base-ui.tgz`: Base UI's public entry points built together with code
  splitting and React external, so every subpath shares one set of chunks and
  hooks use the Space's React, plus Base UI's declarations (and the
  floating-ui, Base UI utils and reselect ones they reach) copied with their
  imports rewritten, so a Space typechecks without installing Base UI.
- `dist/muse-ui.tgz`: `src/` compiled per file. `@hatch/base-ui` is an optional
  peer, because a required peer on a `file:` package makes bun look it up in
  the registry.

Only the Muse template lists them (`SpaceTemplateSpec::packages`, base-ui
first): the scaffold adds `file:` dependencies on both tarballs and installs
them on top of the prebaked tree with no registry access. Icons need
`@hatch/space-sdk` 0.14 or later. The glyphs the components draw themselves
(close, check, back, menu and search, the same XMDS icons the Muse web app
uses for those controls) are copied from
`spaces/icons/icons.json.gz` at weight 400 in
`src/glyphs.ts`.

## Updates

Existing Muse Spaces move to the deployed `@hatch/base-ui` and `@hatch/muse-ui`
on their next edit (`bun update` of the packages their `package.json` lists,
after the SDK's), so every change must be additive. A breaking change,
including a Base UI major version, needs a managed upgrade in `upgrades.json`
with rewrite instructions. Components may use only style tokens that every
shipped Muse template's `theme.css` and `typography.css` define.
