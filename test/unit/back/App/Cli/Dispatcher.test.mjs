import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

const createLoggerStub = () => {
  const calls = [];
  return {
    calls,
    exception(namespace, error, ...args) {
      calls.push({ namespace, error, args });
    },
    debug() {},
    info() {},
    warn() {},
    error() {},
  };
};

test('Mindstream_Back_App_Cli_Dispatcher routes db:schema:create', async () => {
  const container = await createTestContainer();
  const logger = createLoggerStub();
  const calls = [];

  container.register('Mindstream_Shared_Logger$', logger);
  container.register('Mindstream_Back_Cli_Db$', {
    async dispatch(payload) {
      calls.push(payload);
    },
  });
  container.register('Mindstream_Back_Cli_Runtime$', {
    async dispatch() {},
  });

  const dispatcher = await container.get('Mindstream_Back_App_Cli_Dispatcher$');
  const exitCode = await dispatcher.dispatch({ cliArgs: ['db:schema:create'] });

  assert.equal(exitCode, 0);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].commandParts, ['schema', 'create']);
  assert.deepEqual(calls[0].args, []);
  assert.equal(logger.calls.length, 0);
});

test('Mindstream_Back_App_Cli_Dispatcher logs and returns error code on unknown command', async () => {
  const container = await createTestContainer();
  const logger = createLoggerStub();

  container.register('Mindstream_Shared_Logger$', logger);
  container.register('Mindstream_Back_Cli_Db$', {
    async dispatch() {},
  });
  container.register('Mindstream_Back_Cli_Runtime$', {
    async dispatch() {},
  });

  const dispatcher = await container.get('Mindstream_Back_App_Cli_Dispatcher$');
  const exitCode = await dispatcher.dispatch({ cliArgs: ['unknown:command'] });

  assert.equal(exitCode, 1);
  assert.equal(logger.calls.length, 1);
  assert.ok(logger.calls[0].error instanceof Error);
});
