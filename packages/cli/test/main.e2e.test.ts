import { describe, expect, test } from "bun:test"
import packageJson from "../package.json" with { type: "json" }

const main = new URL("../src/main.ts", import.meta.url).pathname

const tagent = async (...args: ReadonlyArray<string>) => {
  const child = Bun.spawn(["bun", main, ...args], { stdout: "pipe", stderr: "pipe" })

  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text()
  ])

  return { exitCode, stdout, stderr }
}

const notAvailable = "The agent is not available in this version of tagent."

describe("tagent", () => {
  test("--version prints the version of the package", async () => {
    const result = await tagent("--version")

    expect(result).toEqual({ exitCode: 0, stdout: `tagent v${packageJson.version}\n`, stderr: "" })
  })

  test("--help prints the command and each flag", async () => {
    const result = await tagent("--help")

    expect(result.exitCode).toBe(0)
    expect(result.stderr).toBe("")

    for (const text of [
      "tagent [flags] [<prompt>]",
      "--print, -p",
      "--continue, -c",
      "--resume, -r id",
      "--allow-all"
    ]) {
      expect(result.stdout).toContain(text)
    }
  })

  test.each([
    [["--print"], "--print needs a prompt."],
    [["--allow-all", "fix the bug"], "--allow-all is valid only with --print."],
    [["--continue", "--resume", "abc"], "--continue and --resume cannot be used together."]
  ])("%j is rejected", async (args, message) => {
    const result = await tagent(...args)

    expect(result.exitCode).toBe(1)
    expect(result.stdout).toBe("")
    expect(result.stderr).toContain(message)
    expect(result.stderr).not.toContain(notAvailable)
  })

  test.each([
    [[]],
    [["fix the bug"]],
    [["-c"]],
    [["-r", "abc", "fix the bug"]],
    [["-p", "fix the bug"]],
    [["-p", "--allow-all", "-c", "fix the bug"]]
  ])("%j is valid and reports that the agent is not available", async (args) => {
    const result = await tagent(...args)

    expect(result.exitCode).toBe(1)
    expect(result.stdout).toBe("")
    expect(result.stderr).toContain(notAvailable)
  })
})
