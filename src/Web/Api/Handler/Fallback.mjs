/**
 * @module Mindstream_Back_Web_Api_Handler_Fallback
 * @description Handles unknown /api/** requests.
 */
export default class Mindstream_Back_Web_Api_Handler_Fallback {
  constructor({ Fl32_Web_Back_Helper_Respond$: respond }) {
    const buildPayload = function (path) {
      return {
        status: 'ok',
        message: 'api is alive',
        path,
      };
    };

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
