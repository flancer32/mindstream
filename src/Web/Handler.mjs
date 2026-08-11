// @ts-check
/**
 * @namespace Mindstream_Back_Web_Handler
 * @description API ingress handler for /api/** requests.
 */
export default class Mindstream_Back_Web_Handler {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Web_Api_Fallback$} deps.fallback
 * @param {Mindstream_Back_Web_Api_FeedView$} deps.feedView
 * @param {Mindstream_Back_Web_Api_Attention$} deps.attention
 * @param {Mindstream_Back_Web_Api_Identity$} deps.identity
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {TeqFw_Web_Back_Enum_Stage$} deps.STAGE
 */
constructor({
    fallback,
    feedView,
    attention,
    identity,
    logger,
    STAGE,
  }) {
    const PREFIX = '/api';
    const NAMESPACE = 'Mindstream_Back_Web_Handler';
    const handlers = new Map([
      ['/feed', feedView],
      ['/attention', attention],
      ['/identity', identity],
    ]);

    /**
 * @param {unknown} url
 * @returns {unknown}
 */
/**
 * @param {unknown} url
 * @returns {unknown}
 */
const normalizeUrl = function (url) {
      if (!url) return '';
      const raw = String(url);
      const questionIndex = raw.indexOf('?');
      return questionIndex >= 0 ? raw.slice(0, questionIndex) : raw;
    };

    /**
 * @param {unknown} url
 * @returns {unknown}
 */
/**
 * @param {unknown} url
 * @returns {unknown}
 */
const extractApiPath = function (url) {
      const normalized = normalizeUrl(url);
      if (!normalized.startsWith(PREFIX)) return null;
      const rest = normalized.slice(PREFIX.length);
      if (!rest) return '/';
      return rest.startsWith('/') ? rest : `/${rest}`;
    };

    /**
 * @param {unknown} handler
 * @param {unknown} payload
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} handler
 * @param {unknown} payload
 * @returns {Promise<unknown>}
 */
const invokeEndpoint = async function (handler, payload) {
      if (typeof handler === 'function') {
        return await handler(payload);
      }
      if (handler?.handle) {
        return await handler.handle(payload);
      }
      throw new Error('API endpoint handler is invalid.');
    };

    /**
 * @param {unknown} req
 * @returns {unknown}
 */
/**
 * @param {unknown} req
 * @returns {unknown}
 */
const extractClientIp = function (req) {
      const forwarded = req?.headers?.['x-forwarded-for'];
      const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      if (typeof value === 'string' && value.trim()) {
        return value.split(',', 1)[0].trim();
      }
      return req?.socket?.remoteAddress ?? req?.connection?.remoteAddress ?? null;
    };

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
this.getRegistrationInfo = function () {
      return Object.freeze({
        name: 'Mindstream_Back_Web_Handler',
        stage: STAGE.PROCESS,
        before: [],
        after: [],
      });
    };

    /**
 * @param {unknown} context
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} context
 * @returns {Promise<unknown>}
 */
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
  default: Object.freeze({
    fallback: 'Mindstream_Back_Web_Api_Fallback$',
    feedView: 'Mindstream_Back_Web_Api_FeedView$',
    attention: 'Mindstream_Back_Web_Api_Attention$',
    identity: 'Mindstream_Back_Web_Api_Identity$',
    logger: 'Mindstream_Back_Logger$',
    STAGE: 'TeqFw_Web_Back_Enum_Stage$',
  }),
});
