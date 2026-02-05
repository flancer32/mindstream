/**
 * @module Mindstream_Back_Ingest_Rss_Client
 * @description Fetches RSS feeds over HTTPS.
 */
export default class Mindstream_Back_Ingest_Rss_Client {
  constructor({ 'node:https': httpsModule, 'node:url': urlModule, 'node:buffer': bufferModule }) {
    const httpsRef = httpsModule?.default ?? httpsModule;
    const URLRef = (urlModule && urlModule.URL) || URL;
    const BufferRef = (bufferModule && bufferModule.Buffer) || Buffer;

    const MAX_REDIRECTS = 5;

    const fetchOnce = function (url, redirectCount) {
      return new Promise((resolve, reject) => {
        const request = httpsRef.get(url, (response) => {
          const status = response.statusCode ?? 0;
          const location = response.headers?.location;

          if (status >= 300 && status < 400 && location && redirectCount < MAX_REDIRECTS) {
            const nextUrl = new URLRef(location, url).toString();
            response.resume();
            fetchOnce(nextUrl, redirectCount + 1).then(resolve).catch(reject);
            return;
          }

          if (status < 200 || status >= 300) {
            response.resume();
            reject(new Error(`RSS request failed with status ${status}.`));
            return;
          }

          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => {
            const body = BufferRef.concat(chunks).toString('utf-8');
            resolve(body);
          });
        });

        request.on('error', (err) => reject(err));
      });
    };

    this.fetch = async function (url) {
      if (!url || typeof url !== 'string') {
        throw new Error('RSS URL must be a string.');
      }
      return await fetchOnce(url, 0);
    };
  }
}
