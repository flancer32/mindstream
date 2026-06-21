# CLI Source — AGENTS

Path: `./src/Cli/AGENTS.md`

## Purpose

This document defines the **form invariants of CLI code** in the `src/Cli/` directory and identifies the normative sources that the implementation must follow.

This document does not describe the CLI model, the command tree, or execution semantics. Those aspects are defined in higher-level documentation.

---

## Normative Sources

Any changes to CLI code **must comply with** the following documents:

- `ctx/docs/code/cli/overview.md` — the framing model of the CLI in the MVP.
- `ctx/docs/code/cli/dispatcher.md` — the normative model of dispatching and CLI module roles.
- `ctx/docs/code/cli/command-tree.md` — the fixed space of admissible CLI commands.

These documents are the source of truth. `src/Cli/AGENTS.md` does not extend or refine them.

---

## CLI Code Form Invariants

When working with code in `src/Cli/`, the following are mandatory:

- the directory structure is **isomorphic to the CLI command tree**;
- the role of a module (dispatcher or command) is determined **only** by its position in the directory tree;
- all CLI modules are provided through the DI container;
- CLI code does not manage the application lifecycle and does not terminate the process directly;
- leaf modules implement executable commands and do not contain dispatch logic.

---

## Explicit Prohibitions

Within `src/Cli/`, it is prohibited to:

- introduce commands that are absent from `command-tree.md`;
- change the command hierarchy without synchronously updating `command-tree.md`;
- implement business logic unrelated to executing a specific command;
- add interactivity, dialogs, or confirmations;
- manage resource cleanup or process termination.

---

## Responsibility Boundary

`src/Cli/` implements the **selection and startup of backend application execution modes**.

CLI code does not:

- describe the architecture;
- define product meaning;
- form the data corpus;
- interpret user behavior.

---

## Summary

`src/Cli/AGENTS.md` serves as a **form anchor**, not as a behavior description.

Any changes to CLI code must be a mechanical consequence of the normative documents under `ctx/docs/code/cli`.
