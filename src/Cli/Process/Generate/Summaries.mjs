/**
 * @module Mindstream_Back_Cli_Process_Generate_Summaries
 * @description CLI command to generate summaries for publications.
 */
export default class Mindstream_Back_Cli_Process_Generate_Summaries {
  constructor({ Mindstream_Back_Process_Generate_Summaries$: generator }) {
    this.execute = async function ({ args } = {}) {
      if (Array.isArray(args) && args.length) {
        throw new Error('Command process:generate:summaries does not accept arguments.');
      }
      await generator.execute();
    };
  }
}
