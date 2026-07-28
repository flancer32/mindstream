// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Ingest
 * @description CLI dispatcher for ingest:* commands.
 */
export default class Mindstream_Back_Cli_Ingest {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Cli_Ingest_Discover_Habr$} deps.discoverHabr
 * @param {Mindstream_Back_Cli_Ingest_Extract_Habr$} deps.extractHabr
 */
constructor({
    discoverHabr,
    extractHabr,
  }) {
    /**
 * @param {string[]} commandParts
 * @returns {object}
 */
const resolveTarget = function (commandParts) {
      const parts = Array.isArray(commandParts) ? commandParts : [];
      const [segment, action, ...rest] = parts;
      if (rest.length) {
        throw new Error(`Unknown ingest command "ingest:${parts.join(':')}".`);
      }
      const key = `${segment}:${action}`;
      /** @type {Record<string, Mindstream_Back_Cli_Ingest_Discover_Habr$|Mindstream_Back_Cli_Ingest_Extract_Habr$>} */
      const map = {
        'discover:habr': discoverHabr,
        'extract:habr': extractHabr,
      };
      if (!map[key]) {
        throw new Error(`Unknown ingest command "ingest:${parts.join(':')}".`);
      }
      return { command: map[key], name: `ingest:${segment}:${action}` };
    };

    /**
 * @param {object} params
 * @returns {Promise<void>}
 */
this.dispatch = async function (params = {}) {
      const { commandParts, args } = /** @type {{commandParts: string[], args: string[]}} */ (params);
      const { command, name } = /** @type {{command: Mindstream_Back_Cli_Ingest_Discover_Habr$|Mindstream_Back_Cli_Ingest_Extract_Habr$, name: string}} */ (resolveTarget(commandParts));
      if (!command?.execute) {
        throw new Error(`Command "${name}" is unavailable.`);
      }
      await command.execute({ args });
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    discoverHabr: 'Mindstream_Back_Cli_Ingest_Discover_Habr$',
    extractHabr: 'Mindstream_Back_Cli_Ingest_Extract_Habr$',
  }),
});
