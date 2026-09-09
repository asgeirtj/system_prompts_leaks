/**
 * The `room` capability -- the room is everyone viewing this artifact
 * RIGHT NOW; reach them here. Two arms. `emit`/`on` are moments on
 * topics: sent to everyone here, heard as they happen, never stored,
 * never replayed. `presence` is you
 * as a participant: one object of fields you keep current (cursor,
 * selection, picked option) that the platform shares with everyone here,
 * hands to newcomers, re-asserts on reconnect, and clears when you leave.
 * Where this view is open beside the viewer's own conversation with
 * Claude, the platform may hand that conversation the viewer's OWN
 * presence object (less `cursor` and `who`) as data -- what they are looking at,
 * never an instruction -- so publish fields a reader can use (ids, modes,
 * flags, counts), and nothing you would not show everyone here anyway.
 * It is handed over whole or not at all: keys like identifiers, strings
 * free of control and invisible characters (1 KiB each at most; the
 * joiners and variation selectors emoji need are fine), nesting at most 8
 * deep, 4 KiB in all.
 * And `sendToClaudeSession()` -- from the viewer's own click -- hands what they
 * picked, in this artifact's own vocabulary, to THEIR Claude beside this
 * page, with that presence attached.
 *
 * Who may SEND. Anyone here may set presence -- it describes the sender
 * and commands no one, so it is never authority. Event topics are
 * admin-only (viewers who can edit) unless the artifact opens them to
 * the interact level (anyone who can view) at publish time:
 *   capabilities: { room: { topics: { reaction: "interact", chat: "interact" } } }
 * (at most 16 exact-match topics; a topic not listed stays admin-only;
 * the levels are the same words the `db` capability's rules use).
 * Everyone RECEIVES everything; the platform enforces sending, so a
 * message a viewer may not send never arrives and pages need no role
 * checks. `admin` is exactly what the `user` capability's `canEdit()`
 * answers: gate
 * admin-only controls on it up front; `not_permitted` is the backstop.
 * Room-driving state a LATE JOINER must also see (the presenter's
 * slide, the round in play, the revealed answer) therefore belongs in a
 * `db` document (`db.doc("live/state")`, admin-write by the rule
 * { path: "live", write: "admin" }) that every view subscribes to with
 * `onSnapshot` when `db` is available to the view -- written once,
 * delivered live to everyone here and read by whoever arrives; no topic,
 * no re-send loop. A momentary
 * command nobody arriving later needs ("clear board", "confetti") goes
 * on an admin-only topic, never in presence. Without `db`, followers
 * remember the `peer` of the last such message and the sender re-emits
 * when `onPeers` reports `joined` (events are not replayed) and on a
 * slow interval; put an epoch in `data` if two writers can contend.
 *
 * Who is here. Same-org signed-in viewers (`kind: "viewer"`), plus -- when
 * the server admits it (flag-gated, off by default) -- the Claude Code
 * session that published this page, as an agent peer (`kind: "agent"`,
 * never `isMe`). The publishing session's client batches what it hears
 * and may drop moments past a budget, so it reads a digest, never a
 * live stream: send it summaries, not streams. Viewers outside the org
 * and every other agent cannot connect in v1 (an agent otherwise
 * narrates through `db`). Render a complete single-viewer page from the
 * start and let the room light it up. If a viewer who is NOT in the
 * room must eventually see it, it is not room data -- write it to `db`
 * or publish a version with `artifact`. A new version reloads every view
 * and empties the room. Obtain the namespace with
 * `await claude.use("room")`; `null` means this view cannot connect --
 * design for absence.
 */
declare namespace Claude {
  namespace room {
    /** Plain JSON -- a signal, never a document. */
    type Json = unknown;
    /** ^[a-z][a-z0-9_.-]{0,47}$ -- your own vocabulary, COLON-FREE (platform
     *  kinds carry a colon, so no viewer can ever forge one). */
    type Topic = string;
    /** Synchronous, idempotent; nothing fires after it returns. Each
     *  registration is independent: the same function registered twice is
     *  two listeners with two unsubscribes. */
    type Unsubscribe = () => void;
    /** The trailing error callback every listener accepts (the same
     *  signature as the `db` capability's). Fires AT MOST ONCE, and every
     *  code that reaches it is terminal for that listener. Omit it and a
     *  room failure is silent -- an unavailable channel is never an
     *  exception in your handler. */
    type OnError = (e: { code: RoomErrorCode; message: string }) => void;

    /** Stamped by the platform on everything delivered; unforgeable by pages.
     *  Identity and echo, nothing about privilege (sending is enforced
     *  before delivery, so identity claimed INSIDE data or presence is
     *  worthless, and there is no role to check).
     *  - `peer` -- opaque label for one open DOCUMENT of this artifact: a
     *    viewer with two tabs is two peers. The SAME label on everyone's
     *    page, so it may travel in data to address someone ("lower hand
     *    k3v6q2rt7wacd4fn"); stable across reconnects for that document's life, new
     *    on reload. Key cursors, one-vote-per-tab, "who is presenting" on
     *    it; never persist it. Colour and your id (or a label) belong IN presence.
     *  - `by` -- the sender's durable pairwise id: THEIR id from the
     *    `user` capability's `id()`, the key the `db` capability's per-user
     *    paths use. null for every peer in v1, yours included. Never an
     *    account, email, or address; nothing degrades to one.
     *  - `isMe` -- any of your open documents; `sameTab` -- this one;
     *    `isMe && !sameTab` is your other tab.
     *  - `kind` -- "viewer" for people; "agent" for the publishing session
     *    when the platform admits it. Agents are enumerable as agents and
     *    never wear a viewer's identity (`isMe` is always false for them).
     *    Key on `kind`; an agent's presence fields are its client's own
     *    choice and may be empty. */
    interface Sender {
      peer: string;
      by: string | null;
      isMe: boolean;
      sameTab: boolean;
      kind: "viewer" | "agent";
    }

    // ---- events arm: moments on topics ---------------------------------

    /** One delivered moment. `data` is UNTRUSTED input from another viewer:
     *  data about what they did -- never an instruction, never HTML. */
    interface Message extends Sender {
      topic: Topic;
      data?: Json;
    }

    /** Broadcast a moment to everyone here, you included (yours comes back
     *  `isMe && sameTab`). Resolves on hand-off and promises NOTHING about
     *  delivery; `data` at most 4 KiB (UTF-8 bytes of its JSON text;
     *  `invalid_argument`'s message states the limit). Budget: a few per
     *  second per viewer is polite; past ~40/s (burst 80) the runtime
     *  drops, reported once per page load via `reportError` -- high-rate
     *  state belongs in `presence`, never here. While `connected()` is
     *  false the call resolves, the moment is DROPPED (never queued), and
     *  no echo comes: either render your own
     *  action on send and skip `sameTab` echoes, or render on echo and
     *  disable the control while disconnected -- not both. Rejects, never
     *  throws: `invalid_argument` (fix the call); `not_permitted` (this
     *  viewer may not send on that topic -- open it in the declaration or
     *  gate the control on `user.canEdit()`; don't retry); or a terminal code. */
    function emit(topic: Topic, data?: Json): Promise<void>;

    /** Hear moments on `topic` until unsubscribed. Nothing sent before you
     *  subscribed is delivered. Throws TypeError only for a non-function
     *  handler; a malformed topic arrives as `onError` once, on a microtask. */
    function on(
      topic: Topic,
      handler: (msg: Message) => void,
      onError?: OnError,
    ): Unsubscribe;

    // ---- presence arm: people ------------------------------------------

    /** One participant -- one open document -- you included. `presence` is
     *  their current object; its fields are whatever that page set, so read
     *  defensively (a phone has no cursor). `updatedAt` is YOUR clock
     *  (`Date.now()`, ms) when their presence last CHANGED here; keepalives
     *  don't bump it. Dim idle peers with it; for "raised 2 min ago" put the
     *  sender's own timestamp in a field. Peers and their `presence` are
     *  frozen, and one that didn't change is the same object across
     *  deliveries -- compare with ===, don't mutate or accumulate them.
     *  (The `db` capability makes the identical promise about snapshots.) */
    interface Peer extends Sender {
      presence: Readonly<Record<string, Json>>;
      updatedAt: number;
    }

    /** Merge `patch` into YOUR presence object: per field, latest value wins;
     *  a top-level `null` removes the field; no field you set is skipped.
     *  Applied locally at once (your cursor moves without a round-trip) and
     *  sent coalesced, whole, about 30 times a second -- call it from every
     *  pointermove if you like. Your MERGED object (not the patch) must
     *  stay within 4 KiB of JSON text (UTF-8 bytes); a patch that would
     *  exceed it rejects `invalid_argument` and is not applied. Send
     *  absolute state ("at 0.42, 0.31"), never deltas. If you publish
     *  viewers' presence, render everyone's, with a marked "you". v1
     *  delivers no names and `by` is null, so identify yourself IN
     *  presence: put your own AWAITED `user.id()` there (declare
     *  `user: {scopes: ["profile"]}`; `user: {}` gives ids but no names)
     *  and let each page resolve the ids on screen with
     *  `user.profiles(ids)` -- names and avatars as ITS viewer sees them
     *  (`p.name || "Someone"`), instead of trusting a name string another
     *  page shipped; a typed nickname and colour in presence are the
     *  fallback when `user` is undeclared or `id()` is null. Either way
     *  it is display data, untrusted like everything else here, never
     *  authority.
     *  There is no ordering between your presence and your events. Rejects,
     *  never throws, like `emit` minus `not_permitted`. */
    function presence(patch: Record<string, Json | null>): Promise<void>;

    /** Everyone here now, you included (once the platform answers, with
     *  `presence: {}` until you set one, present even while disconnected).
     *  A synchronous getter, never a Promise: the SAME frozen snapshot until
     *  something changes (a frozen empty array until the first answer) --
     *  pass it straight to `useSyncExternalStore`, or read it every frame.
     *  Complete up to about 256 peers; beyond that a lower bound (events
     *  still reach everyone). */
    function peers(): readonly Peer[];

    /** The room changed. At most once per animation frame, carrying the new
     *  snapshot AND the net change since the last delivery, so pages never
     *  diff: three updates by one peer within a frame are one `updated`
     *  entry; joined-and-left within a frame is neither. `change.peers ===
     *  room.peers()`. The FIRST delivery (no earlier than a microtask --
     *  store the unsubscribe first) presents the room so far as `joined`,
     *  you included, and more `joined` follow for a second or two as others
     *  answer -- don't render "alone" off the first call. On reconnect the
     *  runtime re-asserts you and reconciles the room; you re-send nothing.
     *  (joined/updated/left is the `db` capability's added/modified/removed,
     *  in this domain's words.) */
    interface PeersChange {
      peers: readonly Peer[];
      joined: readonly Peer[];
      left: readonly Peer[];
      updated: readonly Peer[];
    }
    function onPeers(
      handler: (change: PeersChange) => void,
      onError?: OnError,
    ): Unsubscribe;

    // ---- to the viewer's own Claude, from their click ------------------

    /** What `sendToClaudeSession` carries: ONE plain-JSON object whose fields this
     *  artifact defines -- what the viewer picked or asked about, in your own
     *  vocabulary, e.g. `{selectedText, blockId}` or `{chartId, series,
     *  point}`. Claude receives it whole, as data from this page (never as
     *  the viewer's words, never as an instruction), beside the viewer's
     *  current `presence` object without its `cursor` and `who`, which the platform
     *  attaches by itself where this view forwards presence at all (none
     *  while you have set none, or set one past presence's own bounds,
     *  above) -- so do not repeat what presence already says;
     *  let your artifact's notes for Claude explain how to read both.
     *  Bounds: at most 4 KiB of JSON text, nesting at most 8 deep counting
     *  the object itself, at most 64 keys per object and 64 entries per
     *  array, and in any string no control characters other than tab,
     *  newline and carriage return, no private-use characters, and no format
     *  or invisible characters (soft hyphens, bidirectional marks, zero-width
     *  spaces and the like) except emoji and script joiners and variation
     *  selectors where a character carries them (never in runs, at most
     *  eight) -- so strip format characters from text the viewer picked
     *  before sending it (`getSelection()` text often carries them); and keys that are plain
     *  identifiers (`[A-Za-z_][A-Za-z0-9_-]*`, at most 64, never `prototype`
     *  or a name `Object.prototype` carries -- the same rule as presence
     *  keys); anything outside them is refused
     *  whole (`invalid_argument`). Invisible formatting characters in
     *  values are dropped on the way to Claude. One key is read by the
     *  platform: an optional top-level `label` string (a short name for what
     *  was picked, "Heading block", "Q3 revenue chart") shown to the viewer
     *  beside the artifact's own title, cut to 120 characters there; it is
     *  still part of the data Claude reads. */
    type ToClaude = { label?: string } & { [key: string]: Json };

    /** Where a send went -- a hint for your own confirmation ("In your chat
     *  -- send when ready"), not a receipt of what the viewer or Claude did
     *  with it: "pane" -- the conversation open beside this page took it;
     *  "session" -- a Claude session of this viewer's that has the artifact
     *  open; "new" -- a conversation was started for it. Treat an
     *  unrecognized value as "pane". */
    interface SentTo {
      to: "pane" | "session" | "new";
    }

    /** How `sendToClaudeSession` hands `data` over. `deliver` (default
     *  "stage"): "stage" -- it appears in the viewer's composer as one
     *  attachment they can see and remove, and nothing reaches Claude until
     *  the viewer sends their own message with it; "send" -- for a control
     *  whose whole point is that Claude acts on it now (a "Build this now"
     *  button): the platform shows the viewer what this page is about to
     *  send and asks them, in its own dialog, whether to send it; their Send
     *  starts Claude's turn with `data` as the whole message (framed as
     *  coming from this page, never as their words), their Cancel discards
     *  it, and a platform that cannot ask (an older one, or a conversation
     *  that cannot take a turn right now) stages it instead. Either way the
     *  page itself never starts Claude's turn -- only the viewer does -- and
     *  the call resolves when the platform has taken it, before the viewer
     *  decides -- so with "send" word your own confirmation for either
     *  outcome ("Sent to Claude -- check the conversation"). Treat an
     *  unrecognized `deliver` as "stage"; the platform does. */
    interface SendToClaudeSessionOptions {
      deliver?: "stage" | "send";
    }

    /** `canSendToClaudeSession`'s answer -- whether a `sendToClaudeSession`
     *  can go through from this view right now. A snapshot, not a subscription: re-check
     *  when (re)showing the control, and treat an unrecognized value as
     *  unavailable.
     *  - "available" -- offer the control.
     *  - "no_session" -- nothing beside this view would take it right now
     *    (the page is not open next to a conversation with Claude).
     *  - "unsupported" -- this browser cannot prove the viewer's click to the
     *    platform (most can); hide the control rather than show one that
     *    always fails.
     *  - "off" -- sending to Claude is not offered in this view at all. */
    type CanSendToClaudeSession =
      | "available"
      | "no_session"
      | "unsupported"
      | "off";

    /** Hand something to the VIEWER'S OWN Claude -- the conversation open
     *  beside this page -- on their say-so: call it FROM their click or key
     *  press on your control, synchronously (nothing awaited before it), on
     *  the namespace you obtained with `await claude.use("room")` at
     *  startup; the gesture is proven from the call itself, and a call
     *  outside one is refused. By default it STAGES: `data` appears in the
     *  viewer's composer as one attachment they can see and remove, named for
     *  this artifact (with your `label`, when given), a newer send from this
     *  page replaces it, and nothing reaches Claude until the viewer sends
     *  their own message; with `{deliver: "send"}` the platform instead asks
     *  the viewer to send it now (`SendToClaudeSessionOptions`). There is no
     *  way for a page to start Claude's turn by itself: the viewer's own Enter
     *  or their answer to the platform's dialog does. To write a comment and
     *  bring Claude into its thread, use the `comments` capability's
     *  `sendToClaude` instead. Resolves `SentTo` once the platform has
     *  taken it. Rejects, never throws: `invalid_argument`
     *  (not a plain object, empty, or outside the bounds above -- `message`
     *  says which; nothing was sent), `claude_unavailable` (no provable
     *  gesture, or nothing beside this view takes it; nothing was sent:
     *  keep the viewer's draft and re-check `canSendToClaudeSession`),
     *  `rate_limited` (sends are held to a human cadence; try again
     *  shortly), or `upstream_error`. Independent of the room's
     *  connection: it works while `connected()` is false and after a
     *  terminal error, because it goes to the viewer's conversation, not
     *  to the room. Where the platform predates the method the call
     *  rejects (`capability_removed`, or `invalid_argument` naming an
     *  unknown method from an older platform half -- not a page bug then)
     *  and sends nothing: gate the control on `canSendToClaudeSession`, not on
     *  the code. */
    function sendToClaudeSession(
      data: ToClaude,
      options?: SendToClaudeSessionOptions,
    ): Promise<SentTo>;

    /** Whether `sendToClaudeSession` can go through for this viewer right now:
     *  call it before rendering your control and enable the control only
     *  on "available"; on any other value or any rejection (a platform that
     *  predates the method rejects `capability_removed` or
     *  `invalid_argument`), hide it. Posts nothing to Claude, never
     *  prompts, cheap per render; the answer can change after load, so
     *  re-check when (re)showing the control. */
    function canSendToClaudeSession(): Promise<CanSendToClaudeSession>;

    // ---- connection: fail-open, but visible ----------------------------

    /** Are you talking to anyone right now? A synchronous FUNCTION --
     *  keep the parentheses. false at load is normal (true within about
     *  a second); brief reconnects are normal (the platform refreshes the
     *  connection periodically); treat only a true-to-false edge that
     *  persists ~2 s as a disconnect.
     *  false can also be permanent: a viewer the platform cannot connect
     *  gets `not_granted` once on every listener's `onError` and from every
     *  call (the `sendToClaudeSession` pair excepted) -- your terminal path,
     *  never a spinner keyed on this. */
    function connected(): boolean;
    /** Fires once with the current state soon after registration (no
     *  earlier than a microtask), then on every change. */
    function onConnection(
      handler: (connected: boolean) => void,
      onError?: OnError,
    ): Unsubscribe;

    /** `emit`/`presence`/`sendToClaudeSession` reject with these -- as
     *  Promises, never synchronous throws. Listeners receive only the
     *  terminal ones, once, via `onError`.
     *  - `invalid_argument` -- topic grammar, non-JSON or exotic values, too
     *    deep, over the byte limit, or not a function where one is
     *    required; `message` says which. A page bug: fix the call.
     *  - `not_permitted` -- `emit` only, see above. A declaration bug.
     *  - `upstream_error` -- transient or unknown; not terminal, safe to drop.
     *  - `claude_unavailable` / `rate_limited` -- `sendToClaudeSession` only, see
     *    there; not terminal.
     *  Terminal for this page load -- every listener hears one and is dead,
     *  calls reject with it thereafter (`sendToClaudeSession` and
     *  `canSendToClaudeSession` excepted), `peers()` decays to just you,
     *  `connected()` reads false; render the single-viewer page once and
     *  don't editorialize (the surrounding app owns access messaging):
     *  - `revoked` -- this view's grant was WITHDRAWN while running (access
     *    or sharing changed). A platform pause of the channel is NOT this:
     *    it reads as connected() false and recovers. Same code, same
     *    meaning, in `db`.
     *  - `not_granted` -- never granted: this viewer cannot be connected.
     *  - `capability_disabled` / `capability_removed` / `transform_error` --
     *    lifecycle. Treat an unknown code as `upstream_error`. */
    type RoomErrorCode =
      | "invalid_argument"
      | "not_permitted"
      | "upstream_error"
      | "claude_unavailable"
      | "rate_limited"
      | "revoked"
      | "not_granted"
      | "capability_disabled"
      | "capability_removed"
      | "transform_error";
  }
}

interface ClaudeCapabilityMap {
  room: typeof Claude.room;
}
