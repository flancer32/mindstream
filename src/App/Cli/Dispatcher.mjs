// @ts-check
/**
 * @namespace Mindstream_Back_App_Cli_Dispatcher
 * @description Root CLI dispatcher for the backend application.
 */
export default class Mindstream_Back_App_Cli_Dispatcher {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {Mindstream_Back_Cli_Db$} deps.dbDispatcher
 * @param {Mindstream_Back_Cli_Ingest$} deps.ingestDispatcher
 * @param {Mindstream_Back_Cli_Process$} deps.processDispatcher
 * @param {Mindstream_Back_Cli_Runtime$} deps.runtimeDispatcher
 */
constructor({
    logger,
    dbDispatcher,
    ingestDispatcher,
    processDispatcher,
    runtimeDispatcher,
  }) {
    const NAMESPACE = 'Mindstream_Back_App_Cli_Dispatcher';

    /**
 * @param {unknown} err
 * @returns {Error}
 */
const ensureError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

    /**
 * @param {unknown} cliArgs
 * @returns {string[]}
 */
const normalizeArgs = function (cliArgs) {
      if (!Array.isArray(cliArgs)) return [];
      return cliArgs.filter((value) => value !== undefined && value !== null).map(String);
    };

    /**
 * @param {unknown} cliArgs
 * @returns {object}
 */
const parseCommand = function (cliArgs) {
      const [command, ...args] = normalizeArgs(cliArgs);
      if (!command) {
        throw new Error('CLI command is required.');
      }
      return { command, args };
    };

    /**
 * @param {unknown} command
 * @returns {string[]}
 */
const splitCommand = function (command) {
      return String(command)
        .split(':')
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
    };

    /**
 * @param {object} params
 * @returns {Promise<number>}
 */
this.dispatch = async function (params = {}) {
      const { cliArgs } = /** @type {{cliArgs: string[]}} */ (params);
      try {
        const { command, args } = /** @type {{command: string, args: string[]}} */ (parseCommand(cliArgs));
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
          case 'ingest': {
            if (!ingestDispatcher?.dispatch) {
              throw new Error('Ingest dispatcher is unavailable.');
            }
            await ingestDispatcher.dispatch({ commandParts: rest, args });
            return 0;
          }
          case 'process': {
            if (!processDispatcher?.dispatch) {
              throw new Error('Process dispatcher is unavailable.');
            }
            await processDispatcher.dispatch({ commandParts: rest, args });
            return 0;
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

export const __deps__ = Object.freeze({
  default: Object.freeze({
    logger: 'Mindstream_Back_Logger$',
    dbDispatcher: 'Mindstream_Back_Cli_Db$',
    ingestDispatcher: 'Mindstream_Back_Cli_Ingest$',
    processDispatcher: 'Mindstream_Back_Cli_Process$',
    runtimeDispatcher: 'Mindstream_Back_Cli_Runtime$',
  }),
});
