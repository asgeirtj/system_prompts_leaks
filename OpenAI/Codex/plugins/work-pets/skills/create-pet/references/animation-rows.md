# V2 Animation Rows

Every newly hatched pet uses an 8-column x 11-row atlas with 192x208 cells. The final atlas is 1536x2288 and uses `spriteVersionNumber: 2`.

| Row | State             | Used columns | Durations                                              |
| --- | ----------------- | -----------: | ------------------------------------------------------ |
| 0   | idle              |          0-5 | 280, 110, 110, 140, 140, 320 ms                        |
| 1   | running-right     |          0-7 | 120 ms each, final 220 ms                              |
| 2   | running-left      |          0-7 | 120 ms each, final 220 ms                              |
| 3   | waving            |          0-3 | 140 ms each, final 280 ms                              |
| 4   | jumping           |          0-4 | 140 ms each, final 280 ms                              |
| 5   | failed            |          0-7 | 140 ms each, final 240 ms                              |
| 6   | waiting           |          0-5 | 150 ms each, final 260 ms                              |
| 7   | running           |          0-5 | 120 ms each, final 220 ms                              |
| 8   | review            |          0-5 | 150 ms each, final 280 ms                              |
| 9   | look directions A |          0-7 | 000, 022.5, 045, 067.5, 090, 112.5, 135, 157.5 degrees |
| 10  | look directions B |          0-7 | 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5 degrees |

Unused cells after each standard animation row's final used column must be fully transparent. All look-row cells are used.

`000` degrees means looking up / 12 o'clock. Neutral/front is the pointer deadzone and falls back to the normal idle animation.

## Row Purposes

- `idle`: calm, low-distraction breathing/blinking loop and reduced-motion first frame.
- `running-right`: locomotion to the right with a readable alternating cadence.
- `running-left`: locomotion to the left; mirror only when identity and prop handedness remain correct, preserving frame order.
- `waving`: greeting or attention gesture with a clear start, raised gesture, and return.
- `jumping`: anticipation, lift, peak, descent, and settle.
- `failed`: readable error, sad, or deflated reaction without noisy detached effects.
- `waiting`: expectant asking pose for approval, help, or user input.
- `running`: active task work or processing, not literal foot-running.
- `review`: focused inspection of completed output.
- rows `9-10`: one continuous clockwise 16-pose look loop using pet-specific eye, head, body, appendage, and prop mechanics.
