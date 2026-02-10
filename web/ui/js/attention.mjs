import { sendAttentionSignal } from './identity.mjs';

const STORAGE_VECTOR_KEY = 'mindstream.attention.interestVector';
const STORAGE_HISTORY_KEY = 'mindstream.attention.recentSignals';
const MAX_HISTORY = 100;
const DEFAULT_MIN_SCORE = 0.2;
const WEIGHTS = Object.freeze({
  overview_open: 1.0,
  source_click: 1.6,
  source_click_after_overview: 2.4,
});

let dimension = null;
let interestVector = null;
let recentSignals = [];
let scoreCache = new Map();

const isFiniteNumber = (value) => Number.isFinite(value);

const getStorage = () => {
  if (typeof globalThis.localStorage !== 'undefined') {
    return globalThis.localStorage;
  }
  return {
    _data: new Map(),
    getItem(key) {
      return this._data.has(key) ? this._data.get(key) : null;
    },
    setItem(key, value) {
      this._data.set(key, String(value));
    },
    removeItem(key) {
      this._data.delete(key);
    },
  };
};

const ensureInitialized = () => {
  if (!dimension || !interestVector) {
    throw new Error('Attention module is not initialized. Call init({ dim }).');
  }
};

const createZeroVector = (dim) => new Float32Array(dim);

const vectorToArray = (vector) => Array.from(vector);

const parseVectorPayload = (raw, dim) => {
  if (!raw) return null;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!payload || payload.dim !== dim || !Array.isArray(payload.vector)) {
    return null;
  }
  if (payload.vector.length !== dim) {
    return null;
  }
  if (!payload.vector.every(isFiniteNumber)) {
    return null;
  }
  return payload.vector;
};

const parseHistoryPayload = (raw) => {
  if (!raw) return null;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(payload)) return null;
  for (const entry of payload) {
    if (!entry || typeof entry.pubId === 'undefined' || typeof entry.type !== 'string') {
      return null;
    }
  }
  return payload.slice(0, MAX_HISTORY);
};

const normalizeVector = (vector) => {
  let sumSquares = 0;
  for (let i = 0; i < vector.length; i += 1) {
    const value = vector[i];
    sumSquares += value * value;
  }
  const norm = Math.sqrt(sumSquares);
  if (!norm) {
    vector.fill(0);
    return vector;
  }
  for (let i = 0; i < vector.length; i += 1) {
    vector[i] /= norm;
  }
  return vector;
};

const ensureEmbedding = (embedding) => {
  if (!embedding || typeof embedding.length !== 'number') {
    throw new Error('Embedding is required for attention scoring.');
  }
  if (embedding.length !== dimension) {
    throw new Error(`Embedding dimension ${embedding.length} does not match expected ${dimension}.`);
  }
  for (let i = 0; i < embedding.length; i += 1) {
    if (!isFiniteNumber(embedding[i])) {
      throw new Error('Embedding contains non-finite values.');
    }
  }
};

const baseType = (type) => (type === 'overview_open' ? 'overview_open' : 'source_click');

const hasSignal = (pubId, type) =>
  recentSignals.some((entry) => entry.pubId === pubId && baseType(entry.type) === baseType(type));

const inferType = (type, pubId) => {
  if (type !== 'source_click') return type;
  const hasOverview = recentSignals.some(
    (entry) => entry.pubId === pubId && entry.type === 'overview_open'
  );
  const hasSource = recentSignals.some(
    (entry) => entry.pubId === pubId && baseType(entry.type) === 'source_click'
  );
  if (hasOverview && !hasSource) {
    return 'source_click_after_overview';
  }
  return type;
};

const persistState = () => {
  const storage = getStorage();
  try {
    storage.setItem(
      STORAGE_VECTOR_KEY,
      JSON.stringify({ dim: dimension, vector: vectorToArray(interestVector) })
    );
    storage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(recentSignals));
  } catch {
    // Ignore storage write failures in MVP.
  }
};

const computeCosineScore = (embedding) => {
  ensureEmbedding(embedding);
  let vectorNorm = 0;
  for (let i = 0; i < interestVector.length; i += 1) {
    const value = interestVector[i];
    vectorNorm += value * value;
  }
  if (!vectorNorm) return 0;
  let dot = 0;
  let embedNorm = 0;
  for (let i = 0; i < embedding.length; i += 1) {
    const value = embedding[i];
    dot += interestVector[i] * value;
    embedNorm += value * value;
  }
  if (!embedNorm) return 0;
  const cosine = dot / (Math.sqrt(vectorNorm) * Math.sqrt(embedNorm));
  const normalized = (cosine + 1) / 2;
  if (normalized < 0) return 0;
  if (normalized > 1) return 1;
  return normalized;
};

const resolvePubId = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  if (typeof entry.pubId !== 'undefined') return entry.pubId;
  if (typeof entry.id !== 'undefined') return entry.id;
  return null;
};

const resolveEmbedding = (entry) => {
  if (!entry) return null;
  if (entry.embedding) return entry.embedding;
  return entry.embeddings?.overview || entry.embeddings?.annotation || null;
};

const recalcScoresAsync = (visiblePublications) => {
  if (!Array.isArray(visiblePublications) || visiblePublications.length === 0) {
    return Promise.resolve();
  }
  return Promise.resolve().then(() => {
    for (const entry of visiblePublications) {
      const pubId = resolvePubId(entry);
      const embedding = resolveEmbedding(entry);
      if (pubId === null || typeof pubId === 'undefined') {
        throw new Error('Visible publication is missing pubId.');
      }
      ensureEmbedding(embedding);
      const score = computeCosineScore(embedding);
      scoreCache.set(pubId, score);
    }
  });
};

const notifyBackend = ({ type, pubId }) => {
  try {
    sendAttentionSignal({ type, pubId });
  } catch {
    // Ignore attention beacon failures in MVP.
  }
};

export const init = ({ dim }) => {
  if (!Number.isInteger(dim) || dim <= 0) {
    throw new Error('init({ dim }) requires a positive integer dimension.');
  }
  dimension = dim;
  const storage = getStorage();
  const storedVector = parseVectorPayload(storage.getItem(STORAGE_VECTOR_KEY), dim);
  const storedHistory = parseHistoryPayload(storage.getItem(STORAGE_HISTORY_KEY));

  if (!storedVector || !storedHistory) {
    interestVector = createZeroVector(dim);
    recentSignals = [];
    scoreCache.clear();
    persistState();
    return;
  }

  interestVector = new Float32Array(storedVector);
  normalizeVector(interestVector);
  recentSignals = storedHistory;
  scoreCache.clear();
};

export const recordAttention = (
  { type, pubId },
  embedding,
  { visiblePublications } = {}
) => {
  ensureInitialized();
  if (!type || typeof pubId === 'undefined') {
    throw new Error('recordAttention requires type and pubId.');
  }
  const effectiveType = inferType(type, pubId);
  if (hasSignal(pubId, effectiveType)) {
    return Promise.resolve();
  }

  ensureEmbedding(embedding);
  const weight = WEIGHTS[effectiveType] ?? WEIGHTS.source_click;
  for (let i = 0; i < interestVector.length; i += 1) {
    interestVector[i] += embedding[i] * weight;
  }
  normalizeVector(interestVector);
  recentSignals.push({ type: effectiveType, pubId });
  if (recentSignals.length > MAX_HISTORY) {
    recentSignals = recentSignals.slice(recentSignals.length - MAX_HISTORY);
  }
  persistState();
  notifyBackend({ type: effectiveType, pubId });

  return recalcScoresAsync(visiblePublications);
};

export const scorePublication = (embedding) => {
  ensureInitialized();
  return computeCosineScore(embedding);
};

export const rankPublications = (list, { minScore = DEFAULT_MIN_SCORE } = {}) => {
  ensureInitialized();
  if (!Array.isArray(list)) {
    throw new Error('rankPublications expects an array of publications.');
  }
  const scored = [];
  for (const entry of list) {
    const embedding = resolveEmbedding(entry);
    ensureEmbedding(embedding);
    const score = computeCosineScore(embedding);
    const pubId = resolvePubId(entry);
    if (pubId !== null && typeof pubId !== 'undefined') {
      scoreCache.set(pubId, score);
    }
    if (score >= minScore) {
      scored.push({ entry, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.entry);
};

export const getScore = (pubId) => (scoreCache.has(pubId) ? scoreCache.get(pubId) : null);

export const getScores = () => new Map(scoreCache);

export const reset = () => {
  ensureInitialized();
  interestVector = createZeroVector(dimension);
  recentSignals = [];
  scoreCache.clear();
  persistState();
};

export const _testing = {
  _keys: Object.freeze({ STORAGE_VECTOR_KEY, STORAGE_HISTORY_KEY }),
  _weights: WEIGHTS,
  _maxHistory: MAX_HISTORY,
};
