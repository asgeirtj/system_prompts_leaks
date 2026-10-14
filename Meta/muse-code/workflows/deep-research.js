export const meta = { name: "deep-research" };

export default async function workflow() {
const question = typeof args === "string" ? args.trim() : "";
if (!question) {
    return {
        status: "invalid_arguments",
        text: "deep-research requires a non-empty string question",
    };
}

const MAX_ANGLES = 5;
const MAX_SOURCES = 15;
const MAX_CLAIMS = 12;
const VOTES_PER_CLAIM = 3;
const MAX_LABEL_SCALARS = 48;

const trackingQueryKey = (rawKey) => {
    const key = String(rawKey || "").toLowerCase();
    return key.startsWith("utm_")
        || ["fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid"].includes(key);
};
const canonicalizeUrl = (rawUrl) => {
    const withoutFragment = String(rawUrl || "").trim().split("#", 1)[0];
    const match = withoutFragment.match(
        /^([A-Za-z][A-Za-z0-9+.-]*):\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?$/,
    );
    if (!match) {
        return withoutFragment.replace(/\/+$/, "");
    }
    const scheme = match[1].toLowerCase();
    let authority = match[2].toLowerCase();
    if ((scheme === "https" && authority.endsWith(":443"))
        || (scheme === "http" && authority.endsWith(":80"))) {
        authority = authority.replace(/:(443|80)$/, "");
    }
    const path = (match[3] || "").replace(/\/+$/, "");
    const query = (match[4] || "")
        .split("&")
        .filter(Boolean)
        .filter((part) => !trackingQueryKey(part.split("=", 1)[0]))
        .sort()
        .join("&");
    return `${scheme}://${authority}${path}${query ? `?${query}` : ""}`;
};

const safeDisplayText = (value, fallback) => {
    const text = String(value || "")
        .replace(/[\x00-\x1f\x7f-\x9f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const bounded = Array.from(text).slice(0, MAX_LABEL_SCALARS).join("");
    return bounded || fallback;
};
const safeOutputText = (value, fallback) => {
    const text = String(value || "")
        .replace(/[\x00-\x1f\x7f-\x9f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return text || fallback;
};

const scopeSchema = {
    required: ["angles"],
    properties: {
        angles: {
            type: "array",
            items: {
                type: "object",
                required: ["label", "query", "focus"],
                properties: {
                    label: { type: "string" },
                    query: { type: "string" },
                    focus: { type: "string" },
                },
            },
        },
    },
};
const scope = await agent({
    label: "research-scope",
    schema: scopeSchema,
    input: `Map the evidence needed to answer this research question: ${question}

Return five non-overlapping investigation tracks tailored to the subject. Each track needs a short display label, a search query, and a sentence explaining what evidence it should seek. Favor complementary evidence needs and avoid restating the same query. Return structured data only.`,
});
const candidateAngles = scope && !scope.error_kind && scope.data
    && Array.isArray(scope.data.angles) ? scope.data.angles : [];
const searchAngles = candidateAngles
    .map((candidate, index) => ({
        label: safeDisplayText(candidate && candidate.label, `angle-${index + 1}`),
        query: String(candidate && candidate.query || "").trim(),
        focus: String(candidate && candidate.focus || "").trim(),
    }))
    .filter((angle) => angle.query && angle.focus)
    .slice(0, MAX_ANGLES);
if (searchAngles.length < 3) {
    return {
        status: "scope_failed",
        ref: scope && scope.ref || null,
        text: "The research angles could not be planned.",
    };
}

const sourceQualityValues = [
    "direct_evidence",
    "reported_analysis",
    "opinion",
    "discussion",
    "unknown",
];
const importanceValues = ["core_answer", "supporting_context", "edge_case"];
const discoverySchema = {
    required: ["sources", "claims"],
    properties: {
        sources: {
            type: "array",
            items: {
                type: "object",
                required: ["title", "url", "published_at", "source_quality"],
                properties: {
                    title: { type: "string" },
                    url: { type: "string" },
                    published_at: { type: "string" },
                    source_quality: { type: "string", enum: sourceQualityValues },
                },
            },
        },
        claims: {
            type: "array",
            items: {
                type: "object",
                required: ["claim", "importance", "evidence"],
                properties: {
                    claim: { type: "string" },
                    importance: { type: "string", enum: importanceValues },
                    evidence: {
                        type: "array",
                        items: {
                            type: "object",
                            required: ["source_url", "excerpt"],
                            properties: {
                                source_url: { type: "string" },
                                excerpt: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },
};
const discoveries = await parallel(searchAngles.map(({ label, query, focus }, index) => ({
    label: `search:${safeDisplayText(label, `angle-${index + 1}`)}`,
    schema: discoverySchema,
    input: `Investigate one part of this question: ${question}

Search query: ${query}
Evidence goal: ${focus}

Use WebSearch to locate useful pages, then WebFetch before making factual claims. Report only material you actually read. Every candidate claim must point to an exact excerpt and its page URL. Also record publication timing, source quality, and whether the claim is central, supporting, or an edge case. Return structured data only.`,
})));

const evidenceRefs = discoveries
    .filter((result) => result && typeof result.ref === "string")
    .map((result) => result.ref);
const evidenceResults = discoveries.map((result, index) => ({
    angle: searchAngles[index].label,
    result_ref: result && typeof result.ref === "string" ? result.ref : null,
    error_kind: result && result.error_kind || null,
    data: result && result.data || null,
}));
const sourcesByUrl = new Map();
const claimsByKey = new Map();
for (const discovery of discoveries) {
    if (!discovery || discovery.error_kind || !discovery.data) {
        continue;
    }
    const discoverySources = Array.isArray(discovery.data.sources)
        ? discovery.data.sources : [];
    for (const candidate of discoverySources) {
        const url = canonicalizeUrl(candidate && candidate.url);
        const title = String(candidate && candidate.title || "").trim();
        if (!url || !title || sourcesByUrl.has(url) || sourcesByUrl.size >= MAX_SOURCES) {
            continue;
        }
        const sourceQuality = sourceQualityValues.includes(candidate && candidate.source_quality)
            ? candidate.source_quality : "unknown";
        sourcesByUrl.set(url, {
            title,
            url,
            published_at: String(candidate && candidate.published_at || "").trim(),
            source_quality: sourceQuality,
        });
    }
}
for (const discovery of discoveries) {
    if (!discovery || discovery.error_kind || !discovery.data) {
        continue;
    }
    const discoveryClaims = Array.isArray(discovery.data.claims) ? discovery.data.claims : [];
    for (const candidate of discoveryClaims) {
        const claim = String(candidate && candidate.claim || "").trim();
        if (!claim) {
            continue;
        }
        const key = claim.toLowerCase().replace(/\s+/g, " ");
        const importance = importanceValues.includes(candidate && candidate.importance)
            ? candidate.importance : "edge_case";
        const existing = claimsByKey.get(key) || {
            claim,
            importance,
            evidence: [],
            evidenceKeys: new Set(),
        };
        if (importanceValues.indexOf(importance) < importanceValues.indexOf(existing.importance)) {
            existing.importance = importance;
        }
        const evidence = Array.isArray(candidate && candidate.evidence) ? candidate.evidence : [];
        for (const item of evidence) {
            const sourceUrl = canonicalizeUrl(item && item.source_url);
            const excerpt = String(item && item.excerpt || "").trim();
            const evidenceKey = `${sourceUrl}\n${excerpt}`;
            if (!sourcesByUrl.has(sourceUrl) || !excerpt || existing.evidenceKeys.has(evidenceKey)) {
                continue;
            }
            existing.evidenceKeys.add(evidenceKey);
            existing.evidence.push({ source_url: sourceUrl, excerpt });
        }
        claimsByKey.set(key, existing);
    }
}

const sourceQualityRank = new Map(sourceQualityValues.map((value, index) => [value, index]));
const sources = [...sourcesByUrl.values()];
const claims = [...claimsByKey.values()]
    .filter((claim) => claim.evidence.length > 0)
    .map((claim, insertionIndex) => {
        const bestQualityRank = Math.min(...claim.evidence.map((item) => {
            const source = sourcesByUrl.get(item.source_url);
            return sourceQualityRank.get(source && source.source_quality) ?? sourceQualityValues.length;
        }));
        return { ...claim, bestQualityRank, insertionIndex };
    })
    .sort((left, right) => importanceValues.indexOf(left.importance)
        - importanceValues.indexOf(right.importance)
        || left.bestQualityRank - right.bestQualityRank
        || left.insertionIndex - right.insertionIndex)
    .slice(0, MAX_CLAIMS)
    .map((claim) => ({
        claim: claim.claim,
        importance: claim.importance,
        evidence: claim.evidence,
        source_urls: [...new Set(claim.evidence.map((item) => item.source_url))],
    }));
if (claims.length === 0) {
    return {
        status: "no_evidence",
        text: "No source-backed claims were found.",
        evidenceRefs,
        sourceCount: sources.length,
    };
}

const verifierSchema = {
    required: ["verdict", "reason", "source_urls"],
    properties: {
        verdict: { type: "string", enum: ["support", "refute", "unverified"] },
        reason: { type: "string" },
        source_urls: { type: "array", items: { type: "string" } },
    },
};
const verifierRequests = claims.flatMap((claim, claimIndex) => {
    const sourceDetails = claim.source_urls
        .map((url) => sourcesByUrl.get(url))
        .filter(Boolean);
    return Array.from({ length: VOTES_PER_CLAIM }, (_, voteIndex) => ({
        label: `verify:${safeDisplayText(claim.claim, `claim-${claimIndex + 1}`)}:${voteIndex + 1}`,
        schema: verifierSchema,
        input: `Judge this candidate claim independently for the research question: ${question}

Claim: ${claim.claim}
Claim importance: ${claim.importance}
Quoted evidence: ${JSON.stringify(claim.evidence)}
Source details: ${JSON.stringify(sourceDetails)}
Evidence result refs: ${JSON.stringify(evidenceRefs)}

Use WebFetch to inspect the cited pages and WebSearch when an independent check is useful. Choose support only for the exact claim, refute when reliable evidence contradicts it, and unverified when the available material or tools cannot settle it. Return structured data only.`,
    }));
});
const verifierResults = await parallel(verifierRequests);
const verifierRecords = verifierResults.map((result, index) => {
    const claimIndex = Math.floor(index / VOTES_PER_CLAIM);
    const voteIndex = index % VOTES_PER_CLAIM;
    const data = result && result.data;
    const verdict = result && !result.error_kind && data
        && ["support", "refute", "unverified"].includes(data.verdict)
        ? data.verdict
        : "unverified";
    const reason = result && result.error_kind
        || String(data && data.reason || "verifier result unavailable").trim();
    const sourceUrls = Array.isArray(data && data.source_urls)
        ? data.source_urls.map(canonicalizeUrl).filter((url) => sourcesByUrl.has(url))
        : [];
    return {
        claim: claims[claimIndex].claim,
        vote: voteIndex + 1,
        result_ref: result && typeof result.ref === "string" ? result.ref : null,
        error_kind: result && result.error_kind || null,
        verdict,
        reason,
        source_urls: sourceUrls,
    };
});
const verifierRefs = verifierRecords
    .filter((record) => !record.error_kind)
    .map((record) => record.result_ref)
    .filter((resultRef) => typeof resultRef === "string");

const verified = [];
const unverified = [];
const refuted = [];
for (let claimIndex = 0; claimIndex < claims.length; claimIndex += 1) {
    const claim = claims[claimIndex];
    const votes = verifierRecords.slice(
        claimIndex * VOTES_PER_CLAIM,
        claimIndex * VOTES_PER_CLAIM + VOTES_PER_CLAIM,
    );
    const supportCount = votes.filter((vote) => vote.verdict === "support").length;
    const refuteCount = votes.filter((vote) => vote.verdict === "refute").length;
    const claimSources = claim.source_urls
        .map((url) => sourcesByUrl.get(url))
        .filter(Boolean);
    const row = {
        claim: claim.claim,
        importance: claim.importance,
        evidence: claim.evidence,
        citations: claimSources,
    };
    if (supportCount >= 2) {
        verified.push(row);
    } else if (refuteCount >= 2) {
        refuted.push(row);
    } else {
        const reasons = votes
            .filter((vote) => vote.verdict === "unverified")
            .map((vote) => vote.reason)
            .filter(Boolean);
        reasons.push("no two-vote majority");
        unverified.push({ ...row, reason: [...new Set(reasons)].join("; ") });
    }
}

const synthesisPayload = {
    question,
    sources,
    verified,
    unverified,
    refuted,
    evidence_refs: evidenceRefs,
    verifier_refs: verifierRefs,
    evidence_results: evidenceResults,
    verifier_results: verifierRecords,
};
const synthesisSchema = {
    required: ["report"],
    properties: {
        report: { type: "string" },
    },
};
const synthesisInput = `Write a complete cited answer to the research question. Use the verified claims as the factual basis and include source links where they help the reader check the answer. Do not present refuted claims as true. If unresolved claims matter, place them in a clearly separate section with their verification limits. Explain important caveats, confidence, and open questions. If no web sources were used, say so in the caveats. Return the finished report in the report field without additional structured claim lists.

SYNTHESIS_INPUT_JSON:${JSON.stringify(synthesisPayload)}`;
const runSynthesis = async (label) => {
    try {
        return await agent({ label, schema: synthesisSchema, input: synthesisInput });
    } catch (_) {
        return null;
    }
};
const reportFrom = (result) => {
    if (!result || result.error_kind || !result.data) {
        return null;
    }
    const report = typeof result.data.report === "string" ? result.data.report : "";
    return report.trim() ? report : null;
};

const firstSynthesis = await runSynthesis("research-synthesis");
const firstReport = reportFrom(firstSynthesis);
if (firstReport) {
    return {
        status: "ok",
        ref: firstSynthesis.ref || null,
        text: firstReport,
        verifiedClaimCount: verified.length,
        unverifiedClaimCount: unverified.length,
        sourceCount: sources.length,
    };
}
const retrySynthesis = await runSynthesis("research-synthesis-retry");
const retryReport = reportFrom(retrySynthesis);
if (retryReport) {
    return {
        status: "ok",
        ref: retrySynthesis.ref || null,
        text: retryReport,
        verifiedClaimCount: verified.length,
        unverifiedClaimCount: unverified.length,
        sourceCount: sources.length,
    };
}

const renderCitations = (citations) => citations
    .map((citation) => `[${safeOutputText(citation.title, "source")}](${safeOutputText(citation.url, "")})`)
    .join("; ");
const reportLines = ["# Research report", ""];
if (verified.length === 0) {
    reportLines.push("No candidate factual claim met the verification threshold.");
} else {
    for (const row of verified) {
        reportLines.push(
            `- ${safeOutputText(row.claim, "Verified claim")} — ${renderCitations(row.citations)}`,
        );
    }
}
if (unverified.length > 0) {
    reportLines.push("", "## Unverified", "");
    for (const row of unverified) {
        reportLines.push(
            `- ${safeOutputText(row.claim, "Unverified claim")} — ${safeOutputText(row.reason, "verification incomplete")}. Evidence: ${renderCitations(row.citations)}`,
        );
    }
}

return {
    status: "ok_fallback",
    ref: retrySynthesis && retrySynthesis.ref || firstSynthesis && firstSynthesis.ref || null,
    text: reportLines.join("\n"),
    verifiedClaimCount: verified.length,
    unverifiedClaimCount: unverified.length,
    sourceCount: sources.length,
};
}
