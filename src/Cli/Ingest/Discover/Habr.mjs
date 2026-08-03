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
    this.id = 'ingest:discover:habr';
    this.summary = 'Discover Habr publications through RSS.';
    this.lifetime = 'finite';
    this.arguments = [];
    this.options = [];
    /**
 * @param {object} params
 * @returns {Promise<void>}
 */
    this.execute = async function () {
      await discoverHabr.execute();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    discoverHabr: 'Mindstream_Back_Ingest_Discover_Habr$',
  }),
});
