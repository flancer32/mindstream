/**
 * @module Mindstream_Back_Web_Server
 * @description Starts the HTTP server and registers the API handler.
 */
export default class Mindstream_Back_Web_Server {
  constructor({
    Mindstream_Shared_Logger$: logger,
    Mindstream_Back_App_Configuration$: config,
    Fl32_Web_Back_Server$: server,
    Fl32_Web_Back_Server_Config$: serverConfigFactory,
    Fl32_Web_Back_Dispatcher$: dispatcher,
    Mindstream_Back_Web_Handler$: apiHandler,
  }) {
    const NAMESPACE = 'Mindstream_Back_Web_Server';
    let started = false;

    const buildServerConfig = function () {
      const cfg = config.get();
      const port = cfg?.server?.port;
      const type = cfg?.server?.type;
      return serverConfigFactory.create({ port, type });
    };

    this.start = async function () {
      if (started) {
        throw new Error('Web server is already started.');
      }
      dispatcher.addHandler(apiHandler);
      await server.start(buildServerConfig());
      started = true;
      if (logger?.info) {
        logger.info(NAMESPACE, 'Web server started.');
      }
    };

    this.wait = async function () {
      await new Promise(() => {});
    };
  }
}
