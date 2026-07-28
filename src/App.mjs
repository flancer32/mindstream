// @ts-check
/**
 * @namespace Mindstream_Back_App
 * @description Backend application composition root.
 */
export default class Mindstream_Back_App {
/**
 * @param {object} deps
 * @param {Mindstream_Back_App_Configuration$} deps.config
 * @param {Mindstream_Back_App_Cli_Dispatcher$} deps.cliDispatcher
 * @param {Mindstream_Back_Storage_Knex$} deps.knexProvider
 */
constructor({
    config,
    cliDispatcher,
    knexProvider,
  }) {
    /**
 * @param {object} params
 * @returns {Promise<number>}
 */
this.run = async function (params = {}) {
      const { cliArgs } = /** @type {{cliArgs: string[]}} */ (params);
      await config.init();
      if (!cliDispatcher?.dispatch) {
        throw new Error('CLI dispatcher is not available.');
      }
      return await cliDispatcher.dispatch({ cliArgs });
    };

    /**
 * @returns {Promise<void>}
 */
this.stop = async function () {
      if (knexProvider?.destroy) {
        await knexProvider.destroy();
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    config: 'Mindstream_Back_App_Configuration$',
    cliDispatcher: 'Mindstream_Back_App_Cli_Dispatcher$',
    knexProvider: 'Mindstream_Back_Storage_Knex$',
  }),
});
