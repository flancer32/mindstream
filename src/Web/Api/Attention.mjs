// @ts-check
/**
 * @namespace Mindstream_Back_Web_Api_Attention
 * @description Handles /api/attention requests and persists attention events.
 */
export default class Mindstream_Back_Web_Api_Attention {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Attention_Ingress$} deps.ingress
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {Fl32_Web_Back_Helper_Respond$} deps.respond
 */
constructor({
    ingress,
    logger,
    respond,
  }) {
    const NAMESPACE = 'Mindstream_Back_Web_Api_Attention';

    /**
 * @param {unknown} err
 * @returns {unknown}
 */
/**
 * @param {unknown} err
 * @returns {unknown}
 */
const ensureError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

    /**
 * @param {unknown} req
 * @returns {unknown}
 */
/**
 * @param {unknown} req
 * @returns {unknown}
 */
const readBody = function (req) {
      return new Promise((resolve, reject) => {
        if (!req || typeof req.on !== 'function') {
          resolve('');
          return;
        }
        let raw = '';
        req.on('data', (chunk) => {
          if (chunk === undefined || chunk === null) return;
          raw += Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : String(chunk);
        });
        req.on('end', () => resolve(raw));
        req.on('error', (err) => reject(err));
      });
    };

    /**
 * @param {unknown} res
 * @returns {unknown}
 */
/**
 * @param {unknown} res
 * @returns {unknown}
 */
const respondUnprocessable = function (res) {
      if (!respond?.isWritable || !respond.isWritable(res)) return false;
      if (!res?.writeHead || !res?.end) return false;
      res.writeHead(422);
      res.end('');
      return true;
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.req
 * @param {unknown} deps.res
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} deps
 * @param {unknown} deps.req
 * @param {unknown} deps.res
 * @returns {Promise<unknown>}
 */
this.handle = async function ({ req, res }) {
      try {
        const raw = await readBody(req);
        let payload;
        try {
          payload = JSON.parse(raw);
        } catch (err) {
          respond.code400_BadRequest({ res });
          return true;
        }

        const result = await ingress.accept(payload);
        if (result?.ok) {
          respond.code204_NoContent({ res });
          return true;
        }

        if (result?.status === 400) {
          respond.code400_BadRequest({ res });
          return true;
        }

        if (result?.status === 422) {
          respondUnprocessable(res);
          return true;
        }

        respond.code500_InternalServerError({ res });
        return true;
      } catch (err) {
        const error = ensureError(err);
        if (logger?.exception) {
          logger.exception(NAMESPACE, error);
        }
        respond.code500_InternalServerError({ res });
        return true;
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    ingress: 'Mindstream_Back_Attention_Ingress$',
    logger: 'Mindstream_Back_Logger$',
    respond: 'Fl32_Web_Back_Helper_Respond$',
  }),
});
