// @ts-check
/**
 * @namespace Mindstream_Shared_Api_Attention
 * @description Creates and validates anonymous attention-signal transport DTOs.
 */
export default class Mindstream_Shared_Api_Attention {
  /**
   * @param {object} deps
   * @param {Mindstream_Shared_Api_Identity} deps.identity
   */
  constructor({ identity }) {
    const TYPES = Object.freeze(['overview_view', 'link_click', 'link_click_after_overview']);
    const CLIENT_TYPES = Object.freeze({
      overview_open: 'overview_view',
      source_click: 'link_click',
      source_click_after_overview: 'link_click_after_overview',
    });

    /** @param {unknown} value @returns {object} */
    this.createSignal = /**
 * @param {unknown} value
 * @returns {unknown}
 */
function (value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('Attention signal must be an object.');
      }
      const registration = identity.createRegistration({ identity: value.identity });
      const publicationId = Number(value.publication_id);
      if (!Number.isFinite(publicationId)) {
        throw new TypeError('Attention signal requires a finite publication_id.');
      }
      if (typeof value.attention_type !== 'string' || !TYPES.includes(value.attention_type)) {
        throw new TypeError('Attention signal contains an unsupported attention_type.');
      }
      return Object.freeze({
        identity: registration.identity,
        publication_id: publicationId,
        attention_type: value.attention_type,
      });
    };

    /** @param {object} value @returns {object} */
    this.createClientSignal = /**
 * @param {unknown} value
 * @returns {unknown}
 */
function (value = {}) {
      const { identity: identityValue, pubId, type } = value;
      return this.createSignal({
        identity: identityValue,
        publication_id: pubId,
        attention_type: CLIENT_TYPES[type],
      });
    };
  }
}

export const __deps__ = Object.freeze({
  identity: 'Mindstream_Shared_Api_Identity$',
});
