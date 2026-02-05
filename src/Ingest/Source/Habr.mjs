/**
 * @module Mindstream_Back_Ingest_Source_Habr
 * @description Source-specific discovery provider for Habr RSS.
 */
export default class Mindstream_Back_Ingest_Source_Habr {
  constructor({
    Mindstream_Back_Ingest_Rss_Client$: rssClient,
    Mindstream_Back_Ingest_Rss_Parser$: rssParser,
    Mindstream_Shared_Logger$: logger,
    'node:crypto': cryptoModule,
  }) {
    const NAMESPACE = 'Mindstream_Back_Ingest_Source_Habr';
    const RSS_URL = 'https://habr.com/ru/rss/articles/';
    const SOURCE_ID = 1;
    const SOURCE_CODE = 'habr';

    const cryptoRef = cryptoModule?.default ?? cryptoModule;

    const hashUrl = function (url) {
      const hasher = cryptoRef.createHash('sha256');
      hasher.update(String(url));
      return hasher.digest('hex');
    };

    const parsePubDate = function (value) {
      if (!value) return null;
      const parsed = Date.parse(value);
      if (!Number.isFinite(parsed)) return null;
      return new Date(parsed).toISOString();
    };

    const normalizeItem = function (item) {
      const url = String(item?.link ?? '').trim();
      if (!url) return null;
      return {
        source_id: SOURCE_ID,
        source_item_hash: hashUrl(url),
        source_url: url,
        rss_title: item?.title ? String(item.title).trim() : null,
        rss_guid: item?.guid ? String(item.guid).trim() : null,
        rss_published_at: parsePubDate(item?.pubDate),
      };
    };

    this.getSourceId = function () {
      return SOURCE_ID;
    };

    this.getSourceDescriptor = function () {
      return {
        id: SOURCE_ID,
        code: SOURCE_CODE,
        url: RSS_URL,
        name: 'Habr',
        description: 'Habr articles RSS feed.',
        is_active: true,
      };
    };

    this.discover = async function () {
      const rssXml = await rssClient.fetch(RSS_URL);
      const parsedItems = rssParser.parseItems(rssXml);
      if (!parsedItems.length) {
        logger.warn(NAMESPACE, 'RSS feed returned no items.');
      }
      const normalized = parsedItems.map(normalizeItem).filter((item) => item !== null);
      const unique = new Map();
      for (const item of normalized) {
        unique.set(item.source_item_hash, item);
      }
      const result = Array.from(unique.values());
      logger.info(NAMESPACE, `Parsed ${result.length} RSS items from Habr.`);
      return result;
    };
  }
}
