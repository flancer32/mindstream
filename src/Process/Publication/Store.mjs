/**
 * @module Mindstream_Back_Process_Publication_Store
 * @description Provides publication selection for summary generation.
 */
export default class Mindstream_Back_Process_Publication_Store {
  constructor({
    Mindstream_Back_Storage_Knex$: knexProvider,
    Mindstream_Shared_Logger$: logger,
    Mindstream_Back_Process_Publication_Status$: statusCatalog,
  }) {
    const NAMESPACE = 'Mindstream_Back_Process_Publication_Store';

    const getKnex = function () {
      return knexProvider.get();
    };

    const normalizeLimit = function (value) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
      return 4;
    };

    const normalizeId = function (value, name) {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        throw new Error(`${name} must be a number.`);
      }
      return num;
    };

    this.listForSummaries = async function ({ limit } = {}) {
      const pageSize = normalizeLimit(limit);
      const knexRef = getKnex();
      const query = knexRef('publications as p')
        .join('publication_extractions as e', 'p.id', 'e.publication_id')
        .leftJoin('publication_summaries as s', 'p.id', 's.publication_id')
        .select('p.id', 'p.status', 'e.md_text')
        .whereNotNull('e.md_text')
        .whereNull('s.publication_id')
        .orderBy('p.id', 'asc')
        .limit(pageSize);

      if (statusCatalog?.SUMMARY_FAILED) {
        query.whereNot('p.status', statusCatalog.SUMMARY_FAILED);
      }

      const rows = await query;
      if (!rows?.length) {
        logger.info(NAMESPACE, 'No publications pending summaries.');
      }
      return rows ?? [];
    };

    this.updateStatus = async function ({ id, status }) {
      const pubId = normalizeId(id, 'Publication id');
      if (!status || typeof status !== 'string') {
        throw new Error('Publication status must be a string.');
      }
      await getKnex()('publications').where({ id: pubId }).update({ status });
    };
  }
}
