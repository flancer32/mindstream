// @ts-check

/** @namespace Mindstream_Back_Cli_Db_Schema_MigrateV2 */
export default class Mindstream_Back_Cli_Db_Schema_MigrateV2 {
  /** @param {object} deps @param {Mindstream_Back_Storage_LegacyMigration$} deps.migration */
  constructor({ migration }) {
    this.id = 'db:schema:migrate-legacy-to-dem-rdb';
    this.summary = 'Copy legacy PostgreSQL data into an initialized DEM-RDB target schema.';
    this.lifetime = 'finite';
    this.arguments = [];
    this.options = [{
      name: 'source-schema', kind: 'string', required: false,
      description: 'Legacy PostgreSQL schema. Defaults to public.',
    }];
    this.execute = async function ({ options }) {
      await migration.execute({ sourceSchema: options['source-schema'] ?? 'public' });
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({ migration: 'Mindstream_Back_Storage_LegacyMigration$' }),
});
