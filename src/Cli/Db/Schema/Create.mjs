// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Db_Schema_Create
 * @description CLI command to create the database schema in an empty database.
 */
export default class Mindstream_Back_Cli_Db_Schema_Create {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Storage_SchemaManager$} deps.schemaManager
 */
  constructor({ schemaManager }) {
    this.id = 'db:schema:create';
    this.summary = 'Create the database schema.';
    this.lifetime = 'finite';
    this.arguments = [];
    this.options = [];
    /**
 * @param {object} params
 * @returns {Promise<void>}
 */
    this.execute = async function () {
      await schemaManager.createSchema();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    schemaManager: 'Mindstream_Back_Storage_SchemaManager$',
  }),
});
