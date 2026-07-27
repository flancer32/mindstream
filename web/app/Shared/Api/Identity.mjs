// @ts-check
/**
 * @namespace Mindstream_Shared_Api_Identity
 * @description Creates and validates anonymous-identity transport DTOs.
 */
export default class Mindstream_Shared_Api_Identity {
  /** @returns {void} */
  constructor() {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

    /** @param {unknown} value @returns {object} */
    this.createRegistration = /**
 * @param {unknown} value
 * @returns {unknown}
 */
function (value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('Identity registration must be an object.');
      }
      if (typeof value.identity !== 'string' || !UUID_RE.test(value.identity.trim())) {
        throw new TypeError('Identity registration requires a UUID identity.');
      }
      return Object.freeze({ identity: value.identity.trim() });
    };
  }
}
