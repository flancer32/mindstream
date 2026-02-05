export default class Mindstream_Back_App {
  /**
   * @param {Object} deps
   * @param {Mindstream_Back_App_Configuration} deps.Mindstream_Back_App_Configuration$
   *        Application configuration service.
   * @param {Mindstream_Back_App_Cli_Dispatcher} deps.Mindstream_Back_App_Cli_Dispatcher$
   *        CLI dispatcher responsible for command parsing and execution.
   */
  constructor({
    Mindstream_Back_App_Configuration$: config,
    Mindstream_Back_App_Cli_Dispatcher$: cliDispatcher,
  }) {
    this.run = async function ({ projectRoot, cliArgs } = {}) {
      await config.init(projectRoot);
      if (!cliDispatcher?.dispatch) {
        throw new Error('CLI dispatcher is not available.');
      }
      return await cliDispatcher.dispatch({ cliArgs });
    };

    this.stop = async function () {
    };
  }
}
