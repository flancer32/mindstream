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
        throw new Error('Command ingest:extract:habr does not accept arguments.');
      }
      await extractHabr.execute();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    extractHabr: 'Mindstream_Back_Ingest_Extract_Habr$',
  }),
});
