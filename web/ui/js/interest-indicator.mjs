const clampScore = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const normalizeEntries = (entries) => {
  if (!Array.isArray(entries)) return [];
  const normalized = [];
  for (const entry of entries) {
    const pubId = entry?.pubId;
    if (pubId === null || typeof pubId === 'undefined') continue;
    normalized.push({ pubId, score: clampScore(entry?.score) });
  }
  return normalized;
};

export const resolveTopInterestRange = (entries) => {
  const normalized = normalizeEntries(entries);
  if (normalized.length === 0) {
    return { min: 0, max: 0, threshold: 0, topIds: new Set() };
  }

  let min = normalized[0].score;
  let max = normalized[0].score;
  for (const entry of normalized) {
    if (entry.score < min) min = entry.score;
    if (entry.score > max) max = entry.score;
  }

  const threshold = min + (max - min) * 0.8;
  const topIds = new Set();
  for (const entry of normalized) {
    if (entry.score + EPSILON >= threshold && entry.score <= max + EPSILON) {
      topIds.add(entry.pubId);
    }
  }

  return { min, max, threshold, topIds };
};

export const scoreToPercent = (score) => Math.round(clampScore(score) * 100);
const EPSILON = 1e-12;
