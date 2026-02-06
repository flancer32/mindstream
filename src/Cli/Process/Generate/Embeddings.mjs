/**
 * @module Mindstream_Back_Cli_Process_Generate_Embeddings
 * @description CLI command to generate embeddings for publications.
 */
export default class Mindstream_Back_Cli_Process_Generate_Embeddings {
  constructor({ Mindstream_Back_Process_Generate_Embeddings$: generator }) {
    this.execute = async function ({ args } = {}) {
      if (Array.isArray(args) && args.length) {
        throw new Error('Command process:generate:embeddings does not accept arguments.');
      }
      await generator.execute();
    };
  }
}
