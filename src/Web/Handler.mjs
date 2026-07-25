// @ts-check
/**
 * @namespace Mindstream_Back_Web_Handler
 * @description API ingress handler for /api/** requests.
 */
export default class Mindstream_Back_Web_Handler {
  constructor({
    Mindstream_Back_Web_Api_Fallback$: fallback,
    Mindstream_Back_Web_Api_FeedView$: feedView,
    Mindstream_Back_Web_Api_Attention$: attention,
    Mindstream_Back_Web_Api_Identity$: identity,
    Mindstream_Shared_Logger$: logger,
    Fl32_Web_Back_Enum_Stage$: STAGE,
  }) {
    const PREFIX = '/api';
    const NAMESPACE = 'Mindstream_Back_Web_Handler';
    const handlers = new Map([
      ['/feed', feedView],
      ['/attention', attention],
      ['/identity', identity],
    ]);

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

    const extractClientIp = function (req) {
      const forwarded = req?.headers?.['x-forwarded-for'];
      const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      if (typeof value === 'string' && value.trim()) {
        return value.split(',', 1)[0].trim();
      }
      return req?.socket?.remoteAddress ?? req?.connection?.remoteAddress ?? null;
    };

    this.getRegistrationInfo = function () {
      return Object.freeze({
        name: 'Mindstream_Back_Web_Handler',
        stage: STAGE.PROCESS,
        before: [],
        after: [],
      });
    };

    this.handle = async function (context) {
      const req = context.request;
      const res = context.response;
      const apiPath = extractApiPath(req?.url);
      if (!apiPath) return;
      logger.info(NAMESPACE, 'API request received.', {
        method: req?.method ?? null,
        path: apiPath,
        clientIp: extractClientIp(req),
      });
      const endpoint = handlers.get(apiPath);
      if (endpoint) {
        await invokeEndpoint(endpoint, { req, res, path: apiPath });
      } else {
        await fallback.handle({ req, res, path: apiPath });
      }
      context.completed = true;
    };
  }
}

export const __deps__ = Object.freeze({
  default: {
    'Mindstream_Back_Web_Api_Fallback$': 'Mindstream_Back_Web_Api_Fallback$',
    'Mindstream_Back_Web_Api_FeedView$': 'Mindstream_Back_Web_Api_FeedView$',
    'Mindstream_Back_Web_Api_Attention$': 'Mindstream_Back_Web_Api_Attention$',
    'Mindstream_Back_Web_Api_Identity$': 'Mindstream_Back_Web_Api_Identity$',
    'Mindstream_Shared_Logger$': 'Mindstream_Shared_Logger$',
    'Fl32_Web_Back_Enum_Stage$': 'Fl32_Web_Back_Enum_Stage$',
  },
});
