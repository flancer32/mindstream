/**
 * @module Mindstream_Back_Cli_Ingest_Extract_Habr
 * @description CLI command to extract markdown from Habr publications.
 */
export default class Mindstream_Back_Cli_Ingest_Extract_Habr {
  constructor({ Mindstream_Back_Ingest_Extract_Habr$: extractHabr }) {
    this.execute = async function ({ args } = {}) {
      if (Array.isArray(args) && args.length) {
        throw new Error('Command ingest:extract:habr does not accept arguments.');
      }
      await extractHabr.execute();
    };
  }
}
