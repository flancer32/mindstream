/**
 * @module Mindstream_Back_Ingest_Publication_Store
 * @description Persists discovered publications in Storage.
 */
export default class Mindstream_Back_Ingest_Publication_Store {
  constructor({ Mindstream_Back_Storage_Knex$: knexProvider, Mindstream_Shared_Logger$: logger }) {
    const NAMESPACE = 'Mindstream_Back_Ingest_Publication_Store';

    const getKnex = function () {
      return knexProvider.get();
    };

    const buildSourcePayload = function (source) {
      const now = new Date().toISOString();
      return {
        id: source.id,
        code: source.code,
        url: source.url,
        name: source.name,
        description: source.description ?? null,
        is_active: Boolean(source.is_active),
        created_at: now,
        updated_at: now,
      };
    };

    const ensureSource = async function (trx, source) {
      const payload = buildSourcePayload(source);
      await trx('publication_sources').insert(payload).onConflict('id').ignore();
    };

    const buildPublicationPayloads = function (items) {
      const now = new Date().toISOString();
      return items.map((item) => ({
        source_id: item.source_id,
        source_item_hash: item.source_item_hash,
        source_url: item.source_url,
        rss_title: item.rss_title ?? null,
        rss_guid: item.rss_guid ?? null,
        rss_published_at: item.rss_published_at ?? null,
        discovered_at: now,
      }));
    };

    this.saveDiscovered = async function ({ source, items }) {
      const rows = Array.isArray(items) ? items : [];
      if (!rows.length) {
        logger.info(NAMESPACE, 'No publications to persist.');
        return;
      }

      const knexRef = getKnex();
      await knexRef.transaction(async (trx) => {
        await ensureSource(trx, source);
        const payloads = buildPublicationPayloads(rows);
        await trx('publications')
          .insert(payloads)
          .onConflict(['source_id', 'source_item_hash'])
          .ignore();
      });

      logger.info(NAMESPACE, `Stored ${rows.length} discovered publications.`);
    };
  }
}
