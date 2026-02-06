/**
 * @module Mindstream_Back_Cli_Runtime_Web
 * @description CLI command to start runtime web server mode.
 */
export default class Mindstream_Back_Cli_Runtime_Web {
  constructor({ Mindstream_Back_Web_Server$: webServer }) {
    this.execute = async function ({ args } = {}) {
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
