// @ts-check
/**
 * @namespace Mindstream_Back_Web_Api_Identity
 * @description Handles /api/identity registration requests.
 */
export default class Mindstream_Back_Web_Api_Identity {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Storage_Database$} deps.database
 * @param {Mindstream_Back_Logger$} deps.logger
 * @param {Mindstream_Shared_Api_Identity$} deps.identityContract
 * @param {TeqFw_Web_Back_Helper_Respond$} deps.respond
 */
constructor({
    database,
    logger,
    identityContract,
    respond,
  }) {
    const NAMESPACE = 'Mindstream_Back_Web_Api_Identity';

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
const getKnex = function () {
      return database.get();
    };

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
 * @param {unknown} identityId
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} identityId
 * @returns {Promise<unknown>}
 */
const storeIdentity = async function (identityId) {
      const registeredAt = new Date().toISOString();
      await getKnex()('anonymous_identities')
        .insert({ identity_uuid: identityId, registered_at: registeredAt })
        .onConflict(['identity_uuid'])
        .ignore();
    };

    /**
 * @param {unknown} res
 * @returns {unknown}
 */
/**
 * @param {unknown} res
 * @returns {unknown}
 */
const respondNoContent = function (res) {
      if (respond?.code204_NoContent) {
        respond.code204_NoContent({ res });
        return;
      }
      if (!res?.writeHead || !res?.end) return;
      res.writeHead(204);
      res.end('');
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
        } catch {
          payload = null;
        }
        const registration = identityContract.createRegistration(payload);
        await storeIdentity(registration.identity);
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

export const __deps__ = Object.freeze({
  default: Object.freeze({
    database: 'Mindstream_Back_Storage_Database$',
    logger: 'Mindstream_Back_Logger$',
    identityContract: 'Mindstream_Shared_Api_Identity$',
    respond: 'TeqFw_Web_Back_Helper_Respond$',
  }),
});
