// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Runtime
 * @description CLI dispatcher for runtime:* commands.
 */
export default class Mindstream_Back_Cli_Runtime {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Cli_Runtime_Web$} deps.runtimeWeb
 */
constructor({ runtimeWeb }) {
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
        throw new Error(`Unknown runtime command "runtime:${parts.join(':')}".`);
      }
      if (segment !== 'web' || action !== undefined) {
        throw new Error(`Unknown runtime command "runtime:${parts.join(':')}".`);
      }
      return runtimeWeb;
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
      const command = resolveTarget(commandParts);
      if (!command?.execute) {
        throw new Error('Command "runtime:web" is unavailable.');
      }
      await command.execute({ args });
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    runtimeWeb: 'Mindstream_Back_Cli_Runtime_Web$',
  }),
});
