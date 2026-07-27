// @ts-check
/**
 * @namespace Mindstream_Web_Transport_Beacon
 * @description Sends JSON DTOs through the browser beacon transport boundary.
 */
export default class Mindstream_Web_Transport_Beacon {
  /**
   * @param {object} deps
   * @param {Mindstream_Web_Platform_Browser} deps.browser
   */
  constructor({ browser }) {
    /** @param {string} path @param {object} payload @returns {boolean} */
    this.sendJson = /**
 * @param {unknown} path
 * @param {unknown} payload
 * @returns {unknown}
 */
function (path, payload) {
      const navigator = browser.getNavigator();
      if (typeof navigator?.sendBeacon !== 'function') return false;
      try {
        const origin = browser.getLocation()?.origin;
        const url = origin ? new browser.URL(path, origin).toString() : path;
        const body = browser.Blob
          ? new browser.Blob([JSON.stringify(payload)], { type: 'application/json' })
          : JSON.stringify(payload);
        return navigator.sendBeacon(url, body);
      } catch {
        return false;
      }
    };
  }
}

export const __deps__ = Object.freeze({
  browser: 'Mindstream_Web_Platform_Browser$',
});
