// @ts-check
/**
 * @namespace Mindstream_Back_Web_Server
 * @description Starts the HTTP server and registers the API handler.
 */
export default class Mindstream_Back_Web_Server {
  constructor({
    Mindstream_Shared_Logger$: logger,
    Mindstream_Back_App_Configuration$: config,
    Fl32_Web_Back_Server$: server,
    Fl32_Web_Back_Config_Runtime__Factory$: runtimeConfigFactory,
    Fl32_Web_Back_PipelineEngine$: pipelineEngine,
    Mindstream_Back_Web_Handler$: apiHandler,
    Fl32_Web_Back_Handler_Static$: staticHandler,
    Fl32_Web_Back_Dto_Source__Factory$: sourceFactory,
  }) {
    const NAMESPACE = 'Mindstream_Back_Web_Server';
    let started = false;

    const buildServerConfig = function () {
      const cfg = config.get();
      const port = cfg?.server?.port;
      const type = cfg?.server?.type;
      runtimeConfigFactory.configure({ port, type });
      return runtimeConfigFactory.freeze();
    };

    this.start = async function () {
      if (started) {
        throw new Error('Web server is already started.');
      }
      const webSource = sourceFactory.create({
        root: './web',
        prefix: '/',
        allow: { '.': ['app', 'bootstrap.mjs', 'favicon.ico', 'index.html', 'ui'] },
        defaults: ['index.html'],
      });
      const diSource = sourceFactory.create({
        root: './node_modules/@teqfw/di/dist',
        prefix: '/vendor/teqfw-di/',
        allow: { '.': ['esm.js'] },
      });
      await staticHandler.init({ sources: [webSource, diSource] });
      pipelineEngine.addHandler(apiHandler);
      pipelineEngine.addHandler(staticHandler);
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

export const __deps__ = Object.freeze({
  default: {
    'Mindstream_Shared_Logger$': 'Mindstream_Shared_Logger$',
    'Mindstream_Back_App_Configuration$': 'Mindstream_Back_App_Configuration$',
    'Fl32_Web_Back_Server$': 'Fl32_Web_Back_Server$',
    'Fl32_Web_Back_Config_Runtime__Factory$': 'Fl32_Web_Back_Config_Runtime__Factory$',
    'Fl32_Web_Back_PipelineEngine$': 'Fl32_Web_Back_PipelineEngine$',
    'Mindstream_Back_Web_Handler$': 'Mindstream_Back_Web_Handler$',
    'Fl32_Web_Back_Handler_Static$': 'Fl32_Web_Back_Handler_Static$',
    'Fl32_Web_Back_Dto_Source__Factory$': 'Fl32_Web_Back_Dto_Source__Factory$',
  },
});
