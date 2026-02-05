/**
 * @module Mindstream_Back_Cli_Ingest
 * @description CLI dispatcher for ingest:* commands.
 */
export default class Mindstream_Back_Cli_Ingest {
  constructor({
    Mindstream_Back_Cli_Ingest_Discover_Habr$: discoverHabr,
    Mindstream_Back_Cli_Ingest_Extract_Habr$: extractHabr,
  }) {
    const resolveTarget = function (commandParts) {
      const parts = Array.isArray(commandParts) ? commandParts : [];
      const [segment, action, ...rest] = parts;
      if (rest.length) {
        throw new Error(`Unknown ingest command "ingest:${parts.join(':')}".`);
      }
      const key = `${segment}:${action}`;
      const map = {
        'discover:habr': discoverHabr,
        'extract:habr': extractHabr,
      };
      if (!map[key]) {
        throw new Error(`Unknown ingest command "ingest:${parts.join(':')}".`);
      }
      return { command: map[key], name: `ingest:${segment}:${action}` };
    };

    this.dispatch = async function ({ commandParts, args } = {}) {
      const { command, name } = resolveTarget(commandParts);
      if (!command?.execute) {
        throw new Error(`Command "${name}" is unavailable.`);
      }
      await command.execute({ args });
    };
  }
}
