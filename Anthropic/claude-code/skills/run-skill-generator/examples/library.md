# Example: Library / SDK

Libraries don't have a "run" step in the process sense — there's no
server to start, no CLI to invoke. For libraries, the run skill is about:

1. **Building** the library from source
2. **Running the test suite**
3. **A minimal working example** that exercises the library and proves
   it's installed correctly

Keep it brief. The template's Build and Test sections do most of the work.

## The smoke-test example

The main library-specific addition is a tiny program (or REPL snippet)
that imports the library and does one real thing. This is how an agent
confirms "yes, the library is usable":

> ## Verify
>
> ```bash
> python -c '
> from mylib import Client
> c = Client()
> print(c.ping())
> '
> # → pong
> ```

Or for a compiled language:

> ```bash
> cat > /tmp/smoke.go <<GO
> package main
> import "example.com/mylib"
> func main() { println(mylib.Version()) }
> GO
> go run /tmp/smoke.go
> # → v1.2.3
> ```

## Example snippet

> ---
> name: run-mylib
> description: Build, install, and test mylib from source. Use when asked to verify mylib works, run its tests, or build a distribution.
> ---
>
> `mylib` is a Python library — "running" it means building from source
> and executing the test suite.
>
> ## Setup
>
> ```bash
> pip install -e '.[dev]'
> ```
>
> ## Verify
>
> ```bash
> python -c 'import mylib; print(mylib.__version__)'
> # → 2.1.0
> ```
>
> ## Test
>
> ```bash
> pytest
> ```
>
> Subset of tests: `pytest tests/unit/`. With coverage: `pytest --cov=mylib`.
>
> ## Build (distribution)
>
> ```bash
> pip install build
> python -m build
> # → dist/mylib-2.1.0-py3-none-any.whl
> ```

## Things to consider documenting

- **Development mode vs installed mode.** `pip install -e .` vs
  `pip install .` — if behavior differs, say which to use for what.
- **Optional dependencies.** `[dev]`, `[test]`, `[docs]` extras and when
  each is needed.
- **Generated code.** If there's a codegen step (protobuf, OpenAPI clients),
  document it — it's almost always missing from READMEs.
