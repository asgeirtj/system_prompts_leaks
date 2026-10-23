#!/usr/bin/env python3
"""
Aggregate individual run results into benchmark summary statistics.

Reads grading.json files from run directories and produces:
- run_summary with mean, stddev, min, max for each metric
- delta between with_skill and without_skill configurations

Usage:
    python aggregate_benchmark.py <benchmark_dir>

Example:
    python aggregate_benchmark.py benchmarks/2026-01-15T10-30-00/

The script supports these directory layouts. A test case folder can have any
name (eval-0, quarterly-report, ...).

    Workspace layout (from skill-creator iterations), one run per configuration:
    <benchmark_dir>/
    └── eval-N/
        ├── eval_metadata.json
        ├── with_skill/grading.json
        └── without_skill/grading.json

    The same with several runs per configuration:
    <benchmark_dir>/
    └── eval-N/
        ├── eval_metadata.json
        ├── with_skill/
        │   ├── run-1/grading.json
        │   └── run-2/grading.json
        └── without_skill/
            ├── run-1/grading.json
            └── run-2/grading.json

    Legacy layout (with runs/ subdirectory):
    <benchmark_dir>/
    └── runs/
        └── eval-N/
            ├── with_skill/
            │   └── run-1/grading.json
            └── without_skill/
                └── run-1/grading.json
"""

import argparse
import json
import math
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

# The skill under test, and the configurations it is compared against
PRIMARY_CONFIGS = {"with_skill", "new_skill"}
BASELINE_CONFIGS = {"without_skill", "old_skill"}

# Folders that are not taken for a configuration with a single run (the review page skips them too)
NOT_CONFIGS = {"node_modules", ".git", "__pycache__", "skill", "inputs"}


def calculate_stats(values: list[float]) -> dict:
    """Calculate mean, stddev, min, max for a list of values."""
    if not values:
        return {"mean": 0.0, "stddev": 0.0, "min": 0.0, "max": 0.0}

    n = len(values)
    mean = sum(values) / n

    if n > 1:
        variance = sum((x - mean) ** 2 for x in values) / (n - 1)
        stddev = math.sqrt(variance)
    else:
        stddev = 0.0

    return {
        "mean": round(mean, 4),
        "stddev": round(stddev, 4),
        "min": round(min(values), 4),
        "max": round(max(values), 4)
    }


def read_json_object(path: Path) -> dict:
    """Return the JSON object in a file, or {} when it is missing, unreadable or holds anything else."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    return data if isinstance(data, dict) else {}


def find_run_dirs(config_dir: Path) -> list[tuple[int, Path]]:
    """
    List the runs of one configuration as (run_number, folder) pairs.

    The runs are config_dir/run-1/, run-2/, ... When there are no run-* folders,
    config_dir itself is run 1. Empty when the folder holds no run at all
    (inputs/, for example).
    """
    run_dirs = sorted(d for d in config_dir.glob("run-*") if d.is_dir())
    if not run_dirs:
        holds_a_run = (config_dir / "grading.json").exists() or (config_dir / "outputs").is_dir()
        return [(1, config_dir)] if holds_a_run and config_dir.name not in NOT_CONFIGS else []

    numbered = []
    for position, run_dir in enumerate(run_dirs, start=1):
        try:
            numbered.append((int(run_dir.name.split("-")[1]), run_dir))
        except ValueError:
            numbered.append((position, run_dir))
    return numbered


def find_eval_dirs(search_dir: Path) -> list[Path]:
    """
    List test case folders: eval-* first, then folders with any other name.

    A folder with another name counts when it holds an eval_metadata.json or a graded run.
    """
    def is_test_case(folder: Path) -> bool:
        return (folder / "eval_metadata.json").exists() or any(
            (run_dir / "grading.json").exists()
            for config_dir in folder.iterdir() if config_dir.is_dir()
            for _, run_dir in find_run_dirs(config_dir)
        )

    numbered = sorted(d for d in search_dir.glob("eval-*") if d.is_dir())
    named = sorted(
        d for d in search_dir.iterdir()
        if d.is_dir() and d not in numbered and is_test_case(d)
    )
    return numbered + named


def load_run_results(benchmark_dir: Path) -> dict:
    """
    Load all run results from a benchmark directory.

    Returns dict keyed by config name (e.g. "with_skill"/"without_skill",
    or "new_skill"/"old_skill"), each containing a list of run results.
    The skill under test comes before its baseline.
    """
    # Support both layouts: eval dirs directly under benchmark_dir, or under runs/
    runs_dir = benchmark_dir / "runs"
    search_dir = runs_dir if runs_dir.exists() else benchmark_dir
    eval_dirs = find_eval_dirs(search_dir)
    if not eval_dirs:
        print(f"No eval directories found in {benchmark_dir} or {benchmark_dir / 'runs'}")
        return {}

    results: dict[str, list] = {}
    configs_seen: set[str] = set()

    for eval_idx, eval_dir in enumerate(eval_dirs):
        is_numbered = eval_dir.name.startswith("eval-")
        default_id = eval_idx if is_numbered else eval_dir.name
        eval_id = default_id
        eval_name = None if is_numbered else eval_dir.name

        metadata_path = eval_dir / "eval_metadata.json"
        if metadata_path.exists():
            metadata = read_json_object(metadata_path)
            eval_id = metadata.get("eval_id", default_id)
            eval_name = metadata.get("eval_name") or eval_name
        elif is_numbered:
            try:
                eval_id = int(eval_dir.name.split("-")[1])
            except ValueError:
                pass
        if not isinstance(eval_id, (int, float, str)):
            eval_id = default_id

        # Discover config directories dynamically rather than hardcoding names
        for config_dir in sorted(eval_dir.iterdir()):
            if not config_dir.is_dir():
                continue
            # Skip non-config directories (inputs, outputs, etc.)
            run_dirs = find_run_dirs(config_dir)
            if not run_dirs:
                continue
            config = config_dir.name
            configs_seen.add(config)

            for run_number, run_dir in run_dirs:
                grading_file = run_dir / "grading.json"

                if not grading_file.exists():
                    print(f"Warning: grading.json not found in {run_dir}, so this run is left out")
                    continue

                try:
                    grading = json.loads(grading_file.read_text(encoding="utf-8"))
                    if not isinstance(grading, dict):
                        raise ValueError("it does not hold a JSON object")
                except (OSError, ValueError) as e:
                    print(f"Warning: cannot use {grading_file} ({e}), so this run is left out")
                    continue

                # A field of the wrong type (null, for example) is treated as missing
                for key, kind in (
                    ("summary", dict), ("timing", dict), ("execution_metrics", dict),
                    ("user_notes_summary", dict), ("expectations", list),
                ):
                    if not isinstance(grading.get(key), kind):
                        grading.pop(key, None)

                # Extract metrics
                result = {
                    "eval_id": eval_id,
                    "eval_name": eval_name,
                    "eval_dir": eval_dir.name,
                    "run_number": run_number,
                    "pass_rate": grading.get("summary", {}).get("pass_rate", 0.0),
                    "passed": grading.get("summary", {}).get("passed", 0),
                    "failed": grading.get("summary", {}).get("failed", 0),
                    "total": grading.get("summary", {}).get("total", 0),
                }

                # Extract timing — check grading.json first, then sibling timing.json.
                # Always read timing.json for the tokens: grading.json's copy of the timing has none.
                timing = grading.get("timing", {})
                result["time_seconds"] = timing.get("total_duration_seconds", 0.0)
                timing_data = read_json_object(run_dir / "timing.json")
                if result["time_seconds"] == 0.0:
                    result["time_seconds"] = timing_data.get("total_duration_seconds", 0.0)
                if isinstance(timing_data.get("total_tokens"), (int, float)):
                    result["tokens"] = timing_data["total_tokens"]

                # Extract metrics if available
                metrics = grading.get("execution_metrics", {})
                result["tool_calls"] = metrics.get("total_tool_calls", 0)
                if not result.get("tokens"):
                    result["tokens"] = metrics.get("output_chars", 0)
                result["errors"] = metrics.get("errors_encountered", 0)

                # Extract expectations — viewer requires fields: text, passed, evidence
                raw_expectations = grading.get("expectations", [])
                for exp in raw_expectations:
                    if not isinstance(exp, dict) or "text" not in exp or "passed" not in exp:
                        print(f"Warning: expectation in {grading_file} missing required fields (text, passed, evidence): {exp}")
                result["expectations"] = raw_expectations

                # Extract notes from user_notes_summary
                notes_summary = grading.get("user_notes_summary", {})
                notes = []
                for key in ("uncertainties", "needs_review", "workarounds"):
                    if isinstance(notes_summary.get(key), list):
                        notes.extend(notes_summary[key])
                result["notes"] = notes

                # A configuration exists only once it has a graded run
                results.setdefault(config, []).append(result)

    for config in sorted(configs_seen - results.keys()):
        print(f"Warning: no run of {config} has a readable grading.json, so {config} is left out of the benchmark")

    # The delta is the first configuration minus the second: put with_skill or new_skill
    # first when there is one, then without_skill or old_skill
    baselines = sorted(c for c in results if c in BASELINE_CONFIGS)
    others = sorted((c for c in results if c not in BASELINE_CONFIGS), key=lambda c: (c not in PRIMARY_CONFIGS, c))
    return {c: results[c] for c in others[:1] + baselines + others[1:]}


def aggregate_results(results: dict) -> dict:
    """
    Aggregate run results into summary statistics.

    Returns run_summary with stats for each configuration and delta.
    """
    run_summary = {}
    configs = list(results.keys())

    for config in configs:
        runs = results.get(config, [])

        if not runs:
            run_summary[config] = {
                "pass_rate": {"mean": 0.0, "stddev": 0.0, "min": 0.0, "max": 0.0},
                "time_seconds": {"mean": 0.0, "stddev": 0.0, "min": 0.0, "max": 0.0},
                "tokens": {"mean": 0, "stddev": 0, "min": 0, "max": 0}
            }
            continue

        pass_rates = [r["pass_rate"] for r in runs]
        times = [r["time_seconds"] for r in runs]
        tokens = [r.get("tokens", 0) for r in runs]

        run_summary[config] = {
            "pass_rate": calculate_stats(pass_rates),
            "time_seconds": calculate_stats(times),
            "tokens": calculate_stats(tokens)
        }

    # Calculate delta between the first two configs. With fewer than two there is nothing to compare.
    if len(configs) < 2:
        run_summary["delta"] = {"pass_rate": None, "time_seconds": None, "tokens": None}
        return run_summary

    primary = run_summary.get(configs[0], {})
    baseline = run_summary.get(configs[1], {})

    delta_pass_rate = primary.get("pass_rate", {}).get("mean", 0) - baseline.get("pass_rate", {}).get("mean", 0)
    delta_time = primary.get("time_seconds", {}).get("mean", 0) - baseline.get("time_seconds", {}).get("mean", 0)
    delta_tokens = primary.get("tokens", {}).get("mean", 0) - baseline.get("tokens", {}).get("mean", 0)

    run_summary["delta"] = {
        "pass_rate": f"{delta_pass_rate:+.2f}",
        "time_seconds": f"{delta_time:+.1f}",
        "tokens": f"{delta_tokens:+.0f}"
    }

    return run_summary


def generate_benchmark(benchmark_dir: Path, skill_name: str = "", skill_path: str = "") -> dict:
    """
    Generate complete benchmark.json from run results.
    """
    results = load_run_results(benchmark_dir)
    run_summary = aggregate_results(results)

    # Build runs array for benchmark.json
    runs = []
    for config in results:
        for result in results[config]:
            runs.append({
                "eval_id": result["eval_id"],
                "eval_name": result["eval_name"],
                "configuration": config,
                "run_number": result["run_number"],
                "result": {
                    "pass_rate": result["pass_rate"],
                    "passed": result["passed"],
                    "failed": result["failed"],
                    "total": result["total"],
                    "time_seconds": result["time_seconds"],
                    "tokens": result.get("tokens", 0),
                    "tool_calls": result.get("tool_calls", 0),
                    "errors": result.get("errors", 0)
                },
                "expectations": result["expectations"],
                "notes": result["notes"]
            })

    # Determine eval IDs from results (numbers first: they cannot be compared with names)
    eval_ids = sorted(
        set(r["eval_id"] for r in runs),
        key=lambda eval_id: (isinstance(eval_id, str), eval_id),
    )
    runs_per_eval = Counter(
        (config, result["eval_dir"]) for config in results for result in results[config]
    )

    benchmark = {
        "metadata": {
            "skill_name": skill_name or "<skill-name>",
            "skill_path": skill_path or "<path/to/skill>",
            "executor_model": "<model-name>",
            "analyzer_model": "<model-name>",
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "evals_run": eval_ids,
            "runs_per_configuration": max(runs_per_eval.values(), default=0)
        },
        "runs": runs,
        "run_summary": run_summary,
        "notes": []  # To be filled by analyzer
    }

    return benchmark


def generate_markdown(benchmark: dict) -> str:
    """Generate human-readable benchmark.md from benchmark data."""
    metadata = benchmark["metadata"]
    run_summary = benchmark["run_summary"]

    # Determine config names (excluding "delta")
    configs = [k for k in run_summary if k != "delta"]
    config_a = configs[0] if len(configs) >= 1 else "config_a"
    config_b = configs[1] if len(configs) >= 2 else "config_b"
    label_a = config_a.replace("_", " ").title()
    label_b = config_b.replace("_", " ").title()

    runs_each = metadata["runs_per_configuration"]
    lines = [
        f"# Skill Benchmark: {metadata['skill_name']}",
        "",
        f"**Model**: {metadata['executor_model']}",
        f"**Date**: {metadata['timestamp']}",
        f"**Evals**: {', '.join(map(str, metadata['evals_run']))} ({runs_each} run{'' if runs_each == 1 else 's'} each per configuration)",
        "",
        "## Summary",
        "",
        f"| Metric | {label_a} | {label_b} | Delta |",
        "|--------|------------|---------------|-------|",
    ]

    a_summary = run_summary.get(config_a, {})
    b_summary = run_summary.get(config_b, {})
    delta = run_summary.get("delta", {})

    # Format pass rate
    a_pr = a_summary.get("pass_rate", {})
    b_pr = b_summary.get("pass_rate", {})
    lines.append(f"| Pass Rate | {a_pr.get('mean', 0)*100:.0f}% ± {a_pr.get('stddev', 0)*100:.0f}% | {b_pr.get('mean', 0)*100:.0f}% ± {b_pr.get('stddev', 0)*100:.0f}% | {delta.get('pass_rate', '—')} |")

    # Format time
    a_time = a_summary.get("time_seconds", {})
    b_time = b_summary.get("time_seconds", {})
    lines.append(f"| Time | {a_time.get('mean', 0):.1f}s ± {a_time.get('stddev', 0):.1f}s | {b_time.get('mean', 0):.1f}s ± {b_time.get('stddev', 0):.1f}s | {delta.get('time_seconds', '—')}s |")

    # Format tokens
    a_tokens = a_summary.get("tokens", {})
    b_tokens = b_summary.get("tokens", {})
    lines.append(f"| Tokens | {a_tokens.get('mean', 0):.0f} ± {a_tokens.get('stddev', 0):.0f} | {b_tokens.get('mean', 0):.0f} ± {b_tokens.get('stddev', 0):.0f} | {delta.get('tokens', '—')} |")

    # With a single configuration there is nothing to compare: keep only its column
    if len(configs) < 2:
        lines = ["|".join(line.split("|")[:3]) + "|" if line.startswith("|") else line for line in lines]

    # Notes section
    if benchmark.get("notes"):
        lines.extend([
            "",
            "## Notes",
            ""
        ])
        for note in benchmark["notes"]:
            lines.append(f"- {note}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Aggregate benchmark run results into summary statistics"
    )
    parser.add_argument(
        "benchmark_dir",
        type=Path,
        help="Path to the benchmark directory"
    )
    parser.add_argument(
        "--skill-name",
        default="",
        help="Name of the skill being benchmarked"
    )
    parser.add_argument(
        "--skill-path",
        default="",
        help="Path to the skill being benchmarked"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="Output path for benchmark.json (default: <benchmark_dir>/benchmark.json)"
    )

    args = parser.parse_args()

    if not args.benchmark_dir.exists():
        print(f"Directory not found: {args.benchmark_dir}")
        sys.exit(1)

    # Generate benchmark
    benchmark = generate_benchmark(args.benchmark_dir, args.skill_name, args.skill_path)

    if not benchmark["runs"]:
        print(
            f"Error: no graded runs found in {args.benchmark_dir}, so no benchmark was written. "
            "Each run needs a grading.json at <test case>/<configuration>/grading.json "
            "(for example eval-0/with_skill/grading.json) "
            "or <test case>/<configuration>/run-1/grading.json. "
            "If the runs are graded, check that this is the iteration-N folder and not the workspace above it.",
            file=sys.stderr,
        )
        sys.exit(1)

    # Determine output paths
    output_json = args.output or (args.benchmark_dir / "benchmark.json")
    output_md = output_json.with_suffix(".md")

    # Write benchmark.json
    with open(output_json, "w") as f:
        json.dump(benchmark, f, indent=2)
    print(f"Generated: {output_json}")

    # Write benchmark.md
    markdown = generate_markdown(benchmark)
    with open(output_md, "w") as f:
        f.write(markdown)
    print(f"Generated: {output_md}")

    # Print summary
    run_summary = benchmark["run_summary"]
    configs = [k for k in run_summary if k != "delta"]
    delta = run_summary.get("delta", {})

    print(f"\nSummary:")
    for config in configs:
        pr = run_summary[config]["pass_rate"]["mean"]
        label = config.replace("_", " ").title()
        print(f"  {label}: {pr*100:.1f}% pass rate")
    print(f"  Delta:         {delta.get('pass_rate') or '—'}")


if __name__ == "__main__":
    main()
