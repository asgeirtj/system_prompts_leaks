"""The machine directory: who the fleet is.

With Herdr present, `herdr machine list --json` is authoritative and
`~/.config/muse/machines.toml` supplements it with the machines Herdr does
not know (tmux-only boxes). Without Herdr the file is the only source.
`connect <ssh-target> [--label]` writes it; `forget <machine>` removes a row.

File shape (one `[[machine]]` table per row; every value a string):

    [[machine]]
    label = "buildbox"
    target = "me@buildbox"
    provider = "tmux"            # herdr | tmux | none — what `connect` verified
    control_path = "/tmp/fleet-manager-1000/cm-buildbox"   # the ssh master this skill opened
    session = "default"          # the remote Herdr session when provider = herdr
    added = "2026-09-19T03:00:00Z"
    verified = "2026-09-19T03:00:20Z"

Reading uses `tomllib` when Python has it (3.11+), else the flat-shape reader
below; writing is the tiny serializer below (flat string tables only), so
the file stays hand-editable. A directory row whose
label or target Herdr also saves is `shadowed`: Herdr's row wins and the
duplicate is reported, never listed twice.
"""

from __future__ import annotations

import os
import re
import tempfile

try:
    import tomllib
except ModuleNotFoundError:   # Python < 3.11: stock macOS CLT, Ubuntu 22.04
    tomllib = None

from fleet_contract import Usage, iso

FIELDS = ("label", "target", "provider", "control_path", "session", "added", "verified", "note")


def directory_path() -> str:
    configured = os.environ.get("FLEET_MANAGER_MACHINES")
    if configured:
        return configured
    base = os.environ.get("XDG_CONFIG_HOME") or os.path.expanduser("~/.config")
    return os.path.join(base, "muse", "machines.toml")


_UNESCAPE = {"\\\\": "\\", '\\"': '"', "\\n": "\n", "\\t": "\t"}


def _quoted(raw: str, where: str) -> tuple[str, str]:
    """Split `raw` (starting at a quote) into the closing-quote-inclusive literal and the rest of the
    line, honouring `\\"` and `\\\\` inside the double-quoted form — so a trailing `# comment` after
    a value parses the way tomllib parses it instead of failing the whole file."""
    quote = raw[0]
    i = 1
    while i < len(raw):
        if raw[i] == quote:
            return raw[: i + 1], raw[i + 1:]
        i += 2 if quote == '"' and raw[i] == "\\" else 1
    raise ValueError(f"{where}: expected a quoted string")


def _unquote(raw: str, where: str) -> str:
    if len(raw) < 2 or raw[0] != raw[-1] or raw[0] not in "\"'":
        raise ValueError(f"{where}: expected a quoted string")
    body = raw[1:-1]
    if raw[0] == "'":
        return body
    return re.sub(r'\\(\\|"|n|t)', lambda m: _UNESCAPE["\\" + m.group(1)], body)


def parse_flat_toml(text: str) -> dict:
    """The subset `save_directory` writes: comments, `[[machine]]` headers, and
    `key = "string"` lines (bare true/false/integers are accepted as strings).
    Anything else is a ValueError, the same refusal tomllib would give."""
    data: dict = {}
    current: dict | None = None
    for number, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        where = f"line {number}"
        if line.startswith("[[") and line.endswith("]]"):
            current = {}
            data.setdefault(line[2:-2].strip(), []).append(current)
            continue
        if line.startswith("["):
            raise ValueError(f"{where}: only [[table]] arrays are supported")
        key, sep, value = line.partition("=")
        key, value = key.strip(), value.strip()
        if not sep or not re.fullmatch(r"[A-Za-z0-9_-]+", key):
            raise ValueError(f"{where}: expected key = value")
        if value.startswith(("\"", "'")):
            literal, rest = _quoted(value, where)
            if rest.strip() and not rest.strip().startswith("#"):
                raise ValueError(f"{where}: unexpected text after the string: {rest.strip()!r}")
            parsed = _unquote(literal, where)
        elif re.fullmatch(r"true|false|-?\d+", value):
            parsed = value
        else:
            raise ValueError(f"{where}: unsupported value {value!r}")
        (current if current is not None else data)[key] = parsed
    return data


def _read_directory(path: str) -> dict:
    with open(path, "rb") as handle:
        if tomllib is not None:
            return tomllib.load(handle)
        return parse_flat_toml(handle.read().decode("utf-8"))


def load_directory(path: str | None = None) -> list[dict]:
    path = path or directory_path()
    try:
        data = _read_directory(path)
    except FileNotFoundError:
        return []
    except (OSError, ValueError, UnicodeDecodeError) as exc:   # tomllib.TOMLDecodeError is a ValueError
        raise Usage(f"{path}: cannot read the machine directory ({exc})", next=f"fix or move {path}, then rerun")
    rows = []
    for raw in data.get("machine") or []:
        if not isinstance(raw, dict) or not raw.get("label") or not raw.get("target"):
            continue
        row = {key: str(raw.get(key, "")) for key in FIELDS}
        row["provider"] = row["provider"] or "tmux"
        row["session"] = row["session"] or "default"
        rows.append(row)
    return rows


def _toml_string(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + '"'


def save_directory(rows: list[dict], path: str | None = None) -> str:
    path = path or directory_path()
    os.makedirs(os.path.dirname(path), mode=0o700, exist_ok=True)
    lines = ["# fleet-manager machine directory: tmux-only machines and connections this skill made.",
             "# With Herdr installed, `herdr machine list` is the primary list; this file supplements it.", ""]
    for row in rows:
        lines.append("[[machine]]")
        for key in FIELDS:
            value = row.get(key)
            if value:
                lines.append(f"{key} = {_toml_string(str(value))}")
        lines.append("")
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), prefix=".machines-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write("\n".join(lines))
        os.chmod(tmp, 0o600)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise
    return path


def check_label(label: str) -> str:
    """A machine label names a directory under home/ and a Herdr row: dots-only, `/` or empty is refused before any path runs."""
    if not label or not label.strip(".") or "/" in label:
        raise Usage(f"{label!r} is not a usable machine label (it would name a directory)", next="connect <ssh-target> --label <a plain name>", ref=label)
    return label


def upsert(label: str, target: str, **fields) -> dict:
    """Write or update one directory row; returns the row as saved."""
    check_label(label)
    rows = load_directory()
    row = next((r for r in rows if r["label"] == label), None)
    if row is None:
        row = {"label": label, "target": target, "provider": fields.pop("provider", "") or "tmux", "added": iso()}
        rows.append(row)
    row["target"] = target
    for key, value in fields.items():
        if key in FIELDS and value is not None:
            row[key] = str(value)
    save_directory(rows)
    return row


def remove(label: str) -> bool:
    rows = load_directory()
    kept = [r for r in rows if r["label"] != label]
    if len(kept) == len(rows):
        return False
    save_directory(kept)
    return True


def merged(herdr_rows: list[dict] | None, directory_rows: list[dict] | None = None) -> list[dict]:
    """One machine list. `herdr_rows` is None when Herdr is absent (then the
    directory is the only source). Every row carries `source` (`herdr` |
    `directory`), `provider`, and `shadowed` (a directory row Herdr also saves)."""
    directory_rows = load_directory() if directory_rows is None else directory_rows
    out: list[dict] = []
    seen_labels: set[str] = set()
    seen_targets: set[str] = set()
    for machine in herdr_rows or []:
        row = dict(machine)
        row.setdefault("provider", "herdr")
        row["source"] = "herdr"
        row["shadowed"] = False
        out.append(row)
        seen_labels.add(row.get("label", ""))
        seen_targets.add(row.get("target", ""))
    for entry in directory_rows:
        row = dict(entry)
        row["id"] = row["label"]
        row["enabled"] = True
        row["source"] = "directory"
        row["shadowed"] = herdr_rows is not None and (row["label"] in seen_labels or row["target"] in seen_targets)
        if row["shadowed"]:
            row["note"] = "also saved in Herdr; Herdr's row is used"
        out.append(row)
    return out


def active(rows: list[dict]) -> list[dict]:
    return [r for r in rows if not r.get("shadowed")]


def label_for_target(target: str) -> str:
    """`me@buildbox.example` -> `buildbox`: the default label `connect` gives a machine."""
    host = target.rsplit("@", 1)[-1]
    host = host.split(":", 1)[0]
    return host.split(".", 1)[0] or host
