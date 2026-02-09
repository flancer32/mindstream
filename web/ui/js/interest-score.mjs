import * as attention from './attention.mjs';

const resolvePubId = (item) => {
  if (!item || typeof item !== 'object') return null;
  if (typeof item.pubId !== 'undefined') return item.pubId;
  if (typeof item.id !== 'undefined') return item.id;
  return null;
};

const resolveEmbedding = (item) =>
  item?.embeddings?.overview || item?.embeddings?.annotation || null;

const ensureEmbedding = (item) => {
  const embedding = resolveEmbedding(item);
  if (!embedding || typeof embedding.length !== 'number') {
    throw new Error(`Missing embedding for publication ${item?.id ?? 'unknown'}.`);
  }
  return embedding;
};

let initialized = false;

export const initAttention = (items) => {
  if (initialized) return;
  if (!Array.isArray(items)) {
    throw new Error('initAttention expects an array of publications.');
  }
  const sample = items.find((entry) => resolveEmbedding(entry));
  if (!sample) {
    throw new Error('Feed payload is missing embeddings.');
  }
  const embedding = ensureEmbedding(sample);
  attention.init({ dim: embedding.length });
  initialized = true;
};

export const scoreItem = (item) => {
  const embedding = ensureEmbedding(item);
  return attention.scorePublication(embedding);
};

export const getScore = (pubId) => attention.getScore(pubId);

export const resolveScore = (item) => {
  const pubId = resolvePubId(item);
  if (pubId !== null && typeof pubId !== 'undefined') {
    const cached = attention.getScore(pubId);
    if (cached !== null) return cached;
  }
  return scoreItem(item);
};

export const recordAttention = async (payload, item, { visibleItems } = {}) => {
  const embedding = ensureEmbedding(item);
  const visiblePublications = [];
  if (Array.isArray(visibleItems)) {
    for (const entry of visibleItems) {
      const pubId = resolvePubId(entry);
      const visibleEmbedding = resolveEmbedding(entry);
      if (pubId === null || typeof pubId === 'undefined' || !visibleEmbedding) {
        continue;
      }
      visiblePublications.push({ pubId, embedding: visibleEmbedding });
    }
  }
  await attention.recordAttention(payload, embedding, { visiblePublications });
};
