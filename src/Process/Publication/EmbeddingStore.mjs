/**
 * @module Mindstream_Back_Process_Publication_EmbeddingStore
 * @description Persists embeddings for publications.
 */
export default class Mindstream_Back_Process_Publication_EmbeddingStore {
  constructor({ Mindstream_Back_Storage_Knex$: knexProvider, Mindstream_Shared_Logger$: logger }) {
    const NAMESPACE = 'Mindstream_Back_Process_Publication_EmbeddingStore';

    const getKnex = function () {
      return knexProvider.get();
    };

    const normalizeId = function (value, name) {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        throw new Error(`${name} must be a number.`);
      }
      return num;
    };

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

    this.findByPublicationId = async function (publicationId) {
      const id = normalizeId(publicationId, 'Publication id');
      const row = await getKnex()('publication_embeddings').where({ publication_id: id }).first();
      return row ?? null;
    };

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
