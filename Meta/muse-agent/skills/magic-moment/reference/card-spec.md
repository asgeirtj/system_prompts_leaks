# Card Spec — proof artifact cards + the web-artifact process

`../cmm/card.py` is the implementation and the source of truth for every
number below; this file explains intent. Where they disagree, the code
wins — fix this file.

## Internals (maintainer reference — NOT an agent recipe)

`make_card(inner_img, hero=...)` wraps a tightly cropped content image in
the white rounded shell (`hero` is accepted for the final-reveal beat but
renders the same shell — the gold border + FINAL PICK badge is retired);
the card then enters the video as a thread message animated by
`cmm/overlay.py`'s stack renderer. `cmm/compose.py` and `cmm/script.py`
are the only callers — as an agent you reach cards solely through
screenplay `visual` beats and `./mm render`, and the verify guards
already run inside compose. Do not write driver scripts against them.

## What is locked, and why

**Single-source truth.** The proof card must be one pre-composed PNG from the
real capture. Never live-stack a body layer plus a faint layer plus a bold
layer — that doubles the text and produces a second ghost thumbnail peeking
outside the card. If you must replace a thumbnail, clear the full region to
opaque white first; a partial clear leaves a visible second cluster. Safest
option is to use the real captured body untouched.

**Content-driven height.** Card height follows the content, clamped only to
avoid absurd extremes. The bug this replaces forced a minimum height, which
produced cards that were half empty white when the crop was short. Exact
clamp values live in `make_card` in the code — they have drifted from prose
before, so read them there.

**Rounded corners are load-bearing.** The shell is rounded and `verify_card`
proves it stayed that way (transparent extreme corner, opaque inset).
Compositing anything square over the shell's top corners is the most
visible way a proof card looks wrong — bake content INTO the inner image
before `make_card`, never onto the finished card.

**Cards enter on the shared stage.** A card uses the renderer's entry and
backward arc motion. After its authored hold, it remains in the thread and
shrinks and becomes more transparent as later entries push it into depth. Use a tap for a detailed artifact reveal.

## Web-artifact process — specificity by full-block crop

Before calling something an Amazon or FedEx card, fetch it for real, then crop
to what the transcript is talking about at that second.

**Never slice by percentage.** A naive "top 28%" slice cuts through baselines
and clips glyphs mid-line. Crop to the smallest *full block* that contains the
complete thought, plus ~12px padding, complete lines only. Validate that the
bottom edge lands on a clear whitespace row; if it doesn't, expand downward
until it does.

Build the crop map per site, keyed by the noun phrase the transcript uses:

```python
CROP_MAP = {
  "hero_full":      {"box": (x0, y0, x1, y1), "note": "nav + title + dek, complete lines"},
  "model_panel":    {"box": (x0, y0, x1, y1), "note": "spec panel + all rows"},
  "hold_telemetry": {"box": (x0, y0, x1, y1), "note": "control + ring + live signal grid"},
  "punchline":      {"box": None,             "note": "final-reveal card, full frame"},
}
```

Then: identify the transcript noun phrase at that timestamp → map it to a rule
key → crop that box. If no box fits, re-capture via `browser.spawn_task` using
`getBoundingClientRect()` on the target element, then pad.

**Each proof must be visibly different.** If two crops come out identical you
picked the same rule twice — that is a failure, not a shortcut.

The boxes above are per-site and must be derived fresh for each capture —
never reuse a crop map measured against a different page.

**Use real tokens, never invented ones.** Pull the actual palette off the page
with `getComputedStyle` rather than guessing brand colors. A page that fails
to load is still useful: an invalid FedEx tracking number returns a
system-error page, which proves the flow and still yields the real FedEx
purple, orange, fonts, and radii for a faithful replica. Never substitute a
plausible blue for a brand you didn't measure.

A tight portrait image (a product shot, a generated hero) skips cropping
entirely — use the real body untouched.

## Card shapes to reach for

These are DESIGN PATTERNS for the HTML you author per beat, not code — there
is no template library; every synthetic card is fresh HTML. The look of that
HTML (the Muse Moments Kit components, scaling, and padding) is owned by
`design.md` — read it before authoring. Five shapes that have worked,
sharing the same shell logic and differing only in content:

1. **product** — thumb, title, star rating, price, delivery line, buy button
2. **order** — dark header, order number, date, item list
3. **tracking** — carrier-purple header, status, timeline
4. **call-dark** — dark background, waveform, speaker labels, timestamp
5. **confirmation-green** — white card, green check, amount, confirmation code

## Verification

`verify_card(card, name)` and `verify_proofs(cards)` live in
`../cmm/card.py` and compose runs them on every SHELL'D visual (`"shell"`
or `"hero"` beats). Standalone visuals — the default — are guarded by
render_html's blank/height checks and the deterministic photo treatment
instead. Do not hand-roll any of these checks.

Three checks, each naming its own failure via `CardVerificationError`:

1. **top-left corner transparent** — an opaque corner means a square header
   was composited over the rounded shell
2. **r16 inset opaque** — proves the shell rendered at all
3. **card not blank** — catches a render that produced nothing

There is deliberately **no fill-ratio check**. The half-empty card it would
guard against was caused by `make_card` forcing a 300px minimum height, and
`make_card` now derives height from the content itself
(`inner_h + 2*INNER_PAD`, clamped to 180–620). Every card taller than the
180px floor therefore fills exactly 100% of its usable height by
construction, so the check could not fire on any input.

Note also why a *pixel* version of that check would be wrong: the crop rule
above tells you to expand until the bottom edge lands on clear whitespace, so
a correctly cropped card ends in whitespace *by design*. Shell padding and
content whitespace are the same pixels; no pixel test can tell them apart.

`verify_card` returns its measurements so a caller can log them rather than
just asserting.
