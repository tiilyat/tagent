import { BunRuntime, BunServices } from "@effect/platform-bun"
import { Effect, Schema } from "effect"
import { Argument, CliError, Command, Flag } from "effect/cli"
import { invocationFromFlags, Mode } from "./invocation.ts"
import packageJson from "../package.json" with { type: "json" }

class AgentNotAvailable extends Schema.TaggedError<AgentNotAvailable>()("AgentNotAvailable", {}) {
  override get [CliError.userMessage]() {
    return "The agent is not available in this version of tagent."
  }
}

const tagent = Command.make(
  "tagent",
  {
    prompt: Argument.String("prompt").pipe(
      Argument.withDescription("The first input of the session"),
      Argument.optional
    ),
    print: Flag.Boolean("print").pipe(
      Flag.withAlias("p"),
      Flag.withDescription("Run the prompt without an interface, print the answer, and stop"),
      Flag.withDefault(false)
    ),
    continue: Flag.Boolean("continue").pipe(
      Flag.withAlias("c"),
      Flag.withDescription("Continue the latest stored session"),
      Flag.withDefault(false)
    ),
    resume: Flag.String("resume").pipe(
      Flag.withAlias("r"),
      Flag.withMetavar("id"),
      Flag.withDescription("Continue the stored session that has this id"),
      Flag.optional
    ),
    allowAll: Flag.Boolean("allow-all").pipe(
      Flag.withDescription("Allow all tool calls before the start. Valid only with --print"),
      Flag.withDefault(false)
    )
  },
  Effect.fn(function* (flags) {
    const invocation = yield* Effect.fromResult(invocationFromFlags(flags))

    return yield* Mode.$match(invocation.mode, {
      Repl: () => new AgentNotAvailable(),
      Print: () => new AgentNotAvailable()
    })
  })
).pipe(Command.withDescription("A coding agent for the terminal"))

tagent.pipe(Command.run({ version: packageJson.version }), Effect.provide(BunServices.layer), BunRuntime.runMain)
