/**
 * @module Mindstream_Back_App_Cli_Dispatcher
 * @description Root CLI dispatcher for the backend application.
 */
export default class Mindstream_Back_App_Cli_Dispatcher {
  constructor({ Mindstream_Shared_Logger$: logger, Mindstream_Back_Cli_Db$: dbDispatcher, Mindstream_Back_Cli_Runtime$: runtimeDispatcher }) {
    const NAMESPACE = 'Mindstream_Back_App_Cli_Dispatcher';

    const ensureError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

    const normalizeArgs = function (cliArgs) {
      if (!Array.isArray(cliArgs)) return [];
      return cliArgs.filter((value) => value !== undefined && value !== null).map(String);
    };

    const parseCommand = function (cliArgs) {
      const [command, ...args] = normalizeArgs(cliArgs);
      if (!command) {
        throw new Error('CLI command is required.');
      }
      return { command, args };
    };

    const splitCommand = function (command) {
      return String(command)
        .split(':')
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
    };

    this.dispatch = async function ({ cliArgs } = {}) {
      try {
        const { command, args } = parseCommand(cliArgs);
        const parts = splitCommand(command);
        if (!parts.length) {
          throw new Error('CLI command is required.');
        }

        const [root, ...rest] = parts;
        switch (root) {
          case 'db': {
            if (!dbDispatcher?.dispatch) {
              throw new Error('DB dispatcher is unavailable.');
            }
            await dbDispatcher.dispatch({ commandParts: rest, args });
            return 0;
          }
          case 'runtime': {
            if (!runtimeDispatcher?.dispatch) {
              throw new Error('Runtime dispatcher is unavailable.');
            }
            await runtimeDispatcher.dispatch({ commandParts: rest, args });
            return 1;
          }
          default:
            throw new Error(`Unknown CLI command "${command}".`);
        }
      } catch (err) {
        logger.exception(NAMESPACE, ensureError(err));
        return 1;
      }
    };
  }
}
