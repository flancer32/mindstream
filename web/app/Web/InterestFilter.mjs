/** @namespace Mindstream_Web_InterestFilter */
export default class Mindstream_Web_InterestFilter {
  constructor() {
    this.defaults = Object.freeze({ enabled: true });
    this.normalizeSettings = (settings = {}) => ({ enabled: typeof settings.enabled === 'boolean' ? settings.enabled : true });
    this.shouldShowPublication = ({ score, enabled, thresholdPercent, hasInterestProfile }) => !enabled || !hasInterestProfile || Math.min(1, Math.max(0, Number(score) || 0)) >= Math.min(100, Math.max(0, Number(thresholdPercent) || 0)) / 100;
  }
}
