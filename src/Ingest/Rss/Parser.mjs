// @ts-check
/**
 * @namespace Mindstream_Back_Ingest_Rss_Parser
 * @description Parses RSS XML into a list of item descriptors.
 */
export default class Mindstream_Back_Ingest_Rss_Parser {
/**
 * @param {unknown} deps
 */
constructor({}) {
    /**
 * @param {unknown} value
 * @returns {unknown}
 */
/**
 * @param {unknown} value
 * @returns {unknown}
 */
const stripCdata = function (value) {
      if (typeof value !== 'string') return '';
      return value.replace(/<!\[CDATA\[(.*?)\]\]>/gis, '$1');
    };

    /**
 * @param {unknown} value
 * @returns {unknown}
 */
/**
 * @param {unknown} value
 * @returns {unknown}
 */
const decodeEntities = function (value) {
      if (typeof value !== 'string') return '';
      return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    };

    /**
 * @param {unknown} chunk
 * @param {unknown} tagName
 * @returns {unknown}
 */
/**
 * @param {unknown} chunk
 * @param {unknown} tagName
 * @returns {unknown}
 */
const extractTagValue = function (chunk, tagName) {
      if (!chunk || !tagName) return '';
      const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
      const match = regex.exec(chunk);
      if (!match) return '';
      const raw = stripCdata(match[1]);
      return decodeEntities(String(raw).trim());
    };

    /**
 * @param {unknown} xml
 * @returns {unknown}
 */
/**
 * @param {unknown} xml
 * @returns {unknown}
 */
const extractItems = function (xml) {
      if (!xml) return [];
      const items = [];
      const regex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
      let match = null;
      while ((match = regex.exec(xml)) !== null) {
        items.push(match[1]);
      }
      return items;
    };

    /**
 * @param {unknown} rssXml
 * @returns {unknown}
 */
/**
 * @param {unknown} rssXml
 * @returns {unknown}
 */
this.parseItems = function (rssXml) {
      const xml = typeof rssXml === 'string' ? rssXml : '';
      const items = extractItems(xml);
      return items.map((itemXml) => ({
        link: extractTagValue(itemXml, 'link'),
        title: extractTagValue(itemXml, 'title'),
        guid: extractTagValue(itemXml, 'guid'),
        pubDate: extractTagValue(itemXml, 'pubDate'),
      }));
    };
  }
}
