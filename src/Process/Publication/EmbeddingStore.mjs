// @ts-check
/**
 * @namespace Mindstream_Back_Process_Publication_EmbeddingStore
 * @description Persists embeddings for publications.
 */
export default class Mindstream_Back_Process_Publication_EmbeddingStore {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Storage_Database$} deps.database
 * @param {Mindstream_Back_Logger$} deps.logger
 */
constructor({ database, logger }) {
    const NAMESPACE = 'Mindstream_Back_Process_Publication_EmbeddingStore';

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
const normalizeVector = function (value, name) {
      if (!Array.isArray(value) || value.length !== 1536) {
        throw new Error(`${name} must contain exactly 1536 components.`);
      }
      const normalized = value.map((item) => {
        if (typeof item !== 'number' || !Number.isFinite(item)) {
          throw new Error(`${name} must contain only numbers.`);
        }
        return item;
      });
      return normalized;
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
      const repository = await database.getBackend().get({ path: '/mindstream/embedding' });
      const result = await repository.read({ key: { kind: 'primary', values: { publication_id: id } } });
      return result?.record ?? null;
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.overviewEmbedding
 * @param {unknown} deps.annotationEmbedding
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} deps
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.overviewEmbedding
 * @param {unknown} deps.annotationEmbedding
 * @returns {Promise<unknown>}
 */
this.saveEmbeddings = async function ({ publicationId, overviewEmbedding, annotationEmbedding }) {
      const id = normalizeId(publicationId, 'Publication id');
      const overviewVector = normalizeVector(overviewEmbedding, 'Overview embedding');
      const annotationVector = normalizeVector(annotationEmbedding, 'Annotation embedding');

      const repository = await database.getBackend().get({ path: '/mindstream/embedding' });
      const existing = (await repository.read({ key: { kind: 'primary', values: { publication_id: id } } }))?.record;
      if (existing?.overview_embedding && existing?.annotation_embedding) {
        logger.debug(NAMESPACE, `Embeddings already stored for publication ${id}.`);
        return existing;
      }
      if (existing) {
        throw new Error(`Publication ${id} has incomplete embeddings.`);
      }

      const createdAt = new Date().toISOString().replace(/\.(\d{3})Z$/, (_match, fraction) => `.${fraction}000Z`);
      try {
        return (await repository.create({ record: {
          publication_id: id,
          overview_embedding: overviewVector,
          annotation_embedding: annotationVector,
          created_at: createdAt,
        } })).record;
      } catch (error) {
        if (error?.code !== 'CONFLICT') throw error;
        const concurrent = (await repository.read({ key: { kind: 'primary', values: { publication_id: id } } }))?.record;
        if (concurrent?.overview_embedding && concurrent?.annotation_embedding) return concurrent;
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
