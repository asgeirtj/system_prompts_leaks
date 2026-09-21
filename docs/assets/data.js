let cachedIndex = null;
const contentCache = new Map();

export async function loadIndex() {
  if (cachedIndex) return cachedIndex;
  // Use no-cache so we always get the latest generated index.json after a workflow run
  const res = await fetch("data/index.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load index.json (${res.status})`);
  cachedIndex = await res.json();
  return cachedIndex;
}

export async function fetchFileContent(record) {
  const cached = contentCache.get(record.path);
  if (cached !== undefined) return cached;
  
  if (!cachedIndex) throw new Error("Archive index must be loaded before fetching file content");
  
  const encodedPath = record.path.split("/").map(encodeURIComponent).join("/");
  
  let owner = cachedIndex.repo.owner;
  let repo = cachedIndex.repo.name;
  if (window.location.hostname.endsWith(".github.io")) {
    owner = window.location.hostname.split(".")[0];
    repo = window.location.pathname.split("/")[1] || repo;
  }
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${cachedIndex.repo.branch}/${encodedPath}`;

  const res = await fetch(rawUrl);
  if (!res.ok) throw new Error(`Failed to fetch content (${res.status})`);
  const text = await res.text();
  contentCache.set(record.path, text);
  return text;
}

/** Build a nested tree purely from breadcrumbs + filename. No knowledge of specific folder names. */
export function buildTree(files) {
  const root = { name: "", path: "", children: new Map(), files: [], fileCount: 0, sizeBytes: 0 };

  for (const file of files) {
    let node = root;
    let currentPath = "";
    for (const segment of file.breadcrumbs) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      if (!node.children.has(segment)) {
        node.children.set(segment, {
          name: segment,
          path: currentPath,
          children: new Map(),
          files: [],
          fileCount: 0,
          sizeBytes: 0,
        });
      }
      node = node.children.get(segment);
    }
    node.files.push(file);
  }

  computeRecursiveStats(root);
  return root;
}

function computeRecursiveStats(node) {
  let count = node.files.length;
  let size = node.files.reduce((s, f) => s + f.sizeBytes, 0);
  for (const child of node.children.values()) {
    const sub = computeRecursiveStats(child);
    count += sub.count;
    size += sub.size;
  }
  node.fileCount = count;
  node.sizeBytes = size;
  return { count, size };
}

export function findNode(root, path) {
  if (!path) return root;
  let node = root;
  for (const segment of path.split("/")) {
    const next = node.children.get(segment);
    if (!next) return null;
    node = next;
  }
  return node;
}

export function findFile(files, path) {
  return files.find((f) => f.path === path);
}

export function defaultFilterState(index) {
  return {
    classifications: new Set(index.stats.classifications),
    extensions: new Set(index.stats.extensions),
  };
}

export function applyFilters(files, filters) {
  return files.filter((f) => filters.classifications.has(f.classification) && filters.extensions.has(f.extension));
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
