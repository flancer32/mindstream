// @ts-check

/** @namespace Mindstream_Back_Process_Publication_RetentionCleanup */
export default class Mindstream_Back_Process_Publication_RetentionCleanup {
  /**
   * @param {object} deps
   * @param {Mindstream_Back_Storage_Database$} deps.database
   * @param {Mindstream_Back_Ingest_Publication_Retention$} deps.retention
   * @param {Mindstream_Back_Ingest_Publication_IdAllocator$} deps.idAllocator
   * @param {Mindstream_Back_Logger$} deps.logger
   */
  constructor({database, retention, idAllocator, logger}) {
    this.execute = async function ({now = new Date()} = {}) {
      const cutoff = retention.getCutoff({now});
      const deleted = await database.get().transaction(async (trx) => {
        await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', ['mindstream_publication']);
        await idAllocator.ensure(trx);
        return trx('mindstream_publication')
          .whereRaw('COALESCE(??, ??) <= ?', ['rss_published_at', 'discovered_at', cutoff])
          .del();
      });
      logger.info('Mindstream_Back_Process_Publication_RetentionCleanup', `Removed ${deleted} publications at or before ${cutoff}.`);
      return {deleted, cutoff};
    };
  }
}

export const __deps__ = Object.freeze({default: Object.freeze({
  database: 'Mindstream_Back_Storage_Database$',
  retention: 'Mindstream_Back_Ingest_Publication_Retention$',
  idAllocator: 'Mindstream_Back_Ingest_Publication_IdAllocator$',
  logger: 'Mindstream_Back_Logger$',
})});
