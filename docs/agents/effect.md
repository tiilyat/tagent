# Effect

This project uses Effect v4 (`effect`, `@effect/platform-bun`).

## Before you write Effect code

1. Read `node_modules/effect/CLAUDE.md`.
2. Read the examples in `node_modules/effect/ai-docs/` that this file refers to.

## Differences from Effect v3

Do not use Effect v3 APIs from memory. Effect v4 has these differences:

- Effect v4 uses `Context.Service`, `Schema.TaggedError`, and `Effect.fn`.
- Many packages that were `@effect/*` are top-level subpaths of `effect`. Examples are `effect/ai`, `effect/cli`, `effect/rpc`, and `effect/sql`.
- `effect/unstable/*` does not exist.

## Project facts

- The entry point is `packages/cli/src/main.ts`. It starts through `BunRuntime.runMain`.
- To make sure that your changes are correct, run `bun run check`. This command runs the lint checks, the format check, the type check, and the tests.
