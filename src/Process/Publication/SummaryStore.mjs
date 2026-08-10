// @ts-check
/**
 * @namespace Mindstream_Back_Process_Publication_SummaryStore
 * @description Persists generated summaries for publications.
 */
export default class Mindstream_Back_Process_Publication_SummaryStore {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Storage_Database$} deps.database
 * @param {Mindstream_Back_Logger$} deps.logger
 */
constructor({ database, logger }) {
    const NAMESPACE = 'Mindstream_Back_Process_Publication_SummaryStore';

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
const getKnex = function () {
      return database.get();
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
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
/**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
const normalizeText = function (value, name) {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${name} must be a non-empty string.`);
      }
      return value.trim();
    };

    /**
 * @param {unknown} publicationId
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} publicationId
 * @returns {Promise<unknown>}
 */
this.findByPublicationId = async function (publicationId) {
      const id = normalizeId(publicationId, 'Publication id');
      const row = await getKnex()('publication_summaries').where({ publication_id: id }).first();
      return row ?? null;
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.overview
 * @param {unknown} deps.annotation
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} deps
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.overview
 * @param {unknown} deps.annotation
 * @returns {Promise<unknown>}
 */
this.saveSummary = async function ({ publicationId, overview, annotation }) {
      const id = normalizeId(publicationId, 'Publication id');
      const overviewText = normalizeText(overview, 'Overview');
      const annotationText = normalizeText(annotation, 'Annotation');

      const knexRef = getKnex();
      const existing = await knexRef('publication_summaries').where({ publication_id: id }).first();
      if (existing?.overview && existing?.annotation) {
        logger.debug(NAMESPACE, `Summaries already stored for publication ${id}.`);
        return existing;
      }
      if (existing) {
        throw new Error(`Publication ${id} has incomplete summaries.`);
      }

      const createdAt = new Date().toISOString();
      await knexRef('publication_summaries').insert({
        publication_id: id,
        overview: overviewText,
        annotation: annotationText,
        created_at: createdAt,
      });

      return await knexRef('publication_summaries').where({ publication_id: id }).first();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    database: 'Mindstream_Back_Storage_Database$',
    logger: 'Mindstream_Back_Logger$',
  }),
});
