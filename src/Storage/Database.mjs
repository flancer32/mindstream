// @ts-check

/** @namespace Mindstream_Back_Storage_Database */
export default class Mindstream_Back_Storage_Database {
  /**
   * @param {object} deps
   * @param {Mindstream_Back_Storage_DemDatabase$} deps.demDatabase
   * @param {TeqFw_Cli_Config$} deps.runtime
   */
  constructor({ demDatabase, runtime }) {
    let initialized = false;
    this.init = async function () {
      if (initialized) return;
      await demDatabase.initialize({ hostRoot: runtime.applicationRoot, scope: 'mindstream' });
      initialized = true;
    };
    this.getBackend = function () {
      if (!initialized) throw new Error('Mindstream DEM-RDB storage is not initialized.');
      return demDatabase.getBackend();
    };
    this.get = function () {
      if (!initialized) throw new Error('Mindstream DEM-RDB storage is not initialized.');
      return demDatabase.getClient();
    };
    this.destroy = async function () {
      if (!initialized) return;
      initialized = false;
      await demDatabase.close();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({ demDatabase: 'Mindstream_Back_Storage_DemDatabase$', runtime: 'TeqFw_Cli_Config$' }),
});
