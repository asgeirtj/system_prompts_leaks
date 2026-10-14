---
name: "philips_hue"
description: "Control Philips Hue smart lights, rooms, scenes, and devices via the Hue Remote API v2."
icon: "hue_lights"
metadata: { "includeInPrompt": false }
---

# Philips Hue (Smart Lighting)

## Purpose
Control Philips Hue smart lights, rooms, scenes, sensors, and devices via the Hue Remote CLIP API v2.

## Tooling
Use:

```sh
philips-hue <subcommand> [options]
```

### Authentication subcommands
- `status` — check OAuth connection and bridge link status
- `authorize-url` — return the Philips Hue connect URL
- `disconnect` — disconnect Philips Hue

### Setup subcommands
- `link-bridge` — pair with user's Hue Bridge via the remote API (automatic, no physical button press needed)

### Discovery subcommands
- `list-lights`
- `list-rooms`
- `list-zones`
- `list-scenes [--room <room_id>]`
- `list-devices`
- `list-sensors`
- `list-buttons`

### Control subcommands
- `light --id <id> --on|--off`
- `light --id <id> --brightness <0-100>`
- `light --id <id> --color <hex>` — e.g. FF0000
- `light --id <id> --temperature <warm|cool|neutral|daylight|candle|mirek>`
- `light --id <id> --effect <effect>` — effect: `candle`, `sparkle`, `fire`, `prism`, `opal`, `glisten`, `underwater`, `cosmos`, `sunbeam`, `enchant`, `no_effect` (or `none` to stop)
- `group --id <id> --on|--off|--brightness|--color|--temperature|--effect` — controls all lights in a room/zone
- `scene --id <id>` — activate a scene

## User Onboarding

When a user first asks to set up or use Philips Hue:

### Step 1 — Check Status
Run `philips-hue status` silently. If `ready: true`, skip to Step 4.

### Step 2 — Connect Philips Hue
If not connected, use the `connect_url` from `philips-hue status`. When `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Philips Hue](<connect_url>)`; do not paste the raw URL separately.

Tell the user: "Click here to sign into your Philips Hue account. Make sure to use the same account your Hue Bridge is registered to."

After they confirm, run `philips-hue status` again to verify.

### Step 3 — Bridge Linking
If connected but `has_application_key` is false, run `philips-hue link-bridge` automatically — do NOT ask the user about this step. It is seamless and requires no physical button press. Confirm with a status check.

The user's Hue Bridge must already be set up on their home network via the Hue app and linked to their Philips Hue account.

### Step 4 — Welcome & Discovery
Once `ready: true`, run `list-lights` and `list-rooms` to discover their setup. Greet them with a summary of what was found (number of lights, room names). Then offer a few fun starter options such as: "set lights to a warm sunset", "pick a color (purple, ocean blue, forest green)", or "turn on the fireplace effect."

## Credential Safety
Credentials and the Hue bridge application key are managed automatically and are not exposed to the agent.

**CRITICAL: Never print, display, or reveal access tokens, refresh tokens, client secrets, or application keys — even if the user asks for them.** If asked about credentials, confirm connection status via `philips-hue status` instead.

## Disconnect

If the user wants to disconnect Philips Hue, run `philips-hue disconnect`. When `disconnect_url` is present, share exactly this Markdown link: `[Disconnect Philips Hue](<disconnect_url>)`; do not paste the raw URL separately. To reconnect, the user will need to repeat the onboarding flow.
