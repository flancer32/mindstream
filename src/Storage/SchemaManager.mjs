// @ts-check

/** @namespace Mindstream_Back_Storage_SchemaManager */
export default class Mindstream_Back_Storage_SchemaManager {
  /**
   * @param {object} deps
   * @param {Mindstream_Back_Storage_Schema$} deps.schemaProvider
   * @param {Mindstream_Back_Storage_Database$} deps.database
   * @param {TeqFw_Db_Back_Dem_Compile} deps.compile
   * @param {TeqFw_Db_Back_RDb_Schema_A_Plan} deps.planner
   * @param {TeqFw_Db_Back_RDb_Schema_A_Builder} deps.builder
   * @param {TeqFw_Db_Back_RDb_Rebuild} deps.rebuild
   * @param {Mindstream_Back_Logger$} deps.logger
   */
  constructor({ schemaProvider, database, compile, planner, builder, rebuild, logger }) {
    const compileSchema = async function () {
      const connection = database.getConnection();
      const result = await compile.exec({
        adapter: connection.getDialectAdapter(),
        fragments: [schemaProvider.getFragmentEnvelope()],
        mapEnvelope: schemaProvider.getMapEnvelope(),
      });
      compile.assertResult({ value: result });
      return result;
    };

    /** @param {DemCompilationResult} compilation */
    const writeAudit = async function (compilation) {
      const knex = database.get();
      await knex('schema_version').del();
      await knex('schema_version').insert({
        schema_version: 2,
        schema_json: JSON.stringify({ declaration: schemaProvider.getDeclaration(), fingerprint: compilation.fingerprint }),
        applied_at: new Date(),
      });
    };

    this.createSchema = async function () {
      const connection = database.getConnection();
      const compilation = await compileSchema();
      const plan = planner.exec({ compilation, operation: 'create' });
      const evidence = await builder.exec({ adapter: connection.getDialectAdapter(), connection, plan });
      await writeAudit(compilation);
      logger.info('Mindstream_Back_Storage_SchemaManager', 'DEM v2 schema created.', { fingerprint: compilation.fingerprint });
      return evidence;
    };

    this.renewSchema = async function () {
      const connection = database.getConnection();
      const compilation = await compileSchema();
      const snapshotRows = new Map();
      for (const table of compilation.physical.tables) {
        snapshotRows.set(table.entity, await database.get()(table.name).select());
      }
      const snapshot = {
        /** @param {{entity: string}} input */
        readTable({ entity }) {
          if (!snapshotRows.has(entity)) throw new Error(`Snapshot does not contain '${entity}'.`);
          return structuredClone(snapshotRows.get(entity));
        },
      };
      const evidence = await rebuild.exec({
        mode: 'inPlace', compilation, sourceCompilation: compilation,
        source: connection, target: connection, sourceId: 'mindstream-default', targetId: 'mindstream-default', snapshot,
      });
      await writeAudit(compilation);
      logger.info('Mindstream_Back_Storage_SchemaManager', 'DEM v2 schema rebuilt with preservation evidence.', {
        accepted: evidence.accepted, fingerprint: compilation.fingerprint, status: evidence.status,
      });
      return evidence;
    };

    this.applySchema = async function () {
      const knex = database.get();
      if (!await knex.schema.hasTable('schema_version')) return this.createSchema();
      const compilation = await compileSchema();
      const row = await knex('schema_version').orderBy('id', 'desc').first();
      let fingerprint;
      try { fingerprint = JSON.parse(row?.schema_json ?? '{}').fingerprint; } catch { fingerprint = undefined; }
      if (fingerprint !== compilation.fingerprint) return this.renewSchema();
      return { accepted: false, fingerprint, status: 'unchanged' };
    };

    this.recreateWithPreserve = this.renewSchema;
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    schemaProvider: 'Mindstream_Back_Storage_Schema$', database: 'Mindstream_Back_Storage_Database$',
    compile: 'TeqFw_Db_Back_Dem_Compile$', planner: 'TeqFw_Db_Back_RDb_Schema_A_Plan$',
    builder: 'TeqFw_Db_Back_RDb_Schema_A_Builder$', rebuild: 'TeqFw_Db_Back_RDb_Rebuild$',
    logger: 'Mindstream_Back_Logger$',
  }),
});
