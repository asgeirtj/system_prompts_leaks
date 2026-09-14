#!/usr/bin/env python3
"""Validate metadata/<same path>.yaml sidecar files.

See docs/METADATA.md for the full metadata specification and
schemas/prompt-metadata.schema.json for the machine-readable schema.

Metadata lives under metadata/, mirroring the repository's directory tree
1:1. Each sidecar file's own path identifies the prompt file it describes:
metadata/<path>.yaml describes the prompt file at <path> (append ".yaml" to
a prompt's repo-relative path to get its sidecar's path, and vice versa).
The sidecar file's content is the metadata entry itself -- no path key is
needed, since the file's location already says which prompt it is about.
This script:

  1. Parses every metadata/**/*.yaml file (reports malformed YAML).
  2. Validates each file's content against the JSON Schema (reports every
     violation: missing required fields, invalid enum values, invalid date
     format, unknown keys, etc.).
  3. Confirms the prompt file implied by each sidecar's own path (strip the
     trailing ".yaml") actually exists in the repo (catches typos and stale
     entries after a prompt file is renamed or removed).
  4. Reports prompt files with no matching sidecar at all ("legacy") as
     informational output, not a failure -- see the migration policy in
     docs/METADATA.md. Pass --require-changed <git-ref> to instead treat
     legacy status as a failure for prompt files that are new or modified
     relative to <git-ref> (intended for CI on a pull request). Pass
     --strict to require metadata for every prompt file in the repository.

Because the sidecar layout mirrors the prompt tree 1:1, a sidecar can never
be misfiled under the wrong provider or collide with another sidecar over
the same prompt file -- both are structurally impossible, so this script
no longer needs to check for them (unlike the earlier one-file-per-provider
design).

Exit status is non-zero if anything in 1-3 fails, or if 4 fails under
--require-changed / --strict.

Usage:
    python scripts/validate_metadata.py
    python scripts/validate_metadata.py --require-changed origin/main
    python scripts/validate_metadata.py --strict
    python scripts/validate_metadata.py --quiet
"""

from __future__ import annotations

import argparse
import datetime
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover - dependency check
    print("error: PyYAML is required (pip install pyyaml)", file=sys.stderr)
    sys.exit(2)

try:
    import jsonschema
except ImportError:  # pragma: no cover - dependency check
    print("error: jsonschema is required (pip install jsonschema)", file=sys.stderr)
    sys.exit(2)


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_METADATA_DIR = REPO_ROOT / "metadata"
DEFAULT_SCHEMA_PATH = REPO_ROOT / "schemas" / "prompt-metadata.schema.json"
SIDECAR_SUFFIX = ".yaml"

# Top-level directories that never hold prompt content and are excluded when
# scanning the repo for "legacy" (undocumented) prompt files.
EXCLUDED_TOP_LEVEL_DIRS = {
    ".github",
    "assets",
    "docs",
    "schemas",
    "scripts",
    "tests",
    "metadata",
}
# Specific filenames that are repo/folder documentation rather than a
# leaked prompt, wherever they appear.
EXCLUDED_BASENAMES = {"README.md", "CONTRIBUTING.md"}


class SidecarResult:
    """Validation outcome for a single metadata/<same path>.yaml sidecar."""

    def __init__(self, path: Path, prompt_path: str):
        self.path = path
        self.prompt_path = prompt_path
        self.errors: list[str] = []

    @property
    def ok(self) -> bool:
        return not self.errors

    def add(self, message: str) -> None:
        self.errors.append(message)


def stringify_dates(value: Any) -> Any:
    """Recursively convert YAML-parsed date/datetime objects to ISO 8601
    strings. PyYAML resolves an unquoted YYYY-MM-DD scalar to a native
    datetime.date, but the schema (and JSON in general) expects a string."""
    if isinstance(value, dict):
        return {k: stringify_dates(v) for k, v in value.items()}
    if isinstance(value, list):
        return [stringify_dates(v) for v in value]
    if isinstance(value, (datetime.date, datetime.datetime)):
        return value.isoformat()
    return value


def display_path(path: Path) -> str:
    """Repo-relative POSIX path for display, falling back to the absolute
    path if `path` lies outside REPO_ROOT (e.g. a --metadata-dir override
    pointing elsewhere, such as in tests)."""
    try:
        return path.relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return str(path)


def load_schema(schema_path: Path) -> dict:
    with schema_path.open(encoding="utf-8") as f:
        return json.load(f)


def discover_sidecar_files(metadata_dir: Path) -> list[Path]:
    """Every metadata/**/*.yaml sidecar file, recursively."""
    if not metadata_dir.is_dir():
        return []
    return sorted(metadata_dir.rglob("*.yaml"))


def sidecar_to_prompt_path(sidecar_path: Path, metadata_dir: Path) -> str:
    """The repo-relative prompt path a sidecar file describes: its path
    relative to metadata_dir, with the trailing ".yaml" stripped."""
    rel = sidecar_path.relative_to(metadata_dir).as_posix()
    assert rel.endswith(SIDECAR_SUFFIX)  # guaranteed by the *.yaml glob
    return rel[: -len(SIDECAR_SUFFIX)]


def discover_prompt_files() -> list[str]:
    """List every git-tracked .md file outside infrastructure directories,
    as repo-relative POSIX paths. Uses `git ls-files` so untracked scratch
    files and .gitignore'd content are never treated as prompt content."""
    result = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "ls-files", "*.md"],
        capture_output=True,
        text=True,
        check=True,
    )
    paths = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        top = line.split("/", 1)[0]
        name = line.rsplit("/", 1)[-1]
        if top in EXCLUDED_TOP_LEVEL_DIRS or name in EXCLUDED_BASENAMES:
            continue
        paths.append(line)
    return paths


class BadGitRefError(Exception):
    pass


def get_changed_paths(ref: str) -> set[str]:
    """Paths of .md files added or modified relative to `ref` (working tree
    vs. that ref), per `git diff --name-only`."""
    result = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "diff", "--name-only", ref, "--", "*.md"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise BadGitRefError(
            f"'git diff {ref}' failed -- is {ref!r} a valid git ref? "
            f"({result.stderr.strip()})"
        )
    return {line.strip() for line in result.stdout.splitlines() if line.strip()}


def validate_sidecar_file(
    sidecar_path: Path,
    metadata_dir: Path,
    validator: jsonschema.protocols.Validator,
) -> SidecarResult:
    prompt_path = sidecar_to_prompt_path(sidecar_path, metadata_dir)
    result = SidecarResult(sidecar_path, prompt_path)

    try:
        with sidecar_path.open(encoding="utf-8") as f:
            raw = yaml.safe_load(f)
    except yaml.YAMLError as exc:
        result.add(f"malformed YAML: {exc}")
        return result

    if not isinstance(raw, dict):
        result.add(
            f"top level must be a metadata entry mapping, got {type(raw).__name__}"
        )
        return result

    doc = stringify_dates(raw)

    for error in sorted(validator.iter_errors(doc), key=lambda e: list(e.path)):
        loc = "/".join(str(p) for p in error.path) or "<top level>"
        result.add(f"{loc}: {error.message}")

    full_path = REPO_ROOT / prompt_path
    if not full_path.is_file():
        result.add(f"describes {prompt_path}, but that file does not exist in the repository")

    return result


def run(
    metadata_dir: Path,
    schema_path: Path,
    require_changed: str | None,
    strict: bool,
    quiet: bool,
) -> int:
    schema = load_schema(schema_path)
    validator_cls = jsonschema.validators.validator_for(schema)
    validator_cls.check_schema(schema)
    validator = validator_cls(schema)

    sidecar_files = discover_sidecar_files(metadata_dir)
    results = [
        validate_sidecar_file(path, metadata_dir, validator)
        for path in sidecar_files
    ]

    any_failed = False
    for result in results:
        rel = display_path(result.path)
        if result.ok:
            print(f"PASS {rel} -> {result.prompt_path}")
        else:
            any_failed = True
            print(f"FAIL {rel}")
            for err in result.errors:
                print(f"  - {err}")

    documented = {result.prompt_path for result in results}
    prompt_files = discover_prompt_files()
    legacy = sorted(set(prompt_files) - documented)

    if strict:
        enforced_missing = legacy
    elif require_changed:
        try:
            changed = get_changed_paths(require_changed)
        except BadGitRefError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 2
        enforced_missing = sorted(p for p in legacy if p in changed)
    else:
        enforced_missing = []

    if not quiet and legacy:
        label = "without metadata"
        if strict:
            label += " (--strict: treated as failures)"
        elif require_changed:
            label += f" (informational unless changed since {require_changed})"
        else:
            label += " (informational only, see docs/METADATA.md migration policy)"
        print(f"\n{len(legacy)} of {len(prompt_files)} prompt file(s) {label}:")
        preview = legacy if strict or require_changed else legacy[:10]
        for p in preview:
            marker = " [FAIL]" if p in enforced_missing else ""
            print(f"  - {p}{marker}")
        remaining = len(legacy) - len(preview)
        if remaining > 0:
            print(f"  ... and {remaining} more")

    if enforced_missing:
        any_failed = True
        if quiet:
            print(f"\n{len(enforced_missing)} changed/required prompt file(s) missing metadata:")
            for p in enforced_missing:
                print(f"  - {p}")

    total = len(results)
    failed = sum(1 for r in results if not r.ok)
    print(f"\n{total} sidecar file(s) checked, {failed} failed.")
    if enforced_missing:
        print(f"{len(enforced_missing)} required prompt file(s) missing metadata.")

    return 1 if any_failed else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--metadata-dir",
        type=Path,
        default=DEFAULT_METADATA_DIR,
        help="directory containing metadata/**/*.yaml sidecar files (default: metadata/)",
    )
    parser.add_argument(
        "--schema",
        type=Path,
        default=DEFAULT_SCHEMA_PATH,
        help="path to the JSON Schema (default: schemas/prompt-metadata.schema.json)",
    )
    parser.add_argument(
        "--require-changed",
        metavar="REF",
        help="fail if a .md file added/modified relative to REF has no matching sidecar",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="fail if ANY prompt file in the repository has no matching sidecar",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="don't print the full legacy-file listing, only failures and the summary",
    )
    args = parser.parse_args(argv)

    if args.strict and args.require_changed:
        parser.error("--strict and --require-changed are mutually exclusive")

    return run(
        metadata_dir=args.metadata_dir,
        schema_path=args.schema,
        require_changed=args.require_changed,
        strict=args.strict,
        quiet=args.quiet,
    )


if __name__ == "__main__":
    sys.exit(main())
