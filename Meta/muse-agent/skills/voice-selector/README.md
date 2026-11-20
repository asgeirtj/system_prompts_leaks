# Voice catalog

`voice_source.json` is a runtime asset. The voice catalog loader reads it to
support `voice.options` and voice selection. Speech synthesis also uses its
voice identifiers.

It ships from `hatch-skills/runtime-assets` with the other runtime assets and
has no workflow entry. The build installs it at `/opt/hatch/skills/voice-selector`,
where the loader reads it; the agent reads it at
`/opt/muse/assets/voice-selector`.

## Main, deprecated, and restricted voices

- **Main library:** every catalog entry not on either list below. Ranking,
  automatic picks, and suggestions offer only these voices, plus restricted
  voices for owners who pass `abra_hatch_restricted_voices`.
- **Deprecated** (`hatch-engine/crates/hatch-protocol/src/deprecated_voices.rs`):
  the entry stays in this catalog so stored selections keep their name and
  description. An owner who has had the voice as the active voice keeps it,
  sees it in the catalog, and can choose it again. "Had" means `user/voice.json`
  or a row in the newest 4 MiB of `workspace/voices/.voice_history.jsonl`.
  Nobody else sees it.
- **Restricted** (`hatch-engine/crates/hatch-protocol/src/restricted_voices.rs`):
  hidden and unselectable unless the owner passes `abra_hatch_restricted_voices`.
  A stored restricted voice is replaced by the default voice of its gender
  (the letter beside each ID): Aria for `F`, otherwise Helio.

If a voice lands on the restricted list by mistake, remove it from the list
first. Before each replacement, the daemon appended the replaced `voice_id` and
`voice_name`, the replacement, and the time to the owner's
`workspace/voices/.restricted_voice_reverts.jsonl`. This file has the voice
even when voice history has no earlier row. To restore it, save that
`voice_id` through `POST /api/voice/active-voice` on the owner's VM.

To deprecate or restrict a voice, add its ID to the list. Keep the Cosmos prompt
allowlist (`KEPLER_VQ_V2_VOICES` in
`hatch-engine/crates/hatch-realtime/src/cosmos_provider/voice_spec.rs`) entry, so
stored selections still resolve.

When expert review is available, an entry also carries `aesthetics_mean` and
`adherence_mean`. These are ranking-only quality signals: the picker uses them
to settle otherwise close, non-contradictory matches. Missing scores are
neutral and do not make an entry unavailable.

## Andrew audit — October 27, 2026

`voice_quality_audit_20261027.json` records the 23 audited low-quality voices
and the requested aesthetics score of 0.55. The 15 retained entries carry
that score and an `aesthetics_mean_note` of `Andrew audit` in the catalog. The other 8 remain excluded from the catalog;
the audit file records evidence and does not register or expose them.

Live Round 12 prompt replacements invalidate previous audio ratings.
Their catalog scores are cleared, except for the explicit Andrew audit
override. The sheet and audit notes retain the prior prompt evidence.

## VD3 additions — October 27, 2026

The 228 `avocado_v2:vd3_*` entries are 1p voice design replacements published
as new voices; their parent entries and persisted selections keep their
existing identifiers. The parents are deprecated. Names, descriptions, and scores come from the
[VD3 sheet](https://docs.google.com/spreadsheets/d/1aONGT0FSwTXmDQHpd2i7VUT77NECjJddqmZhTjNVobU/edit#gid=1732701027).

Their quality scores are estimates, not human ratings of the new clips:
aesthetics is `min(max(parent score, 1.0) + 0.11, 2.0)` and adherence is
`min(parent score + 0.11, 2.0)`. Missing parent scores default to 1.0 and
1.67 respectively. The catalog preserves the sheet's current score precision.
The original voices' Andrew audit overrides remain at 0.55.

Conditioning generation used `tts:tts_rl_vd_trackb_b5g-c3q5cp6m@650` via
`playai.mapper.custom_diffusion_decoder`. Normalized WAVs, VQ prompts, speaker
embeddings, exact generation descriptions, and source checksums are recorded
in `kepler_vq_v2/vd3_round12_manifest_20261027.json`; generation details are in
`kepler_vq_v2/README_VD3_20261027.md` in the `speech_training_v2` bucket.

## Persona onboarding (2026-10-28)

The 12 selected Persona voices use normalized `audio.wav`, `voice.json`, and
`voice.pt` packages under `kepler_vq_v2`. Their names and descriptions come
from the Persona tab and are synchronized to the Master List. Solemn Lantern
and Lilting Ripple remain excluded.

Andrew assigned all 12 catalog scores to aesthetics 1.0 and adherence 2.0;
these values are editorial defaults, not new human annotations. Source audio,
source metadata, generation model where supplied, encoding settings, and
checksums are preserved in the [selection manifest](manifold://speech_training_v2/tree/users/rosenberg/persona_new_three_20261028/persona_onboarding_selection_20261028.json).
