/**
 * @module Mindstream_Back_Ingest_Rss_Parser
 * @description Parses RSS XML into a list of item descriptors.
 */
export default class Mindstream_Back_Ingest_Rss_Parser {
  constructor({}) {
    const stripCdata = function (value) {
      if (typeof value !== 'string') return '';
      return value.replace(/<!\[CDATA\[(.*?)\]\]>/gis, '$1');
    };

    const decodeEntities = function (value) {
      if (typeof value !== 'string') return '';
      return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    };

    const extractTagValue = function (chunk, tagName) {
      if (!chunk || !tagName) return '';
      const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
      const match = regex.exec(chunk);
      if (!match) return '';
      const raw = stripCdata(match[1]);
      return decodeEntities(String(raw).trim());
    };

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
