# ADRs

This file is the map of the architecture decision records (ADRs) in this directory.

- `0001-session-log-is-the-source-of-truth.md`: a session is an append-only log of entries, and all other state comes from the log.
- `0002-a-turn-is-the-stream-that-submit-returns.md`: the contract between the UI and the core, and the turn loop.
- `0003-the-core-runs-tools-itself.md`: the core does not use the tool execution of `effect/ai`.
- `0004-one-function-contains-the-permission-rules.md`: tools declare access, one function decides, and the core has no permission modes.
