/**
 * @module Mindstream_Back_Cli_Process
 * @description CLI dispatcher for process:* commands.
 */
export default class Mindstream_Back_Cli_Process {
  constructor({ Mindstream_Back_Cli_Process_Generate_Summaries$: generateSummaries }) {
    const resolveTarget = function (commandParts) {
      const parts = Array.isArray(commandParts) ? commandParts : [];
      const [segment, action, ...rest] = parts;
      if (rest.length) {
        throw new Error(`Unknown process command "process:${parts.join(':')}".`);
      }
      const key = `${segment}:${action}`;
      const map = {
        'generate:summaries': generateSummaries,
      };
      if (!map[key]) {
        throw new Error(`Unknown process command "process:${parts.join(':')}".`);
      }
      return { command: map[key], name: `process:${segment}:${action}` };
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
