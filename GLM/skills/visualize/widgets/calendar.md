# Calendar

Use the bundled `<viz-calendar>` for a day schedule when this composition fits. Its Shadow DOM owns layout, colors and typography, including overlap lanes and event durations. The element applies the shared `.widget` class and a 12px content inset automatically; do not wrap it in another card or add another inset. Its flat surface uses the host card radius, corner shape and thin outline; event colors use the environment palette. Event labels stay 14px in both short and full-day views; longer ranges compact the spacing, not the type. Short blocks show only the title instead of stretching the whole schedule for secondary text. Hover, focus or tap an event to see its full title, time and detail in the shared tooltip. Use custom HTML for a different calendar view. [Complete static example](../examples/calendar.html).

## JavaScript data

Assign an array directly to `calendar.events`. Configure it before appending so the first render includes the events. The host registers the component synchronously before running the fragment; use the literal `viz-calendar` name in HTML or JavaScript so it can include the runtime. No import, initialization or custom CSS is needed.

```html
<div id="calendar-host"></div>
<script>
  {
    const root = document.getElementById("calendar-host");
    const calendar = document.createElement("viz-calendar");
    calendar.setAttribute("date", "2026-09-08");
    calendar.setAttribute("start", "11:00");
    calendar.setAttribute("end", "14:00");
    calendar.events = [
      { title: "Standup", start: "12:00", end: "12:30" },
      { title: "Email block", start: "12:00", end: "12:30", tone: "green" },
      { title: "Design sync", start: "13:00", end: "14:00", video: true },
    ];
    root.append(calendar);
  }
</script>
```

Keep the element reference for updates: `calendar.events = updatedEvents` redraws synchronously. Replace the array to update; changing an array or event in place does not trigger a render. Text is escaped by the renderer, so JavaScript values need no HTML-attribute escaping.

The property takes precedence over the `events` attribute until assigned `undefined`, which restores attribute input. Assign `[]` to clear the schedule. Property data is not reflected into HTML attributes; keep it separately when saving or restoring the fragment. Properties assigned before registration are picked up on upgrade.

## Event selection

Add `interactive` when the fragment handles event selection. Each event becomes a native button, supporting click, Enter and Space. Listen on the calendar or an ancestor:

```js
const selection = document.createElement("output");
selection.setAttribute("aria-live", "polite");
calendar.after(selection);
calendar.setAttribute("interactive", "");
calendar.addEventListener("eventselect", ({ detail: { event } }) => {
  // Update a local detail view using the selected source event.
  selection.textContent = `${event.title} · ${event.start}-${event.end}`;
});
```

`eventselect` bubbles across Shadow DOM. Its `detail.event` is the original supplied object, including any caller-owned ID; `detail.index` is its position in the input array, before sorting or clipping. Without `interactive`, event buttons expose their details without emitting a selection. Selection does not change calendar data or contact a service. Interactive events use the host's cursor preference and a subtle hover tint.

## Switching days

The component renders one day and has no built-in tabs. Add the shared [Tabs](../SKILL.md#tabs) outside it only when there are two or more supplied days to switch between; omit tabs for a single day. On selection, assign the chosen day's `date` and `events` to the same element. Do not invent more days to fill a tab bar.

## Static HTML

For a fixed snapshot, the JSON attribute remains sufficient:

```html
<viz-calendar
  date="2026-09-08"
  start="11:00"
  end="14:00"
  now="11:50"
  events='[{"title":"Standup","start":"12:00","end":"12:30"},{"title":"Design sync","start":"13:00","end":"14:00","video":true}]'
>
</viz-calendar>
```

Escape HTML attribute content, including apostrophes as `&#39;` inside single-quoted JSON. Attribute changes redraw synchronously when no JavaScript property overrides the events.

## Configuration

| Attribute      | Meaning                                                           |
| -------------- | ----------------------------------------------------------------- |
| `date`         | Required calendar date, `YYYY-MM-DD`.                             |
| `start`, `end` | Visible time window; defaults to `09:00`-`17:00`.                 |
| `now`          | Optional current-time marker. Supply only when verified.          |
| `time-zone`    | Optional short zone label; does not convert timestamps.           |
| `lang`         | Date-formatting locale; defaults to the host language.            |
| `empty-label`  | Empty-state text; defaults to "No events".                        |
| `interactive`  | Boolean attribute; enables event buttons that emit `eventselect`. |

Use the three hours around the next event for a brief check-in or the requested range for a full-day view. Times are local wall-clock `HH:MM`, with `24:00` allowed as an end. Convert source timestamps to the requested date and zone before passing them in.

Each event requires `title`, `start` and `end`. Optional fields are `tone` (`blue`, `green`, `red`, `orange`, `purple`, `yellow`), `detail` (short secondary text) and `video` (a boolean that shows a video-call icon). Tones use the environment's theme variables, such as `--green`; omitted tones default to blue. Keep a small, consistent palette for source calendars or categories. Supply at most 200 events; events outside the visible window are clipped or omitted. Invalid data produces an inline error that clears when valid data is supplied.

## Rendering and updates

The component builds its styled shadow tree synchronously on connection and updates it synchronously on assignment. An existing declarative shadow root is preserved during upgrade unless JavaScript event data was supplied, in which case that data is rendered.

This is a supplied snapshot. It has no connector, booking, background clock or network access. Refresh data in the host and pass the resulting array to `events`; update `now` separately when needed. Keep extra facts in the surrounding response.
