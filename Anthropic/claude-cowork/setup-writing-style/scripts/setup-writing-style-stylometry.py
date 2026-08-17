#!/usr/bin/env python3
"""Stylometry for /setup-writing-style: filter writing samples, compute per-register
style stats, and pick representative-but-diverse exemplars.

Pure standard library — no numpy, no sklearn (the Cowork VM ships neither
reliably). Input is a directory with one subdirectory per register
(external_email/ internal_msg/ dm/ doc/), one sample per .txt file.

Usage:
    python3 stylometry.py SAMPLES_DIR [--out analysis.json]
        [--exemplars exemplars.md] [--min-words 30] [--chat-min-words 10]
        [--per-register 5]

Registers named dm / internal_msg / slack* / chat* use --chat-min-words, and
pool files that share a "<bundle>__" filename prefix (the
"<channel-or-person>__<YYYY-MM-DD>__NNN.txt" convention) into one aggregate
sample — short-form voice is measured in bundles, not dropped message by
message. The length gates are part of the method: when a corpus fails them,
gather more real writing instead of lowering the thresholds.
"""

import argparse
import json
import math
import re
import statistics
import sys
import tempfile
from collections import Counter
from pathlib import Path

CHAT_REGISTERS = re.compile(r"^(dm|internal_msg|slack|chat)", re.I)

FORWARD_MARKERS = (
    "---------- forwarded message",
    "begin forwarded message",
    "-----original message-----",
)
AUTOREPLY_MARKERS = ("out of office", "automatic reply", "auto-reply", "ooo until")
# A quoted-reply tail ("On <date>, <someone> wrote:") and everything after it
# is other people's text — it must never contribute to the user's profile.
QUOTED_TAIL = re.compile(r"\n+On .{5,80}wrote:\s*\n", re.S)
# Inline reply headers and signature delimiters — also not the user's prose.
REPLY_HEADER = re.compile(r"^(from|to|cc|subject|date|sent):\s", re.I)
SIG_DELIM = re.compile(r"^(--\s*$|sent from my |get outlook for )", re.I)
# Outlook/M365 separates the quoted tail with a long run of underscores or
# dashes; treat it as a hard truncation boundary like SIG_DELIM.
OUTLOOK_SEP = re.compile(r"^\s*[_-]{8,}\s*$")

CONTRACTION = re.compile(
    r"\b\w+'(?:t|re|ve|ll|d|m)\b|"
    r"\b(?:it|that|there|he|she|what|who|let|here|where|how)'s\b",
    re.I,
)
GREETING = re.compile(r"^(hi|hey|hello|dear|good (morning|afternoon)|yo|howdy)\b", re.I)
CLOSING = re.compile(
    r"^(thanks|thank you|best|cheers|regards|talk soon|warmly|sincerely|ty|thx)\b", re.I
)
BULLET = re.compile(r"^\s*([-*•]|\d+[.)])\s+\S", re.M)
EMOJI = re.compile(
    "[\U0001f300-\U0001faff\U00002600-\U000027bf]|:[a-z_]+:|[:;]-?[)(DPp]"
)
SENT_SPLIT = re.compile(r"(?<=[.!?])\s+|\n{2,}")
# Unicode letters (no digits/underscore) with optional internal apostrophes —
# works for non-Latin scripts, not just ASCII.
WORD = re.compile(r"[^\W\d_]+(?:['’][^\W\d_]+)*")

# Function words + discourse markers whose relative rates fingerprint a voice.
FUNCTION_WORDS = (
    "the a an and but or so because though although just really actually "
    "maybe probably definitely honestly basically pretty quite very also "
    "however therefore anyway plus btw fwiw imo tbh kinda sorta gonna"
).split()

# Common AI-writing tells (vocab subset) — measured so the profile can record
# the user's OWN baseline rather than banning them outright.
AI_TELL_WORDS = (
    "delve leverage robust seamless streamline pivotal crucial crucially "
    "notably furthermore moreover additionally comprehensive holistic "
    "landscape ecosystem utilize foster empower elevate"
).split()
NOT_X_BUT_Y = re.compile(r"\bnot (?:just|only|merely)\b.{3,60}\bbut\b", re.I | re.S)

STOPWORDS = set(
    "the a an and or but if then than so to of in on at for with from by as is "
    "are was were be been being it its this that these those i you he she we "
    "they them his her my your our their me us do does did have has had will "
    "would can could should may might not no yes what which who when where how "
    "there here all any some more most other into about over after before "
    "out up down off just also very".split()
)


def tokenize(text):
    return [w.lower() for w in WORD.findall(text)]


def sentences(text):
    return [s.strip() for s in SENT_SPLIT.split(text) if WORD.search(s or "")]


def clean_sample(raw):
    """Keep only the user's own prose: drop forwards/auto-replies entirely;
    strip quoted-reply tails, '>' quote lines, inline reply headers, and
    everything from a signature delimiter down. Third-party text must never
    reach the stats, the exemplars, or the profile."""
    # Normalize typographic punctuation so the straight-apostrophe CONTRACTION
    # pattern still sees contractions from smart-quote sources.
    raw = raw.replace("’", "'").replace("‘", "'").replace("…", "...")
    low = raw.lower()
    if any(m in low for m in FORWARD_MARKERS) or any(
        m in low[:300] for m in AUTOREPLY_MARKERS
    ):
        return None
    text = QUOTED_TAIL.split(raw)[0]
    src = text.splitlines()
    lines = []
    i = 0
    while i < len(src):
        stripped = src[i].lstrip()
        if stripped.startswith(">"):
            i += 1
            continue
        if SIG_DELIM.match(stripped) or OUTLOOK_SEP.match(stripped):
            break
        if REPLY_HEADER.match(stripped):
            # Two or more consecutive header lines after the user's own prose
            # is the Outlook/M365 quoted-tail boundary (no "wrote:" line, no
            # '>' prefix) — truncate. A lone header-looking line is skipped
            # (a user can plausibly write "To: everyone — thanks"); a header
            # block before any prose is top-of-message headers, also skipped.
            nxt = src[i + 1].lstrip() if i + 1 < len(src) else ""
            if lines and REPLY_HEADER.match(nxt):
                break
            i += 1
            continue
        lines.append(src[i])
        i += 1
    return "\n".join(lines).strip() or None


def sample_stats(text, segments=None):
    """A sample is one file, or a pooled bundle of chat messages. `segments`
    keeps the message boundaries so per-message stats (emoji, bullets,
    greetings) stay honest when a 10-message bundle counts as one sample."""
    sents = sentences(text)
    words = tokenize(text)
    segments = segments or [text]
    return {
        "text": text,
        "segments": segments,
        "n_messages": len(segments),
        "sents": sents,
        "words": words,
        "n_words": len(words),
    }


def rate(count, denom, per=1000.0):
    return round(count / denom * per, 2) if denom else 0.0


def register_stats(samples):
    """Aggregate style statistics over one register's cleaned samples."""
    all_text = "\n\n".join(s["text"] for s in samples)
    all_words = [w for s in samples for w in s["words"]]
    all_sents = [s2 for s in samples for s2 in s["sents"]]
    n_chars = len(all_text)
    n_words = len(all_words)
    sent_lens = [len(tokenize(s)) for s in all_sents] or [0]

    # Per-message stats iterate segments, not samples — a pooled bundle is one
    # sample but many messages, and dividing by samples would inflate rates.
    segs = [seg for s in samples for seg in s["segments"]]
    first_lines, last_lines = [], []
    for seg in segs:
        lines = [ln.strip() for ln in seg.splitlines() if ln.strip()]
        if lines:
            first_lines.append(lines[0])
            # Sign-offs are often "cheers," followed by the name on its own
            # line, so scan the last two lines for a closing.
            last_lines.extend(lines[-2:])

    def punct(ch):
        return rate(all_text.count(ch), n_chars)

    lower_starts = sum(1 for x in all_sents if x and x[0].islower())
    conj_starts = sum(
        1 for x in all_sents if re.match(r"(and|but|so|also)\b", x, re.I)
    )
    fw_counts = Counter(w for w in all_words if w in FUNCTION_WORDS)
    tell_counts = Counter(w for w in all_words if w in AI_TELL_WORDS)
    grams = Counter()
    for s in samples:
        toks = s["words"]
        for n in (2, 3):
            for i in range(len(toks) - n + 1):
                g = toks[i : i + n]
                if g[0] not in STOPWORDS or g[-1] not in STOPWORDS:
                    grams[" ".join(g)] += 1
    common_grams = [g for g, c in grams.most_common(200) if c >= 3][:15]

    return {
        "n_samples": len(samples),
        "n_messages": len(segs),
        "n_words": n_words,
        "words_per_sample_median": statistics.median(s["n_words"] for s in samples),
        # For pooled chat bundles the per-sample median is words per BUNDLE;
        # this one is the honest per-message length.
        "words_per_message_median": statistics.median(
            len(tokenize(seg)) for seg in segs
        ),
        "sentence_len_mean": round(statistics.mean(sent_lens), 1),
        "sentence_len_median": statistics.median(sent_lens),
        "sentence_len_stdev": round(statistics.pstdev(sent_lens), 1),
        "contractions_per_100_words": rate(
            len(CONTRACTION.findall(all_text)), n_words, 100
        ),
        "punct_per_1000_chars": {
            "!": punct("!"), "?": punct("?"), ";": punct(";"), ":": punct(":"),
            "em_dash": rate(all_text.count("—") + all_text.count(" - "), n_chars),
            "ellipsis": rate(all_text.count("..."), n_chars),
            "parens": punct("("),
        },
        "exclam_per_100_sentences": rate(all_text.count("!"), len(all_sents), 100),
        "emoji_per_message": rate(len(EMOJI.findall(all_text)), len(segs), 1),
        "pct_sentences_start_lowercase": rate(lower_starts, len(all_sents), 100),
        "pct_sentences_start_conjunction": rate(conj_starts, len(all_sents), 100),
        "pct_messages_with_bullets": rate(
            sum(1 for seg in segs if BULLET.search(seg)), len(segs), 100
        ),
        "common_greetings": [g for g, _ in Counter(
            m.group(0).lower() for ln in first_lines
            for m in [GREETING.match(ln)] if m).most_common(3)],
        "common_closings": [c for c, _ in Counter(
            m.group(0).lower() for ln in last_lines
            for m in [CLOSING.match(ln)] if m).most_common(3)],
        "function_word_rates_per_1000": {
            w: rate(c, n_words) for w, c in fw_counts.most_common(15)
        },
        "ai_tell_baseline": {
            "tell_words_per_1000": {w: rate(c, n_words) for w, c in tell_counts.items()},
            "not_x_but_y_per_100_sentences": rate(
                len(NOT_X_BUT_Y.findall(all_text)), len(all_sents), 100
            ),
            "em_dash_per_1000_chars": rate(
                all_text.count("—") + all_text.count(" - "), n_chars
            ),
        },
        "frequent_phrases": common_grams,
    }


def tfidf_vectors(samples):
    docs = [[w for w in s["words"] if w not in STOPWORDS] for s in samples]
    df = Counter(w for d in docs for w in set(d))
    n = len(docs)
    vecs = []
    for d in docs:
        tf = Counter(d)
        v = {w: (1 + math.log(c)) * math.log(n / df[w]) for w, c in tf.items() if df[w] < n}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
        vecs.append({w: x / norm for w, x in v.items()})
    return vecs


def cosine(a, b):
    if len(b) < len(a):
        a, b = b, a
    return sum(x * b.get(w, 0.0) for w, x in a.items())


def pick_exemplars(samples, k):
    """First the most central sample, then greedily the most different ones —
    representative AND diverse, so the distill step sees the voice's range."""
    if len(samples) <= k:
        return list(range(len(samples)))
    vecs = tfidf_vectors(samples)
    mean_sim = [
        sum(cosine(v, u) for u in vecs) / len(vecs) for v in vecs
    ]
    chosen = [max(range(len(vecs)), key=lambda i: mean_sim[i])]
    while len(chosen) < k:
        # Farthest-point sampling: the candidate least similar to its
        # nearest already-chosen exemplar (ties break toward central).
        best = max(
            (i for i in range(len(vecs)) if i not in chosen),
            key=lambda i: -max(cosine(vecs[i], vecs[j]) for j in chosen)
            + 1e-9 * mean_sim[i],
        )
        chosen.append(best)
    return chosen


def pick_exemplars_stratified(samples, k):
    """pick_exemplars, with one slot reserved per audience tag when a register
    carries two or more. Tone evidence needs a contrasting pair, and plain
    diversity picks by vocabulary, not audience — a minority audience can get
    zero slots. Reserved picks are each group's most central sample; the rest
    fill by the same farthest-point rule. Registers with fewer than two
    distinct tags fall through to pick_exemplars unchanged, so single-audience
    output is identical."""
    groups = {}
    for i, s in enumerate(samples):
        tag = s.get("audience")
        if tag is not None:
            groups.setdefault(tag, []).append(i)
    if len(groups) < 2 or len(samples) <= k:
        return pick_exemplars(samples, k)
    vecs = tfidf_vectors(samples)
    chosen = []
    # Largest audiences first; k can be smaller than the number of tags.
    for tag in sorted(groups, key=lambda t: (-len(groups[t]), t))[:k]:
        members = groups[tag]
        central = max(
            members,
            key=lambda i: sum(cosine(vecs[i], vecs[j]) for j in members) / len(members),
        )
        chosen.append(central)
    mean_sim = [sum(cosine(v, u) for u in vecs) / len(vecs) for v in vecs]
    while len(chosen) < k:
        best = max(
            (i for i in range(len(vecs)) if i not in chosen),
            key=lambda i: -max(cosine(vecs[i], vecs[j]) for j in chosen)
            + 1e-9 * mean_sim[i],
        )
        chosen.append(best)
    return chosen


def english_fraction(words):
    """Fraction of tokens that are English stopwords — a cheap language probe.
    English prose lands well above 0.15; below it the English-centric
    analyses (contractions, greetings, function words) are unreliable."""
    if not words:
        return 0.0
    return round(sum(1 for w in words if w in STOPWORDS) / len(words), 3)


def load_register(reg_dir, is_chat, min_w, dropped):
    """Read one register's .txt files into samples. In chat registers, files
    sharing a '<bundle>__' filename prefix pool into one sample, so a day of
    short messages counts in aggregate instead of failing the gate one by
    one. The gate applies to the pooled bundle."""
    groups = {}
    for f in sorted(reg_dir.glob("*.txt")):
        cleaned = clean_sample(f.read_text(errors="replace"))
        if cleaned is None:
            dropped[f"{reg_dir.name}:forward/autoreply"] += 1
            continue
        key = f.stem.rsplit("__", 1)[0] if is_chat and "__" in f.stem else f.stem
        groups.setdefault(key, []).append(cleaned)
    samples = []
    for key, parts in groups.items():  # insertion order == sorted file order
        st = sample_stats("\n\n".join(parts), segments=parts)
        if st["n_words"] < min_w:
            dropped[f"{reg_dir.name}:too_short"] += len(parts)
            continue
        # The Step 2 naming convention puts the audience tag first:
        # <audience>__<slug>__<date>__<NNN>.txt. Untagged files carry None.
        st["audience"] = key.split("__", 1)[0] if "__" in key else None
        samples.append(st)
    return samples


def selftest():
    """Verify this copy of the script wasn't corrupted in transit. Asserts
    the cleaning and stats pipeline on a built-in fixture; exits non-zero on
    any mismatch."""
    fwd = "---------- Forwarded message ----------\nnot the user"
    assert clean_sample(fwd) is None, "forward not dropped"
    reply = (
        "Sounds good, let's do Tuesday! I'll bring the notes.\n\n"
        "On Mon, Jun 1, 2026 at 9:00 AM Alice <a@x.com> wrote:\n> how about tuesday?\n"
    )
    cleaned = clean_sample(reply)
    assert cleaned is not None and "tuesday?" not in cleaned, "quoted tail kept"
    assert "Alice" not in cleaned, "third-party name kept"
    sig = "Quick note.\nMore text here.\n-- \nBob Builder\nbob@x.com\n"
    assert "Builder" not in (clean_sample(sig) or ""), "signature kept"
    # Outlook/M365 inline reply — no "wrote:" line, un-prefixed quoted body.
    outlook = (
        "Sounds good, I'll send the deck tonight.\n\n"
        "________________________________\n"
        "From: Alice <a@x.com>\nSent: Mon, Jun 1, 2026 9:00 AM\n"
        "To: Bob <b@x.com>\nSubject: Re: deck\n\n"
        "Can you send the deck by EOD?\n"
    )
    cleaned = clean_sample(outlook)
    assert cleaned and "deck tonight" in cleaned, "outlook: user prose lost"
    assert "EOD" not in cleaned and "Alice" not in cleaned, "outlook: quoted body kept"
    # Same shape without the separator — the header block alone must truncate.
    cleaned = clean_sample(outlook.replace("________________________________\n", ""))
    assert cleaned and "deck tonight" in cleaned, "outlook (no sep): user prose lost"
    assert "EOD" not in cleaned, "outlook (no sep): quoted body kept"
    # A lone header-looking line in real prose is skipped, not a truncation point.
    cleaned = clean_sample("Two things.\nTo: everyone — thanks for the push.\nShip it Friday.\n")
    assert cleaned and "Ship it Friday" in cleaned, "lone header line over-truncated"
    # Top-of-message headers before any prose are skipped, body kept.
    cleaned = clean_sample("From: me\nTo: you\nSubject: hi\n\nActual body here.\n")
    assert cleaned == "Actual body here.", f"top headers mis-handled: {cleaned!r}"
    # Smart-quote normalization: typographic apostrophe must count as a contraction.
    st = sample_stats(clean_sample("I can’t make it… maybe later."))
    assert st["n_words"] == 6 and "can't" in st["words"], "smart-quote normalization broken"
    # Greetings aggregate on the greeting word, not the whole line with names.
    gstats = register_stats([sample_stats(clean_sample(t)) for t in
                             ("Hi Alice,\nsee you there.", "Hi Bob —\nworks for me.")])
    assert gstats["common_greetings"] == ["hi"], f"greetings leak names: {gstats['common_greetings']}"
    st = sample_stats("I can't make it today. Maybe tomorrow works?")
    # 8 tokens: "can't" is a single token (WORD keeps the internal apostrophe).
    assert st["n_words"] == 8, f"tokenizer drift: {st['n_words']}"
    stats = register_stats([st])
    assert stats["contractions_per_100_words"] > 0, "contraction detection broken"
    assert english_fraction(st["words"]) > 0.15, "language probe broken"
    docs = [sample_stats(t) for t in (
        "the quick brown fox jumps over the lazy dog near the river bank",
        "the quick brown fox jumps over the lazy dog near the river bank",
        "quarterly revenue projections need a careful review before the board meeting",
    )]
    picked = pick_exemplars(docs, 2)
    assert len(set(picked)) == 2 and 2 in picked, "exemplar diversity pick broken"
    # Stratified: a minority audience must get a reserved slot even when plain
    # diversity would spend both picks on the majority's topic spread.
    team_topics = (
        "the quick brown fox jumps over the lazy dog near the river bank",
        "quarterly revenue projections need a careful review before the board meeting",
        "deployment pipeline flaked again so the release train slips to thursday",
    )
    cust = "thanks so much for flagging this, the quick brown fox team will follow up"
    strat = [dict(sample_stats(t), audience="team") for t in team_topics]
    strat.append(dict(sample_stats(cust), audience="customer"))
    picked = pick_exemplars_stratified(strat, 2)
    assert any(strat[i]["audience"] == "customer" for i in picked), "stratified pick missed the minority audience"
    assert any(strat[i]["audience"] == "team" for i in picked), "stratified pick missed the majority audience"
    # Single-audience registers must be byte-identical to the plain picker.
    mono = [dict(sample_stats(t), audience="team") for t in team_topics]
    assert pick_exemplars_stratified(mono, 2) == pick_exemplars(mono, 2), "stratified not a no-op for single-audience"
    untagged = [sample_stats(t) for t in team_topics]
    assert pick_exemplars_stratified(untagged, 2) == pick_exemplars(untagged, 2), "stratified not a no-op for untagged"
    with tempfile.TemporaryDirectory() as td:
        d = Path(td) / "dm"
        d.mkdir()
        msgs = ["ship it please :)", "lgtm, merging now", "can you rerun ci"]
        for i, m in enumerate(msgs, 1):
            (d / f"alice__2026-06-01__{i:03d}.txt").write_text(m)
        (d / "solo.txt").write_text("too short")
        drops = Counter()
        pooled = load_register(d, True, 10, drops)
        assert len(pooled) == 1 and pooled[0]["n_messages"] == 3, "pooling broken"
        assert pooled[0]["audience"] == "alice", "audience tag not parsed from bundle key"
        assert drops["dm:too_short"] == 1, "standalone short-drop broken"
        rs = register_stats(pooled)
        assert rs["n_samples"] == 1 and rs["n_messages"] == 3, "segment count broken"
        assert 0 < rs["emoji_per_message"] < 1, "per-message emoji rate broken"
        assert rs["words_per_sample_median"] == 10, "bundle median broken"
        assert rs["words_per_message_median"] == 3, "per-message median broken"
        email_dir = Path(td) / "external_email"
        email_dir.mkdir()
        (email_dir / "a__b__001.txt").write_text("word " * 40)
        unpooled = load_register(email_dir, False, 30, Counter())
        assert unpooled and unpooled[0]["n_messages"] == 1, "non-chat pooled"
        assert unpooled[0]["audience"] == "a", "audience tag not parsed for non-chat"
        (email_dir / "solo.txt").write_text("word " * 40)
        with_solo = load_register(email_dir, False, 30, Counter())
        assert any(s["audience"] is None for s in with_solo), "untagged file should carry None"
    print("selftest OK")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("samples_dir", type=Path, nargs="?")
    ap.add_argument("--out", type=Path, default=Path("analysis.json"))
    ap.add_argument("--exemplars", type=Path, default=Path("exemplars.md"))
    ap.add_argument("--min-words", type=int, default=30)
    ap.add_argument("--chat-min-words", type=int, default=10)
    ap.add_argument("--per-register", type=int, default=5)
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        selftest()
        return
    if args.samples_dir is None:
        ap.error("samples_dir is required unless --selftest")

    analysis, ex_lines, dropped = {}, [], Counter()
    for reg_dir in sorted(p for p in args.samples_dir.iterdir() if p.is_dir()):
        reg = reg_dir.name
        is_chat = bool(CHAT_REGISTERS.match(reg))
        min_w = args.chat_min_words if is_chat else args.min_words
        samples = load_register(reg_dir, is_chat, min_w, dropped)
        if not samples:
            continue
        analysis[reg] = register_stats(samples)
        ef = english_fraction([w for s in samples for w in s["words"]])
        analysis[reg]["english_stopword_fraction"] = ef
        analysis[reg]["non_english_suspected"] = ef < 0.15
        audiences = Counter(
            s["audience"] for s in samples if s.get("audience") is not None
        )
        analysis[reg]["audiences"] = dict(audiences)
        ex_lines.append(f"\n## Register: {reg}\n")
        for rank, i in enumerate(pick_exemplars_stratified(samples, args.per_register), 1):
            segs_i = samples[i]["segments"]
            # Render bundles message-wise so the distill step never mistakes
            # a bundle for one continuous text.
            body = "\n\n---\n\n".join(segs_i)
            if len(body) > 1800:
                body = body[:1800] + " […]"
            aud = samples[i].get("audience")
            tag = f" — {aud}" if aud else ""
            if len(segs_i) > 1:
                tag += f" — bundle of {len(segs_i)} messages"
            ex_lines.append(f"### Exemplar {rank}{tag}\n\n{body}\n")

    if not analysis:
        sys.exit("No usable samples found. Check the samples directory layout.")
    out = {
        "registers": analysis,
        "dropped": dict(dropped),
        "provenance": {r: a["n_messages"] for r, a in analysis.items()},
    }
    args.out.write_text(json.dumps(out, indent=2))
    args.exemplars.write_text("# Selected exemplars\n" + "\n".join(ex_lines))
    print(f"Wrote {args.out} and {args.exemplars}.")
    print(json.dumps(out["provenance"], indent=2))


if __name__ == "__main__":
    main()
