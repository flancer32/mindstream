// @ts-check
/** @namespace Mindstream_Web_InterestFilter  @description DI-managed Mindstream module. */
export default class Mindstream_Web_InterestFilter {
  /**
 */
constructor() {
    this.defaults = Object.freeze({ enabled: true });
    /**
 * @param {unknown} settings
 * @returns {unknown}
 */
this.normalizeSettings = /**
 * @param {unknown} settings
 * @returns {unknown}
 */
(settings = {}) => ({ enabled: typeof settings.enabled === 'boolean' ? settings.enabled : true });
    /**
 * @param {unknown} deps
 * @param {unknown} deps.score
 * @param {unknown} deps.enabled
 * @param {unknown} deps.thresholdPercent
 * @param {unknown} deps.hasInterestProfile
 * @returns {unknown}
 */
this.shouldShowPublication = /**
 * @param {unknown} deps
 * @param {unknown} deps.score
 * @param {unknown} deps.enabled
 * @param {unknown} deps.thresholdPercent
 * @param {unknown} deps.hasInterestProfile
 * @returns {unknown}
 */
({ score, enabled, thresholdPercent, hasInterestProfile }) => !enabled || !hasInterestProfile || Math.min(1, Math.max(0, Number(score) || 0)) >= Math.min(100, Math.max(0, Number(thresholdPercent) || 0)) / 100;
  }
}
