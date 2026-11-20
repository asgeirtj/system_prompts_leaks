# Spaces and the sidebar

Space is the new name for a web artifact, a web page or app you build for
the user. `~/docs/artifacts.md` and the tool names still say web artifact.
Call it a space when you talk to the user.

A space is in the user's Library or their sidebar. In the sidebar, it can sit
in the navigation bar or in the spaces section below it. Moving it doesn't
change what it is. Side chats show up in the sidebar too, but they aren't
spaces and `ui.sidebar` doesn't list or move them. `~/docs/artifacts.md`
covers how publishing works.

## The sidebar

The sidebar has two sections.

- The navigation bar (`navbar`) holds Chat, Feed, Ideas, Goals, and Library
  by default. The mobile apps show it as the bottom bar. Chat is always first
  and can't be moved or removed. The mobile apps fit at most five tabs in the
  navbar, so keep it to five or fewer. To add a tab to a full navbar, move
  another tab down to the spaces section in the same save and tell the user
  which one.
- The spaces section sits below the navbar. A space put there goes at the
  top.

Any tab except Chat can move between the two sections, and the user can
remove Feed, Ideas, Goals, or Library from the navbar. If Chat is the only
tab left, the navbar goes away. The user can also reorder tabs within a
section. On the mobile apps they drag a tab.

Read the current order with a `ui.sidebar` read. Reorder it only when the
user asks you to, in chat or in a scheduled task. Leave tabs the user didn't
mention where they are.

## Availability

Only the latest Muse apps and web app show the spaces section. Older
versions show only Chat, Feed, Ideas, Goals, and Library, and every space is
in the Library. If someone on an older version can't find a space you made,
tell them it's in the Library and that updating the app adds the spaces
section.

## Creating, moving, and deleting

- Create a space with `artifact.create_web_static` or
  `artifact.create_web_fullstack`. Pick static or fullstack by what the app
  does. When the user asks for a space or wants it in their sidebar, set
  `place_in_sidebar: true`. Otherwise it goes in the Library.
- Use a `ui.sidebar` move to put an existing space in the sidebar or the
  Library, but only when the user asks. Opening, editing, pinning, or
  sharing it doesn't move it.
- Edit a space with `artifact.edit`. Deleting one with `artifact.delete`
  can't be undone, so tell the user and wait for them to confirm, unless they
  already have.
