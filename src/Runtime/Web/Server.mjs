/**
 * @module Mindstream_Back_Runtime_Web_Server
 * @description Starts the runtime HTTP server using @flancer32/teq-web.
 */
export default class Mindstream_Back_Runtime_Web_Server {
  constructor({
    Mindstream_Shared_Logger$: logger,
    Mindstream_Back_App_Configuration$: config,
    Fl32_Web_Back_Server$: server,
    Fl32_Web_Back_Server_Config$: serverConfigFactory,
    Mindstream_Back_Runtime_Web_HandlerRegistry$: handlerRegistry,
  }) {
    const NAMESPACE = 'Mindstream_Back_Runtime_Web_Server';
    let started = false;

    const buildServerConfig = function () {
      const cfg = config.get();
      const port = cfg?.server?.port;
      return serverConfigFactory.create({ port });
    };

    this.start = async function () {
      if (started) {
        throw new Error('Runtime web server is already started.');
      }
      if (!handlerRegistry?.register) {
        throw new Error('Runtime web handler registry is unavailable.');
      }
      await handlerRegistry.register();
      await server.start(buildServerConfig());
      started = true;
      if (logger?.info) {
        logger.info(NAMESPACE, 'Runtime web server started.');
      }
    };

    this.wait = async function () {
      await new Promise(() => {});
    };
  }
}
