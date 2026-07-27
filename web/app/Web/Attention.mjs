// @ts-check
/** @namespace Mindstream_Web_Attention  @description DI-managed Mindstream module. */
export default class Mindstream_Web_Attention {
  /**
 * @param {object} deps
 * @param {Mindstream_Web_Identity$} deps.identity
 * @param {Mindstream_Web_Platform_Browser$} deps.browser
 */
constructor({ identity, browser }) {
    const VECTOR_KEY = 'mindstream.attention.interestVector';
    const HISTORY_KEY = 'mindstream.attention.recentSignals';
    const weights = Object.freeze({ overview_open: 1, source_click: 1.6, source_click_after_overview: 2.4 });
    let dimension = null, vector = null, history = [], scores = new Map();
    /**
 * @returns {unknown}
 */
const storage = /**
 * @returns {unknown}
 */
() => browser.getStorage();
    /**
 * @returns {unknown}
 */
const ensure = /**
 * @returns {unknown}
 */
() => { if (!dimension || !vector) throw new Error('Attention module is not initialized.'); };
    /**
 * @returns {unknown}
 */
const normalize = /**
 * @returns {unknown}
 */
() => { const norm = Math.hypot(...vector); if (norm) vector.forEach((v, i) => { vector[i] = v / norm; }); };
    /**
 * @param {unknown} value
 * @returns {unknown}
 */
const embedding = /**
 * @param {unknown} value
 * @returns {unknown}
 */
(value) => { if (!value || value.length !== dimension || Array.from(value).some((v) => !Number.isFinite(v))) throw new Error('Embedding is invalid.'); };
    /**
 * @param {unknown} value
 * @returns {unknown}
 */
const score = /**
 * @param {unknown} value
 * @returns {unknown}
 */
(value) => { embedding(value); const norm = Math.hypot(...vector) * Math.hypot(...value); return norm ? Math.max(0, Math.min(1, ((vector.reduce((sum, v, i) => sum + v * value[i], 0) / norm) + 1) / 2)) : 0; };
    /**
 * @returns {unknown}
 */
const persist = /**
 * @returns {unknown}
 */
() => { try { storage()?.setItem(VECTOR_KEY, JSON.stringify({ dim: dimension, vector: Array.from(vector) })); storage()?.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {} };
    /**
 * @param {unknown} deps
 * @param {unknown} deps.dim
 * @returns {unknown}
 */
this.init = /**
 * @param {unknown} deps
 * @param {unknown} deps.dim
 * @returns {unknown}
 */
({ dim }) => {
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
    /**
 * @param {unknown} payload
 * @param {unknown} itemEmbedding
 * @param {unknown} options
 * @returns {Promise<unknown>}
 */
this.recordAttention = /**
 * @param {unknown} payload
 * @param {unknown} itemEmbedding
 * @param {unknown} options
 * @returns {Promise<unknown>}
 */
async (payload = {}, itemEmbedding, options = {}) => {
      const { type, pubId } = payload;
      const { visiblePublications = [] } = options;
      ensure(); embedding(itemEmbedding);
      const sourceSeen = history.some((entry) => entry.pubId === pubId && entry.type !== 'overview_open');
      const effective = type === 'source_click' && history.some((entry) => entry.pubId === pubId && entry.type === 'overview_open') && !sourceSeen ? 'source_click_after_overview' : type;
      if (history.some((entry) => entry.pubId === pubId && (entry.type === effective || (effective !== 'overview_open' && entry.type !== 'overview_open')))) return;
      vector.forEach((v, i) => { vector[i] = v + itemEmbedding[i] * (weights[effective] ?? weights.source_click); });
      normalize(); history.push({ type: effective, pubId }); history = history.slice(-100); persist(); identity.sendAttentionSignal({ type: effective, pubId });
      for (const entry of visiblePublications) scores.set(entry.pubId, score(entry.embedding));
    };
    /**
 * @param {unknown} value
 * @returns {unknown}
 */
this.scorePublication = /**
 * @param {unknown} value
 * @returns {unknown}
 */
(value) => { ensure(); return score(value); };
    /**
 * @param {unknown} pubId
 * @returns {unknown}
 */
this.getScore = /**
 * @param {unknown} pubId
 * @returns {unknown}
 */
(pubId) => scores.get(pubId) ?? null;
    /**
 * @returns {unknown}
 */
this.hasInterestProfile = /**
 * @returns {unknown}
 */
() => { ensure(); return Array.from(vector).some(Boolean); };
  }
}

export const __deps__ = Object.freeze({
  default: {
    identity: 'Mindstream_Web_Identity$',
    browser: 'Mindstream_Web_Platform_Browser$',
  },
});
