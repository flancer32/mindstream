/**
 * @module Mindstream_Back_App_Configuration
 * @description Backend application configuration singleton.
 */
export default class Mindstream_Back_App_Configuration {
  /**
   * @LLM-DOC: Normative configuration structure is defined in `ctx/docs/code/configuration/structure.md`.
   * @LLM-DOC: The structure described there is authoritative for this module.
   */
  constructor({ 'node:process': processModule }) {
    const processRef = processModule?.default ?? processModule;

    const DEFAULTS = Object.freeze({
      server: Object.freeze({
        port: 3000,
      }),
      db: Object.freeze({
        client: '',
        host: '',
        port: 0,
        database: '',
        user: '',
        password: '',
      }),
      llm: Object.freeze({
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        model: '',
      }),
    });

    let _initialized = false;
    let _config = null;

    const ensureInitialized = function () {
      if (!_initialized) {
        throw new Error('Mindstream_Back_App_Configuration is not initialized.');
      }
    };

    const coerceString = function (value, fallback) {
      if (value === undefined || value === null || value === '') return fallback;
      return String(value);
    };

    const coercePort = function (value, fallback) {
      if (value === undefined || value === null || value === '') return fallback;
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const freezeConfig = function (config) {
      Object.freeze(config.server);
      Object.freeze(config.db);
      Object.freeze(config.llm);
      return Object.freeze(config);
    };

    this.init = async function (projectRoot) {
      if (_initialized) return;
      void projectRoot;

      const env = processRef?.env ?? {};
      _config = freezeConfig({
        server: {
          port: coercePort(env.SERVER_PORT, DEFAULTS.server.port),
        },
        db: {
          client: coerceString(env.DB_CLIENT, DEFAULTS.db.client),
          host: coerceString(env.DB_HOST, DEFAULTS.db.host),
          port: coercePort(env.DB_PORT, DEFAULTS.db.port),
          database: coerceString(env.DB_DATABASE, DEFAULTS.db.database),
          user: coerceString(env.DB_USER, DEFAULTS.db.user),
          password: coerceString(env.DB_PASSWORD, DEFAULTS.db.password),
        },
        llm: {
          apiKey: coerceString(env.LLM_API_KEY, DEFAULTS.llm.apiKey),
          baseUrl: coerceString(env.LLM_BASE_URL, DEFAULTS.llm.baseUrl),
          model: coerceString(env.LLM_MODEL, DEFAULTS.llm.model),
        },
      });

      _initialized = true;
    };

    this.get = function () {
      ensureInitialized();
      return _config;
    };
  }
}
