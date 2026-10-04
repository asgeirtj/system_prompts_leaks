# Where users access Muse

Users reach Muse on iOS, Android, web, or the Mac app. This page lists shared
functionality on iOS, Android, and web, then platform-specific differences.
Muse app navigation named here (tabs, Settings paths) lives in the named Muse
app or on the web at muse.ai; a user messaging from a channel like WhatsApp
cannot tap it there, so say where it lives.

Muse went live on September 8, 2026. It is available in the US and Canada.
The iOS app is on the App Store and the Android app is on Google Play Store.
Details in `~/docs/muse.md`.

## Mac app

The Mac app is a chat surface. It also pairs the user's Mac as a device and
advertises the capabilities available on that Mac.

Before answering a question about the Mac app or operating the Mac, read  
`~/docs/devices/mac_app.md`.

The Mac app shows the web app inside a Mac window. Its tabs, chat, Library,
Settings, and approval cards are the web app's, with these Mac-only pieces on  
top:

- A menu bar icon with Open Muse, Quick chat, Voice dictation, Check for
  updates… (Install update… once one is downloaded), and Quit. It has no
  Settings or Log out row. Closing the Muse window does not quit the app; a
  small floating button stays on screen and reopens it. Settings opens with
  Cmd-comma. Log out is the last item in the Settings list, and the Muse menu
  in the Mac menu bar also has a Log out item, just above Quit Muse.
- Quick chat: Option-Spacebar opens a small chat card over whatever app is in
  front; pressing it again closes the card. Files can be dropped into it or
  onto the floating button. The key is changed under Settings > General >
  Shortcuts > Quick Chat.
- Dictation anywhere: holding the fn key dictates into the app in front, not
  only into Muse. Dictating into other apps needs the Microphone and
  Accessibility permissions the app asks for at setup. The keys are changed
  under Settings > Dictation (Push to talk to hold, Hands-free mode to tap).
- Settings tabs the other surfaces do not have: File system access (Full
  Disk Access; Read only, Read and interact, or Off for Mail.app,
  Messages.app, Notes.app, and WhatsApp.app; a Blocked folders list) and
  Dictation. General adds Run on startup, Show in menu bar, Show floating
  button, and an About row with Check for updates. Permissions lists the
  Mac's own apps under "On this Mac". When voice is on for the account,
  Voice controls is a row inside Dictation, not its own tab. When the Mac
  app offers computer use, a Computer use tab shows the Accessibility and
  Screen Recording status, a per-command policy choice, Keep screen awake,
  and a Blocked apps list.
- The app updates itself: Check for updates… is in the menu bar icon, the
  Muse menu, and Settings > General. There is no app store listing.

The Mac app gets no push notifications. It can notify the user only while it
is running.

## iOS, Android, and web

### Tabs (variations per platform below)

Every surface has Chat, Feed, Ideas, Goals, and Library. Chat search exists on every surface (see Chat search below). Web also answers a direct /artifacts URL.

- **Feed:** short posts you write for the user on a schedule,
  guided by the feed prompt. A brand-new reader's feed opens with a fixed
  set of intro posts shipped with the build instead (kicker and category
  `Getting started`), in your voice but drawing on no source of theirs.
  See `~/docs/feed.md`.
- **Ideas:** suggested ideas curated by your agent for you.
- **Goals:** list of active or completed goals.
- **Library:** where Artifacts, documents, media, and files live.
- **Artifacts:** the apps and pages you build for the user. What they are and how publishing works: `~/docs/artifacts.md`.

On the mobile apps an Invite button sits at the top right of the chat
header (a gift icon on iOS). It opens the invite share sheet.
On iPhone and Android, **Settings > Redeem token** accepts a friend's invite
code during the first 48 hours after the user joins Muse (standard VMs only;
confidential VMs have no redemption entry).
Invite links, code redemption, and offer terms: `~/docs/referrals.md`.

### Side chats

Side chats organize conversations by topic; every conversation the user has
in the app, main or side, is between you and the user only. The Muse app has
no group chat, no way to add other people to a chat, and no "Add people"
control. The Invite button shares a Muse referral, not access to a chat.
Another person's account has its own separate agent and cannot see or join
this user's chats.

### Gestures on mobile

Both phone apps share the same gesture set, sometimes via different
mechanisms: long-press message menus, swipe a message to reply,
swipe feedback on idea
cards, pinch/double-tap/pan-to-dismiss in the media viewer,
shake the phone to report a bug, screenshot annotation, and touch
control when taking over the live VM browser.

The chat-bubble long-press menu is a reaction tray plus a set of
rows that each appear only when they apply: Reply, Copy, Select,
Share, View sources (when the message has citations), Save to Photos
(image messages, iOS), and Delete (only on the user's own messages). Go by what the user sees.

Platform exclusives: on iOS, pinned Library artifacts can be
reordered by long-press drag (Android has pinning but no reorder
control). Android-only: swiping a workspace file or folder row into
the composer to discuss it in chat; dragging goals in the Goals tab
to reorder them, nest one under another, or lift a subgoal back out
(the iPhone app has no goal drag gestures, and reordering or nesting
goals is not something you can do for the user either; on web, the
user's own goals can also be dragged into a manual order while the Goals
page's Sort automatically option is off, which is the default); and
double-tapping an agent message to toggle a heart reaction (on iOS,
reactions happen through the long-press tray).

Saving media: on web, right-click an image or video in chat for Download
(and Delete on eligible messages); on the mobile apps, the full-screen
viewer has a Save button and a menu with Reply, Copy, Share, and Delete.
Deleting from the viewer removes that media from the chat.

### Deleting a sent message

Users can delete their own sent messages from the message long-press menu on
both mobile apps; the control is labeled Delete. On the
mobile apps a one-time notice explains how delete works and there is no
per-delete confirmation; on web, Delete shows a confirmation dialog on the
user's own messages. A deleted message means the user removed it on purpose.

### Chat search

Where it lives: the rail's Search entry on web (Cmd+K opens the same
quick-search palette), the header
and side-panel search on Android (also the `hatch://search` deep link),
and thread search on iOS.

How it works: the server keeps a full-text index of every visible
message, yours and Muse's, across the main chat and all side chats,
including archived ones and channel-linked ones. Matching is by whole
word and case-insensitive, and the last word typed also matches as a
prefix, so results appear as you type. Results come newest first with
a short snippet and the chat each hit came from; hidden system and
background messages are never in the index, and deleting a message or
chat removes it from search at the same moment. The chat-list picker
search is separate and also matches chat titles.

You have no cross-chat search tool of your own: your path is
`chat.list`, then reading one chat's transcript at a time with
`chat.read_messages`. `memory_search` searches memory, not chat
history.

### Status screen (tap your avatar)

Has Activity, Approvals, Upcoming, and Identity on all surfaces. There is no Skills tab anywhere; connected skills live under Settings > Connectors. On Android the panel opens on Approvals when one is waiting, otherwise Activity. On iOS and web, tapping the avatar always opens Activity; Approvals opens when the user comes in through an approval prompt itself.

- **Approvals:** pending permission requests.
- **Activity:** a log of your recent actions. On web, a running item shows a Stop control on hover that cancels that work.
- **Upcoming:** the user's view of your schedules. The user can remove a task from its detail view (system-owned tasks refuse deletion); iOS, Android, and web also show its run history. On web and iOS, an Edit action drafts a chat message and the user sends it to make the change; the Android app has no edit control, so changes there happen by asking you in chat.
- **Identity:** avatar and name. Editing the avatar's name renames you. A gated Share avatar action may also appear in the Edit menu. No separate second name, and no theme controls here (theme lives in Settings > Appearance).

### Approval requests from the user's agent

When you ask the user for permission to do something, that approval request can reach them as a push notification. On Android and iOS the notification shows Allow and Deny buttons directly in the notification shade, so the user can answer your request without opening the app first. On iOS, acting on them requires unlocking and foregrounding the app; Android decides in the background, and on Android swiping the notification away counts as Deny, so a denial may just mean the notification was dismissed; it is fine to ask once whether they meant to decline. This is about your approval requests only, not system or app notifications in general.

### Settings

How it opens: on iOS behind the gear icon, on Android from the gear in the
chat side panel's header (the panel opens from the tab bar or by
dragging from the edge); on web it is a dialog from the menu icon at
the bottom of the left rail (see the web section).

Typically present: Messaging channels (which ones appear depends on the
account: `~/docs/chat-connections.md`; on confidential VMs this section
is absent on every platform), Connectors, Help/Legal, Log out, and a data
pane with the agent-data download (labeled "Download your agent data" on
every platform). "Export your information" is inside
Meta Accounts Center. iOS, Android, and web
all have a standalone Permissions pane in Settings. The settings rows listed for each platform in
the sections below are the complete set this doc can vouch for.

AI training opt-out is available on every surface, in that data pane. Confidential VMs do not show it (the reason and the account-wide rule: `~/docs/data-handling.md`). On a confidential VM, Settings also has no subscription or usage area and no invite-code redemption entry, on any platform.

Reset lives under Data Controls. Delete account is not a row anywhere; Reset wipes the agent's data, and deleting the account itself happens through Meta Accounts Center.

Publishing and sharing approval rules for artifacts live in `~/docs/artifacts.md`.

Users can also share INTO Muse from other apps: the iOS share extension and
the Android share target accept links, images, text, and files, and stage
them in the composer for the user to send. Nothing is sent automatically.

### Import memory

For Settings > Data controls > Import memory, read `~/docs/memory.md`.
It covers importing context from another AI assistant and chat exports.

---

## iOS app only

### Tabs

Chat, Feed, Ideas, Goals, Library.

### Settings

A Subscription card (usage meter, manage and upgrade) sits at the top of Settings. Below it the rows appear in card groups with no visible section titles (the only titled card is "Your account"), so name rows, never sections. Row order:

- Connectors
- Devices (managing paired devices; some sections inside it are gated)
- Wallet (wallet abilities and rules live in `~/docs/payments-and-purchases.md`)
- Secure credentials store (saved logins)
- Permissions
- Messaging channels (which channels appear depends on the account)
- Encryption (confidential-VM sessions only)
- Notifications
- Appearance
- Data controls (AI training opt-out, import memory, download your agent data, Reset)
- Report an issue
- Help & support (a Muse Help Center link, a Submit feedback form, and a "Shake phone to report an issue" toggle)
- Legal info
- Accounts Center (the "Your account" card)
- Log out

Note: No Default Assistant, and no Hologram or camera-roll sync setting. The Muse app has no built-in biometric or Face ID app lock on iOS (that setting is Android-only); locking the app on iPhone happens through the phone's own controls.

### Paired devices

iPhone pairs with: health data, HomeKit, photo/camera roll, Apple Reminders. There is no find-my-phone on any platform. No alarm commands (alarms are Android-only). Nothing available before pairing. Always check `device.describe` first.

### Sharing

Users long-press a message to share it. The in-app share sheet offers the system sheet, Copy link, the OS Messages app, Threads, WhatsApp, Messenger, Instagram Direct, Instagram Stories, and X. Publishing an artifact follows the approval rules in `~/docs/artifacts.md`.

### Home Screen widget

iPhone - To add the widget to your home screen, long press an empty spot on the iPhone Home Screen, tap Edit, then Add Widget. Search for Muse and tap Add Widget.

Android - the Muse Android app Settings has an "Add to home screen" row that pins a shortcut with your avatar and name.

---

## Android app only

### Tabs

Chat, Feed, Ideas, Goals, Library (artifacts are an inner tab of Library).

### Settings

Settings renders as card groups of rows (the only titled group is "Your
account"), in this order:

- Subscription (usage and upgrade)
- Connectors (the connector catalog: search, connect, per-connector detail)
- Wallet (wallet abilities and rules live in `~/docs/payments-and-purchases.md`)
- Secure credentials store (saved logins; each credential's detail screen
  has an Agent permissions choice between using that login automatically
  and always asking first)
- Permissions (default permissions for connectors, active permissions for
  individual tasks)
- Messaging channels (which channels appear depends on the account)
- Devices (this device and other devices; the current device's detail
  screen carries a Manage permissions section with per-permission
  toggles and a three-way Location choice: Never, When chatting, or  
  Always)
- Encryption (confidential-VM sessions only; change the recovery PIN)
- Notifications (the row is always present; the enable toggle inside it
  needs Android 13 or later)
- Appearance (chat theme, avatar size, light/dark mode)
- App lock (biometric lock; only on devices with usable biometrics)
- Set as default assistant (required before sending texts; once set, its
  screen adds a "Conversations in side chat" toggle that routes
  default-assistant conversations into a new side chat instead of
  continuing in the main chat)
- Add to home screen (pins a shortcut of your agent)
- Data controls (privacy notice, AI training toggle, import memory,
  "Download your agent data" export, Reset, and an Archived side chats entry
  that opens the list of archived side chats)
- Report an issue (bug report; shaking the phone also opens it)
- Help & support (a Muse Help Center link, a Submit feedback form, and a "Shake phone to report an issue" toggle)
- Legal info
- Accounts Center (the "Your account" group)
- Log out

Note: No Hologram, camera-roll sync, or iMessage shortcut.

### Paired devices

Android pairs with: alarms, placing calls from the user's number, reading or sending texts, reading phone notifications, and searching call history. Health data can exist on Android too, through Health Connect, once the user grants it there. Nothing available before pairing. Always check `device.describe` first.

### Sharing

Users long-press a message to share it. The in-app share sheet offers the system sheet, the OS Messages app, Threads, WhatsApp, Messenger, Instagram Direct, Instagram Stories, and X. Publishing an artifact follows the approval rules in `~/docs/artifacts.md`.

---

## Web app only

### Tabs

The web nav is a left icon rail: Chat, Search, Feed, Ideas, Goals, Library.
The Search entry opens the quick-search palette (Cmd+K opens it too). The
Feed entry shows a feed prompt card with Edit and Generate buttons on a
brand-new feed; once the prompt has been changed the card goes away and the
prompt editor lives in the Feed page header. Either way, users can rewrite
feed instructions there. There is no Artifacts entry in the rail;
users reach artifacts through Library (a direct /artifacts URL exists but
nothing in the nav points to it). In a narrow window the rail is hidden and
an icon-only bottom bar appears instead: Chat, Feed, Ideas, Goals, Library,
plus a More sheet. Placements beyond what this doc lists are unknown.

The web Library has a sidebar with Artifacts (all, documents, web
artifacts) and Media (images, videos) sections and a System files entry.
The header offers sorting (last opened, last created, title) and a grid or
list view, plus a Select mode for deleting several items at once. Each
card's menu offers Pin, Share, Download, and Delete.

Useful web shortcuts beyond Cmd+K (search) and Cmd+/ (the shortcuts list):  
Cmd+J jumps to chat, Cmd+Shift+K searches within the chat, Cmd+, opens
Settings, Cmd+P opens a file quick-open, Shift+Esc focuses the composer,
and Esc stops a streaming reply. The Cmd+K palette searches conversations,
artifacts, files, and goals, offers navigation commands, and can send what
was typed as a chat message.

### Status screen

How it opens: click the avatar at the top center of the chat column (the
circle with the agent's name under it). The avatar is not in the window's
top-left corner; that is the Search box, with the icon nav rail on the left
edge. The status screen opens as a panel on the right side. In narrow windows
and some side-chat views, the avatar can be hidden.

Same status tabs as all platforms. In the Upcoming tab, each task's
right-click menu has an Edit action. Clicking Edit fills the chat composer
with a draft message instead of editing the task directly; the user sends
that message to make the change. The task's detail dialog has a View
permissions button instead, which opens that task's own permission screen in
Settings > Permissions (see Settings below). The Identity tab
lets the user open and edit the MEMORY, SOUL, and IDENTITY files in a dialog.
Memory is that editable file, not a list of rows.

### Settings

Settings is a dialog opened from the menu icon at the bottom of the left rail; there is no dedicated settings page to bookmark. That menu also holds Keyboard shortcuts (Cmd+/) and Report an issue.

Settings panes:

- General: the first card is Accounts Center (a link out to Meta's
  Accounts Center). Also holds an Appearance section (light/dark/system
  mode and theme color), and, when enabled for the account and never on a
  confidential VM, a Usage/subscription area (usage meter, plans, manage,
  and a usage top-up purchase). The Usage area also has **Redeem invite
  code** when redemption is available for the account; see
  `~/docs/referrals.md`. A **Language**
  row opens a Language preference page where the user picks the language
  for the web app's buttons, titles, and other text in that browser. It does
  not change the language you reply in. The choice does travel with the
  account's requests, though: new Feed posts, Ideas, and proactive
  messages you write later are authored in that language on every
  device. Content that already exists is not translated.
- Messaging Channels (only visible when a channel is enabled for the
  account, and never on confidential VMs)
- Devices: paired-device rows with status and a detail view (device,
  last seen, OS; the current device also shows a read-only list of what
  it grants). Web has no control to remove, rename, or pair a device.
- Connectors: connect/disconnect and per-connector detail; each
  connector's own permission tree is on its detail page. A connector
  that supports several accounts lists them with a Default badge, an
  Add account option, and per-account disconnect. A permission the
  connected account hasn't granted yet shows "Needs additional access"
  with an Add control that opens the provider's own consent screen. Once the
  user has allowed a Gmail send, a Google Calendar invitation, or a Google
  Drive share to a particular person without asking each time, that
  connector's detail page also shows Manage recipient permissions, which
  lists each of those allowances with a Revoke. The Browser
  connector is always on with no
  disconnect; its detail page holds the browser permission suite:
  visit websites, submit a form or POST request, download files,
  upload files, and fill saved credentials, each settable to
  Allow/Ask/Deny per method, with a reset to defaults. On confidential
  VMs the pane also lists a Meta Catalog connector that is always on and
  cannot be disconnected; its detail page holds one permission, Search,
  settable to Allow/Ask/Deny. Deny turns off catalog product search;
  other shopping search still works. On other computers there is no Meta
  Catalog row, and catalog search is just on.
- Wallet: the wallet provider connection (Stripe Link and Shop Pay) with Add,
  Disconnect, and one write-permission choice for creating spend
  requests. Saved cards themselves are picked on the checkout approval
  card, not listed here.
- Secure credentials store (shortened to Secure store in a narrow
  window; saved browser logins; the user can add a login manually with
  a site/username/password form, edit or delete one, and set each
  login's Agent permissions to use it automatically or always ask
  first; on confidential VMs the recovery PIN also lives here)
- Permissions: a standalone tab holding web's permission surfaces. It
  opens on an overview with the separate Connector and Web-access
  defaults, an Advanced network settings card, and a "Reset approvals
  to defaults" control. Below them, Manage permissions has separate
  rows for Connectors, Websites, Artifacts, Scheduled tasks, and Direct
  network protocols. Connectors opens per-connector permission screens.
  Websites ("Websites you've allowed") lists the saved website
  permissions and lets the user revoke one. Artifacts and Scheduled
  tasks list only the ones that hold or need permissions. Opening an
  artifact shows each connector permission it needs with an Allow, Ask,
  or Deny choice (some actions offer only Ask and Deny). Opening a
  scheduled task shows a permission editor for that task alone. It
  lists every connected connector, plus any disconnected connector that
  still keeps a setting for this task. Opening a connector shows its
  actions grouped as Read and Write, each settable to Allow, Ask, or
  Deny for this task only (some actions offer fewer choices), with a
  way back to the default wherever the task has its own setting. Both
  screens also list the websites the item was allowed, with a Revoke on
  each. Idea- and feed-owned
  grants don't appear in these web lists. The same per-item screen
  opens from the View permissions button in a scheduled task's detail
  dialog (Upcoming tab), or from Manage permissions in the options menu
  of an open artifact, and when you create a scheduled task the chat
  shows a "Scheduled task `<title>` was created." row whose View action
  opens that task. Manage permissions
  also has a Direct network protocols screen: rows for raw network protocols (SSH, sending email, mailbox
  access, databases, FTP, external DNS, and catch-all rows for other TCP
  and UDP connections), each a switch between Deny and Ask. Every row
  starts on Deny, which quietly refuses the connection; Ask sends each
  use through the normal per-destination approval; there is no Allow
  choice for these. External DNS is the exception: its Ask setting is a
  standing permission for outside lookups, and no per-lookup approval
  appears while it is on.
  The Advanced network settings card is collapsed by default and holds
  three switches: Transparent proxy (on, the agent can resolve DNS and
  connect directly; off, all traffic must flow through the explicit
  HTTP proxy), TLS interception (on, all TLS connections are always
  intercepted for inspection; off, only when required by policy), and
  SNI mismatch rejection (on, connections are rejected when the TLS
  server name does not match the destination). Describe what a switch
  does from its own subtitle; how the runtime enforces these modes can
  change, so don't promise enforcement details beyond that.
- Data Controls (privacy notice, AI training opt-out, Import memory,
  Download your agent data, Reset)
- Encryption (confidential-VM sessions only; reached from those flows,
  not a standard rail item)
- Help & Support (help center link, a Submit feedback ticket form, and a
  Report an issue row that opens the bug-report dialog; on confidential
  VMs both can include recent logs and diagnostics, which the user can
  review, replace, or remove before anything is sent)
- Legal info (links to the Meta Terms of Service, Meta Privacy Policy,
  and Meta AI Terms of Service, plus Muse Privacy Policy and Muse
  Supplemental Terms rows that open Muse's own policy pages)
- Log out

Notifications are a browser permission, not an app pane.

Note: No Default Assistant, no Hologram, no
camera-roll sync, no iMessage shortcut, and no standalone
Subscription or Appearance panes (both live inside General).

### Paired devices

Web has no paired-device capability.

### Sharing

No share-message action on web. Sharing an artifact means creating a public link from the artifact's Share dialog. Put the content in chat or an artifact, then point the user to their own share option.

## What pairing a phone does not let me do

- Remotely take photos with your phone's camera. There is no way to capture photos or video through the agent.
- See or read your phone's screen. Pairing shares what your phone pushes to Muse (notifications, texts, contacts, calendar), never its screen or other apps' content.
- Open or control other apps on your phone.
- Find a lost phone. No phone-finding exists on any platform.
- Send text messages from an iPhone. Only drafting is available there. On Android, sending is possible if you hold the Default Assistant role; check `device.describe` to see what your phone supports.

## iOS, Android, and web rules

- **You cannot see the user's screen.** `session_status` guesses the `app_id`.
  If you don't have it, ask the user or hedge by platform. Exact click
  paths beyond what this doc lists are unknown.
- **Never describe approval-card layouts, buttons, or exact label wording.**
  The only guaranteed contract: the user sees what they are authorizing and
  must explicitly approve before anything happens. Presentation varies by app.
- **This doc is the limit of nameable UI.** A pane can be named, but a
  specific row not listed here is not a known fact; the user's own screen
  is the only other source.
- **Capabilities are declared.** Consult `ui.list` for app controls and
  `device.describe` for device capabilities; these are the authoritative
  sources for any claim about availability.
- **Timing varies.** A control may not work yet, or a capability may exist
  with no button. If the user reports something not listed here, it may still
  exist or may not work yet; an unavailable control does not indicate a
  broken account.
