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
 * @param {string[]} commandParts
 * @returns {object}
 */
const resolveTarget = function (commandParts) {
      const parts = Array.isArray(commandParts) ? commandParts : [];
      const [segment, action, ...rest] = parts;
      if (rest.length) {
        throw new Error(`Unknown process command "process:${parts.join(':')}".`);
      }
      const key = `${segment}:${action}`;
      /** @type {Record<string, Mindstream_Back_Cli_Process_Generate_Embeddings$|Mindstream_Back_Cli_Process_Generate_Summaries$>} */
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
 * @param {object} params
 * @returns {Promise<void>}
 */
this.dispatch = async function (params = {}) {
      const { commandParts, args } = /** @type {{commandParts: string[], args: string[]}} */ (params);
      const { command, name } = /** @type {{command: Mindstream_Back_Cli_Process_Generate_Embeddings$|Mindstream_Back_Cli_Process_Generate_Summaries$, name: string}} */ (resolveTarget(commandParts));
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
