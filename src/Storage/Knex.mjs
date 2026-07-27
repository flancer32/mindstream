// @ts-check
/**
 * @namespace Mindstream_Back_Storage_Knex
 * @description Provides a singleton knex instance for the Storage layer.
 */
export default class Mindstream_Back_Storage_Knex {
/**
 * @param {object} deps
 * @param {typeof import("knex")} deps.knexModule
 * @param {Mindstream_Back_App_Configuration$} deps.config
 */
constructor({ knexModule, config }) {
    const knexFactory = knexModule?.default ?? knexModule;
    let knexInstance = null;

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
const buildConfig = function () {
      const cfg = config.get();
      const db = cfg?.db ?? {};
      return {
        client: db.client,
        connection: {
          host: db.host,
          port: db.port,
          database: db.database,
          user: db.user,
          password: db.password,
        },
      };
    };

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
const ensureInstance = function () {
      if (!knexInstance) {
        knexInstance = knexFactory(buildConfig());
      }
      return knexInstance;
    };

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
this.get = function () {
      return ensureInstance();
    };

    /**
 * @returns {Promise<unknown>}
 */
/**
 * @returns {Promise<unknown>}
 */
this.destroy = async function () {
      if (!knexInstance) return;
      const instance = knexInstance;
      knexInstance = null;
      await instance.destroy();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    knexModule: 'npm:knex',
    config: 'Mindstream_Back_App_Configuration$',
  }),
});
