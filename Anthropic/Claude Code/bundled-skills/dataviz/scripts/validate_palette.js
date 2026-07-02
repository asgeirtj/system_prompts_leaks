/**
 * Validate a categorical chart palette against the computable data-viz checks.
 *
 * Design-system-agnostic: feed it ANY palette's hex values plus the mode and
 * surface, and it computes — never eyeballs — the four checks that can be
 * measured from color alone:
 *
 *   2. Lightness band   — OKLCH L within the mode's band
 *   3. Chroma floor     — OKLCH C >= floor (below it a hue reads as gray)
 *   4. CVD separation   — Machado-2009 ΔE between slots (protan/deutan/tritan);
 *                         adjacent pairs by default, pairs:"all" for scatter/bubble/maps
 *   5. Contrast vs surface — WCAG ratio of each mark against the chart surface
 *
 * Checks 1 (fixed hue order) and 6 (values are from the documented palette) are
 * structural rules the skill enforces, not measurable from hexes alone.
 *
 * Usage (node):
 *   node validate_palette.js "#2a78d6,#1baf7a,#eda100,#008300,#4a3aa7,#e34948,#e87ba4,#eb6834" --mode light
 *   node validate_palette.js "#256abf,#199e70,..." --mode dark --surface "#1a1a19"
 *   node validate_palette.js "#cde2fb,#9ec5f4,#6da7ec,#3987e5,#256abf" --ordinal
 *
 * Usage (browser — as a module script):
 *   <body data-palette="#2a78d6,#1baf7a,..." data-mode="light">
 *   <script type="module" src="validate_palette.js"></script>
 *   → logs a console.table of the report and console.warn on any FAIL.
 *
 * Exit code 0 unless a check hard-FAILs; 1 on any FAIL. WARN bands do not fail:
 * adjacent CVD in the 8–12 floor band, and contrast in the sub-3:1 relief band,
 * are reported as WARNs and still exit 0 (each is legal only with mandatory
 * secondary encoding: direct labels, gaps, or texture).
 */

// ── thresholds ────────────────────────────────────────────────────────────────
const BAND = { light: [0.43, 0.77], dark: [0.48, 0.67] }; // OKLCH L
const CHROMA_FLOOR = 0.10; // OKLCH C
const CVD_TARGET = 12.0, CVD_FLOOR = 8.0; // CIE76 ΔE on adjacent pairs
const CONTRAST_MIN = 3.0; // WCAG vs surface
const DEFAULT_SURFACE = { light: "#fcfcfb", dark: "#1a1a19" };
const ORDINAL_MIN_DL = 0.06; // min OKLCH ΔL between adjacent steps
const ORDINAL_LIGHT_FLOOR = 2.0; // lightest step: WCAG contrast vs surface

// Machado, Oliveira & Fernandes (2009) CVD transforms at severity 1.0 (linear RGB).
const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868],
           [0.114503, 0.786281, 0.099216],
           [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968],
           [0.280085, 0.672501, 0.047413],
           [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779],
           [-0.078411, 0.930809, 0.147602],
           [0.004733, 0.691367, 0.303900]],
};

// ── color conversions ──────────────────────────────────────────────────────────
const hex2srgb = (h) => { h = h.trim().replace(/^#/, ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
const s2lin = (c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lin2s = (c) => { c = Math.max(0, Math.min(1, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const lin = (h) => hex2srgb(h).map(s2lin);
const relLum = (h) => { const [r, g, b] = lin(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

function oklab(h) {
  const [r, g, b] = lin(h);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, // L
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, // a
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s, // b
  ];
}
const oklch = (h) => { const [L, a, b] = oklab(h); return [L, Math.hypot(a, b)]; };
const okhue = (h) => { const [, a, b] = oklab(h); return ((Math.atan2(b, a) * 180 / Math.PI) % 360 + 360) % 360; };

// CIELAB (D65) for ΔE
function lin2lab(r, g, b) {
  const X = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
  const Z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;
  const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const [fx, fy, fz] = [f(X / 0.95047), f(Y / 1.0), f(Z / 1.08883)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function simulate(h, kind) {
  const [r, g, b] = lin(h), M = MACHADO[kind];
  const clamp = (c) => Math.max(0, Math.min(1, c));
  return [
    clamp(M[0][0] * r + M[0][1] * g + M[0][2] * b),
    clamp(M[1][0] * r + M[1][1] * g + M[1][2] * b),
    clamp(M[2][0] * r + M[2][1] * g + M[2][2] * b),
  ];
}
function deltaE(h1, h2, kind) {
  const a = lin2lab(...(kind ? simulate(h1, kind) : lin(h1)));
  const b = lin2lab(...(kind ? simulate(h2, kind) : lin(h2)));
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// ── checks ─────────────────────────────────────────────────────────────────────
export function validate(palette, { mode = "light", surface, pairs = "adjacent" } = {}) {
  surface ??= DEFAULT_SURFACE[mode];
  const [lo, hi] = BAND[mode];
  const report = [];
  let ok = true;

  // 2. lightness band
  const offband = palette.filter(c => { const L = oklch(c)[0]; return L < lo || L > hi; })
    .map(c => [c, +oklch(c)[0].toFixed(3)]);
  if (offband.length) ok = false;
  report.push(["Lightness band", !offband.length,
    offband.length ? `outside band: ${JSON.stringify(offband)}` : `all ${palette.length} inside L ${lo}–${hi}`]);

  // 3. chroma floor
  const lowc = palette.filter(c => oklch(c)[1] < CHROMA_FLOOR).map(c => [c, +oklch(c)[1].toFixed(3)]);
  if (lowc.length) ok = false;
  report.push(["Chroma floor", !lowc.length,
    lowc.length ? `below floor (reads gray): ${JSON.stringify(lowc)}` : `all ${palette.length} >= ${CHROMA_FLOOR}`]);

  // 4. CVD separation — adjacent for stacks/bars/lines; ALL pairs for scatter/bubble/maps/small-multiples
  const n = palette.length;
  const pairlist = pairs === "all"
    ? Array.from({ length: n }, (_, i) => Array.from({ length: n - i - 1 }, (_, k) => [i, i + 1 + k])).flat()
    : Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);
  const label = pairs === "all" ? "all-pairs" : "adjacent";
  let worst = null;
  for (const kind of ["protan", "deutan"]) {
    for (const [i, j] of pairlist) {
      const d = deltaE(palette[i], palette[j], kind);
      if (worst === null || d < worst[0]) worst = [d, kind, palette[i], palette[j]];
    }
  }
  const tri = pairlist.length ? Math.min(...pairlist.map(([i, j]) => deltaE(palette[i], palette[j], "tritan"))) : 99;
  const nor = pairlist.length ? Math.min(...pairlist.map(([i, j]) => deltaE(palette[i], palette[j]))) : 99;
  const wd = worst ? worst[0] : 99;
  const cvdState = wd >= CVD_TARGET ? "pass" : wd >= CVD_FLOOR ? "floor" : "fail";
  if (cvdState === "fail") ok = false;
  report.push(["CVD separation", cvdState,
    worst ? `worst ${label} ${worst[3]}↔${worst[2]} ΔE ${wd.toFixed(1)} (${worst[1]}) · tritan ${tri.toFixed(1)} · normal ${nor.toFixed(1)}` : "n/a"]);

  // 5. contrast vs surface — sub-3:1 is a documented conditional relax (visible labels / table view), not a hard fail
  const low = palette.filter(c => contrast(c, surface) < CONTRAST_MIN).map(c => [c, +contrast(c, surface).toFixed(2)]);
  report.push(["Contrast vs surface", low.length ? "relief" : "pass",
    low.length ? `below ${CONTRAST_MIN}:1 — relief required (visible labels or table view): ${JSON.stringify(low)}`
               : `all ${palette.length} >= ${CONTRAST_MIN}:1`]);

  return { report, ok };
}

export function validateOrdinal(palette, { mode = "light", surface } = {}) {
  /* Ordered categories (funnel stages, size tiers, time buckets rendered as
     discrete marks) take a one-hue ramp, not categorical hues. The categorical
     checks FAIL a correct ramp by design (it spans the lightness band; light
     steps drop below the chroma floor). The ordinal checks instead verify the
     ramp reads *as a ramp*: one hue, monotone lightness with visible gaps
     between steps, and a lightest step that still clears the surface. */
  surface ??= DEFAULT_SURFACE[mode];
  const report = [];
  let ok = true;
  const Ls = palette.map(c => oklch(c)[0]);

  // Monotone lightness — sorted by L must match input order (or its reverse).
  const order = [...Ls.keys()].sort((a, b) => Ls[a] - Ls[b]);
  const fwd = order.every((v, i) => v === i);
  const rev = order.every((v, i) => v === Ls.length - 1 - i);
  const mono = fwd || rev;
  if (!mono) ok = false;
  report.push(["Lightness monotone", mono,
    mono ? "steps read light→dark" : `out of order — L values ${JSON.stringify(Ls.map(l => +l.toFixed(3)))}`]);

  // Adjacent ΔL — each step must be visibly distinct from its neighbour.
  const gaps = Ls.slice(1).map((l, i) => Math.abs(l - Ls[i]));
  const thin = gaps.map((g, i) => [palette[i], palette[i + 1], +g.toFixed(3)]).filter(([, , g]) => g < ORDINAL_MIN_DL);
  if (thin.length) ok = false;
  report.push(["Adjacent ΔL", !thin.length,
    thin.length ? `steps too close: ${JSON.stringify(thin)}` : `all gaps >= ${ORDINAL_MIN_DL}`]);

  // Lightest step vs surface — the pale end must still read as a mark.
  const byL = [...palette].sort((a, b) => oklch(a)[0] - oklch(b)[0]);
  const lightest = mode === "light" ? byL[byL.length - 1] : byL[0];
  const cr = contrast(lightest, surface);
  if (cr < ORDINAL_LIGHT_FLOOR) ok = false;
  report.push(["Light-end contrast", cr >= ORDINAL_LIGHT_FLOOR,
    `${lightest} at ${cr.toFixed(2)}:1 vs surface` + (cr >= ORDINAL_LIGHT_FLOOR ? "" : ` — below ${ORDINAL_LIGHT_FLOOR}:1 floor`)]);

  // Single hue — an ordinal ramp is one hue; a hue jump means it's categorical.
  const hues = palette.map(okhue);
  let spread = hues.length ? Math.max(...hues) - Math.min(...hues) : 0;
  if (spread > 180) spread = 360 - spread;
  const oneHue = spread <= 40;
  if (!oneHue) ok = false;
  report.push(["Single hue", oneHue,
    `hue spread ${spread.toFixed(0)}°` + (oneHue ? "" : " — >40°, not a one-hue ramp")]);

  return { report, ok };
}

// ── entrypoints ────────────────────────────────────────────────────────────────
const GLYPH = { true: "PASS", false: "FAIL", pass: "PASS", floor: "WARN", fail: "FAIL", relief: "WARN" };

function printReport({ report, ok }, { mode, surface, ordinal, n }) {
  const kind = ordinal ? "ordinal ramp" : "categorical";
  console.log(`\nPalette (${mode}, surface ${surface}, ${kind}): ${n} slots`);
  for (const [name, state, detail] of report) {
    console.log(`  [${(GLYPH[state] ?? state).padEnd(4)}] ${name.padEnd(22)} ${detail}`);
  }
  if (ordinal) {
    console.log(`\n  → ${ok ? "ALL CHECKS PASS" : "FAILED — fix the marked checks"}`
      + "  (ordinal: one hue, monotone L, visible step gaps, light end clears surface)");
  } else {
    console.log(`\n  → ${ok ? "ALL CHECKS PASS" : "FAILED — fix the marked checks"}`
      + "  (CVD in the 8–12 floor band is legal ONLY with secondary encoding: direct labels, gaps, or texture)");
    console.log("  scope: categorical palettes only. For a lone status/text color check WCAG"
      + " text contrast; for a sequential ramp, lightness monotonicity.\n");
  }
}

// Node CLI
if (typeof process !== "undefined" && process.argv && process.argv[1] && process.argv[1].endsWith("validate_palette.js")) {
  const args = process.argv.slice(2);
  const VALUE_FLAGS = new Set(["--mode", "--surface", "--pairs"]);
  const CHOICES = { mode: ["light", "dark"], pairs: ["adjacent", "all"] };
  const opts = {}; let positional = null;
  for (let i = 0; i < args.length; i++) {
    let a = args[i], val;
    const eq = a.indexOf("="); if (eq > 0) { val = a.slice(eq + 1); a = a.slice(0, eq); }
    if (VALUE_FLAGS.has(a)) { opts[a.slice(2)] = val ?? args[++i]; }
    else if (a === "--ordinal") { opts.ordinal = true; }
    else if (a.startsWith("--")) { console.error(`unknown flag: ${a}`); process.exit(2); }
    else if (positional === null) { positional = a; }
    else { console.error(`unexpected extra positional: ${a}`); process.exit(2); }
  }
  for (const [k, allowed] of Object.entries(CHOICES)) {
    if (opts[k] != null && !allowed.includes(opts[k])) {
      console.error(`--${k} must be one of: ${allowed.join(", ")} (got ${JSON.stringify(opts[k])})`); process.exit(2);
    }
  }
  const palette = (positional || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!palette.length) { console.error("usage: node validate_palette.js \"#hex,#hex,...\" [--mode light|dark] [--surface #hex] [--pairs adjacent|all] [--ordinal]"); process.exit(2); }
  const mode = opts.mode || "light";
  const surface = opts.surface || DEFAULT_SURFACE[mode];
  const pairs = opts.pairs || "adjacent";
  const result = opts.ordinal ? validateOrdinal(palette, { mode, surface }) : validate(palette, { mode, surface, pairs });
  printReport(result, { mode, surface, ordinal: !!opts.ordinal, n: palette.length });
  process.exit(result.ok ? 0 : 1);
}

// Browser auto-run (as a <script type="module">). Fires whenever the page has a
// data-palette attribute on <body>; omit it to import the module without auto-running.
if (typeof document !== "undefined") {
  const b = document.body;
  if (b?.dataset.palette) {
    const palette = b.dataset.palette.split(",").map(s => s.trim()).filter(Boolean);
    const mode = b.dataset.mode || "light";
    const surface = b.dataset.surface || DEFAULT_SURFACE[mode];
    const ordinal = "ordinal" in b.dataset;
    const result = ordinal ? validateOrdinal(palette, { mode, surface }) : validate(palette, { mode, surface, pairs: b.dataset.pairs || "adjacent" });
    console.table(result.report.map(([name, state, detail]) => ({ check: name, result: GLYPH[state] ?? state, detail })));
    if (!result.ok) console.warn("validate_palette: FAILED — fix the marked checks");
  }
}
