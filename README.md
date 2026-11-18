# tagent

This project uses Bun 1.4 and [Effect](https://effect.website) 4.

## Commands

```bash
bun install
bun start [flags]   # run packages/cli/src/main.ts
bun dev             # run and start again after each change
bun run build       # build the binary dist/tagent
bun test            # run the tests (bun:test)
bun run typecheck   # run bun check on all packages
bun run lint        # run oxlint
bun run lint:ste    # examine the docs with ste-lint
bun run format      # format all files with Prettier
bun run check       # run lint, lint:ste, the format check, typecheck, and the tests
```

## Usage

```
tagent [flags] [<prompt>]
```

| Invocation            | Result                                                                            |
| --------------------- | --------------------------------------------------------------------------------- |
| `tagent`              | Starts the line REPL with a new session.                                          |
| `tagent <prompt>`     | Starts the line REPL. The prompt is the first input.                              |
| `-p`, `--print`       | Runs the prompt in the mode without an interface. This flag needs a prompt.       |
| `-c`, `--continue`    | Continues the latest stored session.                                              |
| `-r`, `--resume <id>` | Continues the stored session that has this id.                                    |
| `--allow-all`         | Lets all tool calls run before the start. This flag is valid only with `--print`. |
| `--help`              | Shows the help.                                                                   |
| `--version`           | Shows the version. The version comes from `packages/cli/package.json`.            |

Do not use `--continue` and `--resume` together.

The agent core does not exist at this time. Thus a valid invocation writes a message to stderr and stops with exit code 1.

## Lint rules

`.oxlintrc.json` contains the lint rules. Some rules do checks on the architecture, for example the rule that does not permit provider packages. `tools/oxlint/anti-slop/` contains a copy of the [anti-slop](https://github.com/dmmulroy/anti-slop) plugins for oxlint. `tools/oxlint/anti-slop/UPSTREAM.md` records the source commit.

`ste-lint` examines the Markdown docs. It finds text that does not agree with ASD-STE100 (Simplified Technical English). `ste.config.json` contains its configuration and the technical verbs of this project. The tool is an approximation of the standard, thus a text with no findings can contain errors.

## Git hooks

This repo uses [lefthook](https://lefthook.dev). `bun install` installs the hooks. Before each commit, the `pre-commit` hook runs `bun run lint`, `bun run lint:ste`, `bun run format:check`, `bun run typecheck`, and `bun run test`. If one of them fails, Git does not make the commit.

## CI

`.github/workflows/ci.yml` contains the CI workflow. GitHub Actions runs it for each pull request and for each push to `main`. The workflow has one job, `ci`, that does these steps:

1. It installs the Bun version that the `packageManager` field of `package.json` gives.
2. It runs `bun install --frozen-lockfile`.
3. It runs `bun run check`.
4. It runs `bun run build`.
5. It runs `./dist/tagent --version`.

If one of the steps fails, the job fails. The last two steps find a binary that does not build or does not start. The tests do not use the binary.

## Binary

`bun run build` writes one executable file to `dist/tagent`. The file contains the Bun runtime. The binary does not read `.env` or `bunfig.toml` from the directory where you run it.

To run `tagent` from all directories, make a link in a directory that is in your `PATH`:

```bash
ln -s "$PWD/dist/tagent" ~/.local/bin/tagent
```

Run `bun run build` again after each change to the source. The link stays correct.

## Structure

This repo is a Bun workspace with two packages:

- `packages/core` (`@tagent/core`): the agent core. `src/index.ts` is the public contract. It exports nothing at this time.
- `packages/cli` (`@tagent/cli`): the command-line interface. `src/main.ts` is the entry point. It defines the `tagent` command with `effect/cli` and starts through `BunRuntime.runMain`. `src/invocation.ts` changes the flags into one typed model of the invocation. `test/` contains the tests.

`tsconfig.base.json` contains the compiler options that the packages share.
