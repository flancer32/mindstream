# Environment Overview

- Path: `ctx/docs/environment/overview.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Describe the runtime and operational environment required by the system.

## Runtime Model

The project runs as a Node.js-based application with server-side execution, browser-delivered web assets, and supporting data storage infrastructure.

Operationally, the environment separates local development concerns, runtime web-serving concerns, and persistent database-backed processing concerns.

## External Dependencies

Required environment-level dependencies include:

- a JavaScript runtime suitable for the project toolchain and backend execution
- a PostgreSQL-compatible database environment
- web-serving infrastructure for browser-facing delivery
- network access to configured upstream source systems and AI-related external services when those features are enabled

## Environment Constraints

- environment setup must preserve the authority of the cognitive context over implementation choices
- runtime assumptions documented here must remain consistent with architecture constraints and code-level configuration rules
- environment changes that introduce new durable infrastructure dependencies should be reflected in architecture and code documentation before implementation expands around them
