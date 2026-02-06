/**
 * @module Mindstream_Back_Cli_Runtime
 * @description CLI dispatcher for runtime:* commands.
 */
export default class Mindstream_Back_Cli_Runtime {
  constructor({ Mindstream_Back_Cli_Runtime_Web$: runtimeWeb }) {
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

    this.dispatch = async function ({ commandParts, args } = {}) {
      const command = resolveTarget(commandParts);
      if (!command?.execute) {
        throw new Error('Command "runtime:web" is unavailable.');
      }
      await command.execute({ args });
    };
  }
}
