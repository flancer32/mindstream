/**
 * @module Mindstream_Back_Cli_Ingest
 * @description CLI dispatcher for ingest:* commands.
 */
export default class Mindstream_Back_Cli_Ingest {
  constructor({ Mindstream_Back_Cli_Ingest_Discover_Habr$: discoverHabr }) {
    const resolveTarget = function (commandParts) {
      const parts = Array.isArray(commandParts) ? commandParts : [];
      const [segment, action, ...rest] = parts;
      if (rest.length) {
        throw new Error(`Unknown ingest command "ingest:${parts.join(':')}".`);
      }
      if (segment !== 'discover' || action !== 'habr') {
        throw new Error(`Unknown ingest command "ingest:${parts.join(':')}".`);
      }
      return discoverHabr;
    };

    this.dispatch = async function ({ commandParts, args } = {}) {
      const command = resolveTarget(commandParts);
      if (!command?.execute) {
        throw new Error('Command "ingest:discover:habr" is unavailable.');
      }
      await command.execute({ args });
    };
  }
}
