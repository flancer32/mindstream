// @ts-check

/** @namespace Mindstream_Back_Cli_Db_Schema_MigrateV2 */
export default class Mindstream_Back_Cli_Db_Schema_MigrateV2 {
  /** @param {object} deps @param {Mindstream_Back_Storage_LegacyMigration$} deps.migration */
  constructor({ migration }) {
    this.id = 'db:schema:migrate-v2';
    this.summary = 'Migrate the restored legacy schema to DEM v2 in place.';
    this.lifetime = 'finite';
    this.arguments = [];
    this.options = [];
    this.execute = async function () {
      await migration.execute();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({ migration: 'Mindstream_Back_Storage_LegacyMigration$' }),
});
