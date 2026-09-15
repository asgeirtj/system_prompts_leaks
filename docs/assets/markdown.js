import { Marked } from "marked";

export function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Many prompt files contain raw XML-like tags (e.g. <anthropic_reminders>) as
// literal instructional text, not real markup. If we let marked pass raw HTML
// through untouched, the browser will try to parse those tags as DOM elements
// and can silently mangle the layout. We override the html renderer so any
// raw HTML/XML-like span found in source text is shown as escaped, readable
// text instead of being interpreted as markup.
const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html(token) {
      // marked calls this with a plain string for inline "bare tag" tokens and
      // with a { text, raw } token object for block-level HTML — handle both.
      const raw = typeof token === "string" ? token : token.text ?? token.raw ?? "";
      return escapeHtml(raw);
    },
    link(token) {
      const href = token.href || "";
      if (href.trim().toLowerCase().startsWith("javascript:")) {
        return escapeHtml(token.text);
      }
      return false; // Let marked handle valid links
    }
  },
});

export function renderMarkdown(source) {
  return marked.parse(source, { async: false });
}
