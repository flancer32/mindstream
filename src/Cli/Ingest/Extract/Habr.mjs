// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Ingest_Extract_Habr
 * @description CLI command to extract markdown from Habr publications.
 */
export default class Mindstream_Back_Cli_Ingest_Extract_Habr {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Ingest_Extract_Habr$} deps.extractHabr
 */
  constructor({ extractHabr }) {
    this.id = 'ingest:extract:habr';
    this.summary = 'Extract Habr publication text.';
    this.lifetime = 'finite';
    this.arguments = [];
    this.options = [];
    /**
 * @param {object} params
 * @returns {Promise<void>}
 */
    this.execute = async function () {
      await extractHabr.execute();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    extractHabr: 'Mindstream_Back_Ingest_Extract_Habr$',
  }),
});
