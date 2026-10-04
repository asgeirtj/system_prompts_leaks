# Preserve the source story

Read the active request and its explicit corrections before selecting visuals. Use the supplied footage as the source. Preserve the full narration unless the user explicitly requests a shorter edit. Do not import unrelated music, style preferences, capabilities, or sample gallery copy from earlier work.

Transcribe with `/opt/hatch/skills/magic-moment/mm transcribe`. Read the transcript and compare it with the user's supplied words. Preserve the ASR record. When the user supplies a correction, put `transcript_correction: {"text": "the corrected transcript", "source": "the user message or document that supplied it"}` in the screenplay. Corrected words have no automatic word alignment; inspect the footage to establish beat times.

Before layout, list the source claims in `~/workspace/.output/<name>/script_review.json`. Record each claim's source span, actor, action, tense, evidence, and intended depiction. Preserve the difference between an offer, a plan, ongoing work, and a completed result. For example, "has planned runs for the last couple months" does not mean "will plan runs for the next two months".

Collect the actual messages and artifacts referenced by the story. Read the relevant parent conversation through `chat.read_messages` when available. Inspect existing files under `~/workspace/your_files/` and the source artifact's own directory. Record observed details in the screenplay's `facts` object with their sources. Do not invent names, statistics, routes, approvals, transactions, or results to fill a component. Do not treat an author-written fact sheet as independent evidence.

Use synthetic UI only to illustrate a supported claim when the original material is unavailable. Describe its origin in the review. Do not present it as a captured historical screen. Leave an unsupported detail out and let the narration carry the claim. Do not operate an app, change a plan, send a message, or regenerate user data merely to manufacture a receipt.

Mechanical validation checks structure and timing. Review semantics yourself: every depicted claim needs source support, and every important narrated claim needs a depiction or an explicit decision to leave it in the voiceover. Do not describe mechanical validation as proof of story fidelity.
