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
const normalizeVector = function (value, name) {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${name} must be a non-empty array.`);
      }
      const normalized = value.map((item) => {
        const num = Number(item);
        if (!Number.isFinite(num)) {
          throw new Error(`${name} must contain only numbers.`);
        }
        return num;
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
      const row = await getKnex()('publication_embeddings').where({ publication_id: id }).first();
      return row ?? null;
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

      const knexRef = getKnex();
      const existing = await knexRef('publication_embeddings').where({ publication_id: id }).first();
      if (existing?.overview_embedding && existing?.annotation_embedding) {
        logger.debug(NAMESPACE, `Embeddings already stored for publication ${id}.`);
        return existing;
      }
      if (existing) {
        throw new Error(`Publication ${id} has incomplete embeddings.`);
      }

      const createdAt = new Date().toISOString();
      await knexRef.raw(
        `
  insert into publication_embeddings
    (publication_id, overview_embedding, annotation_embedding, created_at)
  values
    (?, ?::vector, ?::vector, ?)
  `,
        [
          id,
          JSON.stringify(overviewVector),
          JSON.stringify(annotationVector),
          createdAt,
        ]
      );


      return await knexRef('publication_embeddings').where({ publication_id: id }).first();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    database: 'Mindstream_Back_Storage_Database$',
    logger: 'Mindstream_Back_Logger$',
  }),
});
