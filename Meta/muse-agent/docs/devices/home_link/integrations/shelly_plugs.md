# Shelly Plugs (Gen 4): Switching and Power Metering

**Last verified:** 2026-09-21 on a Shelly Plug US Gen 4 (model S4PL-00116US,
firmware 2.0.0)

Use this guide when fresh discovery identifies a Shelly smart plug and the user
asks to switch it or to read what it is drawing.

## Identifying the Plug

- **mDNS** is the strongest signal. Shelly plugs advertise over `_http._tcp`
  with a hostname built from the model and the device MAC, such as
  `ShellyPlugUSG4-<MAC>.local`, where `<MAC>` is the twelve hex digits with no
  separators. The device reports its own MAC the same way, without colons.
- **The MAC vendor prefix** is supporting evidence, not proof. Shelly hardware
  has shipped under more than one prefix, so a match is a positive signal and a
  miss proves nothing. Resolve the current prefixes the way
  `~/docs/devices/home_link.md` requires: look up the manufacturer's public
  vendor prefixes, then compare them against the discovery result locally.
  Send only a vendor prefix to an online lookup, never a full MAC address.
- **Confirm before acting.** Request `Shelly.GetDeviceInfo` and check `model`,
  `app`, and `gen`. That answer, not the hostname, is what establishes the
  device is what you think it is.

Addresses are DHCP by default. Identify the plug by MAC or hostname and take
its address from the current discovery result every time. Never reuse a
remembered address.

## Check the Generation First

The API depends on the generation, and the two are not compatible.

- `gen` 2 or higher, which covers Gen 4, uses the RPC API described below.
- `gen` 1 predates RPC entirely and uses `/relay/0?turn=on`. If you find a
  Gen 1 device, the rest of this guide does not apply.

## Recommended Path

1. Re-discover the plug and take its address and port from the current result.
2. Reach it through the Home Link CONNECT proxy. It serves a documented HTTP
   API, so the HTTP section of `~/docs/devices/home_link.md` applies,
   including its approval and redirect rules.
3. Call `Shelly.GetDeviceInfo` to confirm the model and generation, and to read
   `auth_en`.
4. Read `Switch.GetStatus?id=0` before acting, so you know the state you are
   changing and can tell a no-op from a real change. A plug has one switch, at
   `id=0`.
5. Switch with `Switch.Set?id=0&on=true` or `on=false`. The reply is
   `{"was_on": <bool>}`, which is the state *before* the call, not the result.
   Treating it as the new state inverts the meaning.
6. Read the state back. `Switch.GetStatus?id=0` gives `output` for the relay
   and `apower` for watts actually drawn. `output` alone says the relay moved;
   `apower` is what shows the attached load responded. Confirm both before
   telling the user it worked.

For an action that should not be left latched on, `Switch.Set` also accepts
`toggle_after=<seconds>`, which reverts the plug without needing a second call
to survive.

## Endpoints

| Action | Path |
|---|---|
| Device model, generation, firmware, `auth_en` | `/rpc/Shelly.GetDeviceInfo` |
| Full device status | `/rpc/Shelly.GetStatus` |
| One switch's status | `/rpc/Switch.GetStatus?id=0` |
| Turn on or off | `/rpc/Switch.Set?id=0&on=true` |
| Turn on or off, reverting later | `/rpc/Switch.Set?id=0&on=true&toggle_after=60` |
| Toggle | `/rpc/Switch.Toggle?id=0` |
| Switch configuration, including auto-off | `/rpc/Switch.SetConfig` |
| Schedules | `/rpc/Schedule.List`, `Schedule.Create`, `Schedule.Delete` |

## Auth

Read `auth_en` from `Shelly.GetDeviceInfo` rather than assuming. A plug on a
home network is often left unauthenticated, and plain HTTP works. That is a
property of the individual device, not of the model.

When `auth_en` is true the device wants HTTP digest auth, and the user name is
always `admin`. Do not put the password in the command. If no stored credential
exists for the plug, follow the credential rules in
`~/docs/devices/home_link.md` and explain that setup is required.

## Other Capabilities

Worth knowing about, though most requests will not need them:

- Power metering beyond `apower`: voltage, current, frequency, and cumulative
  energy in watt-hours under `aenergy`, with recent per-minute history.
- A built-in light sensor, reported under `illuminance:0`.
- Overpower and overcurrent protection thresholds, in the switch config.
- BLE and BTHome, MQTT, the vendor cloud, and Matter. These are alternative
  control planes. Prefer the local RPC API over the network the Link already
  reaches.
