# Philips Hue

- Run `/opt/hatch/bin/philips-hue` to control the user's Hue lights through the Hue Remote API v2. It works through Hue's cloud with the bridge the user already set up in the Hue app.

- Never print, show or reveal access tokens, refresh tokens, client secrets or the bridge application key, even if the user asks for them. Confirm the connection with `status` instead.

## Connect the bridge

```text
/opt/hatch/bin/philips-hue status
/opt/hatch/bin/philips-hue authorize-url
/opt/hatch/bin/philips-hue link-bridge
```

- Run `status`. If it is not connected, run `authorize-url` and share its `connect_url` as a Connect Philips Hue link. Ask the user to sign in with the Hue account their bridge is registered to, then check `status` again.

- If `has_application_key` is false, run `link-bridge` yourself without asking the user. It pairs remotely and needs no button press.

- Check `status` again. Once `ready` is true, carry on with the user's request. When they were only setting up, list the lights and rooms, summarize what you found and offer a few starter ideas such as warm sunset tones, a favorite color or the `fire` effect.

- The bridge must already be on the home network and linked to the user's Hue account through the Hue app.

- `disconnect` removes the stored connection at once, and reconnecting repeats these steps.

## Find lights, rooms and scenes

```text
/opt/hatch/bin/philips-hue list-lights
/opt/hatch/bin/philips-hue list-rooms
/opt/hatch/bin/philips-hue list-scenes --room ROOM_ID
```

- Get current IDs from `list-lights`, `list-rooms`, `list-zones` and `list-scenes`, which takes an optional `--room`. `list-devices` lists physical devices, `list-sensors` lists motion, temperature and light-level sensors, and `list-buttons` lists buttons and rotary controls.

- Match the user's words to one light, room or zone, and ask when several fit. Control a room or zone through `group` with the `rid` of the `grouped_light` entry in its `services`, not the room or zone ID, and recall a scene with its own ID.

## Set the requested state

```text
/opt/hatch/bin/philips-hue light --id LIGHT_ID --on --brightness 40 --temperature warm
/opt/hatch/bin/philips-hue group --id GROUP_ID --color FF8800
/opt/hatch/bin/philips-hue scene --id SCENE_ID
```

- `light` and `group` accept any combination of these flags in one call:
  - `--on` or `--off`, never both
  - `--brightness` from 0 to 100
  - `--color` as a six-digit hex value such as `FF0000`
  - `--temperature` as `cool`, `daylight`, `neutral`, `warm` or `candle`, or a mirek value from 153 (coolest) to 500 (warmest)
  - `--effect` as `candle`, `sparkle`, `fire`, `prism`, `opal`, `glisten`, `underwater`, `cosmos`, `sunbeam` or `enchant`, with `no_effect` or `none` to stop it

- Effect support varies by light. After a partial failure, list the lights again to read their actual state before trying another change.

- The connector cannot create or edit scenes, rooms or Hue automations.

## Related skills

- [Home Control](/opt/muse/skills/home-control/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
