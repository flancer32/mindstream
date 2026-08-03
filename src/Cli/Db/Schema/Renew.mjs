// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Db_Schema_Renew
 * @description CLI command to recreate the database schema with best-effort data preservation.
 */
export default class Mindstream_Back_Cli_Db_Schema_Renew {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Storage_SchemaManager$} deps.schemaManager
 */
  constructor({ schemaManager }) {
    this.id = 'db:schema:renew';
    this.summary = 'Recreate the database schema while preserving data where possible.';
    this.lifetime = 'finite';
    this.arguments = [];
    this.options = [];
    /**
 * @param {object} params
 * @returns {Promise<void>}
 */
    this.execute = async function () {
      await schemaManager.renewSchema();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    schemaManager: 'Mindstream_Back_Storage_SchemaManager$',
  }),
});
