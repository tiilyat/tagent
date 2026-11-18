# One function contains the permission rules

A tool call can change files or run a command, thus the user must approve it first. We decided that a tool only declares what a call touches: a path to read, a path to write, or a command to run. One pure function in the core contains all permission rules and gives the decision. The core has no permission modes: the UI answers each permission request.

## Considered Options

- **Each tool decides if its call needs approval.** We rejected this option because the rules are then in each tool, and a new tool can get a rule wrong.
- **A permission mode in the core** (`ask`, `deny`, `allow`). We rejected this option because it gives a second path for the same decision. The mode without an interface answers the requests itself.
- **Grants that come from the session log and stay after a resume.** We rejected this option. A resumed session starts with no grants, thus the user sees again what the agent is permitted to do.

## Consequences

- The rules are:
  - A read in the workspace runs without a question.
  - A write in the workspace and a command need approval.
  - Access outside the workspace needs approval each time.
- The answers of the user are: "allow one time", "allow always", and "deny".
- "Allow always" applies to all writes in the workspace, or to commands that start with one prefix. The grants stay in memory.
- A permission request and its answer are entries in the session log, thus the UI can show them in the history.
- A granted prefix applies to whole words: the prefix `git diff` applies to `git diff --stat`, and it does not apply to `git diff-index`.
- A command line can contain more than one command, for example with `;`, `&&`, or `|`. The core divides the command line into its commands and examines each command. The command line runs without a question only if each of its commands starts with a granted prefix. Thus the granted prefix `git status` does not let `git status; rm -rf .` run. If the core cannot divide a command line, the command line needs approval.
- The mode without an interface has no user who can answer. It denies each permission request and continues the turn. It tells the model that no user can approve the call and that the model must not try the call again. A flag of the CLI lets the user approve all calls before the start.
