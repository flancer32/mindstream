import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

const setup = async function ({ invalidAttention = false } = {}) {
  const container = await createTestContainer();
  const calls = [];
  let constraint = false;
  let audit = { schema_version: 1, schema_json: '{}' };
  const tables = ['attention_states', 'publication_embeddings', 'schema_version'];

  const executor = function (table) {
    if (table === 'pg_tables') {
      return { select: () => ({ where: () => ({ orderBy: async () => tables.map((tablename) => ({ tablename })) }) }) };
    }
    if (table === 'pg_constraint') {
      return { select: () => ({ whereRaw: () => ({ where: () => ({ first: async () => ({ convalidated: constraint }) }) }) }) };
    }
    return {
      count: () => ({ first: async () => ({ count: table === 'schema_version' ? 1 : 3 }) }),
      del: async () => { calls.push('audit-delete'); },
      insert: async (row) => { audit = row; calls.push('audit-insert'); },
      orderBy: () => ({ first: async () => audit }),
    };
  };
  executor.raw = async function (sql) {
    calls.push(sql.trim().split(/\s+/).slice(0, 4).join(' '));
    if (sql.includes('where attention_type not')) return { rows: [{ count: invalidAttention ? 1 : 0 }] };
    if (sql.includes('vector_dims')) return { rows: [{ count: 0 }] };
    if (sql.includes('not convalidated')) return { rows: [{ count: 0 }] };
    if (sql.includes('with expected')) return { rows: [{ count: 0 }] };
    if (sql.includes('pg_get_constraintdef')) return { rows: constraint ? [{ convalidated: true }] : [] };
    if (sql.includes('add constraint')) constraint = true;
    if (sql.includes('validate constraint')) constraint = true;
    return { rows: [] };
  };
  executor.transaction = async function (handler) { await handler(executor); };

  const adapter = { describe: async () => ({ id: 'postgresql' }), preflight: async () => ({ diagnostics: [] }) };
  const connection = { getDialectAdapter: () => adapter };
  container.register('Mindstream_Back_Storage_Database$', { get: () => executor, getConnection: () => connection });
  container.register('Mindstream_Back_Storage_Schema$', {
    getDeclaration: () => ({ version: 2 }), getFragmentEnvelope: () => ({ id: 'fragment' }), getMapEnvelope: () => ({ id: 'map' }),
  });
  const compilation = { fingerprint: 'fingerprint-v2', physical: { tables: tables.map((name) => ({ name })) }, requirements: [] };
  container.register('TeqFw_Db_Back_Dem_Compile$', { exec: async () => compilation, assertResult: () => compilation });
  container.register('Mindstream_Back_Logger$', { info() {}, exception(error) { calls.push(error.message); } });
  return { calls, migration: await container.get('Mindstream_Back_Storage_LegacyMigration$') };
};

test('LegacyMigration validates and atomically records the DEM v2 fingerprint', async () => {
  const { calls, migration } = await setup();
  const evidence = await migration.execute();
  assert.equal(evidence.status, 'complete');
  assert.equal(evidence.accepted, false);
  assert.deepEqual(evidence.before, evidence.after);
  assert.ok(calls.includes('audit-insert'));
});

test('LegacyMigration rejects invalid data before writing the audit', async () => {
  const { calls, migration } = await setup({ invalidAttention: true });
  await assert.rejects(migration.execute(), /attention_type/);
  assert.ok(!calls.includes('audit-insert'));
});
