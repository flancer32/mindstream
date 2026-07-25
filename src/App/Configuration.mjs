// @ts-check
/**
 * @LLM-DOC: Normative configuration structure is defined in `ctx/docs/code/configuration/structure.md`.
 * @namespace Mindstream_Back_App_Configuration
 * @description Backend application configuration singleton built from @teqfw/cfg namespace projections.
 */
export default class Mindstream_Back_App_Configuration {
  /**
   * @param {Object} deps
   * @param {TeqFw_Cfg_Reader} deps.reader
   */
  constructor({ reader }) {
    let initialized = false;
    let config = null;

    /** @param {unknown} value @returns {string|undefined} */
    const coerceString = function (value) {
      return value === undefined || value === null ? undefined : String(value);
    };

    /** @param {unknown} value @returns {number|undefined} */
    const coercePort = function (value) {
      if (value === undefined || value === null || value === '') return undefined;
      const parsed = Number.parseInt(String(value), 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    /** @param {any} value @returns {any} */
    const freezeConfig = function (value) {
      Object.freeze(value.server);
      Object.freeze(value.db);
      Object.freeze(value.llm);
      return Object.freeze(value);
    };

    /** @returns {Promise<void>} */
    this.init = async function () {
      if (initialized) return;
      const server = reader.get('TEQFW_WEB');
      const mindstream = reader.get('MINDSTREAM');
      config = freezeConfig({
        server: { port: coercePort(server.PORT), type: coerceString(server.TYPE) },
        db: {
          client: coerceString(mindstream.DB_CLIENT), host: coerceString(mindstream.DB_HOST), port: coercePort(mindstream.DB_PORT),
          database: coerceString(mindstream.DB_DATABASE), user: coerceString(mindstream.DB_USER), password: coerceString(mindstream.DB_PASSWORD),
        },
        llm: {
          apiKey: coerceString(mindstream.LLM_API_KEY), baseUrl: coerceString(mindstream.LLM_BASE_URL),
          generationModel: coerceString(mindstream.LLM_GENERATION_MODEL), embeddingModel: coerceString(mindstream.LLM_EMBEDDING_MODEL),
        },
      });
      initialized = true;
    };

    /** @returns {Readonly<any>} */
    this.get = function () {
      if (!initialized) throw new Error('Mindstream_Back_App_Configuration is not initialized.');
      return config;
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({ reader: 'TeqFw_Cfg_Reader$' }),
});
