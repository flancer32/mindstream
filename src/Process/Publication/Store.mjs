// @ts-check
/**
 * @namespace Mindstream_Back_Process_Publication_Store
 * @description Provides publication selection for summary and embedding generation.
 */
export default class Mindstream_Back_Process_Publication_Store {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Storage_Knex$} deps.knexProvider
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {Mindstream_Back_Process_Publication_Status$} deps.statusCatalog
 */
constructor({
    knexProvider,
    logger,
    statusCatalog,
  }) {
    const NAMESPACE = 'Mindstream_Back_Process_Publication_Store';

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
const getKnex = function () {
      return knexProvider.get();
    };

    /**
 * @param {unknown} value
 * @returns {unknown}
 */
/**
 * @param {unknown} value
 * @returns {unknown}
 */
const normalizeLimit = function (value) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
      return 4;
    };

    /**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
/**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
const normalizeId = function (value, name) {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        throw new Error(`${name} must be a number.`);
      }
      return num;
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.limit
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} params
 * @returns {Promise<unknown>}
 */
this.listForSummaries = async function (params = {}) {
      const { limit } = params;
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

    /**
 * @param {unknown} deps
 * @param {unknown} deps.limit
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} params
 * @returns {Promise<unknown>}
 */
this.listForEmbeddings = async function (params = {}) {
      const { limit } = params;
      const pageSize = normalizeLimit(limit);
      const knexRef = getKnex();
      const query = knexRef('publications as p')
        .join('publication_summaries as s', 'p.id', 's.publication_id')
        .leftJoin('publication_embeddings as e', 'p.id', 'e.publication_id')
        .select('p.id', 'p.status', 's.overview', 's.annotation')
        .whereNotNull('s.overview')
        .whereNotNull('s.annotation')
        .whereNull('e.publication_id')
        .orderBy('p.id', 'asc')
        .limit(pageSize);

      const statusFilter = [];
      if (statusCatalog?.SUMMARY_READY) {
        statusFilter.push(statusCatalog.SUMMARY_READY);
      }
      if (statusCatalog?.EMBEDDING_PENDING) {
        statusFilter.push(statusCatalog.EMBEDDING_PENDING);
      }
      if (statusFilter.length) {
        query.whereIn('p.status', statusFilter);
      }

      const rows = await query;
      if (!rows?.length) {
        logger.info(NAMESPACE, 'No publications pending embeddings.');
      }
      return rows ?? [];
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.id
 * @param {unknown} deps.status
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} deps
 * @param {unknown} deps.id
 * @param {unknown} deps.status
 * @returns {Promise<unknown>}
 */
this.updateStatus = async function ({ id, status }) {
      const pubId = normalizeId(id, 'Publication id');
      if (!status || typeof status !== 'string') {
        throw new Error('Publication status must be a string.');
      }
      await getKnex()('publications').where({ id: pubId }).update({ status });
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    knexProvider: 'Mindstream_Back_Storage_Knex$',
    logger: 'Mindstream_Back_Logger$',
    statusCatalog: 'Mindstream_Back_Process_Publication_Status$',
  }),
});
