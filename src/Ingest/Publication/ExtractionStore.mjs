// @ts-check
/**
 * @namespace Mindstream_Back_Ingest_Publication_ExtractionStore
 * @description Persists extracted HTML and markdown for publications.
 */
export default class Mindstream_Back_Ingest_Publication_ExtractionStore {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Storage_Database$} deps.database
 * @param {Mindstream_Back_Logger$} deps.logger
 */
constructor({ database, logger }) {
    const NAMESPACE = 'Mindstream_Back_Ingest_Publication_ExtractionStore';

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
      const num = typeof value === 'number' && Number.isSafeInteger(value) ? BigInt(value) : typeof value === 'string' && /^\d+$/.test(value) ? BigInt(value) : null;
      if (num === null || num < 1n || num > 9223372036854775807n) {
        throw new Error(`${name} must be a number.`);
      }
      return num.toString();
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
      const row = await getKnex()('mindstream_extraction').where({ publication_id: id }).first();
      return row ?? null;
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.html
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} deps
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.html
 * @returns {Promise<unknown>}
 */
this.saveHtml = async function ({ publicationId, html }) {
      const id = normalizeId(publicationId, 'Publication id');
      if (typeof html !== 'string' || !html) {
        throw new Error('HTML payload must be a non-empty string.');
      }

      const knexRef = getKnex();
      const existing = await knexRef('mindstream_extraction').where({ publication_id: id }).first();
      if (existing?.html) {
        logger.debug(NAMESPACE, `HTML already stored for publication ${id}.`);
        return existing;
      }

      const createdAt = existing?.created_at ?? new Date().toISOString().replace(/\.(\d{3})Z$/, (_match, fraction) => `.${fraction}000Z`);
      if (existing) {
        await knexRef('mindstream_extraction').where({ publication_id: id }).update({ html, created_at: createdAt });
      } else {
        await knexRef('mindstream_extraction').insert({
          publication_id: id,
          html,
          md_text: null,
          created_at: createdAt,
        });
      }

      return await knexRef('mindstream_extraction').where({ publication_id: id }).first();
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.markdown
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} deps
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.markdown
 * @returns {Promise<unknown>}
 */
this.saveMarkdown = async function ({ publicationId, markdown }) {
      const id = normalizeId(publicationId, 'Publication id');
      if (typeof markdown !== 'string' || !markdown) {
        throw new Error('Markdown payload must be a non-empty string.');
      }

      const knexRef = getKnex();
      const existing = await knexRef('mindstream_extraction').where({ publication_id: id }).first();
      const createdAt = existing?.created_at ?? new Date().toISOString().replace(/\.(\d{3})Z$/, (_match, fraction) => `.${fraction}000Z`);

      if (existing) {
        await knexRef('mindstream_extraction').where({ publication_id: id }).update({ md_text: markdown, created_at: createdAt });
      } else {
        await knexRef('mindstream_extraction').insert({
          publication_id: id,
          html: null,
          md_text: markdown,
          created_at: createdAt,
        });
      }

      return await knexRef('mindstream_extraction').where({ publication_id: id }).first();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    database: 'Mindstream_Back_Storage_Database$',
    logger: 'Mindstream_Back_Logger$',
  }),
});
