// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Process_Generate_Embeddings
 * @description CLI command to generate embeddings for publications.
 */
export default class Mindstream_Back_Cli_Process_Generate_Embeddings {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Process_Generate_Embeddings$} deps.generator
 */
constructor({ generator }) {
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
        throw new Error('Command process:generate:embeddings does not accept arguments.');
      }
      await generator.execute();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    generator: 'Mindstream_Back_Process_Generate_Embeddings$',
  }),
});
