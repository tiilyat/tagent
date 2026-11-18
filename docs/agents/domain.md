# Domain docs

This doc tells the engineering skills how to use the domain docs of this repo.

## Read these docs first

Before you examine the code, read these docs:

- `GLOSSARY.md` at the repo root.
- The ADRs in `docs/adr/` that apply to the area of your work.

If one of these files does not exist, continue with the work. Do not report that the file is missing. Do not suggest that the user must make the file first.

## File structure

This repo has one context:

```
/
├── GLOSSARY.md
├── docs/adr/
└── packages/
```

## Use the terms of the glossary

When your output gives a name to a domain concept, use the term that `GLOSSARY.md` defines. Examples of such output are an issue title, a refactor proposal, a hypothesis, and a test name. Do not use synonyms that the glossary tells you not to use.

If the glossary does not contain the concept that you need, there are two possible causes:

- You made a term that the project does not use. Think about the term again.
- The glossary has a gap. Make a note of the gap for `/domain-modeling`.

## Report ADR conflicts

If your output is in conflict with an ADR, tell the user clearly. Do not ignore the ADR silently. Example:

> _This is in conflict with ADR-0007 (event-sourced orders). But we must think about that decision again because…_
