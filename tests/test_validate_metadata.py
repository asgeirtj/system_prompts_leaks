"""Tests for scripts/validate_metadata.py.

Run with:
    pip install -r scripts/requirements.txt -r tests/requirements.txt
    pytest
"""

from __future__ import annotations

import datetime

import pytest

from conftest import copy_fixture, run_validator, vm


# ---------------------------------------------------------------------------
# Schema-shaped failures: one fixture each, isolating a single violation.
# Every fixture is a bare entry body; the mirrored path it's saved under
# (via copy_fixture's dest_name) is what ties it to a prompt file.
# ---------------------------------------------------------------------------


def test_valid_entry_passes(metadata_dir, capsys):
    copy_fixture("valid.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 0
    assert "PASS metadata/Anthropic/example.md.yaml -> Anthropic/example.md" in out


def test_missing_required_field_fails(metadata_dir, capsys):
    copy_fixture("missing-confidence.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "FAIL metadata/Anthropic/example.md.yaml" in out
    assert "'confidence' is a required property" in out


def test_invalid_confidence_value_fails(metadata_dir, capsys):
    copy_fixture("invalid-confidence.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "'verified' is not one of" in out


def test_invalid_source_type_fails(metadata_dir, capsys):
    copy_fixture("invalid-source-type.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "'leaked' is not one of" in out


def test_invalid_date_format_fails(metadata_dir, capsys):
    copy_fixture("invalid-date.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "does not match" in out
    assert "01/01/2026" in out


def test_unquoted_date_is_normalized_and_passes(metadata_dir, capsys):
    # valid.yaml uses an unquoted 2026-01-01, which PyYAML parses as a
    # datetime.date rather than a string -- the validator must normalize
    # this before checking it against the schema's string pattern.
    copy_fixture("valid.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    assert code == 0
    assert "FAIL" not in capsys.readouterr().out


def test_unknown_contains_value_fails(metadata_dir, capsys):
    copy_fixture("unknown-contains.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "'made_up_value' is not one of" in out


def test_unexpected_property_rejected(metadata_dir, capsys):
    copy_fixture("unexpected-property.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "extra_field" in out


def test_malformed_yaml_fails(metadata_dir, capsys):
    copy_fixture("malformed.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "malformed YAML" in out


def test_top_level_not_a_mapping_fails(metadata_dir, capsys):
    copy_fixture("not-a-mapping.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "must be a metadata entry mapping" in out


# ---------------------------------------------------------------------------
# Sidecar path-derivation and discovery (1:1 mirrored layout).
# ---------------------------------------------------------------------------


def test_dangling_path_fails(metadata_dir, capsys):
    # Saved under a mirrored path for a prompt file that doesn't exist.
    copy_fixture("dangling-path.yaml", metadata_dir, "Anthropic/this-file-does-not-exist.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 1
    assert "describes Anthropic/this-file-does-not-exist.md" in out
    assert "does not exist in the repository" in out


def test_sidecar_files_are_discovered_recursively(metadata_dir, capsys):
    # Nested sidecars under different subdirectories must all be found by
    # the metadata/**/*.yaml glob, each resolving to its own mirrored path.
    copy_fixture("valid.yaml", metadata_dir, "Anthropic/example.md.yaml")
    copy_fixture("valid.yaml", metadata_dir, "OpenAI/example.md.yaml")

    code = run_validator(metadata_dir)

    out = capsys.readouterr().out
    assert code == 0
    assert "PASS metadata/Anthropic/example.md.yaml -> Anthropic/example.md" in out
    assert "PASS metadata/OpenAI/example.md.yaml -> OpenAI/example.md" in out
    assert "2 sidecar file(s) checked, 0 failed." in out


def test_sidecar_to_prompt_path_strips_metadata_prefix_and_yaml_suffix(tmp_path):
    metadata_dir = tmp_path / "metadata"
    sidecar = metadata_dir / "Anthropic" / "claude-code" / "SKILL.md.yaml"

    assert vm.sidecar_to_prompt_path(sidecar, metadata_dir) == "Anthropic/claude-code/SKILL.md"


def test_no_metadata_dir_passes_with_zero_checked(temp_repo, capsys):
    missing_dir = temp_repo / "metadata"  # never created

    code = run_validator(missing_dir)

    out = capsys.readouterr().out
    assert code == 0
    assert "0 sidecar file(s) checked, 0 failed." in out


# ---------------------------------------------------------------------------
# Legacy files: informational by default, enforced under --strict /
# --require-changed.
# ---------------------------------------------------------------------------


def test_legacy_files_are_informational_by_default(metadata_dir, capsys):
    # Only Anthropic/example.md is documented; OpenAI/ and Google/ examples
    # are legacy but must not fail validation.
    copy_fixture("valid.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir, quiet=False)

    out = capsys.readouterr().out
    assert code == 0
    assert "2 of 3 prompt file(s)" in out
    assert "informational only" in out


def test_strict_fails_when_files_undocumented(metadata_dir, capsys):
    copy_fixture("valid.yaml", metadata_dir, "Anthropic/example.md.yaml")

    code = run_validator(metadata_dir, strict=True)

    out = capsys.readouterr().out
    assert code == 1
    assert "required prompt file(s) missing metadata" in out


def test_strict_passes_when_fully_documented(temp_repo, metadata_dir, capsys):
    for rel in ["Anthropic/example.md", "OpenAI/example.md", "Google/example.md"]:
        sidecar = metadata_dir / f"{rel}.yaml"
        sidecar.parent.mkdir(parents=True, exist_ok=True)
        sidecar.write_text(
            "provider: test\nproduct: test\nsource_type: official\nconfidence: high\n",
            encoding="utf-8",
        )

    code = run_validator(metadata_dir, strict=True)

    assert code == 0


def test_require_changed_flags_only_changed_undocumented_files(
    temp_repo, metadata_dir, capsys
):
    copy_fixture("valid.yaml", metadata_dir, "Anthropic/example.md.yaml")

    # Modify an undocumented prompt file without committing -- `git diff`
    # against HEAD will see it as changed.
    (temp_repo / "OpenAI" / "example.md").write_text("changed\n", encoding="utf-8")

    code = run_validator(metadata_dir, require_changed="HEAD", quiet=True)

    out = capsys.readouterr().out
    assert code == 1
    assert "OpenAI/example.md" in out
    # Google/example.md is also undocumented but untouched -- must not be
    # enforced.
    assert "Google/example.md" not in out


def test_require_changed_passes_when_changed_file_is_documented(
    temp_repo, metadata_dir, capsys
):
    copy_fixture("valid.yaml", metadata_dir, "Anthropic/example.md.yaml")
    (temp_repo / "Anthropic" / "example.md").write_text("changed\n", encoding="utf-8")

    code = run_validator(metadata_dir, require_changed="HEAD", quiet=True)

    assert code == 0


def test_require_changed_bad_ref_reports_clean_error(metadata_dir, capsys):
    code = run_validator(metadata_dir, require_changed="not-a-real-ref")

    err = capsys.readouterr().err
    assert code == 2
    assert "not-a-real-ref" in err


def test_strict_and_require_changed_are_mutually_exclusive(capsys):
    with pytest.raises(SystemExit) as excinfo:
        vm.main(["--strict", "--require-changed", "HEAD"])

    assert excinfo.value.code == 2
    assert "mutually exclusive" in capsys.readouterr().err


# ---------------------------------------------------------------------------
# Small unit tests for helper functions.
# ---------------------------------------------------------------------------


def test_stringify_dates_converts_nested_date_objects():
    value = {
        "captured_at": datetime.date(2026, 1, 1),
        "nested": {"a": [datetime.date(2025, 12, 31), "keep-me"]},
        "unchanged": "already-a-string",
    }

    result = vm.stringify_dates(value)

    assert result == {
        "captured_at": "2026-01-01",
        "nested": {"a": ["2025-12-31", "keep-me"]},
        "unchanged": "already-a-string",
    }


def test_display_path_falls_back_outside_repo_root(tmp_path, monkeypatch):
    monkeypatch.setattr(vm, "REPO_ROOT", tmp_path / "somewhere")
    outside = tmp_path / "elsewhere" / "file.yaml"

    assert vm.display_path(outside) == str(outside)
