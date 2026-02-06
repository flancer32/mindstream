/**
 * @module Mindstream_Back_Web_Handler_Api
 * @description API ingress handler for /api/** requests.
 */
export default class Mindstream_Back_Web_Handler_Api {
  constructor({
    Mindstream_Back_Web_Api_Dispatcher$: dispatcher,
    Mindstream_Back_Web_Api_Handler_Fallback$: fallback,
  }) {
    const PREFIX = '/api';

    const normalizeUrl = function (url) {
      if (!url) return '';
      const raw = String(url);
      const questionIndex = raw.indexOf('?');
      return questionIndex >= 0 ? raw.slice(0, questionIndex) : raw;
    };

    const extractApiPath = function (url) {
      const normalized = normalizeUrl(url);
      if (!normalized.startsWith(PREFIX)) return null;
      const rest = normalized.slice(PREFIX.length);
      if (!rest) return '/';
      return rest.startsWith('/') ? rest : `/${rest}`;
    };

    const invokeEndpoint = async function (handler, payload) {
      if (typeof handler === 'function') {
        return await handler(payload);
      }
      if (handler?.handle) {
        return await handler.handle(payload);
      }
      throw new Error('API endpoint handler is invalid.');
    };

    this.getRegistrationInfo = function () {
      return Object.freeze({
        name: 'Mindstream_Back_Web_Handler_Api',
        stage: 'process',
        before: [],
        after: [],
      });
    };

    this.handle = async function (req, res) {
      const apiPath = extractApiPath(req?.url);
      if (!apiPath) return false;
      const endpoint = dispatcher.resolve(apiPath);
      if (endpoint) {
        await invokeEndpoint(endpoint, { req, res, path: apiPath });
      } else {
        await fallback.handle({ req, res, path: apiPath });
      }
      return true;
    };
  }
}
