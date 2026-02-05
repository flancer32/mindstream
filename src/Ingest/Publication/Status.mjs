/**
 * @module Mindstream_Back_Ingest_Publication_Status
 * @description Publication status registry for ingestion extraction workflow.
 */
export default class Mindstream_Back_Ingest_Publication_Status {
  constructor({}) {
    this.EXTRACT_PENDING = 'extract_pending';
    this.EXTRACTED = 'extracted';
    this.EXTRACT_FAILED = 'extract_failed';
    this.EXTRACT_BROKEN = 'extract_broken';

    this.list = [
      this.EXTRACT_PENDING,
      this.EXTRACTED,
      this.EXTRACT_FAILED,
      this.EXTRACT_BROKEN,
    ];
  }
}
