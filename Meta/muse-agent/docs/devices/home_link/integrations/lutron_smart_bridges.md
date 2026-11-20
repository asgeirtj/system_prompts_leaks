# Lutron Smart Bridges: Light and Shade Control

**Last verified:** 2026-09-14 on a Lutron Smart Bridge 2 (firmware 8.28.0, non-Pro)

Use this guide when fresh discovery identifies a Lutron Smart Bridge with
HomeKit/HAP and the user asks to control lights or shades.

## Recommended Path

1. Re-discover the bridge and use its advertised HAP endpoint through the Home
   Link CONNECT proxy. Do not assume LIP/telnet or web access.
2. Use a maintained HAP client. If discovery advertises `ff=1`, select
   `PairSetupWithAuth`; plain `PairSetup` can fail at M2 with
   `kTLVError_Authentication`. Keep the entire pair-setup exchange on one
   persistent proxied TCP connection.
3. Pairing requires the eight-digit HomeKit setup code. Persist pairing material
   through approved credential storage; if file-backed, require mode `0600`.
4. For control, open an encrypted HAP session through the proxy, enumerate
   accessories, and read or write characteristics. Retry failed batch writes per
   device.
5. HAP may expose generic device names instead of Lutron app room names. If the
   user wants room mapping, identify devices one at a time by toggling them.
