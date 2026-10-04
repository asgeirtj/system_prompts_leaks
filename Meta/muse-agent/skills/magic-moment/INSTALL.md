# Installing magic-moment on a Muse VM

There is nothing to install. The skill tar ships the code and fonts (~13MB
on disk, ~11MB tar — no avatar; that is per-user and read off the VM at
compose time), and everything else the renders need already ships with the
VM image:

| Piece | Where it ships |
|---|---|
| imaging (PIL 10.2) | cell image (`python3-pil`) |
| ffmpeg / ffprobe | cell image (`/usr/bin`) |
| capture browser driver | the bundle's playwright-core at `/opt/hatch/skills/spaces/ts-runtime/dist/node_modules` (bundle contract), on the cell's node |
| browser | image-baked `/opt/meta-chromium/chrome` |
| transcription | daemon sandbox API → inference-proxy → host ASR service; cell ffmpeg extracts 16 kHz mono audio and ffprobe reads clip duration |

## Verify

One command, run by whoever will run the renders — normally the agent
itself, from inside the cell. No sudo, no root, no network:

```bash
bash <skill-dir>/install.sh          # seconds, idempotent
bash <skill-dir>/install.sh --check  # sub-second preflight, never mutates
```

The full run verifies every leg of the shipped stack, does a smoke render
through the real capture path, and reclaims the vendor layer older
installs left on the home volume (WeasyPrint era through the pip-playwright
era, up to ~500MB of dead weight).

No daemon restart: skill discovery is content-hashed, so the agent sees the
skill on its next turn.

Why the rules exist:
- **Never install pieces by hand.** The shipped stack is the contract the
  pipeline was tuned against. If `install.sh` says the stack is incomplete,
  the VM image predates it — report that setup is not possible on this VM;
  do not improvise with pip, npm, or browser downloads.
- **Dev machines** (no cell image) override each leg explicitly: `MM_NODE`,
  `MM_PLAYWRIGHT_MODULES`, `JARVIS_CHROMIUM_BINARY`, `MM_FFMPEG`.

## Updating

Update the bundled skill through the supported Jarvis deploy flow. Do not extract a separate skill copy into the user's workspace. The canonical runtime path is `/opt/hatch/skills/magic-moment/`.

The fast check establishes dependency presence. The full check exercises static capture. Transcription, animated capture, and the final audio/video build still require run-specific validation.
