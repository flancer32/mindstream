// @ts-check
/**
 * @namespace Mindstream_Back_Attention_Ingress
 * @description Validates attention write payloads and persists them in Storage.
 */
export default class Mindstream_Back_Attention_Ingress {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Storage_Knex$} deps.knexProvider
 * @param {Mindstream_Shared_Api_Attention$} deps.attentionContract
 */
constructor({ knexProvider, attentionContract }) {

    /**
 * @returns {unknown}
 */
/**
 * @returns {unknown}
 */
const getKnex = function () {
      return knexProvider.get();
    };

    /**
 * @param {unknown} identityUuid
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} identityUuid
 * @returns {Promise<unknown>}
 */
const resolveIdentityId = async function (identityUuid) {
      const row = await getKnex()('anonymous_identities')
        .select('id')
        .where({ identity_uuid: identityUuid })
        .first();
      return row?.id ?? null;
    };

    /**
 * @param {unknown} publicationId
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} publicationId
 * @returns {Promise<unknown>}
 */
const ensurePublicationExists = async function (publicationId) {
      const row = await getKnex()('publications')
        .select('id')
        .where({ id: publicationId })
        .first();
      return Boolean(row);
    };

    /**
 * @param {unknown} deps
 * @param {unknown} deps.identityId
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.attentionType
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} deps
 * @param {unknown} deps.identityId
 * @param {unknown} deps.publicationId
 * @param {unknown} deps.attentionType
 * @returns {Promise<unknown>}
 */
const storeAttention = async function ({ identityId, publicationId, attentionType }) {
      const createdAt = new Date().toISOString();
      await getKnex()('attention_states')
        .insert({
          identity_id: identityId,
          publication_id: publicationId,
          attention_type: attentionType,
          created_at: createdAt,
        })
        .onConflict(['identity_id', 'publication_id', 'attention_type'])
        .ignore();
    };

    /**
 * @param {unknown} payload
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} payload
 * @returns {Promise<unknown>}
 */
this.accept = async function (payload) {
      let signal;
      try {
        signal = attentionContract.createSignal(payload);
      } catch {
        return { ok: false, status: 400, reason: 'payload' };
      }

      const identityId = await resolveIdentityId(signal.identity);
      if (!identityId) {
        return { ok: false, status: 422, reason: 'identity' };
      }

      const publicationExists = await ensurePublicationExists(signal.publication_id);
      if (!publicationExists) {
        return { ok: false, status: 422, reason: 'publication' };
      }

      await storeAttention({
        identityId,
        publicationId: signal.publication_id,
        attentionType: signal.attention_type,
      });
      return { ok: true };
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    knexProvider: 'Mindstream_Back_Storage_Knex$',
    attentionContract: 'Mindstream_Shared_Api_Attention$',
  }),
});
