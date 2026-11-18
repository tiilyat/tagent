# tagent

`tagent` is a coding-agent harness. This project uses Bun and Effect 4.

Keep this file short. It gives the rules and the map of the other docs. Put the details in those docs.

## General rules

- Do not preserve backward compatibility.
- Choose the simplest implementation that fully meets the current requirements.
- Prefer established, well-maintained libraries over custom implementations.
- Fix the cause, not the symptom.
- Suggest best practices, even if they can make refactoring necessary.
- Do not write production code that exists only for tests. Do not put in-memory repos or fakes in `src`.

## Routing Map

- `ARCHITECTURE.md`: the top-level map of the system. It records the architecture decisions that are final.
- `docs/agents/index.md`: the map of the agent docs. It tells you when to read each doc.
- `docs/adr/index.md`: the map of the architecture decision records (ADRs).

## Working Contract

- Work on one plan or one feature slice at a time. Keep the changes in the limits of the requested task.
- Prefer retrieval over pre-training.
- Make behavior-changing assumptions explicit.
- Do not tell the user that work is done if you only read the code. Run the code or the checks, and give the evidence.
- Report what you verified and what you could not verify.
- If you change behavior, update the related docs in the same session.
- If the same review comment occurs again, make it a mechanical rule: a lint rule, a check, or a test. Do not explain it again in the chat.
- Write all docs in agreement with ASD-STE100 (Simplified Technical English). `bun run lint:ste` examines the docs.
- Prefer a small, current doc to more text in this file.

## Definition Of Done

A change is done only when all of these conditions are true:

- The target behavior is implemented.
- `bun run check` passes, and you did a run of the behavior that you changed.
- Your report gives the evidence: the commands that you used and their results.
- The docs that the change affects are current.
- The repository works from a clean state: `bun install`, then `bun run check`.
