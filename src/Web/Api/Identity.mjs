/**
 * @module Mindstream_Back_Web_Api_Identity
 * @description Handles /api/identity registration requests.
 */
export default class Mindstream_Back_Web_Api_Identity {
  constructor({
    Mindstream_Back_Storage_Knex$: knexProvider,
    Mindstream_Shared_Logger$: logger,
    Fl32_Web_Back_Helper_Respond$: respond,
  }) {
    const NAMESPACE = 'Mindstream_Back_Web_Api_Identity';
    const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/u;

    const getKnex = function () {
      return knexProvider.get();
    };

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

    const normalizeIdentity = function (value) {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      return UUID_RE.test(trimmed) ? trimmed : null;
    };

    const storeIdentity = async function (identityId) {
      const registeredAt = new Date().toISOString();
      await getKnex()('anonymous_identities')
        .insert({ identity_uuid: identityId, registered_at: registeredAt })
        .onConflict(['identity_uuid'])
        .ignore();
    };

    const respondNoContent = function (res) {
      if (respond?.code204_NoContent) {
        respond.code204_NoContent({ res });
        return;
      }
      if (!res?.writeHead || !res?.end) return;
      res.writeHead(204);
      res.end('');
    };

    this.handle = async function ({ req, res }) {
      try {
        const raw = await readBody(req);
        let payload;
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = null;
        }
        const identityId = normalizeIdentity(payload?.identity);
        if (identityId) {
          await storeIdentity(identityId);
        }
      } catch (err) {
        const error = ensureError(err);
        if (logger?.exception) {
          logger.exception(NAMESPACE, error);
        }
      }
      respondNoContent(res);
      return true;
    };
  }
}
