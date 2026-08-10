// @ts-check

/** @namespace Mindstream_Back_Storage_LegacyMigration */
export default class Mindstream_Back_Storage_LegacyMigration {
  /**
   * @param {object} deps
   * @param {Mindstream_Back_Storage_Schema$} deps.schemaProvider
   * @param {Mindstream_Back_Storage_Database$} deps.database
   * @param {TeqFw_Db_Back_Dem_Compile} deps.compile
   * @param {Mindstream_Back_Logger$} deps.logger
   */
  constructor({ schemaProvider, database, compile, logger }) {
    const NS = 'Mindstream_Back_Storage_LegacyMigration';

    /** @param {unknown} value @returns {number} */
    const countValue = function (value) {
      const count = Number(value);
      if (!Number.isSafeInteger(count) || count < 0) throw new TypeError('Database count is invalid.');
      return count;
    };

    /** @param {unknown} result @returns {object[]} */
    const resultRows = function (result) {
      if (Array.isArray(result)) return result;
      if (result && typeof result === 'object' && Array.isArray(/** @type {{rows?: unknown}} */ (result).rows)) {
        return /** @type {object[]} */ (/** @type {{rows: unknown[]}} */ (result).rows);
      }
      throw new TypeError('PostgreSQL result does not contain rows.');
    };

    /** @param {unknown} executor @param {string[]} tables @returns {Promise<Record<string, number>>} */
    const readCounts = async function (executor, tables) {
      const counts = {};
      for (const table of tables) {
        const row = await executor(table).count({ count: '*' }).first();
        counts[table] = countValue(row?.count);
      }
      return counts;
    };

    /** @param {unknown} trx @param {string[]} expectedTables @returns {Promise<void>} */
    const assertLegacyModel = async function (trx, expectedTables) {
      const actualRows = await trx('pg_tables').select('tablename').where({ schemaname: 'public' }).orderBy('tablename');
      const actualTables = actualRows.map((row) => String(row.tablename));
      if (JSON.stringify(actualTables) !== JSON.stringify(expectedTables)) {
        throw new Error(`Legacy table set differs from DEM v2 entities: ${actualTables.join(', ')}.`);
      }

      const invalidAttention = resultRows(await trx.raw(`
        select count(*)::bigint as count
        from attention_states
        where attention_type not in ('overview_view', 'link_click', 'link_click_after_overview')
      `))[0];
      if (countValue(invalidAttention.count) !== 0) throw new Error('Legacy attention_type values violate DEM v2.');

      const invalidVectors = resultRows(await trx.raw(`
        select count(*)::bigint as count
        from publication_embeddings
        where vector_dims(overview_embedding) <> 1536
           or vector_dims(annotation_embedding) <> 1536
      `))[0];
      if (countValue(invalidVectors.count) !== 0) throw new Error('Legacy embedding dimensions violate DEM v2.');

      const invalidConstraints = resultRows(await trx.raw(`
        select count(*)::bigint as count
        from pg_constraint
        where connamespace = 'public'::regnamespace and not convalidated
      `))[0];
      if (countValue(invalidConstraints.count) !== 0) throw new Error('Legacy schema contains unvalidated constraints.');

      const wrongTimestamp = resultRows(await trx.raw(`
        with expected(table_name, column_name) as (values
          ('anonymous_identities','registered_at'), ('attention_states','created_at'),
          ('publication_embeddings','created_at'), ('publication_extractions','created_at'),
          ('publication_sources','created_at'), ('publication_sources','updated_at'),
          ('publication_summaries','created_at'), ('publications','rss_published_at'),
          ('publications','discovered_at'), ('schema_version','applied_at')
        )
        select count(*)::bigint as count
        from expected e
        left join information_schema.columns c
          on c.table_schema='public' and c.table_name=e.table_name and c.column_name=e.column_name
        where c.data_type is distinct from 'timestamp with time zone'
      `))[0];
      if (countValue(wrongTimestamp.count) !== 0) throw new Error('Legacy timestamp storage differs from DEM v2 timezone semantics.');
    };

    this.execute = async function () {
      try {
        const connection = database.getConnection();
        const adapter = connection.getDialectAdapter();
        const compilation = await compile.exec({
          adapter,
          fragments: [schemaProvider.getFragmentEnvelope()],
          mapEnvelope: schemaProvider.getMapEnvelope(),
        });
        compile.assertResult({ value: compilation });
        const preflight = await adapter.preflight({
          connection, fingerprint: compilation.fingerprint, operation: 'legacy-migration',
          requirements: compilation.requirements,
        });
        if (preflight.diagnostics?.length) throw new Error('DEM v2 capability preflight failed.');

        const tables = compilation.physical.tables.map((table) => table.name).sort();
        const knex = database.get();
        const before = await readCounts(knex, tables);
        if (before.schema_version !== 1) throw new Error('Legacy schema_version must contain exactly one row.');

        await knex.transaction(async (trx) => {
          await trx.raw('select pg_advisory_xact_lock(hashtextextended(?, 0))', ['mindstream:dem-v2-migration']);
          await assertLegacyModel(trx, tables);

          const constraint = resultRows(await trx.raw(`
            select pg_get_constraintdef(oid) as definition, convalidated
            from pg_constraint
            where conrelid='attention_states'::regclass
              and conname='attention_states_attention_type_check'
          `));
          if (!constraint.length) {
            await trx.raw(`
              alter table attention_states
              add constraint attention_states_attention_type_check
              check (attention_type in ('overview_view', 'link_click', 'link_click_after_overview'))
              not valid
            `);
          }
          await trx.raw('alter table attention_states validate constraint attention_states_attention_type_check');

          await trx('schema_version').del();
          await trx('schema_version').insert({
            schema_version: 2,
            schema_json: JSON.stringify({ declaration: schemaProvider.getDeclaration(), fingerprint: compilation.fingerprint }),
            applied_at: new Date(),
          });
        });

        const after = await readCounts(knex, tables);
        for (const table of tables) {
          if (before[table] !== after[table]) throw new Error(`Row count changed for '${table}'.`);
        }
        const audit = await knex('schema_version').orderBy('id', 'desc').first();
        const stored = JSON.parse(audit.schema_json);
        if (audit.schema_version !== 2 || stored.fingerprint !== compilation.fingerprint) {
          throw new Error('DEM v2 audit fingerprint verification failed.');
        }
        const constraint = await knex('pg_constraint')
          .select('convalidated').whereRaw("conrelid='attention_states'::regclass")
          .where({ conname: 'attention_states_attention_type_check' }).first();
        if (constraint?.convalidated !== true) throw new Error('Attention type constraint is not validated.');

        const evidence = Object.freeze({ accepted: false, after, before, fingerprint: compilation.fingerprint, status: 'complete' });
        logger.info(NS, 'Legacy schema migrated to DEM v2.', evidence);
        return evidence;
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        logger.exception(NS, normalized);
        throw normalized;
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    schemaProvider: 'Mindstream_Back_Storage_Schema$',
    database: 'Mindstream_Back_Storage_Database$',
    compile: 'TeqFw_Db_Back_Dem_Compile$',
    logger: 'Mindstream_Back_Logger$',
  }),
});
