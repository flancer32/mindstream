// @ts-check
/**
 * @namespace Mindstream_Back_Web_Server
 * @description Starts the HTTP server and registers the API handler.
 */
export default class Mindstream_Back_Web_Server {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {Mindstream_Back_App_Configuration$} deps.config
 * @param {Fl32_Web_Back_Server$} deps.server
 * @param {Fl32_Web_Back_Config_Runtime__Factory$} deps.runtimeConfigFactory
 * @param {Fl32_Web_Back_PipelineEngine$} deps.pipelineEngine
 * @param {Mindstream_Back_Web_Handler$} deps.apiHandler
 * @param {Fl32_Web_Back_Handler_Static$} deps.staticHandler
 * @param {Fl32_Web_Back_Dto_Source__Factory$} deps.sourceFactory
 */
constructor({
    logger,
    config,
    server,
    runtimeConfigFactory,
    pipelineEngine,
    apiHandler,
    staticHandler,
    sourceFactory,
  }) {
    const NAMESPACE = 'Mindstream_Back_Web_Server';
    let started = false;

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
const buildServerConfig = function () {
      const cfg = config.get();
      const port = cfg?.server?.port;
      const type = cfg?.server?.type;
      runtimeConfigFactory.configure({ port, type });
      return runtimeConfigFactory.freeze();
    };

    /**
 * @returns {Promise<unknown>}
 */
/**
 * @returns {Promise<unknown>}
 */
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

    /**
 * @returns {Promise<unknown>}
 */
/**
 * @returns {Promise<unknown>}
 */
this.wait = async function () {
      await new Promise(() => {});
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    logger: 'Mindstream_Back_Logger$',
    config: 'Mindstream_Back_App_Configuration$',
    server: 'Fl32_Web_Back_Server$',
    runtimeConfigFactory: 'Fl32_Web_Back_Config_Runtime__Factory$',
    pipelineEngine: 'Fl32_Web_Back_PipelineEngine$',
    apiHandler: 'Mindstream_Back_Web_Handler$',
    staticHandler: 'Fl32_Web_Back_Handler_Static$',
    sourceFactory: 'Fl32_Web_Back_Dto_Source__Factory$',
  }),
});
