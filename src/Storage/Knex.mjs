/**
 * @module Mindstream_Back_Storage_Knex
 * @description Provides a singleton knex instance for the Storage layer.
 */
export default class Mindstream_Back_Storage_Knex {
  constructor({ "node:knex": knexModule, Mindstream_Back_App_Configuration$: config }) {
    const knexFactory = knexModule?.default ?? knexModule;
    let knexInstance = null;

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

    const ensureInstance = function () {
      if (!knexInstance) {
        knexInstance = knexFactory(buildConfig());
      }
      return knexInstance;
    };

    this.get = function () {
      return ensureInstance();
    };

    this.destroy = async function () {
      if (!knexInstance) return;
      const instance = knexInstance;
      knexInstance = null;
      await instance.destroy();
    };
  }
}
