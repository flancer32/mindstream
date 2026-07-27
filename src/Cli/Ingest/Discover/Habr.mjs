// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Ingest_Discover_Habr
 * @description CLI command to discover Habr publications via RSS.
 */
export default class Mindstream_Back_Cli_Ingest_Discover_Habr {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Ingest_Discover_Habr$} deps.discoverHabr
 */
constructor({ discoverHabr }) {
    /**
 * @param {unknown} deps
 * @param {unknown} deps.args
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} params
 * @returns {Promise<unknown>}
 */
this.execute = async function (params = {}) {
      const { args } = params;
      if (Array.isArray(args) && args.length) {
        throw new Error('Command ingest:discover:habr does not accept arguments.');
      }
      await discoverHabr.execute();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    discoverHabr: 'Mindstream_Back_Ingest_Discover_Habr$',
  }),
});
