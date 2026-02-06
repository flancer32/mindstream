/**
 * @module Mindstream_Back_Process_Publication_SummaryStore
 * @description Persists generated summaries for publications.
 */
export default class Mindstream_Back_Process_Publication_SummaryStore {
  constructor({ Mindstream_Back_Storage_Knex$: knexProvider, Mindstream_Shared_Logger$: logger }) {
    const NAMESPACE = 'Mindstream_Back_Process_Publication_SummaryStore';

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

    const normalizeText = function (value, name) {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${name} must be a non-empty string.`);
      }
      return value.trim();
    };

    this.findByPublicationId = async function (publicationId) {
      const id = normalizeId(publicationId, 'Publication id');
      const row = await getKnex()('publication_summaries').where({ publication_id: id }).first();
      return row ?? null;
    };

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
