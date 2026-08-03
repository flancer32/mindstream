# Bootstrap Reference (Node.js)

- Path: `ctx/docs/code/bootstrap-reference.md`
- Template Version: `20260619`
- Changed: `20260803`

## Purpose

Records the reference bootstrap boundary for the Mindstream Node.js backend.

## Reference Invocation

The project does not own a JavaScript bootstrap executable. `@teqfw/cli` publishes `teq`, which npm resolves from `node_modules/.bin`:

```sh
npm exec -- teq --help
npm start
```

`npm start` invokes `teq` without an explicit command. The host selects the root package default `fl32:web:start`.

Before the first DI resolution, the Teq executable discovers `teqfw.fw.di.namespaces` metadata. The host then starts declared lifecycle plugins, selects a command by its full `id`, and performs one orderly shutdown. Mindstream does not declare a Container configurator because package metadata supplies all required namespace roots.

## Configuration Boundary

`Mindstream_Back_App_Plugin` owns the one-shot loading of the optional project `.env` source followed by `process.env`, then initializes `Mindstream_Back_App_Configuration`.

## Status

This reference describes the executable boundary only. Application and runtime invariants remain defined by the architecture and environment documentation.
