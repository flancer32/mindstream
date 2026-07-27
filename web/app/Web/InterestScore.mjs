// @ts-check
/** @namespace Mindstream_Web_InterestScore  @description DI-managed Mindstream module. */
export default class Mindstream_Web_InterestScore {
  /**
 * @param {object} deps
 * @param {Mindstream_Web_Attention$} deps.attention
 */
constructor({ attention }) {
    let initialized = false;
    /**
 * @param {unknown} item
 * @returns {unknown}
 */
const getEmbedding = (item) => item?.embeddings?.overview || item?.embeddings?.annotation || null;
    /**
 * @param {unknown} item
 * @returns {unknown}
 */
const ensure = (item) => { const value = getEmbedding(item); if (!value) throw new Error(`Missing embedding for publication ${item?.id ?? 'unknown'}.`); return value; };
    /**
 * @param {unknown} items
 * @returns {unknown}
 */
this.initAttention = (items) => { if (initialized) return; const sample = items?.find(getEmbedding); if (!sample) throw new Error('Feed payload is missing embeddings.'); attention.init({ dim: ensure(sample).length }); initialized = true; };
    /**
 * @param {unknown} item
 * @returns {unknown}
 */
this.scoreItem = (item) => attention.scorePublication(ensure(item));
    /**
 * @param {unknown} pubId
 * @returns {unknown}
 */
this.getScore = (pubId) => attention.getScore(pubId);
    /**
 * @returns {unknown}
 */
this.hasInterestProfile = () => attention.hasInterestProfile();
    /**
 * @param {unknown} payload
 * @param {unknown} item
 * @param {unknown} options
 * @returns {unknown}
 */
this.recordAttention = (payload, item, options = {}) => {
      const { items = [] } = options;
      return attention.recordAttention(payload, ensure(item), { visiblePublications: items.map((entry) => ({ pubId: entry.id ?? entry.pubId, embedding: getEmbedding(entry) })).filter((entry) => entry.pubId !== undefined && entry.embedding) });
    };
  }
}

export const __deps__ = Object.freeze({
  default: {
    attention: 'Mindstream_Web_Attention$',
  },
});
