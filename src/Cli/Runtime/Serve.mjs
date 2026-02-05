/**
 * @module Mindstream_Back_Cli_Runtime_Serve
 * @description CLI command to start runtime execution.
 */
export default class Mindstream_Back_Cli_Runtime_Serve {
  constructor({}) {
    this.execute = async function ({ args } = {}) {
      if (Array.isArray(args) && args.length) {
        throw new Error('Command runtime:serve does not accept arguments.');
      }
      throw new Error('Command runtime:serve is not implemented.');
    };
  }
}
