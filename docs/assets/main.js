import { loadIndex, buildTree, findNode, findFile, defaultFilterState, applyFilters, formatBytes, fetchFileContent } from "./data.js";
import { search } from "./search.js";
import { renderMarkdown, escapeHtml } from "./markdown.js";
import { hrefHome, hrefBrowse, hrefFile, hrefSearch, parseHash, onRouteChange, navigate } from "./router.js";
import { rootAccent, classificationLabel } from "./palette.js";

const LARGE_FILE_THRESHOLD = 150_000; // bytes — above this we default to a raw view first

let state;
const appEl = document.getElementById("app");

async function init() {
  appEl.innerHTML = `<div class="loading-line">Loading archive index…</div>`;
  try {
    const index = await loadIndex();
    const tree = buildTree(index.files);
    state = {
      index,
      tree,
      filters: defaultFilterState(index),
      expanded: new Set(),
      mobileNavOpen: false,
      searchQuery: "",
      searchActiveIndex: -1,
      readerContent: new Map(),
    };
    expandAncestorsOfCurrentRoute();
    render();
    onRouteChange(() => {
      expandAncestorsOfCurrentRoute();
      state.mobileNavOpen = false;
      render();
    });
    wireGlobalEvents();
  } catch (err) {
    console.error("Initialization failed:", err);
    appEl.innerHTML = `<div class="empty-state">Failed to load archive index. Please try again later.</div>`;
  }
}

function expandAncestorsOfCurrentRoute() {
  const route = parseHash();
  const path = route.view === "browse" || route.view === "file" ? route.path : "";
  if (!path) return;
  const parts = path.split("/");
  let acc = "";
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;
    state.expanded.add(acc);
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function render() {
  const route = parseHash();
  appEl.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      <div class="body-row">
        ${renderSidebar(route)}
        <main class="main" id="main-content" tabindex="-1">
          ${renderMain(route)}
        </main>
      </div>
    </div>
    ${state.mobileNavOpen ? `<div class="mobile-nav-backdrop" data-action="close-mobile-nav"></div>` : ""}
  `;

  if (route.view === "file") {
    void hydrateFileReader(route.path);
  }
}

function renderTopbar() {
  return `
    <header class="topbar">
      <button class="mobile-nav-toggle" data-action="toggle-mobile-nav" aria-label="Toggle navigation">☰ INDEX</button>
      <a href="${hrefHome()}" class="wordmark">SYSTEM<span>_</span>PROMPTS ARCHIVE</a>
      <div class="search-shell">
        <input
          type="text"
          class="search-input"
          id="global-search"
          placeholder="Search titles, paths, folders… ( / to focus )"
          autocomplete="off"
          value="${escapeHtml(state.searchQuery)}"
          aria-label="Search the archive"
        />
        ${renderSearchDropdown()}
      </div>
      <a class="gh-link" href="https://github.com/${state.index.repo.owner}/${state.index.repo.name}" target="_blank" rel="noopener">
        <span class="gh-label">GITHUB ↗</span><span aria-hidden="true" class="gh-label-mobile">↗</span>
      </a>
    </header>
  `;
}

function renderSearchDropdown() {
  if (!state.searchQuery.trim()) return "";
  const results = search(state.index.files, state.searchQuery, 8);
  const totalResults = search(state.index.files, state.searchQuery, 500).length;

  if (results.length === 0) {
    return `<div class="search-results"><div class="search-empty">No matches for “${escapeHtml(state.searchQuery)}”. Try a shorter or different term.</div></div>`;
  }

  const items = results
    .map(
      (r, i) => `
      <a href="${hrefFile(r.record.path)}" class="search-result-item ${i === state.searchActiveIndex ? "is-active" : ""}" data-search-index="${i}">
        <span class="search-result-title">${escapeHtml(r.record.title)}</span>
        <span class="search-result-path">${escapeHtml(r.record.path)}</span>
      </a>`
    )
    .join("");

  const viewAll =
    totalResults > results.length
      ? `<a href="${hrefSearch(state.searchQuery)}" class="search-view-all">View all ${totalResults} results →</a>`
      : "";

  return `<div class="search-results">${items}${viewAll}</div>`;
}

function renderSidebar(route) {
  const currentPath = route.view === "file" ? route.path : "";
  const treeHtml = renderTreeChildren(state.tree, currentPath);
  const filtersHtml = renderFilterPanel();
  return `
    <nav class="sidebar ${state.mobileNavOpen ? "is-open" : ""}" aria-label="Repository navigation">
      <div class="sidebar-heading">Index</div>
      ${treeHtml || `<div class="empty-state">No files indexed.</div>`}
      <div class="sidebar-heading">Filters</div>
      ${filtersHtml}
    </nav>
  `;
}

function renderTreeChildren(node, currentFilePath) {
  const folders = [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name));
  const files = [...node.files].sort((a, b) => a.title.localeCompare(b.title));

  const folderHtml = folders
    .map((child) => {
      const isOpen = state.expanded.has(child.path);
      return `
        <details class="tree-node" data-tree-path="${escapeHtml(child.path)}" ${isOpen ? "open" : ""}>
          <summary>
            <span class="tree-caret">▶</span>
            <a href="${hrefBrowse(child.path)}" data-stop-summary-nav>${escapeHtml(child.name)}</a>
            <span class="tree-count">${child.fileCount}</span>
          </summary>
          <div class="tree-children">${renderTreeChildren(child, currentFilePath)}</div>
        </details>
      `;
    })
    .join("");

  const fileHtml = files
    .map(
      (f) => `
      <a class="tree-file-link ${f.path === currentFilePath ? "is-current" : ""}" href="${hrefFile(f.path)}">
        <span aria-hidden="true">·</span>${escapeHtml(f.title)}
      </a>`
    )
    .join("");

  return folderHtml + fileHtml;
}

function renderFilterPanel() {
  const classificationChips = state.index.stats.classifications
    .map((c) => {
      const active = state.filters.classifications.has(c);
      return `<label class="filter-chip ${active ? "is-active" : ""}">
        <input type="checkbox" data-filter-type="classifications" data-filter-value="${c}" ${active ? "checked" : ""} />
        ${classificationLabel(c)}
      </label>`;
    })
    .join("");

  const extensionChips = state.index.stats.extensions
    .map((e) => {
      const active = state.filters.extensions.has(e);
      return `<label class="filter-chip ${active ? "is-active" : ""}">
        <input type="checkbox" data-filter-type="extensions" data-filter-value="${e}" ${active ? "checked" : ""} />
        .${e}
      </label>`;
    })
    .join("");

  return `
    <div class="filter-group">${classificationChips}</div>
    <div class="filter-group">${extensionChips}</div>
  `;
}

function renderMain(route) {
  if (route.view === "home") return renderHome();
  if (route.view === "browse") return renderBrowse(route.path);
  if (route.view === "file") return renderFileView(route.path);
  if (route.view === "search") return renderSearchPage(route.query);
  return renderHome();
}

function renderHome() {
  const { stats } = state.index;
  const roots = [...state.tree.children.values()].sort((a, b) => b.fileCount - a.fileCount);

  const collectionCards = roots
    .map((r) => {
      const accent = rootAccent(r.name);
      return `
      <a class="card collection-card" style="border-top-color:${accent}" href="${hrefBrowse(r.path)}">
        <h3 class="collection-name">${escapeHtml(r.name)}</h3>
        <div class="collection-meta">
          <span>${r.fileCount} file${r.fileCount === 1 ? "" : "s"}</span>
          <span>${r.children.size} subfolder${r.children.size === 1 ? "" : "s"}</span>
          <span>${formatBytes(r.sizeBytes)}</span>
        </div>
      </a>`;
    })
    .join("");

  return `
    <section class="hero">
      <div class="hero-eyebrow">// a comprehensive collection of AI instructions</div>
      <h1 class="hero-title">SYSTEM<br/>PROMPTS<br/>ARCHIVE</h1>
      <p class="hero-sub">Explore a growing, automatically updated archive of leaked and published AI system prompts. Browse by provider, search for specific models, or dive straight into the raw instructions.</p>
      <div class="stat-row">
        <div class="stat-stamp"><span class="stat-value">${stats.totalFiles}</span><span class="stat-label">Indexed Files</span></div>
        <div class="stat-stamp"><span class="stat-value">${stats.totalRoots}</span><span class="stat-label">Root Collections</span></div>
        <div class="stat-stamp"><span class="stat-value">${stats.maxDepth}</span><span class="stat-label">Max Depth</span></div>
        <div class="stat-stamp"><span class="stat-value">${formatBytes(stats.totalSizeBytes)}</span><span class="stat-label">Archive Size</span></div>
      </div>
    </section>

    <h2 class="section-heading">Collections <span class="count">${roots.length} discovered at root</span></h2>
    <div class="card-grid">${collectionCards}</div>
  `;
}

function renderBrowse(path) {
  const node = findNode(state.tree, path);
  if (!node) {
    return `<div class="empty-state">Nothing here. This folder doesn't exist in the current index — <a href="${hrefHome()}">go back home</a>.</div>`;
  }

  const folders = [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name));
  const files = applyFilters(node.files, state.filters).sort((a, b) => a.title.localeCompare(b.title));

  const folderCards = folders
    .map(
      (f) => `
      <a class="card folder-card" href="${hrefBrowse(f.path)}">
        <span class="folder-icon">FOLDER</span>
        <span class="folder-name">${escapeHtml(f.name)}</span>
        <span class="folder-meta">${f.fileCount} file${f.fileCount === 1 ? "" : "s"} · ${f.children.size} subfolder${f.children.size === 1 ? "" : "s"} · ${formatBytes(f.sizeBytes)}</span>
      </a>`
    )
    .join("");

  const fileCards = files.map((f) => renderFileCard(f)).join("");

  const nothingVisible = folders.length === 0 && files.length === 0;

  return `
    ${renderBreadcrumbs(node.path)}
    <h2 class="section-heading">${escapeHtml(node.name || "Archive")} <span class="count">${node.fileCount} file${node.fileCount === 1 ? "" : "s"} total</span></h2>
    ${renderFilterBarInline()}
    ${nothingVisible ? `<div class="empty-state">No items match the current filters in this folder.</div>` : ""}
    ${folders.length ? `<div class="card-grid">${folderCards}</div>` : ""}
    ${files.length ? `<div class="card-grid">${fileCards}</div>` : node.files.length && !files.length ? `<div class="empty-state">All files in this folder are hidden by the current filters.</div>` : ""}
  `;
}

function renderFilterBarInline() {
  const activeClassifications = state.filters.classifications.size;
  const totalClassifications = state.index.stats.classifications.length;
  const activeExtensions = state.filters.extensions.size;
  const totalExtensions = state.index.stats.extensions.length;
  if (activeClassifications === totalClassifications && activeExtensions === totalExtensions) return "";
  return `<div class="filter-bar"><span class="filter-bar-label">Filters active —</span> use the sidebar to adjust which classifications and file types are shown.</div>`;
}

function renderFileCard(f) {
  const badges = badgesFor(f);
  return `
    <a class="card file-card" href="${hrefFile(f.path)}">
      <span class="file-title">${escapeHtml(f.title)}</span>
      <span class="file-path">${escapeHtml(f.path)}</span>
      <span class="file-meta-row">
        ${badges}
        <span class="badge badge-size">${formatBytes(f.sizeBytes)}</span>
      </span>
    </a>
  `;
}

function badgesFor(f) {
  const active = Object.entries(f.flags)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const keys = active.length ? active : ["primary"];
  return keys.map((k) => `<span class="badge badge-${k}">${classificationLabel(k)}</span>`).join("");
}

function renderBreadcrumbs(path) {
  const parts = path.split("/").filter(Boolean);
  let acc = "";
  const crumbs = [`<a href="${hrefHome()}">Archive</a>`];
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;
    crumbs.push(`<a href="${hrefBrowse(acc)}">${escapeHtml(part)}</a>`);
  }
  return `<div class="breadcrumbs">${crumbs.join('<span class="sep">/</span>')}</div>`;
}

function renderFileView(path) {
  const record = findFile(state.index.files, path);
  if (!record) {
    return `<div class="empty-state">This file isn't in the current index — <a href="${hrefHome()}">go back home</a>.</div>`;
  }
  const badges = badgesFor(record);
  const entry = state.readerContent.get(path);

  return `
    ${renderBreadcrumbs(record.breadcrumbs.join("/"))}
    <header class="reader-header">
      <div class="file-meta-row">${badges}<span class="badge badge-size">${formatBytes(record.sizeBytes)}</span><span class="badge">.${record.extension}</span></div>
      <h1 class="reader-title">${escapeHtml(record.title)}</h1>
      <div class="reader-path">${escapeHtml(record.path)}</div>
      <div class="reader-actions">
        <button class="btn btn-primary" data-action="copy-content" data-path="${escapeHtml(path)}">⧉ Copy content</button>
        <a class="btn" href="${record.sourceUrl}" target="_blank" rel="noopener">Open on GitHub ↗</a>
        <a class="btn" href="${record.rawUrl}" target="_blank" rel="noopener">View raw ↗</a>
      </div>
    </header>
    <div class="reader-body" id="reader-body">
      ${renderReaderBody(record, entry)}
    </div>
  `;
}

function renderReaderBody(record, entry) {
  if (!entry || entry.status === "loading") {
    return `<div class="loading-line">Fetching ${escapeHtml(record.filename)} from GitHub…</div>`;
  }
  if (entry.status === "error") {
    return `<div class="empty-state">Couldn't load this file's content right now. <a href="${record.rawUrl}" target="_blank" rel="noopener">Open the raw file instead ↗</a></div>`;
  }

  const text = entry.text ?? "";
  const isMarkdown = record.extension === "md";
  const isLarge = record.sizeBytes > LARGE_FILE_THRESHOLD;

  if (isMarkdown && !(isLarge && !entry.forceRaw)) {
    return `<div class="prose">${renderMarkdown(text)}</div>`;
  }

  const notice =
    isMarkdown && isLarge && !entry.forceRaw
      ? ""
      : isLarge
      ? `<div class="large-file-notice"><span>Showing raw text for this large file to keep things responsive.</span></div>`
      : "";

  if (isMarkdown && isLarge && !entry.forceRaw) {
    return `
      <div class="large-file-notice">
        <span>This file is ${formatBytes(record.sizeBytes)} — showing raw text first to stay responsive.</span>
        <button class="btn btn-primary" data-action="render-formatted" data-path="${escapeHtml(record.path)}">Render formatted markdown</button>
      </div>
      <pre class="raw-view">${escapeHtml(text)}</pre>
    `;
  }

  return `${notice}<pre class="raw-view">${escapeHtml(text)}</pre>`;
}

function renderSearchPage(query) {
  const results = search(state.index.files, query, 60);
  const filtered = applyFilters(
    results.map((r) => r.record),
    state.filters
  );
  const filteredResults = results.filter((r) => filtered.includes(r.record));

  return `
    <h2 class="section-heading">Search results <span class="count">“${escapeHtml(query)}” — ${filteredResults.length} match${filteredResults.length === 1 ? "" : "es"}</span></h2>
    ${renderFilterBarInline()}
    ${
      filteredResults.length === 0
        ? `<div class="empty-state">No files match “${escapeHtml(query)}”. Try a different term, or check the sidebar filters.</div>`
        : `<div class="card-grid">${filteredResults.map((r) => renderFileCard(r.record)).join("")}</div>`
    }
  `;
}

// ---------------------------------------------------------------------------
// Data fetching for the reader
// ---------------------------------------------------------------------------

async function hydrateFileReader(path) {
  const record = findFile(state.index.files, path);
  if (!record) return;
  if (state.readerContent.has(path) && state.readerContent.get(path).status !== "error") return;

  state.readerContent.set(path, { status: "loading", forceRaw: false });
  const body = document.getElementById("reader-body");
  if (body) body.innerHTML = renderReaderBody(record, state.readerContent.get(path));

  try {
    const text = await fetchFileContent(record);
    state.readerContent.set(path, { status: "ready", text, forceRaw: false });
  } catch {
    state.readerContent.set(path, { status: "error", forceRaw: false });
  }

  // Only re-render if we're still looking at this file.
  const route = parseHash();
  if (route.view === "file" && route.path === path) {
    const bodyNow = document.getElementById("reader-body");
    if (bodyNow) bodyNow.innerHTML = renderReaderBody(record, state.readerContent.get(path));
  }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function showToast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function wireGlobalEvents() {
  document.addEventListener("input", (e) => {
    const target = e.target;
    if (target.id === "global-search") {
      state.searchQuery = target.value;
      state.searchActiveIndex = -1;
      const shell = target.closest(".search-shell");
      if (shell) {
        const existing = shell.querySelector(".search-results");
        if (existing) existing.remove();
        shell.insertAdjacentHTML("beforeend", renderSearchDropdown());
      }
      return;
    }
    if (target.matches('input[data-filter-type]')) {
      const type = target.getAttribute("data-filter-type");
      const value = target.getAttribute("data-filter-value");
      const set = state.filters[type];
      if (target.checked) set.add(value);
      else set.delete(value);
      render();
    }
  });

  document.addEventListener("keydown", (e) => {
    const target = e.target;
    const isTypingElsewhere = target.tagName === "INPUT" && target.id !== "global-search";

    if (e.key === "/" && target.id !== "global-search" && !isTypingElsewhere) {
      e.preventDefault();
      const input = document.getElementById("global-search");
      input?.focus();
      return;
    }

    if (target.id === "global-search") {
      const dropdown = document.querySelector(".search-results");
      const results = search(state.index.files, state.searchQuery, 8);
      if (e.key === "Escape") {
        state.searchQuery = "";
        target.value = "";
        dropdown?.remove();
        target.blur();
        return;
      }
      if (e.key === "ArrowDown" && results.length) {
        e.preventDefault();
        state.searchActiveIndex = Math.min(state.searchActiveIndex + 1, results.length - 1);
        refreshDropdownHighlight();
        return;
      }
      if (e.key === "ArrowUp" && results.length) {
        e.preventDefault();
        state.searchActiveIndex = Math.max(state.searchActiveIndex - 1, 0);
        refreshDropdownHighlight();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (state.searchActiveIndex >= 0 && results[state.searchActiveIndex]) {
          navigate(hrefFile(results[state.searchActiveIndex].record.path));
        } else if (state.searchQuery.trim()) {
          navigate(hrefSearch(state.searchQuery));
        }
      }
    }
  });

  document.addEventListener("focusout", (e) => {
    const target = e.target;
    if (target.id === "global-search") {
      setTimeout(() => {
        if (document.activeElement?.closest(".search-results")) return;
        document.querySelector(".search-results")?.remove();
      }, 120);
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target;

    const toggleBtn = target.closest('[data-action="toggle-mobile-nav"]');
    if (toggleBtn) {
      state.mobileNavOpen = !state.mobileNavOpen;
      render();
      return;
    }
    const backdrop = target.closest('[data-action="close-mobile-nav"]');
    if (backdrop) {
      state.mobileNavOpen = false;
      render();
      return;
    }

    const copyBtn = target.closest('[data-action="copy-content"]');
    if (copyBtn) {
      const path = copyBtn.getAttribute("data-path");
      const entry = state.readerContent.get(path);
      if (entry?.text) {
        navigator.clipboard.writeText(entry.text)
          .then(() => showToast("Copied to clipboard"))
          .catch((err) => {
            console.error("Clipboard write failed:", err);
            showToast("Failed to copy to clipboard");
          });
      }
      return;
    }

    const renderBtn = target.closest('[data-action="render-formatted"]');
    if (renderBtn) {
      const path = renderBtn.getAttribute("data-path");
      const entry = state.readerContent.get(path);
      const record = findFile(state.index.files, path);
      if (entry && record) {
        entry.forceRaw = true;
        setTimeout(() => {
          const body = document.getElementById("reader-body");
          if (body) body.innerHTML = renderReaderBody(record, entry);
        }, 0);
      }
      return;
    }

    // Details toggle bookkeeping: keep expanded-state in sync with native <details>.
    const summaryLink = target.closest("a[data-stop-summary-nav]");
    if (summaryLink) {
      // Let navigation happen but don't let the click also toggle <details>.
      e.stopPropagation();
      return;
    }

    const detailsEl = target.closest(".tree-node");
    if (detailsEl && target.tagName !== "A") {
      const path = detailsEl.getAttribute("data-tree-path");
      // Defer to after native toggle applies.
      setTimeout(() => {
        if (detailsEl.open) state.expanded.add(path);
        else state.expanded.delete(path);
      }, 0);
    }
  });
}

function refreshDropdownHighlight() {
  document.querySelectorAll(".search-result-item").forEach((el, i) => {
    el.classList.toggle("is-active", i === state.searchActiveIndex);
  });
}

init().catch(err => console.error("Unhandled top-level error:", err));
