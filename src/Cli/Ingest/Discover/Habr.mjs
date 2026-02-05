/**
 * @module Mindstream_Back_Cli_Ingest_Discover_Habr
 * @description CLI command to discover Habr publications via RSS.
 */
export default class Mindstream_Back_Cli_Ingest_Discover_Habr {
  constructor({ Mindstream_Back_Ingest_Discover_Habr$: discoverHabr }) {
    this.execute = async function ({ args } = {}) {
      if (Array.isArray(args) && args.length) {
        throw new Error('Command ingest:discover:habr does not accept arguments.');
      }
      await discoverHabr.execute();
    };
  }
}
