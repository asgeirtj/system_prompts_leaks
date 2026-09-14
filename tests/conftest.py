"""Shared fixtures for scripts/validate_metadata.py's test suite."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = REPO_ROOT / "scripts"
SCHEMA_PATH = REPO_ROOT / "schemas" / "prompt-metadata.schema.json"
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

sys.path.insert(0, str(SCRIPTS_DIR))
import validate_metadata as vm  # noqa: E402  (import after sys.path tweak)

# Prompt files that exist in every temp_repo fixture. The sidecar fixtures
# under tests/fixtures/ are plain entry bodies with no path of their own --
# tests place them under metadata/<one of these>.yaml via copy_fixture()'s
# dest_name to control which prompt file they describe.
FIXTURE_PROMPT_FILES = [
    "Anthropic/example.md",
    "OpenAI/example.md",
    "Google/example.md",
]


@pytest.fixture
def temp_repo(tmp_path, monkeypatch):
    """A throwaway git repository containing a few real (dummy) prompt
    files, wired up as the validator's REPO_ROOT. This lets path-existence
    checks and `git diff`/`git ls-files` calls run against isolated fixture
    content instead of the real repository being worked on.
    """
    repo = tmp_path / "repo"
    repo.mkdir()

    subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, check=True)

    for rel in FIXTURE_PROMPT_FILES:
        path = repo / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f"Example prompt content for {rel}.\n", encoding="utf-8")

    subprocess.run(["git", "add", "-A"], cwd=repo, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "initial"], cwd=repo, check=True)

    monkeypatch.setattr(vm, "REPO_ROOT", repo)
    return repo


@pytest.fixture
def metadata_dir(temp_repo):
    path = temp_repo / "metadata"
    path.mkdir()
    return path


def copy_fixture(name: str, dest_dir: Path, dest_name: str | None = None) -> Path:
    """Copy tests/fixtures/<name> into dest_dir, optionally under a
    different (possibly nested, e.g. "Anthropic/example.md.yaml") relative
    path -- used to control which prompt file a fixture's entry is taken to
    describe, since that's now derived from the sidecar's own location."""
    dest = dest_dir / (dest_name or name)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(FIXTURES_DIR / name, dest)
    return dest


def run_validator(metadata_dir: Path, **overrides) -> int:
    """Call vm.run() with sane defaults, capturing nothing itself -- use
    pytest's `capsys` fixture in the test to inspect stdout/stderr."""
    kwargs = dict(
        metadata_dir=metadata_dir,
        schema_path=SCHEMA_PATH,
        require_changed=None,
        strict=False,
        quiet=True,
    )
    kwargs.update(overrides)
    return vm.run(**kwargs)
