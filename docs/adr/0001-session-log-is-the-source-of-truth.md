# The session log is the source of truth of a session

The core must keep a conversation correct after an interruption and after a crash of the process. It must also show a resumed session in the same way as a live session. We decided that a session is an append-only log of typed entries, written to a JSONL file when each fact occurs. All other state comes from the log through pure functions. We accept more code and two vocabularies (private log entries and public events) to get one place that keeps the history correct.

## Considered Options

- **The conversation as the state.** The core keeps the messages for the model in memory and writes them to disk after each step. This option has less code and one representation. We rejected it for two reasons:
  - A step is written only at its end. Thus, if the process stops after a command, the record of that command is lost.
  - A resumed session needs a second path that makes events from the stored messages. This path loses data: the ends of the turns, the permission answers, and the token counts.
- **Each part of a streamed reply as an entry.** This option keeps all partial text. We rejected it because the files become large and the function that makes the context must find the limits of each block.

## Consequences

- The entry types are: session start, user input, model reply, permission request, permission answer, tool result, and turn end. An entry is a complete fact.
- The model context, the turn number, and the events for the UI come from the log. Do not keep a second copy of this state.
- One pure function makes the context for the model. A provider refuses a history in which a tool call has no result. Thus this function gives each tool call without a result a failed result. The failed result says that the call was interrupted. This one rule is correct after an interruption and after a crash.
- When a turn is interrupted while the model sends text, the core records the text that arrived. It drops a reasoning block that is not complete and a tool call whose input is not complete.
- When the core resumes a session whose last turn has no end, it records that the turn was interrupted.
- Only the turn that runs adds entries. Only the session adds the turn end entry.
- The model reply entry contains the assistant message type from `effect/ai`. This type keeps the provider data that must go back to the provider without changes. The format of the entries is private to the core. A stored file with a different format version is refused. Backward compatibility is not kept.
