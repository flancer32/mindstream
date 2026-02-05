/**
 * @module Mindstream_Back_Ingest_Extract_Habr_Fetcher
 * @description Loads HTML for Habr publications via fetch.
 */
export default class Mindstream_Back_Ingest_Extract_Habr_Fetcher {
  constructor({ Mindstream_Back_Platform_Fetch$: fetchProvider }) {
    const fetchRef = typeof fetchProvider?.fetch === 'function' ? fetchProvider.fetch.bind(fetchProvider) : fetchProvider;

    const ensureFetch = function () {
      if (typeof fetchRef !== 'function') {
        throw new Error('Fetch function is not available.');
      }
      return fetchRef;
    };

    const buildError = function (message, details) {
      const err = new Error(message);
      err.isFetchError = true;
      if (details) err.details = details;
      return err;
    };

    this.fetchHtml = async function (url) {
      if (!url || typeof url !== 'string') {
        throw buildError('Publication URL must be a string.');
      }

      const fetchFn = ensureFetch();
      const response = await fetchFn(url, { redirect: 'manual' });
      const status = response?.status ?? 0;

      if (response?.redirected || (status >= 300 && status < 400)) {
        throw buildError(`Redirects are not allowed (status ${status}).`);
      }
      if (status < 200 || status >= 300) {
        throw buildError(`HTML request failed with status ${status}.`);
      }

      const html = await response.text();
      if (!html) {
        throw buildError('HTML response is empty.');
      }
      return html;
    };
  }
}
