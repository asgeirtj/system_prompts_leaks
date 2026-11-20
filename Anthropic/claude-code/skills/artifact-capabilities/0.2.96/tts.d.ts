/**
 * The `tts` capability -- text to speech: the page hands over text and the
 * viewer hears it in a Claude voice. The platform, not the page, fetches and
 * plays the sound; this page never receives it. The platform may also show
 * the viewer its own control, with a Stop button, outside the page; the page
 * cannot tell whether it does for a given reading, and it may appear
 * part-way through one. So whenever the state is not "idle", show your own
 * Stop, which calls `stop()` (and your own Pause, if the page pauses), and
 * do not tell the viewer whether a platform Stop is on screen.
 *
 * Declare it as `capabilities: {tts: {}}` (it takes no options) and obtain the
 * namespace with `await claude.use("tts")`; `null` means this view cannot
 * speak (Safari, Firefox, the Claude mobile apps, the desktop app's pop-out
 * windows and the Code tab's Artifacts pane, a viewer the platform does not
 * admit, an artifact that someone outside its organization has edited, or a
 * page that did not declare it) -- design for absence: the text
 * must be on screen too. `null` is the only sign; the `permissions`
 * capability has no name for speaking.
 *
 * Consent. The viewer is not asked first: a page they have clicked or typed
 * in may speak. They can turn reading aloud off for this artifact in the
 * artifact's Permissions menu (or on the platform's control, where one
 * shows), and it stays off until they turn it back on in that menu.
 *
 * Escape. While a reading is under way, an Escape key press that nothing in
 * the page claims ends it, exactly as the platform's Stop does. If your page
 * closes its own menu, dialog or popover on Escape, call preventDefault() on
 * the keydown that closes it, and only on that one, so that closing it does
 * not also end the reading; leave every other Escape alone, since it is how
 * a keyboard viewer stops a reading and leaves the page, and where the
 * platform shows no control it is the viewer's only Stop besides yours. An
 * Escape pressed in a text field, or while a modal <dialog> or a popover the
 * browser closes itself is open, never reaches the platform: it cannot end a
 * reading, and needs no preventDefault().
 *
 * Sharing. Declaring it does not limit how the artifact is shared: it may
 * have a public link and invited viewers. Viewers outside the artifact's
 * organization are never offered it (`null`), so they read the text.
 *
 * One reading at a time per artifact page. A reading is one text, or a list
 * of lines played in order, each in its own voice, paused and stopped as one.
 */
declare namespace Claude {
  namespace tts {
    /** Synchronous, idempotent; nothing fires after it returns. */
    type Unsubscribe = () => void;

    /** The voices a page may name; "buttery" is used when none is named. Text
     *  in another language may be read in a voice for that language; see
     *  SpeakOptions `language`. */
    type Voice = "buttery" | "airy" | "glassy" | "rounded";

    /** - "idle" -- silent.
     *  - "starting" -- from `speak()` or `add()`: waiting for the first sound.
     *  - "speaking" -- the viewer is hearing it; also the moments between two
     *    lines of one reading.
     *  - "paused" -- a reading is under way and its sound is held, by this
     *    page's `pause()`. */
    type State = "idle" | "starting" | "speaking" | "paused";

    /** Why a reading ended, delivered with the return to "idle":
     *  - "completed" -- every line handed over was spoken.
     *  - "stopped" -- this page called `stop()`.
     *  - "replaced" -- a newer `speak()` took its place.
     *  - "viewer_stopped" -- the viewer pressed the platform's Stop, or
     *    pressed Escape while a reading was under way and nothing in the page
     *    claimed the key. Speech stays off for about six seconds, and after
     *    that until a `speak()` or `add()` that comes straight from a click
     *    or key press they make after it.
     *  - "interrupted" -- something of the viewer's took over: their
     *    dictation, or a question the platform put to them.
     *  - "hidden" -- the view was hidden or left.
     *  - "time_limit" -- it stayed paused longer than the platform allows
     *    (minutes, not hours).
     *  - "rate_limited" -- too many starts or too much speech for now, from
     *    this artifact or on this viewer's account; try again later.
     *  - "not_granted" -- the viewer turned reading aloud off for this
     *    artifact, or it is no longer offered in this view.
     *  - "unavailable" -- reading aloud is not available to this viewer just
     *    now; hide your speaker control.
     *  - "upstream_error" -- the speech service or the sound failed; the
     *    words may have been cut short.
     *  Treat an unknown reason as "upstream_error". The viewer's Stop, Escape
     *  or Turn off pressed just after a reading ended sends one more "idle",
     *  with "viewer_stopped" or "not_granted". */
    type EndReason =
      | "completed"
      | "stopped"
      | "replaced"
      | "viewer_stopped"
      | "interrupted"
      | "hidden"
      | "time_limit"
      | "rate_limited"
      | "not_granted"
      | "unavailable"
      | "upstream_error";

    /** What a call rejects with:
     *  - "invalid_argument" -- fix the call (`message` says what): no text,
     *    nothing left to say once marks are dropped, a text of more than 2,000
     *    characters, more than 100 lines, or lines that could never fit an
     *    hour's allowance.
     *  - "no_gesture" -- the viewer has not yet clicked or typed in this page
     *    since it loaded; or they pressed the platform's Stop, or an Escape
     *    nothing claimed, less than about six seconds ago, or this call did
     *    not come straight from a click or key press made after it.
     *  - "busy" -- the viewer is dictating, or the platform is asking them
     *    something; wait for it to end.
     *  - "stopped" -- `stop()`, a newer `speak()`, the viewer's Stop or
     *    Escape, an interruption, a hidden view or the paused limit ended it;
     *    `reason` says which.
     *  - "not_granted" -- reading aloud is not allowed here: the viewer
     *    turned it off for this artifact, or this view cannot speak; hide your
     *    speaker control, do not retry on your own and do not say the text
     *    another way (the browser's own voice would override their choice).
     *  - "rate_limited" / "unavailable" / "upstream_error" -- as in
     *    EndReason; also when a line fails part-way through a reading. */
    type ErrorCode =
      | "invalid_argument"
      | "no_gesture"
      | "busy"
      | "stopped"
      | "rate_limited"
      | "not_granted"
      | "unavailable"
      | "upstream_error";

    interface SpeakError {
      code: ErrorCode;
      message: string;
      /** With code "stopped": which of its causes, in the word `onState` gives. */
      reason?: EndReason;
      /** With "no_gesture" after the viewer's Stop or Escape, and with
       *  "rate_limited" where the platform knows: milliseconds until a retry
       *  could succeed. After either, a fresh press by the viewer is still
       *  needed as well. */
      retryAfterMs?: number;
    }

    /** One thing to say in one voice: a paragraph, or one speaker's turn.
     *  `text` is plain text, 1 to 2,000 characters: Markdown marks are
     *  dropped, a fenced code block is replaced by a short phrase and a link
     *  is read by its label; HTML tags are read as written. `id` is the
     *  page's own short label for the line, up to 64 characters, given back on
     *  `onLine` and `onPosition`: the platform's own number counts from 0 in
     *  each reading, and `add()` may start a new reading, so a page that adds
     *  lines over time tells them apart by `id`. */
    interface Line {
      text: string;
      voice?: Voice;
      /** This line's own pace; see SpeakOptions. */
      rate?: number;
      /** This line's own language, in place of the call's even where the
       *  platform cannot use it; see SpeakOptions. */
      language?: string;
      id?: string;
    }

    interface SpeakOptions {
      /** The voice for a text, and for any Line that names none. A name the
       *  platform does not have is read in the default voice; it never
       *  rejects. */
      voice?: Voice;
      /** The pace for a text, and for any Line that names none: a number
       *  that multiplies the normal pace for this viewer, which today is the
       *  voice's own. 1 is normal, 1.2 a fifth faster and 0.8 a fifth slower.
       *  The platform keeps it within what the voice can do, today 0.7 to
       *  1.5: a number outside that is brought to the nearer of the two, a
       *  value that is not a finite number is read at 1 (null counts as none
       *  named), and neither rejects. Slower speech uses more of the hour's
       *  allowance. This rate holds for this call's lines until the next
       *  `setRate()`. With none named, a line is read at the pace
       *  `setRate()` last set, else at 1. */
      rate?: number;
      /** The language of a text, and of any Line in this call that names
       *  none: a BCP 47 tag such as "en" or "pt-BR". Name it for text whose
       *  language the page knows, not for a viewer's input or fetched text.
       *  With none named the platform guesses each line's language from its
       *  first words, and a short line of names can be guessed wrong and read
       *  in another language's voice. English is read in the voice named;
       *  another language may be read in a voice of its own whatever the voice
       *  named, so its lines may sound alike. Figures and dates can follow the
       *  named language and region. A line is read in one language: give a
       *  passage in another its own Line, with its own language. A tag the
       *  platform cannot use, such as "und", is no error: that line's language
       *  is guessed, even where the call names one. A value that is not a
       *  string is "invalid_argument". A platform build that predates this
       *  option ignores it; see `languages()`. */
      language?: string;
    }

    /** Say this now. A reading is one text, or a list of lines played in
     *  order, each in its own voice, paused and stopped as one; the next line
     *  is made ready while the current one plays, so the gap between two lines
     *  is usually short. It replaces any reading under way, paused or not,
     *  lines not yet spoken included: every pending promise of the older
     *  reading rejects "stopped" with reason "replaced". Whenever the platform
     *  shows its control, at the start or part-way through, it first takes the
     *  page out of fullscreen, so that the control stays in view. While the
     *  page is still fullscreen, the viewer's first Escape leaves fullscreen
     *  and a second ends the reading, so keep your own Stop inside what the
     *  page shows fullscreen. Resolves once everything handed over in THIS
     *  call has been spoken, with the milliseconds of sound played for it. A
     *  call is taken whole or refused whole: one that does not fit the limits
     *  now is "rate_limited", and one refused leaves the reading under way
     *  alone.
     *  Starts are paced: hand over a paragraph or a turn per line, not a
     *  sentence per call. Rejects, never throws, with a SpeakError. A call
     *  that fails after `onState` reported "starting" also sends `onState`
     *  back to "idle", with the reason. */
    function speak(
      what: string | Line[],
      options?: SpeakOptions,
    ): Promise<{ playedMs: number }>;

    /** Say this after what is already being said: puts lines at the end of
     *  the reading under way, with no new press needed. With no reading under
     *  way it starts one, exactly as `speak()` would. Resolves once the lines
     *  handed over in THIS call have been spoken. At most 100 lines may be
     *  waiting. If the reading ends early (the viewer's Stop, say), every
     *  pending call rejects; stop adding, because a later `add()` may start a
     *  new reading. */
    function add(
      what: string | Line[],
      options?: SpeakOptions,
    ): Promise<{ playedMs: number }>;

    /** End the whole reading, lines not yet spoken included. Like `pause()`,
     *  `resume()` and `voices()` it can reject with a SpeakError (the
     *  platform did not answer, or reading aloud is gone from this view), so
     *  catch them too. */
    function stop(): Promise<void>;

    /** Hold the whole reading where it is; `resume()` continues
     *  mid-sentence. Both resolve at once, harmlessly, when there is nothing to
     *  do. `pause()` while "starting" holds the sound before it begins and the
     *  state becomes "paused". The platform's control, where one shows, stays
     *  in view while paused. A `resume()` that does not come straight from the
     *  viewer's click or key press may bring the platform's control up before
     *  the sound returns. A reading left paused longer than the platform
     *  allows ends with reason "time_limit". */
    function pause(): Promise<void>;
    function resume(): Promise<void>;

    /** Change the pace, for a speed control: the same number as
     *  SpeakOptions `rate`, judged the same way, but that null or nothing,
     *  like any value that is not a finite number, sets the pace to 1. The
     *  line being read changes pace a moment later, whatever pace it named,
     *  and every later line that names no pace of its own follows, in this
     *  reading and in later ones. A short line, or the next line if it is
     *  already made ready, may still be heard at the old pace. A page with a
     *  speed control also sets it when it loads, since the platform may
     *  still hold what an earlier load set, or passes its `rate` with each
     *  `speak()` and `add()`. A slower pace uses more of the hour's
     *  allowance: a line the hour has no room to slow keeps the pace it has.
     *  Calling it many times a second, as a slider does, is fine: the last
     *  value wins. Once `tts` has loaded it never rejects: where the pace
     *  cannot be set, the reading keeps the pace it has. Absent on a
     *  platform build that predates it: call `t.setRate?.(r)`. */
    function setRate(rate: number): Promise<void>;

    /** True while the state is not "idle" (so true while paused). */
    function active(): boolean;

    /** The voice names this platform has now, the default first. */
    function voices(): Promise<Voice[]>;

    /** The languages SpeakOptions `language` can name here now, as bare
     *  codes such as "en"; a two-letter region may follow any of them
     *  ("en-GB"). A tag for another language counts as none named: that
     *  line is still read, its language guessed. Where this member is absent,
     *  or rejects, `language` may be ignored:
     *  `await t.languages?.().catch(() => undefined)` gives undefined there. */
    function languages(): Promise<string[]>;

    /** Calls the handler on each change of state. If the state is not
     *  "idle" when `onState()` is called, the handler is also called once
     *  with that state just after `onState()` returns. Only a return to
     *  "idle" carries `reason`. */
    function onState(
      handler: (e: { state: State; reason?: EndReason }) => void,
    ): Unsubscribe;

    /** Called as each line's first sound plays. `line` counts the reading's
     *  lines from 0, lines put in by `add()` included; `id` is the Line's
     *  own, when it gave one. */
    function onLine(
      handler: (e: { line: number; id?: string }) => void,
    ): Unsubscribe;

    /** Milliseconds of sound the viewer has heard in the current line. One
     *  event with `ms` 0 as each line's first sound plays; then it only
     *  rises, at most about ten events a second; it does not move while
     *  starting or paused (one event may follow "paused"); the last event of a
     *  reading comes before its "idle". The event also carries the line's
     *  number and id, as `onLine` does. It is not a place in the text, and
     *  there is no total and no seek. `ms` and `playedMs` count sound heard,
     *  whatever the pace: at 1.2 the same text is about five sixths as long. */
    function onPosition(
      handler: (e: { ms: number; line: number; id?: string }) => void,
    ): Unsubscribe;
  }
}

interface ClaudeCapabilityMap {
  tts: typeof Claude.tts;
}
