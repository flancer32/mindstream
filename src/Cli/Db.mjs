/**
 * @module Mindstream_Back_Cli_Db
 * @description CLI dispatcher for db:* commands.
 */
export default class Mindstream_Back_Cli_Db {
  constructor({ Mindstream_Back_Cli_Db_Schema_Create$: schemaCreate }) {
    const resolveTarget = function (commandParts) {
      const parts = Array.isArray(commandParts) ? commandParts : [];
      const [segment, action, ...rest] = parts;
      if (rest.length) {
        throw new Error(`Unknown db command "db:${parts.join(':')}".`);
      }
      if (segment !== 'schema' || action !== 'create') {
        throw new Error(`Unknown db command "db:${parts.join(':')}".`);
      }
      return schemaCreate;
    };

    this.dispatch = async function ({ commandParts, args } = {}) {
      const command = resolveTarget(commandParts);
      if (!command?.execute) {
        throw new Error('Command "db:schema:create" is unavailable.');
      }
      await command.execute({ args });
    };
  }
}
