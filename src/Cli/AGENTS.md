# CLI Source — AGENTS

Path: `./src/Cli/AGENTS.md`

## Purpose

This document defines the **form invariants of CLI code** in the `src/Cli/` directory and identifies the normative sources that the implementation must follow.

This document does not describe the CLI model, the command tree, or execution semantics. Those aspects are defined in higher-level documentation.

---

## Normative Sources

Any changes to CLI code **must comply with** the following documents:

- `ctx/docs/code/cli/overview.md` — the framing model of the CLI in the MVP.
- `ctx/docs/code/cli/dispatcher.md` — the normative Teq host, plugin, and command-product model.
- `ctx/docs/code/cli/command-tree.md` — the fixed registry of command identifiers.

These documents are the source of truth. `src/Cli/AGENTS.md` does not extend or refine them.

---

## CLI Code Form Invariants

When working with code in `src/Cli/`, the following are mandatory:

- all command products are provided through the DI container;
- a command declares its `id`, `summary`, `lifetime`, `arguments`, `options`, and `execute` handler;
- command selection and input parsing belong to `@teqfw/cli` metadata and host, not to project source;
- commands do not manage the application lifecycle or process termination.

---

## Explicit Prohibitions

Within `src/Cli/`, it is prohibited to:

- introduce command identifiers absent from `command-tree.md`;
- parse command names or raw process arguments in a command product;
- implement business logic unrelated to executing a specific command;
- add interactivity, dialogs, or confirmations;
- manage resource cleanup or process termination.

---

## Responsibility Boundary

`src/Cli/` implements finite Mindstream engineering command products.

CLI code does not:

- describe the architecture;
- define product meaning;
- form the data corpus;
- interpret user behavior.

---

## Summary

`src/Cli/AGENTS.md` serves as a **form anchor**, not as a behavior description.

The dependency-owned `fl32:web:start` command starts the web server. Application setup belongs to `Mindstream_Back_App_Plugin`, not command products.
