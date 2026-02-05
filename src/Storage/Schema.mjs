/**
 * @module Mindstream_Back_Storage_Schema
 * @description Declarative DB schema for the Storage layer.
 */
export default class Mindstream_Back_Storage_Schema {
  constructor({}) {
    const publicationSourcesTable = {
      columns: {
        id: { type: 'bigint', primary: true, autoIncrement: true },
        code: { type: 'string', notNull: true, length: 64 },
        url: { type: 'string', notNull: true, length: 255 },
        name: { type: 'string', notNull: true, length: 255 },
        description: { type: 'text' },
        is_active: { type: 'boolean', notNull: true },
        created_at: { type: 'timestamp', notNull: true },
        updated_at: { type: 'timestamp', notNull: true },
      },
      foreignKeys: [],
      indexes: [
        { columns: ['code'], unique: true },
        { columns: ['url'], unique: true },
      ],
    };

    const schemaVersionTable = {
      columns: {
        id: { type: 'bigint', primary: true, autoIncrement: true },
        schema_version: { type: 'integer', notNull: true },
        schema_json: { type: 'text', notNull: true },
        applied_at: { type: 'timestamp', notNull: true },
      },
      foreignKeys: [],
      indexes: [],
    };

    const publicationsTable = {
      columns: {
        id: { type: 'bigint', primary: true, autoIncrement: true },
        source_id: { type: 'bigint', notNull: true },
        source_item_hash: { type: 'string', notNull: true, length: 64 },
        source_url: { type: 'string', notNull: true, length: 1024 },
        rss_title: { type: 'string', length: 512 },
        rss_guid: { type: 'string', length: 255 },
        rss_published_at: { type: 'timestamp' },
        discovered_at: { type: 'timestamp', notNull: true },
      },
      foreignKeys: [
        {
          columns: ['source_id'],
          references: { table: 'publication_sources', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      ],
      indexes: [
        { columns: ['source_id', 'source_item_hash'], unique: true },
        { columns: ['source_id'] },
      ],
    };

    const declaration = {
      schemaVersion: 2,
      tables: {
        schema_version: schemaVersionTable,
        publication_sources: publicationSourcesTable,
        publications: publicationsTable,
      },
    };

    this.getDeclaration = function () {
      return declaration;
    };
  }
}
