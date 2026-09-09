#!/usr/bin/env node
/**
 * build-site-index.mjs
 *
 * Recursively walks the repository, classifies every renderable file using generic, 
 * PATH-BASED heuristics only, and writes a flat docs/data/index.json that the static 
 * frontend fetches at runtime.
 *
 * This script must never contain provider names, folder names, or any list of
 * "known" content. Everything is discovered from the filesystem.
 */
import { readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Repo root = one level up from /scripts
const REPO_ROOT = join(__dirname, "..");
const OUT_DIR = join(REPO_ROOT, "docs", "data");
const OUT_FILE = join(OUT_DIR, "index.json");

// GitHub coordinates (used as fallback for index metadata)
let GITHUB_OWNER = "asgeirtj";
let GITHUB_REPO = "system_prompts_leaks";
let GITHUB_BRANCH = "main";

if (process.env.GITHUB_REPOSITORY) {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  if (owner && repo) {
    GITHUB_OWNER = owner;
    GITHUB_REPO = repo;
  }
}

// Directories that are repository plumbing, never archive content.
const IGNORED_DIR_NAMES = new Set([".git", ".github", "docs", "scripts", "node_modules", ".vscode", ".idea", "__pycache__"]);

// Extensions we currently know how to render as prompt content.
const RENDERABLE_EXTENSIONS = new Set([".md", ".txt", ".xml", ".json"]);

// Filenames that are implementation detail even if they share a renderable extension.
const IGNORED_FILENAMES = new Set(["package.json", "package-lock.json", "tsconfig.json", "overview_for_hanshal.md", "repo_files.json"]);

/** Walk a directory recursively, returning a flat list of { absPath, relPath } for files. */
function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.isDirectory()) continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIR_NAMES.has(entry.name)) continue;
      out.push(...walk(abs));
    } else if (entry.isFile()) {
      out.push(abs);
    }
  }
  return out;
}

function toBreadcrumbs(relPath) {
  const parts = relPath.split("/");
  parts.pop(); // drop filename
  return parts;
}

/** Turn a raw filename stem into a readable title using generic formatting rules only. */
function deriveTitle(filenameNoExt, breadcrumbs, isDoc) {
  if (isDoc) {
    const scope = breadcrumbs[breadcrumbs.length - 1];
    const label = filenameNoExt.toLowerCase() === "readme" ? "Overview" : filenameNoExt;
    return scope ? `${scope} — ${label}` : label;
  }
  return filenameNoExt
    .split(/[-_]+/)
    .map((word) => {
      if (/^\d/.test(word) || word.toUpperCase() === word) return word; // versions/acronyms untouched
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/** Generic, case-insensitive, path-segment based classification. No provider logic. */
function classify(relPath, filename) {
  const lowerSegments = relPath.toLowerCase().split("/");
  const lowerFilename = filename.toLowerCase();
  const stem = lowerFilename.replace(extname(lowerFilename), "");

  const flags = {
    doc: stem === "readme" || stem === "contributing",
    skill: lowerSegments.includes("bundled-skills") || stem === "skill",
    archived: lowerSegments.includes("old"),
    official: lowerSegments.includes("official"),
    reference: lowerSegments.includes("references") || lowerSegments.includes("reference"),
    example: lowerSegments.includes("examples") || lowerSegments.includes("example"),
    raw: lowerSegments.includes("raw"),
  };

  // Priority order purely for the single "primary" badge shown by default.
  const priority = ["doc", "skill", "reference", "example", "archived", "official", "raw"];
  const primary = priority.find((key) => flags[key]) || "primary";

  return { primary, flags };
}

function slugify(relPath) {
  return relPath
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function encodePath(relPath) {
  return relPath.split("/").map(encodeURIComponent).join("/");
}

function buildRecord(absPath) {
  const relPath = relative(REPO_ROOT, absPath).split("\\").join("/");
  const filename = basename(relPath);
  const ext = extname(filename).toLowerCase();
  const stem = filename.slice(0, filename.length - ext.length);
  const breadcrumbs = toBreadcrumbs(relPath);
  const { primary, flags } = classify(relPath, filename);
  const title = deriveTitle(stem, breadcrumbs, flags.doc);
  const stat = statSync(absPath);
  const encoded = encodePath(relPath);

  // The frontend can derive rawUrl dynamically for fork-compatibility, but we include 
  // these fallback properties here to ensure backward compatibility and basic API access.
  return {
    id: slugify(relPath) || slugify(filename),
    path: relPath,
    filename,
    extension: ext.replace(".", ""),
    title,
    root: breadcrumbs[0] || "General",
    breadcrumbs,
    depth: breadcrumbs.length,
    sizeBytes: stat.size,
    classification: primary,
    flags,
    sourceUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${encoded}`,
    rawUrl: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${encoded}`,
  };
}

function main() {
  const allFiles = walk(REPO_ROOT);
  const records = [];

  for (const abs of allFiles) {
    const filename = basename(abs);
    const ext = extname(filename).toLowerCase();
    if (!RENDERABLE_EXTENSIONS.has(ext)) continue;
    if (IGNORED_FILENAMES.has(filename)) continue;
    records.push(buildRecord(abs));
  }

  records.sort((a, b) => a.path.localeCompare(b.path));

  const roots = [...new Set(records.map((r) => r.root))].sort();
  const classifications = [...new Set(records.map((r) => r.classification))].sort();
  const extensions = [...new Set(records.map((r) => r.extension))].sort();
  const maxDepth = records.reduce((m, r) => Math.max(m, r.depth), 0);
  const totalSizeBytes = records.reduce((sum, r) => sum + r.sizeBytes, 0);

  const output = {
    generatedAt: new Date().toISOString(),
    repo: { owner: GITHUB_OWNER, name: GITHUB_REPO, branch: GITHUB_BRANCH },
    stats: {
      totalFiles: records.length,
      totalRoots: roots.length,
      totalSizeBytes,
      maxDepth,
      roots,
      classifications,
      extensions,
    },
    files: records,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Indexed ${records.length} files across ${roots.length} root collections (max depth ${maxDepth}).`);
  console.log(`Wrote ${OUT_FILE}`);
}

main();
