/**
 * @module Mindstream_Back_Ingest_Publication_ExtractionStore
 * @description Persists extracted HTML and markdown for publications.
 */
export default class Mindstream_Back_Ingest_Publication_ExtractionStore {
  constructor({ Mindstream_Back_Storage_Knex$: knexProvider, Mindstream_Shared_Logger$: logger }) {
    const NAMESPACE = 'Mindstream_Back_Ingest_Publication_ExtractionStore';

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

    this.findByPublicationId = async function (publicationId) {
      const id = normalizeId(publicationId, 'Publication id');
      const row = await getKnex()('publication_extractions').where({ publication_id: id }).first();
      return row ?? null;
    };

    this.saveHtml = async function ({ publicationId, html }) {
      const id = normalizeId(publicationId, 'Publication id');
      if (typeof html !== 'string' || !html) {
        throw new Error('HTML payload must be a non-empty string.');
      }

      const knexRef = getKnex();
      const existing = await knexRef('publication_extractions').where({ publication_id: id }).first();
      if (existing?.html) {
        logger.debug(NAMESPACE, `HTML already stored for publication ${id}.`);
        return existing;
      }

      const createdAt = existing?.created_at ?? new Date().toISOString();
      if (existing) {
        await knexRef('publication_extractions').where({ publication_id: id }).update({ html, created_at: createdAt });
      } else {
        await knexRef('publication_extractions').insert({
          publication_id: id,
          html,
          md_text: null,
          created_at: createdAt,
        });
      }

      return await knexRef('publication_extractions').where({ publication_id: id }).first();
    };

    this.saveMarkdown = async function ({ publicationId, markdown }) {
      const id = normalizeId(publicationId, 'Publication id');
      if (typeof markdown !== 'string' || !markdown) {
        throw new Error('Markdown payload must be a non-empty string.');
      }

      const knexRef = getKnex();
      const existing = await knexRef('publication_extractions').where({ publication_id: id }).first();
      const createdAt = existing?.created_at ?? new Date().toISOString();

      if (existing) {
        await knexRef('publication_extractions').where({ publication_id: id }).update({ md_text: markdown, created_at: createdAt });
      } else {
        await knexRef('publication_extractions').insert({
          publication_id: id,
          html: null,
          md_text: markdown,
          created_at: createdAt,
        });
      }

      return await knexRef('publication_extractions').where({ publication_id: id }).first();
    };
  }
}
