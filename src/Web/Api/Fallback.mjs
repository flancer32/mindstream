// @ts-check
/**
 * @namespace Mindstream_Back_Web_Api_Fallback
 * @description Handles unknown /api/** requests.
 */
export default class Mindstream_Back_Web_Api_Fallback {
/**
 * @param {object} deps
 * @param {TeqFw_Web_Back_Helper_Respond$} deps.respond
 */
constructor({ respond }) {
    /**
 * @param {unknown} path
 * @returns {unknown}
 */
/**
 * @param {unknown} path
 * @returns {unknown}
 */
const buildPayload = function (path) {
      return {
        status: 'ok',
        message: 'api is alive',
        path,
      };
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.res
 * @param {unknown} deps.path
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} deps
 * @param {unknown} deps.res
 * @param {unknown} deps.path
 * @returns {Promise<unknown>}
 */
this.handle = async function ({ res, path }) {
      respond.code200_Ok({
        res,
        headers: { 'content-type': 'application/json' },
        body: buildPayload(path),
      });
      return true;
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    respond: 'TeqFw_Web_Back_Helper_Respond$',
  }),
});
