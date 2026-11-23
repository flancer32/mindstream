import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

const setup = async function ({ currentSchema = 'target' } = {}) {
  const container = await createTestContainer();
  const errors = [];
  let connectionReads = 0;
  const database = {
    get() {
      connectionReads++;
      return { raw: async () => ({ rows: [{ name: currentSchema }] }) };
    },
  };
  container.register('Mindstream_Back_Storage_Database$', database);
  container.register('Mindstream_Back_Logger$', { info() {}, exception: (...args) => errors.push(args) });
  return { migration: await container.get('Mindstream_Back_Storage_LegacyMigration$'), errors, getConnectionReads: () => connectionReads };
};

test('LegacyMigration rejects invalid source schema identifiers before opening the database', async () => {
  const { migration, errors, getConnectionReads } = await setup();
  await assert.rejects(migration.execute({ sourceSchema: 'public; DROP SCHEMA target' }), /lowercase PostgreSQL identifiers/);
  assert.equal(getConnectionReads(), 0);
  assert.equal(errors.length, 1);
});

test('LegacyMigration requires a target schema separate from the source schema', async () => {
  const { migration, errors } = await setup({ currentSchema: 'public' });
  await assert.rejects(migration.execute({ sourceSchema: 'public' }), /schemas must be separate/);
  assert.equal(errors.length, 1);
});
