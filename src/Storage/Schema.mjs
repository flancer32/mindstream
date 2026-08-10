// @ts-check

/** @namespace Mindstream_Back_Storage_Schema */
export default class Mindstream_Back_Storage_Schema {
  constructor({}) {
    /** @param {number} bits */
    const integer = (bits = 64) => ({ type: { id: 'core.integer', params: { bits, unsigned: false } } });
    const identity = () => ({ ...integer(), generation: { kind: 'core.identity', params: { mode: 'byDefault' } } });
    /** @param {number} length @param {boolean} nullable */
    const string = (length, nullable = false) => ({ nullable, type: { id: 'core.string', params: { length } } });
    const text = (nullable = false) => ({ nullable, type: { id: 'core.text', params: {} } });
    const datetime = (nullable = false) => ({ nullable, type: { id: 'core.datetime', params: { timezone: true } } });
    /** @param {'primary'|'unique'} kind @param {...string} attrs */
    const key = (kind, ...attrs) => ({ include: [], keys: attrs.map((attr) => ({ attr })), kind, options: {}, phase: 'table' });
    /** @param {...string} attrs */
    const index = (...attrs) => ({ include: [], keys: attrs.map((attr) => ({ attr })), kind: 'index', method: 'core.btree', options: {}, phase: 'afterRelations' });
    /** @param {string[]} attrs @param {string} path @param {'restrict'|'cascade'} onDelete */
    const relation = (attrs, path, onDelete = 'restrict') => ({ action: { delete: onDelete, update: 'cascade' }, attrs, deferrable: 'notDeferrable', ref: { attrs: ['id'], path } });
    const declaration = {
      version: 2, requires: ['postgresql.core', 'postgresql.extension.vector'], package: {}, refs: {}, entity: {
        schema_version: {
          comment: 'Derived schema audit record; DEM v2 is authoritative.',
          attr: { id: identity(), schema_version: integer(32), schema_json: text(), applied_at: datetime() },
          index: { pk: key('primary', 'id') }, relation: {},
        },
        publication_sources: {
          attr: { id: identity(), code: string(64), url: string(255), name: string(255), description: text(true), is_active: { type: { id: 'core.boolean', params: {} } }, created_at: datetime(), updated_at: datetime() },
          index: { pk: key('primary', 'id'), code_unique: key('unique', 'code'), url_unique: key('unique', 'url') }, relation: {},
        },
        publications: {
          attr: { id: identity(), source_id: integer(), source_item_hash: string(64), source_url: string(1024), rss_title: string(512, true), rss_guid: string(255, true), rss_published_at: datetime(true), discovered_at: datetime(), status: { ...string(32), default: { kind: 'literal', value: 'extract_pending' } } },
          index: { pk: key('primary', 'id'), source_hash_unique: key('unique', 'source_id', 'source_item_hash'), source: index('source_id') },
          relation: { source: relation(['source_id'], '/publication_sources') },
        },
        publication_extractions: {
          attr: { publication_id: integer(), html: text(true), md_text: text(true), created_at: datetime() }, index: { pk: key('primary', 'publication_id') }, relation: { publication: relation(['publication_id'], '/publications', 'cascade') },
        },
        publication_summaries: {
          attr: { publication_id: integer(), overview: text(), annotation: text(), created_at: datetime() }, index: { pk: key('primary', 'publication_id') }, relation: { publication: relation(['publication_id'], '/publications', 'cascade') },
        },
        publication_embeddings: {
          attr: {
            publication_id: integer(),
            overview_embedding: { type: { id: 'core.vector', params: { dimensions: 1536, element: 'float', sparse: false } }, storage: { postgresql: { type: 'vector', params: {} } } },
            annotation_embedding: { type: { id: 'core.vector', params: { dimensions: 1536, element: 'float', sparse: false } }, storage: { postgresql: { type: 'vector', params: {} } } },
            created_at: datetime(),
          },
          index: { pk: key('primary', 'publication_id') }, relation: { publication: relation(['publication_id'], '/publications', 'cascade') },
        },
        anonymous_identities: {
          attr: { id: identity(), identity_uuid: string(36), registered_at: datetime() }, index: { pk: key('primary', 'id'), identity_uuid_unique: key('unique', 'identity_uuid'), registered_at: index('registered_at') }, relation: {},
        },
        attention_states: {
          attr: { identity_id: integer(), publication_id: integer(), attention_type: { type: { id: 'core.enum', params: { values: ['overview_view', 'link_click', 'link_click_after_overview'] } } }, created_at: datetime() },
          index: { pk: key('primary', 'identity_id', 'publication_id', 'attention_type'), created_at: index('created_at') },
          relation: { identity: relation(['identity_id'], '/anonymous_identities', 'cascade'), publication: relation(['publication_id'], '/publications', 'cascade') },
        },
      },
    };
    const map = { version: 2, namespace: '', ref: {}, deprecated: {} };
    this.getDeclaration = () => declaration;
    this.getFragmentEnvelope = () => ({ declaration, filename: 'mindstream://storage/dem-v2', fragmentId: '@flancer32/mindstream', packageName: '@flancer32/mindstream' });
    this.getMapEnvelope = () => ({ declaration: map, filename: 'mindstream://storage/dem-map-v2', mapId: '@flancer32/mindstream:map', packageName: '@flancer32/mindstream' });
  }
}
