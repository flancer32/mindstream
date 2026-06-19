# Filesystem Structure

- Path: `ctx/docs/filesystem.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Defines the declarative structure of the repository at the top level only, listing root-level directories and root-level files and establishing repository boundaries as a navigation model.

## Root Structure

- `.agents/` — local agent-side skill and support assets used outside the product model.
- `.codex/` — local Codex support files and cached tooling context.
- `.github/` — repository-level automation and workflows.
- `.git/` — repository metadata managed by Git and outside the product model.
- `.vscode/` — editor-local workspace settings.
- `bin/` — executable entry points and bootstrap scripts.
- `ctx/` — cognitive context containing declarative documentation.
- `node_modules/` — installed external dependencies outside project control.
- `src/` — source code of the application.
- `test/` — test suites validating behavior.
- `tmp/` — temporary local artifacts outside the model.
- `web/` — static and browser-delivered assets.

## Root Files

- `.env` — local environment configuration for development use.
- `.env.example` — environment configuration template.
- `.gitignore` — version control exclusion rules.
- `.markdownlint.json` — Markdown lint configuration.
- `AGENTS.md` — root-level agent instructions.
- `LICENSE` — license definition.
- `package-lock.json` — dependency lockfile.
- `package.json` — package metadata, dependencies, and scripts.
- `README.md` — repository description and usage entry point.
- `types.d.ts` — global type declarations.

## Scope Rule

This document must describe only top-level directories and root-level files of the repository.

Subdirectories must not be described here.

Lower-level structure must be described only by the corresponding `AGENTS.md` files within those directories.

## Boundary Definition

- `ctx/` defines the system model and governs interpretation of the repository.
- `src/` defines the product implementation.
- `bin/` defines executable entry points.
- `test/` validates behavior but does not define it.
- `web/` defines browser-delivered assets.
- `node_modules/` is external and outside project control.
