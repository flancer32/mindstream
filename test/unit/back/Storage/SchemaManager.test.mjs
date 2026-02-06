import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

const buildSchema = function () {
  return {
    schemaVersion: 1,
    tables: {
      schema_version: {
        columns: {
          id: { type: 'integer', autoIncrement: true },
          schema_version: { type: 'integer', notNull: true },
          schema_json: { type: 'text', notNull: true },
          applied_at: { type: 'timestamp', notNull: true },
        },
        indexes: [],
        foreignKeys: [],
      },
      items: {
        columns: {
          id: { type: 'integer', autoIncrement: true },
          name: { type: 'string' },
        },
        indexes: [],
        foreignKeys: [],
      },
    },
  };
};

const createColumnStub = function () {
  return {
    notNullable() {
      return this;
    },
    defaultTo() {
      return this;
    },
  };
};

const createTableStub = function () {
  return {
    bigIncrements() {
      return createColumnStub();
    },
    bigInteger() {
      return createColumnStub();
    },
    increments() {
      return createColumnStub();
    },
    integer() {
      return createColumnStub();
    },
    string() {
      return createColumnStub();
    },
    text() {
      return createColumnStub();
    },
    boolean() {
      return createColumnStub();
    },
    timestamp() {
      return createColumnStub();
    },
    json() {
      return createColumnStub();
    },
    primary() {},
    unique() {},
    index() {},
    foreign() {
      return {
        references() {
          return {
            inTable() {
              return {
                onDelete() {},
                onUpdate() {},
              };
            },
          };
        },
      };
    },
  };
};

const createKnexStub = function ({ client, dumpTables, schema }) {
  const rawCalls = [];
  const tableStub = createTableStub();
  const schemaState = {
    schema_version: schema.schemaVersion,
    schema_json: JSON.stringify(schema),
  };

  const knex = function () {
    return {
      del: async () => {},
      insert: async () => {},
      orderBy: () => ({
        first: async () => schemaState,
      }),
    };
  };

  knex.schema = {
    hasTable: async () => true,
    dropTable: async () => {},
    createTable: async (name, handler) => {
      if (handler) handler(tableStub);
    },
    alterTable: async (name, handler) => {
      if (handler) handler(tableStub);
    },
    renameTable: async () => {},
  };

  knex.select = () => ({
    from: async (tableName) => dumpTables[tableName] ?? [],
  });

  knex.raw = async (sql, bindings) => {
    rawCalls.push({ sql, bindings });
  };

  knex.transaction = async (handler) => {
    await handler(knex);
  };

  knex.client = { config: { client } };

  return { knex, rawCalls };
};

const createFsStub = function () {
  const files = new Map();
  return {
    files,
    fs: {
      mkdir: async () => {},
      writeFile: async (filePath, content) => {
        files.set(filePath, content);
      },
      readFile: async (filePath) => {
        return files.get(filePath);
      },
    },
  };
};

const createLoggerStub = function () {
  return {
    debug() {},
    info() {},
    warn() {},
    error() {},
    exception() {},
  };
};

test('Mindstream_Back_Storage_SchemaManager resolves with knex stub', async () => {
  const container = await createTestContainer();
  const knexStub = { schema: {} };

  container.register('Mindstream_Back_Storage_Knex$', {
    get() {
      return knexStub;
    },
  });

  const manager = await container.get('Mindstream_Back_Storage_SchemaManager$');
  assert.ok(manager);
  assert.equal(typeof manager.applySchema, 'function');
  assert.equal(typeof manager.recreateWithPreserve, 'function');
  assert.equal(typeof manager.createSchema, 'function');
});

test('Mindstream_Back_Storage_SchemaManager syncs pg sequences after renew', async () => {
  const container = await createTestContainer();
  const schema = buildSchema();
  const { fs, files } = createFsStub();
  const { knex, rawCalls } = createKnexStub({
    client: 'pg',
    dumpTables: {
      items: [{ id: 7, name: 'alpha' }],
    },
    schema,
  });

  container.register('Mindstream_Back_Storage_Schema$', {
    getDeclaration() {
      return schema;
    },
  });
  container.register('Mindstream_Back_Storage_Knex$', {
    get() {
      return knex;
    },
  });
  container.register('Mindstream_Shared_Logger$', createLoggerStub());
  container.register('node:fs/promises', fs);
  container.register('node:path', await import('node:path'));
  container.register('node:process', {
    cwd() {
      return '/tmp';
    },
  });

  const manager = await container.get('Mindstream_Back_Storage_SchemaManager$');
  await manager.renewSchema();

  assert.ok(files.size > 0);
  const setvalCall = rawCalls.find(
    (call) => call.sql.includes('setval') && call.sql.includes('pg_get_serial_sequence')
  );
  assert.ok(setvalCall);
  assert.deepEqual(setvalCall.bindings, ['items', 'id', 'id', 'items']);
});

test('Mindstream_Back_Storage_SchemaManager sets pg sequences to 0 for empty tables', async () => {
  const container = await createTestContainer();
  const schema = buildSchema();
  const { fs } = createFsStub();
  const { knex, rawCalls } = createKnexStub({
    client: 'pg',
    dumpTables: {
      items: [],
    },
    schema,
  });

  container.register('Mindstream_Back_Storage_Schema$', {
    getDeclaration() {
      return schema;
    },
  });
  container.register('Mindstream_Back_Storage_Knex$', {
    get() {
      return knex;
    },
  });
  container.register('Mindstream_Shared_Logger$', createLoggerStub());
  container.register('node:fs/promises', fs);
  container.register('node:path', await import('node:path'));
  container.register('node:process', {
    cwd() {
      return '/tmp';
    },
  });

  const manager = await container.get('Mindstream_Back_Storage_SchemaManager$');
  await manager.renewSchema();

  const setvalCall = rawCalls.find(
    (call) => call.sql.includes('setval') && call.sql.includes('pg_get_serial_sequence')
  );
  assert.ok(setvalCall);
  assert.ok(setvalCall.sql.includes('COALESCE(MAX'));
  assert.ok(setvalCall.sql.includes('0'));
});

test('Mindstream_Back_Storage_SchemaManager skips sequence sync for non-pg client', async () => {
  const container = await createTestContainer();
  const schema = buildSchema();
  const { fs } = createFsStub();
  const { knex, rawCalls } = createKnexStub({
    client: 'mssql',
    dumpTables: {
      items: [{ id: 3, name: 'beta' }],
    },
    schema,
  });

  container.register('Mindstream_Back_Storage_Schema$', {
    getDeclaration() {
      return schema;
    },
  });
  container.register('Mindstream_Back_Storage_Knex$', {
    get() {
      return knex;
    },
  });
  container.register('Mindstream_Shared_Logger$', createLoggerStub());
  container.register('node:fs/promises', fs);
  container.register('node:path', await import('node:path'));
  container.register('node:process', {
    cwd() {
      return '/tmp';
    },
  });

  const manager = await container.get('Mindstream_Back_Storage_SchemaManager$');
  await manager.renewSchema();

  assert.equal(rawCalls.length, 0);
});
