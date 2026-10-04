---
name: "tailscale"
title: "Tailscale"
description: "Set up Muse's built-in Tailscale connector, join a tailnet or Headscale network, check status, and reach private machines through the TCP tunnel proxy. Read for Tailscale, VPN, MagicDNS, network egress, exit-node, or browser routing questions and supported limits."
metadata: { "includeInPrompt": false }
---

# Tailscale

Read `~/docs/devices/tailscale.md` before setup, network access, or answering
capability questions. It covers connection steps, supported commands, approvals,
DNS, and network limits.

Use the bundled `/opt/hatch/bin/tailscale` CLI described there. Do not install
the upstream client or start a separate `tailscaled` daemon.
