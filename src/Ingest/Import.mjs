// @ts-check
/** @namespace Mindstream_Back_Ingest_Import */
export default class Mindstream_Back_Ingest_Import {
  /**
   * @param {object} deps
   * @param {Mindstream_Back_Storage_Database$} deps.database
   * @param {Mindstream_Back_Logger$} deps.logger
   * @param {typeof import('node:crypto')} deps.cryptoModule
   */
  constructor({ database, logger, cryptoModule }) {
    const namespace = 'Mindstream_Back_Ingest_Import';
    /** @param {unknown} value @param {string} label */
    const object = function (value, label) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`);
      return /** @type {Record<string, unknown>} */ (value);
    };
    /** @param {unknown} value @param {string} label @param {number} max */
    const text = function (value, label, max) {
      if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label} must contain 1–${max} characters.`);
      return value.trim();
    };
    /** @param {unknown} value @param {string} label @param {number} max */
    const url = function (value, label, max) {
      const parsed = new URL(text(value, label, max));
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(`${label} must be an HTTP(S) URL without credentials.`);
      parsed.hash = '';
      const normalized = parsed.toString();
      if (normalized.length > max) throw new Error(`${label} is too long.`);
      return normalized;
    };

    /** @param {unknown} input */
    this.execute = async function (input) {
      try {
        const value = object(input, 'Publication');
        const source = object(value.source, 'Source');
        if (!Number.isSafeInteger(source.id) || Number(source.id) < 2 || Number(source.id) > 2147483647) throw new Error('Source id must be an integer from 2 to 2147483647.');
        const code = text(source.code, 'Source code', 64);
        if (!/^[a-z0-9][a-z0-9_-]*$/.test(code) || code === 'habr') throw new Error('Source code must be a non-Habr lowercase identifier.');
        const name = text(source.name, 'Source name', 255);
        const sourceUrl = url(source.url, 'Source URL', 255);
        const articleUrl = url(value.url, 'Article URL', 1024);
        const title = text(value.title, 'Title', 512);
        const markdown = text(value.markdown, 'Markdown', 1_000_000);
        const date = text(value.publishedAt, 'Publication timestamp', 40);
        if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(date) || !Number.isFinite(Date.parse(date))) throw new Error('Publication timestamp must be an ISO timestamp with a timezone.');
        const hash = cryptoModule.createHash('sha256').update(articleUrl).digest('hex');
        const now = new Date().toISOString();
        const result = await database.get().transaction(async (/** @type {ReturnType<Mindstream_Back_Storage_Database$['get']>} */ trx) => {
          await trx('publication_sources').insert({id: source.id, code, name, url: sourceUrl, is_active: true, created_at: now, updated_at: now}).onConflict().ignore();
          const stored = await trx('publication_sources').where({id: source.id}).first();
          if (!stored || stored.code !== code || stored.url !== sourceUrl || stored.name !== name) throw new Error('Source identity conflicts with an existing source. Use its exact descriptor or a new identifier.');
          const inserted = await trx('publications').insert({source_id: source.id, source_item_hash: hash, source_url: articleUrl, rss_title: title, rss_published_at: new Date(date).toISOString(), discovered_at: now, status: 'extracted'}).onConflict(['source_id', 'source_item_hash']).ignore().returning('id');
          if (!inserted.length) return {created: false};
          const id = inserted[0].id;
          await trx('publication_extractions').insert({publication_id: id, html: null, md_text: markdown, created_at: now});
          return {created: true, id};
        });
        logger.info(namespace, result.created ? `Imported publication ${result.id}; ready for summary generation.` : 'Publication already exists; left unchanged.', {});
        return result;
      } catch (error) {
        logger.exception(namespace, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };
  }
}

export const __deps__ = Object.freeze({default: {
  database: 'Mindstream_Back_Storage_Database$',
  logger: 'Mindstream_Back_Logger$',
  cryptoModule: 'node:crypto',
}});
