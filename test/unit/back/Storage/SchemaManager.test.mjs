import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

const setup = async function ({ rebuildError } = {}) {
  const container = await createTestContainer();
  const calls = [];
  const compilation = { fingerprint: 'dem-fingerprint', physical: { tables: [{ entity: '/items', name: 'items' }] } };
  const rows = [{ id: 1, name: 'alpha' }];
  const query = () => ({ del: async () => calls.push('audit-delete'), insert: async () => calls.push('audit-insert'), orderBy: () => ({ first: async () => null }), select: async () => rows });
  query.schema = { hasTable: async () => true };
  const connection = { getDialectAdapter: () => ({ id: 'postgresql' }) };
  container.register('Mindstream_Back_Storage_Database$', { get: () => query, getConnection: () => connection });
  container.register('Mindstream_Back_Storage_Schema$', {
    getDeclaration: () => ({ version: 2 }), getFragmentEnvelope: () => ({ id: 'fragment' }), getMapEnvelope: () => ({ id: 'map' }),
  });
  container.register('TeqFw_Db_Back_Dem_Compile$', {
    async exec(args) { calls.push({ type: 'compile', args }); return compilation; },
    assertResult({ value }) { assert.equal(value, compilation); },
  });
  container.register('TeqFw_Db_Back_RDb_Schema_A_Plan$', { exec: (args) => ({ args }) });
  container.register('TeqFw_Db_Back_RDb_Schema_A_Builder$', { async exec(args) { calls.push({ type: 'build', args }); return { status: 'complete' }; } });
  container.register('TeqFw_Db_Back_RDb_Rebuild$', {
    async exec(args) {
      calls.push({ type: 'rebuild', args });
      if (rebuildError) throw rebuildError;
      assert.deepEqual(await args.snapshot.readTable({ entity: '/items' }), rows);
      return { accepted: false, status: 'complete' };
    },
  });
  container.register('Mindstream_Back_Logger$', { info() {} });
  return { calls, manager: await container.get('Mindstream_Back_Storage_SchemaManager$') };
};

test('SchemaManager creates schema from an asserted DEM plan', async () => {
  const { calls, manager } = await setup();
  const evidence = await manager.createSchema();
  assert.equal(evidence.status, 'complete');
  assert.ok(calls.some((item) => item.type === 'compile'));
  assert.ok(calls.some((item) => item.type === 'build' && item.args.plan.args.operation === 'create'));
  assert.ok(calls.includes('audit-insert'));
});

test('SchemaManager renews only through an in-place rebuild with readable snapshot evidence', async () => {
  const { calls, manager } = await setup();
  const evidence = await manager.renewSchema();
  assert.equal(evidence.accepted, false);
  const call = calls.find((item) => item.type === 'rebuild');
  assert.equal(call.args.mode, 'inPlace');
  assert.equal(call.args.source, call.args.target);
  assert.equal(call.args.sourceId, call.args.targetId);
  assert.equal(call.args.authorizeDiscard, undefined);
});

test('SchemaManager propagates rebuild failure without writing acceptance audit', async () => {
  const failure = new Error('rebuild failed');
  const { calls, manager } = await setup({ rebuildError: failure });
  await assert.rejects(manager.renewSchema(), failure);
  assert.ok(!calls.includes('audit-insert'));
});
