# Testing

This doc tells you which type of test to write.

## Test types

| Type          | Use it for                                                                                       | Network  | In `bun run check` |
| ------------- | ------------------------------------------------------------------------------------------------ | -------- | ------------------ |
| Unit test     | Code that is pure and uses no resources.                                                         | No       | Yes                |
| Recorded test | Code that calls a model provider: a provider adapter, the agent loop, the tools in a turn.       | Recorded | Yes                |
| Live test     | A small number of checks that the real provider API still has the format that the adapter reads. | Real     | No                 |
| e2e test      | Behavior that uses other resources: the file system and child processes.                         | No       | Yes                |

## e2e tests of the CLI

An e2e test of the CLI starts `packages/cli/src/main.ts` as a process. It does not use the built binary `dist/tagent`. The tests do not make sure that the build is correct. CI does the build and finds a build failure.

## Recorded tests

A recorded test replaces only the network. The HTTP client gets a `fetch` function that returns a recorded exchange. All the code of this project runs without changes. The adapter reads the recorded event stream. The agent loop and the tools use the result.

Obey these rules:

- Keep the replacement for `fetch` and the recordings in `test/`. Do not put them in `src`.
- Make a recording from the real provider API. Do not write a recording by hand.
- A recording contains the method, the URL, and the body of the request, and the status, the content type, and the body of the response. A recording does not contain headers. Thus an API key cannot get into a recording.
- If the request of the test is different from the request in the recording, the test must fail.
- If the recording does not exist, the test must fail. To make a recording, start the test in record mode with an API key.
- Do not replace the `LanguageModel` service with a scripted model. A scripted model does not test the adapter.

## Live tests

- A live test uses the real network and an API key.
- A live test runs only when you start it on purpose. It does not run in `bun run check` or in the Git hooks.
- Write assertions that stay correct when the words of the model change.

## Status

The repo does not contain the replacement for `fetch` at this time. Add it together with the first provider adapter.
