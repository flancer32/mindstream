# Architecture Documentation

- Path: `ctx/docs/architecture/AGENTS.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Defines the architecture documentation level.

Documents at this level translate product intent into stable engineering structure, behavior, state ownership, integration boundaries, architectural constraints, durable decisions, and supervision rules.

## Level Map

- `anonymous-identity/` — deeper architecture notes for anonymous identity boundaries and invariants.
- `attention/` — deeper architecture notes for the attention axis and its invariants.
- `content-collection/` — deeper architecture notes for content collection boundaries and invariants.
- `data-flow/` — deeper architecture notes for major data-flow projections.
- `ingress/` — deeper architecture notes for ingress boundaries and request-entry contracts.
- `storage/` — deeper architecture notes for storage modeling and persistence boundaries.
- `AGENTS.md` — level definition for `ctx/docs/architecture/`.
- `behavior.md` — internal architectural flows and major system behavior, not product use cases.
- `constraints.md` — non-negotiable architecture restrictions and trust boundaries.
- `decisions.md` — short ADR-like records of durable decisions, rejected alternatives, and reasoning.
- `integration.md` — external integrations and major internal contracts between architectural blocks.
- `overview.md` — compact architectural overview and navigation index.
- `state.md` — state ownership, sources of truth, derived state, and state-changing authority.
- `structure.md` — major architectural blocks, runtime areas, and responsibility boundaries, not code structure.
- `supervision.md` — human-agent architecture supervision rules, approval boundaries, and drift signals.

## Architecture Knowledge Model

Architecture knowledge is organized as one coordinated model rather than a set of isolated notes.

Each document answers a different architectural question, and the set is intended to be read together:

- `structure.md` — what is structurally built.
- `behavior.md` — how the system behaves internally.
- `state.md` — where authoritative state is owned, changed, and derived.
- `integration.md` — what integrations and internal contracts exist.
- `constraints.md` — what must not be violated.
- `decisions.md` — why durable architectural choices were made.
- `supervision.md` — how human and agents govern architectural consistency.
- `overview.md` — where to enter the architecture level and how to navigate it.

These views complement each other:

- `structure.md` and `behavior.md` describe the main form and motion of the system.
- `state.md` explains where durable authority exists inside that form and motion.
- `integration.md` shows where boundaries are crossed.
- `constraints.md` limits valid architecture choices.
- `decisions.md` records why durable choices were accepted.
- `supervision.md` defines how the human and agents keep the model coherent over time.

`overview.md` serves as the entry point and navigation index for the full model.

## Level Boundary

Defines:

- Major architectural areas, system boundaries, and integration surfaces.
- Internal behavior, state ownership, and authority distribution.
- Durable architectural constraints, decisions, and supervision rules.

Does NOT define:

- Product meaning such as roles, domain entities, or use-case outcomes.
- Deployment procedures, operational workflow routing, or environment-specific runbooks.
- Source-level implementation details such as files, classes, tables, DTOs, or endpoint definitions.

## Relationship To Product

Architecture depends on product documentation and refines it. It is not an independent source of product truth.

The dependency order is:

```text
product
  -> architecture
  -> environment
  -> code
```

Product documentation defines what the product is.

Architecture documentation defines how that product is realized structurally.

Architecture may refine product intent into engineering structure, but must not redefine:

- what the product is;
- who product roles are;
- which domain entities exist;
- which product outcomes matter.

Architecture may add engineering precision, constraints, and internal mechanisms, but must not add new product meaning.

Architecture must not invent new product behavior or silently resolve product contradictions.

If an architectural concept becomes load-bearing for a product capability, invariant, authority boundary, or semantic boundary, that concept must be named in product documentation first.

When product knowledge is missing or contradictory, architecture documents must expose the gap and escalate it instead of creating implicit meaning.

## Authoring Rules

- Keep documents compact enough for one human to supervise directly or with agent assistance.
- Prefer declarative statements over implementation detail.
- Use deeper subdirectories only when the project scale justifies them.
- Respect the dependency order during analysis and change planning.
- Do not introduce new architectural owners, new persistent state, new external integrations, or new system boundaries without corresponding document updates and human approval.
