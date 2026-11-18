import { Data, Option, Result, Schema } from "effect"
import { CliError } from "effect/cli"

export type SessionStart = Data.TaggedEnum<{
  New: {}
  Latest: {}
  Stored: { readonly id: string }
}>

export const SessionStart = Data.taggedEnum<SessionStart>()

export type Mode = Data.TaggedEnum<{
  Repl: { readonly firstInput: Option.Option<string> }
  Print: { readonly prompt: string; readonly allowAll: boolean }
}>

export const Mode = Data.taggedEnum<Mode>()

export interface Invocation {
  readonly session: SessionStart
  readonly mode: Mode
}

export interface Flags {
  readonly prompt: Option.Option<string>
  readonly print: boolean
  readonly continue: boolean
  readonly resume: Option.Option<string>
  readonly allowAll: boolean
}

export class InvalidInvocation extends Schema.TaggedError<InvalidInvocation>()("InvalidInvocation", {
  message: Schema.String
}) {
  override get [CliError.userMessage]() {
    return this.message
  }
}

const reject = (message: string) => Result.fail(new InvalidInvocation({ message }))

export const invocationFromFlags = (flags: Flags): Result.Result<Invocation, InvalidInvocation> => {
  if (flags.continue && Option.isSome(flags.resume)) {
    return reject("--continue and --resume cannot be used together. Use only one of them.")
  }

  if (flags.allowAll && !flags.print) {
    return reject("--allow-all is valid only with --print.")
  }

  if (flags.print && Option.isNone(flags.prompt)) {
    return reject("--print needs a prompt. Give the prompt as an argument.")
  }

  const session = Option.match(flags.resume, {
    onNone: () => (flags.continue ? SessionStart.Latest() : SessionStart.New()),
    onSome: (id) => SessionStart.Stored({ id })
  })

  const mode = Option.match(flags.prompt, {
    onNone: () => Mode.Repl({ firstInput: Option.none() }),
    onSome: (prompt) =>
      flags.print ? Mode.Print({ prompt, allowAll: flags.allowAll }) : Mode.Repl({ firstInput: Option.some(prompt) })
  })

  return Result.succeed({ session, mode })
}
