import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { createTestContainer } from '../unit/di-node.mjs';

const projectRoot = path.resolve(import.meta.dirname, '../..');
const testDatabase = process.env.DEM_TEST_PG_DATABASE ?? 'dem_rdb_test';
const testHost = process.env.DEM_TEST_PG_HOST ?? '/var/run/postgresql';
const testUser = process.env.DEM_TEST_PG_USER ?? process.env.USER;

const createContainer = async function ({ schema, includePublic = true }) {
  const container = await createTestContainer();
  container.addNamespaceRoot('TeqFw_Dem_', path.join(projectRoot, 'node_modules/@teqfw/dem/src'), '.mjs');
  container.addNamespaceRoot('TeqFw_Dem_RDb_', path.join(projectRoot, 'node_modules/@teqfw/dem-rdb/src'), '.mjs');
  container.addNamespaceRoot('TeqFw_Cli_', path.join(projectRoot, 'node_modules/@teqfw/cli/src'), '.mjs');

  const source = await container.get('TeqFw_Cfg_Source_Object$');
  const loader = await container.get('TeqFw_Cfg_Loader$');
  const settings = {
    TEQFW_DEM_RDB__CLIENT: 'pg',
    TEQFW_DEM_RDB__HOST: testHost,
    TEQFW_DEM_RDB__DATABASE: testDatabase,
    TEQFW_DEM_RDB__USER: testUser,
    TEQFW_DEM_RDB__SEARCH_PATH: includePublic ? [schema, 'public'] : [schema],
  };
  if (process.env.DEM_TEST_PG_PORT) settings.TEQFW_DEM_RDB__PORT = Number(process.env.DEM_TEST_PG_PORT);
  if (process.env.DEM_TEST_PG_PASSWORD) settings.TEQFW_DEM_RDB__PASSWORD = process.env.DEM_TEST_PG_PASSWORD;
  await loader.load([source.create(settings, 'dem-postgresql-test')]);
  return { container, storage: await container.get('Mindstream_Back_Storage_DemDatabase$') };
};

const createAdminClient = async function () {
  const container = await createTestContainer();
  const pg = await container.get('node:pg');
  return new pg.Client({
    database: testDatabase,
    host: testHost,
    user: testUser,
    ...(process.env.DEM_TEST_PG_PORT ? { port: Number(process.env.DEM_TEST_PG_PORT) } : {}),
    ...(process.env.DEM_TEST_PG_PASSWORD ? { password: process.env.DEM_TEST_PG_PASSWORD } : {}),
  });
};

const withSchema = async function (callback) {
  const schema = `mindstream_dem_test_${process.pid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const admin = await createAdminClient();
  await admin.connect();
  await admin.query(`CREATE SCHEMA "${schema}"`);
  try {
    await callback({ schema, admin });
  } finally {
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
};

const openStorage = async function (schema, includePublic = true) {
  const { container, storage } = await createContainer({ schema, includePublic });
  const result = await storage.initialize({ hostRoot: projectRoot, scope: 'mindstream' });
  return { container, storage, ...result };
};

const timestamp = '2026-11-23T12:34:56.123456Z';

test('DEM-RDB initializes and reopens native vector schema with required constraints', async () => {
  await withSchema(async ({ schema, admin }) => {
    const first = await openStorage(schema);
    assert.equal(first.history.created, true);

    const client = first.storage.getClient();
    const columns = (await admin.query(
      `SELECT a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS physical_type
       FROM pg_attribute a
       JOIN pg_class c ON c.oid = a.attrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relname = 'mindstream_embedding' AND a.attnum > 0
       ORDER BY a.attname`,
      [schema],
    )).rows;
    assert.deepEqual(columns.filter(({ column_name }) => column_name.endsWith('_embedding')),
      [
        { column_name: 'annotation_embedding', physical_type: 'vector(1536)' },
        { column_name: 'overview_embedding', physical_type: 'vector(1536)' },
      ]);
    assert.equal(await client('dem_snapshot').count('* as count').then((rows) => Number(rows[0].count)), 1);
    assert.equal(await client('dem_application').count('* as count').then((rows) => Number(rows[0].count)), 1);

    const sourceRepository = await first.backend.get({ path: '/mindstream/source' });
    const source = (await sourceRepository.create({ record: {
      code: 'test-source', url: 'https://example.test/feed', name: 'Test', description: null, is_active: true,
      created_at: timestamp, updated_at: timestamp,
    } })).record;
    const explicitSource = (await sourceRepository.create({ record: {
      id: '9000000000000', code: 'explicit-source', url: 'https://example.test/explicit', name: 'Explicit',
      description: null, is_active: true, created_at: timestamp, updated_at: timestamp,
    } })).record;
    assert.equal(explicitSource.id, '9000000000000');
    const followingSource = (await sourceRepository.create({ record: {
      code: 'following-source', url: 'https://example.test/following', name: 'Following', description: null,
      is_active: true, created_at: timestamp, updated_at: timestamp,
    } })).record;
    assert.ok(BigInt(followingSource.id) > BigInt(explicitSource.id));
    const publicationRepository = await first.backend.get({ path: '/mindstream/publication' });
    const publication = (await publicationRepository.create({ record: {
      source_id: source.id, source_item_hash: 'a'.repeat(64), source_url: 'https://example.test/item',
      rss_title: 'Test item', rss_guid: 'test-item', rss_published_at: timestamp, discovered_at: timestamp,
    } })).record;
    assert.equal(publication.status, 'extract_pending');

    const embeddingsRepository = await first.backend.get({ path: '/mindstream/embedding' });
    const vector = Array.from({ length: 1536 }, () => 0);
    vector[0] = 0.1;
    vector[1] = 1e-45;
    vector[2] = 1.5;
    await embeddingsRepository.create({ record: {
      publication_id: publication.id, overview_embedding: vector, annotation_embedding: vector, created_at: timestamp,
    } });
    const embeddings = (await embeddingsRepository.read({ key: { kind: 'primary', values: { publication_id: publication.id } } })).record;
    assert.deepEqual(embeddings.overview_embedding.slice(0, 3), [Math.fround(0.1), Math.fround(1e-45), 1.5]);
    assert.equal(embeddings.created_at, timestamp);

    const identityRepository = await first.backend.get({ path: '/mindstream/identity' });
    const identity = (await identityRepository.create({ record: {
      identity_uuid: '00000000-0000-4000-8000-000000000001', registered_at: timestamp,
    } })).record;
    const attentionRepository = await first.backend.get({ path: '/mindstream/attention' });
    await attentionRepository.create({ record: {
      identity_id: identity.id, publication_id: publication.id, attention_type: 'overview_view', created_at: timestamp,
    } });

    const foreignKeys = (await admin.query(
      `SELECT conname, confdeltype, confupdtype
       FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
       WHERE n.nspname = $1 AND c.contype = 'f'
       ORDER BY conname`,
      [schema],
    )).rows;
    const domainActions = foreignKeys.filter(({ conname }) => conname.startsWith('mindstream_'));
    assert.equal(domainActions.length, 6);
    for (const foreignKey of domainActions) assert.equal(foreignKey.confupdtype, 'c', foreignKey.conname);
    assert.equal(domainActions.filter(({ confdeltype }) => confdeltype === 'c').length, 5);
    assert.equal(domainActions.filter(({ confdeltype }) => confdeltype === 'r' || confdeltype === 'a').length, 1);

    await assert.rejects(admin.query(
      `INSERT INTO "${schema}".mindstream_attention (identity_id, publication_id, attention_type, created_at) VALUES ($1, $2, 'invalid', $3)`,
      [identity.id, publication.id, timestamp],
    ));
    await assert.rejects(admin.query(
      `UPDATE "${schema}".mindstream_attention SET attention_type = 'invalid' WHERE identity_id = $1`,
      [identity.id],
    ));
    await assert.rejects(admin.query(`DELETE FROM "${schema}".mindstream_source WHERE id = $1`, [source.id]));

    const updatedSourceId = (BigInt(source.id) + 1000000n).toString();
    await admin.query(`UPDATE "${schema}".mindstream_source SET id = $1 WHERE id = $2`, [updatedSourceId, source.id]);
    const cascadedSourceId = await admin.query(
      `SELECT source_id FROM "${schema}".mindstream_publication WHERE id = $1`, [publication.id],
    );
    assert.equal(cascadedSourceId.rows[0].source_id, updatedSourceId);

    await admin.query(`DELETE FROM "${schema}".mindstream_publication WHERE id = $1`, [publication.id]);
    for (const table of ['mindstream_extraction', 'mindstream_summary', 'mindstream_embedding', 'mindstream_attention']) {
      const count = await admin.query(`SELECT count(*) FROM "${schema}"."${table}"`);
      assert.equal(Number(count.rows[0].count), 0, `${table} should cascade on publication delete`);
    }

    const secondPublication = (await publicationRepository.create({ record: {
      source_id: updatedSourceId, source_item_hash: 'b'.repeat(64), source_url: 'https://example.test/item-2',
      rss_title: 'Second item', rss_guid: 'second-item', discovered_at: timestamp,
    } })).record;
    const secondIdentity = (await identityRepository.create({ record: {
      identity_uuid: '00000000-0000-4000-8000-000000000002', registered_at: timestamp,
    } })).record;
    await attentionRepository.create({ record: {
      identity_id: secondIdentity.id, publication_id: secondPublication.id, attention_type: 'link_click', created_at: timestamp,
    } });
    await admin.query(`DELETE FROM "${schema}".mindstream_identity WHERE id = $1`, [secondIdentity.id]);
    const identityCascade = await admin.query(
      `SELECT count(*) FROM "${schema}".mindstream_attention WHERE identity_id = $1`, [secondIdentity.id],
    );
    assert.equal(Number(identityCascade.rows[0].count), 0);

    await first.storage.close();
    const reopened = await openStorage(schema);
    assert.equal(reopened.history.created, false);
    await reopened.storage.close();

    await admin.query(`ALTER TABLE "${schema}".mindstream_embedding ALTER COLUMN overview_embedding TYPE text USING overview_embedding::text`);
    const historyBefore = await admin.query(`SELECT count(*) FROM "${schema}".dem_application`);
    const incompatible = await createContainer({ schema });
    await assert.rejects(incompatible.storage.initialize({ hostRoot: projectRoot, scope: 'mindstream' }));
    const historyAfter = await admin.query(`SELECT count(*) FROM "${schema}".dem_application`);
    assert.equal(historyAfter.rows[0].count, historyBefore.rows[0].count);
  });
});

test('DEM-RDB fails before schema writes when pgvector is outside the application search path', async () => {
  await withSchema(async ({ schema, admin }) => {
    const { storage } = await createContainer({ schema, includePublic: false });
    await assert.rejects(storage.initialize({ hostRoot: projectRoot, scope: 'mindstream' }));
    const tables = await admin.query(
      'SELECT tablename FROM pg_tables WHERE schemaname = $1', [schema],
    );
    assert.deepEqual(tables.rows, []);
  });
});

test('legacy migration copies all supported rows atomically and preserves the source schema', async () => {
  await withSchema(async ({ schema: targetSchema, admin }) => {
    const sourceSchema = `${targetSchema}_legacy`;
    await admin.query(`CREATE SCHEMA "${sourceSchema}"`);
    const { container, storage, backend } = await openStorage(targetSchema);
    try {
      await admin.query(`
        CREATE TABLE "${sourceSchema}".schema_version (
          id bigint PRIMARY KEY, schema_version integer NOT NULL, schema_json text NOT NULL, applied_at timestamptz NOT NULL
        );
        CREATE TABLE "${sourceSchema}".publication_sources (
          id bigint PRIMARY KEY, code varchar(64) UNIQUE NOT NULL, url varchar(255) UNIQUE NOT NULL,
          name varchar(255) NOT NULL, description text, is_active boolean NOT NULL,
          created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
        );
        CREATE TABLE "${sourceSchema}".anonymous_identities (
          id bigint PRIMARY KEY, identity_uuid varchar(36) UNIQUE NOT NULL, registered_at timestamptz NOT NULL
        );
        CREATE TABLE "${sourceSchema}".publications (
          id bigint PRIMARY KEY, source_id bigint NOT NULL REFERENCES "${sourceSchema}".publication_sources(id),
          source_item_hash varchar(64) NOT NULL, source_url varchar(1024) NOT NULL,
          rss_title varchar(512), rss_guid varchar(255), rss_published_at timestamptz,
          discovered_at timestamptz NOT NULL, status varchar(32) NOT NULL,
          UNIQUE(source_id, source_item_hash)
        );
        CREATE TABLE "${sourceSchema}".publication_extractions (
          publication_id bigint PRIMARY KEY REFERENCES "${sourceSchema}".publications(id),
          html text, md_text text, created_at timestamptz NOT NULL
        );
        CREATE TABLE "${sourceSchema}".publication_summaries (
          publication_id bigint PRIMARY KEY REFERENCES "${sourceSchema}".publications(id),
          overview text NOT NULL, annotation text NOT NULL, created_at timestamptz NOT NULL
        );
        CREATE TABLE "${sourceSchema}".publication_embeddings (
          publication_id bigint PRIMARY KEY REFERENCES "${sourceSchema}".publications(id),
          overview_embedding vector(1536) NOT NULL, annotation_embedding vector(1536) NOT NULL,
          created_at timestamptz NOT NULL
        );
        CREATE TABLE "${sourceSchema}".attention_states (
          identity_id bigint NOT NULL REFERENCES "${sourceSchema}".anonymous_identities(id),
          publication_id bigint NOT NULL REFERENCES "${sourceSchema}".publications(id),
          attention_type varchar(32) NOT NULL CHECK (attention_type IN ('overview_view', 'link_click', 'link_click_after_overview')),
          created_at timestamptz NOT NULL, PRIMARY KEY(identity_id, publication_id, attention_type)
        );
        INSERT INTO "${sourceSchema}".schema_version VALUES (1, 2, '{}', '${timestamp}');
        INSERT INTO "${sourceSchema}".publication_sources VALUES (7, 'legacy', 'https://example.test', 'Legacy', NULL, TRUE, '${timestamp}', '${timestamp}');
        INSERT INTO "${sourceSchema}".anonymous_identities VALUES (9, '00000000-0000-4000-8000-000000000009', '${timestamp}');
        INSERT INTO "${sourceSchema}".publications VALUES (11, 7, repeat('a', 64), 'https://example.test/11', 'Legacy item', 'legacy-11', '${timestamp}', '${timestamp}', 'ready');
        INSERT INTO "${sourceSchema}".publication_extractions VALUES (11, '<p>legacy</p>', 'legacy markdown', '${timestamp}');
        INSERT INTO "${sourceSchema}".publication_summaries VALUES (11, 'overview', 'annotation', '${timestamp}');
        INSERT INTO "${sourceSchema}".publication_embeddings VALUES (11, array_fill(0.1::real, ARRAY[1536])::vector, array_fill(0.2::real, ARRAY[1536])::vector, '${timestamp}');
        INSERT INTO "${sourceSchema}".attention_states VALUES (9, 11, 'overview_view', '${timestamp}');
      `);

      container.register('Mindstream_Back_Storage_Database$', {
        get: () => storage.getClient(),
        getCompilation: () => storage.getCompilation(),
        openBackend: (options) => storage.openBackend(options),
      });
      const migration = await container.get('Mindstream_Back_Storage_LegacyMigration$');
      await admin.query(`ALTER TABLE "${targetSchema}".mindstream_summary ADD CONSTRAINT fail_migration_test CHECK (overview <> 'overview')`);
      await assert.rejects(migration.execute({ sourceSchema }));
      for (const table of ['source', 'publication', 'extraction', 'summary', 'embedding', 'identity', 'attention']) {
        const rows = await admin.query(`SELECT count(*) FROM "${targetSchema}"."mindstream_${table}"`);
        assert.equal(Number(rows.rows[0].count), 0, `${table} rows should roll back after a copy failure`);
      }
      await admin.query(`ALTER TABLE "${targetSchema}".mindstream_summary DROP CONSTRAINT fail_migration_test`);

      const result = await migration.execute({ sourceSchema });
      assert.equal(result.sourceSchema, sourceSchema);
      assert.equal(result.targetSchema, targetSchema);
      assert.deepEqual(Object.fromEntries(Object.entries(result.after).map(([table, count]) => [table, count.toString()])), {
        publication_sources: '1', publications: '1', publication_extractions: '1', publication_summaries: '1',
        publication_embeddings: '1', anonymous_identities: '1', attention_states: '1',
      });
      const migrated = await admin.query(
        `SELECT s.id::text, s.is_active, s.created_at, p.id::text AS publication_id,
                e.md_text, sm.overview, a.attention_type
         FROM "${targetSchema}".mindstream_source s
         JOIN "${targetSchema}".mindstream_publication p ON p.source_id = s.id
         JOIN "${targetSchema}".mindstream_extraction e ON e.publication_id = p.id
         JOIN "${targetSchema}".mindstream_summary sm ON sm.publication_id = p.id
         JOIN "${targetSchema}".mindstream_attention a ON a.publication_id = p.id`,
      );
      assert.equal(migrated.rows[0].id, '7');
      assert.equal(migrated.rows[0].publication_id, '11');
      assert.equal(migrated.rows[0].is_active, 1);
      assert.equal(migrated.rows[0].created_at, timestamp);
      assert.equal(migrated.rows[0].md_text, 'legacy markdown');
      assert.equal(migrated.rows[0].overview, 'overview');
      assert.equal(migrated.rows[0].attention_type, 'overview_view');
      const embeddingRepository = await backend.get({ path: '/mindstream/embedding' });
      const embedding = (await embeddingRepository.read({ key: { kind: 'primary', values: { publication_id: '11' } } })).record;
      assert.equal(embedding.overview_embedding.length, 1536);
      assert.equal(embedding.overview_embedding[0], Math.fround(0.1));

      const sourceRowsBefore = await admin.query(`SELECT count(*) FROM "${sourceSchema}".publications`);
      assert.equal(Number(sourceRowsBefore.rows[0].count), 1);
      const sourceRepository = await backend.get({ path: '/mindstream/source' });
      const next = (await sourceRepository.create({ record: {
        code: 'after-migration', url: 'https://example.test/after', name: 'After', description: null,
        is_active: true, created_at: timestamp, updated_at: timestamp,
      } })).record;
      assert.ok(BigInt(next.id) > 7n);
      await assert.rejects(migration.execute({ sourceSchema }), /Target table 'mindstream_source' is not empty/);
      const sourceRowsAfter = await admin.query(`SELECT count(*) FROM "${sourceSchema}".publications`);
      assert.equal(Number(sourceRowsAfter.rows[0].count), 1);
    } finally {
      await storage.close();
      await admin.query(`DROP SCHEMA "${sourceSchema}" CASCADE`);
    }
  });
});
