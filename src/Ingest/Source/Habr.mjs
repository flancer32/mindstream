// @ts-check
/**
 * @namespace Mindstream_Back_Ingest_Source_Habr
 * @description Source-specific discovery provider for Habr RSS.
 */
export default class Mindstream_Back_Ingest_Source_Habr {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Ingest_Rss_Client$} deps.rssClient
 * @param {Mindstream_Back_Ingest_Rss_Parser$} deps.rssParser
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {typeof import("node:crypto")} deps.cryptoModule
 */
constructor({
    rssClient,
    rssParser,
    logger,
    cryptoModule,
  }) {
    const NAMESPACE = 'Mindstream_Back_Ingest_Source_Habr';
    const RSS_URL = 'https://habr.com/ru/rss/articles/';
    const SOURCE_ID = 1;
    const SOURCE_CODE = 'habr';

    const cryptoRef = cryptoModule?.default ?? cryptoModule;

    /**
 * @param {unknown} url
 * @returns {unknown}
 */
/**
 * @param {unknown} url
 * @returns {unknown}
 */
const hashUrl = function (url) {
      const hasher = cryptoRef.createHash('sha256');
      hasher.update(String(url));
      return hasher.digest('hex');
    };

    /**
 * @param {unknown} value
 * @returns {unknown}
 */
/**
 * @param {unknown} value
 * @returns {unknown}
 */
const parsePubDate = function (value) {
      if (!value) return null;
      const parsed = Date.parse(value);
      if (!Number.isFinite(parsed)) return null;
      return new Date(parsed).toISOString();
    };

    /**
 * @param {unknown} item
 * @returns {unknown}
 */
/**
 * @param {unknown} item
 * @returns {unknown}
 */
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

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
this.getSourceId = function () {
      return SOURCE_ID;
    };

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
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

    /**
 * @returns {Promise<unknown>}
 */
/**
 * @returns {Promise<unknown>}
 */
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

export const __deps__ = Object.freeze({
  default: Object.freeze({
    rssClient: 'Mindstream_Back_Ingest_Rss_Client$',
    rssParser: 'Mindstream_Back_Ingest_Rss_Parser$',
    logger: 'Mindstream_Back_Logger$',
    cryptoModule: 'node:crypto',
  }),
});
