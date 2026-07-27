/** @namespace Mindstream_Web_Attention */
export default class Mindstream_Web_Attention {
  constructor({ Mindstream_Web_Identity$: identity, Mindstream_Web_Platform_Browser$: browser }) {
    const VECTOR_KEY = 'mindstream.attention.interestVector';
    const HISTORY_KEY = 'mindstream.attention.recentSignals';
    const weights = Object.freeze({ overview_open: 1, source_click: 1.6, source_click_after_overview: 2.4 });
    let dimension = null, vector = null, history = [], scores = new Map();
    const storage = () => browser.getStorage();
    const ensure = () => { if (!dimension || !vector) throw new Error('Attention module is not initialized.'); };
    const normalize = () => { const norm = Math.hypot(...vector); if (norm) vector.forEach((v, i) => { vector[i] = v / norm; }); };
    const embedding = (value) => { if (!value || value.length !== dimension || Array.from(value).some((v) => !Number.isFinite(v))) throw new Error('Embedding is invalid.'); };
    const score = (value) => { embedding(value); const norm = Math.hypot(...vector) * Math.hypot(...value); return norm ? Math.max(0, Math.min(1, ((vector.reduce((sum, v, i) => sum + v * value[i], 0) / norm) + 1) / 2)) : 0; };
    const persist = () => { try { storage()?.setItem(VECTOR_KEY, JSON.stringify({ dim: dimension, vector: Array.from(vector) })); storage()?.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {} };
    this.init = ({ dim }) => {
      if (!Number.isInteger(dim) || dim <= 0) throw new Error('init({ dim }) requires a positive integer dimension.');
      dimension = dim;
      try {
        const stored = JSON.parse(storage()?.getItem(VECTOR_KEY));
        const previous = JSON.parse(storage()?.getItem(HISTORY_KEY));
        vector = stored?.dim === dim && Array.isArray(stored.vector) && stored.vector.length === dim ? new Float32Array(stored.vector) : new Float32Array(dim);
        history = Array.isArray(previous) ? previous.slice(-100) : [];
      } catch { vector = new Float32Array(dim); history = []; }
      normalize(); scores.clear(); persist();
    };
    this.recordAttention = async ({ type, pubId }, itemEmbedding, { visiblePublications = [] } = {}) => {
      ensure(); embedding(itemEmbedding);
      const sourceSeen = history.some((entry) => entry.pubId === pubId && entry.type !== 'overview_open');
      const effective = type === 'source_click' && history.some((entry) => entry.pubId === pubId && entry.type === 'overview_open') && !sourceSeen ? 'source_click_after_overview' : type;
      if (history.some((entry) => entry.pubId === pubId && (entry.type === effective || (effective !== 'overview_open' && entry.type !== 'overview_open')))) return;
      vector.forEach((v, i) => { vector[i] = v + itemEmbedding[i] * (weights[effective] ?? weights.source_click); });
      normalize(); history.push({ type: effective, pubId }); history = history.slice(-100); persist(); identity.sendAttentionSignal({ type: effective, pubId });
      for (const entry of visiblePublications) scores.set(entry.pubId, score(entry.embedding));
    };
    this.scorePublication = (value) => { ensure(); return score(value); };
    this.getScore = (pubId) => scores.get(pubId) ?? null;
    this.hasInterestProfile = () => { ensure(); return Array.from(vector).some(Boolean); };
  }
}

export const __deps__ = Object.freeze({ default: Object.freeze({ 'Mindstream_Web_Identity$': 'Mindstream_Web_Identity$', 'Mindstream_Web_Platform_Browser$': 'Mindstream_Web_Platform_Browser$' }) });
