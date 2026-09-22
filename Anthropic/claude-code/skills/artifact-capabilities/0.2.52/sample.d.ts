/**
 * The `sample` capability — ask Claude from the published artifact, on
 * the viewer's own Claude account, and get the answer (live, as it is
 * written, if you want to show it that way).
 *
 * The short version:
 *
 *     const sample = await claude.use("sample")                          // null: hide the feature
 *     const { text, truncated } = await sample(input, options?)         // the whole answer
 *     const data = await sample.json(input, options?)                    // the answer parsed as JSON
 *     // input   = "prompt" | [{role: "user"|"assistant", content}, ...] ending on a user turn
 *     // options = { onText?({text, delta}), signal?, tools?, images?, modelTier?, cache? }
 *     // failure = one rejected {code, message, text?}; text = the part you may keep
 *
 * One function, one promise. Pass `onText` to render the answer while it
 * streams (each call brings `text`, the WHOLE answer so far, to assign,
 * and `delta`, the new part, to append); pass `signal` to be able to stop. The same promise
 * resolves at the end with the full text, or rejects with the one error
 * shape. There is no stream object, no handle and no second promise.
 *
 * Each call is independent and memory-less: Claude sees ONLY the `input`
 * you pass (a prompt string, or the short list of turns the PAGE keeps
 * for a chat) plus any `images`, under fixed platform framing. It cannot
 * browse, remembers nothing between calls, has no tools except the page
 * functions you pass in `options.tools`, and there is no system prompt
 * the page controls: put the instruction, the page's data and the output
 * format you want in `input`.
 *
 * Availability. Inside a viewer the page is framed and `window.claude`
 * exists before any page script runs; served top-level by the platform on
 * the artifact's own host it exists too, with every `use()` resolving
 * `null` there for now, while any other top-level copy of the page has
 * no `window.claude` at all. `const sample =
 * await claude.use("sample")` resolves this function as soon as the
 * runtime starts, asking the viewer nothing, or `null` where it never
 * can (for example the page is framed by a host that is not a Claude
 * viewer; decided about ten seconds after load) — design for absence
 * and hide the feature. Consent is per call, not per `use()`: a viewer
 * who declines still gets the function and every call rejects
 * `not_granted`, so your `catch` hides the feature too. Inside a React
 * effect, `await claude.use("sample")` in the effect itself and treat
 * `null` like `not_granted`: absence.
 *
 * Cost and consent — read before designing UI around it. A call that
 * reaches Claude spends the VIEWER's own Claude usage, so the first call
 * in a view asks the viewer to allow it; the call waits while they decide
 * and a decline rejects `not_granted` for the rest of the view. Answers
 * are cached for the viewer by default: repeating a call with the same
 * `input`, `modelTier` and `images` within five minutes replays the
 * stored answer without contacting Claude (see
 * {@link sample.SampleOptions.cache}). A couple of calls run at once for
 * a viewer, a few more wait their turn, and a flood rejects
 * `rate_limited`. So: sample on an explicit viewer action ("Ask",
 * "Summarize", "Send") or once at load with a prompt that is stable
 * across loads — never from a loop or a timer — and render a sensible
 * page when sampling is unavailable.
 *
 * Timing to design for: on `"quick"` a short prompt answers in a second
 * or two; on `"default"`/`"complex"` Claude thinks silently before it
 * writes, so the first text usually takes 5-60 s (up to two minutes for
 * a long structured prompt), then streams in over seconds; each round is
 * capped at about five minutes; a call that uses `tools` is several
 * rounds back to back — each thinks, then calls your tools or writes: a
 * three-round call on the default tier commonly takes 30-90 s (about a
 * second per round on `"quick"`), longer with images (re-sent every
 * round). Show progress from inside your `execute` functions. Show
 * "Thinking..." from the moment
 * you call until `onText` first fires (that also covers the consent
 * dialog and a call waiting its turn), and offer a Stop button on
 * anything long. A call can still fail AFTER `onText` has fired: the
 * promise rejects and `e.text` tells you what may stay on screen.
 *
 * Failure design: every failure is one rejected promise carrying a
 * {@link sample.SampleError} `{code, message, text?}` — never a
 * synchronous throw. Branch on `code`, never on `message`; NEVER retry
 * from a loop. {@link sample.SampleErrorCode} groups the codes by what
 * the page should do about each.
 */
declare namespace Claude {
  /**
   * Ask Claude. Resolves with the complete answer; rejects with a
   * {@link sample.SampleError}. Never throws synchronously.
   *
   * The request leaves the page right after your call returns (on the
   * next microtask), not when you `await` — so a call whose `signal` is
   * aborted in the same synchronous block (a React effect cleanup, a
   * superseded keystroke) sends nothing, asks the viewer nothing and
   * costs nothing. The arguments are read once, at call time: later
   * changes to a turn array or a `FileList` do not affect the call.
   *
   *     // One-shot: a button that summarizes what the page shows
   *     const sample = await claude.use("sample");          // null: hide the button
   *     btn.onclick = async () => {
   *       btn.disabled = true;
   *       out.textContent = "Thinking...";
   *       try {
   *         const { text } = await sample("Summarize in 3 bullets:\n\n" + notes.textContent);
   *         out.textContent = text;
   *       } catch (e) {
   *         out.textContent = copyFor(e.code);                // your map from code to viewer copy
   *       } finally {
   *         btn.disabled = false;
   *       }
   *     };
   *
   *     // Streaming with a Stop button: render the answer as it is written
   *     let ctl;
   *     stopBtn.onclick = () => ctl?.abort();
   *     askBtn.onclick = async () => {
   *       ctl = new AbortController();                     // a NEW controller per call
   *       out.textContent = "Thinking...";
   *       try {
   *         const { truncated } = await sample("Explain this config:\n\n" + src, {
   *           signal: ctl.signal,
   *           onText: ({ text }) => { out.textContent = text; },   // whole answer so far
   *         });
   *         if (truncated) note.textContent = "Cut short — ask for less at a time.";
   *       } catch (e) {
   *         out.textContent = e.text ?? "";                 // keep what may be kept; else clears
   *         if (e.code !== "cancelled") note.textContent = copyFor(e.code);
   *       }
   *     };
   *
   *     // Chat: standing instructions are a leading user turn; the list ends on the new message
   *     turns.push({ role: "user", content: box.value });
   *     const { text } = await sample([{ role: "user", content: RULES }, ...turns], {
   *       cache: false, signal: ctl.signal, onText: ({ text }) => { bubble.textContent = text; },
   *     });
   *     turns.push({ role: "assistant", content: text });
   *
   * @param input   What Claude reads: a prompt string, or user/assistant
   *                turns starting and ending on a user turn — see
   *                {@link sample.SampleInput}. At most 64 KiB of text in total.
   * @param options {@link sample.SampleOptions}: `onText` to stream, `signal`
   *                to cancel, `tools`, `images`, `modelTier`, `cache`.
   *                Optional; must be a plain object.
   */
  function sample(
    input: sample.SampleInput,
    options?: sample.SampleOptions,
  ): Promise<sample.SampleResult>;

  namespace sample {
    /**
     * Ask Claude for DATA. The same call as {@link Claude.sample} — same
     * input, options, streaming, consent, caching and errors — but resolves
     * with the reply parsed as one JSON value instead of `{text}`.
     *
     * Say in the prompt exactly what JSON you want ("Reply with only a JSON
     * array of {name, score} objects" plus a one-line example); the
     * platform also tells Claude the reply will be machine-parsed. The
     * reply is read tolerantly: the whole reply as JSON; else the body of
     * one Markdown code fence; else the text from the first `{` or `[` to
     * the last `}` or `]` (so one sentence before or after the value is
     * ignored, but two values, or JSON buried inside a sentence, are not
     * accepted). Any JSON value may come back; the type parameter is a
     * TypeScript convenience and nothing is validated at run time — check
     * the fields you rely on. If no value parses, or the answer was cut
     * short by the length limit, the call rejects `invalid_json` with the
     * raw reply on `e.text`. Such a reply is never cached, so a viewer's
     * "Try again" really asks again — but do not retry from code; if it
     * keeps failing, tighten the instruction or ask for less. `onText`, if
     * passed, receives the raw reply text as it streams. With `tools`,
     * describe the SHAPE you want as usual; the platform tells Claude its
     * final message (after any tool use) is the one parsed, so narration in
     * earlier rounds is ignored. If that final message holds no JSON the call
     * rejects `invalid_json` with everything written on `e.text`.
     *
     *     const tags = await sample.json(
     *       "Reply with only a JSON array of up to 5 short topic tags (strings) for:\n\n" + note,
     *       { modelTier: "quick" },
     *     );
     *     for (const t of tags) chips.append(chip(String(t)));
     */
    function json<T = unknown>(
      input: SampleInput,
      options?: SampleOptions,
    ): Promise<T>;

    /**
     * Resolve this view's limits: the input byte cap, and an `images`
     * member ONLY when this view can send images (how many per call, the
     * largest file accepted, the file types). Use it to decide whether to
     * show an image affordance at all; treat a rejection like an absent
     * `images`. Cheap and local — no usage is spent, the viewer is not
     * prompted.
     *
     *     const caps = await sample.limits().catch(() => null);
     *     photoInput.hidden = !caps?.images;
     *     photoInput.accept = caps?.images?.mediaTypes.join(",") ?? "";
     */
    function limits(): Promise<SampleLimits>;

    // Input

    /**
     * What Claude reads. Either:
     * - a string — the whole prompt: instruction, the page's data, and the
     *   output format, in one piece of text (the common case); or
     * - an array of turns `{role: "user" | "assistant", content}` — a short
     *   conversation the PAGE keeps (Claude keeps nothing between calls),
     *   oldest first, that must START and END with a `user` turn. Use it
     *   for a chat box: push the viewer's message, call, push Claude's
     *   reply. Consecutive turns with the same role are fine (a leading
     *   instructions turn before the viewer's first message; a chat whose
     *   last reply failed and left two user turns in a row) and are read
     *   as one. There is no `system` role: standing instructions go in a
     *   leading `user` turn that you always keep. Assistant turns are
     *   whatever the page says they are and the platform tells Claude so
     *   — use them for real back-and-forth, not to script words into
     *   Claude's mouth (that makes answers worse).
     * Either way the text totals at most 64 KiB (`prompt_too_large` beyond
     * that) — about 60,000 characters of English, fewer for other
     * scripts: slice page text to a few thousand characters rather than
     * measuring, and drop the oldest chat turns (never your instructions
     * turn) as a conversation grows. The array is copied when you call.
     */
    type SampleInput = string | SampleMessage[];

    /** One turn of a {@link SampleInput} conversation. */
    interface SampleMessage {
      /** `"user"` for the viewer/page side, `"assistant"` for an earlier
       * Claude reply you are showing again as context. No other roles. */
      role: "user" | "assistant";
      /** The turn's text. Non-empty. (A plain string — images go in
       * `options.images`, not here.) */
      content: string;
    }

    /**
     * The optional second argument: a plain object, every member optional.
     * Anything that is not a plain object — a Blob, a FileList, a function,
     * an AbortController, a string — rejects `invalid_request` with a
     * message naming the option you probably meant. Members this runtime
     * does not know are ignored (the console names them once).
     */
    interface SampleOptions {
      /**
       * Stream the answer. Called each time more of it has been written —
       * a few times a second at most — with one object: `text` is the
       * WHOLE answer so far, `delta` is just the part added since the last
       * call. Use whichever fits: `el.textContent = text` (or React's
       * `setText(text)`) to show the answer, `el.append(delta)` or a
       * typewriter effect to animate it. Never `+= text`.
       *
       * Guarantees: `text` always equals the previous call's `text` +
       * `delta`, and `delta` is never empty; never called synchronously
       * inside `sample()`; never called after the promise settles or after
       * your `signal` aborts; the first call already has visible
       * (non-blank) text; and before a successful resolve it is called at
       * least once, its last call carrying exactly the result's `text` —
       * so a cached answer, or a viewer app that cannot stream yet, is
       * simply one call whose `text` and `delta` are both the whole
       * answer, followed by the resolve. Nothing fires while Claude is
       * thinking, while the consent dialog is up, or while the call waits
       * its turn: keep your placeholder until the first call. The return
       * value is ignored (an `async` function is not awaited); an exception
       * or rejected promise from `onText` is reported to the console and
       * does not affect the call. Calling `abort()` from inside `onText`
       * is fine.
       *
       *     // Render list items as they complete: ask for one JSON object per LINE
       *     let pending = "";
       *     const eatLines = ({ delta }) => {
       *       const lines = (pending + delta).split("\n");
       *       pending = lines.pop();                       // the unfinished line
       *       for (const line of lines) if (line.trim()) addRow(safeParse(line));
       *     };
       *     await sample(
       *       'Suggest 8 project names, one {"name": string, "why": string} object per line, '
       *         + "no other text.\n\n" + brief,
       *       { onText: eatLines },
       *     );
       *     if (pending.trim()) addRow(safeParse(pending));
       */
      onText?: (update: SampleTextUpdate) => void;

      /**
       * Cancels the call. Create `new AbortController()` FOR THIS CALL,
       * pass `ctl.signal`, and call `ctl.abort()` from a Stop button, an
       * input change, or a React effect cleanup. One controller per call:
       * an aborted signal stays aborted, so a reused one makes every later
       * call reject `cancelled` immediately (the console warns when it sees
       * that). On abort the promise rejects `{code: "cancelled"}` promptly
       * (`e.text` holds any partial answer), `onText` stops, and Claude is
       * told to stop writing so the viewer stops paying for the rest.
       * Aborting before the request has left the page — in the same
       * synchronous block as the call, or while images are being prepared
       * — sends nothing at all: no consent prompt, no usage. Aborting
       * while the call waits its turn or waits on the consent dialog
       * spends no usage; the dialog itself stays up (its answer governs
       * later calls) and this call is simply dropped. A call still queued
       * for a runtime that has not started rejects when the runtime starts
       * (normally well under a second). The code is always `cancelled`
       * whatever the signal's reason; the reason stays on your own signal
       * if you need to tell your Stop button from your cleanup. There is
       * no timeout option and you should not build one: the platform
       * already ends an over-long call, and a page-side timer would also
       * count the time the viewer spends reading the consent dialog. Must
       * be an `AbortSignal` — passing the controller itself rejects
       * `invalid_request`.
       */
      signal?: AbortSignal;

      /**
       * Images for Claude to look at, shown to it with the final (or only)
       * user turn: one JPEG, PNG, WebP or GIF `Blob`/`File`, or a list of
       * them (an array, a `FileList`) — a file the viewer picked,
       * `canvas.toBlob()` output — at most `limits().images.maxCount` per
       * call. The platform downsizes each to about 1.2 megapixels, applies
       * orientation, keeps an animation's first frame and strips metadata
       * before anything is sent; say in the prompt what the images are and
       * what to do with them. Only where {@link limits} reports `images` —
       * elsewhere the call rejects `images_unavailable`; a file of another
       * type, undecodable, or over 20 MB / 10,000 px a side / 64 megapixels
       * rejects `image_rejected`. The page cannot fetch images from URLs
       * (its network is blocked): ask the viewer to pick or drop the file.
       * In a chat, images from earlier turns are not re-sent — describe
       * them in text if they still matter.
       */
      images?: Blob | Blob[] | FileList;

      /**
       * Which model family answers. `"default"` (omitted): the balanced
       * everyday model. `"complex"`: the most capable, for hard reasoning
       * (thinks longest). `"quick"`: the fastest, for short routine work —
       * classification, tags, one-line rewrites, small JSON, and
       * conversational replies where snappiness matters more than depth —
       * it does not think first, so text starts almost at once. For a list
       * of items prefer ONE call that returns a JSON array over one call
       * per item. The platform may serve a nearby cheaper tier when the
       * viewer's plan lacks the one asked for —
       * {@link SampleResult.modelTierApplied} reports which tier actually
       * answered.
       */
      modelTier?: ModelTier;

      /**
       * Answer caching — ON by default. An answer this viewer already
       * received in this artifact for the same `input` (every turn),
       * `modelTier`, `images` (byte-identical) and verb (`sample` vs
       * `json`) is replayed to a repeat call: no usage is spent, Claude is
       * not contacted, `onText` fires once with the whole text and the
       * promise resolves. An identical call made while the first is still
       * running shares its answer as it streams instead of asking twice.
       * Only successful answers are stored (including `truncated` ones,
       * which replay with `truncated: true`); rejections — `cancelled`,
       * `invalid_json`, everything else — never are, so retrying after a
       * failure needs no option. Consent is unchanged: the first call in a
       * view still asks. Entries are per viewer, per artifact, per browser;
       * best-effort; cleared on sign-out. Input that embeds changing data
       * simply never hits.
       *
       * The window: an answer is replayed while it is younger than the
       * `gcTime` of the call that stored it AND of the call asking now
       * (five minutes when neither says otherwise) — so pass the same
       * `cache` value on every call for a given prompt.
       *
       * Omitted or `true` — the default five-minute window.
       * `false` — always ask Claude, store nothing, share nothing. Use it
       *   whenever a repeat MUST produce a new answer: every turn of a
       *   chat, "Regenerate", "Try another".
       * `{gcTime}` — keep and reuse for up to `gcTime` ms, max 24 h (a
       *   summary of content that rarely changes; keep such prompts
       *   short-answered so the stored answer is complete).
       * `{gcTime, refresh: true}` — ask Claude now (spending usage) and
       *   overwrite the stored answer: a "Refresh" button. Pass the same
       *   `gcTime` as the load-time call.
       * Any other value rejects `invalid_request`. A call with `tools` is
       * never stored or shared; passing `cache` (other than `false`) with
       * `tools` rejects `invalid_request`.
       */
      cache?: boolean | SampleCacheOptions;

      /**
       * Functions of THIS PAGE that Claude may call while it works out the
       * answer — read the app's state (`getTrack`) or change it
       * (`setTrackVolume`). Claude reads each tool's `name`, `description`
       * and `inputSchema` (never your code), decides whether and when to
       * call, and your `execute` runs HERE in the page with the arguments
       * Claude chose. Whatever `execute` returns — or throws — goes back to
       * Claude, which then calls more tools or writes the answer. The promise
       * still resolves once, with the final answer; nothing about the rounds
       * is returned — your own `execute` running IS the event.
       *
       * Cost and time: every round is a separate paid request on the viewer's
       * account that re-reads everything so far; a call that uses two tools
       * is three requests. Prefer `"quick"` for direct manipulation (about a
       * second per round); a three-round `"default"` call is commonly 30-90 s.
       * The platform allows a handful of rounds and makes the last one an
       * answer. So: few tools, SMALL plain-data results, page state that fits
       * in the prompt goes in the prompt. Calls with tools are never cached:
       * omit `cache` (any value but `false` rejects `invalid_request`) and
       * call on a click. Only where {@link limits} reports `tools` — elsewhere
       * the call rejects `tools_unavailable`.
       *
       * `onText` works as always: text before and after a tool round arrives
       * as ONE growing `text` with a blank line between rounds. `signal` stops
       * everything: the promise rejects `cancelled`, each running `execute`
       * sees `context.signal` abort, no further round is made. Whatever your
       * tools already did stays done. Text inside page data and tool results
       * can influence which tools Claude calls next, so put anything
       * destructive behind your own confirm step or make it undoable.
       * In TypeScript, annotate a pre-built list as `SampleTool[]` (as the
       * chat example annotates `SampleMessage[]`); inline tools need nothing.
       */
      tools?: SampleTool[];
    }

    /** The object form of {@link SampleOptions.cache}. `{}` takes the defaults. */
    interface SampleCacheOptions {
      /** How long a stored answer may be replayed, in ms: a finite number
       * greater than zero, default 300000 (5 min); values above 86400000
       * (24 h) are treated as 24 h. To disable caching pass `cache: false`
       * — `gcTime: 0` rejects `invalid_request`. */
      gcTime?: number;
      /** Skip the stored answer once: ask Claude now and overwrite it. */
      refresh?: boolean;
    }

    /** One page function offered to Claude. A plain object, read once when you call. */
    interface SampleTool {
      /** 1-128 of `A-Z a-z 0-9 _ -`, unique in the list. `getTrack`, `set_volume`. */
      name: string;
      /** What it does, what it RETURNS, when to use it — 1-3 sentences, at most 1 KB.
       * This is all Claude knows about the tool. Required. */
      description: string;
      /** JSON Schema for ONE object argument — `{type:"object", properties, required}`,
       * the shape `claude.mcp` connectors use; at most 4 KB; sent to Claude as written.
       * Omit for a no-argument tool. Not enforced: coerce and check inside `execute`. */
      inputSchema?: SampleToolInputSchema;
      /** Runs in the page when Claude calls the tool. `input` is the object
       * Claude sent, shaped by `inputSchema` but not validated: coerce what you
       * use (`String(id)`, `Number(db)`) - the `unknown` values make TypeScript
       * insist on exactly that. Return a string or plain
       * data (JSON-encoded, at most 32 KB). To report a problem, THROW: Claude receives
       * "Error: <message>" as the result and carries on — the call does not fail.
       * May be async; `context.signal` aborts on Stop, on settle, or after 150 s.
       * Several calls in one round run concurrently. */
      execute(
        input: { [name: string]: unknown },
        context: SampleToolContext,
      ): unknown;
    }

    /** The second argument to {@link SampleTool.execute}. */
    interface SampleToolContext {
      /** Aborts when the call's `signal` aborts, when the call ends while this
       * tool still runs, or after 150 s. Hand it on (`mcp.callTool(..., {signal})`),
       * and check `signal.aborted` after an `await` before applying an effect. */
      signal: AbortSignal;
    }

    /** JSON Schema for a tool's one object argument (MCP's `inputSchema` type). */
    interface SampleToolInputSchema {
      type: "object";
      properties?: { [name: string]: unknown };
      required?: string[];
      [keyword: string]: unknown;
    }

    /** The argument to {@link SampleOptions.onText}. */
    interface SampleTextUpdate {
      /** The WHOLE answer so far. Assign it: `el.textContent = text`. */
      text: string;
      /** Only what was added since the previous call. Append it if you
       * animate: `el.append(delta)`. Always `text === previousText + delta`. */
      delta: string;
    }

    type ModelTier = "default" | "complex" | "quick";

    // Output

    /** What {@link Claude.sample} resolves with — a plain object. */
    interface SampleResult {
      /** The complete answer text — the same string the last `onText` call
       * received. Never empty or blank (that rejects `empty_completion`).
       * With `tools`, the text of every round, a blank line between rounds. */
      text: string;
      /** `true` when the answer hit the length or time limit and stops
       * mid-thought. The text is still everything Claude wrote: show it
       * with a note, and ask for less or split the task next time.
       * Usually `false`. */
      truncated: boolean;
      /** The tier that actually answered — the one you asked for, or the
       * substitute the viewer's plan allowed. If you offer a tier choice,
       * this is how you tell the viewer it could not be honoured. */
      modelTierApplied: ModelTier;
    }

    /** Resolution shape for {@link limits}. */
    interface SampleLimits {
      /** Largest `input`, in UTF-8 bytes of text — the prompt string, or all
       * turns' `content` together (65536). */
      maxPromptBytes: number;
      /** Present only when this view can send `images`. */
      images?: ImageLimits;
      /** Present only when this view can run {@link SampleOptions.tools}. */
      tools?: ToolLimits;
    }

    /** The image side of {@link SampleLimits}. */
    interface ImageLimits {
      /** Most images one call may carry. */
      maxCount: number;
      /** Largest input file accepted, in bytes (before downsizing). */
      maxInputBytes: number;
      /** Accepted file types, e.g. `"image/jpeg"` — usable as a file
       * input's `accept` list. */
      mediaTypes: string[];
    }
    interface ToolLimits {
      /** Most tools one call may offer. */
      maxCount: number;
    }

    // Errors

    /**
     * The one failure shape: what `sample()` and `json()` reject with. A
     * plain object, not an `Error` (`String(e)` is useless — read the
     * fields). Branch on `.code`; `.message` is developer-facing English,
     * not viewer copy. `.text` is the part of the answer you may keep on
     * screen: present whenever text had streamed before the failure — any
     * code, since with `tools` even `not_granted` or `rate_limited` can
     * arrive between rounds — and equal to what `onText` last received; the
     * whole raw reply on `invalid_json`; absent when nothing had streamed
     * and on `refused` (withdrawn — clear what you rendered). Tools that
     * already ran have run — `e.text` does not undo them.
     */
    interface SampleError {
      code: SampleErrorCode;
      message: string;
      text?: string;
    }

    /**
     * Stable error codes, grouped by what the page should do. Treat an
     * unknown code as `"upstream_error"`. Only `upstream_error` is
     * transient; NEVER retry any code from a loop.
     *
     * You did it — restore the idle UI, keep `e.text` if you want it:
     * - `cancelled` — your `signal` aborted (Stop, superseded input,
     *   unmount) or was already aborted when you called. Not something to
     *   tell the viewer. If it fired after Claude began, some usage was
     *   spent.
     *
     * A page bug — nothing was sent; the message says what to change:
     * - `invalid_request` — the call is malformed: `input` empty, not a
     *   string or turn list (the 0.2 `sample({prompt})` object form lands
     *   here — the prompt goes first now), turns not starting and ending
     *   on `user`, a turn with another role or empty content, `options`
     *   not a plain object, `signal` not an `AbortSignal` (pass
     *   `ctl.signal`, not the controller), `onText` not a function, an
     *   unknown `modelTier`, `images` not Blobs, `cache` not
     *   `true`/`false`/`{gcTime?, refresh?}`, `tools` not an array of
     *   well-formed {@link SampleTool}s (the message names the entry and the
     *   rule), `cache` passed with `tools`, or a tool `inputSchema` Claude's
     *   API refused. (Rarely, the service itself refuses a request as
     *   malformed after text began; `e.text` then carries the partial.)
     * - `prompt_too_large` — over 64 KiB of text, or one call's tool rounds
     *   outgrew what Claude can read at once (return less per tool). Send an
     *   excerpt, a summary, or fewer turns.
     * - `transform_error` — arguments could not be prepared; treat like
     *   `invalid_request`.
     * - `queue_overflow` — hundreds of calls were made before the runtime
     *   started (a loop at load).
     *
     * Hide the feature for this view — permanent, never re-ask, no `text`:
     * - `not_granted` — the viewer (or their organization) has not allowed
     *   this artifact to use Claude.
     * - `sampling_disabled` — Claude is not available for this account or
     *   organization.
     * - `not_declared` — the artifact no longer declares `sample`.
     * - `capability_disabled` — granted but unusable in this view.
     * - `capability_removed` — the method is not in the runtime serving
     *   this view (e.g. `json` on an older viewer app).
     * - `images_unavailable` — this view cannot send images (check
     *   {@link limits} first). Hide the IMAGE affordance only; text calls
     *   work.
     * - `tools_unavailable` — this view cannot run page tools (check
     *   {@link limits} first). Hide what depends on them; plain calls work.
     *
     * Tell the viewer, keep the control — they may try again later or with
     * different input; the page never retries by itself:
     * - `rate_limited` — too many calls (a flood from this page beyond the
     *   few that wait their turn; another open copy of this artifact using
     *   the viewer's slots), too often, or the viewer's own usage limit
     *   (which can also end an answer part-way, with `e.text`). Back off;
     *   let the VIEWER retry later.
     * - `session_expired` — the viewer must sign in again.
     * - `image_rejected` — too many images, wrong type, undecodable, or
     *   too large. Ask the viewer for a different file.
     * - `refused` — Claude declined this input, possibly AFTER some text
     *   had streamed. Any partial is withdrawn (`e.text` absent): clear
     *   what you showed. Resending unchanged gives the same outcome;
     *   change what it asks. Anything your tools already did stays done.
     * - `empty_completion` — Claude produced no text (no `onText` preceded
     *   it) (with `tools`: no round produced text). Do not resend unchanged;
     *   simplify or ask for less.
     * - `invalid_json` — {@link json} only: the reply held no parseable
     *   JSON value, or was cut short before it was complete (the message
     *   says which); `e.text` is the raw reply. Not cached: offer "Try
     *   again"; if it keeps failing, tighten the format instruction.
     * - `upstream_error` — anything else: a transient service or
     *   connection failure, before or during the answer. Keep any partial
     *   (`e.text`), mark it interrupted, offer a manual retry.
     */
    type SampleErrorCode =
      | "invalid_request"
      | "prompt_too_large"
      | "images_unavailable"
      | "tools_unavailable"
      | "image_rejected"
      | "cancelled"
      | "not_granted"
      | "session_expired"
      | "sampling_disabled"
      | "not_declared"
      | "rate_limited"
      | "refused"
      | "empty_completion"
      | "invalid_json"
      | "upstream_error"
      | "capability_disabled"
      | "capability_removed"
      | "transform_error"
      | "queue_overflow";
  }
}

interface ClaudeCapabilityMap {
  sample: typeof Claude.sample;
}
