// @ts-check

/** @namespace Mindstream_Back_Storage_Database */
export default class Mindstream_Back_Storage_Database {
  /**
   * @param {object} deps
   * @param {TeqFw_Db_Back_Config} deps.config
   * @param {TeqFw_Db_Back_RDb_Connect} deps.connection
   */
  constructor({ config, connection }) {
    let initialized = false;
    this.init = async function () {
      if (initialized) return;
      await connection.init(config.get());
      initialized = true;
    };
    this.getConnection = function () {
      if (!initialized) throw new Error('Mindstream database connection is not initialized.');
      return connection;
    };
    this.get = function () { return this.getConnection().getKnex(); };
    this.destroy = async function () {
      if (!initialized) return;
      initialized = false;
      await connection.disconnect();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({ config: 'TeqFw_Db_Back_Config$', connection: 'TeqFw_Db_Back_RDb_Connect$' }),
});
