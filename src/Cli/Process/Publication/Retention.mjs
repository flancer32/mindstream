// @ts-check

/** @namespace Mindstream_Back_Cli_Process_Publication_Retention */
export default class Mindstream_Back_Cli_Process_Publication_Retention {
  /**
   * @param {object} deps
   * @param {Mindstream_Back_Process_Publication_RetentionCleanup$} deps.cleanup
   */
  constructor({cleanup}) {
    this.id = 'maintenance:retention';
    this.summary = 'Remove publications and dependent data older than 100 days.';
    this.lifetime = 'finite';
    this.arguments = [];
    this.options = [];
    this.execute = async function () {
      await cleanup.execute();
    };
  }
}

export const __deps__ = Object.freeze({default: Object.freeze({
  cleanup: 'Mindstream_Back_Process_Publication_RetentionCleanup$',
})});
