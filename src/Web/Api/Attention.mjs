/**
 * @module Mindstream_Back_Web_Api_Attention
 * @description Handles /api/attention requests and persists attention events.
 */
export default class Mindstream_Back_Web_Api_Attention {
  constructor({
    Mindstream_Back_Attention_Ingress$: ingress,
    Mindstream_Shared_Logger$: logger,
    Fl32_Web_Back_Helper_Respond$: respond,
  }) {
    const NAMESPACE = 'Mindstream_Back_Web_Api_Attention';

    const ensureError = function (err) {
      if (err instanceof Error) return err;
      return new Error(String(err));
    };

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

    const respondUnprocessable = function (res) {
      if (!respond?.isWritable || !respond.isWritable(res)) return false;
      if (!res?.writeHead || !res?.end) return false;
      res.writeHead(422);
      res.end('');
      return true;
    };

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
