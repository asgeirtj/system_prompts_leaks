function decodeSegments(raw) {
  return raw
    .split("/")
    .filter(Boolean)
    .map((s) => decodeURIComponent(s))
    .join("/");
}

function encodeSegments(path) {
  return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

export function parseHash() {
  try {
    const hash = location.hash.replace(/^#\/?/, "");
    if (!hash) return { view: "home" };
    const [kind, ...rest] = hash.split("/");
    const remainder = rest.join("/");
    if (kind === "b") return { view: "browse", path: decodeSegments(remainder) };
    if (kind === "f") return { view: "file", path: decodeSegments(remainder) };
    if (kind === "s") return { view: "search", query: decodeURIComponent(remainder) };
    return { view: "home" };
  } catch (err) {
    console.error("Malformed URL hash, falling back to home:", err);
    return { view: "home" };
  }
}

export function hrefHome() {
  return "#/";
}
export function hrefBrowse(path) {
  return `#/b/${encodeSegments(path)}`;
}
export function hrefFile(path) {
  return `#/f/${encodeSegments(path)}`;
}
export function hrefSearch(query) {
  return `#/s/${encodeURIComponent(query)}`;
}

export function navigate(href) {
  location.hash = href.replace(/^#/, "");
}

export function onRouteChange(cb) {
  window.addEventListener("hashchange", cb);
}
