// make-colors.js: copy this file into your mod's hooks folder, and leave it as it is.
// Generated from the design system's theme code. Don't edit it.
// sources-sha256: c44e83e0e09808d3442f475a8b2ff715181338f4973f7b860009f0fe4b4093a8
// body-sha256: 9d71ea3fbc24f3fef16ac58e386315002d2e4763c27138821dcd756d38510d65
var THEME_GRAPH = {
  border: "alpha-2",
  "alpha-2": "@neutral-900/10",
  "neutral-900": ["gray-900", "gray-0"],
  "border-accent": ["role-accent-250", "role-accent-700"],
  "border-danger": ["role-danger-250", "role-danger-700"],
  "border-success": ["role-success-250", "role-success-700"],
  "border-warning": ["role-warning-250", "role-warning-700"],
  "border-pro": ["role-pro-250", "role-pro-700"],
  "border-git-added": "color-mix(in srgb, {text-git-added} 40%, transparent)",
  "border-git-removed": "color-mix(in srgb, {text-git-removed} 40%, transparent)",
  "border-git-modified": "color-mix(in srgb, {text-git-modified} 40%, transparent)",
  "border-git-merged": "color-mix(in srgb, {text-git-merged} 40%, transparent)",
  "border-git-closed": "color-mix(in srgb, {text-git-closed} 40%, transparent)",
  "border-git-conflicting": "color-mix(in srgb, {text-git-conflicting} 40%, transparent)",
  "border-git-draft": "color-mix(in srgb, {text-git-draft} 40%, transparent)",
  "border-strong": "alpha-3",
  "alpha-3": "@neutral-900/20",
  "border-stronger": "@neutral-900/40",
  "shadow-sm": "0 1px 2px 0 {@gray-900/6}, 0 2px 8px 0 {shadow-color}",
  "shadow-color": ["@gray-900/8", "'rgba(0, 0, 0, 0.24)"],
  "shadow-md": "0 2px 4px 0 {@gray-900/7}, 0 6px 16px 0 {shadow-color}",
  "shadow-lg": "0 4px 8px 0 {@gray-900/8}, 0 12px 28px -2px {shadow-color}",
  "shadow-drop-ring": "inset 0 0 0 2px {fill-accent}",
  "fill-accent": "role-accent-fill",
  "shadow-drop-ring-danger": "inset 0 0 0 2px {fill-danger}",
  "fill-danger": "role-danger-fill",
  "shadow-drop-glow": "inset 0 0 24px -2px {@fill-accent/20}",
  "shadow-drop-glow-danger": "inset 0 0 24px -2px {@fill-danger/20}",
  "ring-color": ["border", "alpha-2"],
  "focus-shadow": ["inset 0 0 0 1px {page-bg}, 0 0 0 1px {fill-accent}, 0 0 6px 1px {bg-accent}", "inset 0 0 0 1px {page-bg}, 0 0 0 1px {fill-accent}, 0 0 6px 1px {@role-accent-600/60}"],
  "page-bg": "surface-0",
  "surface-0": ["gray-20", "gray-900"],
  "bg-accent": ["role-accent-100", "role-accent-800"],
  "focus-shadow-danger": ["inset 0 0 0 1px {page-bg}, 0 0 0 1px {fill-danger}, 0 0 6px 1px {bg-danger}", "inset 0 0 0 1px {page-bg}, 0 0 0 1px {fill-danger}, 0 0 6px 1px {@role-danger-600/60}"],
  "bg-danger": ["role-danger-100", "role-danger-800"],
  "pictogram-highlight-default": ["gray-80", "gray-650"],
  "neutral-0": ["gray-0", "gray-900"],
  "neutral-10": ["gray-10", "gray-890"],
  "neutral-20": ["gray-20", "gray-880"],
  "neutral-30": ["gray-30", "gray-870"],
  "neutral-40": ["gray-40", "gray-860"],
  "neutral-50": ["gray-50", "gray-850"],
  "neutral-60": ["gray-60", "gray-840"],
  "neutral-70": ["gray-70", "gray-830"],
  "neutral-80": ["gray-80", "gray-820"],
  "neutral-90": ["gray-90", "gray-810"],
  "neutral-100": ["gray-100", "gray-800"],
  "neutral-150": ["gray-150", "gray-750"],
  "neutral-200": ["gray-200", "gray-700"],
  "neutral-250": ["gray-250", "gray-650"],
  "neutral-300": ["gray-300", "gray-600"],
  "neutral-350": ["gray-350", "gray-550"],
  "neutral-400": ["gray-400", "gray-500"],
  "neutral-450": "gray-450",
  "neutral-500": ["gray-500", "gray-400"],
  "neutral-550": ["gray-550", "gray-350"],
  "neutral-600": ["gray-600", "gray-300"],
  "neutral-650": ["gray-650", "gray-250"],
  "neutral-700": ["gray-700", "gray-200"],
  "neutral-750": ["gray-750", "gray-150"],
  "neutral-800": ["gray-800", "gray-100"],
  "neutral-810": ["gray-810", "gray-90"],
  "neutral-820": ["gray-820", "gray-80"],
  "neutral-830": ["gray-830", "gray-70"],
  "neutral-840": ["gray-840", "gray-60"],
  "neutral-850": ["gray-850", "gray-50"],
  "neutral-860": ["gray-860", "gray-40"],
  "neutral-870": ["gray-870", "gray-30"],
  "neutral-880": ["gray-880", "gray-20"],
  "neutral-890": ["gray-890", "gray-10"],
  "alpha-0": "@neutral-900/0",
  "alpha-1": "@neutral-900/5",
  "alpha-4": "@neutral-900/35",
  "alpha-5": "@neutral-900/50",
  "alpha-6": "@neutral-900/60",
  "alpha-7": "@neutral-900/70",
  "alpha-8": "@neutral-900/85",
  "alpha-9": "@neutral-900/95",
  "surface-1": ["gray-10", "gray-850"],
  "surface-2": ["gray-0", "gray-830"],
  "surface-3": ["gray-0", "gray-800"],
  "surface-popover": "surface-3",
  "surface-panel": "surface-2",
  "fill-accent-hover": "role-accent-fill-hover",
  "fill-danger-hover": "role-danger-fill-hover",
  "fill-success": "role-success-fill",
  "fill-success-hover": "role-success-fill-hover",
  "fill-warning": "role-warning-fill",
  "fill-warning-hover": "role-warning-fill-hover",
  "fill-pro": "role-pro-fill",
  "fill-pro-hover": "role-pro-fill-hover",
  "fill-git-removed": "text-git-removed",
  "fill-primary": "neutral-900",
  "fill-primary-hover": ["neutral-750", "gray-100"],
  "fill-secondary": ["'hsl(0 0% 100% / 0.1)", "alpha-2"],
  "fill-secondary-hover": ["alpha-1", "@neutral-900/14"],
  "fill-secondary-ring": ["border", "'transparent"],
  "fill-secondary-pressed-ring": "border",
  "fill-field": ["'hsl(0 0% 100% / 0.5)", "alpha-1"],
  "fill-field-ring": "border",
  "fill-ghost-hover": ["alpha-1", "@neutral-900/7.5"],
  "fill-ghost-selected": ["alpha-2", "@neutral-900/15"],
  "fill-disabled": "alpha-1",
  "fill-control": "alpha-2",
  "fill-control-hover": "alpha-3",
  "bg-accent-muted": "color-mix(in srgb, {fill-accent} 10%, transparent)",
  "bg-success": ["role-success-100", "role-success-800"],
  "bg-warning": ["role-warning-100", "role-warning-800"],
  "bg-pro": ["role-pro-100", "role-pro-800"],
  "bg-git-added": "color-mix(in srgb, {text-git-added} 20%, transparent)",
  "bg-git-removed": "color-mix(in srgb, {text-git-removed} 20%, transparent)",
  "bg-git-modified": "color-mix(in srgb, {text-git-modified} 20%, transparent)",
  "bg-git-merged": "color-mix(in srgb, {text-git-merged} 20%, transparent)",
  "bg-git-closed": "color-mix(in srgb, {text-git-closed} 20%, transparent)",
  "bg-git-conflicting": "color-mix(in srgb, {text-git-conflicting} 20%, transparent)",
  "bg-git-draft": "color-mix(in srgb, {text-git-draft} 20%, transparent)",
  "bg-highlight": "color-mix(in srgb, {fill-warning} 33%, transparent)",
  "bg-editor-canvas": "neutral-60",
  "bg-editor-highlight-yellow": "bg-highlight",
  "bg-editor-highlight-gray": "color-mix(in srgb, {gray-300} 33%, transparent)",
  "bg-editor-collaborator-6": "color-mix(in srgb, {editor-collaborator-6} 22%, transparent)",
  "editor-collaborator-6": "gray-500",
  "bg-editor-comment": "color-mix(in srgb, {fill-warning} 20%, transparent)",
  "bg-editor-comment-active": "color-mix(in srgb, {fill-warning} 45%, transparent)",
  "bg-neutral": "alpha-1",
  "bg-neutral-hover": "alpha-2",
  "bg-user-message": "bg-neutral",
  "text-accent": ["role-accent-600", "role-accent-300"],
  "text-danger": ["role-danger-600", "role-danger-300"],
  "text-success": ["role-success-600", "role-success-400"],
  "text-warning": ["role-warning-600", "role-warning-300"],
  "text-pro": ["role-pro-600", "role-pro-300"],
  "text-primary": ["neutral-900", "gray-50"],
  "text-secondary": ["neutral-600", "gray-200"],
  "text-muted": ["neutral-400", "gray-400"],
  "text-disabled": "alpha-4",
  "on-primary": "neutral-0",
  "on-accent": "role-accent-on",
  "on-danger": "role-danger-on",
  "on-success": "role-success-on",
  "on-warning": "role-warning-on",
  "on-pro": "role-pro-on",
  "chart-diverging-4": ["gray-50", "gray-700"],
  "chart-muted": ["gray-200", "gray-550"],
  "chart-reference": ["gray-400", "gray-350"],
  "chart-reference-tint": ["@gray-400/15", "@gray-350/15"],
  "chart-grid": "alpha-2",
  "chart-axis": ["gray-200", "gray-700"],
  "chart-baseline": ["gray-200", "gray-700"]
};

var THEME_PAIRS = [
  ["border", "surface-0", "UI"],
  ["border", "surface-1", "UI"],
  ["border", "surface-2", "UI"],
  ["border", "surface-3", "UI"],
  ["border-accent", "bg-accent", "UI"],
  ["border-danger", "bg-danger", "UI"],
  ["border-success", "bg-success", "UI"],
  ["border-warning", "bg-warning", "UI"],
  ["border-pro", "bg-pro", "UI"],
  ["border-strong", "surface-0", "UI"],
  ["border-strong", "surface-1", "UI"],
  ["border-strong", "surface-2", "UI"],
  ["border-strong", "surface-3", "UI"],
  ["border-stronger", "surface-0", "UI"],
  ["border-stronger", "surface-1", "UI"],
  ["border-stronger", "surface-2", "UI"],
  ["border-stronger", "surface-3", "UI"],
  ["ring-color", "surface-0", "UI"],
  ["ring-color", "surface-1", "UI"],
  ["ring-color", "surface-2", "UI"],
  ["ring-color", "surface-3", "UI"],
  ["fill-accent", "surface-0", "UI"],
  ["fill-accent", "surface-1", "UI"],
  ["fill-accent", "surface-2", "UI"],
  ["fill-accent", "surface-3", "UI"],
  ["fill-danger", "surface-0", "UI"],
  ["fill-danger", "surface-1", "UI"],
  ["fill-danger", "surface-2", "UI"],
  ["fill-danger", "surface-3", "UI"],
  ["fill-success", "surface-0", "UI"],
  ["fill-success", "surface-1", "UI"],
  ["fill-success", "surface-2", "UI"],
  ["fill-success", "surface-3", "UI"],
  ["fill-warning", "surface-0", "UI"],
  ["fill-warning", "surface-1", "UI"],
  ["fill-warning", "surface-2", "UI"],
  ["fill-warning", "surface-3", "UI"],
  ["fill-pro", "surface-0", "UI"],
  ["fill-pro", "surface-1", "UI"],
  ["fill-pro", "surface-2", "UI"],
  ["fill-pro", "surface-3", "UI"],
  ["fill-primary", "surface-0", "UI"],
  ["fill-primary", "surface-1", "UI"],
  ["fill-primary", "surface-2", "UI"],
  ["fill-primary", "surface-3", "UI"],
  ["fill-secondary-ring", "surface-0", "UI"],
  ["fill-secondary-ring", "surface-1", "UI"],
  ["fill-secondary-ring", "surface-2", "UI"],
  ["fill-secondary-ring", "surface-3", "UI"],
  ["fill-secondary-pressed-ring", "surface-0", "UI"],
  ["fill-secondary-pressed-ring", "surface-1", "UI"],
  ["fill-secondary-pressed-ring", "surface-2", "UI"],
  ["fill-secondary-pressed-ring", "surface-3", "UI"],
  ["fill-field-ring", "surface-0", "UI"],
  ["fill-field-ring", "surface-1", "UI"],
  ["fill-field-ring", "surface-2", "UI"],
  ["fill-field-ring", "surface-3", "UI"],
  ["text-accent", "surface-0", "AA"],
  ["text-accent", "surface-1", "AA"],
  ["text-accent", "surface-2", "AA"],
  ["text-accent", "surface-3", "AA"],
  ["text-accent", "bg-accent", "AA"],
  ["text-accent", "bg-tint-blue=rgba(118, 178, 251, 0.35)|rgba(0, 36, 81, 0.75)", "AA"],
  ["text-accent", "tooltip-bg", "AA", 0, 1],
  ["text-danger", "surface-0", "AA"],
  ["text-danger", "surface-1", "AA"],
  ["text-danger", "surface-2", "AA"],
  ["text-danger", "surface-3", "AA"],
  ["text-danger", "bg-danger", "AA"],
  ["text-danger", "bg-tint-red=rgba(246, 143, 145, 0.35)|rgba(73, 12, 12, 0.75)", "AA"],
  ["text-danger", "bg-user-message-personal=rgba(118, 178, 251, 0.35)|rgba(0, 36, 81, 0.75)", "AA"],
  ["text-success", "surface-0", "AA"],
  ["text-success", "surface-1", "AA"],
  ["text-success", "surface-2", "AA"],
  ["text-success", "surface-3", "AA"],
  ["text-success", "bg-success", "AA"],
  ["text-warning", "surface-0", "AA"],
  ["text-warning", "surface-1", "AA"],
  ["text-warning", "surface-2", "AA"],
  ["text-warning", "surface-3", "AA"],
  ["text-warning", "bg-warning", "AA"],
  ["text-warning", "bg-tint-yellow=rgba(243, 161, 2, 0.35)|rgba(58, 28, 0, 0.75)", "AA"],
  ["text-pro", "surface-0", "AA"],
  ["text-pro", "surface-1", "AA"],
  ["text-pro", "surface-2", "AA"],
  ["text-pro", "surface-3", "AA"],
  ["text-pro", "bg-pro", "AA"],
  ["text-pro", "bg-tint-violet=rgba(169, 158, 255, 0.35)|rgba(32, 22, 90, 0.75)", "AA"],
  ["text-tint-red=#8e2626|#ec7e7e", "bg-tint-red=rgba(246, 143, 145, 0.35)|rgba(73, 12, 12, 0.75)", "AA"],
  ["text-tint-orange=#863311|#ec835a", "bg-tint-orange=rgba(238, 149, 114, 0.35)|rgba(66, 20, 2, 0.75)", "AA"],
  ["text-tint-yellow=#734500|#db9300", "bg-tint-yellow=rgba(243, 161, 2, 0.35)|rgba(58, 28, 0, 0.75)", "AA"],
  ["text-tint-green=#006300|#55bf50", "bg-tint-green=rgba(109, 201, 102, 0.35)|rgba(16, 44, 13, 0.75)", "AA"],
  ["text-tint-aqua=#065f49|#3bbd8c", "bg-tint-aqua=rgba(78, 203, 160, 0.35)|rgba(0, 45, 36, 0.75)", "AA"],
  ["text-tint-blue=#184f95|#6da7ec", "bg-tint-blue=rgba(118, 178, 251, 0.35)|rgba(0, 36, 81, 0.75)", "AA"],
  ["text-tint-violet=#4a3aa7|#a096eb", "bg-tint-violet=rgba(169, 158, 255, 0.35)|rgba(32, 22, 90, 0.75)", "AA"],
  ["text-tint-magenta=#862a4c|#e87ba4", "bg-tint-magenta=rgba(243, 138, 180, 0.35)|rgba(69, 13, 34, 0.75)", "AA"],
  ["text-user-message-personal=#184f95|#6da7ec", "bg-user-message-personal=rgba(118, 178, 251, 0.35)|rgba(0, 36, 81, 0.75)", "AA"],
  ["text-git-added", "surface-1", "AA"],
  ["text-git-added", "bg-git-added", "AA"],
  ["text-git-removed", "surface-1", "AA"],
  ["text-git-removed", "bg-git-removed", "AA"],
  ["text-git-modified", "surface-1", "AA"],
  ["text-git-modified", "bg-git-modified", "AA"],
  ["text-git-merged", "surface-1", "AA"],
  ["text-git-merged", "bg-git-merged", "AA"],
  ["text-git-closed", "surface-1", "AA"],
  ["text-git-closed", "bg-git-closed", "AA"],
  ["text-git-conflicting", "surface-1", "AA"],
  ["text-git-conflicting", "bg-git-conflicting", "AA"],
  ["text-git-draft", "surface-1", "AA"],
  ["text-git-draft", "bg-git-draft", "AA"],
  ["text-primary", "surface-0", "AA"],
  ["text-primary", "surface-1", "AA"],
  ["text-primary", "surface-2", "AA"],
  ["text-primary", "surface-3", "AA"],
  ["text-primary", "fill-secondary", "AA"],
  ["text-primary", "fill-secondary-hover", "AA"],
  ["text-primary", "fill-ghost-hover", "AA"],
  ["text-primary", "fill-ghost-selected", "AA"],
  ["text-primary", "fill-control", "AA"],
  ["text-primary", "fill-field", "AA"],
  ["text-primary", "bg-neutral", "AA"],
  ["text-primary", "bg-neutral-hover", "AA"],
  ["text-primary", "bg-user-message", "AA"],
  ["text-primary", "bg-user-message-personal=rgba(118, 178, 251, 0.35)|rgba(0, 36, 81, 0.75)", "AA"],
  ["text-primary", "bg-highlight", "AA"],
  ["text-primary", "bg-editor-comment", "AA"],
  ["text-primary", "bg-editor-comment-active", "AA"],
  ["text-primary", "bg-accent-muted", "AA"],
  ["text-primary", "bg-editor-claude-pending=color-mix(in srgb, #d97757 22%, transparent)", "AA"],
  ["text-primary", "bg-editor-highlight-yellow", "AA"],
  ["text-primary", "bg-editor-highlight-green=color-mix(in srgb, #55bf50 33%, transparent)", "AA"],
  ["text-primary", "bg-editor-highlight-blue=color-mix(in srgb, #6da7ec 33%, transparent)", "AA"],
  ["text-primary", "bg-editor-highlight-magenta=color-mix(in srgb, #e87ba4 33%, transparent)", "AA"],
  ["text-primary", "bg-editor-highlight-violet=color-mix(in srgb, #a096eb 33%, transparent)", "AA"],
  ["text-primary", "bg-editor-highlight-gray", "AA"],
  ["text-primary", "segmented-control-track", "AA"],
  ["text-primary", "segmented-control-thumb", "AA"],
  ["text-primary", "radio-group-card-selected", "AA"],
  ["text-primary", "tooltip-bg", "AA", 0, 1],
  ["text-secondary", "surface-0", "AA"],
  ["text-secondary", "surface-1", "AA"],
  ["text-secondary", "surface-2", "AA"],
  ["text-secondary", "surface-3", "AA"],
  ["text-secondary", "fill-secondary", "AA"],
  ["text-secondary", "fill-ghost-hover", "AA"],
  ["text-secondary", "fill-control", "AA"],
  ["text-secondary", "bg-neutral", "AA"],
  ["text-secondary", "bg-danger", "AA"],
  ["text-secondary", "bg-warning", "AA"],
  ["text-secondary", "segmented-control-track", "AA"],
  ["text-secondary", "radio-group-card-selected", "AA"],
  ["text-secondary", "tooltip-bg", "AA", 0, 1],
  ["text-muted", "surface-0", "AA"],
  ["text-muted", "surface-1", "AA"],
  ["text-muted", "surface-2", "AA"],
  ["text-muted", "surface-3", "AA"],
  ["text-muted", "fill-field", "AA"],
  ["text-muted", "fill-ghost-hover", "AA"],
  ["text-muted", "fill-secondary", "AA"],
  ["text-muted", "bg-neutral", "AA"],
  ["text-muted", "segmented-control-track", "AA"],
  ["text-muted", "tooltip-bg", "AA", 0, 1],
  ["on-primary", "fill-primary", "AA"],
  ["on-primary", "fill-primary-hover", "AA"],
  ["on-accent", "fill-accent", "AA"],
  ["on-accent", "fill-accent-hover", "AA"],
  ["on-danger", "fill-danger", "AA"],
  ["on-danger", "fill-danger-hover", "AA"],
  ["on-success", "fill-success", "AA"],
  ["on-success", "fill-success-hover", "AA"],
  ["on-warning", "fill-warning", "AA"],
  ["on-warning", "fill-warning-hover", "AA"],
  ["on-pro", "fill-pro", "AA"],
  ["on-pro", "fill-pro-hover", "AA"],
  ["shortcut-cap-ink", "surface-0", "AA"],
  ["shortcut-cap-ink", "surface-1", "AA"],
  ["shortcut-cap-ink", "surface-2", "AA"],
  ["shortcut-cap-ink", "surface-3", "AA"],
  ["shortcut-cap-ink", "fill-secondary", "AA"],
  ["shortcut-cap-ink", "fill-ghost-hover", "AA"],
  ["slider-track", "surface-0", "UI"],
  ["slider-track", "surface-1", "UI"],
  ["slider-track", "surface-2", "UI"],
  ["slider-track", "surface-3", "UI"],
  ["slider-handle", "slider-fill", "UI"],
  ["switch-knob", "fill-accent", "UI"],
  ["switch-knob", "fill-accent-hover", "UI"],
  ["switch-knob", "switch-track", "UI"],
  ["switch-knob", "switch-track-hover", "UI"],
  ["switch-track", "surface-0", "UI"],
  ["switch-track", "surface-1", "UI"],
  ["switch-track", "surface-2", "UI"],
  ["switch-track", "surface-3", "UI"],
  ["switch-track-hover", "surface-0", "UI"],
  ["switch-track-hover", "surface-1", "UI"],
  ["switch-track-hover", "surface-2", "UI"],
  ["switch-track-hover", "surface-3", "UI"],
  ["tooltip-fg", "tooltip-bg", "AA"]
], THEME_PAIR_FORMS = {
  "tooltip-bg": ["role-tooltip-bg", "surface-3"],
  "segmented-control-track": "alpha-1",
  "segmented-control-thumb": ["surface-popover", "alpha-2"],
  "radio-group-card-selected": ["role-accent-50", "role-accent-850"],
  "shortcut-cap-ink": ["gray-500", "gray-300"],
  "slider-track": "alpha-2",
  "slider-handle": "gray-0",
  "slider-fill": ["alpha-3", "alpha-4"],
  "switch-knob": "gray-0",
  "switch-track": ["alpha-3", "alpha-2"],
  "switch-track-hover": ["alpha-4", "alpha-3"],
  "tooltip-fg": ["role-tooltip-fg", "text-primary"]
};

var toLinear = (c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4, toGamma = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * c ** 0.4166666666666667 - 0.055;
function hexToRgb(hex) {
  let n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
function rgbToHex(rgb) {
  return "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("");
}
function hexToLab(hex) {
  let [r, g, b] = hexToRgb(hex), [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)], l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B), m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B), s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
}
function labToLinear([L, a, b]) {
  let l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ];
}
function hexToLch(hex) {
  let [L, a, b] = hexToLab(hex);
  return [L, Math.hypot(a, b), Math.atan2(b, a)];
}
var inGamut = (rgb) => rgb.every((c) => c >= -0.0001 && c <= 1.0001);
function lchToHex(lightness, chroma, hue) {
  let L = Math.min(1, Math.max(0, lightness)), at = (c) => labToLinear([L, c * Math.cos(hue), c * Math.sin(hue)]), c = chroma;
  if (!inGamut(at(c))) {
    let lo = 0, hi = c;
    for (let i = 0;i < 24; i++) {
      let mid = (lo + hi) / 2;
      if (inGamut(at(mid)))
        lo = mid;
      else
        hi = mid;
    }
    c = lo;
  }
  let [r, g, b] = at(c);
  return rgbToHex([toGamma(r), toGamma(g), toGamma(b)]);
}
function labToHex([L, a, b]) {
  return lchToHex(L, Math.hypot(a, b), Math.atan2(b, a));
}
function mixLab(x, y, t) {
  return [
    x[0] + (y[0] - x[0]) * t,
    x[1] + (y[1] - x[1]) * t,
    x[2] + (y[2] - x[2]) * t
  ];
}
function relativeLuminance(r, g, b) {
  let channel = (s) => s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function contrastRatio(a, b) {
  let la = relativeLuminance(...hexToRgb(a)), lb = relativeLuminance(...hexToRgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

var TARGET_RATIO = {
  AA: 4.5,
  UI: 3,
  AAA: 7
}, PLANES = [
  "surface-0",
  "surface-1",
  "surface-2",
  "surface-3"
], alphaOf = (s) => s === void 0 ? 1 : s.endsWith("%") ? parseFloat(s) / 100 : Number(s);
function readColor(literal) {
  let v = literal.trim(), m;
  if (m = v.match(/^#([0-9a-f]{6})$/i)) {
    let n = parseInt(m[1] ?? "", 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255, 1];
  }
  if (v === "transparent")
    return [0, 0, 0, 0];
  if (m = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/))
    return [Number(m[1]), Number(m[2]), Number(m[3]), alphaOf(m[4])];
  if (m = v.match(/^hsl\(\s*0\s+0%\s+([\d.]+)%\s*\/\s*([\d.]+%?)\s*\)$/)) {
    let c = Math.round(Number(m[1]) * 2.55);
    return [c, c, c, alphaOf(m[2])];
  }
  if (m = v.match(/^color-mix\(in srgb,\s*(#[0-9a-f]{6})\s+([\d.]+)%,\s*transparent\)$/i)) {
    let c = readColor(m[1] ?? "");
    return c && [c[0], c[1], c[2], Number(m[2]) / 100];
  }
  return;
}
var over = (top, under) => [
  top[0] * top[3] + under[0] * (1 - top[3]),
  top[1] * top[3] + under[1] * (1 - top[3]),
  top[2] * top[3] + under[2] * (1 - top[3]),
  1
];
function contrastRatio2(a, b) {
  let la = relativeLuminance(a[0] / 255, a[1] / 255, a[2] / 255), lb = relativeLuminance(b[0] / 255, b[1] / 255, b[2] / 255);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
var hex = (c) => "#" + [c[0], c[1], c[2]].map((x) => Math.round(x).toString(16).padStart(2, "0")).join(""), planesOf = (pairing, againstIsOpaque) => pairing.over !== void 0 ? [pairing.over] : againstIsOpaque ? [pairing.against] : PLANES;
function evaluatePairing(colorOf, pairing, mode) {
  let { token, against } = pairing, ink = colorOf(token, pairing.darkScope ? "dark" : mode), ground = colorOf(against, mode), results = planesOf(pairing, ground[3] === 1).map((plane) => {
    let under = colorOf(plane, mode);
    if (under[3] !== 1)
      throw Error(plane === pairing.over ? `${token}, pair against "${against}": "${plane}" is see-through in ${mode} mode, so the check does not know what is under it. Name an opaque token in \`over\`.` : `${plane} is see-through in ${mode} mode, so a see-through color laid over it (${token} on ${against}) cannot be checked. Make ${plane} opaque, or name an opaque token in the pair's \`over\`.`);
    let background = over(ground, under), foreground = over(ink, background);
    return {
      ratio: contrastRatio2(foreground, background),
      over: plane,
      painted: { token: hex(foreground), against: hex(background) }
    };
  });
  if (results.some((r) => !Number.isFinite(r.ratio)))
    throw Error(`${token} on ${against} (${mode} mode): the ratio is not a number. One of the colors involved, or the plane under them, has a number the contrast check could not read; check how each is written.`);
  return results.reduce((low, r) => r.ratio < low.ratio ? r : low);
}

var oneDecimalDown = (x) => Math.floor(x * 10) / 10;
function checkThemeWith(rows, themed, unthemed) {
  let nameOf = (written) => written.split("=")[0] ?? written, reader = (literals) => (written, mode) => {
    let [name = written, fixed] = written.split("="), [light = "", dark] = (fixed ?? "").split("|"), value = fixed === void 0 ? literals(name, mode) : mode === "dark" ? dark ?? light : light, color = value === void 0 ? void 0 : readColor(value);
    if (color === void 0)
      throw Error(value === void 0 ? `The contrast table names "${name}", which is neither a token a theme moves nor a fixed color. This is a bug in make-colors.js.` : `${name} resolves to ${JSON.stringify(value)} in ${mode} mode, which the contrast check cannot read as a color.`);
    return color;
  }, issues = [];
  for (let [token, against, target, over, darkScope] of rows) {
    let pairing = {
      token,
      against,
      target,
      ...typeof over === "string" ? { over } : {},
      ...darkScope === 1 ? { darkScope: !0 } : {}
    };
    for (let mode of ["light", "dark"]) {
      let stock = evaluatePairing(reader(unthemed), pairing, mode).ratio, got = evaluatePairing(reader(themed), pairing, mode), floor = Math.min(TARGET_RATIO[target], oneDecimalDown(stock));
      if (Math.round(got.ratio * 100) / 100 >= floor)
        continue;
      let ground = got.over === against ? nameOf(against) : `${nameOf(against)} over ${nameOf(got.over)}`;
      issues.push({
        level: target === "AAA" ? "warning" : "error",
        mode,
        token: nameOf(token),
        against: nameOf(against),
        darkScope: darkScope === 1,
        target: TARGET_RATIO[target],
        over: nameOf(got.over),
        ratio: got.ratio,
        floor,
        stock,
        message: `${nameOf(token)} on ${ground} is ${got.ratio.toFixed(2)}:1 in ${mode} mode; it needs ${floor}:1` + (floor < TARGET_RATIO[target] ? ` (the design system's own pair is ${stock.toFixed(2)}:1, itself under ${TARGET_RATIO[target]}:1).` : ` (the design system's own pair: ${stock.toFixed(2)}:1).`) + (darkScope === 1 ? " The tooltip uses the dark half's colors in both modes, so change them there." : "")
      });
    }
  }
  return issues;
}

var RGB = [0, 1, 2];
function channelsOf(fn, name, hex) {
  let digits = /^#([0-9a-fA-F]{6})$/.exec(hex)?.[1];
  if (digits === void 0)
    throw Error(`${fn}: ref "${name}" resolved to ${JSON.stringify(hex)} — ` + "expected a 6-digit hex. Chain through a palette stop.");
  let n = parseInt(digits, 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function evalExpr(expr, literalOf, nameOf) {
  switch (expr.op) {
    case "ref":
      return literalOf(expr.ref);
    case "alpha":
      return `rgba(${channelsOf("atAlpha", nameOf(expr.ref), literalOf(expr.ref)).join(", ")}, ${expr.pct / 100})`;
    case "unmix": {
      let a = expr.pct / 100, c = channelsOf("unmix", nameOf(expr.ref), literalOf(expr.ref));
      return `rgba(${RGB.map((i) => Math.round(Math.min(255, Math.max(0, (c[i] - expr.k[i]) / a)))).join(", ")}, ${a})`;
    }
    case "css": {
      let out = expr.strings[0] ?? "";
      for (let [i, part] of expr.parts.entries())
        out += evalExpr(part, literalOf, nameOf) + (expr.strings[i + 1] ?? "");
      return out;
    }
  }
}

var NAME = /^[a-z][a-z0-9-]*$/;
function parseForm(text) {
  let part = (s) => {
    let [ref = "", a = "", b = ""] = s.slice(1).split("/");
    if (s.startsWith("@"))
      return { op: "alpha", ref, pct: Number(a) };
    if (s.startsWith("~")) {
      let [r = 0, g = 0, bl = 0] = a.split(",").map(Number);
      return { op: "unmix", ref, k: [r, g, bl], pct: Number(b) };
    }
    return { op: "ref", ref: s };
  };
  if (text.startsWith("'"))
    return { op: "css", strings: [text.slice(1)], parts: [] };
  if (NAME.test(text) || /^[@~]/.test(text))
    return part(text);
  let pieces = text.split(/\{([^}]*)\}/);
  return {
    op: "css",
    strings: pieces.filter((_, i) => i % 2 === 0),
    parts: pieces.filter((_, i) => i % 2 === 1).map(part)
  };
}
function evaluator(graph, inputs, dark) {
  let known = /* @__PURE__ */ new Map, literalOf = (name) => {
    let seen = known.get(name);
    if (seen !== void 0)
      return seen;
    let entry = Object.hasOwn(graph, name) ? graph[name] : void 0, form = typeof entry === "string" ? entry : entry?.[dark ? 1 : 0], value = form === void 0 ? Object.hasOwn(inputs, name) ? inputs[name] : void 0 : evalExpr(parseForm(form), literalOf, (r) => r);
    if (value === void 0)
      throw Error(`The theme graph reads ${name}, which is neither a theme input nor in the graph. This is a bug in make-colors.js.`);
    return known.set(name, value), value;
  };
  return (name) => Object.hasOwn(graph, name) || Object.hasOwn(inputs, name) ? literalOf(name) : void 0;
}

var THEME_INPUT_GROUPS = [
  ["gray-", "0 10 20 30 40 50 60 70 80 90 100 150 200 250 300 350 400 450 500 550 600 650 700 750 800 810 820 830 840 850 860 870 880 890 900"],
  ["role-accent-", "50 100 250 300 400 450 600 700 800 850 fill fill-hover on", 1],
  ["role-danger-", "100 250 300 400 450 600 700 800 fill fill-hover on", 1],
  ["role-success-", "100 250 400 450 600 700 800 fill fill-hover on", 1],
  ["role-warning-", "100 200 250 300 600 700 800 fill fill-hover on", 1],
  ["role-pro-", "100 250 300 400 450 600 700 800 fill fill-hover on", 1],
  ["role-tooltip-", "bg fg", 1],
  ["fill-git-", "added modified"],
  ["text-git-", "added removed modified merged closed conflicting draft"]
], STOCK_THEME_INPUTS = {
  light: "fffffffcfcfbf9f9f7f6f6f4f3f3f0f0efecedece8eae9e4e7e6e1e4e3dde1e0d9d2d1c7c3c2b7b4b3a8a5a49a97958d8987817b79746d6b675f5e5a52514e4544423838352c2c2a20201f1e1e1d1c1c1b1a1a191818171515151313131111110f0f0f0d0d0d0b0b0be7f1fbcde2fb86b6ef6da7ec3987e52a78d6184f950d366b03204203162c2a78d63987e5fffffffad6d6f09595ec7e7ee34948d03b3b8e26266419193c0e0ed03b3be34948ffffffcaeac773cb6d0ca30c00930000630007450611260f0093000ca30c0b0b0bf9dca4fab219eda100db9300734500512e00311a00fab219eda1000b0b0bdfdbfdb0a7f2a096eb8173e37161e04a3aa73227771d16497161e08173e3ffffff0b0b0bffffff1a86338b751c1e9e3ccd205498801f8e6bd9ff3a30c5621b737373",
  darkFrom: 92,
  dark: "32d74bffd01432d74bff2c56ffd014b796ffff6159fa832ea6a6a6"
};

var INPUT_ALIASES = {}, RETIRED_INPUTS = [
  "fill-git-modified-hover",
  "fill-git-merged-hover",
  "fill-git-closed-hover",
  "fill-git-conflicting",
  "fill-git-conflicting-hover",
  "fill-git-draft-hover",
  "fill-git-added-hover",
  "fill-git-removed-hover",
  "fill-git-merged",
  "fill-git-closed"
];
function savedUnder(given, name, aliases = INPUT_ALIASES) {
  if (Object.hasOwn(given, name))
    return given[name];
  for (let [old, now] of Object.entries(aliases))
    if (now === name && Object.hasOwn(given, old))
      return given[old];
  return;
}

function inputNamesOf(data, publicOnly = !1) {
  return data.groups.flatMap(([prefix, suffixes, internal]) => publicOnly && internal === 1 ? [] : suffixes.split(" ").map((s) => prefix + s));
}
function stockInputsOf(data, mode) {
  let { light, darkFrom, dark } = data.stock, packed = mode === "light" ? light : light.slice(0, darkFrom * 6) + dark;
  return Object.fromEntries(inputNamesOf(data).map((name, i) => [
    name,
    "#" + packed.slice(i * 6, i * 6 + 6)
  ]));
}

var THEME_ID = /^[a-z][a-z0-9-]{0,31}$/, HEX_COLOR = /^#[0-9a-f]{6}$/i, CODE_THEME_NAME = /^[a-z0-9][a-z0-9._-]{0,63}$/i, isThemeId = (v) => typeof v === "string" && THEME_ID.test(v), isHexColor = (v) => typeof v === "string" && HEX_COLOR.test(v), isCodeThemeName = (v) => typeof v === "string" && CODE_THEME_NAME.test(v);
function shown(v) {
  let text = "an object";
  try {
    text = typeof v === "string" || typeof v === "object" && v !== null ? JSON.stringify(v) ?? String(v) : String(v);
  } catch {}
  return text.length > 40 ? text.slice(0, 37) + "..." : text;
}
function assertThemeId(id) {
  if (!isThemeId(id))
    throw Error(`A theme id starts with a lowercase letter and uses only lowercase letters, digits and hyphens, 32 characters at most; got ${shown(id)}.`);
}
function assertHexColor(v, what) {
  if (!isHexColor(v))
    throw Error(`${what} is ${shown(v)}. Theme colors are six-digit hex, like #1e1e2e.`);
}

var DATA = {
  groups: THEME_INPUT_GROUPS,
  stock: STOCK_THEME_INPUTS
};
function themeInputValues(theme, mode) {
  let inputs = stockInputsOf(DATA, mode), given = theme?.inputs?.[mode] ?? {};
  for (let name of Object.keys(inputs)) {
    let value = savedUnder(given, name);
    if (value !== void 0) {
      if (!isHexColor(value))
        assertHexColor(value, `${name} (${mode}) in the theme ${shown(theme?.id)}`);
      inputs[name] = value;
    }
  }
  return inputs;
}

function literalsFor(theme) {
  let graph = { ...THEME_GRAPH, ...THEME_PAIR_FORMS }, light = evaluator(graph, themeInputValues(theme, "light"), !1), dark = evaluator(graph, themeInputValues(theme, "dark"), !0);
  return (name, mode) => (mode === "dark" ? dark : light)(name);
}
function checkTheme(theme) {
  let inputs = Object(theme).inputs, isObject = (v) => typeof v === "object" && v !== null;
  if (!isObject(theme) || !isObject(inputs) || !isObject(Object(inputs).light) || !isObject(Object(inputs).dark))
    throw Error(`checkTheme takes the object defineTheme or parseTheme returns, with its light and dark inputs; got ${shown(theme)}.`);
  return checkThemeWith(THEME_PAIRS, literalsFor(theme), literalsFor(null));
}

var RAMP_STOPS = "0 10 20 30 40 50 60 70 80 90 100 150 200 250 300 350 400 450 500 550 600 650 700 750 800 810 820 830 840 850 860 870 880 890 900", ROLE_DEFAULTS = {
  accent: { ramp: "fffffffafcfff5f9fef0f7feebf4fce7f1fbe2eefaddebfad7e8fad2e5facde2fbb7d3f69ec5f486b6ef6da7ec5598e73987e52a78d6256abf1c5cab184f951042810d366b062b57032042031e3d021c39021a3602183103162c05142607121f0910180a0d110b0b0b", shade: 450, ink: 0, floor: 4.4 },
  danger: { ramp: "fffffffffbfbfef7f7fef3f3fdefeffbebebfae7e7fae3e3fadfdffadadafad6d6f7c1c1f4ababf09595ec7e7ee66767e34948d03b3bb93535a32c2c8e2626791e1e6419195112123c0e0e380d0d340c0c310b0b2d0a0a280a0a230b0a1d0b0a170c0b110c0b0b0b0b", shade: 450, ink: 0, floor: 4.5 },
  success: { ramp: "fffffffafdfaf5fbf4f0f9efebf7e9e5f4e4e0f2dedbf0d8d5eed3d0eccdcaeac7aee0a991d68b73cb6d55bf5035b2310ca30c0093000083000073000063000054000745060f350d11260f10230f10210f101e0f101b0f0f180e0e160e0e130d0d100d0c0e0c0b0b0b", shade: 450, ink: 900, floor: 4.5 },
  warning: { ramp: "fffffffefcf8fcf8f1fbf5eaf9f2e4f9eedafaebcefae7c2fae3b8f9e0b0f9dca4f9c868fab219eda100db9300c98500b77700a66a00945d00835100734500623900512e00412400311a002e18002b17002715002314021f12041b1106171007130e090f0d0a0b0b0b", shade: 200, ink: 900, floor: 4.5 },
  pro: { ramp: "fffffffcfbfff8f8fff5f4fff2f1ffefedffebeafee8e6fee5e2fde2dffddfdbfdcfcafbbfb9f5b0a7f2a096eb9085e98173e37161e06250d65645be4a3aa73e318e322777271e601d16491b154419133f17123b151036130f32110e2b0f0e230e0d1b0c0c130b0b0b", shade: 450, ink: 0, floor: 4.5 }
}, ANCHOR_STOPS = {
  light: { "surface-0": 20, "surface-1": 10, "surface-2": 0, "surface-3": 0, "text-primary": 900, "text-secondary": 600, "text-muted": 400 },
  dark: { "surface-0": 900, "surface-1": 850, "surface-2": 830, "surface-3": 800, "text-primary": 50, "text-secondary": 200, "text-muted": 400 }
}, DARK_GRAY_INPUTS = [
  ["role-tooltip-bg", 900],
  ["role-tooltip-fg", 0]
], GIT_FILLS = [
  ["fill-git-added", "text-git-added", [-0.0688, 0.8774, 0.0017], 0],
  ["fill-git-modified", "text-git-modified", [-0.0379, 0.935, 0.0009], 0]
];

var isFields = (v) => typeof v === "object" && v !== null && !Array.isArray(v), fieldsOf = (v) => isFields(v) ? v : {};
function part(v, where) {
  return v === void 0 || isFields(v) ? fieldsOf(v) : fail(`${where} is ${shown(v)}; it has to be an object.`);
}
var LIGHTNESS_SLACK = 0.0001, NEUTRAL_CHROMA = 0.004, MATCH_CHROMA = 0.03, MAX_GAIN = 3;
function fail(message) {
  throw Error(message);
}
function onlyKeys(from, known, where) {
  for (let key of Object.keys(from))
    if (!known.includes(key))
      fail(`${where} has ${shown(key)}, which is not something it can set. It takes: ${known.join(", ")}.`);
}
function colorsAt(from, keys, where, why) {
  return Object.fromEntries(keys.map((k) => {
    let hex = from[k] ?? fail(`${where} has no ${k}. ${why}: ${keys.join(", ")}.`);
    return assertHexColor(hex, `${where}[${k}]`), [k, hex];
  }));
}
var pick = (ramp, stop) => ramp[stop] ?? fail(`defineTheme looked up stop ${stop} on a ramp that has none. This is a bug in make-colors.js.`);
function grayFromAnchors(stopOf, stops, stock, mode, anchors) {
  let where = `${mode}.gray.anchors`, placed = /* @__PURE__ */ new Map;
  for (let [anchor, hex] of Object.entries(anchors)) {
    if (hex === void 0)
      continue;
    let stop = Object.hasOwn(stopOf, anchor) ? stopOf[anchor] ?? 0 : fail(`${where} names ${shown(anchor)}. A gray ramp can be anchored on: ${Object.keys(stopOf).join(", ")}.`);
    assertHexColor(hex, `${where}[${shown(anchor)}]`);
    let other = placed.get(stop);
    if (other !== void 0 && other.hex.toLowerCase() !== hex.toLowerCase())
      fail(`In ${mode} mode the design system paints ${other.anchor} and ${anchor} with the same gray (gray-${stop}), so they need the same color; got ${other.hex} and ${hex}. Give them one color, or leave one out.`);
    placed.set(stop, { hex, anchor });
  }
  for (let required of ["surface-0", "text-primary"])
    if (anchors[required] === void 0)
      fail(`${where} needs "${required}": the ramp is laid out between the page and the text on it.`);
  let order = [...placed].sort(([a], [b]) => a - b);
  order.forEach(([stop, { hex, anchor }], i) => {
    let [prevStop, prev] = order[i - 1] ?? [];
    if (prev !== void 0 && hexToLab(hex)[0] > hexToLab(prev.hex)[0] + LIGHTNESS_SLACK)
      fail(`In ${mode} mode ${anchor} (gray-${stop}, ${hex}) is lighter than ${prev.anchor} (gray-${prevStop}, ${prev.hex}). The gray ramp runs from lightest at gray-0 to darkest at gray-900, so ${anchor} has to be the darker of the two, or the same.`);
  });
  let ladder = (s) => hexToLab(pick(stock, s))[0], knots = order.map(([s, { hex }]) => ({
    t: ladder(s),
    lab: hexToLab(hex)
  }));
  return Object.fromEntries(stops.map((s) => {
    let t = ladder(s), found = knots.findIndex((k, i) => t <= k.t && t >= (knots[i + 1]?.t ?? 1 / 0)), i = found >= 0 ? found : t > (knots[0]?.t ?? 0) ? 0 : knots.length - 2, a = knots[i], b = knots[i + 1];
    return [
      s,
      placed.get(s)?.hex ?? (a === void 0 || b === void 0 ? pick(stock, s) : labToHex(mixLab(a.lab, b.lab, (t - a.t) / (b.t - a.t))))
    ];
  }));
}
function roleSpec(v, where, grid) {
  if (typeof v !== "string" && v !== void 0 && !isFields(v))
    fail(`${where} is ${shown(v)}. Give a color like "#1e66f5", or an object with seed, stops or fillShade.`);
  let spec = typeof v === "string" ? { seed: v } : fieldsOf(v);
  if (onlyKeys(spec, ["seed", "stops", "fillShade"], where), spec.seed !== void 0)
    assertHexColor(spec.seed, `${where}.seed`);
  let byHand = part(spec.stops, `${where}.stops`);
  onlyKeys(byHand, grid.map(String), `${where}.stops`);
  for (let [stop, hex] of Object.entries(byHand))
    if (hex !== void 0)
      assertHexColor(hex, `${where}.stops[${stop}]`);
  let { fillShade } = spec;
  if (fillShade !== void 0 && (typeof fillShade !== "number" || !grid.includes(fillShade)))
    fail(`${where}.fillShade is ${shown(fillShade)}. It names the stop filled controls use: ${grid.join(", ")}.`);
  return Object.fromEntries(Object.entries({ ...spec, stops: byHand }).filter(([, value]) => value !== void 0));
}
function rampFromSeed(stops, stock, seed) {
  let lch = stops.map((s) => hexToLch(pick(stock, s))), [seedL, seedC, seedH] = hexToLch(seed), match = lch.filter((c) => c[1] >= MATCH_CHROMA).reduce((best, c) => Math.abs(c[0] - seedL) < Math.abs(best[0] - seedL) ? c : best, [9, MATCH_CHROMA, 0]), gain = Math.min(MAX_GAIN, seedC / match[1]);
  return Object.fromEntries(stops.map((s, i) => {
    let [l, c, h] = lch[i] ?? match;
    return [
      s,
      c < NEUTRAL_CHROMA ? pick(stock, s) : lchToHex(l, c * gain, seedH + h - match[2])
    ];
  }));
}
function inkOn(fill, gray, stockEnd, floor) {
  let [same, other] = stockEnd === 0 ? [0, 900] : [900, 0], pure = (end) => end === 0 ? "#ffffff" : "#000000", reaches = (ink, ratio) => contrastRatio(ink, fill) >= ratio;
  return [pick(gray, same), pure(same)].find((ink) => reaches(ink, floor)) ?? (reaches(pick(gray, other), 7) ? pick(gray, other) : pure(other));
}
function deriveWith(data, def) {
  if (!isFields(def))
    return fail(`defineTheme takes an object like { id, label, roles, light, dark }; got ${shown(def)}.`);
  onlyKeys(def, ["id", "label", "roles", "light", "dark", "codeTheme"], "The theme definition");
  let { id, label } = def;
  if (assertThemeId(id), typeof label !== "string" || label === "" || label.length > 64)
    fail(`The theme "${id}" needs a label of 1 to 64 characters: the name people see in a picker.`);
  if (!def.roles && !def.light && !def.dark)
    fail(`The theme "${id}" sets nothing. Give it "roles", a "light" half or a "dark" half.`);
  let stops = data.stops.split(" ").map(Number), names = inputNamesOf(data), roleNames = Object.keys(data.roles);
  onlyKeys(part(def.roles, "roles"), roleNames, "roles");
  let unpack = (packed) => Object.fromEntries(stops.map((s, i) => [s, "#" + packed.slice(i * 6, i * 6 + 6)])), gitKeys = names.flatMap((n) => n.startsWith("text-git-") ? [n.slice(9)] : []), build = (mode) => {
    let stock = stockInputsOf(data, mode), half = def[mode] === void 0 ? void 0 : part(def[mode], mode), out = {};
    if (half !== void 0)
      onlyKeys(half, ["gray", "roles", "git"], mode), onlyKeys(part(half.roles, `${mode}.roles`), roleNames, `${mode}.roles`);
    let stockGray = Object.fromEntries(stops.map((s) => [s, stock[`gray-${s}`] ?? ""])), g = part(half?.gray, `${mode}.gray`);
    if (onlyKeys(g, ["anchors", "stops"], `${mode}.gray`), half?.gray !== void 0 && !g.stops && !g.anchors)
      fail(`${mode}.gray needs "anchors" (a few colors named after what they paint, with "stops" for single stops set by hand) or "stops" alone (all ${stops.length} stops).`);
    let byHand = g.anchors ? part(g.stops, `${mode}.gray.stops`) : {};
    if (g.anchors) {
      onlyKeys(byHand, stops.map(String), `${mode}.gray.stops`);
      for (let [stop, hex] of Object.entries(byHand))
        if (hex !== void 0)
          assertHexColor(hex, `${mode}.gray.stops[${stop}]`);
    }
    let gray = {
      ...half?.gray === void 0 ? stockGray : g.anchors ? grayFromAnchors(data.anchorStops[mode], stops, stockGray, mode, part(g.anchors, `${mode}.gray.anchors`)) : colorsAt(part(g.stops, `${mode}.gray.stops`), stops, `${mode}.gray.stops`, "A full ramp sets every stop"),
      ...Object.fromEntries(Object.entries(byHand).flatMap(([stop, hex]) => typeof hex === "string" ? [[Number(stop), hex]] : []))
    };
    for (let s of stops)
      out[`gray-${s}`] = pick(gray, s);
    for (let [role, defaults] of Object.entries(data.roles)) {
      let own = fieldsOf(half?.roles)[role], base = roleSpec(fieldsOf(def.roles)[role], `roles.${role}`, stops), over = roleSpec(own, `${mode}.roles.${role}`, stops), spec = over.seed !== void 0 ? over : {
        ...base,
        ...over,
        stops: { ...fieldsOf(base.stops), ...fieldsOf(over.stops) }
      }, prefix = `role-${role}-`, reads = names.flatMap((n) => {
        let stop = n.startsWith(prefix) ? Number(n.slice(prefix.length)) : NaN;
        return Number.isNaN(stop) ? [] : [stop];
      }), ramp = {
        ...typeof spec.seed === "string" ? rampFromSeed(stops, unpack(defaults.ramp), spec.seed) : unpack(defaults.ramp)
      };
      for (let [stop, hex] of Object.entries(fieldsOf(spec.stops)))
        if (typeof hex === "string")
          ramp[Number(stop)] = hex;
      let shade = Number(spec.fillShade ?? defaults.shade), i = stops.indexOf(shade);
      for (let s of reads)
        out[prefix + s] = pick(ramp, s);
      let fill = pick(ramp, shade);
      out[prefix + "fill"] = fill;
      let beside = stops[shade >= 300 ? i - 1 : i + 1] ?? shade, handSet = fieldsOf(spec.stops), [, fillChroma, fillHue] = hexToLch(fill);
      out[prefix + "fill-hover"] = spec.seed === void 0 && Object.hasOwn(handSet, String(shade)) && !Object.hasOwn(handSet, String(beside)) ? lchToHex(hexToLch(pick(ramp, beside))[0], fillChroma, fillHue) : pick(ramp, beside);
      let floor = fill.toLowerCase() === stock[prefix + "fill"] ? defaults.floor : 4.5;
      out[prefix + "on"] = inkOn(fill, gray, defaults.ink, floor);
    }
    let git = part(half?.git, `${mode}.git`);
    for (let key of Object.keys(git))
      if (!gitKeys.includes(key))
        fail(`${mode}.git names ${shown(key)}. The git state colors are: ${gitKeys.join(", ")}.`);
    for (let key of gitKeys) {
      let hex = git[key];
      if (hex !== void 0)
        assertHexColor(hex, `${mode}.git.${key}`);
      out[`text-git-${key}`] = hex ?? stock[`text-git-${key}`] ?? "";
    }
    for (let [fill, ink, light, dark] of data.gitFills) {
      let shift = mode === "light" ? light : dark, inkHex = out[ink] ?? "", [l, c, h] = hexToLch(inkHex);
      out[fill] = inkHex.toLowerCase() === stock[ink] ? stock[fill] ?? inkHex : shift === 0 ? inkHex : lchToHex(l + shift[0], c * shift[1], h + shift[2]);
    }
    return { gray, out };
  }, light = build("light"), dark = build("dark");
  for (let [name, stop] of data.darkGrayInputs)
    light.out[name] = dark.out[name] = pick(dark.gray, stop);
  let ordered = ({
    out
  }) => Object.fromEntries(names.map((name) => [
    name,
    out[name]?.toLowerCase() ?? fail(`defineTheme has no rule for the theme input ${name}. This is a gap in make-colors.js, not in the theme.`)
  ])), code = part(def.codeTheme, "codeTheme");
  onlyKeys(code, ["light", "dark"], "codeTheme");
  let codeTheme = {};
  for (let mode of ["light", "dark"]) {
    let name = code[mode];
    if (name === void 0)
      continue;
    if (!isCodeThemeName(name))
      fail(`codeTheme.${mode} is ${shown(name)}. A code theme's name is 1 to 64 letters, digits, dots, hyphens or underscores, starting with a letter or digit, like "github-dark".`);
    codeTheme[mode] = String(name);
  }
  return {
    v: 1,
    id,
    label: String(label),
    inputs: { light: ordered(light), dark: ordered(dark) },
    ...Object.keys(codeTheme).length > 0 ? { codeTheme } : {}
  };
}

var THEME_DERIVE_DATA = {
  groups: THEME_INPUT_GROUPS,
  stock: STOCK_THEME_INPUTS,
  stops: RAMP_STOPS,
  roles: ROLE_DEFAULTS,
  anchorStops: ANCHOR_STOPS,
  darkGrayInputs: DARK_GRAY_INPUTS,
  gitFills: GIT_FILLS
}, freeze = (o) => (Object.values(o).forEach((v) => {
  if (typeof v === "object" && v !== null)
    freeze(v);
}), Object.freeze(o));
function defineTheme(def) {
  return freeze(deriveWith(THEME_DERIVE_DATA, def));
}

var THEME_INPUT_DATA = {
  groups: THEME_INPUT_GROUPS,
  stock: STOCK_THEME_INPUTS
};
var themeInputNames = () => inputNamesOf(THEME_INPUT_DATA), stockThemeInputs = (mode) => stockInputsOf(THEME_INPUT_DATA, mode);

var isRecord = (v) => typeof v === "object" && v !== null && !Array.isArray(v), isLabel = (v) => typeof v === "string" && v !== "" && v.length <= 64, MAX_UNKNOWN = 512, MAX_KEYS = 1024, INPUT_NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/, keepable = (name) => name.length <= 64 && INPUT_NAME.test(name);
function inputsFrom(given, names, stock, aliases, retired = RETIRED_INPUTS) {
  let taken = /* @__PURE__ */ new Set([...names, ...Object.keys(aliases), ...retired]), keys = Object.prototype.toString.call(given) === "[object Object]" ? Object.keys(given) : [], unknown = (keys.length > MAX_KEYS ? [] : keys).filter((k) => keepable(k) && !taken.has(k)).sort().flatMap((key) => {
    let value = given[key];
    return isHexColor(value) ? [[key, value]] : [];
  }).slice(0, MAX_UNKNOWN);
  return Object.fromEntries([
    ...names.map((name) => {
      let saved = savedUnder(given, name, aliases);
      return [name, isHexColor(saved) ? saved : stock[name] ?? ""];
    }),
    ...unknown
  ]);
}
function parseTheme(raw) {
  try {
    return read(raw);
  } catch {
    return;
  }
}
function read(raw) {
  if (!isRecord(raw))
    return;
  let { v, id, label, inputs, codeTheme } = raw;
  if (v !== 1 || !isThemeId(id) || !isLabel(label) || !isRecord(inputs))
    return;
  let half = (mode) => {
    let given = isRecord(inputs[mode]) ? inputs[mode] : {};
    return inputsFrom(given, themeInputNames(), stockThemeInputs(mode), INPUT_ALIASES);
  }, code = isRecord(codeTheme) ? {
    ...isCodeThemeName(codeTheme.light) ? { light: codeTheme.light } : {},
    ...isCodeThemeName(codeTheme.dark) ? { dark: codeTheme.dark } : {}
  } : void 0;
  return Object.freeze({
    v: 1,
    id,
    label,
    inputs: Object.freeze({
      light: Object.freeze(half("light")),
      dark: Object.freeze(half("dark"))
    }),
    ...code !== void 0 && Object.keys(code).length > 0 ? { codeTheme: Object.freeze(code) } : {}
  });
}

var LEAST_TEXT_CONTRAST = 3, isRecord2 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
function undefinedIn(value, path) {
  if (value === void 0)
    return [path];
  return isRecord2(value) ? Object.entries(value).flatMap(([key, inner]) => undefinedIn(inner, `${path}.${key}`)) : [];
}
function halfProblems(mode, half, known) {
  if (half === void 0)
    return [];
  if (mode !== "light" && mode !== "dark")
    return [
      `inputs.${mode} isn't a mode, so nothing paints there: use light or dark.`
    ];
  if (!isRecord2(half))
    return [`inputs.${mode} must be an object, so nothing paints there.`];
  return Object.entries(half).filter(([, value]) => value !== void 0).flatMap(([name, value]) => [
    ...known.has(name) ? [] : [
      `inputs.${mode}.${name} isn't a theme color name, so it paints nothing.`
    ],
    ...isHexColor(value) ? [] : [
      `inputs.${mode}.${name} is not six-digit hex, so it paints nothing.`
    ]
  ]);
}
function shapeProblems(colors) {
  if (!isRecord2(colors))
    return ["colors must be an object, so nothing paints."];
  let { v, label, inputs } = colors, known = new Set(themeInputNames());
  return [
    ...undefinedIn(colors, "colors").map((path) => `${path} is undefined, and $.theme.set refuses that: leave the key out.`),
    ...v === 1 ? [] : ["v must be 1, so nothing paints."],
    ...typeof label === "string" && label !== "" && label.length <= 64 ? [] : ["label must be 1 to 64 characters, so nothing paints."],
    ...isRecord2(inputs) ? Object.entries(inputs).flatMap(([mode, half]) => halfProblems(mode, half, known)) : ["inputs must be an object, so nothing paints."]
  ];
}
function contrastProblems(colors) {
  let theme = parseTheme({ ...colors, id: "mod-theme" });
  if (theme === void 0)
    return [];
  let issues = checkTheme(theme), isRefused = (issue) => issue.target >= 4.5 && issue.ratio < LEAST_TEXT_CONTRAST && !issue.token.startsWith("text-git-");
  return [
    ...issues.filter(isRefused).map((issue) => `Desktop won't paint this theme, because this text is under 3:1: ${issue.message}`),
    ...issues.filter((issue) => issue.level === "error" && !isRefused(issue)).map((issue) => issue.message)
  ];
}
function checkColors(colors) {
  return [...shapeProblems(colors), ...isRecord2(colors) ? contrastProblems(colors) : []];
}
function makeColors({ only, contrast, ...definition }) {
  if (only !== void 0 && only !== "light" && only !== "dark")
    throw Error(`only is "${only}": use 'light' or 'dark', or leave it out.`);
  let asJson = JSON.parse(JSON.stringify(definition)), whole = JSON.parse(JSON.stringify(defineTheme({ id: "mod-theme", ...asJson }))), theme = {
    ...whole,
    ...only !== void 0 && { inputs: { [only]: whole.inputs[only] } },
    ...contrast !== void 0 && { contrast }
  };
  return { theme, problems: checkColors(theme) };
}
export {
  checkColors,
  makeColors
};
