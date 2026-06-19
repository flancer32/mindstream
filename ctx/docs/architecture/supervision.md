# Architecture Supervision

- Path: `ctx/docs/architecture/supervision.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Describe how one human and many agents supervise architecture-level consistency.

## Human-Agent Supervision Principle

- humans own architectural direction and guardrails
- agents operate within documented architectural boundaries
- architecture documentation is the authoritative medium through which the human direction-setting loop and the agent refinement and execution-support loop coordinate at the architecture level
- agents must surface architectural drift instead of silently resolving it
- major architectural boundary changes require human approval

## Human Responsibilities

The human sets architectural direction, approves durable guardrails, and resolves uncertainty when product intent and architecture structure diverge.

## Agent Responsibilities

Agents may refine documentation, clarify existing boundaries, and align implementation with documented architecture while remaining inside established ownership and integration limits.

Agents should prefer updating documentation before code when a new architectural concept appears.

## Mandatory Approval Cases

The following changes require human approval:

- new architectural owners
- new persistent state
- new external integrations
- new system boundaries

## Drift Signals

Architecture drift is indicated when:

- implementation introduces durable concepts not named in architecture documents
- new integration dependencies appear without architecture-level acknowledgement
- read models, browser surfaces, or derived artifacts begin acting as hidden state authorities
- product and architecture terms stop matching across levels

## Pre-Code Check Order

Before code-oriented work, agents should check:

```text
product
  -> architecture
  -> environment
  -> code
```
