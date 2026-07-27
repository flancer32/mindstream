// @ts-check
/** @namespace Mindstream_Web_InterestIndicator  @description DI-managed Mindstream module. */
export default class Mindstream_Web_InterestIndicator {
  /**
 */
constructor() {
    /**
 * @param {unknown} entries
 * @returns {unknown}
 */
const normalize = (entries) => Array.isArray(entries) ? entries.filter((entry) => entry?.pubId !== undefined && entry.pubId !== null).map((entry) => ({ pubId: entry.pubId, score: Math.min(1, Math.max(0, Number(entry.score) || 0)) })) : [];
    /**
 * @param {unknown} entries
 * @returns {unknown}
 */
const range = (entries) => ({ min: Math.min(...entries.map((entry) => entry.score)), max: Math.max(...entries.map((entry) => entry.score)) });
    /**
 * @param {unknown} entries
 * @param {unknown} threshold
 * @returns {unknown}
 */
const resolve = (entries, threshold) => { const list = normalize(entries); if (!list.length) return { min: 0, max: 0, threshold: 0, topIds: new Set() }; const { min, max } = range(list); const mark = threshold ?? (Math.abs(max - min) < 1e-12 ? min : (() => { const remaining = list.filter((entry) => entry.score < min + (max - min) * .9); const r = remaining.length ? range(remaining) : { min, max: min }; return r.min + (r.max - r.min) * .8; })()); return { min, max, threshold: mark, topIds: new Set(list.filter((entry) => entry.score + 1e-12 >= mark).map((entry) => entry.pubId)) }; };
    /**
 * @param {unknown} entries
 * @returns {unknown}
 */
this.resolveTopInterestRange = (entries) => resolve(entries);
    /**
 * @param {unknown} entries
 * @param {unknown} percent
 * @returns {unknown}
 */
this.resolveTopInterestRangeManual = (entries, percent) => resolve(entries, Math.min(100, Math.max(0, percent)) / 100);
    /**
 * @param {unknown} score
 * @returns {unknown}
 */
this.scoreToPercent = (score) => Math.round(Math.min(1, Math.max(0, Number(score) || 0)) * 100);
  }
}
