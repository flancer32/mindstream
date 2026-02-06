/**
 * @module Mindstream_Back_Process_Publication_Status
 * @description Publication status registry for summary and embedding workflows.
 */
export default class Mindstream_Back_Process_Publication_Status {
  constructor({}) {
    this.SUMMARY_FAILED = 'summary_failed';
    this.SUMMARY_READY = 'summary_ready';
    this.EMBEDDING_PENDING = 'embedding_pending';
    this.EMBEDDING_DONE = 'embedding_done';
    this.EMBEDDING_FAILED = 'embedding_failed';

    this.list = [
      this.SUMMARY_FAILED,
      this.SUMMARY_READY,
      this.EMBEDDING_PENDING,
      this.EMBEDDING_DONE,
      this.EMBEDDING_FAILED,
    ];
  }
}
