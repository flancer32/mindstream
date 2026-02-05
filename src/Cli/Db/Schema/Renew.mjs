/**
 * @module Mindstream_Back_Cli_Db_Schema_Renew
 * @description CLI command to recreate the database schema with best-effort data preservation.
 */
export default class Mindstream_Back_Cli_Db_Schema_Renew {
  constructor({ Mindstream_Back_Storage_SchemaManager$: schemaManager }) {
    this.execute = async function ({ args } = {}) {
      if (Array.isArray(args) && args.length) {
        throw new Error('Command db:schema:renew does not accept arguments.');
      }
      await schemaManager.renewSchema();
    };
  }
}
