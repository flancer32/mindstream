// @ts-check
/**
 * @namespace Mindstream_Shared_Api_Feed
 * @description Creates and validates platform-neutral feed transport DTOs.
 */
export default class Mindstream_Shared_Api_Feed {
  /** @returns {void} */
  constructor() {
    /** @param {unknown} value @param {string} name @returns {object} */
    const requireObject = /**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
(value, name) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`${name} must be an object.`);
      }
      return value;
    };
    /** @param {unknown} value @param {string} name @returns {number} */
    const requireNumber = /**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
(value, name) => {
      const number = Number(value);
      if (!Number.isFinite(number)) throw new TypeError(`${name} must be a finite number.`);
      return number;
    };
    /** @param {unknown} value @param {string} name @returns {string|undefined} */
    const optionalText = /**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
(value, name) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} must be a non-empty string.`);
      return value.trim();
    };
    /** @param {unknown} value @param {string} name @returns {string} */
    const requireText = /**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
(value, name) => {
      const text = optionalText(value, name);
      if (!text) throw new TypeError(`${name} must be a non-empty string.`);
      return text;
    };
    /** @param {unknown} value @param {string} name @returns {number[]} */
    const vector = /**
 * @param {unknown} value
 * @param {unknown} name
 * @returns {unknown}
 */
(value, name) => {
      const values = Array.isArray(value)
        ? value
        : typeof value === 'string'
          ? value.trim().replace(/^\[|\]$/gu, '').split(',').map((part) => part.trim()).filter(Boolean)
          : null;
      if (!values?.length) throw new TypeError(`${name} must be a non-empty numeric vector.`);
      return values.map((entry) => requireNumber(entry, name));
    };

    /** @param {unknown} value @returns {object|null} */
    this.createCursor = /**
 * @param {unknown} value
 * @returns {unknown}
 */
function (value) {
      if (value === undefined || value === null) return null;
      const source = requireObject(value, 'Feed cursor');
      const result = { id: requireNumber(source.id, 'Feed cursor id') };
      const publishedAt = optionalText(source.publishedAt, 'Feed cursor publishedAt');
      if (publishedAt) result.publishedAt = publishedAt;
      return Object.freeze(result);
    };

    /** @param {unknown} value @returns {object} */
    this.createItem = /**
 * @param {unknown} value
 * @returns {unknown}
 */
function (value) {
      const source = requireObject(value, 'Feed item');
      const embeddings = requireObject(source.embeddings, 'Feed item embeddings');
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

    /** @param {unknown} value @returns {object} */
    this.createSource = /**
 * @param {unknown} value
 * @returns {unknown}
 */
function (value) {
      const source = requireObject(value, 'Feed source');
      return Object.freeze({
        code: requireText(source.code, 'Feed source code'),
        name: requireText(source.name, 'Feed source name'),
        url: requireText(source.url, 'Feed source url'),
      });
    };

    /** @param {unknown} value @returns {object} */
    this.createResponse = /**
 * @param {unknown} value
 * @returns {unknown}
 */
function (value) {
      const source = requireObject(value, 'Feed response');
      if (!Array.isArray(source.sources) || !Array.isArray(source.items)) {
        throw new TypeError('Feed response sources and items must be arrays.');
      }
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
