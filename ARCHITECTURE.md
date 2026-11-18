# ARCHITECTURE.md

This file is the top-level map of the system. Keep this file short. Refer to other documents for the details.

This file records only the decisions that are final. The sections with the mark "Not decided" are open, and thus the direction can change.

## System Shape

- Product: `tagent` is a coding-agent harness.
- Primary user workflow:
  1. The user gives a task in the terminal.
  2. The agent calls a model.
  3. The agent runs tools (file read, file edit, shell, search). Before it runs a tool that has a risk, it asks the user for permission.
  4. The agent does steps 2 and 3 again until the task is complete.
- Runtime surfaces: CLI, one local Bun process. The entry point is `packages/cli/src/main.ts`. It starts through `BunRuntime.runMain`.
- Repo layout: a Bun workspace with two packages, `packages/core` and `packages/cli`. Each package gives its TypeScript source to the other packages directly. There is no build step.
- Stack: Bun and Effect v4 (`effect`, `@effect/platform-bun`). Refer to `docs/agents/effect.md`.
- Source of truth for product behavior: Not decided.

### Out of scope for the first version

- A user cannot detach from a session that is in operation.
- More than one client cannot attach to one session.
- There is no daemon and no server process.
- There are no subagents.
- There is no full-screen terminal UI. The first interface is a line REPL and a mode without an interface.
- There is no context compaction. If the context is too long for the model, the turn ends with a failure.

## Domain Map

| Package        | Purpose                                             | Primary Entry Points         |
| -------------- | --------------------------------------------------- | ---------------------------- |
| `@tagent/core` | The agent core.                                     | `packages/core/src/index.ts` |
| `@tagent/cli`  | The command-line interface. This package is the UI. | `packages/cli/src/main.ts`   |

### Planned packages

The full-screen terminal UI will be a separate package, `@tagent/tui`. Do not write the terminal UI in `@tagent/cli`. Make the package when the work on the terminal UI starts.

- `@tagent/tui` will contain the screen output and the keyboard input of the terminal UI. It will depend only on `@tagent/core`.
- `@tagent/cli` stays the entry point. It reads the arguments, builds the dependencies, and contains the line REPL and the mode without an interface. It will depend on `@tagent/tui` and `@tagent/core`.

## Core Model

This section gives a summary of the design of `@tagent/core`. The ADRs in `docs/adr/` give the details and the reasons.

- **Public contract.** `Agent` opens sessions. `Session` has three operations: `submit`, `answer`, and `history`. `submit` returns the stream of events of one turn. To stop a turn, the UI interrupts the reader of the stream. Refer to ADR 0002.
- **Session log.** The session log is the source of truth of a session. The core adds one entry to a JSONL file when each fact occurs. All other state comes from the log through pure functions. Refer to ADR 0001.
- **Turn loop.** A turn is an ordinary loop: call the model, run the tool calls, call the model again. There is no limit on the number of steps. Refer to ADR 0002.
- **Tools.** The core runs the tools itself and does not use the tool execution of `effect/ai`. A tool failure is a result that the model reads. Refer to ADR 0003.
- **Permissions.** A tool declares what a call touches. One pure function contains the permission rules. The UI answers each permission request. Refer to ADR 0004.
- **System prompt.** The core reads `AGENTS.md` in the root of the workspace when it opens a session and puts the text in the system prompt. It reads no other instruction file.
- **Settings.** The core reads its settings through Effect `Config`. The CLI supplies the source of the settings. The core does not read `.env` files or the environment directly.

## Layer Model

The areas of `packages/core/src` and the permitted direction of imports:

`index -> Agent -> Session -> turn -> log, permission, tools`

- `index` contains only the public contract.
- `Agent` builds the dependencies and opens sessions. Only `Agent` imports a provider adapter from `providers`.
- `Session` owns one session log and runs one turn at a time.
- `turn` contains the turn loop and the model call.
- `log` contains the entry types, the pure functions on the log, and the session files.
- `permission` contains the permission rules.
- `tools` contains the tool definitions and the workspace.
- `providers` contains one directory for each provider adapter. An adapter has three parts. A schema of the provider format accepts missing optional fields. Pure functions translate requests and stream events. One layer does the HTTP calls.

An area must not import an area that is to its left.

This file does not give a list of the files in each area. Obey these rules when you add a file:

- One file contains one concept. Each tool has its own file. Each provider adapter has its own directory.
- Keep pure functions and code with side effects in different files.
- If a file exports one service or type with the same name, start its name with an uppercase letter. An example is `Agent.ts`. Start all other file names with a lowercase letter.
- The tests have the same structure as `src`. The recordings of provider answers are in `test/fixtures/`.

## Hard Dependency Rules

- The UI must not use the internal parts of the agent core. The UI uses only the public contract of the core. The `exports` field in `packages/core/package.json` is the public contract. `bun run check` fails if `@tagent/cli` imports a file that `exports` does not list.
- `@tagent/core` must not depend on `@tagent/cli`.
- `@tagent/tui` must not depend on `@tagent/cli`. `@tagent/core` must not depend on `@tagent/tui`.
- Access each external resource through an Effect service that a `Layer` supplies. External resources are the model, the file system, the child processes, and the clock.
- Shared utilities must stay generic. Do not add domain logic to them.
- This project contains the code of the agent loop. Do not use a library that controls the loop or runs the tools.
- The harness is not tied to one provider. The core uses a model only through the `LanguageModel` service. One adapter for each provider API supplies this service.
- This project contains the code of each provider adapter. It sends the HTTP request and reads the event stream of the provider API directly. Do not use a provider package, for example `@effect/ai-anthropic`. This rule is an exception to the rule in `CLAUDE.md` that prefers established libraries.
- The code outside an adapter must not depend on the data format of one provider API.
- Tool calls use the native tool-use mechanism of the provider API. Do not get tool calls from the text of the model.

## Cross-Cutting Interfaces

| Concern             | Approved Boundary                 | Notes                                                                                                                                                                                                                                         |
| ------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model access        | `LanguageModel` from `effect/ai`  | The provider adapters supply this service. The types for models, tools, and prompts come from `effect/ai`.                                                                                                                                    |
| Provider adapters   | One adapter for each provider API | The first adapter is for the Anthropic Messages API. The endpoint address, the API key, and the model name are configuration.                                                                                                                 |
| Logging and tracing | Not decided                       |                                                                                                                                                                                                                                               |
| Session storage     | The `log` area of the core        | One append-only JSONL file for each session. The files are in `~/.tagent/sessions/`, in one directory for each workspace. A file name starts with the start time of the session. A setting can give a different directory. Refer to ADR 0001. |
| Permissions         | The `permission` area of the core | One pure function contains the rules. Refer to ADR 0004.                                                                                                                                                                                      |
| Settings            | Effect `Config`                   | The CLI supplies the source.                                                                                                                                                                                                                  |

## Open Decisions

No decisions are open at this time.

When you make a decision, record it in `docs/adr/`. Then update this file.

## Current Hot Spots

No hot spots are recorded at this time.

## Change Checklist

When you change code that is related to the architecture, do these steps:

1. If the domain map or the permitted boundaries changed, update this file.
2. If the reasons for a decision changed, add or update the related ADR in `docs/adr/`.
3. If a check can enforce a rule automatically, add or update an executable check. `bun run check` must pass.
