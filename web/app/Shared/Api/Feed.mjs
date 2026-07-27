// @ts-check
/**
 * @namespace Mindstream_Shared_Api_Feed
 * @description Creates and validates platform-neutral feed transport DTOs.
 */
export default class Mindstream_Shared_Api_Feed {
  /** @description Initializes immutable feed DTO validators. */
  constructor() {
    /** @param {unknown} value @param {string} name @returns {Record<string, unknown>} */
    const requireObject = (value, name) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`${name} must be an object.`);
      }
      return /** @type {Record<string, unknown>} */ (value);
    };
    /** @param {unknown} value @param {string} name @returns {number} */
    const requireNumber = (value, name) => {
      const number = Number(value);
      if (!Number.isFinite(number)) throw new TypeError(`${name} must be a finite number.`);
      return number;
    };
    /** @param {unknown} value @param {string} name @returns {string|undefined} */
    const optionalText = (value, name) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} must be a non-empty string.`);
      return value.trim();
    };
    /** @param {unknown} value @param {string} name @returns {string} */
    const requireText = (value, name) => {
      const text = optionalText(value, name);
      if (!text) throw new TypeError(`${name} must be a non-empty string.`);
      return text;
    };
    /** @param {unknown} value @param {string} name @returns {number[]} */
    const vector = (value, name) => {
      const values = Array.isArray(value)
        ? value
        : typeof value === 'string'
          ? value.trim().replace(/^\[|\]$/gu, '').split(',').map((part) => part.trim()).filter(Boolean)
          : null;
      if (!values?.length) throw new TypeError(`${name} must be a non-empty numeric vector.`);
      return values.map((entry) => requireNumber(entry, name));
    };

    /** @param {unknown} value @returns {Mindstream_Shared_Api_Feed_Cursor|null} */
    this.createCursor = function (value) {
      if (value === undefined || value === null) return null;
      const source = /** @type {Mindstream_Shared_Api_Feed_Cursor} */ (requireObject(value, 'Feed cursor'));
      /** @type {Mindstream_Shared_Api_Feed_Cursor} */
      const result = { id: requireNumber(source.id, 'Feed cursor id') };
      const publishedAt = optionalText(source.publishedAt, 'Feed cursor publishedAt');
      if (publishedAt) result.publishedAt = publishedAt;
      return Object.freeze(result);
    };

    /** @param {unknown} value @returns {Mindstream_Shared_Api_Feed_Item} */
    this.createItem = function (value) {
      const source = /** @type {Mindstream_Shared_Api_Feed_Item} */ (requireObject(value, 'Feed item'));
      const embeddings = /** @type {Mindstream_Shared_Api_Feed_Item['embeddings']} */ (requireObject(source.embeddings, 'Feed item embeddings'));
      return Object.freeze({
        id: requireNumber(source.id, 'Feed item id'),
        sourceCode: requireText(source.sourceCode, 'Feed item sourceCode'),
        title: optionalText(source.title, 'Feed item title'),
        url: requireText(source.url, 'Feed item url'),
        publishedAt: optionalText(source.publishedAt, 'Feed item publishedAt'),
        annotation: requireText(source.annotation, 'Feed item annotation'),
        overview: requireText(source.overview, 'Feed item overview'),
        embeddings: Object.freeze({
          annotation: Object.freeze(vector(embeddings.annotation, 'Feed annotation embedding')),
          overview: Object.freeze(vector(embeddings.overview, 'Feed overview embedding')),
        }),
      });
    };

    /** @param {unknown} value @returns {Mindstream_Shared_Api_Feed_Source} */
    this.createSource = function (value) {
      const source = /** @type {Mindstream_Shared_Api_Feed_Source} */ (requireObject(value, 'Feed source'));
      return Object.freeze({
        code: requireText(source.code, 'Feed source code'),
        name: requireText(source.name, 'Feed source name'),
        url: requireText(source.url, 'Feed source url'),
      });
    };

    /** @param {unknown} value @returns {Mindstream_Shared_Api_Feed_Response} */
    this.createResponse = function (value) {
      const source = /** @type {Mindstream_Shared_Api_Feed_Response} */ (requireObject(value, 'Feed response'));
      if (!Array.isArray(source.sources) || !Array.isArray(source.items)) {
        throw new TypeError('Feed response sources and items must be arrays.');
      }
      /** @type {Mindstream_Shared_Api_Feed_Response} */
      const result = {
        sources: Object.freeze(source.sources.map((entry) => this.createSource(entry))),
        items: Object.freeze(source.items.map((entry) => this.createItem(entry))),
      };
      const cursor = this.createCursor(source.cursor);
      if (cursor) result.cursor = cursor;
      return Object.freeze(result);
    };
  }
}
