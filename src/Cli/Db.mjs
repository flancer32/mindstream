// @ts-check
/**
 * @namespace Mindstream_Back_Cli_Db
 * @description CLI dispatcher for db:* commands.
 */
export default class Mindstream_Back_Cli_Db {
/**
 * @param {object} deps
 * @param {Mindstream_Back_Cli_Db_Schema_Create$} deps.schemaCreate
 * @param {Mindstream_Back_Cli_Db_Schema_Renew$} deps.schemaRenew
 */
constructor({ schemaCreate, schemaRenew }) {
    /**
 * @param {string[]} commandParts
 * @returns {object}
 */
const resolveTarget = function (commandParts) {
      const parts = Array.isArray(commandParts) ? commandParts : [];
      const [segment, action, ...rest] = parts;
      if (rest.length) {
        throw new Error(`Unknown db command "db:${parts.join(':')}".`);
      }
      if (segment !== 'schema' || (action !== 'create' && action !== 'renew')) {
        throw new Error(`Unknown db command "db:${parts.join(':')}".`);
      }
      if (action === 'renew') return schemaRenew;
      return schemaCreate;
    };

    /**
 * @param {object} params
 * @returns {Promise<void>}
 */
this.dispatch = async function (params = {}) {
      const { commandParts, args } = /** @type {{commandParts: string[], args: string[]}} */ (params);
      const command = /** @type {Mindstream_Back_Cli_Db_Schema_Create$|Mindstream_Back_Cli_Db_Schema_Renew$} */ (resolveTarget(commandParts));
      if (!command?.execute) {
        throw new Error('Command "db:schema:*" is unavailable.');
      }
      await command.execute({ args });
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    schemaCreate: 'Mindstream_Back_Cli_Db_Schema_Create$',
    schemaRenew: 'Mindstream_Back_Cli_Db_Schema_Renew$',
  }),
});
