# Code CLI — Teq Host Model

- Path: `ctx/docs/code/cli/dispatcher.md`
- Template Version: `20260619`
- Changed: `20260803`

## Purpose

Defines the Mindstream integration model for the `@teqfw/cli` host.

## Host Composition

`node_modules/.bin/teq` is the only backend executable. The Mindstream package declares its DI namespace roots under `package.json#teqfw.fw.di.namespaces`, commands under `teqfw.fw.cli.commands`, and the default command under `teqfw.fw.cli.command.default`.

The complete colon-delimited command `id` is the sole public command name. The host selects it from the first command-line token; application code does not split, route, or otherwise interpret a command name.

## Distinct Responsibilities

- `Mindstream_Back_App_Plugin` is a DI lifecycle component. On startup it loads configuration, initializes the `@teqfw/db` connection and application configuration, configures Teq Web runtime settings, and registers Mindstream HTTP handlers. On shutdown it disconnects the database connection.
- Mindstream command products are finite DI components. They expose Teq command metadata and `async execute(context)`; they neither select commands nor control process status.
- `web:start` is the dependency-owned long-running command. It freezes the prepared runtime configuration, starts the server, and stops it after a host signal.

Plugins start before command selection, including help and engineering commands. Their startup and shutdown must therefore be safe for every invocation.

## Process Semantics

The Teq host owns command parsing, help, error reporting, signal handling, and process statuses. It returns `0` for success, `2` for usage errors such as an unknown command, and signal statuses for graceful interruption. Project code does not set an exit status or subscribe to process signals.

## Command Products

Command descriptors in package metadata are static discovery data. A descriptor names the DI command component and declares its inputs. The host resolves a command product only after selection. A finite product has `lifetime: 'finite'` and an async `execute(context)` method; `context.args` and `context.options` are already parsed objects.

## Boundary

This document does not define command business logic, input values, HTTP handler behavior, or Teq package internals. A host Container configurator is not declared while package metadata supplies all required namespace roots.
