// @ts-check

/** @namespace Mindstream_Back_Storage_LegacyMigration */
export default class Mindstream_Back_Storage_LegacyMigration {
  /**
   * @param {object} deps
   * @param {Mindstream_Back_Storage_Database$} deps.database
   * @param {Mindstream_Back_Logger$} deps.logger
   */
  constructor({ database, logger }) {
    const legacyTables = [
      'anonymous_identities', 'attention_states', 'publication_embeddings', 'publication_extractions',
      'publication_sources', 'publication_summaries', 'publications', 'schema_version',
    ];
    const domainTables = [
      'mindstream_source', 'mindstream_publication', 'mindstream_extraction', 'mindstream_summary',
      'mindstream_embedding', 'mindstream_identity', 'mindstream_attention',
    ];

    /** @param {string} schema */
    const quoteSchema = function (schema) {
      if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new TypeError('Schema names must use lowercase PostgreSQL identifiers.');
      return `"${schema}"`;
    };

    /** @param {any} executor @param {string} schema @returns {Promise<Record<string, bigint>>} */
    const counts = async function (executor, schema) {
      const result = {};
      for (const table of legacyTables) {
        const row = (await executor.raw(`SELECT count(*)::text AS value FROM ${quoteSchema(schema)}."${table}"`)).rows[0];
        result[table] = BigInt(row.value);
      }
      return result;
    };

    this.execute = async function ({ sourceSchema = 'public' } = {}) {
      const namespace = 'Mindstream_Back_Storage_LegacyMigration';
      try {
        quoteSchema(sourceSchema);
        const knex = database.get();
        const targetSchema = (await knex.raw('SELECT current_schema() AS name')).rows[0]?.name;
        if (!targetSchema || targetSchema === sourceSchema) {
          throw new Error('Legacy and DEM-RDB schemas must be separate.');
        }

        const result = await knex.transaction(async (/** @type {any} */ trx) => {
          await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', ['mindstream:legacy-to-dem-rdb']);
          const actual = (await trx('information_schema.tables').select('table_name')
            .where({ table_schema: sourceSchema, table_type: 'BASE TABLE' }).orderBy('table_name'))
            .map((row) => String(row.table_name)).sort();
          if (JSON.stringify(actual) !== JSON.stringify(legacyTables.slice().sort())) {
            throw new Error(`Legacy table set differs from the expected MindStream schema: ${actual.join(', ')}.`);
          }

          const before = await counts(trx, sourceSchema);
          if (before.schema_version !== 1n) throw new Error('Legacy schema_version must contain exactly one row.');
          for (const table of domainTables) {
            const row = (await trx.raw(`SELECT count(*)::text AS value FROM ${quoteSchema(targetSchema)}."${table}"`)).rows[0];
            if (BigInt(row.value) !== 0n) throw new Error(`Target table '${table}' is not empty.`);
          }

          const invalidAttention = (await trx.raw(`
            SELECT count(*)::text AS value FROM ${quoteSchema(sourceSchema)}.attention_states
            WHERE attention_type NOT IN ('overview_view', 'link_click', 'link_click_after_overview')`)).rows[0];
          if (BigInt(invalidAttention.value) !== 0n) throw new Error('Legacy attention_type values are outside the accepted set.');

          const invalidVectors = (await trx.raw(`
            SELECT count(*)::text AS value FROM ${quoteSchema(sourceSchema)}.publication_embeddings
            WHERE vector_dims(overview_embedding) <> 1536 OR vector_dims(annotation_embedding) <> 1536`)).rows[0];
          if (BigInt(invalidVectors.value) !== 0n) throw new Error('Legacy embedding dimensions differ from 1536.');

          const invalidConstraints = (await trx.raw(`
            SELECT count(*)::text AS value FROM pg_constraint
            WHERE connamespace = ?::regnamespace AND NOT convalidated`, [sourceSchema])).rows[0];
          if (BigInt(invalidConstraints.value) !== 0n) throw new Error('Legacy schema contains unvalidated constraints.');

          const source = (table) => `${quoteSchema(sourceSchema)}."${table}"`;
          const target = (table) => `${quoteSchema(targetSchema)}."${table}"`;
          const utc = (column) => `to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

          await trx.raw(`INSERT INTO ${target('mindstream_source')} (id, code, url, name, description, is_active, created_at, updated_at)
            SELECT id, code, url, name, description, is_active::integer, ${utc('created_at')}, ${utc('updated_at')}
            FROM ${source('publication_sources')}`);
          await trx.raw(`INSERT INTO ${target('mindstream_identity')} (id, identity_uuid, registered_at)
            SELECT id, identity_uuid, ${utc('registered_at')} FROM ${source('anonymous_identities')}`);
          await trx.raw(`INSERT INTO ${target('mindstream_publication')} (id, source_id, source_item_hash, source_url, rss_title, rss_guid, rss_published_at, discovered_at, status)
            SELECT id, source_id, source_item_hash, source_url, rss_title, rss_guid, ${utc('rss_published_at')}, ${utc('discovered_at')}, status
            FROM ${source('publications')}`);
          await trx.raw(`INSERT INTO ${target('mindstream_extraction')} (publication_id, html, md_text, created_at)
            SELECT publication_id, html, md_text, ${utc('created_at')} FROM ${source('publication_extractions')}`);
          await trx.raw(`INSERT INTO ${target('mindstream_summary')} (publication_id, overview, annotation, created_at)
            SELECT publication_id, overview, annotation, ${utc('created_at')} FROM ${source('publication_summaries')}`);
          await trx.raw(`INSERT INTO ${target('mindstream_embedding')} (publication_id, overview_embedding, annotation_embedding, created_at)
            SELECT publication_id, overview_embedding, annotation_embedding, ${utc('created_at')}
            FROM ${source('publication_embeddings')}`);
          await trx.raw(`INSERT INTO ${target('mindstream_attention')} (identity_id, publication_id, attention_type, created_at)
            SELECT identity_id, publication_id, attention_type, ${utc('created_at')} FROM ${source('attention_states')}`);

          const transactionBackend = await database.openBackend({ connection: { getClient: () => trx } });
          try {
            const compilation = database.getCompilation();
            await transactionBackend.initialize({ scope: 'mindstream', compilation });
            const sourceVectors = (await trx.raw(`SELECT publication_id::text, overview_embedding::text, annotation_embedding::text
              FROM ${source('publication_embeddings')} ORDER BY publication_id`)).rows;
            const embeddingRepository = await transactionBackend.get({ path: '/mindstream/embedding' });
            for (const sourceVector of sourceVectors) {
              const result = await embeddingRepository.read({
                key: { kind: 'primary', values: { publication_id: sourceVector.publication_id } },
              });
              const expectedOverview = JSON.parse(sourceVector.overview_embedding).map((value) => Math.fround(Number(value)));
              const expectedAnnotation = JSON.parse(sourceVector.annotation_embedding).map((value) => Math.fround(Number(value)));
              if (!result?.record || JSON.stringify(result.record.overview_embedding) !== JSON.stringify(expectedOverview)
                || JSON.stringify(result.record.annotation_embedding) !== JSON.stringify(expectedAnnotation)) {
                throw new Error(`Embedding migration verification failed for publication ${sourceVector.publication_id}.`);
              }
            }
          } finally {
            await transactionBackend.close();
          }

          const after = {};
          for (const [sourceTable, targetTable] of [
            ['publication_sources', 'mindstream_source'], ['publications', 'mindstream_publication'],
            ['publication_extractions', 'mindstream_extraction'], ['publication_summaries', 'mindstream_summary'],
            ['publication_embeddings', 'mindstream_embedding'], ['anonymous_identities', 'mindstream_identity'],
            ['attention_states', 'mindstream_attention'],
          ]) {
            const row = (await trx.raw(`SELECT count(*)::text AS value FROM ${target(targetTable)}`)).rows[0];
            after[sourceTable] = BigInt(row.value);
            if (after[sourceTable] !== before[sourceTable]) throw new Error(`Migration row count differs for '${sourceTable}'.`);
          }
          return { after, before, sourceSchema, targetSchema };
        });

        logger.info(namespace, 'Legacy MindStream data copied into the DEM-RDB target schema.', {
          sourceSchema: result.sourceSchema,
          targetSchema: result.targetSchema,
          rowCounts: Object.fromEntries(Object.entries(result.after).map(([table, count]) => [table, count.toString()])),
        });
        return result;
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        logger.exception(namespace, normalized);
        throw normalized;
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    database: 'Mindstream_Back_Storage_Database$',
    logger: 'Mindstream_Back_Logger$',
  }),
});
