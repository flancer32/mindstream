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
        throw new Error('Command db:schema:renew does not accept arguments.');
      }
      await schemaManager.renewSchema();
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    schemaManager: 'Mindstream_Back_Storage_SchemaManager$',
  }),
});
