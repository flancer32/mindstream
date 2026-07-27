/** @namespace Mindstream_Web_InterestScore */
export default class Mindstream_Web_InterestScore {
  constructor({ Mindstream_Web_Attention$: attention }) {
    let initialized = false;
    const getEmbedding = (item) => item?.embeddings?.overview || item?.embeddings?.annotation || null;
    const ensure = (item) => { const value = getEmbedding(item); if (!value) throw new Error(`Missing embedding for publication ${item?.id ?? 'unknown'}.`); return value; };
    this.initAttention = (items) => { if (initialized) return; const sample = items?.find(getEmbedding); if (!sample) throw new Error('Feed payload is missing embeddings.'); attention.init({ dim: ensure(sample).length }); initialized = true; };
    this.scoreItem = (item) => attention.scorePublication(ensure(item));
    this.getScore = (pubId) => attention.getScore(pubId);
    this.hasInterestProfile = () => attention.hasInterestProfile();
    this.recordAttention = (payload, item, { items = [] } = {}) => attention.recordAttention(payload, ensure(item), { visiblePublications: items.map((entry) => ({ pubId: entry.id ?? entry.pubId, embedding: getEmbedding(entry) })).filter((entry) => entry.pubId !== undefined && entry.embedding) });
  }
}

export const __deps__ = Object.freeze({ default: Object.freeze({ 'Mindstream_Web_Attention$': 'Mindstream_Web_Attention$' }) });
