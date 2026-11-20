# Tailscale

- Muse has a built-in Tailscale client that joins this VM to the user's private network, their tailnet, requesting the device name `muse`. Run `/opt/hatch/bin/tailscale`, which is not the upstream CLI, and never install the upstream client or start `tailscaled`.

- Follow this doc for Tailscale, even where `tailscale` help or status output points to the older `~/docs/devices/tailscale.md` guide.

- It joins as a client only. It makes outgoing TCP connections, accepts none, hosts nothing and routes no traffic for other machines.

- Joining and leaving ask the user for approval. `status` and `ip` do not.

## Join or leave a network

```text
/opt/hatch/bin/tailscale up
/opt/hatch/bin/tailscale up --login-server https://headscale.example.com
/opt/hatch/bin/tailscale down
```

- `up` prints a link. Show it to the user, because only they can approve this device, and confirm the connection with `status` once they have.

- Running `up` again while approval is pending shows the same link and resumes waiting. The link lasts five days.

- This VM stops checking for the approval a while after each `up`. If the user approves later, or `status` says approval was not detected, run `up` again to check the same link.

- For Headscale or another self-hosted control server, pass `--login-server` with an https origin. The choice persists and appears in `status`, so run `down` before switching servers. Each custom-server join needs its own single-use approval naming that server.

- `down` disconnects and erases this VM's Tailscale identity, so rejoining needs a new approval. It cannot remove the device from the user's admin console or control server, so tell the user to delete it there.

## Reach a private service

```sh
tunnel_proxy="${HTTPS_PROXY%:*}:3130"
curl --proxy "$tunnel_proxy" --fail-with-body "http://<tailnet-address>:<port>/<path>"
```

- Ordinary networking does not reach the tailnet. Reuse the runtime proxy with only its port changed to `3130`, where the port selects Tailscale and the address is the destination.

- The proxy carries any TCP service. Point SSH and other TCP clients at the same HTTP proxy through CONNECT, and use an existing service with a safe read path.

- The tunnel carries connections, not packets. Ping, traceroute, ICMP and UDP never reach the tailnet, so a failed ping proves nothing, and only a TCP connection through the proxy is a real test.

- The first request to each exact name or IP needs its own approval, which then covers other ports and TCP services at that address for its selected lifetime. A short name, MagicDNS name, IPv4 and IPv6 address of one machine are separate addresses, so keep using one.

- Wait while any approval is pending. Do not time out, retry or treat the pause as a failure.

- Requests fail rather than fall back to the public internet when this VM is not joined or the address is outside the tailnet. Check `status` when that happens.

- Never put credentials in a command.

## Check addresses and DNS

```text
/opt/hatch/bin/tailscale status
/opt/hatch/bin/tailscale ip
```

- `status` shows the enrollment state, the login server and each device with its addresses and advertised subnet routes. `ip` shows this VM's own addresses. Tailnet IPv4 addresses span `100.64.0.0/10`, from `100.64.` to `100.127.`.

- Appearing in `status` does not make a service reachable. Reaching a machine does not reach its local network either, which needs an advertised subnet route.

- Address machines by tailnet IP or, when MagicDNS is on, by name. The proxy follows the tailnet's DNS settings, including search domains, split DNS and private DNS servers. If a DNS server is unavailable it may try another for the same route, but a negative or blocked answer does not switch providers.

- Browser traffic and ordinary network access do not use this proxy, and exit nodes are not supported. The upstream `ping`, `ssh`, `serve` and `funnel` commands are unavailable, and you must not install another client or weaken network isolation to work around these limits.

## Report results

- Say "your Tailscale network" or name the machine. Leave out commands and `100.x` addresses unless the user asks for detail.

- Report a machine or service as reachable only after a request to it succeeds.

## Related skills

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
