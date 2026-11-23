// @ts-check

/** @namespace Mindstream_Back_Storage_DemDatabase */
export default class Mindstream_Back_Storage_DemDatabase {
  /**
   * @param {object} deps
   * @param {TeqFw_Dem_Acquire$} deps.acquire
   * @param {TeqFw_Dem_Registry$} deps.registry
   * @param {TeqFw_Dem_RDb_Type_Vector_Provider$} deps.vectorTypes
   * @param {TeqFw_Dem_Compile$} deps.compile
   * @param {TeqFw_Dem_Repository_Runtime$} deps.runtime
   * @param {TeqFw_Dem_RDb_Type_Vector_Handler$} deps.vectorHandler
   * @param {TeqFw_Dem_RDb_Config$} deps.config
   * @param {TeqFw_Dem_RDb_Connection$} deps.connection
   * @param {TeqFw_Dem_RDb_Adapter$} deps.adapter
   * @param {Mindstream_Back_Logger$} deps.logger
   */
  constructor({ acquire, registry, vectorTypes, compile, runtime, vectorHandler, config, connection, adapter, logger }) {
    /** @type {any} */
    let backend;
    let state = 'new';
    let compilation;
    let boundRuntime;

    /** @param {unknown} error @param {string} action */
    const logCleanupFailure = (error, action) => {
      logger.error('Mindstream_Back_Storage_DemDatabase', `Failed to ${action} after DEM storage initialization failed.`, {
        error: error instanceof Error ? error.message : String(error),
      });
    };

    this.initialize = async function ({ hostRoot, scope }) {
      if (state !== 'new') throw new Error(`DEM storage cannot initialize while in state '${state}'.`);
      if (typeof hostRoot !== 'string' || !hostRoot || typeof scope !== 'string' || !scope) {
        throw new TypeError('A host root and nonempty DEM storage scope are required.');
      }

      state = 'initializing';
      let connectionAttempted = false;
      try {
        registry.register(vectorTypes.getDefinitions());
        registry.finalize();

        const inputs = await acquire.exec({ hostRoot });
        compilation = await compile.exec(inputs);
        compile.assertResult({ value: compilation });

        boundRuntime = runtime.bind({
          model: compilation.model,
          registry,
          handlers: [vectorHandler],
        });

        connectionAttempted = true;
        await connection.init(config.get());
        backend = await adapter.open({ model: compilation.model, runtime: boundRuntime, connection });
        const history = await backend.initialize({ scope, compilation });
        state = 'ready';
        return { backend, compilation, history };
      } catch (error) {
        if (backend) {
          try { await backend.close(); } catch (closeError) { logCleanupFailure(closeError, 'close the backend'); }
          backend = undefined;
        }
        if (connectionAttempted) {
          try { await connection.disconnect(); } catch (disconnectError) { logCleanupFailure(disconnectError, 'disconnect the database'); }
        }
        state = 'failed';
        throw error;
      }
    };

    this.getBackend = function () {
      if (state !== 'ready' || !backend) throw new Error('DEM storage is not initialized.');
      return backend;
    };

    this.getClient = function () {
      if (state !== 'ready') throw new Error('DEM storage is not initialized.');
      return connection.getClient();
    };

    this.getCompilation = function () {
      if (state !== 'ready' || !compilation) throw new Error('DEM storage is not initialized.');
      return compilation;
    };

    this.openBackend = async function ({ connection: scopedConnection }) {
      if (state !== 'ready' || !compilation || !boundRuntime) throw new Error('DEM storage is not initialized.');
      return adapter.open({ model: compilation.model, runtime: boundRuntime, connection: scopedConnection });
    };

    this.close = async function () {
      if (state !== 'ready') return;
      state = 'closed';
      const ownedBackend = backend;
      backend = undefined;
      compilation = undefined;
      boundRuntime = undefined;
      let failure;
      try { await ownedBackend.close(); } catch (error) { failure = error; }
      try { await connection.disconnect(); } catch (error) { failure ??= error; }
      if (failure) throw failure;
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    acquire: 'TeqFw_Dem_Acquire$',
    registry: 'TeqFw_Dem_Registry$',
    vectorTypes: 'TeqFw_Dem_RDb_Type_Vector_Provider$',
    compile: 'TeqFw_Dem_Compile$',
    runtime: 'TeqFw_Dem_Repository_Runtime$',
    vectorHandler: 'TeqFw_Dem_RDb_Type_Vector_Handler$',
    config: 'TeqFw_Dem_RDb_Config$',
    connection: 'TeqFw_Dem_RDb_Connection$',
    adapter: 'TeqFw_Dem_RDb_Adapter$',
    logger: 'Mindstream_Back_Logger$',
  }),
});
