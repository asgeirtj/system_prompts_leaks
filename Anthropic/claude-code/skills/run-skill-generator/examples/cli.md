# Example: CLI tool

CLIs are the simplest case — there's usually no background process to
manage, no ports, no lifecycle. The skill focuses on **installation**,
**representative invocations**, and **testing**.

## What matters

- **How to get the binary on `PATH`.** Installed globally? Run via
  `npx`/`uv run`? Built to `./target/release/foo`? Be explicit.
- **Two or three example invocations** that cover the main use cases.
  Include expected output so a reader can tell it worked.
- **Exit codes** if they're meaningful (e.g. linter returns 1 on findings).
- **Stdin behavior** if the tool reads from stdin.

## Example snippet

> ---
> name: run-mytool
> description: Build, install, and run mytool. Use when asked to run mytool, test it, or verify it's installed correctly.
> ---
>
> ## Setup
>
> ```bash
> pip install -e .
> ```
>
> This puts `mytool` on PATH. Verify:
>
> ```bash
> mytool --version
> # → mytool 0.3.1
> ```
>
> ## Run
>
> Process a single file:
>
> ```bash
> mytool process input.json
> # → Processed 42 records, wrote output.json
> ```
>
> Read from stdin, write to stdout:
>
> ```bash
> cat input.json | mytool process -
> ```
>
> Lint a directory (exits non-zero on problems):
>
> ```bash
> mytool lint ./src
> echo $?  # 0 if clean, 1 if issues found
> ```
>
> ## Test
>
> ```bash
> pytest
> ```

## Keep it short

A CLI's run skill can be very compact. Don't pad it with every flag —
the `--help` output covers that. Just show enough that an agent can
(a) build it, (b) confirm it works, (c) run the tests.
