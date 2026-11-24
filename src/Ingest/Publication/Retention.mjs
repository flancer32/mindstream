// @ts-check

/** @namespace Mindstream_Back_Ingest_Publication_Retention */
export default class Mindstream_Back_Ingest_Publication_Retention {
  constructor() {
    const RETENTION_MS = 100 * 24 * 60 * 60 * 1000;

    /** @param {Date} value */
    const format = function (value) {
      if (!Number.isFinite(value.getTime())) throw new TypeError('Retention time must be a valid date.');
      return value.toISOString().replace(/\.(\d{3})Z$/, (_match, fraction) => `.${fraction}000Z`);
    };

    /** @param {unknown} value @param {string} label */
    const parse = function (value, label) {
      if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
        throw new TypeError(`${label} must be a valid timestamp.`);
      }
      return new Date(value);
    };

    /** @param {{now?: Date}} [params] */
    this.getCutoff = function ({now = new Date()} = {}) {
      if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError('Current time must be a valid date.');
      return format(new Date(now.getTime() - RETENTION_MS));
    };

    /** @param {{publishedAt?: unknown, discoveredAt?: unknown, now?: Date}} params */
    this.isExpired = function ({publishedAt, discoveredAt, now = new Date()}) {
      if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError('Current time must be a valid date.');
      const ageFrom = publishedAt === null || publishedAt === undefined
        ? parse(discoveredAt, 'Discovery timestamp')
        : parse(publishedAt, 'Publication timestamp');
      return ageFrom.getTime() <= now.getTime() - RETENTION_MS;
    };
  }
}

export const __deps__ = Object.freeze({default: Object.freeze({})});
