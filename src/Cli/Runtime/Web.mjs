// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Runtime_Web
 * @description CLI command to start runtime web server mode.
 */
export default class Mindstream_Back_Cli_Runtime_Web {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Web_Server$} deps.webServer
 */
constructor({ webServer }) {
    /**
 * @param {object} params
 * @returns {Promise<void>}
 */
this.execute = async function (params = {}) {
      const { args } = /** @type {{args: string[]}} */ (params);
      if (Array.isArray(args) && args.length) {
        throw new Error('Command runtime:web does not accept arguments.');
      }
      if (!webServer?.start) {
        throw new Error('Runtime web server is unavailable.');
      }
      await webServer.start();
      if (webServer?.wait) {
        await webServer.wait();
      } else {
        await new Promise(() => {});
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    webServer: 'Mindstream_Back_Web_Server$',
  }),
});
