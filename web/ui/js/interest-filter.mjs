// @ts-check

/**
 * @namespace Mindstream_Web_InterestFilter
 * @description Normalizes browser-local feed filter settings and resolves card visibility.
 */

const DEFAULT_ENABLED = true;

/**
 * Normalize a percentage into the supported inclusive range.
 * @param {number} value Candidate percentage.
 * @returns {number} Normalized percentage.
 */
const normalizeThreshold = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, number));
};

export default class Mindstream_Web_InterestFilter {
  /**
   * Create a browser-local feed visibility policy.
   */
  constructor() {
    /**
     * Normalize the independently persisted hiding toggle.
     * @param {object} settings Candidate settings.
     * @returns {object} Safe filter settings.
     */
    this.normalizeSettings = (settings = {}) => ({
      enabled: typeof settings.enabled === 'boolean' ? settings.enabled : DEFAULT_ENABLED,
    });

    /**
     * Decide whether one loaded publication belongs in the local feed projection.
     * @param {object} options Decision inputs.
     * @returns {boolean} True when the publication remains visible.
     */
    this.shouldShowPublication = (options) => {
      const { score, enabled, thresholdPercent, hasInterestProfile } = options;
      if (!enabled || !hasInterestProfile) return true;
      const normalizedScore = Number.isFinite(score) ? Math.min(1, Math.max(0, score)) : 0;
      return normalizedScore >= normalizeThreshold(thresholdPercent) / 100;
    };
  }
}

export const defaults = Object.freeze({
  enabled: DEFAULT_ENABLED,
});
