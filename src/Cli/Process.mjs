// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Process
 * @description CLI dispatcher for process:* commands.
 */
export default class Mindstream_Back_Cli_Process {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Cli_Process_Generate_Summaries$} deps.generateSummaries
 * @param {Mindstream_Back_Cli_Process_Generate_Embeddings$} deps.generateEmbeddings
 */
constructor({
    generateSummaries,
    generateEmbeddings,
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
        throw new Error(`Unknown process command "process:${parts.join(':')}".`);
      }
      const key = `${segment}:${action}`;
      const map = {
        'generate:embeddings': generateEmbeddings,
        'generate:summaries': generateSummaries,
      };
      if (!map[key]) {
        throw new Error(`Unknown process command "process:${parts.join(':')}".`);
      }
      return { command: map[key], name: `process:${segment}:${action}` };
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
    generateSummaries: 'Mindstream_Back_Cli_Process_Generate_Summaries$',
    generateEmbeddings: 'Mindstream_Back_Cli_Process_Generate_Embeddings$',
  }),
});
