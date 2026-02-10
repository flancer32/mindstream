/**
 * @module Mindstream_Back_Attention_Ingress
 * @description Validates attention write payloads and persists them in Storage.
 */
export default class Mindstream_Back_Attention_Ingress {
  constructor({ Mindstream_Back_Storage_Knex$: knexProvider }) {
    const ATTENTION_TYPES = Object.freeze([
      'overview_view',
      'link_click',
      'link_click_after_overview',
    ]);
    const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/u;

    const getKnex = function () {
      return knexProvider.get();
    };

    const normalizeIdentity = function (value) {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      return UUID_RE.test(trimmed) ? trimmed : null;
    };

    const normalizePublicationId = function (value) {
      if (value === undefined || value === null) return null;
      const raw = typeof value === 'string' ? value.trim() : String(value);
      if (!raw) return null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    };

    const normalizeAttentionType = function (value) {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      return ATTENTION_TYPES.includes(trimmed) ? trimmed : null;
    };

    const resolveIdentityId = async function (identityUuid) {
      const row = await getKnex()('anonymous_identities')
        .select('id')
        .where({ identity_uuid: identityUuid })
        .first();
      return row?.id ?? null;
    };

    const ensurePublicationExists = async function (publicationId) {
      const row = await getKnex()('publications')
        .select('id')
        .where({ id: publicationId })
        .first();
      return Boolean(row);
    };

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

    this.accept = async function (payload) {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { ok: false, status: 400, reason: 'payload' };
      }

      const identityUuid = normalizeIdentity(payload.identity);
      if (!identityUuid) {
        return { ok: false, status: 400, reason: 'identity' };
      }

      const publicationId = normalizePublicationId(payload.publication_id);
      if (!publicationId) {
        return { ok: false, status: 400, reason: 'publication_id' };
      }

      const attentionType = normalizeAttentionType(payload.attention_type);
      if (!attentionType) {
        return { ok: false, status: 400, reason: 'attention_type' };
      }

      const identityId = await resolveIdentityId(identityUuid);
      if (!identityId) {
        return { ok: false, status: 422, reason: 'identity' };
      }

      const publicationExists = await ensurePublicationExists(publicationId);
      if (!publicationExists) {
        return { ok: false, status: 422, reason: 'publication' };
      }

      await storeAttention({ identityId, publicationId, attentionType });
      return { ok: true };
    };
  }
}
