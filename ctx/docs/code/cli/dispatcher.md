# Code CLI — Dispatcher Model

- Path: `ctx/docs/code/cli/dispatcher.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

This document defines the normative CLI dispatch model in the Mindstream MVP.

It specifies:

- the CLI tree model;
- how the role of a CLI module is determined;
- dispatcher responsibility boundaries;
- the command-execution model;
- error semantics;
- process-termination and resource-release rules.

This document builds on `code/cli/overview.md`. Any deviation is an implementation defect.

## CLI Model

The Mindstream CLI is implemented as a tree of CLI modules.

- the tree root is the root application dispatcher;
- internal nodes are dispatchers;
- leaf nodes are executable commands.

Flat command registries and centralized routing tables are not used.

## Root Dispatcher

The root CLI dispatcher is:

`Mindstream_Back_App_Cli_Dispatcher`

It:

- belongs to the backend application;
- initiates CLI dispatch;
- contains no command application logic;
- works only through the DI contour;
- is the only point that interprets command-execution results.

## Role Of A CLI Module

A CLI module may have one of two roles:

- dispatcher;
- command.

The role is determined only by its position in the CLI tree and by directory structure.

Class naming, inheritance, suffixes, and code markers are not used to determine role.

## Role-Determination Rule

For a directory `src/Cli/<Path>/`:

1. If the directory contains subdirectories, the module `<Path>.mjs` is a dispatcher and must delegate execution into one of the subdirectories.
2. If the directory contains no subdirectories, all modules in that directory are commands and are treated as CLI tree leaves.

## Dispatcher Responsibility

A dispatcher:

- selects the next CLI tree node;
- delegates execution;
- catches and normalizes errors.

A dispatcher does not:

- parse arguments;
- validate parameters;
- run application logic;
- manage infrastructure;
- manage resource lifecycle;
- terminate the process.

## DI And The CLI Space

All CLI modules:

- are provided through the DI container;
- are not created manually;
- are not registered dynamically.

The space of available CLI commands is determined by the combination of `src/Cli` directory structure and the set of objects available through DI.

## Executable Commands

A command is a leaf module of the CLI tree.

A command:

- receives dependencies through DI;
- parses CLI arguments on its own;
- implements a single execution method `execute`;
- does not manage application lifecycle;
- does not terminate the process directly.

A command is treated as a pure operation with side effects and without formalized internal state.

## Errors And Termination

### Error Signaling

A command signals failure by throwing an exception.

Dispatchers catch errors and pass them upward through the tree to the root dispatcher.

### Exit Semantics

Exit semantics are centralized and interpreted **only by the root dispatcher and the application bootstrap layer**.

- `0` means successful completion of an engineering CLI command;
- a non-zero value means command-execution failure.

An exit code describes the **result of command execution**, not the lifecycle of resources.

### Runtime Commands

Runtime commands are leaf nodes that start application runtime mode and do not imply normal completion. Returning control from a runtime command is abnormal.

### Application Shutdown And Resource Release

Releasing backend-application resources is the responsibility of the bootstrap layer, not CLI commands or dispatchers.

Normative rules:

- CLI commands and dispatchers do not release resources directly.
- Completion of a CLI command returns control to bootstrap.
- After control returns, bootstrap stops the application through `app.stop()` or an equivalent, releases all managed resources, and only then terminates the process.

For runtime commands, normal return does not exist, so `app.stop()` is called only on abnormal return or external process termination such as `SIGINT` or `SIGTERM`.

Any attempt to manage process termination or resources from a CLI command is an architectural defect.

## Logging

- a command may log its own errors;
- intermediate dispatchers may catch errors and pass them upward;
- the root dispatcher must log every error not handled below.

Absence of logs on abnormal CLI termination is a defect.

## CLI Invariants In The MVP

All CLI commands have these fixed properties:

- determinism;
- non-idempotency by default;
- strict non-interactivity;
- execution in a trusted contour;
- no application-lifecycle management at command level.

## Document Boundary

This document does not describe CLI syntax, argument format, help and usage, CLI generation, the list of MVP commands, code implementation, or OS signal handling.
