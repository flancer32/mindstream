/**
 * @module Mindstream_Back_Cli_Db_Schema_Create
 * @description CLI command to create the database schema in an empty database.
 */
export default class Mindstream_Back_Cli_Db_Schema_Create {
  constructor({ Mindstream_Back_Storage_SchemaManager$: schemaManager }) {
    this.execute = async function ({ args } = {}) {
      if (Array.isArray(args) && args.length) {
        throw new Error('Command db:schema:create does not accept arguments.');
      }
      await schemaManager.createSchema();
    };
  }
}
