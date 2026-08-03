// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Process_Generate_Summaries
 * @description CLI command to generate summaries for publications.
 */
export default class Mindstream_Back_Cli_Process_Generate_Summaries {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Process_Generate_Summaries$} deps.generator
 */
  constructor({ generator }) {
    this.id = 'process:generate:summaries';
    this.summary = 'Generate publication summaries.';
    this.lifetime = 'finite';
    this.arguments = [];
    this.options = [];
    /**
 * @param {object} params
 * @returns {Promise<void>}
 */
    this.execute = async function () {
      await generator.execute();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    generator: 'Mindstream_Back_Process_Generate_Summaries$',
  }),
});
