# The core runs tools itself

`effect/ai` can run tool handlers and can ask for approval. We decided not to use these functions. The core disables the tool execution of `effect/ai`, decodes the input of each tool call one time, and runs the tool itself. A tool definition in the core gives the title for the user, the access, and the execution from the decoded input.

## Considered Options

- **The handlers of `effect/ai` (`Toolkit.toLayer` and `Toolkit.handle`).** This option needs less code in this project. We rejected it for these reasons. The permission check needs the decoded input before the execution, thus the input is decoded two times or the check uses raw JSON. A tool set that is made at run time gives a crash on the first call when a handler is missing, not a type error. And the approval function of `effect/ai` runs handlers also when the tool execution is disabled, if approval data is in the prompt.

## Consequences

- The core calls the model with the tool execution disabled and with deferred validation of tool calls. Thus an unknown tool name or incorrect input does not fail the stream.
- An unknown tool, incorrect input, a denied call, and a tool failure are tool results that the model reads. They do not end the turn.
- The core runs the tool calls of one reply in sequence, in the order of the reply.
- One list contains all tools. The tool set for the model and the lookup by name come from this list.
- Do not put approval data of `effect/ai` in the prompt.
