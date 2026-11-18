import { describe, expect, test } from "bun:test"
import { Option, Result } from "effect"
import { type Flags, invocationFromFlags, Mode, SessionStart } from "../src/invocation.ts"

const noFlags: Flags = {
  prompt: Option.none(),
  print: false,
  continue: false,
  resume: Option.none(),
  allowAll: false
}

const rejection = (flags: Flags) => Result.getOrThrow(Result.flip(invocationFromFlags(flags))).message

describe("invocationFromFlags", () => {
  test("no flags start a new session in the REPL", () => {
    expect(invocationFromFlags(noFlags)).toEqual(
      Result.succeed({ session: SessionStart.New(), mode: Mode.Repl({ firstInput: Option.none() }) })
    )
  })

  test("a prompt is the first input of the REPL", () => {
    expect(invocationFromFlags({ ...noFlags, prompt: Option.some("fix the bug") })).toEqual(
      Result.succeed({ session: SessionStart.New(), mode: Mode.Repl({ firstInput: Option.some("fix the bug") }) })
    )
  })

  test("--continue starts from the latest stored session", () => {
    expect(invocationFromFlags({ ...noFlags, continue: true })).toEqual(
      Result.succeed({ session: SessionStart.Latest(), mode: Mode.Repl({ firstInput: Option.none() }) })
    )
  })

  test("--resume starts from the stored session with the id", () => {
    expect(invocationFromFlags({ ...noFlags, resume: Option.some("abc") })).toEqual(
      Result.succeed({ session: SessionStart.Stored({ id: "abc" }), mode: Mode.Repl({ firstInput: Option.none() }) })
    )
  })

  test("--print with a prompt is the mode without an interface", () => {
    expect(invocationFromFlags({ ...noFlags, print: true, prompt: Option.some("fix the bug") })).toEqual(
      Result.succeed({ session: SessionStart.New(), mode: Mode.Print({ prompt: "fix the bug", allowAll: false }) })
    )
  })

  test("--print with --allow-all allows all tool calls", () => {
    expect(
      invocationFromFlags({ ...noFlags, print: true, prompt: Option.some("fix the bug"), allowAll: true })
    ).toEqual(
      Result.succeed({ session: SessionStart.New(), mode: Mode.Print({ prompt: "fix the bug", allowAll: true }) })
    )
  })

  test("--print can continue a stored session", () => {
    expect(
      invocationFromFlags({ ...noFlags, print: true, prompt: Option.some("go on"), resume: Option.some("abc") })
    ).toEqual(
      Result.succeed({
        session: SessionStart.Stored({ id: "abc" }),
        mode: Mode.Print({ prompt: "go on", allowAll: false })
      })
    )
  })

  test("--print without a prompt is rejected", () => {
    expect(rejection({ ...noFlags, print: true })).toBe("--print needs a prompt. Give the prompt as an argument.")
  })

  test("--allow-all without --print is rejected", () => {
    expect(rejection({ ...noFlags, allowAll: true, prompt: Option.some("fix the bug") })).toBe(
      "--allow-all is valid only with --print."
    )
  })

  test("--continue with --resume is rejected", () => {
    expect(rejection({ ...noFlags, continue: true, resume: Option.some("abc") })).toBe(
      "--continue and --resume cannot be used together. Use only one of them."
    )
  })
})
