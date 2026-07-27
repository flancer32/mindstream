// @ts-check
/**
 * @namespace Mindstream_Web_Transport_Feed
 * @description Fetches and validates feed pages at the browser HTTP boundary.
 */
export default class Mindstream_Web_Transport_Feed {
  /**
   * @param {object} deps
   * @param {Mindstream_Web_Platform_Browser$} deps.browser
   * @param {Mindstream_Shared_Api_Feed$} deps.feed
   */
  constructor({ browser, feed }) {
    /** @param {object} options @returns {Promise<object>} */
    this.getPage = async function (options = {}) {
      const { cursor } = /** @type {{cursor?: unknown}} */ (options);
      const url = new browser.URL('/api/feed', browser.getLocation().origin);
      const normalizedCursor = feed.createCursor(cursor);
      if (normalizedCursor) {
        url.searchParams.set('id', String(normalizedCursor.id));
        if (normalizedCursor.publishedAt) url.searchParams.set('publishedAt', normalizedCursor.publishedAt);
      }
      const response = await browser.fetch(url.toString(), { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`Feed request failed with HTTP ${response.status}.`);
      return feed.createResponse(await response.json());
    };
  }
}

export const __deps__ = Object.freeze({
  browser: 'Mindstream_Web_Platform_Browser$',
  feed: 'Mindstream_Shared_Api_Feed$',
});
