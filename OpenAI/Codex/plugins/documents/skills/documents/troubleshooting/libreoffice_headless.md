# Troubleshooting: LibreOffice headless rendering

## Symptom: `soffice` hangs, times out, or errors in a container
This is commonly caused by LibreOffice failing to create/lock its user profile, or attempting to write config/cache under a non-writable `HOME`.

## Fix (recommended): use the packaged renderer script
Use the canonical helper (`render_docx.py`). It:
- creates a unique per-run LibreOffice profile
- forces a writable `HOME` / XDG dirs under that profile
- captures stdout/stderr so failures are diagnosable

```bash
python render_docx.py /mnt/data/input.docx --output_dir /mnt/data/out
# If you're debugging a conversion failure:
python render_docx.py /mnt/data/input.docx --output_dir /mnt/data/out --verbose
```

## Fix (manual): profile + writable HOME
If you must run `soffice` directly, do this:

```bash
OUTDIR=/mnt/data/out
INPUT=/mnt/data/input.docx
BASENAME=$(basename "$INPUT" .docx)
LO_PROFILE=/mnt/data/.lo_profile_${BASENAME}_$$
mkdir -p "$OUTDIR" "$LO_PROFILE"

HOME="$LO_PROFILE" soffice --headless -env:UserInstallation=file://"$LO_PROFILE" \
  --convert-to pdf --outdir "$OUTDIR" "$INPUT"
```

## About scary stderr on "successful" conversions
LibreOffice sometimes prints scary-looking messages (notably `error : Unknown IO error`) even when the output PDF is correct.

Prefer these success criteria over stderr:
- command completes
- downstream PNGs exist and look correct

## If you still get weird behavior
- Ensure the profile directory is unique per process (use `$$` or a uuid)
- Delete stale profiles between runs
- Prefer `/mnt/data` over `/tmp` if you suspect permission sandboxing
