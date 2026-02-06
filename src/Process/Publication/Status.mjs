/**
 * @module Mindstream_Back_Process_Publication_Status
 * @description Publication status registry for summary generation workflow.
 */
export default class Mindstream_Back_Process_Publication_Status {
  constructor({}) {
    this.SUMMARY_FAILED = 'summary_failed';
    this.SUMMARY_READY = 'summary_ready';

    this.list = [this.SUMMARY_FAILED, this.SUMMARY_READY];
  }
}
