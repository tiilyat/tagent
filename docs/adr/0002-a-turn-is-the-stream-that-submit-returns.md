# A turn is the stream that `submit` returns

The line REPL, the mode without an interface, and the planned terminal UI must use the core in the same way. We decided that `Session.submit` returns the stream of events of one turn. The turn runs while the UI reads the stream, and the stream ends after the event that ends the turn. To stop a turn, the UI interrupts the reader of the stream.

## Considered Options

- **One event bus for the session, a `submit` command, and an `interrupt` command.** We rejected this option for these reasons. The UI must subscribe before it submits, or it does not get the first events. The UI must find the end of a turn in the bus itself. A turn can continue after its UI stopped. And there are two ways to stop a turn.
- **Actors with mailboxes.** We rejected this option because the first version has no subagents and no second client, and an ordinary loop in one fiber does the work.

## Consequences

- A turn is an ordinary loop: call the model, run the tool calls, call the model again. The loop ends when the model answers without a tool call. There is no limit on the number of steps.
- A problem in a turn is not an error of the stream. The last event tells the UI how the turn ended: completed, interrupted, or failed.
- If the UI calls `submit` while a turn runs, the new turn waits for the end of the current turn.
- The core records the end of an interrupted turn before the interruption is complete. A test program showed that the interruption of the reader waits for this.
- The public contract does not contain types from `effect/ai`.
