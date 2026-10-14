---
summary: "Tailscale - private network connecting this VM to the user's own machines"
read_when:
  - Reach a machine on the user's Tailscale network or tailnet
  - Join a Tailscale network from this device, or check whether it has
  - Reach a personal, work, or home machine not on the public internet
  - Access a service on a `100.64.0.0/10` address (`100.64.` through `100.127.`)
title: "Tailscale"
---

# Tailscale

This device requests the name `muse` on your Tailscale network.

Tailscale is a private network joining this VM to the user's own machines. Once
connected, they are reachable at their tailnet addresses, which Tailscale
assigns from `100.64.0.0/10` — anything from `100.64.` to `100.127.`, not just  
`100.64.`.

This device joins as a client only: it makes outgoing connections and accepts
none. It cannot be reached from the tailnet, hosts nothing, and does not route
traffic for other machines.

> Tailscale support is experimental and work in progress.

## Connecting

```bash
tailscale up
```

Prints a link. **Show it to the user and ask them to open it** — only they can
approve this device. Approval finishes the join on its own; the connection comes
up as soon as they approve, and `tailscale status` is how you confirm it.

Safe to run again while waiting: it shows the same link again and keeps
watching for the approval. The link stays good for five days. This device
stops watching a while after each ask, so if the user needs longer, run it
again; it picks up the same link.

If the user runs their own control server (headscale or another self-hosted
control plane), pass it the way the vanilla CLI does — an https origin only:

```bash
tailscale up --login-server https://headscale.example.com
```

The choice persists with the enrollment and `tailscale status` names the login
server in use; switching to a different one needs `tailscale down` first.
Approving a custom-server join never leaves a reusable permission behind: each
approval is single-use and names the server, unlike a plain `tailscale up`,
which can carry a standing allow.

`tailscale down` disconnects this VM and erases its Tailscale identity, so
coming back up needs a fresh approval — use it when the user wants this VM to
stop holding access.

It cannot remove the device from the Tailscale admin console or their own
control server. Tell the user to delete it there themselves.

## Reaching Machines

Ordinary network access does not reach the tailnet. Reuse the runtime proxy,
changing only its port to `3130`:

```bash
tunnel_proxy="${HTTPS_PROXY%:*}:3130"
curl --proxy "$tunnel_proxy" --fail-with-body "http://<tailnet-ip>:<port>/<path>"
```

The port selects Tailscale; the address is just the destination. This carries
any TCP service, not only HTTP — point a client at the same proxy.

**TCP only, through that proxy.** The tunnel carries connections, not packets,
so `ping`, traceroute, and anything else over ICMP or UDP never reach the
tailnet — they fail or hang even when the machine is up and reachable. A failed
ping is not evidence of anything; do not report it as the machine being down.
Opening a TCP connection through the proxy is the only test.

- The first tunnel request to an address needs its own approval; web permission
  does not carry over. Once approved, the selected permission lifetime covers
  other ports and TCP services, including SSH, on that exact name or IP through
  this proxy. Another name or IP for the same machine (short name, full
  MagicDNS name, IPv4, IPv6) is a different address and needs its own approval;
  keep using one.
- Any request awaiting approval may wait for the user to answer it. Expected: do
  not time out, retry, or read the pause as a failure.
- If this device has not joined a network, or the address is not one the
  tailnet reaches, the request fails rather than falling back to the public
  internet. Check `tailscale status`.
- Never put credentials in a command.

## Inspecting

`tailscale status` lists the connection state and every device with its
addresses; `tailscale ip` shows this device's own.

Machines can be addressed by tailnet IP or, when the user's network enables
MagicDNS, by their name. Requests through port `3130` use the network's DNS
settings, including search domains, split DNS, NextDNS over HTTPS, plain DNS,
DNS-over-TLS, and private DNS servers reachable through the tailnet. If a DNS
server is unavailable, the request can try another server configured for that
same DNS route. A blocking or negative answer does not switch DNS providers.
These settings apply to requests through the Tailscale proxy. The connector
does not offer exit-node selection.

`tailscale status` says whether an address is on the network. There is no
reachability probe; test the service with a TCP connection through the proxy.

## User-Facing Language

Say "your Tailscale network" or name the machine. Do not quote raw commands or
`100.64.0.0/10` addresses unless the user asks for detail.
