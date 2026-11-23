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
      const num = typeof value === 'number' && Number.isSafeInteger(value) ? BigInt(value) : typeof value === 'string' && /^\d+$/.test(value) ? BigInt(value) : null;
      if (num === null || num < 1n || num > 9223372036854775807n) {
        throw new Error(`${name} must be a number.`);
      }
      return num.toString();
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
      const repository = await database.getBackend().get({ path: '/mindstream/summary' });
      const result = await repository.read({ key: { kind: 'primary', values: { publication_id: id } } });
      return result?.record ?? null;
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

      const repository = await database.getBackend().get({ path: '/mindstream/summary' });
      const existing = (await repository.read({ key: { kind: 'primary', values: { publication_id: id } } }))?.record;
      if (existing?.overview && existing?.annotation) {
        logger.debug(NAMESPACE, `Summaries already stored for publication ${id}.`);
        return existing;
      }
      if (existing) {
        throw new Error(`Publication ${id} has incomplete summaries.`);
      }

      const createdAt = new Date().toISOString().replace(/\.(\d{3})Z$/, (_match, fraction) => `.${fraction}000Z`);
      try {
        return (await repository.create({ record: {
          publication_id: id,
          overview: overviewText,
          annotation: annotationText,
          created_at: createdAt,
        } })).record;
      } catch (error) {
        if (error?.code !== 'CONFLICT') throw error;
        const concurrent = (await repository.read({ key: { kind: 'primary', values: { publication_id: id } } }))?.record;
        if (concurrent?.overview && concurrent?.annotation) return concurrent;
        throw error;
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    database: 'Mindstream_Back_Storage_Database$',
    logger: 'Mindstream_Back_Logger$',
  }),
});
