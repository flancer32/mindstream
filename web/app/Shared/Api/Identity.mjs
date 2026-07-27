// @ts-check
/**
 * @namespace Mindstream_Shared_Api_Identity
 * @description Creates and validates anonymous-identity transport DTOs.
 */
export default class Mindstream_Shared_Api_Identity {
  /** @description Initializes anonymous identity DTO validators. */
  constructor() {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

    /** @param {unknown} value @returns {Mindstream_Shared_Api_Identity_Registration} */
    this.createRegistration = function (value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('Identity registration must be an object.');
      }
      const registration = /** @type {Mindstream_Shared_Api_Identity_Registration} */ (value);
      if (typeof registration.identity !== 'string' || !UUID_RE.test(registration.identity.trim())) {
        throw new TypeError('Identity registration requires a UUID identity.');
      }
      return Object.freeze({ identity: registration.identity.trim() });
    };
  }
}
