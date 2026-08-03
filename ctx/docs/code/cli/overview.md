# Code CLI — Overview

- Path: `ctx/docs/code/cli/overview.md`
- Template Version: `20260619`
- Changed: `20260803`

## Purpose

This document defines the frame model of the CLI in the Mindstream MVP.

It sets the normative invariants of the CLI layer, including its status, responsibility boundaries, and relation to the backend application.

---

## CLI Status

In the Mindstream MVP, the CLI is part of the backend application.

The CLI:

- is not a separate application;
- has no lifecycle outside the backend application;
- does not form an independent architectural contour.

The CLI is used only as the mechanism for choosing the execution mode of the backend application.

---

## Entry Point

The backend application uses the `teq` executable provided by `@teqfw/cli` as its single entry point.

All backend code starts through it and differs only by the selected CLI command.

Alternative entry points and parallel entry points are not allowed.

---

## Execution Modes

The same backend application is always launched through the CLI.

The CLI determines the application's execution mode:

- runtime mode;
- engineering (maintenance) mode.

The difference between these modes is logical and is not tied to different composition roots or different executable contours.

---

## Classes Of CLI Commands

CLI commands are classified by lifecycle type.

### Runtime Commands

Runtime commands initiate the runtime execution mode of the backend application.

A runtime command is not a result-bearing operation and does not imply normal completion.

---

### Engineering Commands

Engineering commands initiate one-shot execution of the backend application.

An engineering command ends after completing its action and exiting the process.

---

## Shared Application Basis

Regardless of the selected CLI command:

- the same backend codebase is used;
- the same DI container is used;
- the same environment and infrastructure access are used.

The CLI does not switch composition roots and does not split the backend application into different executable entities.

---

## Non-Interactivity

The CLI is strictly non-interactive in the MVP.

The CLI:

- does not use interactive input;
- does not request confirmations;
- does not involve dialogue during execution.

All execution parameters must be known at startup.

---

## General CLI Invariants (MVP)

The following invariants are fixed for the CLI layer in the MVP:

- deterministic execution under fixed environment and data;
- no interactivity;
- operation in a trusted contour;
- centralized process-termination policy.

---

## Relation To Host And Runtime

The CLI is not the container composition layer.

The host configures the Container before first resolution, starts lifecycle plugins, selects a descriptor by its complete `id`, and owns status and signal handling. `Mindstream_Back_App_Plugin` prepares shared application state and releases Knex resources during host shutdown. Command products implement only their selected action.

Runtime code does not depend on the CLI and contains no startup-mode selection logic.

---

## Document Boundary

This document does not describe:

- a command-tree implementation;
- host-library internals;
- argument parsing;
- error semantics and exit codes;
- concrete MVP commands;
- CLI implementation in code.

These aspects are defined in specialized `code/cli` documents.
