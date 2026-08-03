---
name: project-conventions
description: Project-specific conventions. Use for every task in this repository.
---

# Project Conventions

`AGENTS.md` overrides this file.

## Repositories

- The root and `ctx/` are one Git repository; include `ctx/` in root Git operations.
- `ctx/` is the cognitive-context directory.

## Workflow

- Work on `main` unless the task specifies another branch; do not create branches.
- Before work, fetch and ensure the current branch matches its upstream.

## Communication

- User: Russian unless requested otherwise; code, comments, docs, commits, identifiers: English.
- Report changes, verification, and remaining risks.

## Shared memory

- `flancer32/ai-memo` is the shared cross-project issue tracker and memory.
- May create issues: source `flancer32/mindstream`; name the project or projects expected to resolve them.
- In GitHub issue descriptions and comments, use actual line breaks; literal `\n` is displayed as text.
- Notes: `project/flancer32/mindstream/`.

## Validation

- Do not use `teqfw-esm-validator`.

## TeqFW platform

- Use `teqfw-platform` only for `@teqfw/di` tasks; otherwise require package-local adaptation.

## Editing fallback

- Use `apply_patch`; on `bwrap` or network-namespace failure, use scoped `git apply`.
- Do not use shell redirection, `cat`, or broad rewrites; after fallback, run `git diff --check` from the root.
