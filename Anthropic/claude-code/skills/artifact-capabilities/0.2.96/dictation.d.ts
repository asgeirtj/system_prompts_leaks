/**
 * The `dictation` capability -- the viewer speaks, the page receives their
 * words as text. The platform, not the page, holds the microphone: it turns
 * what the viewer says into text with Anthropic's speech-to-text (the same
 * service claude.ai chat's dictation uses) and hands this page the words,
 * never the sound. While it listens the platform shows the viewer its own
 * "Listening" control with a Stop button, outside the page.
 *
 * Declare it as `capabilities: {dictation: {}}` and obtain the namespace
 * with `await claude.use("dictation")`; `null` means this view cannot take
 * dictation (Safari, Firefox, the Claude mobile apps, any Claude desktop
 * window but the main one, an older desktop app, a viewer the platform does
 * not admit or whose browser's language dictation does not serve) -- design
 * for absence and keep a typed fallback.
 *
 * Consent. The first `start()` asks the viewer once whether this artifact
 * may take their dictation; their answer stands for this artifact until
 * they change it in its Permissions menu. The `permissions` capability
 * reads it as `state("dictation")` and can ask up front with
 * `request(["dictation"])`. Nothing reloads when they allow.
 *
 * Viewers outside the artifact's organization are never offered it:
 * `claude.use("dictation")` resolves `null` for them.
 */
declare namespace Claude {
  namespace dictation {
    /** Synchronous, idempotent; nothing fires after it returns. */
    type Unsubscribe = () => void;

    /** - "idle" -- not listening.
     *  - "starting" -- from `start()`: asking the viewer, or opening the
     *    microphone.
     *  - "listening" -- words will arrive.
     *  - "finishing" -- stopped; the last words are still arriving. */
    type State = "idle" | "starting" | "listening" | "finishing";

    /** Why listening ended, delivered with the return to "idle":
     *  - "stopped" -- this page called `stop()`.
     *  - "viewer_stopped" -- the viewer pressed the platform's Stop.
     *  - "hidden" -- the view was hidden or left; start again on return.
     *  - "time_limit" -- one listening session lasts at most 60 minutes.
     *  - "not_granted" -- the viewer switched dictation off for this artifact,
     *    or the browser blocks the microphone.
     *  - "dismissed" -- the viewer closed the question without answering.
     *  - "unavailable" -- dictation is not available for this viewer's
     *    account, or not in the language this session was started in. Hide
     *    the control. If `start()` named a `language`, that may be the cause:
     *    keep the control for another language, and hide it once a start with
     *    no `language` ends this way too.
     *  - "rate_limited" -- too many dictations at once for this viewer
     *    (shared with claude.ai's own); try again shortly.
     *  - "upstream_error" -- the microphone or the speech service failed.
     *  Treat an unknown reason as "upstream_error". */
    type EndReason =
      | "stopped"
      | "viewer_stopped"
      | "hidden"
      | "time_limit"
      | "not_granted"
      | "dismissed"
      | "unavailable"
      | "rate_limited"
      | "upstream_error";

    /** What `start()` and `stop()` reject with:
     *  - "invalid_argument" -- fix the call (`message` says what).
     *  - "no_gesture" -- `start()` must be called from the viewer's own
     *    click or key press, synchronously, before anything is awaited.
     *  - "not_granted" -- the viewer said no here (now, or earlier in the
     *    Permissions menu), or the browser blocks the microphone; don't ask
     *    again on your own.
     *  - "dismissed" -- the viewer closed the question without answering; a
     *    later click may ask again.
     *  - "stopped" -- `stop()`, the viewer's Stop or a hidden view ended it
     *    before it was listening.
     *  - "unavailable" -- dictation is not offered in this view, not for
     *    this viewer's account, or not in the language asked for; as in
     *    EndReason.
     *  - "rate_limited" / "upstream_error" -- as in EndReason. */
    type ErrorCode =
      | "invalid_argument"
      | "no_gesture"
      | "not_granted"
      | "dismissed"
      | "stopped"
      | "unavailable"
      | "rate_limited"
      | "upstream_error";

    interface DictationError {
      code: ErrorCode;
      message: string;
    }

    interface StartOptions {
      /** A two-letter language, optionally with a region, such as "es" or
       *  "es-MX"; the viewer's own language when omitted. Not every language
       *  is served; `start()` can reject "unavailable" for one that is not, so
       *  name one only when the page needs it. */
      language?: string;
    }

    /** Start listening. Call it FROM the viewer's click or key press on
     *  your control, synchronously. On first use the platform asks the
     *  viewer; the promise resolves once it is listening. Called while
     *  already listening it resolves at once; while the last session is
     *  finishing it waits for that first. Rejects, never throws, with a
     *  DictationError. A start that fails after `onState` reported
     *  "starting" also sends `onState` back to "idle", with the rejection's
     *  code as the reason. A stop, the viewer's Stop or a hidden view instead
     *  rejects "stopped", and the `onState` reason says which of the three it
     *  was. Tell the viewer from the rejection; draw the control from
     *  `onState`. */
    function start(options?: StartOptions): Promise<void>;

    /** Stop listening, or cancel a start still asking or opening.
     *  Resolves once the last words have been delivered to `onFinal`;
     *  resolves at once when idle. */
    function stop(): Promise<void>;

    /** True while the state is not "idle". */
    function active(): boolean;

    /** The live guess for the phrase being spoken. Each call REPLACES the
     *  previous guess; `text` is "" once the phrase has settled. Render it
     *  as provisional. */
    function onPartial(handler: (e: { text: string }) => void): Unsubscribe;

    /** One settled piece of text, in order, never revised. It starts with a
     *  space when one is needed to join it to the last piece, even one from an
     *  earlier `start()`, so append it as is. Your page's own edits are not
     *  seen: trim a leading space when the field is empty. */
    function onFinal(handler: (e: { text: string }) => void): Unsubscribe;

    /** Calls the handler on each change of state. If the state is not
     *  "idle" when `onState()` is called, the handler is also called once
     *  with that state just after `onState()` returns. Only a change back to
     *  "idle" carries `reason`. */
    function onState(
      handler: (e: { state: State; reason?: EndReason }) => void,
    ): Unsubscribe;
  }
}

interface ClaudeCapabilityMap {
  dictation: typeof Claude.dictation;
}
