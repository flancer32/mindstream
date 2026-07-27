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
    /**
 * @param {unknown} deps
 * @param {unknown} deps.args
 * @returns {Promise<unknown>}
 */
/**
 * @param {unknown} params
 * @returns {Promise<unknown>}
 */
this.execute = async function (params = {}) {
      const { args } = params;
      if (Array.isArray(args) && args.length) {
        throw new Error('Command db:schema:create does not accept arguments.');
      }
      await schemaManager.createSchema();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    schemaManager: 'Mindstream_Back_Storage_SchemaManager$',
  }),
});
