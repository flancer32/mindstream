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

    const declaration = {
      schemaVersion: 1,
      tables: {
        schema_version: schemaVersionTable,
        publication_sources: publicationSourcesTable,
      },
    };

    this.getDeclaration = function () {
      return declaration;
    };
  }
}
