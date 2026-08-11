// @ts-check
/**
 * @namespace Mindstream_Back_App_Plugin
 * @description Prepares application configuration and web handlers for every Teq CLI run.
 */
export default class Mindstream_Back_App_Plugin {
  /**
   * @param {object} deps
   * @param {TeqFw_Cfg_Loader$} deps.loader
   * @param {TeqFw_Cfg_Source_DotenvFile$} deps.dotenvSource
   * @param {TeqFw_Cfg_Source_ProcessEnv$} deps.processEnvSource
   * @param {TeqFw_Cli_Node_Fs} deps.fs
   * @param {TeqFw_Cli_Node_Path} deps.path
   * @param {Mindstream_Back_App_Configuration$} deps.config
   * @param {TeqFw_Web_Back_Config_Runtime__Factory$} deps.runtimeConfigFactory
   * @param {TeqFw_Web_Back_PipelineEngine$} deps.pipelineEngine
   * @param {Mindstream_Back_Web_Handler$} deps.apiHandler
   * @param {TeqFw_Web_Back_Handler_Static$} deps.staticHandler
   * @param {TeqFw_Web_Back_Dto_Source__Factory$} deps.sourceFactory
   * @param {Mindstream_Back_Storage_Database$} deps.database
   */
  constructor({
    loader,
    dotenvSource,
    processEnvSource,
    fs,
    path,
    config,
    runtimeConfigFactory,
    pipelineEngine,
    apiHandler,
    staticHandler,
    sourceFactory,
    database,
  }) {
    let started = false;

    this.onStartup = async function () {
      if (started) return;
      const dotenvPath = path.join(process.cwd(), '.env');
      let dotenv;
      try {
        await fs.access(dotenvPath);
        dotenv = dotenvSource.create({ path: dotenvPath, id: 'project-dotenv' });
      } catch (error) {
        if (!(error instanceof Error) || /** @type {NodeJS.ErrnoException} */ (error).code !== 'ENOENT') throw error;
      }
      await loader.load([
        ...(dotenv ? [dotenv] : []),
        processEnvSource.create(process.env),
      ]);
      await database.init();
      await config.init();

      const cfg = config.get();
      runtimeConfigFactory.configure({ port: cfg.server.port, type: cfg.server.type });
      const webSource = sourceFactory.create({
        root: './web',
        prefix: '/',
        allow: { '.': ['app', 'bootstrap.mjs', 'favicon.ico', 'index.html', 'ui'] },
        defaults: ['index.html'],
      });
      const diSource = sourceFactory.create({
        root: './node_modules/@teqfw/di/src',
        prefix: '/vendor/teqfw-di/',
        allow: { '.': ['.'] },
      });
      await staticHandler.init({ sources: [webSource, diSource] });
      pipelineEngine.addHandler(apiHandler);
      pipelineEngine.addHandler(staticHandler);
      started = true;
    };

    this.onShutdown = async function () {
      await database.destroy();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    loader: 'TeqFw_Cfg_Loader$',
    dotenvSource: 'TeqFw_Cfg_Source_DotenvFile$',
    processEnvSource: 'TeqFw_Cfg_Source_ProcessEnv$',
    fs: 'node:fs/promises',
    path: 'node:path',
    config: 'Mindstream_Back_App_Configuration$',
    runtimeConfigFactory: 'TeqFw_Web_Back_Config_Runtime__Factory$',
    pipelineEngine: 'TeqFw_Web_Back_PipelineEngine$',
    apiHandler: 'Mindstream_Back_Web_Handler$',
    staticHandler: 'TeqFw_Web_Back_Handler_Static$',
    sourceFactory: 'TeqFw_Web_Back_Dto_Source__Factory$',
    database: 'Mindstream_Back_Storage_Database$',
  }),
});
