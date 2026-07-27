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
 * @param {unknown} commandParts
 * @returns {unknown}
 */
/**
 * @param {unknown} commandParts
 * @returns {unknown}
 */
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

    /**
 * @param {unknown} deps
 * @param {unknown} deps.commandParts
 * @param {unknown} deps.args
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} params
 * @returns {Promise<unknown>}
 */
this.dispatch = async function (params = {}) {
      const { commandParts, args } = params;
      const { command, name } = resolveTarget(commandParts);
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
