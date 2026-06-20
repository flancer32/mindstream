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

const findMinMax = (entries) => {
  if (entries.length === 0) return { min: 0, max: 0 };
  let min = entries[0].score;
  let max = entries[0].score;
  for (const entry of entries) {
    if (entry.score < min) min = entry.score;
    if (entry.score > max) max = entry.score;
  }
  return { min, max };
};

export const resolveTopInterestRange = (entries) => {
  const normalized = normalizeEntries(entries);
  if (normalized.length === 0) {
    return { min: 0, max: 0, threshold: 0, topIds: new Set() };
  }

  const { min, max } = findMinMax(normalized);

  if (Math.abs(max - min) < EPSILON) {
    const topIds = new Set(normalized.map((e) => e.pubId));
    return { min, max, threshold: min, topIds };
  }

  const cutoff = min + (max - min) * 0.9;
  const remaining = normalized.filter((e) => e.score < cutoff);

  let markThreshold;
  if (remaining.length === 0) {
    markThreshold = min;
  } else {
    const { min: rMin, max: rMax } = findMinMax(remaining);
    markThreshold = rMin + (rMax - rMin) * 0.8;
  }

  const topIds = new Set();
  for (const entry of normalized) {
    if (entry.score + EPSILON >= markThreshold) {
      topIds.add(entry.pubId);
    }
  }

  return { min, max, threshold: markThreshold, topIds };
};

export const resolveTopInterestRangeManual = (entries, thresholdPercent) => {
  const normalized = normalizeEntries(entries);
  if (normalized.length === 0) {
    return { min: 0, max: 0, threshold: 0, topIds: new Set() };
  }

  const { min, max } = findMinMax(normalized);
  const normalizedThreshold = Math.min(100, Math.max(0, thresholdPercent));
  const markThreshold = normalizedThreshold / 100;

  const topIds = new Set();
  for (const entry of normalized) {
    if (entry.score + EPSILON >= markThreshold) {
      topIds.add(entry.pubId);
    }
  }

  return { min, max, threshold: markThreshold, topIds };
};

export const scoreToPercent = (score) => Math.round(clampScore(score) * 100);
const EPSILON = 1e-12;
